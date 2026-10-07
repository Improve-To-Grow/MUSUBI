/**
 * Language Policy Tests (CHANGE-002, REQ-LANG-008)
 *
 * MUSUBI is English only. No source, test, steering or documentation file may contain Japanese
 * or other CJK prose. The scan reads the working tree, so it also catches files that are not yet
 * committed.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCANNED_DIRS = ['src', 'bin', 'tests', 'steering', 'docs'];
const SKIPPED_DIRS = new Set(['node_modules', '.git', 'coverage', 'dist', '.vitepress']);
const TEXT_EXTENSIONS = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts',
  '.json',
  '.md',
  '.yml',
  '.yaml',
  '.txt',
  '.py',
  '.html',
  '.css',
]);

// Hiragana, Katakana and CJK Unified Ideographs
const CJK = /[\u3040-\u30FF\u4E00-\u9FFF]/;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) {
        yield* walk(full);
      }
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

function firstCjkLine(file) {
  const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);
  return lines.findIndex(line => CJK.test(line)) + 1;
}

describe('language policy (REQ-LANG-008)', () => {
  it('contains no CJK text in source, tests, steering or docs', () => {
    const offenders = [];

    for (const dir of SCANNED_DIRS) {
      const base = path.join(ROOT, dir);
      if (!fs.existsSync(base)) {
        continue;
      }
      for (const file of walk(base)) {
        const line = firstCjkLine(file);
        if (line > 0) {
          offenders.push(`${path.relative(ROOT, file).split(path.sep).join('/')}:${line}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
