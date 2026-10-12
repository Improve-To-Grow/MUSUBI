/**
 * Code index builder - compiler-accurate SCIP indexes of a JavaScript/TypeScript and/or Python
 * project
 *
 * One indexer per language, both npm packages pinned to exact versions:
 * - @sourcegraph/scip-typescript resolves CommonJS `require()`, ES imports, `new X()`,
 *   `extends` and method calls across files with the TypeScript compiler.
 * - @sourcegraph/scip-python resolves imports, calls, `self.method()`, `super()` and base
 *   classes with pyright.
 * Each language is indexed into its own file (`.scip/index.<language>.scip`) under its own
 * fingerprint, so an edit rebuilds only the language it touches; ./query.js loads every file
 * that exists as one model. The names that model defines go to `.scip/names.json`, read by
 * ./hint.js.
 * Nothing is written outside `.scip/`: projects without a tsconfig.json get a generated
 * `.scip/tsconfig.json` instead of scip-typescript's `--infer-tsconfig`, which would create
 * `./tsconfig.json`, and scip-python always receives `.scip/python-environment.json`, so it
 * never runs pip.
 *
 * Optional configuration in the project's package.json:
 *   "scip": {
 *     "roots": ["src", "tests"],      directories to index (default: the existing ones of
 *                                     bin, src, lib, app, scripts, tests, test, plus every
 *                                     top-level directory holding Python files; the project
 *                                     root itself when a top-level .py file exists)
 *     "exclude": ["src/templates"],   paths under the roots to skip
 *     "tsconfig": "auto",             "auto" uses ./tsconfig.json when present, "generated"
 *                                     always uses .scip/tsconfig.json
 *     "indexerArgs": [],              extra scip-typescript arguments, e.g. ["--yarn-workspaces"]
 *     "pythonArgs": []                extra scip-python arguments
 *   }
 *
 * CLI: bin/musubi-code.js (`musubi-code index`).
 *
 * @module code-index/indexer
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const DEFAULT_ROOTS = ['bin', 'src', 'lib', 'app', 'scripts', 'tests', 'test'];
// Build output, dependencies and language environments: never indexed, never fingerprinted.
const ALWAYS_EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.scip',
  'coverage',
  'dist',
  'build',
  'out',
  '.venv',
  'venv',
  '__pycache__',
  '.tox',
  '.mypy_cache',
  '.pytest_cache',
  '.ruff_cache',
  '.eggs',
]);

/**
 * Languages that code navigation supports. `markers` identify a project of the language and
 * `extensions` its source files; either makes a project eligible for setup.
 */
const LANGUAGES = {
  typescript: {
    label: 'JavaScript/TypeScript',
    tool: 'scip-typescript',
    extensions: ['.js', '.cjs', '.mjs', '.jsx', '.ts', '.cts', '.mts', '.tsx'],
    markers: ['package.json', 'tsconfig.json', 'jsconfig.json'],
    indexerPackage: '@sourcegraph/scip-typescript',
    indexerModule: '@sourcegraph/scip-typescript/dist/src/main.js',
    indexFile: 'index.typescript.scip',
  },
  python: {
    label: 'Python',
    tool: 'scip-python',
    extensions: ['.py', '.pyi'],
    markers: ['pyproject.toml', 'setup.py', 'setup.cfg', 'requirements.txt', 'Pipfile'],
    indexerPackage: '@sourcegraph/scip-python',
    indexerModule: '@sourcegraph/scip-python/index.js',
    indexFile: 'index.python.scip',
  },
};
const LANGUAGE_KEYS = Object.keys(LANGUAGES);
const EXTENSION_LANGUAGE = new Map(
  LANGUAGE_KEYS.flatMap(key => LANGUAGES[key].extensions.map(ext => [ext, key]))
);
// Source files the indexes are built from.
const SOURCE_EXTENSIONS = new Set(EXTENSION_LANGUAGE.keys());
const PROJECT_MARKERS = LANGUAGE_KEYS.flatMap(key => LANGUAGES[key].markers);
const PYTHON_SHIM = path.join(__dirname, 'scip-python-shim.js');
// pyright configuration written next to pyproject.toml for the duration of a Python build of a
// src-layout project (sourcegraph/scip-python issue #221: without `extraPaths`, imports of the
// package from tests/ do not resolve and the references are dropped from the index).
const SRC_LAYOUT_PYRIGHT_CONFIG = `${JSON.stringify({ extraPaths: ['src'] }, null, 2)}\n`;
// The single-file layout of versions before per-language indexes.
const LEGACY_INDEX_FILE = 'index.scip';
const LOCK_TTL_MS = 15 * 60 * 1000;
const WAIT_FOR_BUILD_MS = 5 * 60 * 1000;
const MAX_LOG_BYTES = 256 * 1024;
const MAX_FOLLOW_UP_BUILDS = 3;
// Format of .scip/meta.json.
const META_VERSION = 2;
// Format of .scip/names.json, read by ./hint.js.
const NAMES_VERSION = 1;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function isExcludedDirName(name) {
  return ALWAYS_EXCLUDED_DIRS.has(name) || name.endsWith('.egg-info');
}

