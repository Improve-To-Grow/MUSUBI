/**
 * Profile Checks
 *
 * Project-wide checks of the constitutional validator that depend on the project profile:
 * the profile declaration (P-1, P-2, P-4), Article I (I-1 to I-5, I-A4, I-A5), Article II
 * (II-L1, II-A1, II-A4, II-A7, II-A10) and the code-size limits of Article VII (VII-4 to VII-6).
 *
 * Each check receives a context { files, profile, record, limits }:
 * - files: ProjectFiles of the project
 * - profile: profile configuration from ConstitutionLevelManager.getProfileConfig()
 * - record(passed, message, recommendation, options): records a finding for the article
 * - limits: code-size limits from ConstitutionLevelManager.getCodeLimits()
 *
 * Requirement: P-1..P-6, I-1..I-5, I-A4, I-A5, II-*, VII-4..VII-6 (steering/rules/constitution.md)
 */

const fs = require('fs');
const path = require('path');
const { ProjectProfile } = require('./constitution-level-manager');
const {
  REACT_IMPORT_PATTERN,
  REQUEST_CONTEXT_PATTERN,
  MACHINE_ENDPOINT_PATTERN,
  SCHEMA_VALIDATION_PATTERN,
  TEST_FILE_PATTERN,
  isSourceFile,
  isImportLimitExempt,
  measureCode,
  checkPublicInterfaceDocs,
} = require('../constitutional/articles');
const { CODE_EXTENSIONS, isUnder, summarize } = require('./project-files');

const isApplication = profile => profile.profile === ProjectProfile.APPLICATION;

/**
 * P-1, P-2: a profile is declared and valid; P-4: an application declares its paths
 * @param {Object} ctx - Check context
 */
function checkProfileDeclaration({ profile, record }) {
  if (!profile.declared) {
    record(
      false,
      'P-1: No constitution.profile declared in steering/project.yml; applying the library profile (P-2)',
      'Declare constitution.profile (library | cli | application) in steering/project.yml',
      { advisory: true }
    );
  } else if (!profile.valid) {
    record(
      false,
      `P-2: Unknown profile '${profile.declaredProfile}' in steering/project.yml; applying the library profile`,
      'Use one of: library, cli, application',
      { advisory: true }
    );
  }

  if (isApplication(profile) && (!profile.corePathsDeclared || !profile.deliveryPaths.length)) {
    record(
      false,
      'P-4: The application profile requires core_paths and delivery_paths in steering/project.yml',
      'Declare constitution.core_paths (e.g. [src/lib]) and constitution.delivery_paths (e.g. [src/app, src/components])'
    );
  }
}

/**
 * Article I: Testable-Core Principle
 * @param {Object} ctx - Check context
 */
function checkTestableCore(ctx) {
  const { files, profile, record } = ctx;
  checkProfileDeclaration(ctx);

  // I-1: feature logic lives under a core path
  const corePaths = profile.corePaths.filter(dir => files.isDirectory(dir));
  if (corePaths.length === 0) {
    record(
      false,
      `I-1: No core path found (${profile.corePaths.length ? profile.corePaths.join(', ') : 'none declared'})`,
      isApplication(profile)
        ? 'Place feature logic under a declared core path, e.g. src/lib/<domain>/'
        : 'Place features in lib/<feature>/ or packages/<feature>/, or declare core_paths in steering/project.yml'
    );
    return;
  }
  record(true, `I-1: Core paths found: ${corePaths.join(', ')}`, null);

  const coreFiles = corePaths
    .flatMap(dir => files.codeFiles(dir))
    .filter(({ rel }) => isCoreCode(rel, profile) && !TEST_FILE_PATTERN.test(rel));

  checkCoreModuleTests(ctx, corePaths);
  checkCoreImports(ctx, coreFiles);
  checkCoreDocs(ctx, coreFiles);
  if (isApplication(profile)) {
    checkApplicationCore(ctx, coreFiles);
  }
}

/**
 * Whether a path in a core path is core code (not in a delivery or adapter path)
 * @private
 */
function isCoreCode(rel, profile) {
  return !isUnder(rel, profile.deliveryPaths) && !isUnder(rel, profile.adapterPaths);
}

/**
 * I-2: each core module has tests that run without the app
 * @private
 */
function checkCoreModuleTests({ files, profile, record }, corePaths) {
  const modules = corePaths
    .flatMap(dir => fs.readdirSync(path.join(files.projectRoot, dir)).map(name => `${dir}/${name}`))
    .filter(rel => files.isDirectory(rel) && isCoreCode(rel, profile))
    .filter(rel => files.glob(`${rel}/**/*.${CODE_EXTENSIONS}`).length > 0);

  for (const moduleRel of modules.filter(rel => !files.hasTests(rel))) {
    record(
      false,
      `I-2: Core module '${moduleRel}' has no tests`,
      `Add tests next to the module (*.test.*) or in tests/${path.posix.basename(moduleRel)}/`
    );
  }
}

