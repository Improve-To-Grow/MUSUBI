/**
 * Tests for src/code-index/indexer.js: configuration, root detection, staleness, hook filtering
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  findProjectRoot,
  detectLanguages,
  loadConfig,
  isIndexedPath,
  listSourceFiles,
  computeFingerprint,
  getFreshness,
  build,
  runHook,
  statusReport,
} = require('../../src/code-index/indexer');

function makeTempProject(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

describe('code-index indexer', () => {
  let root;

  beforeEach(() => {
    root = makeTempProject({
      'package.json': JSON.stringify({ name: 'fixture', scip: { exclude: ['src/templates'] } }),
      'src/a.js': 'module.exports = 1;\n',
      'src/templates/t.js': 'module.exports = 2;\n',
      'src/deep/b.ts': 'export const b = 2;\n',
      'tests/a.test.js': '',
      'README.md': '',
    });
  });

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  test('detects default roots and applies exclusions', () => {
    const cfg = loadConfig(root);
    expect(cfg.roots).toEqual(['src', 'tests']);
    expect(cfg.useProjectTsconfig).toBe(false);
    expect(isIndexedPath(cfg, 'src/a.js')).toBe(true);
    expect(isIndexedPath(cfg, path.join(root, 'src', 'deep', 'b.ts'))).toBe(true);
    expect(isIndexedPath(cfg, 'src/templates/t.js')).toBe(false);
    expect(isIndexedPath(cfg, 'README.md')).toBe(false);
    expect(isIndexedPath(cfg, 'src/node_modules/x/a.js')).toBe(false);
    expect(isIndexedPath(cfg, '../outside.js')).toBe(false);
  });

  test('honours configured roots and tsconfig mode', () => {
    fs.writeFileSync(path.join(root, 'tsconfig.json'), '{}');
    expect(loadConfig(root).useProjectTsconfig).toBe(true);
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({
        name: 'fixture',
        scip: { roots: ['tests', 'missing'], tsconfig: 'generated' },
      })
    );
    const cfg = loadConfig(root);
    expect(cfg.roots).toEqual(['tests']);
    expect(cfg.useProjectTsconfig).toBe(false);
  });

  test('finds the project root from a subdirectory, preferring an existing index', () => {
    const nested = path.join(root, 'src', 'deep');
    expect(findProjectRoot(nested)).toBe(root);
    const inner = path.join(root, 'src');
    fs.writeFileSync(path.join(inner, 'package.json'), '{}');
    expect(findProjectRoot(nested)).toBe(inner);
    fs.mkdirSync(path.join(root, '.scip'));
    fs.writeFileSync(path.join(root, '.scip', 'meta.json'), '{}');
    expect(findProjectRoot(nested)).toBe(root);
  });

  test('detects the languages of a project from markers or sources (REQ-IDX-001)', () => {
    expect(detectLanguages(root)).toEqual(['typescript']);
    fs.writeFileSync(path.join(root, 'pyproject.toml'), '[project]\nname = "x"\n');
    expect(detectLanguages(root)).toEqual(['typescript', 'python']);
    const python = makeTempProject({ 'scripts/tool.py': 'print(1)\n' });
    const script = makeTempProject({ 'package.json': '{}', 'src/a.js': '', 'tool.py': '' });
    const rust = makeTempProject({ 'Cargo.toml': '', 'src/main.rs': 'fn main() {}\n' });
    const empty = makeTempProject({ 'README.md': '' });
    try {
      expect(detectLanguages(python)).toEqual(['python']);
      // A root-level script counts, like this repository's convert-agents-to-skills.py.
      expect(detectLanguages(script)).toEqual(['typescript', 'python']);
      expect(detectLanguages(rust)).toEqual([]);
      expect(detectLanguages(empty)).toEqual([]);
    } finally {
      for (const dir of [python, script, rust, empty]) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  test('fingerprint changes when an indexed file changes, not when others do', () => {
    const cfg = loadConfig(root);
    const before = computeFingerprint(cfg);
    expect(before.files).toBe(3);
    expect(Object.keys(before.languages)).toEqual(['typescript']);
    fs.writeFileSync(path.join(root, 'README.md'), 'changed');
    expect(computeFingerprint(cfg).languages.typescript.hash).toBe(
      before.languages.typescript.hash
    );
    fs.writeFileSync(path.join(root, 'src', 'a.js'), 'module.exports = 42;\n');
    expect(computeFingerprint(cfg).languages.typescript.hash).not.toBe(
      before.languages.typescript.hash
    );
  });

  test('reports a missing index without building one', () => {
    const cfg = loadConfig(root);
    expect(getFreshness(cfg)).toMatchObject({
      state: 'missing',
      languages: { typescript: 'missing' },
    });
    const report = statusReport(cfg);
    expect(report).toMatchObject({
      state: 'missing',
      roots: ['src', 'tests'],
      files: 3,
      building: false,
      languages: {
        typescript: { state: 'missing', index: '.scip/index.typescript.scip', files: 3 },
      },
    });
    expect(report.languages.python).toBeUndefined();
    expect(fs.existsSync(path.join(root, '.scip'))).toBe(false);
  });

  test('default roots cover root-level Python packages and skip environments (REQ-IDX-015, REQ-IDX-016)', () => {
    const py = makeTempProject({
      'pyproject.toml': '[project]\nname = "x"\n',
      'mypkg/__init__.py': '',
      'mypkg/core.py': 'def run():\n    pass\n',
      'tests/test_x.py': '',
      'docs/notes.md': '',
      '.venv/lib/x.py': '',
      'venv/y.py': '',
      '__pycache__/z.py': '',
      'node_modules/a/b.js': '',
      'build/c.py': '',
      'mypkg.egg-info/d.py': '',
    });
    try {
      let cfg = loadConfig(py);
      expect(cfg.roots).toEqual(['tests', 'mypkg']);
      expect(listSourceFiles(cfg).map(f => `${f.language} ${f.rel}`)).toEqual([
        'python mypkg/__init__.py',
        'python mypkg/core.py',
        'python tests/test_x.py',
      ]);
      for (const outside of ['.venv/lib/x.py', 'venv/y.py', 'mypkg.egg-info/d.py', 'build/c.py']) {
        expect(isIndexedPath(cfg, outside)).toBe(false);
      }
      // A top-level script is indexed as well, without widening the roots.
      fs.writeFileSync(path.join(py, 'manage.py'), 'from mypkg.core import run\nrun()\n');
      cfg = loadConfig(py);
      expect(cfg.roots).toEqual(['tests', 'mypkg']);
      expect(cfg.rootFiles).toEqual(['manage.py']);
      expect(listSourceFiles(cfg).map(f => f.rel)).toEqual([
        'manage.py',
        'mypkg/__init__.py',
        'mypkg/core.py',
        'tests/test_x.py',
      ]);
      expect(isIndexedPath(cfg, 'manage.py')).toBe(true);
      expect(isIndexedPath(cfg, 'docs/notes.md')).toBe(false);
      expect(statusReport(cfg)).toMatchObject({
        roots: ['tests', 'mypkg'],
        rootFiles: ['manage.py'],
      });
      expect(computeFingerprint(cfg).languages).toEqual({
        python: { hash: expect.any(String), files: 4 },
      });
    } finally {
      fs.rmSync(py, { recursive: true, force: true });
    }
  });

  test('the hook skips edits outside the index and projects without sources', () => {
    const edit = file =>
      JSON.stringify({
        hook_event_name: 'PostToolUse',
        tool_name: 'Edit',
        tool_input: { file_path: file },
      });
    expect(runHook(edit(path.join(root, 'README.md')), { root })).toBe('skipped');
    expect(runHook('not json', { root: path.join(root, 'empty-dir-without-sources') })).toBe(
      'skipped'
    );
    expect(fs.existsSync(path.join(root, '.scip'))).toBe(false);
  });

  test('a build reports queued while another process holds the lock', () => {
    const cfg = loadConfig(root);
    fs.mkdirSync(cfg.dir, { recursive: true });
    fs.writeFileSync(cfg.lockPath, JSON.stringify({ pid: process.pid, startedAt: Date.now() }));
    try {
      expect(build(cfg, { quiet: true })).toEqual({ built: false, queued: true });
      expect(fs.existsSync(cfg.dirtyPath)).toBe(true);
    } finally {
      fs.rmSync(cfg.lockPath, { force: true });
    }
  });

  test('the hook resolves the project from CLAUDE_PROJECT_DIR', () => {
    const empty = makeTempProject({ 'package.json': '{}' });
    const previous = process.env.CLAUDE_PROJECT_DIR;
    process.env.CLAUDE_PROJECT_DIR = empty;
    try {
      expect(runHook(JSON.stringify({ hook_event_name: 'SessionStart' }))).toBe('skipped');
    } finally {
      if (previous === undefined) delete process.env.CLAUDE_PROJECT_DIR;
      else process.env.CLAUDE_PROJECT_DIR = previous;
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});
