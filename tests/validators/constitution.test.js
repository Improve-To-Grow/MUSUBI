/**
 * Constitutional Validator Tests
 */

const ConstitutionValidator = require('../../src/validators/constitution');
const path = require('path');

describe('ConstitutionValidator', () => {
  let validator;
  const testProjectRoot = path.join(__dirname, '../fixtures/test-project');

  beforeEach(() => {
    validator = new ConstitutionValidator(testProjectRoot);
  });

  describe('validateArticle1', () => {
    it('should validate Testable-Core Principle', async () => {
      const result = await validator.validateArticle1();
      expect(result.article).toBe(1);
      expect(result.name).toBe('Testable-Core Principle');
      expect(result.passed).toBe(true);
      expect(result.summary).toContain('Testable-Core');
      expect(result.summary).toContain('profile: library');
    });
  });

  describe('validateArticle2', () => {
    it('should validate Automation Interface Mandate', async () => {
      const result = await validator.validateArticle2();
      expect(result.article).toBe(2);
      expect(result.name).toBe('Automation Interface Mandate');
      expect(result.passed).toBe(true);
    });
  });

  describe('application profile (constitution v1.1)', () => {
    const fs = require('fs-extra');
    const os = require('os');
    let appRoot;

    beforeEach(async () => {
      appRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'musubi-constitution-'));
      await fs.outputFile(
        path.join(appRoot, 'steering/project.yml'),
        'constitution:\n  profile: application\n  core_paths: [src/lib]\n  delivery_paths: [src/app]\n'
      );
      await fs.outputFile(path.join(appRoot, 'src/lib/auth/service.ts'), 'export {};');
      await fs.outputFile(path.join(appRoot, 'src/app/api/auth/login/route.ts'), 'export {};');
    });

    afterEach(async () => {
      await fs.remove(appRoot);
    });

    it('should look for core modules in the declared core paths (Article I)', async () => {
      const result = await new ConstitutionValidator(appRoot).validateArticle1();
      expect(result.summary).toContain('profile: application');
      expect(result.warnings.join('\n')).toContain('1 core module(s) in src/lib');
    });

    it('should accept route handlers instead of a CLI (Article II, II-A3)', async () => {
      const result = await new ConstitutionValidator(appRoot).validateArticle2();
      expect(result.warnings.join('\n')).toContain('1 route handler(s) found; no CLI required');
    });

    it('should report code-size findings as warnings (Article VII, VII-5)', async () => {
      await fs.outputFile(
        path.join(appRoot, 'src/lib/auth/long.ts'),
        `/** Sums */\nexport function sum() {\n${'  total++;\n'.repeat(60)}}\n`
      );
      const result = await new ConstitutionValidator(appRoot).validateArticle7();
      expect(result.passed).toBe(true);
      expect(result.warnings.join('\n')).toContain(
        'Article VII: VII-5: 1 function(s) over 50 lines of code: src/lib/auth/long.ts:2 sum (62)'
      );
    });
  });

  describe('validateArticle3', () => {
    it('should detect test files', async () => {
      const result = await validator.validateArticle3();
      expect(result.article).toBe(3);
      expect(result.name).toBe('Test-First Imperative');
      expect(result.passed).toBeDefined();
    });
  });

  describe('validateArticle6', () => {
    it('should validate steering files existence', async () => {
      const result = await validator.validateArticle6();
      expect(result.article).toBe(6);
      expect(result.name).toBe('Project Memory (Steering System)');
      expect(result.passed).toBeDefined();
    });
  });

  describe('validateArticle7', () => {
    it('should count sub-projects and enforce 3-project limit', async () => {
      const result = await validator.validateArticle7();
      expect(result.article).toBe(7);
      expect(result.name).toBe('Simplicity Gate');
      expect(result.summary).toContain('sub-project');
    });
  });

  describe('validateComplexity', () => {
    it('should detect files exceeding 1500 line limit', async () => {
      const result = await validator.validateComplexity();
      expect(result.passed).toBeDefined();
      expect(result.violations).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
    });
  });

  describe('validateGates', () => {
    it('should validate Phase -1 Gates', async () => {
      const result = await validator.validateGates();
      expect(result.gates).toBeDefined();
      expect(result.gates.simplicity).toBeDefined();
      expect(result.gates.abstraction).toBeDefined();
      expect(result.passed).toBeDefined();
    });
  });

  describe('validateAll', () => {
    it('should validate all 9 articles', async () => {
      const result = await validator.validateAll();
      expect(result.passed).toBeDefined();
      expect(result.violations).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.articles).toBeDefined();
      expect(Object.keys(result.articles).length).toBe(9);
    });
  });
});
