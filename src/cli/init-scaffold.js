/**
 * Project scaffold that `musubi init` writes into an ITG application (ITG fork): `.env.example`,
 * the PR template, the CI, deploy and cleanup workflows, and the CI scripts of Appendix C of the
 * ITG Software Delivery Playbook, the Prettier, Vitest, ESLint and knip configuration the CI
 * jobs run with, and the OpenNext files the build needs (`open-next.config.ts`, `next.config.ts`,
 * `wrangler.jsonc`, Project Setup Guide §10.2 and §15). Existing files, and configuration a project already has under another name, are
 * never overwritten.
 *
 * @module src/cli/init-scaffold
 */

const fs = require('fs-extra');
const path = require('path');
const { version } = require('../../package.json');

const SCAFFOLD_DIR = path.join(__dirname, '..', 'templates', 'shared', 'itg-scaffold');

/** Template paths stored without a leading dot, so that packaging keeps them, mapped to their target */
const RENAMED = [
  ['env.example', '.env.example'],
  ['github/', '.github/'],
  ['prettierrc.json', '.prettierrc.json'],
  ['prettierignore', '.prettierignore'],
  ['gitignore', '.gitignore'],
];

/** Scaffold files whose missing lines are appended to an existing file instead of skipping it */
const MERGED = ['.gitignore'];

/** Configuration files that the tool also reads under these names; any of them keeps ours out */
const ALTERNATIVES = {
  '.prettierrc.json': [
    '.prettierrc',
    ...['json5', 'yaml', 'yml', 'toml', 'js', 'cjs', 'mjs', 'ts'].map(ext => `.prettierrc.${ext}`),
    ...['js', 'cjs', 'mjs', 'ts'].map(ext => `prettier.config.${ext}`),
  ],
  'vitest.config.ts': ['vitest', 'vite'].flatMap(name =>
    ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts'].map(ext => `${name}.config.${ext}`)
  ),
  'eslint.config.mjs': [
    ...['js', 'cjs', 'ts', 'mts', 'cts'].map(ext => `eslint.config.${ext}`),
    ...['', '.json', '.js', '.cjs', '.yml', '.yaml'].map(ext => `.eslintrc${ext}`),
  ],
  'next.config.ts': ['next.config.js', 'next.config.mjs', 'next.config.cjs', 'next.config.mts'],
  'wrangler.jsonc': ['wrangler.json', 'wrangler.toml'],
  'knip.json': [
    'knip.jsonc',
    '.knip.json',
    '.knip.jsonc',
    'knip.ts',
    'knip.js',
    'knip.config.ts',
    'knip.config.js',
  ],
};

/**
 * Target path of a scaffold file, relative to the project root
 * @param {string} rel - Path relative to the scaffold directory, with forward slashes
 * @returns {string}
 */
function targetPath(rel) {
  const rename = RENAMED.find(
    ([from]) => rel === from || (from.endsWith('/') && rel.startsWith(from))
  );
  return rename ? rename[1] + rel.slice(rename[0].length) : rel;
}

/**
 * Relative paths of every file in the scaffold directory
 * @param {string} dir - Directory to list
 * @param {string} prefix - Relative path of `dir`
 * @returns {Promise<string[]>}
 */
async function listScaffold(dir = SCAFFOLD_DIR, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const rel = prefix + entry.name;
    if (entry.isDirectory())
      files.push(...(await listScaffold(path.join(dir, entry.name), `${rel}/`)));
    else files.push(rel);
  }
  return files.sort();
}

/**
 * Worker name of the project: the given project name, else the package.json name, else the folder
 * name, in the characters a Cloudflare Worker name allows
 * @param {string} projectRoot
 * @param {string} [projectName] - Name from the init questions
 * @returns {string}
 */
function appName(projectRoot, projectName) {
  let name = projectName || path.basename(projectRoot);
  try {
    if (!projectName) {
      name =
        JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')).name || name;
    }
  } catch {
    // no package.json yet: the folder name
  }
  return name
    .replace(/^@[^/]+\//, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * A next.config of the project that does not call initOpenNextCloudflareForDev()
 * @param {string} projectRoot
 * @returns {Promise<string|null>} Its file name, or null
 */
async function nextConfigWithoutOpenNext(projectRoot) {
  for (const name of ['next.config.ts', ...ALTERNATIVES['next.config.ts']]) {
    const file = path.join(projectRoot, name);
    if (!(await fs.pathExists(file))) continue;
    const source = await fs.readFile(file, 'utf8');
    return source.includes('initOpenNextCloudflareForDev') ? null : name;
  }
  return null;
}

/**
 * Append the lines of `content` that `file` does not have yet, under the scaffold's heading
 * @param {string} file - Existing file
 * @param {string} content - Scaffold content
 * @returns {Promise<boolean>} Whether lines were appended
 */
async function appendMissingLines(file, content) {
  const current = await fs.readFile(file, 'utf8');
  const present = new Set(current.split(/\r?\n/).map(line => line.trim()));
  const missing = content
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#') && !present.has(line.trim()));
  if (missing.length === 0) return false;
  const heading = content.split('\n')[0];
  await fs.writeFile(file, `${current.replace(/\n*$/, '\n')}\n${heading}\n${missing.join('\n')}\n`);
  return true;
}

/**
 * Write the ITG scaffold into a project, skipping files that exist
 * @param {string} projectRoot - Project root
 * @param {{projectName?: string}} [options] - projectName names the Workers of wrangler.jsonc
 * @returns {Promise<{written: string[], skipped: string[], notes: string[]}>} Target paths, and
 *   the steps left to the developer
 */
async function writeItgScaffold(projectRoot = process.cwd(), { projectName } = {}) {
  const written = [];
  const skipped = [];
  const notes = [];
  const values = {
    MUSUBI_TAG: `v${version}`,
    APP_NAME: appName(projectRoot, projectName),
    DATE: new Date().toISOString().slice(0, 10),
  };
  for (const rel of await listScaffold()) {
    const target = targetPath(rel);
    const destination = path.join(projectRoot, target);
    const content = (await fs.readFile(path.join(SCAFFOLD_DIR, rel), 'utf8')).replace(
      /\{\{(MUSUBI_TAG|APP_NAME|DATE)\}\}/g,
      (_, key) => values[key]
    );
    if (MERGED.includes(target) && (await fs.pathExists(destination))) {
      if (await appendMissingLines(destination, content)) written.push(target);
      else skipped.push(target);
      continue;
    }
    const existing = [target, ...(ALTERNATIVES[target] || [])];
    const found = [];
    for (const name of existing) {
      if (await fs.pathExists(path.join(projectRoot, name))) found.push(name);
    }
    if (found.length > 0) {
      skipped.push(found[0]);
      continue;
    }
    await fs.outputFile(destination, content);
    written.push(target);
  }

  const nextConfig = await nextConfigWithoutOpenNext(projectRoot);
  if (nextConfig) {
    notes.push(
      `Add initOpenNextCloudflareForDev() from @opennextjs/cloudflare to ${nextConfig}, so next dev gets the Worker bindings (Project Setup Guide §10.2)`
    );
  }
  return { written, skipped, notes };
}

module.exports = { SCAFFOLD_DIR, targetPath, listScaffold, writeItgScaffold };
