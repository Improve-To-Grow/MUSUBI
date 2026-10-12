/**
 * The scip-python preload shim (CHANGE-006, REQ-IDX-006): it rewrites exactly the invalid
 * `new RegExp(path.sep)` pattern of scip-python on Windows and leaves every other RegExp alone.
 * It runs in a child process, as `node -r` loads it, so the test's own RegExp is untouched.
 */

const path = require('path');
const { spawnSync } = require('child_process');

const SHIM = path.join(__dirname, '..', '..', 'src', 'code-index', 'scip-python-shim.js');

function withShim(script) {
  const result = spawnSync(process.execPath, ['-r', SHIM, '-e', script], {
    encoding: 'utf8',
    timeout: 30000,
  });
  expect(result.status).toBe(0);
  return result.stdout.trim();
}

describe('scip-python preload shim', () => {
  test('turns the lone backslash into a pattern for both separators', () => {
    const out = withShim(`
      const sep = new RegExp('\\\\', 'g');
      console.log(sep.source, 'a\\\\b/c'.replace(sep, '.'));
    `);
    expect(out).toBe('[\\\\/] a.b.c');
  });

  test('leaves other patterns, flags, literals and instanceof unchanged', () => {
    const out = withShim(`
      const re = new RegExp('a+', 'i');
      console.log(re.test('AA'), re.flags, /x/ instanceof RegExp, RegExp('b').test('b'));
      try { new RegExp('('); console.log('no error'); } catch (e) { console.log(e.constructor.name); }
    `);
    expect(out).toBe('true i true true\nSyntaxError');
  });
});
