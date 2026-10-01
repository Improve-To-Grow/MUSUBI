/**
 * Project Files
 *
 * File-system helpers for the constitutional validator: globbing relative to the project root
 * (forward-slash patterns on every platform), path and test lookups, and package.json scripts.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { isUnder, resolveImports } = require('../constitutional/articles');

const CODE_EXTENSIONS = '{js,jsx,ts,tsx,mjs,cjs,mts,cts}';
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/.git/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
];
const TEST_DIR_NAMES = ['tests', 'test', '__tests__', 'spec'];
// File arguments in package.json scripts, e.g. `node scripts/seed.js`
const SCRIPT_FILE_PATTERN =
  /(?:^|[\s=])((?:\.{1,2}\/)?[\w@.\-/]+\.(?:js|cjs|mjs|ts|cts|mts|sh|py))(?=$|[\s;&|)])/g;

/**
 * Shorten a list of items for a finding message
 * @param {string[]} items - Items
 * @param {number} [max=5] - Items to show
 * @returns {string}
 */
function summarize(items, max = 5) {
  const shown = items.slice(0, max).join(', ');
  return items.length > max ? `${shown} (+${items.length - max} more)` : shown;
}

/**
 * File-system access relative to a project root
 */
class ProjectFiles {
  /**
   * @param {string} projectRoot - Project root
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
  }

  /**
   * Glob relative to the project root; results are absolute paths
   * @param {string} pattern - Forward-slash pattern
   * @param {Object} [options] - glob options; `ignore` adds to the default ignores
   * @returns {string[]}
   */
  glob(pattern, options = {}) {
    return glob.sync(pattern, {
      cwd: this.projectRoot,
      absolute: true,
      nodir: true,
      dot: false,
      ...options,
      ignore: [...DEFAULT_IGNORE, ...(options.ignore || [])],
    });
  }

  /**
   * Code files under a directory, as { file, rel }
   * @param {string} dir - Project-relative directory
   * @returns {Array<{file: string, rel: string}>}
   */
  codeFiles(dir) {
    return this.glob(`${dir}/**/*.${CODE_EXTENSIONS}`).map(file => ({ file, rel: this.rel(file) }));
  }

  /**
   * Project-relative path with forward slashes
   * @param {string} file - Absolute path
   * @returns {string}
   */
  rel(file) {
    return path.relative(this.projectRoot, file).split(path.sep).join('/');
  }

  /**
   * @param {string} rel - Project-relative path
   * @returns {boolean} Whether it is a directory
   */
  isDirectory(rel) {
    const fullPath = path.join(this.projectRoot, rel);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  }

  /**
   * @param {string} rel - Project-relative path
   * @returns {boolean} Whether it exists
   */
  exists(rel) {
    return fs.existsSync(path.join(this.projectRoot, rel));
  }

  /**
   * @param {string} file - Path
   * @returns {string} Content, or '' when unreadable
   */
  read(file) {
    try {
      return fs.readFileSync(file, 'utf-8');
    } catch {
      return '';
    }
  }

  /**
   * @returns {Object|null} package.json of the project
   */
  readPackageJson() {
    const pkgPath = path.join(this.projectRoot, 'package.json');
    return fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : null;
  }

  /**
   * @returns {string[]} Test directories at the project root
   */
  testDirs() {
    return TEST_DIR_NAMES.filter(dir => this.isDirectory(dir));
  }

  /**
   * Whether a core module has tests: inside the module, or in a root test directory that
   * mirrors the module name
   * @param {string} moduleRel - Project-relative module directory
   * @returns {boolean}
   */
  hasTests(moduleRel) {
    const name = path.posix.basename(moduleRel);
    if (TEST_DIR_NAMES.some(dir => this.isDirectory(`${moduleRel}/${dir}`))) return true;
    if (this.glob(`${moduleRel}/**/*.{test,spec}.${CODE_EXTENSIONS}`).length > 0) return true;

    return this.testDirs().some(
      dir =>
        this.isDirectory(`${dir}/${name}`) ||
        this.glob(`${dir}/**/${name}{,.*,-*,_*}.{test,spec}.${CODE_EXTENSIONS}`).length > 0
    );
  }

  /**
   * Project-relative targets of the relative and aliased imports in a file
   * @param {string} fileRel - Project-relative path of the importing file
   * @param {string} content - File content
   * @returns {string[]}
   */
  resolvedImports(fileRel, content) {
    return resolveImports(fileRel, content, { srcExists: this.isDirectory('src') });
  }

  /**
   * package.json scripts whose file arguments do not exist, as "name → file"
   * @param {Object} scripts - package.json scripts
   * @returns {string[]}
   */
  findMissingScriptFiles(scripts) {
    const missing = [];
    for (const [name, command] of Object.entries(scripts)) {
      if (typeof command !== 'string') continue;
      for (const match of command.matchAll(SCRIPT_FILE_PATTERN)) {
        const file = match[1];
        if (file.includes('*') || file.startsWith('node_modules/')) continue;
        if (!this.exists(file)) missing.push(`${name} → ${file.replace(/^\.\//, '')}`);
      }
    }
    return missing;
  }
}

module.exports = { ProjectFiles, CODE_EXTENSIONS, isUnder, summarize };
