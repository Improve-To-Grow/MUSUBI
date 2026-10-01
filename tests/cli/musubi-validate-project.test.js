/**
 * `musubi-validate project`: full profile-aware validation from the CLI
 * (Article II, II-L1: primary functionality reachable through the CLI)
 */

const { spawnSync } = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const cli = path.resolve(__dirname, '../../bin/musubi-validate.js');

describe('musubi-validate project', () => {
  let projectRoot;

  const run = (...args) =>
    spawnSync(process.execPath, [cli, 'project', ...args], { cwd: projectRoot, encoding: 'utf8' });

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-validate-project-'));
    await fs.outputFile(
      path.join(projectRoot, 'steering/project.yml'),
      'constitution:\n  profile: cli\n  core_paths: [src]\n  delivery_paths: [bin]\n'
    );
    await fs.outputFile(path.join(projectRoot, 'bin/tool.js'), '#!/usr/bin/env node\n');
  });

  afterEach(async () => {
    await fs.remove(projectRoot);
  });

  it('reports the profile and code-size findings and exits 0 without blocking violations', async () => {
    await fs.outputFile(
      path.join(projectRoot, 'src/core/long.js'),
      `/** Sums */\nfunction sum() {\n${'  total++;\n'.repeat(60)}}\nmodule.exports = { sum };\n`
    );
    // Otherwise compliant: coverage configured (III), traceability matrix and IDs in tests (V)
    await fs.outputFile(
      path.join(projectRoot, 'tests/core/long.test.js'),
      "test('REQ-CORE-001: sums', () => {});"
    );
    await fs.outputFile(path.join(projectRoot, 'package.json'), JSON.stringify({ jest: {} }));
    await fs.outputFile(path.join(projectRoot, 'docs/coverage-matrix.md'), '| REQ-CORE-001 |');

    const result = run();

    expect(result.stdout).toContain('Profile: cli');
    expect(result.stdout).toContain('VII-5: 1 function(s) over 50 lines of code');
    expect(result.status).toBe(0);
  });

  it('exits 1 when a critical article has a blocking violation', async () => {
    await fs.outputFile(path.join(projectRoot, 'src/core/index.js'), "require('../../bin/tool');");

    const result = run();

    expect(result.stdout).toContain('I-2');
    expect(result.status).toBe(1);
  });
});
