/**
 * `musubi-change` (CHANGE-009): a proposal made by `init` is visible to show, impact and status
 * before approval, `apply` marks it implemented and `archive` moves both records to
 * storage/archive/.
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/musubi-change.js');

describe('musubi-change flow', () => {
  let projectRoot;

  const run = (...args) => {
    const result = spawnSync(process.execPath, [cli, ...args], {
      cwd: projectRoot,
      encoding: 'utf8',
      input: '',
    });
    return { status: result.status, output: result.stdout + result.stderr };
  };

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-change-flow-'));
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('runs init, show, approve, apply and archive on one change', async () => {
    expect(run('init', 'CHANGE-001', '--title', 'Add RSVP').status).toBe(0);

    for (const command of ['show', 'impact']) {
      const result = run(command, 'CHANGE-001');
      expect({ command, status: result.status }).toEqual({ command, status: 0 });
      expect(result.output).not.toContain('Change not found');
    }
    expect(run('status').output).toMatch(/Proposed: +1/);

    expect(run('approve', 'CHANGE-001').status).toBe(0);
    expect(run('list').output).toMatch(/CHANGE-001 +Add RSVP +approved/);
    expect(run('validate-all').output).toContain('Valid:   1');

    const early = run('archive', 'CHANGE-001');
    expect(early.status).toBe(1);
    expect(early.output).toContain('musubi-change apply CHANGE-001');

    expect(run('apply', 'CHANGE-001').output).toContain('Status updated to: implemented');
    expect(run('list').output).toMatch(/CHANGE-001 +Add RSVP +implemented/);

    const archived = run('archive', 'CHANGE-001');
    expect(archived.status).toBe(0);
    for (const rel of [
      'storage/archive/CHANGE-001.json',
      'storage/archive/changes/CHANGE-001.md',
    ]) {
      expect(await fs.pathExists(path.join(projectRoot, rel))).toBe(true);
    }
    expect(await fs.readdir(path.join(projectRoot, 'storage/changes'))).toEqual([]);
    expect(await fs.pathExists(path.join(projectRoot, 'specs'))).toBe(false);
  });
});