/**
 * I-3: no imports from delivery paths into core paths
 * @private
 */
function checkCoreImports({ files, profile, record }, coreFiles) {
  if (profile.deliveryPaths.length === 0) return;

  const crossings = coreFiles.flatMap(({ file, rel }) =>
    files
      .resolvedImports(rel, files.read(file))
      .filter(target => isUnder(target, profile.deliveryPaths))
      .map(target => `${rel} → ${target}`)
  );
  if (crossings.length > 0) {
    record(
      false,
      `I-3: ${crossings.length} import(s) from delivery paths into core paths: ${summarize(crossings)}`,
      'Move the imported logic, types or constants into the core module'
    );
  } else {
    record(true, 'I-3: No imports from delivery paths into core paths', null);
  }
}

/**
 * I-5 (advisory): exported functions and classes of core modules have doc comments
 * @private
 */
function checkCoreDocs({ files, profile, record }, coreFiles) {
  const undocumented = coreFiles
    .map(({ file, rel }) => {
      const [finding] = checkPublicInterfaceDocs({ rel, content: files.read(file), profile });
      return finding ? { rel, names: finding.names } : null;
    })
    .filter(Boolean);
  if (undocumented.length === 0) return;

  const total = undocumented.reduce((sum, entry) => sum + entry.names.length, 0);
  const list = undocumented.map(entry => `${entry.rel} (${entry.names.join(', ')})`);
  record(
    false,
    `I-5: ${total} exported function(s) or class(es) without a doc comment: ${summarize(list)}`,
    'Add a /** … */ comment above each exported function and class',
    { advisory: true }
  );
}

/**
 * I-A4: no UI-only code in core paths; I-A5 (advisory): request-context APIs only in
 * delivery or adapter paths
 * @private
 */
function checkApplicationCore({ files, record }, coreFiles) {
  const uiFiles = coreFiles
    .filter(({ file, rel }) => /\.[jt]sx$/.test(rel) || REACT_IMPORT_PATTERN.test(files.read(file)))
    .map(({ rel }) => rel);
  if (uiFiles.length > 0) {
    record(
      false,
      `I-A4: UI-only code in core paths: ${summarize(uiFiles)}`,
      'Move components, React hooks and providers to delivery paths (e.g. src/components, src/hooks)'
    );
  } else {
    record(true, 'I-A4: No UI-only code in core paths', null);
  }

  const requestContextFiles = coreFiles
    .filter(({ file }) => REQUEST_CONTEXT_PATTERN.test(files.read(file)))
    .map(({ rel }) => rel);
  if (requestContextFiles.length > 0) {
    record(
      false,
      `I-A5: Request-context APIs (next/headers, next/server) in core paths: ${summarize(requestContextFiles)}`,
      'Move this code to a delivery path, or declare its folder in adapter_paths',
      { advisory: true }
    );
  }
}

/**
 * Article II: Automation Interface Mandate
 * @param {Object} ctx - Check context
 */
function checkAutomationInterface(ctx) {
  if (!isApplication(ctx.profile)) {
    checkCliInterface(ctx);
    return;
  }
  checkHttpInterface(ctx);
  checkPackageScripts(ctx);
  checkOpsScripts(ctx);
}

/**
 * II-L1: library and cli projects provide a CLI
 * @private
 */
function checkCliInterface({ files, record }) {
  if (files.isDirectory('bin')) {
    const count = fs.readdirSync(path.join(files.projectRoot, 'bin')).length;
    record(true, `II-L1: CLI interfaces found in bin/: ${count} file(s)`, null);
  } else if (files.readPackageJson()?.bin) {
    record(true, 'II-L1: CLI entry points defined in package.json', null);
  } else {
    record(
      false,
      'II-L1: No CLI interface found',
      'Add a bin/ directory or define "bin" in package.json'
    );
  }
}

/**
 * II-A1: the HTTP API (route handlers) is the automation interface, no CLI required (II-A3);
 * II-A4: machine-facing endpoints validate input against a schema
 * @private
 */
