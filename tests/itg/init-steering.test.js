/**
 * musubi init writes the ITG steering: templates with filled placeholders, the ITG delivery
 * policies and the constitution rules
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const {
  STEERING_TEMPLATES,
  CONSTITUTION_RULES,
  fillPlaceholders,
  writeSteeringTemplates,
  copyConstitutionRules,
} = require('../../src/cli/init-steering');
const { buildConstitutionYml, defaultApplicationPaths } = require('../../src/cli/init-generators');

const POLICY_DIR = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'templates',
  'shared',
  'steering',
  'rules',
  'itg'
);

describe('init steering (ITG)', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-init-itg-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('writes structure.md, tech.md and product.md with no placeholder left', async () => {
    await writeSteeringTemplates(
      { projectName: 'acme-portal', description: 'Portal for $1 & co' },
      tmpDir
    );

    for (const file of STEERING_TEMPLATES) {
      const content = await fs.readFile(path.join(tmpDir, 'steering', file), 'utf8');
      expect(content).not.toMatch(/\{\{[A-Z_]+\}\}/);
      expect(content).toContain('acme-portal');
      expect(content).toContain('**Standard**: ITG Software Delivery Playbook v');
    }
    const product = await fs.readFile(path.join(tmpDir, 'steering', 'product.md'), 'utf8');
    expect(product).toContain('Portal for $1 & co');
  });

  it('starts tech.md from the ITG default stack with Mermaid C4 views', async () => {
    await writeSteeringTemplates({ projectName: 'acme-portal', description: 'x' }, tmpDir);
    const tech = await fs.readFile(path.join(tmpDir, 'steering', 'tech.md'), 'utf8');
    expect(tech).toContain('Cloudflare Workers via OpenNext');
    expect(tech).toContain('```mermaid\nC4Context');
    expect(tech).toContain('```mermaid\nC4Container');
    expect(tech).toContain('## Deviations from the ITG Playbook');
    expect(tech).toContain('acme-portal-staging.improvetogrow.com');
  });

  it('keeps steering files that exist, such as the ones musubi-onboard wrote (CHANGE-010)', async () => {
    await fs.outputFile(path.join(tmpDir, 'steering', 'tech.md'), '# Onboarded stack\n');

    const kept = await writeSteeringTemplates({ projectName: 'p', description: 'd' }, tmpDir);

    expect(kept).toEqual(['steering/tech.md']);
    expect(await fs.readFile(path.join(tmpDir, 'steering', 'tech.md'), 'utf8')).toBe(
      '# Onboarded stack\n'
    );
    expect(await fs.pathExists(path.join(tmpDir, 'steering', 'product.md'))).toBe(true);
  });

  it('installs every ITG policy file', async () => {
    await writeSteeringTemplates({ projectName: 'p', description: 'd' }, tmpDir);
    const expected = (await fs.readdir(POLICY_DIR)).sort();
    const installed = (await fs.readdir(path.join(tmpDir, 'steering', 'rules', 'itg'))).sort();
    expect(installed).toEqual(expected);
    expect(installed).toContain('README.md');
  });

  it('copies the constitution, its levels, the EARS guide and the workflow guide', async () => {
    await copyConstitutionRules(tmpDir);
    for (const file of CONSTITUTION_RULES) {
      expect(await fs.pathExists(path.join(tmpDir, 'steering', 'rules', file))).toBe(true);
    }
    expect(CONSTITUTION_RULES).toEqual(expect.arrayContaining(['ears-format.md', 'workflow.md']));
  });

  it('fills only the placeholders init knows', () => {
    expect(
      fillPlaceholders('{{PROJECT_NAME}} {{DESCRIPTION}} {{DATE}} {{OTHER}}', {
        projectName: 'a',
        description: 'b',
        date: 'c',
      })
    ).toBe('a b c {{OTHER}}');
  });

  it('declares the ITG application paths in project.yml', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src'));
    const paths = defaultApplicationPaths(tmpDir);
    const config = yaml.load(buildConstitutionYml({ profile: 'application', ...paths }));
    expect(config.constitution).toEqual({
      profile: 'application',
      core_paths: ['src/lib'],
      delivery_paths: ['src/app', 'src/components', 'src/features', 'src/middleware'],
      adapter_paths: ['src/lib/auth', 'src/lib/api'],
      levels: { 'CONST-007': 'critical' },
    });
  });
});
