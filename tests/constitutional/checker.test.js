/**
 * Constitutional Checker Tests
 *
 * File-level checks of the nine articles of steering/rules/constitution.md (v1.1),
 * with severities that follow the article levels of the project profile.
 *
 * Requirement: IMP-6.2-005-01
 */

const { ConstitutionalChecker, ARTICLES, SEVERITY } = require('../../src/constitutional/checker');
const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const os = require('os');
const path = require('path');

describe('ConstitutionalChecker', () => {
  let checker;
  const testDir = 'test-constitutional-temp';
  const storageDir = `${testDir}/storage/constitutional`;

  beforeEach(async () => {
    checker = new ConstitutionalChecker({ storageDir });
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      /* ignore cleanup errors */
    }
  });

  describe('constructor', () => {
    it('should create checker with default config', () => {
      const c = new ConstitutionalChecker();
      expect(c.config.projectRoot).toBe(process.cwd());
      expect(c.config.storageDir).toBe('storage/constitutional');
    });

    it('should merge custom config', () => {
      const c = new ConstitutionalChecker({ customOption: true });
      expect(c.config.customOption).toBe(true);
    });
  });

  describe('ARTICLES', () => {
    it('should define the nine articles of the constitution', () => {
      expect(Object.keys(ARTICLES)).toEqual([
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
        'VII',
        'VIII',
        'IX',
      ]);
      expect(ARTICLES.I.name).toBe('Testable-Core Principle');
      expect(ARTICLES.VII.name).toBe('Simplicity Gate');
      expect(ARTICLES.VIII.name).toBe('Anti-Abstraction Gate');
      expect(ARTICLES.IX.name).toBe('Integration-First Testing');
    });

    it('should have patterns for Article VIII', () => {
      expect(ARTICLES.VIII.patterns.length).toBeGreaterThan(0);
      expect(ARTICLES.VIII.patterns[0]).toBeInstanceOf(RegExp);
    });
  });

  describe('checkFile', () => {
    it('should pass a traced file that has a test', async () => {
      const filePath = path.join(testDir, 'simple.js');
      await fs.writeFile(filePath, '/** Requirement: REQ-001 */\nconst simple = 1;', 'utf-8');
      await fs.writeFile(path.join(testDir, 'simple.test.js'), '// REQ-001', 'utf-8');

      const result = await checker.checkFile(filePath);

      expect(result.filePath).toBe(filePath);
      expect(result.violations).toEqual([]);
      expect(result.passed).toBe(true);
    });

    it('should report Article VIII abstraction layers as Phase -1 Gate findings', async () => {
      const filePath = path.join(testDir, 'wrapper.js');
      await fs.writeFile(filePath, '// REQ-001\nclass DatabaseWrapper {}', 'utf-8');

      const result = await checker.checkFile(filePath);
      const viii = result.violations.find(v => v.article === 'VIII');

      expect(viii.requirement).toBe('VIII-2');
      expect(viii.severity).toBe(SEVERITY.HIGH);
      expect(viii.articleName).toBe('Anti-Abstraction Gate');
    });

    it('should check EARS format in requirements documents (Article IV)', async () => {
      const filePath = path.join(testDir, 'auth-requirements.md');
      await fs.writeFile(filePath, 'System SHALL send email.', 'utf-8');

      const result = await checker.checkFile(filePath);

      expect(result.violations.map(v => v.requirement)).toEqual(['IV-1']);
      // Article IV is advisory
      expect(result.violations[0].severity).toBe(SEVERITY.MEDIUM);
    });

    it('should return timestamp', async () => {
      const filePath = path.join(testDir, 'test.js');
      await fs.writeFile(filePath, 'const x = 1;', 'utf-8');

      const result = await checker.checkFile(filePath);

      expect(result.checkedAt).toBeDefined();
    });
  });

  describe('checkArticleIII', () => {
    it('should pass when a sibling test file exists', async () => {
      await fs.writeFile(path.join(testDir, 'code.test.js'), 'test("x", () => {})', 'utf-8');

      const findings = await checker.checkArticleIII(path.join(testDir, 'code.js'));
      expect(findings).toEqual([]);
    });

    it('should pass when a mirrored test exists under tests/', async () => {
      const findings = await checker.checkArticleIII(
        path.join('src', 'validators', 'constitutional-validator.js')
      );
      expect(findings).toEqual([]);
    });

    it('should report a missing test file as a non-blocking III-1 finding', async () => {
      const findings = await checker.checkArticleIII(path.join(testDir, 'no-test.js'));

      expect(findings.map(f => f.requirement)).toEqual(['III-1']);
      // Article III is critical, but a missing test file is a heuristic signal
      expect(findings[0].severity).toBe(SEVERITY.HIGH);
    });
  });

  describe('checkArticleV', () => {
    it('should pass when a requirement is referenced', async () => {
      const findings = await checker.checkArticleV('/** Requirement: REQ-001 */', 'service.js');
      expect(findings).toEqual([]);
    });

    it('should report a source file without requirement references (V-2)', async () => {
      const findings = await checker.checkArticleV('function test() {}', 'service.js');
      expect(findings.map(f => f.requirement)).toEqual(['V-2']);
    });

    it('should skip index files', async () => {
      expect(await checker.checkArticleV('module.exports = {}', 'index.js')).toEqual([]);
    });
  });

  describe('checkArticleVIII', () => {
    it('should pass for simple code', async () => {
      expect(await checker.checkArticleVIII('function simple() { return 1; }', 'a.js')).toEqual([]);
    });

    it('should detect abstraction patterns', async () => {
      for (const content of [
        'class Service implements ServiceFactory {}',
        'abstract class BaseService {}',
        'class Service extends BaseService {}',
      ]) {
        const findings = await checker.checkArticleVIII(content, 'a.ts');
        expect(findings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('checkArticleVII (code-size limits)', () => {
    const longFunction = `// REQ-1\nfunction long() {\n${'  x++;\n'.repeat(60)}}\n`;

    it('should report a function over 50 lines of code without a Phase -1 Gate (VII-5)', async () => {
      const filePath = path.join('src', 'long.js');
      const findings = await checker.checkArticleVII(longFunction, filePath);

      expect(findings.map(f => f.requirement)).toEqual(['VII-5']);
      // Article VII is flexible: a code-size finding is MEDIUM and not gated
      expect(findings[0].severity).toBe(SEVERITY.MEDIUM);
      expect(findings[0].gate).toBe(false);
    });

    it('should not require Phase -1 for code-size findings', async () => {
      const filePath = path.join(testDir, 'long.js');
      await fs.writeFile(filePath, longFunction, 'utf-8');
      await fs.writeFile(path.join(testDir, 'long.test.js'), '// REQ-1', 'utf-8');
      const c = new ConstitutionalChecker({ storageDir });
      // Outside core and delivery paths: not a source file in the sense of Article VII
      expect((await c.checkFile(filePath)).violations).toEqual([]);

      const results = {
        results: [
          {
            violations: [
              { article: 'VII', requirement: 'VII-5', severity: SEVERITY.HIGH, gate: false },
            ],
          },
        ],
      };
      expect(c.shouldBlockMerge(results).requiresPhaseMinusOne).toBe(false);
    });

    it('should use configured code limits', async () => {
      const root = await fsExtra.mkdtemp(path.join(os.tmpdir(), 'musubi-checker-limits-'));
      try {
        await fsExtra.outputFile(
          path.join(root, 'steering/project.yml'),
          'constitution:\n  profile: cli\n  core_paths: [src]\n  overrides:\n    code_limits:\n      max_function_lines: 80\n'
        );
        const c = new ConstitutionalChecker({ projectRoot: root });
        expect(await c.checkArticleVII(longFunction, path.join(root, 'src/long.js'))).toEqual([]);
      } finally {
        await fsExtra.remove(root);
      }
    });
  });

  describe('checkArticleIX', () => {
    it('should report unjustified mocks in integration tests', async () => {
      const findings = await checker.checkArticleIX(
        "jest.mock('../src/db');",
        'tests/integration/db.test.js'
      );
      expect(findings.map(f => f.requirement)).toEqual(['IX-5']);
      expect(findings[0].severity).toBe(SEVERITY.MEDIUM);
    });
  });

  describe('application profile', () => {
    let root;
    let appChecker;

    beforeEach(async () => {
      root = await fsExtra.mkdtemp(path.join(os.tmpdir(), 'musubi-checker-'));
      await fsExtra.outputFile(
        path.join(root, 'steering/project.yml'),
        'constitution:\n  profile: application\n  core_paths: [src/lib]\n  delivery_paths: [src/app, src/components]\n'
      );
      for (const file of ['structure.md', 'tech.md', 'product.md']) {
        await fsExtra.outputFile(path.join(root, 'steering', file), '#');
      }
      appChecker = new ConstitutionalChecker({ projectRoot: root });
    });

    afterEach(async () => {
      await fsExtra.remove(root);
    });

    it('should report core imports from delivery paths at the article level (I-3)', async () => {
      const file = path.join(root, 'src/lib/vacancy/rules.ts');
      await fsExtra.outputFile(file, "// REQ-1\nimport type { W } from '@/components/wizard';");
      await fsExtra.outputFile(path.join(root, 'src/lib/vacancy/rules.test.ts'), '// REQ-1');

      const result = await appChecker.checkFile(file);

      expect(result.violations.map(v => v.requirement)).toEqual(['I-3']);
      // Article I is advisory for application
      expect(result.violations[0].severity).toBe(SEVERITY.MEDIUM);
    });

    it('should block definite core/delivery violations once CONST-001 is critical (P-6)', async () => {
      await fsExtra.appendFile(
        path.join(root, 'steering/project.yml'),
        "  levels:\n    'CONST-001': critical\n"
      );
      const file = path.join(root, 'src/lib/ui/provider.tsx');
      await fsExtra.outputFile(file, "// REQ-1\nimport { createContext } from 'react';");
      await fsExtra.outputFile(path.join(root, 'src/lib/ui/provider.test.tsx'), '// REQ-1');

      const results = await new ConstitutionalChecker({ projectRoot: root }).checkFiles([file]);
      const violation = results.results[0].violations[0];

      expect(violation.requirement).toBe('I-A4');
      expect(violation.severity).toBe(SEVERITY.CRITICAL);
      expect(appChecker.shouldBlockMerge(results).shouldBlock).toBe(true);
    });

    it('should report undocumented core exports as LOW (I-5, advisory)', async () => {
      const file = path.join(root, 'src/lib/auth/service.ts');
      await fsExtra.outputFile(file, '// REQ-1\nexport function login() {}');
      await fsExtra.outputFile(path.join(root, 'src/lib/auth/service.test.ts'), '// REQ-1');

      const result = await appChecker.checkFile(file);

      expect(result.violations.map(v => v.requirement)).toEqual(['I-5']);
      expect(result.violations[0].severity).toBe(SEVERITY.LOW);
    });

    it('should check machine-facing endpoints for schema validation (II-A4)', async () => {
      const file = path.join(root, 'src/app/api/webhooks/n8n/route.ts');
      await fsExtra.outputFile(file, '// REQ-1\nexport async function POST() {}');

      const result = await appChecker.checkFile(file);

      expect(result.violations.map(v => v.requirement)).toContain('II-A4');
    });
  });

  describe('project-level checks', () => {
    let root;

    beforeEach(async () => {
      root = await fsExtra.mkdtemp(path.join(os.tmpdir(), 'musubi-checker-project-'));
    });

    afterEach(async () => {
      await fsExtra.remove(root);
    });

    it('should add Article VI and VII findings as a project result', async () => {
      await fsExtra.outputFile(path.join(root, 'package.json'), '{}');
      for (const name of ['a', 'b', 'c']) {
        await fsExtra.outputFile(path.join(root, 'packages', name, 'package.json'), '{}');
      }
      const file = path.join(root, 'a.js');
      await fsExtra.outputFile(file, '// REQ-1');
      await fsExtra.outputFile(path.join(root, 'a.test.js'), '// REQ-1');

      const c = new ConstitutionalChecker({ projectRoot: root });
      const results = await c.checkFiles([file]);
      const project = results.results.find(r => r.scope === 'project');

      expect(results.summary.filesChecked).toBe(1);
      expect(results.summary.filesPassed).toBe(1);
      expect(project.violations.map(v => v.requirement)).toEqual(['VI-1', 'VI-2', 'VI-3', 'VII-2']);
      expect(c.shouldBlockMerge(results).requiresPhaseMinusOne).toBe(true);
    });
  });

  describe('checkFiles', () => {
    it('should check multiple files', async () => {
      const file1 = path.join(testDir, 'a.js');
      const file2 = path.join(testDir, 'b.js');
      await fs.writeFile(file1, '/** Requirement: R1 */ const a = 1;', 'utf-8');
      await fs.writeFile(file2, '/** Requirement: R2 */ const b = 2;', 'utf-8');

      const result = await checker.checkFiles([file1, file2]);

      expect(result.results.length).toBe(2);
      expect(result.summary.totalViolations).toBeDefined();
    });

    it('should summarize violations by article', async () => {
      const filePath = path.join(testDir, 'violations.js');
      await fs.writeFile(filePath, 'class HttpWrapper {}', 'utf-8');

      const result = await checker.checkFiles([filePath]);

      expect(result.summary.totalViolations).toBeGreaterThan(0);
      expect(result.summary.violationsByArticle.VIII).toBe(1);
    });
  });

  describe('shouldBlockMerge', () => {
    it('should not block when no violations', () => {
      const decision = checker.shouldBlockMerge({ results: [{ violations: [] }] });
      expect(decision.shouldBlock).toBe(false);
    });

    it('should not block for low severity violations', () => {
      const decision = checker.shouldBlockMerge({
        results: [{ violations: [{ article: 'IX', severity: SEVERITY.LOW }] }],
      });
      expect(decision.shouldBlock).toBe(false);
    });

    it('should block for critical violations', () => {
      const decision = checker.shouldBlockMerge({
        results: [{ violations: [{ article: 'I', severity: SEVERITY.CRITICAL }] }],
      });
      expect(decision.shouldBlock).toBe(true);
    });

    it('should trigger Phase -1 for Article VII high severity', () => {
      const decision = checker.shouldBlockMerge({
        results: [{ violations: [{ article: 'VII', severity: SEVERITY.HIGH }] }],
      });
      expect(decision.requiresPhaseMinusOne).toBe(true);
    });

    it('should trigger Phase -1 for Article VIII violations', () => {
      const decision = checker.shouldBlockMerge({
        results: [{ violations: [{ article: 'VIII', severity: SEVERITY.HIGH }] }],
      });
      expect(decision.requiresPhaseMinusOne).toBe(true);
    });
  });

  describe('checkDirectory', () => {
    it('should check all JS files in directory', async () => {
      const dir = path.join(testDir, 'src');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, 'a.js'), '/** Requirement: R */ const x = 1;', 'utf-8');
      await fs.writeFile(path.join(dir, 'b.js'), '/** Requirement: R */ const y = 2;', 'utf-8');
      await fs.writeFile(path.join(dir, 'c.txt'), 'not js', 'utf-8');

      const result = await checker.checkDirectory(dir);

      expect(result.results.length).toBe(2);
    });

    it('should respect file extension filter', async () => {
      const dir = path.join(testDir, 'mixed');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, 'a.ts'), '// ts file', 'utf-8');
      await fs.writeFile(path.join(dir, 'b.js'), '// js file', 'utf-8');

      const result = await checker.checkDirectory(dir, { extensions: ['.ts'] });

      expect(result.results.length).toBe(1);
    });
  });

  describe('generateReport', () => {
    it('should generate markdown report', async () => {
      const file = path.join(testDir, 'report-test.js');
      await fs.writeFile(file, '/** Requirement: R1 */ const x = 1;', 'utf-8');

      const results = await checker.checkFiles([file]);
      const report = checker.generateReport(results);

      expect(report).toContain('Constitutional');
      expect(report).toContain('Summary');
    });

    it('should include violation details with requirement IDs', async () => {
      const file = path.join(testDir, 'violation.js');
      await fs.writeFile(file, '// REQ-1\nclass ApiWrapper {}', 'utf-8');

      const results = await checker.checkFiles([file]);
      const report = checker.generateReport(results);

      expect(report).toContain('Article VIII');
      expect(report).toContain('Anti-Abstraction Gate');
      expect(report).toContain('VIII-2');
    });
  });

  describe('saveResults', () => {
    it('should save check results', async () => {
      const results = {
        results: [],
        summary: { totalViolations: 0 },
        checkedAt: new Date().toISOString(),
      };

      await checker.saveResults('feature-1', results);

      const savedPath = path.join(storageDir, 'feature-1.json');
      const saved = JSON.parse(await fs.readFile(savedPath, 'utf-8'));
      expect(saved.summary.totalViolations).toBe(0);
    });
  });

  describe('loadResults', () => {
    it('should load saved results', async () => {
      const results = {
        results: [],
        summary: { totalViolations: 5 },
        checkedAt: new Date().toISOString(),
      };

      await checker.saveResults('feature-2', results);
      const loaded = await checker.loadResults('feature-2');

      expect(loaded.summary.totalViolations).toBe(5);
    });

    it('should return null for non-existent results', async () => {
      const loaded = await checker.loadResults('non-existent');
      expect(loaded).toBeNull();
    });
  });
});
