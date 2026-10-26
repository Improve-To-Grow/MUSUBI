/**
 * `musubi-trace matrix --output` (CHANGE-010): creates the output folder, so the scaffold's CI
 * constitution job runs on a new project, which has no storage/traceability/ yet.
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/musubi-trace.js');

describe('musubi-trace matrix --output', () => {
  let projectRoot;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-trace-output-'));
    await fs.outputFile(
      path.join(projectRoot, 'storage/specs/rsvp-requirements.md'),
      '### REQ-MEETING-RSVP-001: Record\n\nThe RSVP service SHALL store answers.\n'
    );
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('writes storage/traceability/matrix.md when the folder does not exist', async () => {
    const result = spawnSync(
      process.execPath,
      [cli, 'matrix', '--format', 'markdown', '--output', 'storage/traceability/matrix.md'],
      { cwd: projectRoot, encoding: 'utf8' }
    );

    expect(result.status).toBe(0);
    const matrix = await fs.readFile(
      path.join(projectRoot, 'storage/traceability/matrix.md'),
      'utf8'
    );
    expect(matrix).toContain('REQ-MEETING-RSVP-001');
  });
});
