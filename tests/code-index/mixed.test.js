/**
 * End-to-end tests for a mixed JavaScript + Python project (CHANGE-006, REQ-IDX-007,
 * REQ-IDX-013 to REQ-IDX-016): both indexers run on one tree, each on its own files, and the
 * query layer answers from one model.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const { loadConfig, getFreshness, runHook, statusReport } = require('../../src/code-index/indexer');
const {
  loadModel,
  refsQuery,
  callersQuery,
  depsQuery,
  dependentsQuery,
  symbolsQuery,
  suggestNames,
} = require('../../src/code-index/query');
const {
  PYTHON_FILES,
  JAVASCRIPT_FILES,
  SESSION_START,
  writeFixture,
  cli,
  referencesOf,
  readJson,
  touchLater,
} = require('./fixtures');

const PACKAGE_JSON = { name: 'mixed', version: '1.0.0', scip: { roots: ['.'] } };

// Files that neither indexer may pick up and that the fingerprint must not count.
const NOISE = {
  'node_modules/foo/index.js': 'function nodeLeak() {}\nmodule.exports = { nodeLeak };\n',
  'node_modules/foo/tool.py': 'def node_py():\n    pass\n',
  '.venv/Lib/site-packages/x/static/leak.js': 'function venvLeak() {}\n',
  '.venv/Lib/site-packages/x/leak.py': 'def venv_py():\n    pass\n',
  'venv/lib/leak2.js': 'function venvLeak2() {}\n',
  'venv/lib/leak2.py': 'def venv_py2():\n    pass\n',
  '__pycache__/stale.py': 'def stale():\n    pass\n',
};

describe('code index of a mixed JavaScript + Python project', () => {
  let root;
  let model;

  const scipPath = name => path.join(root, '.scip', name);
  const readMeta = () => readJson(scipPath('meta.json'));

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-mixed-'));
    writeFixture(root, {
      'package.json': JSON.stringify(PACKAGE_JSON),
      'pyproject.toml': '[project]\nname = "mixed"\nversion = "1.0.0"\n',
      ...JAVASCRIPT_FILES,
      ...PYTHON_FILES,
      ...NOISE,
    });
    expect(runHook(SESSION_START, { root })).toBe('built');
    model = loadModel(loadConfig(root), { refresh: false });
  }, 240000);

  afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

  const refsOf = (query, file) => referencesOf(refsQuery, model, query, file);

  test('builds one index per language and nothing from environments (REQ-IDX-014, REQ-IDX-015)', () => {
    expect(fs.existsSync(scipPath('index.typescript.scip'))).toBe(true);
    expect(fs.existsSync(scipPath('index.python.scip'))).toBe(true);
    const status = statusReport(loadConfig(root));
    expect(status).toMatchObject({ state: 'fresh', files: 6 });
    expect(status.languages.typescript).toMatchObject({ state: 'fresh', files: 2 });
    expect(status.languages.python).toMatchObject({ state: 'fresh', files: 4 });
    expect([...model.docs.keys()].sort()).toEqual([
      'pkg/__init__.py',
      'pkg/models.py',
      'pkg/service.py',
      'tests/test_service.py',
      'web/server.js',
      'web/widget.js',
    ]);
    const generated = readJson(scipPath('tsconfig.json'));
    expect(generated.exclude).toEqual(
      expect.arrayContaining(['../**/node_modules', '../**/.venv', '../**/venv'])
    );
  });

  test('answers every query across both languages from one model (REQ-IDX-008, REQ-IDX-014)', () => {
    expect(refsOf('Widget', 'web/widget.js')).toEqual([
      'web/server.js:1 require -',
      'web/server.js:3 new main',
      'web/widget.js:10 new makeWidget',
      'web/widget.js:12 export -',
    ]);
    expect(refsOf('User', 'pkg/models.py')).toEqual([
      'pkg/models.py:38 call make_user',
      'pkg/service.py:1 import -',
      'pkg/service.py:11 call run',
      'tests/test_service.py:7 ref test_run',
    ]);

    const [makeWidget] = callersQuery(model, 'makeWidget', {});
    expect(makeWidget.callers).toEqual([
      { file: 'web/server.js', caller: 'main', tags: ['call'], lines: [4] },
    ]);
    const [makeUser] = callersQuery(model, 'make_user', {});
    expect(makeUser.callers.map(c => `${c.file} ${c.caller}`)).toEqual([
      'pkg/service.py run',
      'tests/test_service.py test_run',
    ]);

    expect(depsQuery(model, 'web/server.js').files).toEqual([
      { file: 'web/widget.js', required: true, symbols: expect.any(Number) },
    ]);
    expect(depsQuery(model, 'pkg/service.py').files).toEqual([
      { file: 'pkg/models.py', required: true, symbols: expect.any(Number) },
    ]);
    expect(dependentsQuery(model, 'web/widget.js').dependents.map(d => d.file)).toEqual([
      'web/server.js',
    ]);
    expect(dependentsQuery(model, 'pkg/models.py').dependents.map(d => d.file)).toEqual([
      'pkg/service.py',
      'tests/test_service.py',
    ]);

    const kinds = file => symbolsQuery(model, file).symbols.map(s => `${s.kind} ${s.name}`);
    expect(kinds('web/widget.js')).toEqual(expect.arrayContaining(['class Widget']));
    expect(kinds('pkg/models.py')).toEqual(expect.arrayContaining(['class User']));

    const { names } = readJson(scipPath('names.json'));
    const show = name => (names[name] || []).map(e => `${e.kind} ${e.name} ${e.file}:${e.line}`);
    expect(show('Widget')).toEqual(['class Widget web/widget.js:1']);
    expect(show('User')).toEqual(['class User pkg/models.py:22']);
    expect(suggestNames(model, 'Widgetz')).toContain('Widget');
    expect(suggestNames(model, 'make_usr')).toContain('make_user');

    for (const outside of [
      '.venv/Lib/site-packages/x/static/leak.js',
      'venv/lib/leak2.py',
      'node_modules/foo/tool.py',
    ]) {
      expect(() => symbolsQuery(model, outside)).toThrow(/not in the index/);
    }
  });

  test('rebuilds only the language whose files changed (REQ-IDX-007)', () => {
    const before = readMeta();
    const file = path.join(root, 'pkg', 'service.py');
    fs.appendFileSync(file, '# edited\n');
    touchLater(file);
    const cfg = loadConfig(root);
    expect(getFreshness(cfg)).toMatchObject({
      state: 'stale',
      languages: { typescript: 'fresh', python: 'stale' },
    });
    const edit = JSON.stringify({
      hook_event_name: 'PostToolUse',
      tool_name: 'Edit',
      tool_input: { file_path: file },
    });
    expect(runHook(edit, { root })).toBe('built');
    const after = readMeta();
    expect(after.languages.typescript).toEqual(before.languages.typescript);
    expect(after.languages.python.builtAt).not.toBe(before.languages.python.builtAt);
    expect(getFreshness(cfg).state).toBe('fresh');
  }, 180000);

  test('keeps the other index when one indexer fails (REQ-IDX-013)', () => {
    const pkgPath = path.join(root, 'package.json');
    const original = fs.readFileSync(pkgPath, 'utf8');
    const broken = { ...PACKAGE_JSON, scip: { roots: ['.'], pythonArgs: ['--no-such-option'] } };
    fs.writeFileSync(pkgPath, JSON.stringify(broken));
    try {
      // Indexer arguments are part of the fingerprint, so only the Python index is stale.
      expect(getFreshness(loadConfig(root)).languages).toEqual({
        typescript: 'fresh',
        python: 'stale',
      });
      expect(runHook(SESSION_START, { root })).toBe('error');
      expect(fs.readFileSync(scipPath('index.log'), 'utf8')).toMatch(
        /scip-python exited with status/
      );
      expect(fs.existsSync(scipPath('index.typescript.scip'))).toBe(true);
      const partial = loadModel(loadConfig(root), { refresh: false });
      expect(refsQuery(partial, 'Widget', { file: 'web/widget.js' })).toHaveLength(1);
    } finally {
      fs.writeFileSync(pkgPath, original);
    }
    // The failed build changed nothing, so the restored configuration is fresh again.
    expect(runHook(SESSION_START, { root })).toBe('fresh');
    expect(getFreshness(loadConfig(root)).state).toBe('fresh');
  }, 180000);

  test('the musubi-code CLI reports and rebuilds both languages', () => {
    const status = cli(root, ['status']);
    expect(status.status).toBe(0);
    expect(status.stdout).toContain(
      'JavaScript/TypeScript: .scip/index.typescript.scip (fresh), 2 files'
    );
    expect(status.stdout).toContain('Python: .scip/index.python.scip (fresh), 4 files');

    expect(cli(root, ['refs', 'User']).stdout).toContain('User (class) pkg/models.py:22');
    expect(cli(root, ['refs', 'Widget']).stdout).toContain('Widget (class) web/widget.js:1');

    const rebuild = cli(root, ['index']);
    expect(rebuild.status).toBe(0);
    expect(rebuild.stderr).toMatch(/indexed 6 files .*JavaScript\/TypeScript, Python/);
  }, 240000);
});
