/**
 * End-to-end tests: build a real scip-typescript index of a CommonJS fixture through the hook
 * path, query it through the library and through the musubi-code CLI.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { loadConfig, getFreshness, runHook } = require('../../src/code-index/indexer');
const {
  loadModel,
  refsQuery,
  callersQuery,
  depsQuery,
  dependentsQuery,
  symbolsQuery,
  suggestNames,
} = require('../../src/code-index/query');
const { formatRefs, formatDeps } = require('../../src/code-index/format');

const CLI = path.join(__dirname, '..', '..', 'bin', 'musubi-code.js');

const FIXTURE = {
  'package.json': JSON.stringify({ name: 'fixture', version: '1.0.0', scip: { roots: ['lib'] } }),
  'README.md': '# fixture\n',
  'lib/widget.js': [
    'class Widget {',
    '  constructor(name) {',
    '    this.name = name;',
    '  }',
    '  render() {',
    '    return `<${this.name}>`;',
    '  }',
    '}',
    'function makeWidget(name) {',
    '  return new Widget(name);',
    '}',
    'module.exports = { Widget, makeWidget };',
    '',
  ].join('\n'),
  'lib/fancy.js': [
    "const { Widget } = require('./widget');",
    'class FancyWidget extends Widget {',
    '  render() {',
    '    return `*${super.render()}*`;',
    '  }',
    '}',
    'module.exports = FancyWidget;',
    '',
  ].join('\n'),
  'lib/app.js': [
    "const { makeWidget, Widget } = require('./widget');",
    "const FancyWidget = require('./fancy');",
    'function main() {',
    "  const plain = new Widget('plain');",
    "  const fancy = new FancyWidget('fancy');",
    "  [1, 2].forEach(() => makeWidget('x'));",
    '  return [plain.render(), fancy.render()];',
    '}',
    'module.exports = { main };',
    '',
  ].join('\n'),
};

function cli(root, args, input) {
  return spawnSync(process.execPath, [CLI, ...args, '--root', root], {
    encoding: 'utf8',
    input,
    timeout: 120000,
  });
}

describe('code index of a CommonJS project', () => {
  let root;
  let model;

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-e2e-'));
    for (const [rel, content] of Object.entries(FIXTURE)) {
      fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      fs.writeFileSync(path.join(root, rel), content);
    }
    const sessionStart = JSON.stringify({ hook_event_name: 'SessionStart', source: 'startup' });
    expect(runHook(sessionStart, { root })).toBe('built');
    model = loadModel(loadConfig(root), { refresh: false });
  }, 120000);

  afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

  const refsOf = (query, file) => {
    const [entity] = refsQuery(model, query, { file });
    return entity.references.map(r => `${r.file}:${r.line} ${r.tag} ${r.caller || '-'}`);
  };

  test('writes nothing outside .scip and reports a fresh index', () => {
    expect(fs.existsSync(path.join(root, 'tsconfig.json'))).toBe(false);
    expect(fs.readFileSync(path.join(root, '.scip', '.gitignore'), 'utf8')).toBe('*\n');
    expect(getFreshness(loadConfig(root)).state).toBe('fresh');
    expect(
      runHook(JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Bash' }), { root })
    ).toBe('fresh');
  });

  test('finds cross-file new, extends, require and export sites of a class', () => {
    expect(refsOf('Widget', 'lib/widget.js')).toEqual([
      'lib/app.js:1 require -',
      'lib/app.js:4 new main',
      'lib/fancy.js:1 require -',
      'lib/fancy.js:2 extends FancyWidget',
      'lib/widget.js:10 new makeWidget',
      'lib/widget.js:12 export -',
    ]);
  });

  test('links require() of a default-exported class to the class', () => {
    expect(refsOf('FancyWidget')).toEqual(
      expect.arrayContaining(['lib/app.js:2 require -', 'lib/app.js:5 new main'])
    );
  });

  test('resolves method calls and names the enclosing function', () => {
    expect(refsOf('Widget.render')).toEqual(
      expect.arrayContaining(['lib/app.js:7 call main', 'lib/fancy.js:4 call FancyWidget.render'])
    );
    const [makeWidget] = callersQuery(model, 'makeWidget', {});
    expect(makeWidget.callers).toEqual([
      { file: 'lib/app.js', caller: 'main', tags: ['call'], lines: [6] },
    ]);
  });

  test('reports file dependencies, definitions and suggestions', () => {
    const deps = depsQuery(model, 'lib/app.js');
    expect(deps.files.map(f => [f.file, f.required])).toEqual([
      ['lib/fancy.js', true],
      ['lib/widget.js', true],
    ]);
    expect(dependentsQuery(model, 'widget.js').dependents.map(d => d.file)).toEqual([
      'lib/app.js',
      'lib/fancy.js',
    ]);
    const names = symbolsQuery(model, 'lib/widget.js').symbols.map(s => `${s.kind} ${s.name}`);
    expect(names).toEqual(
      expect.arrayContaining(['class Widget', 'method Widget.render', 'function makeWidget'])
    );
    expect(suggestNames(model, 'Widgetz')).toContain('Widget');
    expect(() => depsQuery(model, 'nope.js')).toThrow(/not in the index/);
  });

  test('formats results as text', () => {
    const text = formatRefs(refsQuery(model, 'Widget', { file: 'lib/widget.js' }), 2);
    expect(text).toContain('Widget (class) lib/widget.js:1');
    expect(text).toContain('6 references in 3 files: 2 require, 2 new, 1 extends, 1 export');
    expect(text).toContain('... 4 more (use --limit 0 to show all)');
    expect(formatDeps(depsQuery(model, 'lib/fancy.js'))).toContain(
      'lib/widget.js  (require/import)'
    );
  });

  test('the musubi-code CLI answers queries and reports status', () => {
    const refs = cli(root, ['refs', 'makeWidget']);
    expect(refs.status).toBe(0);
    expect(refs.stdout).toContain('makeWidget (function) lib/widget.js:9');
    expect(refs.stdout).toMatch(/6\s+call\s+in main/);

    const deps = cli(root, ['deps', 'lib/app.js', '--json']);
    expect(JSON.parse(deps.stdout).files.map(f => f.file)).toEqual([
      'lib/fancy.js',
      'lib/widget.js',
    ]);

    const missing = cli(root, ['refs', 'Widgetz']);
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain('Similar names: Widget');

    const status = cli(root, ['status']);
    expect(status.status).toBe(0);
    expect(status.stdout).toContain('(fresh)');

    const hook = cli(
      root,
      ['index', '--hook'],
      JSON.stringify({
        hook_event_name: 'PostToolUse',
        tool_name: 'Edit',
        tool_input: { file_path: 'README.md' },
      })
    );
    expect(hook.status).toBe(0);
    expect(hook.stdout).toBe('');
  }, 120000);

  test('marks the index stale after a source edit', () => {
    const file = path.join(root, 'lib', 'app.js');
    fs.appendFileSync(file, '// edited\n');
    const future = new Date(Date.now() + 60000);
    fs.utimesSync(file, future, future);
    expect(getFreshness(loadConfig(root)).state).toBe('stale');
  });
});

describe('musubi-code setup command', () => {
  test('configures a project and reports the changes', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-setup-cli-'));
    try {
      fs.writeFileSync(path.join(root, 'package.json'), '{}');
      const dry = cli(root, ['setup', '--dry-run']);
      expect(dry.status).toBe(0);
      expect(dry.stdout).toContain('would be created');
      expect(fs.existsSync(path.join(root, '.gitignore'))).toBe(false);

      const real = cli(root, ['setup', '--agent', 'claude-code', 'cursor']);
      expect(real.status).toBe(0);
      expect(real.stdout).toContain('created            .claude/skills/code-references/SKILL.md');
      expect(fs.existsSync(path.join(root, 'AGENTS.md'))).toBe(true);
      expect(real.stdout).toContain('musubi-code index');

      const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-nojs-'));
      const skipped = cli(empty, ['setup']);
      expect(skipped.status).toBe(1);
      expect(skipped.stdout).toContain('not set up');
      fs.rmSync(empty, { recursive: true, force: true });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