/**
 * The language a source file belongs to, by extension.
 * @param {string} filePath
 * @returns {string|null} `typescript`, `python` or null
 */
function languageOf(filePath) {
  return EXTENSION_LANGUAGE.get(path.extname(filePath).toLowerCase()) || null;
}

/**
 * Find the project root for a directory: the nearest ancestor that already has an index
 * (`.scip/meta.json`), otherwise the nearest one with a project marker of a supported language
 * (package.json, tsconfig.json, jsconfig.json, pyproject.toml, setup.py, setup.cfg,
 * requirements.txt, Pipfile), otherwise the directory itself.
 * @param {string} [startDir]
 * @returns {string}
 */
function findProjectRoot(startDir = process.cwd()) {
  const start = path.resolve(startDir);
  let firstMarked = null;
  let dir = start;
  for (;;) {
    if (fs.existsSync(path.join(dir, '.scip', 'meta.json'))) return dir;
    if (!firstMarked && PROJECT_MARKERS.some(m => fs.existsSync(path.join(dir, m)))) {
      firstMarked = dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return firstMarked || start;
    dir = parent;
  }
}

/**
 * Does a file with one of the extensions exist under the configured roots?
 * @param {object} cfg
 * @param {Set<string>} extensions
 * @returns {boolean}
 */
function hasSourceFiles(cfg, extensions) {
  const stack = cfg.roots.map(r => (r === '.' ? '' : r));
  while (stack.length) {
    const relDir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(path.join(cfg.root, relDir || '.'), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (isExcluded(cfg, rel)) continue;
      if (entry.isDirectory()) {
        if (!isExcludedDirName(entry.name)) stack.push(rel);
      } else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) {
        return true;
      }
    }
  }
  return false;
}

/**
 * The supported languages a project uses: those with a project marker in `root` or with source
 * files under the configured roots, in the order of LANGUAGES.
 * @param {string} root
 * @returns {string[]} language keys (`typescript`, `python`)
 */
function detectLanguages(root) {
  const cfg = loadConfig(path.resolve(root));
  return LANGUAGE_KEYS.filter(key => {
    const { markers, extensions } = LANGUAGES[key];
    if (markers.some(m => fs.existsSync(path.join(cfg.root, m)))) return true;
    return hasSourceFiles(cfg, new Set(extensions));
  });
}

function holdsSourceFiles(dir, extensions) {
  try {
    return fs.readdirSync(dir).some(name => extensions.has(path.extname(name).toLowerCase()));
  } catch {
    return false;
  }
}

/**
 * Default roots: the standard directories that exist, plus every other top-level directory that
 * holds Python files directly (a package or a scripts directory). A Python file at the top level
 * (manage.py, conftest.py, a script) makes the project root itself the root.
 * @param {string} root
 * @returns {string[]}
 */
function defaultRoots(root) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return ['.'];
  }
  const python = new Set(LANGUAGES.python.extensions);
  if (entries.some(e => e.isFile() && python.has(path.extname(e.name).toLowerCase()))) {
    return ['.'];
  }
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  const standard = DEFAULT_ROOTS.filter(name => dirs.includes(name));
  const pythonDirs = dirs
    .filter(
      name =>
        !standard.includes(name) &&
        !name.startsWith('.') &&
        !isExcludedDirName(name) &&
        holdsSourceFiles(path.join(root, name), python)
    )
    .sort();
  const roots = [...standard, ...pythonDirs];
  return roots.length ? roots : ['.'];
}

