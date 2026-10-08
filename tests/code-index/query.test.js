/**
 * Tests for src/code-index/query.js: SCIP symbol grammar and reference tags
 */

const {
  parseSymbol,
  describeSymbol,
  splitQuery,
  classifyReference,
  metaNameMatches,
} = require('../../src/code-index/query');

const PREFIX = 'scip-typescript npm my-pkg 1.0.0 ';

describe('code-index query: SCIP symbol grammar', () => {
  test('parses a method symbol with file namespaces', () => {
    const parsed = parseSymbol(
      `${PREFIX}src/validators/\`constitution.js\`/ConstitutionValidator#validateAll().`
    );
    expect(parsed.package).toBe('my-pkg');
    expect(parsed.descriptors.map(d => d.kind)).toEqual([
      'namespace',
      'namespace',
      'namespace',
      'type',
      'method',
    ]);
    expect(describeSymbol(parsed)).toMatchObject({
      file: 'src/validators/constitution.js',
      kind: 'method',
      display: 'ConstitutionValidator.validateAll',
    });
  });

  test('handles backtick names with spaces, escaped header spaces and locals', () => {
    const meta = parseSymbol("scip-typescript npm my  pkg 1.0.0 src/`a.js`/`'login button'0`:");
    expect(meta.package).toBe('my pkg');
    expect(meta.descriptors[meta.descriptors.length - 1]).toEqual({
      name: "'login button'0",
      kind: 'meta',
    });
    expect(parseSymbol('local 12')).toBeNull();
    expect(parseSymbol('scip-typescript npm')).toBeNull();
  });

  test('describes constructors, functions, parameters, properties and modules', () => {
    const describe_ = s => describeSymbol(parseSymbol(PREFIX + s));
    expect(describe_('`a.js`/Foo#`<constructor>`().')).toMatchObject({
      kind: 'constructor',
      display: 'Foo.constructor',
    });
    expect(describe_('`a.js`/run().')).toMatchObject({ kind: 'function', display: 'run' });
    expect(describe_('`a.js`/run().(root)')).toMatchObject({ kind: 'parameter' });
    expect(describe_('`a.js`/Foo0:')).toMatchObject({ kind: 'property', display: 'Foo' });
    expect(describe_('`a.js`/Foo#bar.')).toMatchObject({ kind: 'property', display: 'Foo.bar' });
    expect(describe_('lib/`a.js`/')).toMatchObject({ kind: 'module', display: 'lib/a.js' });
  });

  test('splits queries and matches counter-suffixed property names', () => {
    expect(splitQuery('Foo.constructor')).toEqual(['Foo', '<constructor>']);
    expect(splitQuery('Foo#bar')).toEqual(['Foo', 'bar']);
    expect(metaNameMatches('Foo0', 'Foo')).toBe(true);
    expect(metaNameMatches('Foo12', 'Foo')).toBe(true);
    expect(metaNameMatches('Foobar0', 'Foo')).toBe(false);
  });
});

describe('code-index query: reference tags', () => {
  const tag = (source, token, kind = 'class') => {
    const lines = source.split('\n');
    for (let line = 0; line < lines.length; line++) {
      const col = lines[line].indexOf(token);
      if (col !== -1) return classifyReference(lines, line, col, col + token.length, kind);
    }
    throw new Error(`token ${token} not found`);
  };

  test.each([
    ['const w = new Widget(1);', 'Widget', 'new'],
    ['const w = new ui.Widget(1);', 'Widget', 'new'],
    ['class Fancy extends Widget {}', 'Widget', 'extends'],
    ['widget.render();', 'render', 'call'],
    ['render.call(this);', 'render', 'call'],
    ["const { Widget } = require('./widget');", 'Widget', 'require'],
    ["import { Widget } from './widget.js';", 'Widget', 'import'],
    ['module.exports = Widget;', 'Widget', 'export'],
    ['    super(name);', 'super', 'super'],
    ['const copy = Widget;', 'Widget', 'ref'],
  ])('%s -> %s is "%s"', (source, token, expected) => {
    expect(tag(source, token)).toBe(expected);
  });

  test('tags module strings and multi-line destructuring', () => {
    expect(tag("const w = require('./widget');", "'./widget'", 'module')).toBe('require');
    expect(tag("import x from './widget.js';", "'./widget.js'", 'module')).toBe('import');
    expect(tag("const x = await import('./widget.js');", "'./widget.js'", 'module')).toBe('import');
    expect(tag("const {\n  Widget,\n} = require('./widget');", '  Widget')).toBe('require');
    expect(tag('module.exports = {\n  Widget,\n};', '  Widget')).toBe('export');
  });
});
