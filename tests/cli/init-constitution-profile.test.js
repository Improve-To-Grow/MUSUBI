/**
 * musubi init: project profile (constitution v1.1, "Project Profiles")
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const {
  buildConstitutionYml,
  defaultApplicationPaths,
  CONSTITUTION_PROFILE_CHOICES,
} = require('../../src/cli/init-generators');

describe('init constitution profile', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-init-profile-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('offers the three profiles', () => {
    expect(CONSTITUTION_PROFILE_CHOICES.map(c => c.value)).toEqual([
      'library',
      'cli',
      'application',
    ]);
  });

  it('writes a library or cli profile without paths, so the P-3 defaults apply', () => {
    const config = yaml.load(buildConstitutionYml({ profile: 'cli' }));
    expect(config.constitution).toEqual({ profile: 'cli' });
  });

  it('writes the declared paths of an application (P-4)', () => {
    const config = yaml.load(
      buildConstitutionYml({
        profile: 'application',
        corePaths: 'src/lib',
        deliveryPaths: 'src/app, src/components ,src/hooks',
        adapterPaths: '',
      })
    );
    expect(config.constitution).toEqual({
      profile: 'application',
      core_paths: ['src/lib'],
      delivery_paths: ['src/app', 'src/components', 'src/hooks'],
      adapter_paths: [],
    });
  });

  it('pre-fills src/ paths for a project with a src/ directory', async () => {
    await fs.ensureDir(path.join(tmpDir, 'src'));
    expect(defaultApplicationPaths(tmpDir)).toEqual({
      corePaths: 'src/lib',
      deliveryPaths: 'src/app, src/components, src/hooks',
    });
  });

  it('pre-fills root paths for a project without src/ but with app/', async () => {
    await fs.ensureDir(path.join(tmpDir, 'app'));
    expect(defaultApplicationPaths(tmpDir)).toEqual({
      corePaths: 'lib',
      deliveryPaths: 'app, components, hooks',
    });
  });

  it('ships constitution-levels.yml as a template next to constitution.md', async () => {
    const template = path.join(
      __dirname,
      '../../src/templates/shared/constitution/constitution-levels.yml'
    );
    const config = yaml.load(await fs.readFile(template, 'utf8'));
    expect(config.profile_defaults.application['CONST-001']).toBe('advisory');
  });
});
