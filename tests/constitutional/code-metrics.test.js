/**
 * Code metrics and the code-size rules of the constitution
 *
 * Article VII: VII-4 (lines of code per file), VII-5 (lines of code per function),
 * VII-6 (distinct imports per file). Article I: I-5 (doc comments on core exports).
 */

const {
  measureCode,
  checkCodeSize,
  checkPublicInterfaceDocs,
} = require('../../src/constitutional/articles');

const limits = { maxFileLines: 500, maxFunctionLines: 50, maxImports: 10 };
const ids = findings => findings.map(f => f.requirement);
const lines = n => Array.from({ length: n }, (_, i) => `  total += ${i};`).join('\n');

describe('measureCode', () => {
  it('counts lines of code without blank and comment-only lines', () => {
    const content = [
      '// header comment',
      '/**',
      ' * Block comment',
      ' */',
      '',
      'const a = 1; // trailing comment',
      '/* inline */ const b = 2;',
      '   ',
      'const c = `multi',
      'line template`;',
    ].join('\n');

    expect(measureCode(content).linesOfCode).toBe(4);
  });

  it('ignores braces and comment markers inside strings, templates and regular expressions', () => {
    const content = [
      'function a() {',
      '  const s = \'}\' + "{" + `}${ { x: 1 }.x }{`;',
      '  const r = /\\{\\{NAME\\}\\}/g;',
      "  const url = 'http://example.com/*';",
      '  return s.replace(r, url);',
      '}',
      'const after = 1;',
    ].join('\n');

    const { functions } = measureCode(content);
    expect(functions).toEqual([{ name: 'a', startLine: 1, endLine: 6, linesOfCode: 6 }]);
  });

  it('finds declarations, expressions, arrow functions with block bodies and methods', () => {
    const content = [
      'async function load(id) {',
      '  return id;',
      '}',
      'const save = async (item) => {',
      '  return item;',
      '};',
      'const short = x => x * 2;',
      'class Store {',
      '  static create() {',
      '    return new Store();',
      '  }',
      '  async get(key) {',
      '    if (key) {',
      '      return key;',
      '    }',
      '  }',
      '}',
      'module.exports = {',
      '  handler: function (req) {',
      '    return req;',
      '  },',
      '  run(args) {',
      '    return args;',
      '  },',
      '};',
    ].join('\n');

    const names = measureCode(content).functions.map(f => `${f.name}:${f.startLine}-${f.endLine}`);
    expect(names).toEqual([
      'load:1-3',
      'save:4-6',
      'create:9-11',
      'get:12-16',
      'handler:19-21',
      'run:22-24',
    ]);
  });

  it('counts nested functions in the outer function and on their own', () => {
    const content = [
      'function outer() {',
      '  function inner() {',
      '    return 1;',
      '  }',
      '  return inner();',
      '}',
    ].join('\n');
    const { functions } = measureCode(content);
    expect(functions.map(f => [f.name, f.linesOfCode])).toEqual([
      ['outer', 6],
      ['inner', 3],
    ]);
  });

  it('counts distinct imports and ignores imports in comments', () => {
    const content = [
      "import fs from 'fs';",
      "import { join } from 'path';",
      "import type { T } from './types';",
      "export { a } from './a';",
      "const b = require('./b');",
      "const again = require('fs');",
      "const lazy = await import('./lazy');",
      "// const old = require('old-module');",
      "/* import x from 'commented'; */",
    ].join('\n');

    expect([...measureCode(content).imports]).toEqual([
      'fs',
      'path',
      './types',
      './a',
      './b',
      './lazy',
    ]);
  });
});

