/**
 * @fileoverview Tests for SafetyCheckGuardrail
 *
 * @version 3.9.0
 */

'use strict';

const {
  SafetyCheckGuardrail,
  createSafetyCheckGuardrail,
  SafetyLevel,
  ConstitutionalMapping,
  GuardrailTripwireException,
  GuardrailPhase,
  CONTENT_TYPES,
  NOT_APPLICABLE,
} = require('../../../src/orchestration/guardrails');

describe('SafetyCheckGuardrail', () => {
  describe('constructor', () => {
    test('should create with default configuration', () => {
      const guardrail = new SafetyCheckGuardrail();

      expect(guardrail.name).toBe('SafetyCheckGuardrail');
      expect(guardrail.level).toBe(SafetyLevel.STANDARD);
      expect(guardrail.enforceConstitution).toBe(false);
      // Constitutional checks apply to what a skill produces
      expect(guardrail.phase).toBe(GuardrailPhase.POST);
    });

    test('should create with custom safety level', () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.STRICT,
      });

      expect(guardrail.level).toBe(SafetyLevel.STRICT);
    });

    test('should enable constitutional compliance', () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
      });

      expect(guardrail.enforceConstitution).toBe(true);
    });

    test('should accept custom checks', () => {
      const guardrail = new SafetyCheckGuardrail({
        customChecks: {
          lengthCheck: input => ({ passed: input.length < 100, score: 0.8 }),
        },
      });

      expect(Object.keys(guardrail.customChecks)).toHaveLength(1);
    });
  });

  describe('check() - Basic Level', () => {
    test('should pass valid content', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
      });

      const result = await guardrail.run('Hello, World!');

      expect(result.passed).toBe(true);
    });

    test('should fail on empty content', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
      });

      const result = await guardrail.run('');

      expect(result.passed).toBe(false);
    });
  });

  describe('check() - Standard Level', () => {
    test('should pass safe content', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.STANDARD,
      });

      const result = await guardrail.run('This is a normal message.');

      expect(result.passed).toBe(true);
    });

    test('should detect SQL injection', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.STANDARD,
      });

      const result = await guardrail.run('SELECT * FROM users WHERE id = 1; DROP TABLE users;');

      expect(result.passed).toBe(false);
    });

    test('should detect XSS', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.STANDARD,
      });

      const result = await guardrail.run('<script>alert("xss")</script>');

      expect(result.passed).toBe(false);
    });
  });

  describe('check() - Strict Level', () => {
    test('should detect PII', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.STRICT,
      });

      const result = await guardrail.run('Contact me at user@example.com');

      expect(result.passed).toBe(false);
    });

    test('should pass clean content', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.STRICT,
      });

      const result = await guardrail.run('This is a clean message without PII.');

      expect(result.passed).toBe(true);
    });
  });

  describe('check() - Paranoid Level', () => {
    test('should detect prohibited words', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.PARANOID,
      });

      const result = await guardrail.run('How to hack the system');

      expect(result.passed).toBe(false);
    });

    test('should enforce max length', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.PARANOID,
      });

      const longContent = 'a'.repeat(15000);
      const result = await guardrail.run(longContent);

      expect(result.passed).toBe(false);
    });
  });

  describe('Constitutional Compliance', () => {
    const applicationProfile = {
      profile: 'application',
      corePaths: ['src/lib'],
      deliveryPaths: ['src/app', 'src/components'],
      adapterPaths: [],
    };
    const ALL_ARTICLES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

    const constitutionalCodes = result =>
      result.metadata.constitutionalViolations.map(v => v.context.requirement);

    test('should not run injection detection on typed artifacts', async () => {
      // Code and documents legitimately contain braces, `--` flags, table rules and comments
      const guardrail = new SafetyCheckGuardrail({ level: SafetyLevel.STRICT });
      const code = 'function f(a) { return a; } /* note */';

      expect((await guardrail.run(code, { contentType: 'code' })).passed).toBe(true);
      expect((await guardrail.run(code)).passed).toBe(false);
    });

    test('should fail unclassified content: the caller must set contentType', async () => {
      const guardrail = new SafetyCheckGuardrail({ enforceConstitution: true });

      const result = await guardrail.run('Test content', { requirementId: 'REQ-001' });

      expect(result.passed).toBe(false);
      expect(result.violations.map(v => v.code)).toContain('CONSTITUTIONAL_UNCLASSIFIED');
      expect(result.metadata.scores.constitutional).toBeNull();
      for (const article of ALL_ARTICLES) {
        expect(result.metadata.articleScores[article]).toBe(NOT_APPLICABLE);
      }
    });

    test('should fail an unknown contentType', async () => {
      const guardrail = new SafetyCheckGuardrail({ enforceConstitution: true });

      const result = await guardrail.run('Test content', { contentType: 'chat' });

      expect(result.passed).toBe(false);
      expect(result.violations[0].message).toContain("Unknown contentType 'chat'");
      expect(CONTENT_TYPES).toEqual(['code', 'test', 'requirements', 'design']);
    });

    test('should score articles that do not apply as not applicable', async () => {
      const guardrail = new SafetyCheckGuardrail({ enforceConstitution: true });

      const result = await guardrail.run('// REQ-001\nconst total = 1;', {
        contentType: 'code',
      });

      expect(result.passed).toBe(true);
      expect(result.metadata.articleScores).toEqual({
        I: NOT_APPLICABLE,
        II: NOT_APPLICABLE,
        III: NOT_APPLICABLE,
        IV: NOT_APPLICABLE,
        V: 1,
        VI: NOT_APPLICABLE,
        VII: 1,
        VIII: 1,
        IX: NOT_APPLICABLE,
      });
      // Only applicable articles count towards the score
      expect(result.metadata.scores.constitutional).toBe(1);
    });

    test('Article I: should fail core code that imports from a delivery path', async () => {
      const guardrail = new SafetyCheckGuardrail({ enforceConstitution: true });

      const result = await guardrail.run("import { W } from '@/components/wizard';", {
        contentType: 'code',
        filePath: 'src/lib/vacancy/rules.ts',
        profile: { ...applicationProfile },
        levels: { 'CONST-001': 'critical' },
        requirementId: 'REQ-1',
      });

      expect(result.passed).toBe(false);
      expect(constitutionalCodes(result)).toEqual(['I-3']);
      expect(result.metadata.articleScores.I).toBe(0);
    });

    test('Article I: should only warn while the article is advisory', async () => {
      const guardrail = new SafetyCheckGuardrail({ enforceConstitution: true });

      const result = await guardrail.run("import { W } from '@/components/wizard';", {
        contentType: 'code',
        filePath: 'src/lib/vacancy/rules.ts',
        profile: applicationProfile,
        requirementId: 'REQ-1',
      });

      expect(result.passed).toBe(true);
      expect(result.metadata.constitutionalViolations[0].severity).toBe('warning');
      expect(result.metadata.articleScores.I).toBe(0.5);
    });

    test('Article I: should warn about undocumented core exports (I-5)', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['TESTABLE_CORE'],
      });

      const result = await guardrail.run('export function login() {}', {
        contentType: 'code',
        filePath: 'src/lib/auth/service.ts',
        profile: applicationProfile,
        levels: { 'CONST-001': 'critical' },
      });

      expect(constitutionalCodes(result)).toEqual(['I-5']);
      expect(result.passed).toBe(true);
    });

    test('Article III: should fail when tests were not written first', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['TEST_FIRST'],
      });

      const result = await guardrail.run('const x = 1;', {
        contentType: 'code',
        testsWritten: false,
      });

      expect(result.passed).toBe(false);
      expect(constitutionalCodes(result)).toEqual(['III-1']);
    });

    test('Article IV: should check requirements for EARS', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['EARS_FORMAT'],
      });

      const result = await guardrail.run('The system should send email.', {
        contentType: 'requirements',
      });

      expect(constitutionalCodes(result)).toEqual(['IV-1']);
    });

    test('Article V: should require a requirement reference in code', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['TRACEABILITY'],
      });

      const failing = await guardrail.run('const x = 1;', {
        contentType: 'code',
        filePath: 'src/x.js',
      });
      const passing = await guardrail.run('const x = 1;', {
        contentType: 'code',
        filePath: 'src/x.js',
        requirementId: 'REQ-X-001',
      });

      expect(failing.passed).toBe(false);
      expect(constitutionalCodes(failing)).toEqual(['V-2']);
      expect(passing.passed).toBe(true);
    });

    test('Article V: should require a coverage matrix in a design document (V-5)', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['TRACEABILITY'],
      });

      const missing = await guardrail.run('# Design\n\nThe service stores orders.', {
        contentType: 'design',
      });
      const present = await guardrail.run(
        '# Design\n\n| Requirement | Component |\n| --- | --- |\n| REQ-ORD-001 | OrderService |',
        { contentType: 'design' }
      );

      expect(constitutionalCodes(missing)).toEqual(['V-5']);
      expect(missing.passed).toBe(false);
      expect(present.passed).toBe(true);
    });

    test('Article VI: should warn when steering was not read', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['PROJECT_MEMORY'],
      });

      const result = await guardrail.run('// REQ-1', {
        contentType: 'code',
        steeringLoaded: false,
      });

      expect(constitutionalCodes(result)).toEqual(['VI-4']);
      expect(result.passed).toBe(true);
    });

    test('Article VII: should warn about code over the size limits (VII-5)', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['SIMPLICITY_GATE'],
      });
      const longFunction = `function long() {\n${'  x++;\n'.repeat(60)}}`;

      const defaults = await guardrail.run(longFunction, {
        contentType: 'code',
        filePath: 'src/a.js',
      });
      const custom = await guardrail.run(longFunction, {
        contentType: 'code',
        filePath: 'src/a.js',
        codeLimits: { maxFunctionLines: 100 },
      });

      expect(constitutionalCodes(defaults)).toEqual(['VII-5']);
      expect(defaults.metadata.constitutionalViolations[0].severity).toBe('warning');
      expect(defaults.passed).toBe(true);
      expect(constitutionalCodes(custom)).toEqual([]);
    });

    test('Articles VII and VIII: should fail without Phase -1 Gate approval', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['SIMPLICITY_GATE', 'ANTI_ABSTRACTION'],
      });

      const blocked = await guardrail.run('class DatabaseWrapper {}', {
        contentType: 'code',
        filePath: 'src/db.ts',
        projectCount: 4,
      });
      const approved = await guardrail.run('class DatabaseWrapper {}', {
        contentType: 'code',
        filePath: 'src/db.ts',
        projectCount: 4,
        phaseMinusOneApproved: true,
      });

      expect(blocked.passed).toBe(false);
      expect(constitutionalCodes(blocked)).toEqual(['VII-2', 'VIII-2']);
      expect(approved.passed).toBe(true);
    });

    test('Article IX: should warn about unjustified mocks in integration tests', async () => {
      const guardrail = new SafetyCheckGuardrail({
        enforceConstitution: true,
        enabledArticles: ['INTEGRATION_FIRST'],
      });

      const result = await guardrail.run("jest.mock('../src/db');", {
        contentType: 'test',
        filePath: 'tests/integration/db.test.js',
      });

      expect(constitutionalCodes(result)).toEqual(['IX-5']);
    });
  });

  describe('Agent boundaries', () => {
    test('should fail an agent outside the allowed list', async () => {
      const guardrail = new SafetyCheckGuardrail({ level: SafetyLevel.STANDARD });

      const result = await guardrail.run('Test', {
        agentId: 'agent-a',
        allowedAgents: ['agent-b', 'agent-c'],
      });

      expect(result.passed).toBe(false);
    });

    test('should pass valid agent', async () => {
      const guardrail = new SafetyCheckGuardrail({ level: SafetyLevel.STANDARD });

      const result = await guardrail.run('Test', {
        agentId: 'agent-a',
        allowedAgents: ['agent-a', 'agent-b'],
      });

      expect(result.passed).toBe(true);
    });
  });

  describe('Custom Checks', () => {
    test('should run custom checks', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
        customChecks: {
          hasGreeting: input => ({
            passed: input.toLowerCase().includes('hello'),
            score: 1.0,
            message: 'Must include greeting',
          }),
        },
      });

      const result = await guardrail.run('Hello, World!');

      expect(result.passed).toBe(true);
      expect(result.metadata.scores.hasGreeting).toBe(1.0);
    });

    test('should fail on custom check failure', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
        customChecks: {
          hasGreeting: input => ({
            passed: input.toLowerCase().includes('hello'),
            severity: 'error',
            message: 'Must include greeting',
          }),
        },
      });

      const result = await guardrail.run('Goodbye!');

      expect(result.passed).toBe(false);
      expect(result.violations.some(v => v.code === 'CUSTOM_HASGREETING')).toBe(true);
    });

    test('should handle custom check errors', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
        customChecks: {
          errorCheck: () => {
            throw new Error('Check error');
          },
        },
      });

      const result = await guardrail.run('Test');

      // Custom check errors are warnings, not blocking
      expect(result.violations.some(v => v.code === 'CUSTOM_CHECK_ERROR')).toBe(true);
    });
  });

  describe('Object Input', () => {
    test('should extract content from object', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
      });

      const result = await guardrail.run({ content: 'Test content' });

      expect(result.passed).toBe(true);
    });

    test('should extract message from object', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
      });

      const result = await guardrail.run({ message: 'Test message' });

      expect(result.passed).toBe(true);
    });
  });

  describe('Tripwire', () => {
    test('should throw on tripwire enabled', async () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.BASIC,
        tripwireEnabled: true,
      });

      await expect(guardrail.run('')).rejects.toThrow(GuardrailTripwireException);
    });
  });

  describe('getInfo()', () => {
    test('should return complete info', () => {
      const guardrail = new SafetyCheckGuardrail({
        level: SafetyLevel.STRICT,
        enforceConstitution: true,
        customChecks: {
          check1: () => ({ passed: true }),
        },
      });

      const info = guardrail.getInfo();

      expect(info.level).toBe(SafetyLevel.STRICT);
      expect(info.enforceConstitution).toBe(true);
      expect(info.customChecksCount).toBe(1);
    });
  });
});

