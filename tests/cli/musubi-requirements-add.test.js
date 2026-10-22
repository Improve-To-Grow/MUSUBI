/**
 * `musubi-requirements add` (CHANGE-009): runs unattended when every field is given as an option
 * (Article II), loads the ESM inquirer and takes the id area from the requirements file.
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/musubi-requirements.js');

describe('musubi-requirements add', () => {
  let projectRoot;
  const file = () => path.join(projectRoot, 'storage/specs/meeting-rsvp-requirements.md');

  const run = (...args) =>
    spawnSync(process.execPath, [cli, ...args], {
      cwd: projectRoot,
      encoding: 'utf8',
      input: '',
      timeout: 20000,
    });

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-requirements-add-'));
    await fs.outputFile(
      file(),
      '# Requirements\n\n## Functional Requirements\n\n## Non-Functional\n'
    );
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('adds a requirement without prompts when -p and -t come with the other fields', async () => {
    const result = run(
      'add',
      ...['-p', 'event', '-t', 'Record an RSVP', '--system', 'RSVP service'],
      ...['-s', 'a member answers an invitation', '-r', 'store the answer'],
      ...['-c', 'answer stored, answer can change']
    );

    expect(result.stderr).not.toMatch(/prompt is not a function|Error/);
    expect(result.status).toBe(0);
    const content = await fs.readFile(file(), 'utf8');
    expect(content).toContain('### REQ-MEETING-RSVP-001: Record an RSVP');
    expect(content).toContain(
      'WHEN a member answers an invitation, THEN the RSVP service SHALL store the answer.'
    );
    expect(content).toContain('- answer can change');
  });

  it('needs no condition for the ubiquitous pattern', async () => {
    const result = run(
      'add',
      ...['-p', 'ubiquitous', '-t', 'List RSVPs', '--system', 'RSVP service'],
      ...['-r', 'list the answers of a meeting', '-c', '']
    );

    expect(result.status).toBe(0);
    expect(await fs.readFile(file(), 'utf8')).toContain(
      'The RSVP service SHALL list the answers of a meeting.'
    );
  });
});
