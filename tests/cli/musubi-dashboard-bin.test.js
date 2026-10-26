/**
 * `musubi-dashboard` workflow commands (CHANGE-010): create, advance and show print the workflow,
 * not "Unknown" and "N/A".
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/musubi-dashboard.js');

describe('musubi-dashboard workflow commands', () => {
  let projectRoot;

  const run = (...args) =>
    spawnSync(process.execPath, [cli, ...args], { cwd: projectRoot, encoding: 'utf8' }).stdout;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-dashboard-'));
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('shows the feature and its stage after create, advance and show', () => {
    expect(run('create', 'meeting-rsvp')).toMatch(
      /Workflow Dashboard: meeting-rsvp[\s\S]*Current Stage: steering/
    );
    expect(run('advance', 'meeting-rsvp')).toContain('Current Stage: requirements');
    const shown = run('show', 'meeting-rsvp');
    expect(shown).toContain('Current Stage: requirements');
    expect(shown).toContain('Completion: 20%');
    expect(shown).not.toMatch(/Unknown|N\/A/);
  });
});