/**
 * Load the indexing configuration for a project.
 * @param {string} [root]
 * @returns {object}
 */
function loadConfig(root = findProjectRoot()) {
  let settings = {};
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    settings = pkg.scip || {};
  } catch {
    // No or unreadable package.json: use defaults.
  }

  const isDir = rel => {
    try {
      return fs.statSync(path.join(root, rel)).isDirectory();
    } catch {
      return false;
    }
  };
  let roots = Array.isArray(settings.roots) ? settings.roots.filter(isDir) : null;
  if (!roots || roots.length === 0) roots = defaultRoots(root);
  roots = roots.map(r => toPosix(path.normalize(r)).replace(/\/$/, ''));

  const exclude = (Array.isArray(settings.exclude) ? settings.exclude : []).map(e =>
    toPosix(path.normalize(e)).replace(/\/$/, '')
  );
  const hasProjectTsconfig = fs.existsSync(path.join(root, 'tsconfig.json'));
  const useProjectTsconfig = settings.tsconfig !== 'generated' && hasProjectTsconfig;
  const dir = path.join(root, '.scip');
  const stringList = value => (Array.isArray(value) ? value.map(String) : []);

  return {
    root,
    roots,
    exclude,
    useProjectTsconfig,
    indexerArgs: stringList(settings.indexerArgs),
    pythonArgs: stringList(settings.pythonArgs),
    dir,
    indexPaths: Object.fromEntries(
      LANGUAGE_KEYS.map(key => [key, path.join(dir, LANGUAGES[key].indexFile)])
    ),
    metaPath: path.join(dir, 'meta.json'),
    namesPath: path.join(dir, 'names.json'),
    lockPath: path.join(dir, 'build.lock'),
    dirtyPath: path.join(dir, 'dirty'),
    logPath: path.join(dir, 'index.log'),
    tsconfigPath: path.join(dir, 'tsconfig.json'),
    pythonEnvironmentPath: path.join(dir, 'python-environment.json'),
  };
}

function isExcluded(cfg, rel) {
  return cfg.exclude.some(e => rel === e || rel.startsWith(e + '/'));
}

/**
 * Is a file one the index covers (a source file under a root and not excluded)?
 * @param {object} cfg
 * @param {string} filePath - absolute, or relative to the project root
 * @returns {boolean}
 */
function isIndexedPath(cfg, filePath) {
  const rel = toPosix(path.relative(cfg.root, path.resolve(cfg.root, filePath)));
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  if (!SOURCE_EXTENSIONS.has(path.extname(rel).toLowerCase())) return false;
  if (rel.split('/').slice(0, -1).some(isExcludedDirName)) return false;
  if (isExcluded(cfg, rel)) return false;
  return cfg.roots.some(r => r === '.' || rel === r || rel.startsWith(r + '/'));
}

/**
 * Does the index cover source files in a directory or below it?
 * @param {object} cfg
 * @param {string} dirPath - absolute, or relative to the project root
 * @returns {boolean}
 */
function coversDirectory(cfg, dirPath) {
  const rel = toPosix(path.relative(cfg.root, path.resolve(cfg.root, dirPath)));
  if (rel.startsWith('..') || path.isAbsolute(rel)) return false;
  if (!rel) return true;
  if (rel.split('/').some(isExcludedDirName) || isExcluded(cfg, rel)) return false;
  return cfg.roots.some(
    r => r === '.' || rel === r || rel.startsWith(`${r}/`) || r.startsWith(`${rel}/`)
  );
}

/**
 * List the source files the index covers, with language, size and modification time.
 * @param {object} cfg
 * @returns {Array<{rel: string, language: string, size: number, mtimeMs: number}>}
 */
