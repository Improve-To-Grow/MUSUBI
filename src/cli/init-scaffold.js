/**
 * Project scaffold that `musubi init` writes into an ITG application (ITG fork): `.env.example`,
 * the PR template, the CI, deploy and cleanup workflows, and the CI scripts of Appendix C of the
 * ITG Software Delivery Playbook. Existing files are never overwritten.
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
];

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
    if (await fs.pathExists(destination)) {
      skipped.push(target);
      continue;
    }
    const content = await fs.readFile(path.join(SCAFFOLD_DIR, rel), 'utf8');
    await fs.outputFile(destination, content.replace(/\{\{MUSUBI_TAG\}\}/g, `v${version}`));
    written.push(target);
  }
  return { written, skipped };
}

module.exports = { SCAFFOLD_DIR, targetPath, listScaffold, writeItgScaffold };
