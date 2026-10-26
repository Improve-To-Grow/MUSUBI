/**
 * `musubi-release status` (CHANGE-010): a repository without tags reports "No tags found" without
 * git's own error output.
 */

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/musubi-release.js');

describe('musubi-release status', () => {
  let projectRoot;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-release-'));
    await fs.writeJson(path.join(projectRoot, 'package.json'), { name: 'app', version: '0.1.0' });
    const git = (...args) => execFileSync('git', args, { cwd: projectRoot, stdio: 'ignore' });
    git('init', '-q');
    git('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'base');
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('reports no tags without printing git errors', () => {
    const result = spawnSync(process.execPath, [cli, 'status'], {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    expect(result.stdout).toContain('No tags found');
    expect(result.stdout + result.stderr).not.toContain('fatal:');
  });
});