function listSourceFiles(cfg) {
  const files = [];
  const walk = relDir => {
    let entries;
    try {
      entries = fs.readdirSync(path.join(cfg.root, relDir), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const rel = relDir === '.' ? entry.name : `${relDir}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!isExcludedDirName(entry.name) && !isExcluded(cfg, rel)) walk(rel);
      } else if (entry.isFile()) {
        const language = languageOf(entry.name);
        if (!language || isExcluded(cfg, rel)) continue;
        const stat = fs.statSync(path.join(cfg.root, rel));
        files.push({ rel, language, size: stat.size, mtimeMs: Math.floor(stat.mtimeMs) });
      }
    }
  };
  for (const r of cfg.roots) walk(r);
  return files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
}

function indexerVersion(cfg, language) {
  try {
    const pkgPath = require.resolve(`${LANGUAGES[language].indexerPackage}/package.json`, {
      paths: [__dirname, cfg.root],
    });
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
  } catch {
    return null;
  }
}

/**
 * Fingerprints of everything that should trigger a rebuild, per language with source files:
 * the indexed files, the configuration and the indexer version.
 * @param {object} cfg
 * @returns {{languages: Object<string, {hash: string, files: number}>, files: number}}
 */
function computeFingerprint(cfg) {
  const files = listSourceFiles(cfg);
  const languages = {};
  for (const key of LANGUAGE_KEYS) {
    const own = files.filter(f => f.language === key);
    if (own.length === 0) continue;
    const settings =
      key === 'typescript'
        ? { useProjectTsconfig: cfg.useProjectTsconfig, indexerArgs: cfg.indexerArgs }
        : { pythonArgs: cfg.pythonArgs };
    const hash = crypto.createHash('sha1');
    hash.update(
      JSON.stringify({
        language: key,
        roots: cfg.roots,
        exclude: cfg.exclude,
        ...settings,
        indexer: indexerVersion(cfg, key),
      })
    );
    for (const f of own) hash.update(`\n${f.rel}|${f.size}|${f.mtimeMs}`);
    languages[key] = { hash: hash.digest('hex'), files: own.length };
  }
  return { languages, files: files.length };
}

function readMeta(cfg) {
  try {
    return JSON.parse(fs.readFileSync(cfg.metaPath, 'utf8'));
  } catch {
    return null;
  }
}

/** The per-language entries of a meta.json in the current format, else none. */
function metaLanguages(meta) {
  const valid =
    meta && meta.version === META_VERSION && meta.languages && typeof meta.languages === 'object';
  return valid ? { ...meta.languages } : {};
}

/** Index files that no longer belong to a language with sources, or the single-file layout. */
function hasLeftoverIndexes(cfg, current) {
  if (fs.existsSync(path.join(cfg.dir, LEGACY_INDEX_FILE))) return true;
  return LANGUAGE_KEYS.some(key => !current.languages[key] && fs.existsSync(cfg.indexPaths[key]));
}

/**
 * @param {object} cfg
 * @returns {{state: 'missing'|'stale'|'fresh', languages: Object<string, string>,
 *   meta: object|null, current: object}} `languages` holds the state of every language with
 *   source files; `state` is the worst of them
 */
function getFreshness(cfg) {
  const current = computeFingerprint(cfg);
  const entries = metaLanguages(readMeta(cfg));
  const languages = {};
  for (const [key, fingerprint] of Object.entries(current.languages)) {
    const entry = entries[key];
    if (!entry || !fs.existsSync(cfg.indexPaths[key])) languages[key] = 'missing';
    else languages[key] = entry.fingerprint === fingerprint.hash ? 'fresh' : 'stale';
  }
  const states = Object.values(languages);
  let state = 'fresh';
  if (states.length === 0 || states.includes('missing')) state = 'missing';
  else if (states.includes('stale')) state = 'stale';
  // Indexes built before names.json existed get it on their next build; leftovers go too.
  if (state === 'fresh' && (!fs.existsSync(cfg.namesPath) || hasLeftoverIndexes(cfg, current))) {
    state = 'stale';
  }
  return { state, languages, meta: readMeta(cfg), current };
}

function staleLanguages(freshness) {
  return Object.entries(freshness.languages)
    .filter(([, state]) => state !== 'fresh')
    .map(([key]) => key);
}

function log(cfg, message, { echo = false } = {}) {
  if (echo) console.error(message);
  try {
    fs.mkdirSync(cfg.dir, { recursive: true });
    try {
      if (fs.statSync(cfg.logPath).size > MAX_LOG_BYTES) fs.writeFileSync(cfg.logPath, '');
    } catch {
      // Log does not exist yet.
    }
    fs.appendFileSync(cfg.logPath, `${new Date().toISOString()} [${process.pid}] ${message}\n`);
  } catch {
    // Logging must never break indexing.
  }
}

function ensureIndexDir(cfg) {
  fs.mkdirSync(cfg.dir, { recursive: true });
  const ignorePath = path.join(cfg.dir, '.gitignore');
  if (!fs.existsSync(ignorePath)) fs.writeFileSync(ignorePath, '*\n');
}

/**
 * Write .scip/tsconfig.json for projects without their own tsconfig.json.
 * Paths are relative to .scip/, so they all start with "../".
 * @param {object} cfg
 */
function writeGeneratedTsconfig(cfg) {
  const up = rel => (rel === '.' ? '..' : `../${rel}`);
  const tsconfig = {
    compilerOptions: {
      allowJs: true,
      checkJs: false,
      noEmit: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      esModuleInterop: true,
      jsx: 'preserve',
      module: 'commonjs',
      moduleResolution: 'node',
      target: 'es2022',
    },
    include: cfg.roots.map(r => `${up(r)}/**/*`),
    exclude: [
      '../.scip',
      ...[...ALWAYS_EXCLUDED_DIRS].filter(d => d !== '.scip').map(d => `../**/${d}`),
      '../**/*.egg-info',
      ...cfg.exclude.map(up),
    ],
  };
  const content = `${JSON.stringify(tsconfig, null, 2)}\n`;
  let existing = null;
  try {
    existing = fs.readFileSync(cfg.tsconfigPath, 'utf8');
  } catch {
    // Not generated yet.
  }
  if (existing !== content) fs.writeFileSync(cfg.tsconfigPath, content);
}

function resolveIndexer(cfg, language) {
  try {
    return require.resolve(LANGUAGES[language].indexerModule, { paths: [__dirname, cfg.root] });
  } catch {
    return null;
  }
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function readLock(cfg) {
  try {
    return JSON.parse(fs.readFileSync(cfg.lockPath, 'utf8'));
  } catch {
    return null;
  }
}

function isLockLive(lock) {
  return Boolean(lock) && isProcessAlive(lock.pid) && Date.now() - lock.startedAt < LOCK_TTL_MS;
}

function tryAcquireLock(cfg) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = fs.openSync(cfg.lockPath, 'wx');
      fs.writeSync(fd, JSON.stringify({ pid: process.pid, startedAt: Date.now() }));
      fs.closeSync(fd);
      return true;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (isLockLive(readLock(cfg))) return false;
      fs.rmSync(cfg.lockPath, { force: true });
    }
  }
  return false;
}

function releaseLock(cfg) {
  const lock = readLock(cfg);
  if (lock && lock.pid === process.pid) fs.rmSync(cfg.lockPath, { force: true });
}

function replaceFile(from, to) {
  for (let attempt = 0; ; attempt++) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (error) {
      if (attempt >= 10 || !['EPERM', 'EBUSY', 'EACCES'].includes(error.code)) throw error;
      sleep(200);
    }
  }
}

/**
 * Name and version recorded in the Python index: package.json, else pyproject.toml, else the
 * directory name.
 * @param {string} root
 */
function projectIdentity(root) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (pkg.name) return { name: String(pkg.name), version: String(pkg.version || '0') };
  } catch {
    // No package.json.
  }
  try {
    const toml = fs.readFileSync(path.join(root, 'pyproject.toml'), 'utf8');
    const name = /^\s*name\s*=\s*["']([^"']+)["']/m.exec(toml);
    const version = /^\s*version\s*=\s*["']([^"']+)["']/m.exec(toml);
    if (name) return { name: name[1], version: version ? version[1] : '0' };
  } catch {
    // No pyproject.toml.
  }
  return { name: path.basename(root) || 'project', version: '0' };
}

function typescriptArgs(cfg, indexer, tmpPath) {
  if (!cfg.useProjectTsconfig) writeGeneratedTsconfig(cfg);
  const args = [indexer, 'index'];
  if (!cfg.useProjectTsconfig) args.push(toPosix(path.relative(cfg.root, cfg.dir)));
  args.push('--output', tmpPath, '--no-progress-bar', ...cfg.indexerArgs);
  return args;
}

function pythonArgs(cfg, indexer, tmpPath) {
  // Without an environment file scip-python runs pip and fails where Python is absent. An empty
  // environment resolves the project's own code and the standard library.
  if (!fs.existsSync(cfg.pythonEnvironmentPath)) {
    fs.writeFileSync(cfg.pythonEnvironmentPath, '[]\n');
  }
  const { name, version } = projectIdentity(cfg.root);
  const args = process.platform === 'win32' ? ['-r', PYTHON_SHIM] : [];
  args.push(
    indexer,
    'index',
    '--cwd',
    cfg.root,
    '--project-name',
    name,
    '--project-version',
    version,
    '--environment',
    cfg.pythonEnvironmentPath,
    '--quiet',
    '--output',
    tmpPath,
    ...cfg.pythonArgs
  );
  return args;
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Run `fn` with pyright's `extraPaths` pointing at `src/` when the project has a src layout
 * and no pyright configuration of its own. The configuration file exists only while the
 * indexer runs; scip-python reads pyright settings from the project root only.
 * @param {object} cfg
 * @param {() => T} fn
 * @returns {T}
 * @template T
 */
function withSrcLayoutConfig(cfg, fn) {
  const configPath = path.join(cfg.root, 'pyrightconfig.json');
  const existing = readText(configPath);
  const pyproject = readText(path.join(cfg.root, 'pyproject.toml')) || '';
  const ownConfig =
    (existing !== null && existing !== SRC_LAYOUT_PYRIGHT_CONFIG) ||
    /^\s*\[tool\.pyright\]/m.test(pyproject);
  if (ownConfig || !fs.existsSync(path.join(cfg.root, 'src'))) return fn();
  fs.writeFileSync(configPath, SRC_LAYOUT_PYRIGHT_CONFIG);
  try {
    return fn();
  } finally {
    if (readText(configPath) === SRC_LAYOUT_PYRIGHT_CONFIG) fs.rmSync(configPath, { force: true });
  }
}

/**
 * Run one language's indexer and atomically replace its index file.
 * @param {object} cfg
 * @param {string} language
 * @param {object} opts
 * @param {boolean} opts.quiet - capture indexer output instead of printing it
 */
function runIndexer(cfg, language, { quiet }) {
  const spec = LANGUAGES[language];
  const indexer = resolveIndexer(cfg, language);
  if (!indexer) {
    throw new Error(
      `${spec.indexerPackage} is missing from the MUSUBI installation; reinstall MUSUBI`
    );
  }
  const indexPath = cfg.indexPaths[language];
  const tmpPath = `${indexPath}.${process.pid}.tmp`;
  const args =
    language === 'python'
      ? pythonArgs(cfg, indexer, tmpPath)
      : typescriptArgs(cfg, indexer, tmpPath);

  const spawn = () =>
    spawnSync(process.execPath, args, {
      cwd: cfg.root,
      encoding: 'utf8',
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit'],
      maxBuffer: 64 * 1024 * 1024,
      windowsHide: true,
    });
  const result = language === 'python' ? withSrcLayoutConfig(cfg, spawn) : spawn();
  if (result.error) throw result.error;
  if (result.status !== 0 || !fs.existsSync(tmpPath)) {
    fs.rmSync(tmpPath, { force: true });
    const output = `${result.stderr || ''}${result.stdout || ''}`.trim().slice(-2000);
    throw new Error(
      `${spec.tool} exited with status ${result.status}${output ? `: ${output}` : ''}`
    );
  }
  replaceFile(tmpPath, indexPath);
}

/**
 * Write .scip/names.json: the definition names that the hint hook looks up (./hint.js). When
 * the list cannot be built, an empty one is written, so the index is not rebuilt over and over.
 * @param {object} cfg
 */
function writeNames(cfg) {
  let content;
  try {
    // query.js requires this module, so it is loaded here rather than at the top.
    const query = require('./query');
    const model = query.loadModel(cfg, { refresh: false });
    content = { version: NAMES_VERSION, names: query.definitionNames(model) };
  } catch (error) {
    log(cfg, `names list not built: ${error.message}`);
    content = { version: NAMES_VERSION, error: error.message, names: {} };
  }
  const tmpPath = `${cfg.namesPath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(content)}\n`);
  replaceFile(tmpPath, cfg.namesPath);
}

/** Remove index files of languages without sources and the single-file layout. */
function removeLeftovers(cfg, present, entries) {
  fs.rmSync(path.join(cfg.dir, LEGACY_INDEX_FILE), { force: true });
  for (const key of LANGUAGE_KEYS) {
    if (present.includes(key)) continue;
    fs.rmSync(cfg.indexPaths[key], { force: true });
    delete entries[key];
  }
}

/**
 * Build the indexes under a lock. When another process is already building, mark the
 * index dirty so that build runs once more after it finishes, and return.
 * @param {object} cfg
 * @param {object} [opts]
 * @param {boolean} [opts.quiet]
 * @param {string[]|null} [opts.languages] - languages to build (default: every language with
 *   source files)
 * @returns {{built: boolean, queued: boolean, durationMs?: number, files?: number,
 *   languages?: string[]}}
 */
function build(cfg, { quiet = false, languages = null } = {}) {
  ensureIndexDir(cfg);
  if (!tryAcquireLock(cfg)) {
    fs.writeFileSync(cfg.dirtyPath, String(Date.now()));
    log(cfg, 'build already running; queued a follow-up build');
    return { built: false, queued: true };
  }
  try {
    let last = null;
    let wanted = languages;
    for (let round = 0; round < MAX_FOLLOW_UP_BUILDS; round++) {
      fs.rmSync(cfg.dirtyPath, { force: true });
      // Fingerprint before indexing: edits made during the build make the index stale again.
      const fingerprint = computeFingerprint(cfg);
      const present = Object.keys(fingerprint.languages);
      const targets = (wanted || present).filter(key => present.includes(key));
      const entries = metaLanguages(readMeta(cfg));
      removeLeftovers(cfg, present, entries);
      const started = Date.now();
      for (const key of targets) {
        const startedLanguage = Date.now();
        runIndexer(cfg, key, { quiet });
        entries[key] = {
          fingerprint: fingerprint.languages[key].hash,
          files: fingerprint.languages[key].files,
          builtAt: new Date().toISOString(),
          durationMs: Date.now() - startedLanguage,
          indexer: indexerVersion(cfg, key),
          ...(key === 'typescript'
            ? { tsconfig: cfg.useProjectTsconfig ? 'tsconfig.json' : '.scip/tsconfig.json' }
            : {}),
        };
      }
      writeNames(cfg);
      const meta = { version: META_VERSION, builtAt: new Date().toISOString(), languages: entries };
      fs.writeFileSync(cfg.metaPath, `${JSON.stringify(meta, null, 2)}\n`);
      const durationMs = Date.now() - started;
      const files = targets.reduce((n, key) => n + fingerprint.languages[key].files, 0);
      const tools = targets.map(key => LANGUAGES[key].tool).join(', ') || 'no';
      log(cfg, `built ${tools} index: ${files} files in ${durationMs} ms`);
      last = { built: true, queued: false, durationMs, files, languages: targets };
      if (!fs.existsSync(cfg.dirtyPath)) break;
      wanted = staleLanguages(getFreshness(cfg));
    }
    return last;
  } finally {
    releaseLock(cfg);
  }
}

/**
 * Make sure the index is fresh before reading it: wait for a running build, otherwise
 * rebuild the languages that are stale or missing.
 * @param {object} cfg
 * @param {object} [opts]
 * @param {(msg: string) => void} [opts.notify] - progress messages for the user
 * @param {number} [attempt] - internal retry counter
 * @returns {{state: string, rebuilt: boolean}}
 */
function ensureFresh(cfg, { notify = () => {} } = {}, attempt = 0) {
  const waitStarted = Date.now();
  let notifiedWait = false;
  while (isLockLive(readLock(cfg)) && Date.now() - waitStarted < WAIT_FOR_BUILD_MS) {
    if (!notifiedWait) {
      notify('scip: waiting for the running index build to finish...');
      notifiedWait = true;
    }
    sleep(500);
  }
  const freshness = getFreshness(cfg);
  if (freshness.state === 'fresh') return { state: 'fresh', rebuilt: false };
  if (freshness.current.files === 0) {
    throw new Error(
      `no JavaScript, TypeScript or Python sources under ${cfg.roots.join(', ')}; nothing to index`
    );
  }
  notify(
    freshness.state === 'missing'
      ? 'scip: no index yet, building it...'
      : 'scip: source files changed since the last index, rebuilding...'
  );
  const result = build(cfg, { quiet: true, languages: staleLanguages(freshness) });
  if (!result.built) {
    if (attempt >= 2) throw new Error('could not acquire the index build lock (.scip/build.lock)');
    return ensureFresh(cfg, { notify }, attempt + 1);
  }
  return { state: 'fresh', rebuilt: true };
}

function readStdin(timeoutMs) {
  return new Promise(resolve => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    let data = '';
    const finish = () => {
      clearTimeout(timer);
      process.stdin.destroy();
      resolve(data);
    };
    const timer = setTimeout(finish, timeoutMs);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', finish);
    process.stdin.on('error', finish);
  });
}

/**
 * Project root for a hook call: CLAUDE_PROJECT_DIR, else the hook's cwd, else the process cwd.
 * @param {object} input - parsed hook JSON
 * @returns {string}
 */
function resolveHookRoot(input) {
  return findProjectRoot(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
}

/**
 * Claude Code hook entry point. Never throws.
 * @param {string} rawInput - hook JSON from stdin
 * @param {object} [opts]
 * @param {string} [opts.root] - project root (default: resolved from the hook input)
 * @returns {'skipped'|'fresh'|'built'|'queued'|'unavailable'|'error'}
 */
function runHook(rawInput, { root } = {}) {
  let cfg = null;
  try {
    let input = {};
    try {
      input = rawInput ? JSON.parse(rawInput) : {};
    } catch {
      input = {};
    }
    cfg = loadConfig(root || resolveHookRoot(input));
    const toolInput = input.tool_input || {};
    const filePath = toolInput.file_path || toolInput.notebook_path;
    const event = input.hook_event_name || 'manual';
    const tool = input.tool_name ? `/${input.tool_name}` : '';
    if (filePath && !isIndexedPath(cfg, filePath)) return 'skipped';
    const freshness = getFreshness(cfg);
    if (freshness.state === 'fresh') return 'fresh';
    if (freshness.current.files === 0) return 'skipped';
    const stale = staleLanguages(freshness);
    for (const key of stale) {
      if (!resolveIndexer(cfg, key)) {
        log(cfg, `${event}${tool}: ${LANGUAGES[key].tool} not available, skipping`);
        return 'unavailable';
      }
    }
    log(
      cfg,
      `${event}${tool}: index ${freshness.state} (${stale.join(', ') || 'leftovers'}), rebuilding`
    );
    return build(cfg, { quiet: true, languages: stale }).built ? 'built' : 'queued';
  } catch (error) {
    if (cfg) log(cfg, `hook error: ${error.message}`);
    return 'error';
  }
}

/**
 * Freshness and build information for `musubi-code status`, per language with source files.
 * @param {object} cfg
 */
function statusReport(cfg) {
  const freshness = getFreshness(cfg);
  const entries = metaLanguages(freshness.meta);
  const languages = {};
  for (const key of LANGUAGE_KEYS) {
    const current = freshness.current.languages[key];
    if (!current) continue;
    languages[key] = {
      label: LANGUAGES[key].label,
      tool: LANGUAGES[key].tool,
      index: toPosix(path.relative(cfg.root, cfg.indexPaths[key])),
      state: freshness.languages[key],
      files: current.files,
      meta: entries[key] || null,
    };
  }
  return {
    state: freshness.state,
    root: cfg.root,
    roots: cfg.roots,
    exclude: cfg.exclude,
    files: freshness.current.files,
    building: isLockLive(readLock(cfg)),
    languages,
  };
}

module.exports = {
  NAMES_VERSION,
  SOURCE_EXTENSIONS,
  LANGUAGES,
  languageOf,
  findProjectRoot,
  detectLanguages,
  loadConfig,
  isIndexedPath,
  coversDirectory,
  listSourceFiles,
  computeFingerprint,
  getFreshness,
  build,
  ensureFresh,
  readStdin,
  resolveHookRoot,
  runHook,
  statusReport,
  toPosix,
};
