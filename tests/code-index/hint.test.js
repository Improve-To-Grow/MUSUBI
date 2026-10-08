/**
 * Tests for src/code-index/hint.js: the PreToolUse reminder for grep searches of names that the
 * code index defines (CHANGE-005, REQ-NAV-005, REQ-NAV-006)
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const { parseSearches, symbolNames, runHint } = require('../../src/code-index/hint');

const entry = (name, kind, file, line) => ({ name, kind, file, line });

const NAMES = {
  version: 1,
  names: {
    ErrorHandler: [entry('ErrorHandler', 'class', 'src/orchestration/error-handler.js', 613)],
    PatternRegistry: [
      entry('PatternRegistry', 'class', 'src/orchestration/pattern-registry.js', 106),
    ],
    save: [
      entry('OrderService.save', 'method', 'src/services/order.js', 30),
      entry('UserService.save', 'method', 'src/services/user.js', 12),
    ],
    execute: Array.from({ length: 7 }, (_, i) =>
      entry(`Runner${i}.execute`, 'method', `src/runners/r${i}.js`, i + 1)
    ),
  },
};

function makeProject(names = NAMES) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-hint-'));
  const write = (rel, content) => {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  };
  write('package.json', JSON.stringify({ scip: { roots: ['src'], exclude: ['src/templates'] } }));
  write('src/a.js', 'module.exports = 1;\n');
  write('src/templates/t.js', '');
  write('docs/guide.md', '# guide\n');
  if (names !== null) {
    write('.scip/names.json', typeof names === 'string' ? names : JSON.stringify(names));
  }
  return root;
}

const grep = (pattern, extra = {}) =>
  JSON.stringify({
    hook_event_name: 'PreToolUse',
    tool_name: 'Grep',
    tool_input: { pattern, ...extra },
  });
const bash = command =>
  JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command } });
const powershell = command =>
  JSON.stringify({
    hook_event_name: 'PreToolUse',
    tool_name: 'PowerShell',
    tool_input: { command },
  });

describe('parseSearches', () => {
  test('reads the Grep tool input', () => {
    expect(
      parseSearches({
        tool_name: 'Grep',
        tool_input: { pattern: 'X', path: 'src', glob: '*.js', type: 'js' },
      })
    ).toEqual([{ pattern: 'X', paths: ['src'], globs: ['*.js'], types: ['js'] }]);
  });

  test('finds grep, rg and git grep in shell commands', () => {
    const parse = command => parseSearches({ tool_name: 'Bash', tool_input: { command } });
    expect(parse('cd /repo && grep -rn "ErrorHandler" src bin | head -5')).toEqual([
      { pattern: 'ErrorHandler', paths: ['src', 'bin'], globs: [], types: [] },
    ]);
    expect(parse("grep -rnE 'class (A|B)' --include=*.js src")).toEqual([
      { pattern: 'class (A|B)', paths: ['src'], globs: ['*.js'], types: [] },
    ]);
    expect(parse('grep -rn -e Foo -e Bar -A 2 src').map(s => s.pattern)).toEqual(['Foo', 'Bar']);
    expect(parse('rg -n -t js "PatternRegistry" src')).toEqual([
      { pattern: 'PatternRegistry', paths: ['src'], globs: [], types: ['js'] },
    ]);
    expect(parse("rg -g '*.md' ErrorHandler")[0].globs).toEqual(['*.md']);
    expect(parse('git grep -n checkEarsFormat -- src')).toEqual([
      { pattern: 'checkEarsFormat', paths: ['src'], globs: [], types: [] },
    ]);
  });

  test('ignores commands without a search and greps that filter piped output', () => {
    const parse = command => parseSearches({ tool_name: 'Bash', tool_input: { command } });
    expect(parse('npm test')).toEqual([]);
    expect(parse('git log --oneline | grep fix')).toEqual([]);
    expect(parse('musubi-code refs X | grep -c src')).toEqual([]);
  });

  test('reads Select-String in PowerShell commands, keeping backslashes', () => {
    const parse = command => parseSearches({ tool_name: 'PowerShell', tool_input: { command } });
    expect(parse("Select-String -Pattern 'ErrorHandler' -Path src\\orchestration\\*.js")).toEqual([
      { pattern: 'ErrorHandler', paths: ['src\\orchestration\\*.js'], globs: [], types: [] },
    ]);
    expect(parse('sls PatternRegistry src\\a.js')[0]).toMatchObject({
      pattern: 'PatternRegistry',
      paths: ['src\\a.js'],
    });
    expect(parse('Get-Content x.log | Select-String error')).toEqual([]);
  });
});

describe('symbolNames', () => {
  test.each([
    ['ErrorHandler', ['ErrorHandler']],
    ['\\bErrorHandler\\b', ['ErrorHandler']],
    ['class ErrorHandler', ['ErrorHandler']],
    ['class\\s+ErrorHandler', ['ErrorHandler']],
    ['^function checkEarsFormat\\(', ['checkEarsFormat']],
    ['new ErrorHandler', ['ErrorHandler']],
    ['module\\.exports\\.ErrorHandler', ['ErrorHandler']],
    ['ErrorHandler|PatternRegistry', ['ErrorHandler', 'PatternRegistry']],
    ['class (ErrorHandler|PatternRegistry)', ['ErrorHandler', 'PatternRegistry']],
    ['UserService\\.save', ['UserService.save']],
    ['checkEarsFormat\\s*\\(', ['checkEarsFormat']],
  ])('%s names %j', (pattern, names) => {
    expect(symbolNames(pattern)).toEqual(names);
  });

  test.each(['TODO: remove', "require\\('x'\\)", 'foo bar', 'error.*handler', '', 'a|b c'])(
    '%j is a text search',
    pattern => {
      expect(symbolNames(pattern)).toBeNull();
    }
  );
});

describe('runHint', () => {
  let root;

  beforeEach(() => {
    root = makeProject();
  });

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  const context = raw => {
    const out = runHint(raw, { root });
    if (!out) return null;
    const parsed = JSON.parse(out);
    expect(parsed).not.toHaveProperty('decision');
    expect(parsed.hookSpecificOutput).not.toHaveProperty('permissionDecision');
    expect(parsed.hookSpecificOutput.hookEventName).toBe('PreToolUse');
    return parsed.hookSpecificOutput.additionalContext;
  };

  test('names the definition and the refs command for a Grep of a defined name', () => {
    const text = context(grep('\\bErrorHandler\\b'));
    expect(text).toContain('ErrorHandler (class) src/orchestration/error-handler.js:613');
    expect(text).toContain('`musubi-code refs ErrorHandler`');
    expect(text).toMatch(/grep/);
  });

  test('covers several names, shell commands and PowerShell', () => {
    const text = context(bash("grep -rnE 'ErrorHandler|PatternRegistry' src"));
    expect(text).toContain('ErrorHandler (class)');
    expect(text).toContain('PatternRegistry (class) src/orchestration/pattern-registry.js:106');
    expect(
      context(powershell("Select-String -Pattern 'PatternRegistry' -Path src\\*.js"))
    ).toContain('PatternRegistry (class)');
  });

  test('lists at most five definitions and narrows Owner.member', () => {
    const text = context(grep('execute'));
    expect(text.match(/\(method\)/g)).toHaveLength(5);
    expect(text).toContain('2 more');
    const save = context(grep('UserService\\.save'));
    expect(save).toContain('UserService.save (method) src/services/user.js:12');
    expect(save).not.toContain('OrderService');
  });

  test('uses the configured command in the text', () => {
    const out = JSON.parse(
      runHint(grep('ErrorHandler'), { root, command: 'node bin/musubi-code.js' })
    );
    expect(out.hookSpecificOutput.additionalContext).toContain(
      '`node bin/musubi-code.js refs ErrorHandler`'
    );
  });

  test('stays silent for text searches, unknown names and searches outside the index', () => {
    expect(runHint(grep('TODO: remove'), { root })).toBe('');
    expect(runHint(grep('NoSuchThing'), { root })).toBe('');
    expect(runHint(grep('toString'), { root })).toBe('');
    expect(runHint(grep('ErrorHandler', { path: 'docs' }), { root })).toBe('');
    expect(runHint(grep('ErrorHandler', { path: 'src/templates' }), { root })).toBe('');
    expect(runHint(grep('ErrorHandler', { glob: '*.md' }), { root })).toBe('');
    expect(runHint(grep('ErrorHandler', { glob: '**/*.{md,yml}' }), { root })).toBe('');
    expect(runHint(grep('ErrorHandler', { type: 'md' }), { root })).toBe('');
    expect(runHint(bash('grep -rn ErrorHandler docs storage'), { root })).toBe('');
    expect(runHint(bash('git log | grep ErrorHandler'), { root })).toBe('');
  });

  test('answers for the project root, an indexed directory, file or glob', () => {
    for (const extra of [
      {},
      { path: '.' },
      { path: 'src' },
      { path: path.join(root, 'src') },
      { path: 'src/a.js' },
      { glob: '*.js' },
      { type: 'js' },
    ]) {
      expect(context(grep('ErrorHandler', extra))).toContain('ErrorHandler (class)');
    }
  });

  test('stays silent and never throws without a usable names list or input', () => {
    expect(runHint('not json', { root })).toBe('');
    expect(runHint('', { root })).toBe('');
    expect(runHint(JSON.stringify({ tool_name: 'Grep' }), { root })).toBe('');
    for (const names of [null, '{ broken', JSON.stringify({ version: 99, names: {} })]) {
      const other = makeProject(names);
      try {
        expect(runHint(grep('ErrorHandler'), { root: other })).toBe('');
      } finally {
        fs.rmSync(other, { recursive: true, force: true });
      }
    }
  });

  test('answers within 0.5 s with a names list the size of this repository', () => {
    const names = {};
    for (let i = 0; i < 4000; i++) {
      names[`Name${i}`] = [entry(`Name${i}`, 'function', `src/m${i % 400}.js`, i)];
    }
    const big = makeProject({ version: 1, names });
    try {
      const started = Date.now();
      expect(runHint(grep('Name3999'), { root: big })).toContain('Name3999 (function)');
      expect(Date.now() - started).toBeLessThan(500);
    } finally {
      fs.rmSync(big, { recursive: true, force: true });
    }
  });
});
