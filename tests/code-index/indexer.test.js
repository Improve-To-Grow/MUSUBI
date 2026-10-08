/**
 * Tests for src/code-index/indexer.js: configuration, root detection, staleness, hook filtering
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  findProjectRoot,
  isJavaScriptProject,
  loadConfig,
  isIndexedPath,
  computeFingerprint,
  getFreshness,
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
    expect(isJavaScriptProject(root)).toBe(true);
    expect(isJavaScriptProject(path.join(root, 'tests'))).toBe(false);
  });

  test('fingerprint changes when an indexed file changes, not when others do', () => {
    const cfg = loadConfig(root);
    const before = computeFingerprint(cfg);
    expect(before.files).toBe(3);
    fs.writeFileSync(path.join(root, 'README.md'), 'changed');
    expect(computeFingerprint(cfg).hash).toBe(before.hash);
    fs.writeFileSync(path.join(root, 'src', 'a.js'), 'module.exports = 42;\n');
    expect(computeFingerprint(cfg).hash).not.toBe(before.hash);
  });

  test('reports a missing index without building one', () => {
    const cfg = loadConfig(root);
    expect(getFreshness(cfg).state).toBe('missing');
    expect(statusReport(cfg)).toMatchObject({
      state: 'missing',
      index: '.scip/index.scip',
      roots: ['src', 'tests'],
      files: 3,
      building: false,
    });
    expect(fs.existsSync(path.join(root, '.scip'))).toBe(false);
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
