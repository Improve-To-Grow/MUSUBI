/**
 * `musubi-tasks add` (CHANGE-010): runs unattended when every detail is given as an option
 * (Article II), as `musubi-requirements add` and `musubi-design add-adr` do.
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const TasksGenerator = require('../../src/generators/tasks');

const cli = path.resolve(__dirname, '../../bin/musubi-tasks.js');

describe('musubi-tasks add', () => {
  let projectRoot;

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-tasks-add-'));
    await new TasksGenerator(projectRoot).init('meeting-rsvp');
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('adds the task without prompts', async () => {
    const result = spawnSync(
      process.execPath,
      [
        cli,
        'add',
        'RSVP service',
        ...['-p', 'P0', '--points', '5', '--hours', '6', '-a', 'Kadir'],
        ...['-d', 'Deadline and tenant checks', '-r', 'REQ-MEETING-RSVP-004, REQ-MEETING-RSVP-005'],
        ...['-c', 'answer stored; late answer rejected', '--depends', 'TASK-001'],
      ],
      { cwd: projectRoot, encoding: 'utf8', input: '', timeout: 20000 }
    );

    expect(result.status).toBe(0);
    const file = path.join(projectRoot, 'storage/tasks/meeting-rsvp-tasks.md');
    const content = await fs.readFile(file, 'utf8');
    const section = content.slice(content.indexOf('RSVP service'));
    expect(section).toMatch(/\*\*Priority\*\*: P0/);
    expect(section).toMatch(/\*\*Story Points\*\*: 5/);
    expect(section).toContain('REQ-MEETING-RSVP-005');
    expect(section).toContain('late answer rejected');
    expect(section).toContain('TASK-001');
  });
});