describe('createSafetyCheckGuardrail', () => {
  test('should create basic preset', () => {
    const guardrail = createSafetyCheckGuardrail('basic');

    expect(guardrail.name).toBe('BasicSafetyGuardrail');
    expect(guardrail.level).toBe(SafetyLevel.BASIC);
  });

  test('should create standard preset', () => {
    const guardrail = createSafetyCheckGuardrail('standard');

    expect(guardrail.name).toBe('StandardSafetyGuardrail');
    expect(guardrail.level).toBe(SafetyLevel.STANDARD);
  });

  test('should create strict preset', () => {
    const guardrail = createSafetyCheckGuardrail('strict');

    expect(guardrail.name).toBe('StrictSafetyGuardrail');
    expect(guardrail.level).toBe(SafetyLevel.STRICT);
    expect(guardrail.enforceConstitution).toBe(true);
  });

  test('should create paranoid preset', () => {
    const guardrail = createSafetyCheckGuardrail('paranoid');

    expect(guardrail.name).toBe('ParanoidSafetyGuardrail');
    expect(guardrail.level).toBe(SafetyLevel.PARANOID);
    expect(guardrail.tripwireEnabled).toBe(true);
  });

  test('should create constitutional preset', () => {
    const guardrail = createSafetyCheckGuardrail('constitutional');

    expect(guardrail.name).toBe('ConstitutionalGuardrail');
    expect(guardrail.enforceConstitution).toBe(true);
  });

  test('should apply overrides', () => {
    const guardrail = createSafetyCheckGuardrail('standard', {
      name: 'CustomSafety',
      tripwireEnabled: true,
    });

    expect(guardrail.name).toBe('CustomSafety');
    expect(guardrail.tripwireEnabled).toBe(true);
  });
});

