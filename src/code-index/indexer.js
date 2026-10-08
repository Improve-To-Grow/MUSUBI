/**
 * Code index builder - compiler-accurate SCIP index of a JavaScript/TypeScript project
 *
 * Wraps @sourcegraph/scip-typescript, which resolves CommonJS `require()`, ES imports,
 * `new X()`, `extends` and method calls across files with the TypeScript compiler.
 * The index is written to `<project>/.scip/index.scip` and read by ./query.js; the names it
 * defines go to `.scip/names.json`, read by ./hint.js.
 * Nothing is written outside `.scip/`: projects without a tsconfig.json get a generated
 * `.scip/tsconfig.json` instead of scip-typescript's `--infer-tsconfig`, which would create
 * `./tsconfig.json`.
 *
 * Optional configuration in the project's package.json:
 *   "scip": {
 *     "roots": ["src", "tests"],      directories to index (default: the existing ones of
 *                                     bin, src, lib, app, scripts, tests, test)
 *     "exclude": ["src/templates"],   paths under the roots to skip
 *     "tsconfig": "auto",             "auto" uses ./tsconfig.json when present, "generated"
 *                                     always uses .scip/tsconfig.json
 *     "indexerArgs": []               extra scip-typescript arguments, e.g. ["--yarn-workspaces"]
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

const INDEXER_MODULE = '@sourcegraph/scip-typescript/dist/src/main.js';
const DEFAULT_ROOTS = ['bin', 'src', 'lib', 'app', 'scripts', 'tests', 'test'];
const ALWAYS_EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.scip',
  'coverage',
  'dist',
  'build',
  'out',
]);
const SOURCE_EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.jsx', '.ts', '.cts', '.mts', '.tsx']);
const LOCK_TTL_MS = 15 * 60 * 1000;
const WAIT_FOR_BUILD_MS = 5 * 60 * 1000;
const MAX_LOG_BYTES = 256 * 1024;
const MAX_FOLLOW_UP_BUILDS = 3;
// Format of .scip/names.json, read by ./hint.js.
const NAMES_VERSION = 1;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

const PROJECT_MARKERS = ['package.json', 'tsconfig.json', 'jsconfig.json'];

/**
 * Find the project root for a directory: the nearest ancestor that already has an index
 * (`.scip/meta.json`), otherwise the nearest one with a package.json, tsconfig.json or
 * jsconfig.json, otherwise the directory itself.
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
 * Does a directory look like a JavaScript or TypeScript project?
 * @param {string} root
 * @returns {boolean}
 */
