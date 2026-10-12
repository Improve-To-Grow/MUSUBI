/**
 * End-to-end tests for Python projects (CHANGE-006, REQ-IDX-004 to REQ-IDX-010): a real
 * scip-python index of a fixture package, built through the hook path and queried through the
 * library and the musubi-code CLI.
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
  PYPROJECT,
  SESSION_START,
  writeFixture,
  cli,
  referencesOf,
  readJson,
  touchLater,
} = require('./fixtures');

describe('code index of a Python project', () => {
  let root;
  let model;

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-py-'));
    writeFixture(root, { 'pyproject.toml': PYPROJECT, 'README.md': '# demo\n', ...PYTHON_FILES });
    expect(runHook(SESSION_START, { root })).toBe('built');
    model = loadModel(loadConfig(root), { refresh: false });
  }, 180000);

  afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

  const refsOf = (query, file) => referencesOf(refsQuery, model, query, file);

  test('writes the Python index and nothing outside .scip (REQ-IDX-005, REQ-IDX-007)', () => {
    const scip = path.join(root, '.scip');
    expect(fs.existsSync(path.join(scip, 'index.python.scip'))).toBe(true);
    expect(fs.existsSync(path.join(scip, 'index.typescript.scip'))).toBe(false);
    expect(fs.existsSync(path.join(scip, 'index.scip'))).toBe(false);
    expect(fs.readFileSync(path.join(scip, 'python-environment.json'), 'utf8').trim()).toBe('[]');
    expect(fs.readdirSync(root).sort()).toEqual([
      '.scip',
      'README.md',
      'pkg',
      'pyproject.toml',
      'tests',
    ]);
    const meta = readJson(path.join(scip, 'meta.json'));
    expect(meta.version).toBe(2);
    expect(Object.keys(meta.languages)).toEqual(['python']);
    expect(meta.languages.python).toMatchObject({ files: 4, indexer: expect.any(String) });

    const cfg = loadConfig(root);
    expect(cfg.roots).toEqual(['tests', 'pkg']);
    expect(getFreshness(cfg).state).toBe('fresh');
    const status = statusReport(cfg);
    expect(status).toMatchObject({ state: 'fresh', files: 4 });
    expect(status.languages.python).toMatchObject({
      state: 'fresh',
      files: 4,
      index: '.scip/index.python.scip',
    });
    expect(status.languages.typescript).toBeUndefined();
  });

  test('resolves classes, methods, inferred receivers, super() and decorators (REQ-IDX-008, REQ-IDX-009)', () => {
    expect(refsOf('User', 'pkg/models.py')).toEqual([
      'pkg/models.py:38 call make_user',
      'pkg/service.py:1 import -',
      'pkg/service.py:11 call run',
      'tests/test_service.py:7 ref test_run',
    ]);
    expect(refsOf('User.save')).toEqual(['pkg/service.py:10 call run']);
    expect(refsOf('Base.save')).toEqual([
      'pkg/models.py:19 call Base.describe',
      'pkg/models.py:29 super User.save',
    ]);
    expect(refsOf('Base.describe')).toEqual(['pkg/models.py:33 call User.notify']);
    expect(refsOf('Base', 'pkg/models.py')[0]).toMatch(/^pkg\/models\.py:22 extends /);
    expect(refsOf('timed')).toEqual([expect.stringMatching(/^pkg\/models\.py:27 decorator /)]);

    const [makeUser] = callersQuery(model, 'make_user', {});
    expect(makeUser.callers).toEqual([
      { file: 'pkg/service.py', caller: 'run', tags: ['call'], lines: [9, 13] },
      { file: 'tests/test_service.py', caller: 'test_run', tags: ['call'], lines: [7] },
    ]);
  });

  test('reports Python file dependencies with import flags (REQ-IDX-009)', () => {
    const deps = depsQuery(model, 'pkg/service.py');
    expect(deps.files.map(f => [f.file, f.required])).toEqual([['pkg/models.py', true]]);
    expect(deps.packages).toEqual([]);
    expect(depsQuery(model, 'pkg/models.py').packages.map(p => p.name)).toEqual([
      'python (standard library)',
    ]);

    const dependents = dependentsQuery(model, 'models.py');
    expect(dependents.dependents.map(d => [d.file, d.required])).toEqual([
      ['pkg/service.py', true],
      ['tests/test_service.py', true],
    ]);
    expect(dependents.dependents[0].symbols).toEqual([
      'Config',
      'User',
      'User.notify',
      'User.save',
      'make_user',
    ]);

    const names = symbolsQuery(model, 'pkg/models.py').symbols.map(s => `${s.kind} ${s.name}`);
    expect(names).toEqual(
      expect.arrayContaining([
        'function timed',
        'class Base',
        'constructor Base.__init__',
        'method Base.save',
        'class User',
        'method User.save',
        'function make_user',
        'class Config',
      ])
    );
    expect(names.filter(n => n.startsWith('module '))).toEqual([]);
    expect(suggestNames(model, 'make_usr')).toContain('make_user');
  });

  test('lists Python definitions in names.json without constructors or fields (REQ-IDX-008)', () => {
    const { names } = readJson(path.join(root, '.scip', 'names.json'));
    const show = name => (names[name] || []).map(e => `${e.kind} ${e.name} ${e.file}:${e.line}`);
    expect(show('User')).toEqual(['class User pkg/models.py:22']);
    expect(show('make_user')).toEqual(['function make_user pkg/models.py:37']);
    expect(show('save')).toEqual([
      'method Base.save pkg/models.py:15',
      'method User.save pkg/models.py:28',
    ]);
    for (const absent of ['__init__', 'email', 'models', 'pkg']) {
      expect(Object.keys(names)).not.toContain(absent);
    }
  });

  test('the musubi-code CLI answers Python queries and reports the language', () => {
    const refs = cli(root, ['refs', 'make_user']);
    expect(refs.status).toBe(0);
    expect(refs.stdout).toContain('make_user (function) pkg/models.py:37');
    expect(refs.stdout).toMatch(/9\s+call\s+in run/);

    const status = cli(root, ['status']);
    expect(status.status).toBe(0);
    expect(status.stdout).toContain('Python: .scip/index.python.scip (fresh), 4 files');
    expect(status.stdout).toContain('scip-python ');

    const symbols = cli(root, ['symbols', 'service.py', '--json']);
    expect(symbols.status).toBe(0);
    expect(JSON.parse(symbols.stdout).symbols.map(s => s.name)).toEqual(
      expect.arrayContaining(['run', 'untyped'])
    );
  }, 120000);

  test('marks the Python index stale after a source edit', () => {
    const file = path.join(root, 'pkg', 'service.py');
    fs.appendFileSync(file, '# edited\n');
    touchLater(file);
    const freshness = getFreshness(loadConfig(root));
    expect(freshness.state).toBe('stale');
    expect(freshness.languages).toEqual({ python: 'stale' });
  });
});

describe('code index of a src-layout Python project (REQ-IDX-010)', () => {
  let root;

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-src-'));
    writeFixture(root, {
      'pyproject.toml': PYPROJECT,
      'src/demo/__init__.py': '',
      'src/demo/core.py': 'def handler() -> int:\n    return 1\n',
      'tests/test_core.py': [
        'from demo.core import handler',
        '',
        '',
        'def test_h():',
        '    assert handler() == 1',
        '',
      ].join('\n'),
    });
    expect(runHook(SESSION_START, { root })).toBe('built');
  }, 180000);

  afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

  test('resolves references from tests into src/ without a pyright configuration', () => {
    const model = loadModel(loadConfig(root), { refresh: false });
    const [handler] = refsQuery(model, 'handler', {});
    expect(handler.file).toBe('src/demo/core.py');
    expect(handler.references.map(r => `${r.file}:${r.line} ${r.tag}`)).toEqual([
      'tests/test_core.py:1 import',
      'tests/test_core.py:5 call',
    ]);
    expect(dependentsQuery(model, 'src/demo/core.py').dependents.map(d => d.file)).toEqual([
      'tests/test_core.py',
    ]);
    expect(fs.existsSync(path.join(root, 'pyrightconfig.json'))).toBe(false);
  });
});