describe('SafetyLevel', () => {
  test('should have all expected levels', () => {
    expect(SafetyLevel.BASIC).toBe('basic');
    expect(SafetyLevel.STANDARD).toBe('standard');
    expect(SafetyLevel.STRICT).toBe('strict');
    expect(SafetyLevel.PARANOID).toBe('paranoid');
  });
});

describe('ConstitutionalMapping', () => {
  test('should map the nine articles of the constitution', () => {
    expect(ConstitutionalMapping.TESTABLE_CORE.article).toBe('I');
    expect(ConstitutionalMapping.AUTOMATION_INTERFACE.article).toBe('II');
    expect(ConstitutionalMapping.TEST_FIRST.article).toBe('III');
    expect(ConstitutionalMapping.EARS_FORMAT.article).toBe('IV');
    expect(ConstitutionalMapping.TRACEABILITY.article).toBe('V');
    expect(ConstitutionalMapping.PROJECT_MEMORY.article).toBe('VI');
    expect(ConstitutionalMapping.SIMPLICITY_GATE.article).toBe('VII');
    expect(ConstitutionalMapping.ANTI_ABSTRACTION.article).toBe('VIII');
    expect(ConstitutionalMapping.INTEGRATION_FIRST.article).toBe('IX');
    expect(ConstitutionalMapping.TESTABLE_CORE.title).toBe('Testable-Core Principle');
    expect(ConstitutionalMapping.TESTABLE_CORE.constId).toBe('CONST-001');
  });

  test('each mapping should have checks array', () => {
    for (const [_key, mapping] of Object.entries(ConstitutionalMapping)) {
      expect(mapping.checks).toBeDefined();
      expect(Array.isArray(mapping.checks)).toBe(true);
    }
  });
});
