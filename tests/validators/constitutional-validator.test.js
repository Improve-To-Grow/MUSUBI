/**
 * Constitutional Validator Tests
 *
 * Profile-aware validation of Articles I and II (constitution v1.1, "Project Profiles")
 * and the cross-platform fixes for Article III and glob handling.
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const { ConstitutionalValidator } = require('../../src/validators/constitutional-validator');

describe('ConstitutionalValidator', () => {
  let projectRoot;

  const write = async (relPath, content = '') => {
    const filePath = path.join(projectRoot, relPath);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  };

  const writeProfile = constitution =>
    write('steering/project.yml', yaml.dump({ name: 'fixture', constitution }));

  const validate = async (options = {}) => {
    const validator = new ConstitutionalValidator(projectRoot, options);
    return validator.validateAll();
  };

  const findingsFor = (report, articleId) => ({
    passes: report.passes.filter(f => f.articleId === articleId),
    warnings: report.warnings.filter(f => f.articleId === articleId),
    violations: report.violations.filter(f => f.articleId === articleId),
  });

  const messages = list => list.map(f => f.message).join('\n');

  beforeEach(async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-validator-'));
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    console.log.mockRestore();
    await fs.remove(projectRoot);
  });

  describe('library profile (default, P-2)', () => {
    it('applies the library profile and warns that none is declared (P-1)', async () => {
      await write('lib/auth/index.js', 'module.exports = {};');
      await write('lib/auth/tests/auth.test.js', "test('x', () => {});");

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(report.summary.profile).toBe('library');
      expect(messages(articleI.warnings)).toMatch(/P-1/);
      expect(articleI.violations).toHaveLength(0);
    });

    it('finds co-located test files with platform-independent glob patterns (I-2)', async () => {
      await write('lib/auth/index.js', 'module.exports = {};');
      await write('lib/auth/auth.test.js', "test('x', () => {});");

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(messages(articleI.violations)).not.toMatch(/has no tests/);
    });

    it('blocks on a core module without tests, because Article I is critical (I-2)', async () => {
      await write('lib/auth/index.js', 'module.exports = {};');

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(articleI.violations).toHaveLength(1);
      expect(articleI.violations[0].message).toMatch(/I-2: Core module 'lib\/auth' has no tests/);
      expect(articleI.violations[0].blocking).toBe(true);
    });

    it('accepts tests in a root test directory that mirrors the module (I-2)', async () => {
      await write('lib/auth/index.js', 'module.exports = {};');
      await write('tests/auth/index.test.js', "test('x', () => {});");

      const report = await validate();

      expect(findingsFor(report, 'CONST-001').violations).toHaveLength(0);
    });

    it('does not treat src/ folders as libraries when no core path is declared (P-3)', async () => {
      await writeProfile({ profile: 'library' });
      await write('lib/auth/index.js', 'module.exports = {};');
      await write('lib/auth/auth.test.js', "test('x', () => {});");
      await write('src/messages/en.json', '{}');
      await write('src/locales/index.js', 'module.exports = {};');

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(messages([...articleI.violations, ...articleI.warnings])).not.toMatch(
        /messages|locales/
      );
    });

    it('reports the CLI entry point check under II-L1', async () => {
      await writeProfile({ profile: 'library' });
      await write('lib/auth/index.js', 'module.exports = {};');
      await write('lib/auth/auth.test.js', "test('x', () => {});");

      const report = await validate();
      const articleII = findingsFor(report, 'CONST-002');

      // Article II is advisory for library (P-5)
      expect(articleII.violations).toHaveLength(0);
      expect(messages(articleII.warnings)).toMatch(/II-L1/);
    });
  });

  describe('cli profile', () => {
    it('blocks on a missing CLI, because Article II is critical for cli (P-5)', async () => {
      await writeProfile({ profile: 'cli' });
      await write('lib/auth/index.js', 'module.exports = {};');
      await write('lib/auth/auth.test.js', "test('x', () => {});");

      const report = await validate();
      const articleII = findingsFor(report, 'CONST-002');

      expect(articleII.violations).toHaveLength(1);
      expect(articleII.violations[0].blocking).toBe(true);
      expect(articleII.violations[0].message).toMatch(/II-L1/);
    });

    it('reports imports from declared delivery paths into core paths (I-3)', async () => {
      await writeProfile({ profile: 'cli', core_paths: ['src'], delivery_paths: ['bin'] });
      await write('bin/tool.js', "require('../src/core');");
      await write('src/core/index.js', "const cli = require('../../bin/tool');");
      await write('tests/core/index.test.js', "test('x', () => {});");

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(messages(articleI.violations)).toMatch(/I-3: .*src\/core\/index\.js → bin\/tool/);
    });
  });

  describe('application profile', () => {
    const scaffoldApplication = async (constitution = {}) => {
      await writeProfile({
        profile: 'application',
        core_paths: ['src/lib'],
        delivery_paths: ['src/app', 'src/components', 'src/hooks'],
        adapter_paths: ['src/lib/server'],
        ...constitution,
      });
      await write('src/lib/auth/service.ts', '/** Logs a user in */\nexport function login() {}');
      await write('src/lib/auth/service.test.ts', "test('x', () => {});");
      await write(
        'src/app/api/auth/login/route.ts',
        "import { z } from 'zod';\nimport { login } from '@/lib/auth/service';"
      );
      await write('package.json', JSON.stringify({ name: 'app', scripts: { dev: 'next dev' } }));
    };

    it('passes a clean application without requiring a CLI (II-A3)', async () => {
      await scaffoldApplication();

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');
      const articleII = findingsFor(report, 'CONST-002');

      expect(report.summary.profile).toBe('application');
      expect(articleI.violations).toHaveLength(0);
      expect(articleI.warnings).toHaveLength(0);
      expect(articleII.violations).toHaveLength(0);
      expect(messages([...articleII.warnings, ...articleII.passes])).not.toMatch(/No CLI/);
      expect(messages(articleII.passes)).toMatch(/II-A1/);
    });

    it('requires declared core and delivery paths (P-4)', async () => {
      await writeProfile({ profile: 'application' });
      await write('src/lib/auth/service.ts', 'export function login() {}');

      const report = await validate();

      expect(messages(findingsFor(report, 'CONST-001').warnings)).toMatch(/P-4/);
    });

    it('reports core imports from delivery paths through the @/ alias as advisory (I-3, P-5)', async () => {
      await scaffoldApplication();
      await write(
        'src/lib/vacancy/rules.ts',
        "import type { WizardData } from '@/components/features/wizard';\nexport const rules = [];"
      );
      await write('src/lib/vacancy/rules.test.ts', "test('x', () => {});");

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(articleI.violations).toHaveLength(0);
      expect(messages(articleI.warnings)).toMatch(
        /I-3: .*src\/lib\/vacancy\/rules\.ts → src\/components\/features\/wizard/
      );
    });

    it('blocks on core/delivery violations once CONST-001 is promoted to critical (P-6)', async () => {
      await scaffoldApplication({ levels: { 'CONST-001': 'critical' } });
      await write('src/lib/swr/provider.tsx', 'export function Provider() { return null; }');
      await write('src/lib/swr/provider.test.tsx', "test('x', () => {});");

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(articleI.violations).toHaveLength(1);
      expect(articleI.violations[0].message).toMatch(/I-A4: .*src\/lib\/swr\/provider\.tsx/);
      expect(articleI.violations[0].blocking).toBe(true);
    });

    it('never blocks on an advisory-tagged requirement (I-A5)', async () => {
      await scaffoldApplication({ levels: { 'CONST-001': 'critical' } });
      await write('src/lib/auth/session.ts', "import { cookies } from 'next/headers';");
      await write('src/lib/server/authorization.ts', "import { headers } from 'next/headers';");

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(articleI.violations).toHaveLength(0);
      expect(messages(articleI.warnings)).toMatch(/I-A5: .*src\/lib\/auth\/session\.ts/);
      expect(messages(articleI.warnings)).not.toMatch(/authorization\.ts/);
    });

    it('reports machine-facing endpoints without schema validation (II-A4)', async () => {
      await scaffoldApplication();
      await write(
        'src/app/api/webhooks/n8n/route.ts',
        'export async function POST(req) { const body = await req.json(); }'
      );
      await write(
        'src/app/api/integrations/wordpress/route.ts',
        "import { z } from 'zod';\nconst Schema = z.object({});"
      );

      const report = await validate();
      const text = messages(findingsFor(report, 'CONST-002').warnings);

      expect(text).toMatch(/II-A4: .*src\/app\/api\/webhooks\/n8n\/route\.ts/);
      expect(text).not.toMatch(/wordpress/);
    });

    it('reports package.json scripts that reference missing files (II-A10)', async () => {
      await scaffoldApplication();
      await write(
        'package.json',
        JSON.stringify({
          name: 'app',
          scripts: {
            seed: 'node scripts/seed.js --env=dev',
            e2e: 'node scripts/start-e2e-dev.js && playwright test',
            lint: 'eslint "src/**/*.ts"',
            ok: 'tsx scripts/ok.ts',
          },
        })
      );
      await write('scripts/ok.ts', "if (process.argv.includes('--help')) {}");

      const report = await validate();
      const text = messages(findingsFor(report, 'CONST-002').warnings);

      expect(text).toMatch(/II-A10: .*seed → scripts\/seed\.js/);
      expect(text).toMatch(/e2e → scripts\/start-e2e-dev\.js/);
      expect(text).not.toMatch(/scripts\/ok\.ts/);
    });

    it('warns about operational scripts without --help (II-A7)', async () => {
      await scaffoldApplication();
      await write('scripts/reset-process-data.js', 'console.log("reset");');

      const report = await validate();

      expect(messages(findingsFor(report, 'CONST-002').warnings)).toMatch(
        /II-A7: .*scripts\/reset-process-data\.js/
      );
    });
  });

  describe('code-size limits and documented exports (VII-4 to VII-6, I-5)', () => {
    const body = n => Array.from({ length: n }, (_, i) => `  total += ${i};`).join('\n');

    beforeEach(async () => {
      await writeProfile({
        profile: 'application',
        core_paths: ['src/lib'],
        delivery_paths: ['src/app'],
        levels: { 'CONST-001': 'critical' },
      });
      await write('src/lib/calc/calc.test.ts', "test('x', () => {});");
    });

    it('reports long functions, large files and many imports as non-blocking warnings', async () => {
      await write('src/lib/calc/long.ts', `/** Sums */\nexport function sum() {\n${body(60)}\n}`);
      await write('src/lib/calc/big.ts', 'const x = 1;\n'.repeat(520));
      const imports = Array.from({ length: 11 }, (_, i) => `import m${i} from 'm${i}';`).join('\n');
      await write('src/app/page.ts', imports);
      await write('src/lib/calc/index.ts', imports);

      const report = await validate();
      const articleVII = findingsFor(report, 'CONST-007');
      const text = messages(articleVII.warnings);

      expect(articleVII.violations).toHaveLength(0);
      expect(text).toMatch(
        /VII-4: 1 source file\(s\) over 500 lines of code: src\/lib\/calc\/big\.ts \(520\)/
      );
      expect(text).toMatch(
        /VII-5: 1 function\(s\) over 50 lines of code: src\/lib\/calc\/long\.ts:2 sum \(62\)/
      );
      expect(text).toMatch(
        /VII-6: 1 source file\(s\) import more than 10 modules: src\/app\/page\.ts \(11\)/
      );
      expect(text).not.toMatch(/index\.ts/);
    });

    it('passes when source files stay within the limits', async () => {
      await write('src/lib/calc/short.ts', `/** Sums */\nexport function sum() {\n${body(10)}\n}`);

      const report = await validate();

      expect(messages(findingsFor(report, 'CONST-007').passes)).toMatch(/VII-4–VII-6/);
    });

    it('reports undocumented core exports as advisory, even when Article I is critical (I-5)', async () => {
      await write('src/lib/calc/short.ts', 'export function sum() {}\nexport class Calculator {}');

      const report = await validate();
      const articleI = findingsFor(report, 'CONST-001');

      expect(articleI.violations).toHaveLength(0);
      expect(messages(articleI.warnings)).toMatch(
        /I-5: 2 exported function\(s\) or class\(es\) without a doc comment: src\/lib\/calc\/short\.ts \(sum, Calculator\)/
      );
    });
  });

  describe('Article III', () => {
    it('accepts co-located tests without a test directory', async () => {
      await write('src/lib/auth/service.test.ts', "test('x', () => {});");
      await write('package.json', JSON.stringify({ name: 'app', jest: {} }));

      const report = await validate();

      expect(messages(findingsFor(report, 'CONST-003').violations)).not.toMatch(
        /No test directory found|No tests found/
      );
    });
  });
});
