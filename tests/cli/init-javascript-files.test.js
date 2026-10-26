/**
 * JavaScript project files written by musubi init (CHANGE-010): for the application profile the
 * Next.js tsconfig.json with the `@/*` alias (ITG-GIT-04), a package.json on the ITG stack with the
 * tools the scaffold's CI runs, and .nvmrc; the compiled library configuration otherwise.
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { generateDependencyFiles } = require('../../src/cli/init-generators');

describe('init JavaScript files', () => {
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
      // The values next build writes, so it leaves the file unchanged (CHANGE-012)
      jsx: 'react-jsx',
    });
    expect((await fs.readJson('tsconfig.json')).include).toContain('.next/dev/types/**/*.ts');
  });

  it('writes a package.json on the ITG stack and .nvmrc for the application profile', async () => {
    await generateDependencyFiles('javascript', {
      projectName: 'Meeting App',
      constitutionProfile: 'application',
    });
    const pkg = await fs.readJson('package.json');

    expect(pkg).toMatchObject({ name: 'meeting-app', private: true });
    // The scripts of the Project Setup Guide §10.2 (CHANGE-011)
    expect(pkg.scripts).toMatchObject({
      'cf:build': 'opennextjs-cloudflare build',
      'cf:preview': 'opennextjs-cloudflare build && opennextjs-cloudflare preview',
      'format:check': 'prettier --check .',
      'audit:catalogue': 'node scripts/checks/check-audit-catalogue.mjs --write',
      test: 'vitest run',
    });
    expect(Object.keys(pkg.dependencies)).toEqual(['next', 'react', 'react-dom']);
    expect(Object.keys(pkg.devDependencies)).toEqual(
      expect.arrayContaining([
        'vitest',
        'knip',
        'eslint-config-next',
        'eslint-plugin-security',
        '@opennextjs/cloudflare',
      ])
    );
    // The scaffold's eslint.config.mjs loads only these; eslint-config-next brings typescript-eslint
    for (const unused of ['jest', 'typescript-eslint', '@eslint/js', 'globals']) {
      expect(pkg.devDependencies).not.toHaveProperty(unused);
    }
    expect(pkg.devDependencies.eslint).toMatch(/^\^9\./);
    expect(await fs.readFile('.nvmrc', 'utf8')).toBe('22\n');
  });

  it('keeps an existing package.json', async () => {
    await fs.writeJson('package.json', { name: 'legacy' });
    await generateDependencyFiles('javascript', {
      projectName: 'x',
      constitutionProfile: 'application',
    });
    expect(await fs.readJson('package.json')).toEqual({ name: 'legacy' });
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
