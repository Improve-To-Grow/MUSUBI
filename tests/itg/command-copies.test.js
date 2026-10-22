/**
 * The slash commands are maintained once, in claude-code/commands, and copied to the other
 * markdown platforms by `npm run sync:commands` (steering/rules/itg-fork.md, FORK-05). A copy
 * that drifts gives agents on that platform other rules.
 */

const fs = require('fs');
const path = require('path');
const { AGENTS_DIR, commandCopies } = require('../../scripts/sync-commands');

const read = file => fs.readFileSync(file, 'utf8');

describe('slash command copies', () => {
  it('are identical to the claude-code commands (run npm run sync:commands)', () => {
    const copies = commandCopies();
    expect(copies.length).toBeGreaterThan(40);
    const drifted = copies
      .filter(({ from, to }) => read(from) !== read(to))
      .map(({ to }) => path.relative(AGENTS_DIR, to));
    expect(drifted).toEqual([]);
  });

  it('every command on every platform points agents to the ITG policies', () => {
    const platforms = fs
      .readdirSync(AGENTS_DIR)
      .filter(name => fs.existsSync(path.join(AGENTS_DIR, name, 'commands')));
    const missing = platforms
      .flatMap(platform => {
        const dir = path.join(AGENTS_DIR, platform, 'commands');
        return fs.readdirSync(dir).map(file => path.join(dir, file));
      })
      .filter(file => !read(file).includes('steering/rules/itg'))
      .map(file => path.relative(AGENTS_DIR, file));
    expect(missing).toEqual([]);
  });

});
