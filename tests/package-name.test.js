/**
 * Package Name Tests (CHANGE-004)
 *
 * The ITG fork is distributed from GitHub as `@improve-to-grow/musubi-sdd`; the `musubi-sdd`
 * package on npm is the upstream version. Live documentation loads the package under the fork's
 * name (REQ-DIST-001) and tells library users to install it into their project, because
 * `require()` does not resolve the global install that provides the CLI (REQ-DIST-002). The
 * `musubi-sdd` command keeps its name.
 */

const fs = require('fs');
const path = require('path');
const { ROOT, liveDocumentation, relative } = require('./helpers/live-documentation');

const FORK_PACKAGE = '@improve-to-grow/musubi-sdd';
const LIBRARY_INSTALL = "npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'";

// require('musubi-sdd…'), import('musubi-sdd…'), from 'musubi-sdd…', node_modules/musubi-sdd,
// and a "musubi-sdd": "<range>" dependency entry
const UPSTREAM_PACKAGE =
  /(?:require\(\s*|import\(\s*|from\s+)['"]musubi-sdd(?=['"/])|node_modules\/musubi-sdd\b|"musubi-sdd"\s*:/;

// The lines of a Markdown section: its heading up to the next heading of the same or a higher
// level. Lines inside fenced code blocks (such as `# comment` in bash) are not headings.
function section(file, heading) {
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf-8').split(/\r?\n/);
  const start = lines.findIndex(line => heading.test(line));
  if (start === -1) {
    return '';
  }
  const level = lines[start].match(/^#+/)[0].length;
  let fenced = false;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index++) {
    if (/^\s*```/.test(lines[index])) {
      fenced = !fenced;
    } else if (!fenced && /^#+\s/.test(lines[index])) {
      if (lines[index].match(/^#+/)[0].length <= level) {
        end = index;
        break;
      }
    }
  }
  return lines.slice(start, end).join('\n');
}

describe('package name (CHANGE-004)', () => {
  it('names the package @improve-to-grow/musubi-sdd and keeps the musubi-sdd command', () => {
    const manifest = require('../package.json');

    expect(manifest.name).toBe(FORK_PACKAGE);
    expect(manifest.bin['musubi-sdd']).toBeDefined();
  });

  it('loads the package under the fork name in live documentation (REQ-DIST-001)', () => {
    const offenders = [];

    for (const file of liveDocumentation()) {
      fs.readFileSync(file, 'utf-8')
        .split(/\r?\n/)
        .forEach((line, index) => {
          if (UPSTREAM_PACKAGE.test(line)) {
            offenders.push(`${relative(file)}:${index + 1}: ${line.trim()}`);
          }
        });
    }

    expect(offenders).toEqual([]);
  });

  describe('library install instructions (REQ-DIST-002)', () => {
    it.each([
      ['docs/API-REFERENCE.md', /^## Installation\b/],
      ['docs/guides/troubleshooting.md', /^#+ .*Cannot find module/],
    ])('%s gives the project-local install command', (file, heading) => {
      const text = section(file, heading);

      expect(text).toContain(LIBRARY_INSTALL);
      expect(text).toContain(FORK_PACKAGE);
    });
  });
});
