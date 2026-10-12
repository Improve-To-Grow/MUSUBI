/**
 * ITG delivery policies stay in sync with the ITG Software Delivery Playbook
 * (docs/itg/ITG_Software_Delivery_Playbook.md, "Source of truth and versioning")
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..', '..');
const PLAYBOOK = path.join(ROOT, 'docs', 'itg', 'ITG_Software_Delivery_Playbook.md');
const POLICY_DIR = path.join(ROOT, 'src', 'templates', 'shared', 'steering', 'rules', 'itg');
const STEERING_DIR = path.join(ROOT, 'src', 'templates', 'shared', 'steering');

const RULE_ID = /ITG-[A-Z]+-\d{2}/g;
const RULE_DEFINITION = /^- \*\*(ITG-[A-Z]+-\d{2})\*\* /gm;
const SECTION_REF = /§(\d+(?:\.\d+)*)/g;
const REQUIRED_SECTIONS = [
  '## When this applies',
  '## Decision diagrams',
  '## Rules',
  '## Deviation',
];

const playbook = fs.readFileSync(PLAYBOOK, 'utf8');
const playbookVersion = playbook.match(/^version:\s*(\d+\.\d+)\s*$/m)[1];
const playbookSections = new Set(
  [...playbook.matchAll(/^#{1,4} (\d+(?:\.\d+)*)\.?\s/gm)].map(match => match[1])
);

const policyFiles = fs
  .readdirSync(POLICY_DIR)
  .filter(file => file.endsWith('.md'))
  .map(file => {
    const content = fs.readFileSync(path.join(POLICY_DIR, file), 'utf8');
    const frontMatter = yaml.load(content.match(/^---\n([\s\S]*?)\n---\n/)[1]);
    return { file, content, frontMatter };
  });
const policies = policyFiles.filter(({ file }) => file !== 'README.md');

/** Every rule id defined in a policy file, mapped to that file */
function definedRules() {
  const rules = new Map();
  for (const { file, content } of policyFiles) {
    for (const [, id] of content.matchAll(RULE_DEFINITION)) {
      if (rules.has(id)) throw new Error(`${id} is defined in ${rules.get(id)} and ${file}`);
      rules.set(id, file);
    }
  }
  return rules;
}

describe('ITG playbook copy', () => {
  it('names its version in the front matter and in the heading', () => {
    expect(playbook).toMatch(new RegExp(`\\*\\*Version ${playbookVersion.replace('.', '\\.')} `));
  });

  it('has a changelog entry for its version', () => {
    const changelog = fs.readFileSync(
      path.join(ROOT, 'docs', 'itg', 'PLAYBOOK_CHANGELOG.md'),
      'utf8'
    );
    expect(changelog).toMatch(new RegExp(`^## v${playbookVersion.replace('.', '\\.')} `, 'm'));
  });

  it('is named in the fork CHANGELOG', () => {
    const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
    expect(changelog).toContain(`ITG Software Delivery Playbook v${playbookVersion}`);
  });
});

describe('ITG policy files', () => {
  it('cover the ten policy areas plus the index', () => {
    expect(policyFiles.map(({ file }) => file).sort()).toEqual([
      'README.md',
      'ci-cd-and-release.md',
      'data.md',
      'delivery-lifecycle.md',
      'git-and-code-quality.md',
      'integrations.md',
      'logging.md',
      'operations.md',
      'platform.md',
      'security.md',
      'testing.md',
    ]);
  });

  it.each(policyFiles.map(policy => [policy.file, policy]))(
    '%s implements the current playbook version',
    (_file, { frontMatter }) => {
      expect(frontMatter.playbook).toBe(`ITG Software Delivery Playbook v${playbookVersion}`);
      expect(Array.isArray(frontMatter.sections)).toBe(true);
      expect(Array.isArray(frontMatter.roles)).toBe(true);
    }
  );

  it.each(policies.map(policy => [policy.file, policy]))(
    '%s has the required sections and at least one rule',
    (_file, { content, frontMatter }) => {
      for (const heading of REQUIRED_SECTIONS) expect(content).toContain(heading);
      const ids = [...content.matchAll(RULE_DEFINITION)].map(match => match[1]);
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(id.startsWith(`${frontMatter.policy}-`)).toBe(true);
    }
  );

  it('cite only sections that exist in the playbook', () => {
    const missing = policyFiles.flatMap(({ file, content }) =>
      [...content.matchAll(SECTION_REF)]
        .map(match => match[1])
        .filter(section => !playbookSections.has(section))
        .map(section => `${file}: §${section}`)
    );
    expect(missing).toEqual([]);
  });

  it('define every rule id only once', () => {
    expect(() => definedRules()).not.toThrow();
  });

  it('reference only rule ids that are defined', () => {
    const rules = definedRules();
    const steeringTemplates = ['tech.md', 'structure.md', 'product.md'].map(file =>
      fs.readFileSync(path.join(STEERING_DIR, file), 'utf8')
    );
    const undefinedIds = [...policyFiles.map(({ content }) => content), ...steeringTemplates]
      .flatMap(content => content.match(RULE_ID) || [])
      .filter(id => !rules.has(id));
    expect([...new Set(undefinedIds)]).toEqual([]);
  });

  it('match the playbook version named in the steering templates', () => {
    for (const file of ['tech.md', 'structure.md', 'product.md']) {
      const content = fs.readFileSync(path.join(STEERING_DIR, file), 'utf8');
      expect(content).toContain(
        `**Standard**: ITG Software Delivery Playbook v${playbookVersion} `
      );
    }
  });

  it('are listed in the index', () => {
    const index = policyFiles.find(({ file }) => file === 'README.md').content;
    for (const { file } of policies) expect(index).toContain(`](${file})`);
  });
});
