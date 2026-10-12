#!/usr/bin/env node
/**
 * Copy the slash commands from claude-code, where they are maintained, to the other markdown
 * platforms (steering/rules/itg-fork.md, FORK-05). gemini-cli (.toml) is edited by hand.
 *
 * Usage: npm run sync:commands
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'src', 'templates', 'agents');
const SOURCE_DIR = path.join(AGENTS_DIR, 'claude-code', 'commands');
const COPIES = ['codex', 'cursor', 'qwen-code', 'windsurf'];
/** github-copilot keeps its own interactive version of these commands */
const COPILOT_OWN = ['sdd-requirements'];

/**
 * Every command copy with the claude-code command it is copied from
 * @returns {{from: string, to: string}[]} Absolute paths
 */
function commandCopies() {
  return fs
    .readdirSync(SOURCE_DIR)
    .filter(file => file.endsWith('.md'))
    .flatMap(file => {
      const from = path.join(SOURCE_DIR, file);
      const name = path.basename(file, '.md');
      const copies = COPIES.map(platform => path.join(AGENTS_DIR, platform, 'commands', file));
      if (!COPILOT_OWN.includes(name)) {
        copies.push(path.join(AGENTS_DIR, 'github-copilot', 'commands', `${name}.prompt.md`));
      }
      return copies.map(to => ({ from, to }));
    });
}

/**
 * Write every copy that differs from its claude-code command
 * @returns {string[]} Paths of the copies that changed, relative to the agents template folder
 */
function syncCommands() {
  const changed = [];
  for (const { from, to } of commandCopies()) {
    const content = fs.readFileSync(from, 'utf8');
    if (fs.existsSync(to) && fs.readFileSync(to, 'utf8') === content) continue;
    fs.writeFileSync(to, content);
    changed.push(path.relative(AGENTS_DIR, to));
  }
  return changed;
}

if (require.main === module) {
  const changed = syncCommands();
  console.log(
    changed.length ? `Updated:\n  ${changed.join('\n  ')}` : 'All command copies are in sync'
  );
}

module.exports = { AGENTS_DIR, commandCopies, syncCommands };
