/**
 * Live documentation (CHANGE-004)
 *
 * The Markdown files that readers follow today: README.md, CONTRIBUTING.md, docs/ without its
 * record and history folders, the agent templates under src/templates/ and this repository's
 * installed skills under .claude/skills/. Records such as design documents and analyses keep
 * the names of their time and are not scanned.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ROOT_FILES = ['README.md', 'CONTRIBUTING.md'];
const SCANNED_DIRS = ['docs', path.join('src', 'templates'), path.join('.claude', 'skills')];
const RECORD_DIRS = new Set(
  [
    'analysis',
    'design',
    'internal-specs',
    'marketing',
    'plans',
    'requirements',
    'research',
    'tasks',
  ].map(name => path.join(ROOT, 'docs', name))
);

function* markdownFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!RECORD_DIRS.has(full)) {
        yield* markdownFiles(full);
      }
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield full;
    }
  }
}

/** Absolute paths of every live documentation file. */
function liveDocumentation() {
  const files = ROOT_FILES.map(name => path.join(ROOT, name)).filter(file => fs.existsSync(file));
  for (const dir of SCANNED_DIRS) {
    const base = path.join(ROOT, dir);
    if (fs.existsSync(base)) {
      files.push(...markdownFiles(base));
    }
  }
  return files;
}

/** Repository-relative path with forward slashes, for failure messages. */
function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

module.exports = { ROOT, liveDocumentation, relative };
