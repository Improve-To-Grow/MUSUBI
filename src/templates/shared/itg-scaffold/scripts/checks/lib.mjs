// Shared helpers of the CI gate scripts (ITG Software Delivery Playbook §8.1, Appendix C.3).
// The scripts run from the repository root with plain Node, without dependencies.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();

const SKIPPED_DIRS = new Set(['node_modules', '.git', '.next', '.open-next', '.wrangler']);

export function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

export function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

/** Relative paths of the files under `dir` whose path matches `pattern` */
export function walk(dir, pattern) {
  const found = [];
  const visit = rel => {
    for (const entry of fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true })) {
      const child = path.posix.join(rel, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) visit(child);
      } else if (pattern.test(child)) {
        found.push(child);
      }
    }
  };
  if (exists(dir)) visit(dir);
  return found.sort();
}

/** Names of the direct subdirectories of `dir` */
export function subdirectories(dir) {
  if (!exists(dir)) return [];
  return fs
    .readdirSync(path.join(ROOT, dir), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

/**
 * Source without comments, with the same length, so that offsets still give line numbers.
 * shortcut: a comment marker inside a string literal is also blanked; acceptable for these checks.
 */
export function stripComments(source) {
  const blank = match => match.replace(/[^\n]/g, ' ');
  return source.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:\\])\/\/[^\n]*/g, blank);
}

export function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

/** Files changed between BASE_REF (e.g. origin/staging) and HEAD */
export function changedFiles() {
  const base = process.env.BASE_REF;
  if (!base) {
    console.error('BASE_REF is not set (e.g. BASE_REF=origin/staging)');
    process.exit(1);
  }
  try {
    const output = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    const reason = String(error.stderr || error.message)
      .trim()
      .split('\n')[0];
    console.error(
      `cannot diff BASE_REF=${base} against HEAD: ${reason} (fetch the base branch, e.g. actions/checkout with fetch-depth: 0)`
    );
    process.exit(1);
  }
}

/** Print the problems and exit 1, or print that the check passed */
export function finish(check, problems) {
  if (problems.length === 0) {
    console.log(`${check}: ok`);
    return;
  }
  console.error(`${check}: ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

/** --help: print the script's leading comment block, which documents it, and exit */
export function printHelp(scriptUrl) {
  const lines = fs.readFileSync(new URL(scriptUrl), 'utf8').split('\n');
  const header = lines.slice(0, lines.findIndex(line => !line.startsWith('//')));
  console.log(header.map(line => line.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}
