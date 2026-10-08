/**
 * Tests for src/code-index/format.js: plain-text rendering for the musubi-code CLI
 */

const {
  plural,
  truncate,
  formatCallers,
  formatDependents,
  formatSymbols,
  formatStatus,
  formatSetup,
} = require('../../src/code-index/format');

describe('code-index format', () => {
  test('pluralises and truncates', () => {
    expect(plural(1, 'file')).toBe('1 file');
    expect(plural(2, 'file')).toBe('2 files');
    expect(truncate('abcdef', 4)).toBe('abc…');
    expect(truncate('abc', 4)).toBe('abc');
  });

  test('renders callers, including a symbol without callers', () => {
    const text = formatCallers([
      {
        name: 'makeWidget',
        kind: 'function',
        file: 'lib/widget.js',
        line: 9,
        callers: [{ file: 'lib/app.js', caller: 'main', tags: ['call'], lines: [6, 8] }],
      },
      { name: 'unused', kind: 'function', file: 'lib/x.js', line: 1, callers: [] },
    ]);
    expect(text).toContain('makeWidget (function) lib/widget.js:9');
    expect(text).toContain('  lib/app.js  main  [call] lines 6, 8');
    expect(text).toContain('  no callers');
  });

  test('renders dependents and symbols', () => {
    expect(
      formatDependents({
        file: 'lib/widget.js',
        dependents: [{ file: 'lib/app.js', required: true, symbols: ['Widget', 'makeWidget'] }],
      })
    ).toBe(
      '1 file depends on lib/widget.js:\n  lib/app.js  (require/import)  uses Widget, makeWidget'
    );
    expect(
      formatSymbols({
        file: 'lib/widget.js',
        symbols: [{ name: 'Widget', kind: 'class', line: 1 }],
      })
    ).toBe('lib/widget.js:\n      1  class        Widget');
  });

  test('renders index status with build details', () => {
    const text = formatStatus({
      state: 'stale',
      index: '.scip/index.scip',
      roots: ['src'],
      exclude: ['src/templates'],
      files: 10,
      meta: {
        builtAt: '2026-10-08T00:00:00.000Z',
        durationMs: 1200,
        files: 9,
        indexer: '0.4.0',
        tsconfig: '.scip/tsconfig.json',
      },
      building: true,
    });
    expect(text).toContain('index:   .scip/index.scip (stale)');
    expect(text).toContain('roots:   src (excluding src/templates)');
    expect(text).toContain('built:   2026-10-08T00:00:00.000Z in 1200 ms, 9 files');
    expect(text).toContain('build:   running');
  });

  test('renders setup results for real runs, dry runs and skipped projects', () => {
    const base = {
      agents: ['claude-code'],
      command: 'musubi-code',
      skippedReason: null,
      changes: [
        { file: '.gitignore', status: 'unchanged' },
        { file: 'CLAUDE.md', status: 'created' },
      ],
      warnings: ['settings.json is not valid JSON'],
    };
    expect(formatSetup({ ...base, dryRun: false })).toContain('  created            CLAUDE.md');
    const dry = formatSetup({ ...base, dryRun: true });
    expect(dry).toContain('would be created');
    expect(dry).toContain('  unchanged          .gitignore');
    expect(dry).toContain('warning: settings.json is not valid JSON');
    expect(formatSetup({ ...base, skippedReason: 'no package.json' })).toBe(
      'Code navigation not set up: no package.json'
    );
  });
});
