/**
 * Project scaffold that `musubi init` writes into an ITG application (ITG fork): `.env.example`,
 * the PR template, the CI, deploy and cleanup workflows, and the CI scripts of Appendix C of the
 * ITG Software Delivery Playbook, and the Prettier, Vitest, ESLint and knip configuration the CI
 * jobs run with. Existing files, and configuration a project already has under another name, are
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
 * @returns {Promise<{written: string[], skipped: string[]}>} Target paths
 */
async function writeItgScaffold(projectRoot = process.cwd()) {
  const written = [];
  const skipped = [];
  for (const rel of await listScaffold()) {
    const target = targetPath(rel);
    const destination = path.join(projectRoot, target);
    const content = (await fs.readFile(path.join(SCAFFOLD_DIR, rel), 'utf8')).replace(
      /\{\{MUSUBI_TAG\}\}/g,
      `v${version}`
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
  return { written, skipped };
}

module.exports = { SCAFFOLD_DIR, targetPath, listScaffold, writeItgScaffold };
