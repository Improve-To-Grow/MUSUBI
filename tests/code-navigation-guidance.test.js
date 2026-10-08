/**
 * Index-first code lookups in the Claude Code SDD templates and in this repository's steering
 * (CHANGE-005, REQ-NAV-004, REQ-NAV-007)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATES = 'src/templates/agents/claude-code';
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');

// Lookup steps: template file, the grep that stays as fallback for text and projects without a
// code index, and the code index command named before it.
const LOOKUP_STEPS = [
  [
    'commands/sdd-change-init.md',
    'grep -rn "{{related-feature}}"',
    'musubi-code refs {{RelatedSymbol}}',
  ],
  ['commands/sdd-change-init.md', 'grep -rn "authentication"', 'musubi-code refs AuthService'],
  [
    'commands/sdd-change-apply.md',
    'grep -rn "{{existing-function}}"',
    'musubi-code refs {{ExistingFunction}}',
  ],
  [
    'commands/sdd-change-archive.md',
    `grep -rn "from '@/lib/{{deprecated-feature}}'"`,
    'musubi-code dependents lib/{{deprecated-feature}}',
  ],
  ['commands/sdd-requirements.md', 'grep -rn "{{feature}}"', 'musubi-code refs <Symbol>'],
  ['commands/sdd-requirements.md', '**Grep**: Search for text', '**Bash (`musubi-code`)**'],
  ['skills/change-impact-analyzer/SKILL.md', 'grep -rn "login"', 'musubi-code refs User'],
  [
    'skills/change-impact-analyzer/impact-analysis-template.md',
    `grep -rn "import.*from.*'./changed-file'"`,
    'musubi-code dependents src/changed-file.ts',
  ],
];

// Recursive greps that check text rules, not look up code (I-3 import check).
const TEXT_CHECKS = [`grep -rE "from '@/(app|components|hooks|contexts)/"`];

describe('Claude Code SDD templates look up code in the index first (REQ-NAV-004)', () => {
  test.each(LOOKUP_STEPS)('%s names the index before %s', (file, fallback, indexCommand) => {
    const lines = read(`${TEMPLATES}/${file}`).split('\n');
    const at = lines.findIndex(line => line.includes(fallback));
    expect(at).toBeGreaterThan(-1);
    const step = lines.slice(Math.max(0, at - 10), at + 1).join('\n');
    const indexAt = step.indexOf(indexCommand);
    expect(indexAt).toBeGreaterThan(-1);
    expect(indexAt).toBeLessThan(step.lastIndexOf(fallback));
  });

  test('every recursive grep in these files is a listed fallback or text check', () => {
    const allowed = [...LOOKUP_STEPS.map(([, fallback]) => fallback), ...TEXT_CHECKS];
    const files = [...new Set(LOOKUP_STEPS.map(([file]) => file))];
    const unlisted = files.flatMap(file =>
      read(`${TEMPLATES}/${file}`)
        .split('\n')
        .map((line, i) => ({ line, where: `${file}:${i + 1}` }))
        .filter(({ line }) => /\bgrep -r/.test(line) && !allowed.some(a => line.includes(a)))
        .map(({ where, line }) => `${where} ${line.trim()}`)
    );
    expect(unlisted).toEqual([]);
  });

  test('the copies installed in .claude/ are identical to their templates', () => {
    const pairs = [];
    for (const name of fs.readdirSync(path.join(ROOT, '.claude', 'commands'))) {
      pairs.push([`.claude/commands/${name}`, `${TEMPLATES}/commands/${name}`]);
    }
    for (const skill of fs.readdirSync(path.join(ROOT, '.claude', 'skills'))) {
      const template = `${TEMPLATES}/skills/${skill}`;
      if (!fs.existsSync(path.join(ROOT, template))) continue; // code-references: code index
      for (const name of fs.readdirSync(path.join(ROOT, '.claude', 'skills', skill))) {
        pairs.push([`.claude/skills/${skill}/${name}`, `${template}/${name}`]);
      }
    }
    expect(pairs.length).toBeGreaterThan(30);
    const different = pairs
      .filter(([installed, template]) => {
        if (fs.statSync(path.join(ROOT, installed)).isDirectory()) return false;
        return read(installed) !== read(template);
      })
      .map(([installed]) => installed);
    expect(different).toEqual([]);
  });
});

describe('steering names musubi-code for symbol questions (REQ-NAV-007)', () => {
  test.each([
    ['steering/tech.md', true],
    ['steering/structure.md', true],
    ['steering/rules/workflow.md', true],
    ['steering/memories/suggested_commands.md', false],
  ])('%s', (file, statesRule) => {
    const text = read(file);
    expect(text).toContain('musubi-code refs');
    expect(text).toContain('musubi-code symbols');
    expect(text).not.toContain('node bin/musubi-code.js');
    if (statesRule) expect(text).toMatch(/before grep/i);
  });
});
