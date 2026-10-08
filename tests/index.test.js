/**
 * Package Entry Point Tests (CHANGE-003)
 *
 * `src/index.js` is the package `main`. Every export is a defined value (REQ-PKG-001), classes
 * are exported under the names they declare (REQ-PKG-002), the names the entry point advertised
 * before CHANGE-003 stay as deprecated aliases (REQ-PKG-003), and every name the documentation
 * and agent templates destructure from `require('musubi-sdd')` resolves (REQ-PKG-004).
 */

const fs = require('fs');
const path = require('path');

// @octokit/rest 22 is ESM only, and Jest cannot require() ESM before Node 24.9. The entry point
// loads it through src/integrations/github-client.js; no test here calls GitHubClient.
jest.mock('@octokit/rest', () => ({ Octokit: class Octokit {} }));

const pkg = require('../src');

const ROOT = path.resolve(__dirname, '..');
const NAMESPACES = ['performance', 'enterprise', 'ai'];

// [export name, source module under src/, name the module exports it under]
// 'default' means the module assigns the class to module.exports.
const REPAIRED_EXPORTS = [
  ['ASTExtractor', 'analyzers/ast-extractor', 'ASTExtractor'],
  ['GapDetector', 'analyzers/gap-detector', 'default'],
  ['TraceabilityAnalyzer', 'analyzers/traceability', 'default'],
  ['DesignGenerator', 'generators/design', 'default'],
  ['RequirementsGenerator', 'generators/requirements', 'default'],
  ['TasksGenerator', 'generators/tasks', 'default'],
  ['CICDManager', 'integrations/cicd', 'CICDManager'],
  ['TraceabilityMatrixReport', 'reporters/traceability-matrix-report', 'TraceabilityMatrixReport'],
  ['ConstitutionValidator', 'validators/constitution', 'default'],
  ['AgentMemoryManager', 'managers/agent-memory', 'AgentMemoryManager'],
  ['ChangeManager', 'managers/change', 'default'],
];

const DEPRECATED_ALIASES = {
  AstExtractor: 'ASTExtractor',
  TaskGenerator: 'TasksGenerator',
  CICDIntegration: 'CICDManager',
  TraceabilityMatrixReporter: 'TraceabilityMatrixReport',
  Constitution: 'ConstitutionValidator',
  AgentMemory: 'AgentMemoryManager',
};

// const { A, B } = require('musubi-sdd')  or  require('musubi-sdd').performance
const DESTRUCTURED_REQUIRE =
  /const\s*\{([^}]*)\}\s*=\s*require\(\s*['"]musubi-sdd['"]\s*\)(?:\.(\w+))?/g;

function* markdownFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* markdownFiles(full);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield full;
    }
  }
}

function documentedNames() {
  const files = [
    path.join(ROOT, 'docs', 'API-REFERENCE.md'),
    ...markdownFiles(path.join(ROOT, 'src', 'templates')),
  ];
  const references = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const match of content.matchAll(DESTRUCTURED_REQUIRE)) {
      const [, list, namespace] = match;
      const line = content.slice(0, match.index).split('\n').length;
      const where = `${path.relative(ROOT, file).split(path.sep).join('/')}:${line}`;
      for (const binding of list.split(',')) {
        const name = binding.split(':')[0].trim();
        if (name) {
          references.push({ where, namespace, name });
        }
      }
    }
  }

  return references;
}

describe('package entry point', () => {
  describe('defined exports (REQ-PKG-001)', () => {
    it('binds every top-level export to a defined value', () => {
      expect(Object.keys(pkg).filter(key => pkg[key] === undefined)).toEqual([]);
    });

    it.each(NAMESPACES)('binds every member of %s to a defined value', namespace => {
      const members = pkg[namespace];
      expect(Object.keys(members).filter(key => members[key] === undefined)).toEqual([]);
    });
  });

  describe('canonical names (REQ-PKG-002)', () => {
    it.each(REPAIRED_EXPORTS)('exports %s from src/%s', (name, modulePath, exportedAs) => {
      const mod = require(`../src/${modulePath}`);
      const source = exportedAs === 'default' ? mod : mod[exportedAs];

      expect(typeof source).toBe('function');
      expect(pkg[name]).toBe(source);
    });

    it('exports every class and function under the name it declares', () => {
      const mismatches = Object.entries(pkg)
        .filter(([key, value]) => typeof value === 'function' && !(key in DEPRECATED_ALIASES))
        .filter(([key, value]) => value.name !== key)
        .map(([key, value]) => `${key} -> ${value.name}`);

      expect(mismatches).toEqual([]);
    });
  });

  describe('deprecated aliases (REQ-PKG-003)', () => {
    it.each(Object.entries(DEPRECATED_ALIASES))('keeps %s as an alias of %s', (alias, name) => {
      expect(typeof pkg[name]).toBe('function');
      expect(pkg[alias]).toBe(pkg[name]);
    });
  });

  describe('documented API (REQ-PKG-004)', () => {
    it('resolves every name the docs and agent templates destructure from the package', () => {
      const references = documentedNames();
      const unresolved = references
        .filter(({ namespace, name }) => {
          const scope = namespace ? pkg[namespace] : pkg;
          return !scope || scope[name] === undefined;
        })
        .map(({ where, namespace, name }) => `${where} ${namespace ? `${namespace}.` : ''}${name}`);

      expect(references.length).toBeGreaterThan(0);
      expect(unresolved).toEqual([]);
    });
  });
});
