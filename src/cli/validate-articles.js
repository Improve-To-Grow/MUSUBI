/**
 * `musubi validate`: quick checks of Articles I and II for the project profile
 *
 * Requirement: I-1, II-L1, II-A1, II-A3, P-2, P-3 (steering/rules/constitution.md)
 */

const fs = require('fs-extra');
const path = require('path');
const {
  ConstitutionLevelManager,
  ProjectProfile,
} = require('../validators/constitution-level-manager');

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'coverage']);

/**
 * Print the profile and the Article I and II checks
 * @param {Object} options - { cwd, verbose, chalk }
 * @returns {Promise<void>}
 */
async function printProfileArticles({ cwd, verbose, chalk }) {
  const profileConfig = await new ConstitutionLevelManager(cwd).getProfileConfig();
  const declaredNote = profileConfig.declared
    ? ''
    : ' (default; none declared in steering/project.yml)';
  console.log(chalk.white(`Profile: ${profileConfig.profile}${declaredNote}\n`));

  const out = { cwd, verbose, chalk, profileConfig };
  out.isApplication = profileConfig.profile === ProjectProfile.APPLICATION;
  out.corePaths = profileConfig.corePaths.filter(p => fs.existsSync(path.join(cwd, p)));
  out.coreModules = findCoreModules(cwd, out.corePaths);

  printTestableCore(out);
  console.log(chalk.white('\nArticle II: Automation Interface Mandate'));
  if (out.isApplication) {
    printHttpInterface(out);
  } else if (out.coreModules.length > 0) {
    printCliInterface(out);
  }
}

/**
 * Core modules: subdirectories of the core paths (lib/ and packages/ by default, P-3)
 * @private
 */
function findCoreModules(cwd, corePaths) {
  return corePaths.flatMap(corePath =>
    fs
      .readdirSync(path.join(cwd, corePath))
      .filter(name => fs.statSync(path.join(cwd, corePath, name)).isDirectory())
      .map(name => ({ corePath, name }))
  );
}

/**
 * Article I: core paths and core modules (I-1)
 * @private
 */
function printTestableCore({
  chalk,
  verbose,
  profileConfig,
  isApplication,
  corePaths,
  coreModules,
}) {
  console.log(chalk.white('Article I: Testable-Core Principle'));
  if (corePaths.length === 0) {
    const expected = profileConfig.corePaths.length
      ? profileConfig.corePaths.map(p => `${p}/`).join(', ')
      : 'none declared in steering/project.yml';
    console.log(chalk.yellow(`   ⚠️  No core path found (${expected})`));
  } else if (coreModules.length > 0) {
    const where = corePaths.map(p => (isApplication ? p : `${p}/`)).join(', ');
    const label = isApplication ? 'core module(s)' : 'libraries';
    console.log(chalk.green(`   ✅ ${coreModules.length} ${label} found in ${where}`));
    if (verbose) {
      coreModules.forEach(m => console.log(chalk.gray(`      - ${m.corePath}/${m.name}`)));
    }
  } else {
    console.log(chalk.yellow(`   ⚠️  No core modules found in ${corePaths.join(', ')}`));
  }
}

/**
 * Route handlers (route.* and pages/api/*) under a directory, as project-relative paths
 * @private
 */
function findRouteFiles(cwd, dir = cwd, inPagesApi = false) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(cwd, full).split(path.sep).join('/');
    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
      files.push(...findRouteFiles(cwd, full, inPagesApi || /(^|\/)pages\/api$/.test(rel)));
    } else if (
      /^route\.[cm]?[jt]sx?$/.test(entry.name) ||
      (inPagesApi && /\.[cm]?[jt]sx?$/.test(entry.name))
    ) {
      files.push(rel);
    }
  }
  return files;
}

/**
 * Article II for applications: the HTTP API is the automation interface, no CLI required
 * (II-A1, II-A3)
 * @private
 */
function printHttpInterface({ cwd, chalk, verbose }) {
  const routeFiles = findRouteFiles(cwd);
  if (routeFiles.length === 0) {
    console.log(
      chalk.yellow('   ⚠️  No route handlers found (e.g. src/app/api/<feature>/route.ts)')
    );
    return;
  }
  console.log(chalk.green(`   ✅ ${routeFiles.length} route handler(s) found; no CLI required`));
  if (verbose) routeFiles.forEach(file => console.log(chalk.gray(`      - ${file}`)));
}

/**
 * Article II for library and cli projects: each library provides a CLI (II-L1); a CLI in bin/
 * may delegate to the library API (II-L6)
 * @private
 */
function printCliInterface({ cwd, chalk, verbose, coreModules }) {
  let cliCount = 0;
  for (const { corePath, name } of coreModules) {
    const libPath = path.join(cwd, corePath, name);
    const hasCli = ['cli.ts', 'cli.js'].some(file => fs.existsSync(path.join(libPath, file)));
    if (hasCli) cliCount++;
    if (verbose) {
      console.log(
        hasCli ? chalk.green(`   ✅ ${name}/cli.ts`) : chalk.red(`   ❌ ${name}/cli.ts (missing)`)
      );
    }
  }

  const packageJsonPath = path.join(cwd, 'package.json');
  const hasSharedCli =
    fs.existsSync(path.join(cwd, 'bin')) ||
    (fs.existsSync(packageJsonPath) && Boolean(fs.readJsonSync(packageJsonPath).bin));
  const total = coreModules.length;
  if (cliCount === total) {
    console.log(chalk.green(`   ✅ All ${total} libraries have CLI interfaces`));
  } else if (hasSharedCli) {
    console.log(
      chalk.green(
        `   ✅ CLI entry points in bin/ or package.json "bin" (${cliCount}/${total} libraries have their own cli.ts)`
      )
    );
  } else {
    console.log(chalk.yellow(`   ⚠️  ${cliCount}/${total} libraries have CLI`));
  }
}

module.exports = { printProfileArticles };
