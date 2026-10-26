/**
 * `musubi-upgrade` project version (CHANGE-009): read from steering/.musubi-version, else from
 * project.yml metadata, and set to the target after an upgrade, so `check` stops reporting 6.0.0.
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const { version } = require('../../package.json');

const cli = path.resolve(__dirname, '../../bin/musubi-upgrade.js');

describe('musubi-upgrade version', () => {
  let projectRoot;

  const run = (...args) =>
    spawnSync(process.execPath, [cli, ...args], { cwd: projectRoot, encoding: 'utf8' }).stdout;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-upgrade-'));
    await fs.ensureDir(path.join(projectRoot, 'steering'));
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('reads the version from project.yml metadata when there is no marker', async () => {
    await fs.writeFile(
      path.join(projectRoot, 'steering/project.yml'),
      `metadata:\n  musubi_version: "${version}"\n`
    );
    expect(run('check')).toContain(`Project version: ${version}`);
  });

  it('sets the marker to the target version after an upgrade', async () => {
    expect(run('check')).toContain('Project version: 6.0.0');

    run();

    expect(await fs.readFile(path.join(projectRoot, 'steering/.musubi-version'), 'utf8')).toBe(
      `${version}\n`
    );
    expect(run('check')).toContain('Project is up to date');
  });
});
