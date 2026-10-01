/**
 * Constitutional paths
 *
 * Path classification shared by the constitutional rules: code, test, route handler,
 * requirements document, core and source files (Article I terms, Article VII terms).
 *
 * Requirement: I-1, I-3, VII-4 (steering/rules/constitution.md)
 */

'use strict';

const path = require('path');

const CODE_FILE_PATTERN = /\.[cm]?[jt]sx?$/;

const TEST_FILE_PATTERN = /\.(test|spec)\.[cm]?[jt]sx?$/;

// `import x from 'y'`, `import 'y'`, `export { a } from 'y'`, `require('y')`, `import('y')`
const IMPORT_PATTERN =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const ROUTE_HANDLER_PATTERN = /(^|\/)route\.[cm]?[jt]sx?$|(^|\/)pages\/api\/.+\.[cm]?[jt]sx?$/;

const REQUIREMENTS_DOC_PATTERN = /(^|\/)[^/]*requirements[^/]*\.md$/i;

const INTEGRATION_TEST_PATTERN = /(^|[/._-])integration([/._-])|\.int\.(test|spec)\./i;

// Generated, vendored and template code is not source code (Article VII terms)
const NON_SOURCE_DIR_PATTERN =
  /(^|\/)(templates|fixtures|vendor|generated|node_modules|dist|build|coverage)\//;

/**
 * Normalize a path to forward slashes
 * @param {string} p - Path
 * @returns {string} Normalized path
 */
function toPosix(p) {
  return String(p || '')
    .split(path.sep)
    .join('/')
    .replace(/\\/g, '/');
}

/**
 * Whether a project-relative path lies in one of the given directories
 * @param {string} rel - Project-relative path
 * @param {string[]} dirs - Directories
 * @returns {boolean}
 */
function isUnder(rel, dirs = []) {
  return dirs.some(dir => rel === dir || rel.startsWith(`${dir}/`));
}

/**
 * Whether a path is a JavaScript or TypeScript file
 * @param {string} rel - Project-relative path
 * @returns {boolean}
 */
const isCodeFile = rel => CODE_FILE_PATTERN.test(rel);

/**
 * Whether a path is a test file (*.test.*, *.spec.*)
 * @param {string} rel - Project-relative path
 * @returns {boolean}
 */
const isTestFile = rel => TEST_FILE_PATTERN.test(rel);

/**
 * Whether a path is an HTTP route handler (route.ts, pages/api/*)
 * @param {string} rel - Project-relative path
 * @returns {boolean}
 */
const isRouteHandler = rel => ROUTE_HANDLER_PATTERN.test(rel);

/**
 * Whether a path is a requirements document (*requirements*.md)
 * @param {string} rel - Project-relative path
 * @returns {boolean}
 */
const isRequirementsDoc = rel => REQUIREMENTS_DOC_PATTERN.test(rel);

/**
 * Whether a path is an integration test
 * @param {string} rel - Project-relative path
 * @returns {boolean}
 */
const isIntegrationTest = rel => isTestFile(rel) && INTEGRATION_TEST_PATTERN.test(rel);

/**
 * Project-relative targets of the relative and aliased (@/, ~/, src/) imports in a file
 * @param {string} fileRel - Project-relative path of the importing file
 * @param {string} content - File content
 * @param {Object} [options] - { srcExists }: whether @/ maps to src/
 * @returns {string[]} Import targets
 */
function resolveImports(fileRel, content, { srcExists = true } = {}) {
  const targets = new Set();
  for (const match of String(content).matchAll(IMPORT_PATTERN)) {
    const specifier = match[1] || match[2] || match[3];
    let target = null;
    if (specifier.startsWith('.')) {
      target = path.posix.normalize(path.posix.join(path.posix.dirname(fileRel), specifier));
    } else if (/^[@~]\//.test(specifier)) {
      target = (srcExists ? 'src/' : '') + specifier.slice(2);
    } else if (specifier.startsWith('src/')) {
      target = specifier;
    }
    if (target && !target.startsWith('..')) {
      targets.add(target.replace(/\/$/, ''));
    }
  }
  return [...targets];
}

/**
 * Whether a file is core code: under a core path, outside delivery and adapter paths
 * @param {string} rel - Project-relative path
 * @param {Object} profile - Profile configuration (corePaths, deliveryPaths, adapterPaths)
 * @returns {boolean}
 */
function isCoreFile(rel, profile) {
  return (
    Boolean(profile) &&
    isUnder(rel, profile.corePaths || []) &&
    !isUnder(rel, profile.deliveryPaths || []) &&
    !isUnder(rel, profile.adapterPaths || [])
  );
}

/**
 * Whether a file is a source file in the sense of Article VII: a code file that is not a test,
 * a type declaration, or a generated, vendored or template file; with a profile, it also lies
 * in a core or delivery path
 * @param {string} rel - Project-relative path
 * @param {Object} [profile] - Profile configuration
 * @returns {boolean}
 */
function isSourceFile(rel, profile) {
  if (!isCodeFile(rel) || isTestFile(rel) || /\.d\.[cm]?ts$/.test(rel)) return false;
  if (NON_SOURCE_DIR_PATTERN.test(rel)) return false;
  if (!profile) return true;
  return isUnder(rel, [...(profile.corePaths || []), ...(profile.deliveryPaths || [])]);
}

/**
 * Whether VII-6 (imports per file) exempts a file: index files collect a module's public API
 * @param {string} rel - Project-relative path
 * @returns {boolean}
 */
function isImportLimitExempt(rel) {
  return /^index\./.test(path.posix.basename(rel));
}

module.exports = {
  IMPORT_PATTERN,
  TEST_FILE_PATTERN,
  toPosix,
  isUnder,
  isCodeFile,
  isTestFile,
  isRouteHandler,
  isRequirementsDoc,
  isIntegrationTest,
  isCoreFile,
  isSourceFile,
  isImportLimitExempt,
  resolveImports,
};
