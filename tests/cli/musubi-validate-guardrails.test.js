/**
 * `musubi-validate guardrails --constitutional`: the content type is required, because the
 * constitution applies per artifact type (code, test, requirements, design)
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/musubi-validate.js');

describe('musubi-validate guardrails --constitutional', () => {
  let projectRoot;

  const run = (...args) =>
    spawnSync(process.execPath, [cli, 'guardrails', ...args], {
      cwd: projectRoot,
      encoding: 'utf8',
    });

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-validate-guardrails-'));
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('requires --content-type', () => {
    const result = run('const a = 1;', '--type', 'safety', '--constitutional');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('--content-type');
    expect(result.stderr).toContain('code, test, requirements, design');
  });

  it('rejects an unknown content type', () => {
    const result = run('x', '--type', 'safety', '--constitutional', '--content-type', 'chat');

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unknown content type 'chat'");
  });

  it('checks typed content, with the file path from --file', async () => {
    await fs.outputFile(path.join(projectRoot, 'src/x.js'), '// REQ-X-001\nconst a = 1;\n');

    const traced = run(
      '--type',
      'safety',
      '--constitutional',
      '--content-type',
      'code',
      '--file',
      'src/x.js'
    );
    await fs.outputFile(path.join(projectRoot, 'src/y.js'), 'const a = 1;\n');
    const untraced = run(
      '--type',
      'safety',
      '--constitutional',
      '--content-type',
      'code',
      '--file',
      'src/y.js'
    );

    expect(traced.status).toBe(0);
    expect(untraced.status).toBe(1);
    expect(untraced.stdout).toContain('V-2');
  });
});
