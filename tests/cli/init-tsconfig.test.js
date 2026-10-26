/**
 * tsconfig.json written by musubi init (CHANGE-010): the Next.js configuration with the `@/*`
 * alias for the application profile (ITG-GIT-04), the compiled library configuration otherwise.
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { generateDependencyFiles } = require('../../src/cli/init-generators');

describe('init tsconfig.json', () => {
  let projectRoot;
  let cwd;

  beforeEach(async () => {
    cwd = process.cwd();
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-init-tsconfig-'));
    process.chdir(projectRoot);
  });

  afterEach(async () => {
    process.chdir(cwd);
    await fs.remove(projectRoot);
  });

  it('writes the Next.js configuration for the application profile', async () => {
    await generateDependencyFiles('javascript', {
      projectName: 'app',
      constitutionProfile: 'application',
    });
    const { compilerOptions } = await fs.readJson('tsconfig.json');
    expect(compilerOptions).toMatchObject({
      strict: true,
      moduleResolution: 'bundler',
      noEmit: true,
      paths: { '@/*': ['./src/*'] },
    });
  });

  it('keeps the compiled configuration for a library', async () => {
    await generateDependencyFiles('javascript', {
      projectName: 'lib',
      constitutionProfile: 'library',
    });
    const { compilerOptions } = await fs.readJson('tsconfig.json');
    expect(compilerOptions).toMatchObject({ moduleResolution: 'NodeNext', outDir: './dist' });
  });
});