function isJavaScriptProject(root) {
  return PROJECT_MARKERS.some(m => fs.existsSync(path.join(root, m)));
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
  if (!roots || roots.length === 0) roots = DEFAULT_ROOTS.filter(isDir);
  if (roots.length === 0) roots = ['.'];
  roots = roots.map(r => toPosix(path.normalize(r)).replace(/\/$/, ''));

  const exclude = (Array.isArray(settings.exclude) ? settings.exclude : []).map(e =>
    toPosix(path.normalize(e)).replace(/\/$/, '')
  );
  const hasProjectTsconfig = fs.existsSync(path.join(root, 'tsconfig.json'));
  const useProjectTsconfig = settings.tsconfig !== 'generated' && hasProjectTsconfig;
  const dir = path.join(root, '.scip');

  return {
    root,
    roots,
    exclude,
    useProjectTsconfig,
    indexerArgs: Array.isArray(settings.indexerArgs) ? settings.indexerArgs.map(String) : [],
    dir,
    indexPath: path.join(dir, 'index.scip'),
    metaPath: path.join(dir, 'meta.json'),
    namesPath: path.join(dir, 'names.json'),
    lockPath: path.join(dir, 'build.lock'),
    dirtyPath: path.join(dir, 'dirty'),
    logPath: path.join(dir, 'index.log'),
    tsconfigPath: path.join(dir, 'tsconfig.json'),
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
  if (rel.split('/').some(part => ALWAYS_EXCLUDED_DIRS.has(part))) return false;
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
  if (rel.split('/').some(part => ALWAYS_EXCLUDED_DIRS.has(part)) || isExcluded(cfg, rel)) {
    return false;
  }
  return cfg.roots.some(
    r => r === '.' || rel === r || rel.startsWith(`${r}/`) || r.startsWith(`${rel}/`)
  );
}

/**
 * List the source files the index covers, with size and modification time.
 * @param {object} cfg
 * @returns {Array<{rel: string, size: number, mtimeMs: number}>}
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
        if (!ALWAYS_EXCLUDED_DIRS.has(entry.name) && !isExcluded(cfg, rel)) walk(rel);
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        if (isExcluded(cfg, rel)) continue;
        const stat = fs.statSync(path.join(cfg.root, rel));
        files.push({ rel, size: stat.size, mtimeMs: Math.floor(stat.mtimeMs) });
      }
    }
  };
  for (const r of cfg.roots) walk(r);
  return files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
}

function indexerVersion(cfg) {
  try {
    const pkgPath = require.resolve('@sourcegraph/scip-typescript/package.json', {
      paths: [__dirname, cfg.root],
    });
    return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
  } catch {
    return null;
  }
}

/**
 * Fingerprint of everything that should trigger a rebuild: the indexed files, the
 * configuration and the indexer version.
 * @param {object} cfg
 * @returns {{hash: string, files: number}}
 */
function computeFingerprint(cfg) {
  const files = listSourceFiles(cfg);
  const hash = crypto.createHash('sha1');
  hash.update(
    JSON.stringify({
      roots: cfg.roots,
      exclude: cfg.exclude,
      useProjectTsconfig: cfg.useProjectTsconfig,
      indexerArgs: cfg.indexerArgs,
      indexer: indexerVersion(cfg),
    })
  );
  for (const f of files) hash.update(`\n${f.rel}|${f.size}|${f.mtimeMs}`);
  return { hash: hash.digest('hex'), files: files.length };
}

function readMeta(cfg) {
  try {
    return JSON.parse(fs.readFileSync(cfg.metaPath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * @param {object} cfg
 * @returns {{state: 'missing'|'stale'|'fresh', meta: object|null, current: object}}
 */
function getFreshness(cfg) {
  const current = computeFingerprint(cfg);
  const meta = readMeta(cfg);
  if (!meta || !fs.existsSync(cfg.indexPath)) return { state: 'missing', meta, current };
  // Indexes built before names.json existed get it on their next build.
  if (!fs.existsSync(cfg.namesPath)) return { state: 'stale', meta, current };
  return { state: meta.fingerprint === current.hash ? 'fresh' : 'stale', meta, current };
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
    exclude: ['../**/node_modules', '../.scip', ...cfg.exclude.map(up)],
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

function resolveIndexer(cfg) {
  try {
    return require.resolve(INDEXER_MODULE, { paths: [__dirname, cfg.root] });
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
 * Run scip-typescript once and atomically replace .scip/index.scip.
 * @param {object} cfg
 * @param {object} opts
 * @param {boolean} opts.quiet - capture indexer output instead of printing it
 */
function runIndexer(cfg, { quiet }) {
  const indexer = resolveIndexer(cfg);
  if (!indexer) {
    throw new Error(
      '@sourcegraph/scip-typescript is missing from the MUSUBI installation; reinstall MUSUBI'
    );
  }
  if (!cfg.useProjectTsconfig) writeGeneratedTsconfig(cfg);

  const tmpPath = `${cfg.indexPath}.${process.pid}.tmp`;
  const args = [indexer, 'index'];
  if (!cfg.useProjectTsconfig) args.push(toPosix(path.relative(cfg.root, cfg.dir)));
  args.push('--output', tmpPath, '--no-progress-bar', ...cfg.indexerArgs);

  const result = spawnSync(process.execPath, args, {
    cwd: cfg.root,
    encoding: 'utf8',
    stdio: quiet ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'inherit', 'inherit'],
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0 || !fs.existsSync(tmpPath)) {
    fs.rmSync(tmpPath, { force: true });
    const output = `${result.stderr || ''}${result.stdout || ''}`.trim().slice(-2000);
    throw new Error(
      `scip-typescript exited with status ${result.status}${output ? `: ${output}` : ''}`
    );
  }
  replaceFile(tmpPath, cfg.indexPath);
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

/**
 * Build the index under a lock. When another process is already building, mark the
 * index dirty so that build runs once more after it finishes, and return.
 * @param {object} cfg
 * @param {object} [opts]
 * @param {boolean} [opts.quiet]
 * @returns {{built: boolean, queued: boolean, durationMs?: number, files?: number}}
 */
function build(cfg, { quiet = false } = {}) {
  ensureIndexDir(cfg);
  if (!tryAcquireLock(cfg)) {
    fs.writeFileSync(cfg.dirtyPath, String(Date.now()));
    log(cfg, 'build already running; queued a follow-up build');
    return { built: false, queued: true };
  }
  try {
    let last = null;
    for (let round = 0; round < MAX_FOLLOW_UP_BUILDS; round++) {
      fs.rmSync(cfg.dirtyPath, { force: true });
      // Fingerprint before indexing: edits made during the build make the index stale again.
      const fingerprint = computeFingerprint(cfg);
      const started = Date.now();
      runIndexer(cfg, { quiet });
      writeNames(cfg);
      const meta = {
        fingerprint: fingerprint.hash,
        files: fingerprint.files,
        builtAt: new Date().toISOString(),
        durationMs: Date.now() - started,
        indexer: indexerVersion(cfg),
        tsconfig: cfg.useProjectTsconfig ? 'tsconfig.json' : '.scip/tsconfig.json',
      };
      fs.writeFileSync(cfg.metaPath, `${JSON.stringify(meta, null, 2)}\n`);
      log(cfg, `built index: ${meta.files} files in ${meta.durationMs} ms`);
      last = { built: true, queued: false, durationMs: meta.durationMs, files: meta.files };
      if (!fs.existsSync(cfg.dirtyPath)) break;
    }
    return last;
  } finally {
    releaseLock(cfg);
  }
}

/**
 * Make sure the index is fresh before reading it: wait for a running build, otherwise
 * rebuild when stale or missing.
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
  notify(
    freshness.state === 'missing'
      ? 'scip: no index yet, building it...'
      : 'scip: source files changed since the last index, rebuilding...'
  );
  const result = build(cfg, { quiet: true });
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
    if (!resolveIndexer(cfg)) {
      log(cfg, `${event}${tool}: scip-typescript not available, skipping`);
      return 'unavailable';
    }
    log(cfg, `${event}${tool}: index ${freshness.state}, rebuilding`);
    return build(cfg, { quiet: true }).built ? 'built' : 'queued';
  } catch (error) {
    if (cfg) log(cfg, `hook error: ${error.message}`);
    return 'error';
  }
}

/**
 * Freshness and build information for `musubi-code status`.
 * @param {object} cfg
 */
function statusReport(cfg) {
  const freshness = getFreshness(cfg);
  return {
    state: freshness.state,
    root: cfg.root,
    index: toPosix(path.relative(cfg.root, cfg.indexPath)),
    roots: cfg.roots,
    exclude: cfg.exclude,
    files: freshness.current.files,
    meta: freshness.meta,
    building: isLockLive(readLock(cfg)),
  };
}

module.exports = {
  NAMES_VERSION,
  SOURCE_EXTENSIONS,
  findProjectRoot,
  isJavaScriptProject,
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
