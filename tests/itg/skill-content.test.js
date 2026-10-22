/**
 * Skills carry ITG content only where it is specific to their role (FORK-09, REQ-ITG-005):
 * the general ITG instructions live once in the generated agent file and the shared AGENTS.md.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SKILLS_DIR = path.join(ROOT, 'src', 'templates', 'agents', 'claude-code', 'skills');
const ROLE_SPECIFIC = ['steering', 'system-architect'];

describe('ITG content in skills', () => {
  it('appears only in the role-specific skills', () => {
    const withItg = fs
      .readdirSync(SKILLS_DIR)
      .filter(skill => fs.existsSync(path.join(SKILLS_DIR, skill, 'SKILL.md')))
      .filter(skill =>
        /ITG/.test(fs.readFileSync(path.join(SKILLS_DIR, skill, 'SKILL.md'), 'utf8'))
      );
    expect(withItg.sort()).toEqual(ROLE_SPECIFIC);
  });

  it('states once, in the shared AGENTS.md and the generated agent block, that a policy wins', () => {
    const agents = fs.readFileSync(
      path.join(ROOT, 'src', 'templates', 'agents', 'shared', 'AGENTS.md'),
      'utf8'
    );
    const init = fs.readFileSync(path.join(ROOT, 'bin', 'musubi-init.js'), 'utf8');
    expect(agents).toContain(
      'a skill, a command or a template example disagrees with an ITG policy, the ITG policy wins'
    );
    expect(init).toMatch(
      /Where a skill, a command or a template example disagrees with an ITG\s+policy, the ITG policy wins/
    );
  });
});