function checkHttpInterface({ files, record }) {
  const routeFiles = files
    .glob(`**/route.${CODE_EXTENSIONS}`)
    .concat(files.glob(`**/pages/api/**/*.${CODE_EXTENSIONS}`))
    .map(file => ({ file, rel: files.rel(file) }))
    .filter(({ rel }) => !TEST_FILE_PATTERN.test(rel));
  if (routeFiles.length === 0) {
    record(
      false,
      'II-A1: No HTTP route handlers found',
      'Expose primary operations as route handlers, e.g. src/app/api/<feature>/route.ts'
    );
  } else {
    record(
      true,
      `II-A1: ${routeFiles.length} route handler(s) found; no CLI required (II-A3)`,
      null
    );
  }

  const unvalidated = routeFiles
    .filter(({ rel }) => MACHINE_ENDPOINT_PATTERN.test(rel))
    .filter(({ file }) => !SCHEMA_VALIDATION_PATTERN.test(files.read(file)))
    .map(({ rel }) => rel);
  if (unvalidated.length > 0) {
    record(
      false,
      `II-A4: Machine-facing endpoints without schema validation: ${summarize(unvalidated)}`,
      'Validate the input against a schema (e.g. zod safeParse) and return documented status and error codes'
    );
  }
}

/**
 * II-A10: every package.json script references a file that exists
 * @private
 */
function checkPackageScripts({ files, record }) {
  const scripts = files.readPackageJson()?.scripts;
  if (!scripts) return;
  const missing = files.findMissingScriptFiles(scripts);
  if (missing.length > 0) {
    record(
      false,
      `II-A10: package.json scripts reference missing files: ${summarize(missing)}`,
      'Restore the referenced files or remove the scripts'
    );
  } else {
    record(true, 'II-A10: All package.json scripts reference existing files', null);
  }
}

/**
 * II-A7 (advisory): operational scripts provide --help
 * @private
 */
function checkOpsScripts({ files, record }) {
  const withoutHelp = files
    .glob('scripts/**/*.{js,ts,mjs,cjs,mts,cts,sh,py}')
    .filter(file => !files.read(file).includes('--help'))
    .map(file => files.rel(file));
  if (withoutHelp.length > 0) {
    record(
      false,
      `II-A7: Operational scripts without --help: ${summarize(withoutHelp)}`,
      'Add --help with usage, the target environment option and, for production writes, a dry run',
      { advisory: true }
    );
  }
}

/**
 * Article VII: code-size limits of the source files in core and delivery paths (VII-4 to VII-6)
 * @param {Object} ctx - Check context
 */
function checkCodeSize(ctx) {
  const { files, profile, record, limits } = ctx;
  const sourceFiles = [...new Set([...profile.corePaths, ...profile.deliveryPaths])]
    .filter(dir => files.isDirectory(dir))
    .flatMap(dir => files.codeFiles(dir))
    .filter(({ rel }) => isSourceFile(rel, profile));
  const oversized = measureSourceFiles(files, sourceFiles, limits);

  const checks = [
    [
      'VII-4',
      oversized.files,
      `source file(s) over ${limits.maxFileLines} lines of code`,
      'Split the files into modules with one responsibility each',
    ],
    [
      'VII-5',
      oversized.functions,
      `function(s) over ${limits.maxFunctionLines} lines of code`,
      'Extract steps into named functions',
    ],
    [
      'VII-6',
      oversized.imports,
      `source file(s) import more than ${limits.maxImports} modules`,
      'Split the files, or move the coordination into a smaller module',
    ],
  ];
  for (const [requirement, list, what, recommendation] of checks.filter(([, l]) => l.length)) {
    const largestFirst = list.sort((a, b) => b.size - a.size).map(item => item.label);
    record(
      false,
      `${requirement}: ${list.length} ${what}: ${summarize(largestFirst)}`,
      recommendation
    );
  }
  if (checks.every(([, list]) => list.length === 0)) {
    record(
      true,
      `VII-4–VII-6: ${sourceFiles.length} source file(s) within the code-size limits (${limits.maxFileLines} lines of code per file, ${limits.maxFunctionLines} per function, ${limits.maxImports} imports)`,
      null
    );
  }
}

/**
 * Source files, functions and import lists over the limits, as { label, size }
 * @private
 */
function measureSourceFiles(files, sourceFiles, limits) {
  const oversized = { files: [], functions: [], imports: [] };
  for (const { file, rel } of sourceFiles) {
    const { linesOfCode, functions, imports } = measureCode(files.read(file));
    if (linesOfCode > limits.maxFileLines) {
      oversized.files.push({ label: `${rel} (${linesOfCode})`, size: linesOfCode });
    }
    for (const fn of functions.filter(f => f.linesOfCode > limits.maxFunctionLines)) {
      oversized.functions.push({
        label: `${rel}:${fn.startLine} ${fn.name} (${fn.linesOfCode})`,
        size: fn.linesOfCode,
      });
    }
    if (imports.size > limits.maxImports && !isImportLimitExempt(rel)) {
      oversized.imports.push({ label: `${rel} (${imports.size})`, size: imports.size });
    }
  }
  return oversized;
}

module.exports = { checkTestableCore, checkAutomationInterface, checkCodeSize };
