/**
 * Package Entry Point Tests (CHANGE-003)
 *
 * `src/index.js` is the package `main`. Every export is a defined value (REQ-PKG-001), classes
 * are exported under the names they declare (REQ-PKG-002), the names the entry point advertised
 * before CHANGE-003 stay as deprecated aliases (REQ-PKG-003), and every module and name the live
 * documentation imports from the package resolves (REQ-PKG-004, widened by CHANGE-004).
 */

const fs = require('fs');
const path = require('path');
const { ROOT, liveDocumentation, relative } = require('./helpers/live-documentation');

// @octokit/rest 22 is ESM only, and Jest cannot require() ESM before Node 24.9. The entry point
// loads it through src/integrations/github-client.js; no test here calls GitHubClient.
jest.mock('@octokit/rest', () => ({ Octokit: class Octokit {} }));

const pkg = require('../src');

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

// The name documentation uses to load the package: the ITG fork's name (REQ-DIST-001).
const PACKAGE = '@improve-to-grow/musubi-sdd';
const PACKAGE_PATTERN = PACKAGE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// const { A, B } = require('<package>[/subpath]')  or  require('<package>').performance
const DESTRUCTURED_REQUIRE = new RegExp(
  `const\\s*\\{([^}]*)\\}\\s*=\\s*require\\(\\s*['"]${PACKAGE_PATTERN}(?:/([^'"]+))?['"]\\s*\\)(?:\\.(\\w+))?`,
  'g'
);
// import { A, type B } from '<package>[/subpath]'
const NAMED_IMPORT = new RegExp(
  `import\\s*\\{([^}]*)\\}\\s*from\\s*['"]${PACKAGE_PATTERN}(?:/([^'"]+))?['"]()`,
  'g'
);

// `A`, `A: alias`, `A as alias`, `type A`; comments inside the braces are ignored.
function bindingNames(list) {
  return list
    .replace(/\/\/.*$/gm, '')
    .split(',')
    .map(binding =>
      binding
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s*:\s*|\s+as\s+/)[0]
        .trim()
    )
    .filter(Boolean);
}

// Every module and name the live documentation imports from the package. A subpath is a file
// path from the package root (the package has no `exports` map).
function documentedImports() {
  const references = [];

  for (const file of liveDocumentation()) {
    const content = fs.readFileSync(file, 'utf-8');
    for (const pattern of [DESTRUCTURED_REQUIRE, NAMED_IMPORT]) {
      for (const match of content.matchAll(pattern)) {
        const [, list, subpath = '', namespace] = match;
        const line = content.slice(0, match.index).split('\n').length;
        const where = `${relative(file)}:${line}`;
        for (const name of bindingNames(list)) {
          references.push({ where, subpath, namespace: namespace || undefined, name });
        }
      }
    }
  }

  return references;
}

// require(…musubi-sdd…) or import(…musubi-sdd…) whose argument the patterns above cannot read,
// for example a mangled quote. Such a call would otherwise drop out of the scan unnoticed.
function unreadableCalls() {
  const call = /\b(?:require|import)\(\s*([^)]*?)musubi-sdd/g;
  const offenders = [];

  for (const file of liveDocumentation()) {
    fs.readFileSync(file, 'utf-8')
      .split(/\r?\n/)
      .forEach((line, index) => {
        for (const [, prefix] of line.matchAll(call)) {
          if (!["'", '"'].some(quote => `${prefix}musubi-sdd` === `${quote}${PACKAGE}`)) {
            offenders.push(`${relative(file)}:${index + 1}: ${line.trim()}`);
          }
        }
      });
  }

  return offenders;
}

function resolvesModule(subpath) {
  if (!subpath) {
    return true;
  }
  try {
    require.resolve(path.join(ROOT, subpath));
    return true;
  } catch {
    return false;
  }
}

function loadModule(subpath) {
  return subpath ? require(path.join(ROOT, subpath)) : pkg;
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
    const references = documentedImports();

    it('finds imports of the package in the live documentation', () => {
      expect(references.length).toBeGreaterThan(0);
    });

    it('loads the package by its quoted name in every require() and import()', () => {
      expect(unreadableCalls()).toEqual([]);
    });

    it('loads every module the live documentation imports from the package', () => {
      const missing = references
        .filter(({ subpath }) => !resolvesModule(subpath))
        .map(({ where, subpath }) => `${where} ${PACKAGE}/${subpath}`);

      expect([...new Set(missing)]).toEqual([]);
    });

    it('resolves every name the live documentation imports from the package', () => {
      const unresolved = references
        .filter(({ subpath }) => resolvesModule(subpath))
        .filter(({ subpath, namespace, name }) => {
          const mod = loadModule(subpath);
          const scope = namespace ? mod[namespace] : mod;
          return !scope || scope[name] === undefined;
        })
        .map(
          ({ where, subpath, namespace, name }) =>
            `${where} ${subpath ? `${subpath} ` : ''}${namespace ? `${namespace}.` : ''}${name}`
        );

      expect(unresolved).toEqual([]);
    });
  });
});