describe('Article VII: checkCodeSize', () => {
  it('reports a file over the file limit (VII-4)', () => {
    const content = `function f() {\n  let total = 0;\n}\n${'const x = 1;\n'.repeat(600)}`;
    const findings = checkCodeSize({ rel: 'src/big.js', content, limits });
    expect(ids(findings)).toEqual(['VII-4']);
    expect(findings[0].message).toContain('603 lines of code');
    expect(findings[0].message).toContain('limit 500');
  });

  it('reports functions over the function limit with their line (VII-5)', () => {
    const content = `function ok() {\n${lines(10)}\n}\nfunction long() {\n${lines(55)}\n}\n`;
    const findings = checkCodeSize({ rel: 'src/a.js', content, limits });
    expect(ids(findings)).toEqual(['VII-5']);
    expect(findings[0].message).toContain('long (line 13, 57 lines of code, limit 50)');
  });

  it('reports a file with too many imports, except index files (VII-6)', () => {
    const content = Array.from({ length: 11 }, (_, i) => `const m${i} = require('m${i}');`).join(
      '\n'
    );
    expect(ids(checkCodeSize({ rel: 'src/a.js', content, limits }))).toEqual(['VII-6']);
    expect(checkCodeSize({ rel: 'src/index.js', content, limits })).toEqual([]);
  });

  it('applies configured limits', () => {
    const content = `function f() {\n${lines(30)}\n}`;
    const custom = { ...limits, maxFunctionLines: 20 };
    expect(ids(checkCodeSize({ rel: 'src/a.js', content, limits: custom }))).toEqual(['VII-5']);
  });

  it('skips tests, type declarations, templates and non-code files', () => {
    const content = `function f() {\n${lines(80)}\n}`;
    for (const rel of ['src/a.test.js', 'src/types.d.ts', 'src/templates/x.js', 'docs/a.md']) {
      expect(checkCodeSize({ rel, content, limits })).toEqual([]);
    }
  });

  it('marks code-size findings as definite and not gated', () => {
    const content = `function f() {\n${lines(80)}\n}`;
    const [finding] = checkCodeSize({ rel: 'src/a.js', content, limits });
    expect(finding.definite).toBe(true);
    expect(finding.gate).toBeFalsy();
  });
});

describe('Article I: checkPublicInterfaceDocs (I-5)', () => {
  const profile = { profile: 'cli', corePaths: ['src'], deliveryPaths: ['bin'], adapterPaths: [] };

  it('reports ESM exports without a doc comment', () => {
    const content = [
      '/**',
      ' * Documented',
      ' */',
      'export function documented() {}',
      '',
      'export async function missing() {}',
      'export class Store {}',
      'export const helper = () => {};',
      'export const VALUE = 1;',
    ].join('\n');

    const findings = checkPublicInterfaceDocs({ rel: 'src/a.ts', content, profile });
    expect(ids(findings)).toEqual(['I-5']);
    expect(findings[0].advisory).toBe(true);
    expect(findings[0].message).toContain('missing, Store, helper');
    expect(findings[0].message).not.toContain('VALUE');
  });

  it('reports CommonJS exports without a doc comment', () => {
    const content = [
      '/** Loads */',
      'function load() {}',
      '',
      '// not a doc comment',
      'function save() {}',
      'class Repo {}',
      'const CONSTANT = 3;',
      'module.exports = { load, save, Repo, CONSTANT, alias: load };',
    ].join('\n');

    const findings = checkPublicInterfaceDocs({ rel: 'src/a.js', content, profile });
    expect(findings[0].message).toContain('save, Repo');
    expect(findings[0].message).not.toContain('load,');
  });

  it('finds the doc comment when its text contains comment markers', () => {
    const content = [
      '/**',
      ' * Matches route handlers (route.ts, pages/api/*)',
      ' */',
      'const isRoute = rel => /route/.test(rel);',
      '',
      '// @deprecated',
      'function legacy() {}',
      '',
      'module.exports = { isRoute, legacy };',
    ].join('\n');

    const findings = checkPublicInterfaceDocs({ rel: 'src/a.js', content, profile });
    expect(findings[0].names).toEqual(['legacy']);
  });

  it('only checks core modules', () => {
    const content = 'export function missing() {}';
    expect(checkPublicInterfaceDocs({ rel: 'bin/cli.js', content, profile })).toEqual([]);
    expect(checkPublicInterfaceDocs({ rel: 'src/a.test.js', content, profile })).toEqual([]);
  });
});
