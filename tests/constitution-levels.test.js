/**
 * Constitution Level Manager Tests
 *
 * Tests for constitution enforcement levels (critical/advisory/flexible)
 */

const {
  ConstitutionLevelManager,
  EnforcementLevel,
  ArticleId,
  DEFAULT_ARTICLE_LEVELS,
  DEFAULT_PROFILE_LEVELS,
  DEFAULT_CODE_LIMITS,
  ProjectProfile,
} = require('../src/validators/constitution-level-manager');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

describe('ConstitutionLevelManager', () => {
  const testDir = '/tmp/test-constitution-levels';
  let manager;

  beforeEach(async () => {
    await fs.ensureDir(testDir);
    await fs.ensureDir(path.join(testDir, 'steering/rules'));
    manager = new ConstitutionLevelManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('getArticleLevel', () => {
    it('should return default levels when no config exists', async () => {
      const level = await manager.getArticleLevel(ArticleId.LIBRARY_FIRST);
      expect(level).toBe('critical');
    });

    it('should return advisory for Article II by default', async () => {
      const level = await manager.getArticleLevel(ArticleId.CLI_INTERFACE);
      expect(level).toBe('advisory');
    });

    it('should return flexible for Article VII by default', async () => {
      const level = await manager.getArticleLevel(ArticleId.DOCUMENTATION);
      expect(level).toBe('flexible');
    });

    it('should respect custom config', async () => {
      const config = {
        schema_version: '1.0',
        levels: {
          critical: {
            enforcement: 'block',
            articles: [
              { id: ArticleId.LIBRARY_FIRST, name: 'Article I' },
              { id: ArticleId.CLI_INTERFACE, name: 'Article II' }, // Changed to critical
            ],
          },
          advisory: {
            enforcement: 'warn',
            articles: [{ id: ArticleId.TEST_FIRST, name: 'Article III' }],
          },
          flexible: {
            enforcement: 'configurable',
            articles: [],
          },
        },
      };
      await fs.writeFile(
        path.join(testDir, 'steering/rules/constitution-levels.yml'),
        yaml.dump(config)
      );

      manager._config = null; // Reset cache
      const level = await manager.getArticleLevel(ArticleId.CLI_INTERFACE);
      expect(level).toBe('critical');
    });
  });

  describe('isBlocking', () => {
    it('should return true for critical articles', async () => {
      const isBlocking = await manager.isBlocking(ArticleId.LIBRARY_FIRST);
      expect(isBlocking).toBe(true);
    });

    it('should return false for advisory articles', async () => {
      const isBlocking = await manager.isBlocking(ArticleId.CLI_INTERFACE);
      expect(isBlocking).toBe(false);
    });

    it('should return false for flexible articles', async () => {
      const isBlocking = await manager.isBlocking(ArticleId.DOCUMENTATION);
      expect(isBlocking).toBe(false);
    });
  });

  describe('getCoverageThreshold', () => {
    it('should return default threshold (80)', async () => {
      const threshold = await manager.getCoverageThreshold();
      expect(threshold).toBe(80);
    });

    it('should respect project overrides', async () => {
      const projectConfig = {
        constitution: {
          overrides: {
            coverage_threshold: 90,
          },
        },
      };
      await fs.writeFile(path.join(testDir, 'steering/project.yml'), yaml.dump(projectConfig));

      manager._projectConfig = null; // Reset cache
      const threshold = await manager.getCoverageThreshold();
      expect(threshold).toBe(90);
    });
  });

  describe('isMockAllowed', () => {
    it('should return false by default', async () => {
      const allowed = await manager.isMockAllowed();
      expect(allowed).toBe(false);
    });

    it('should allow mocks for LLM providers', async () => {
      const config = {
        schema_version: '1.0',
        levels: {},
        configurable: {
          mock_allowed: {
            default: false,
            exceptions: ['llm-providers', 'openai', 'anthropic'],
          },
        },
      };
      await fs.writeFile(
        path.join(testDir, 'steering/rules/constitution-levels.yml'),
        yaml.dump(config)
      );

      manager._config = null;
      const allowed = await manager.isMockAllowed('openai');
      expect(allowed).toBe(true);
    });
  });

  describe('isEarsRequired', () => {
    it('should return true by default', async () => {
      const required = await manager.isEarsRequired();
      expect(required).toBe(true);
    });

    it('should return false for small mode when configured', async () => {
      const config = {
        schema_version: '1.0',
        levels: {},
        configurable: {
          ears_required: {
            default: true,
            per_mode: true,
            mode_defaults: {
              small: false,
            },
          },
        },
      };
      await fs.writeFile(
        path.join(testDir, 'steering/rules/constitution-levels.yml'),
        yaml.dump(config)
      );

      manager._config = null;
      const required = await manager.isEarsRequired({ mode: 'small' });
      expect(required).toBe(false);
    });
  });

  describe('getCriticalArticles', () => {
    it('should return default critical articles', async () => {
      const articles = await manager.getCriticalArticles();
      expect(articles.length).toBe(3);
      expect(articles.map(a => a.id)).toContain(ArticleId.LIBRARY_FIRST);
      expect(articles.map(a => a.id)).toContain(ArticleId.TEST_FIRST);
      expect(articles.map(a => a.id)).toContain(ArticleId.TRACEABILITY);
    });
  });

  describe('validate', () => {
    it('should pass when all critical checks pass', async () => {
      const validation = {
        [ArticleId.LIBRARY_FIRST]: true,
        [ArticleId.TEST_FIRST]: true,
        [ArticleId.TRACEABILITY]: true,
        [ArticleId.CLI_INTERFACE]: true,
      };

      const result = await manager.validate(validation);
      expect(result.passed).toBe(true);
      expect(result.critical.filter(c => c.status === 'passed').length).toBe(3);
    });

    it('should fail when a critical check fails', async () => {
      const validation = {
        [ArticleId.LIBRARY_FIRST]: false,
        [ArticleId.TEST_FIRST]: true,
        [ArticleId.TRACEABILITY]: true,
      };

      const result = await manager.validate(validation);
      expect(result.passed).toBe(false);
      expect(result.critical.filter(c => c.status === 'failed').length).toBe(1);
    });

    it('should pass when only advisory checks fail', async () => {
      const validation = {
        [ArticleId.LIBRARY_FIRST]: true,
        [ArticleId.TEST_FIRST]: true,
        [ArticleId.TRACEABILITY]: true,
        [ArticleId.CLI_INTERFACE]: false,
        [ArticleId.EARS_FORMAT]: false,
      };

      const result = await manager.validate(validation);
      expect(result.passed).toBe(true);
      expect(result.advisory.filter(c => c.status === 'warning').length).toBe(2);
    });
  });

  describe('getSummary', () => {
    it('should return complete summary', async () => {
      const summary = await manager.getSummary();

      expect(summary.critical).toBeDefined();
      expect(summary.advisory).toBeDefined();
      expect(summary.flexible).toBeDefined();
      expect(summary.configurable).toBeDefined();
      expect(summary.configurable.coverage_threshold).toBe(80);
    });
  });
});

describe('ConstitutionLevelManager project profiles (constitution v1.1)', () => {
  const testDir = '/tmp/test-constitution-profiles';
  let manager;

  const writeProjectYml = async constitution => {
    await fs.writeFile(path.join(testDir, 'steering/project.yml'), yaml.dump({ constitution }));
  };

  beforeEach(async () => {
    await fs.ensureDir(path.join(testDir, 'steering/rules'));
    manager = new ConstitutionLevelManager(testDir);
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('P-2: applies the library profile when project.yml declares none', async () => {
    const config = await manager.getProfileConfig();
    expect(config.profile).toBe(ProjectProfile.LIBRARY);
    expect(config.declared).toBe(false);
    expect(config.valid).toBe(true);
  });

  it('P-2: falls back to library and flags an unknown profile', async () => {
    await writeProjectYml({ profile: 'webapp' });
    const config = await manager.getProfileConfig();
    expect(config.profile).toBe(ProjectProfile.LIBRARY);
    expect(config.declared).toBe(true);
    expect(config.valid).toBe(false);
  });

  it('P-3: uses lib/ and packages/ as core paths for library and cli without core_paths', async () => {
    await writeProjectYml({ profile: 'cli' });
    const config = await manager.getProfileConfig();
    expect(config.corePaths).toEqual(['lib', 'packages']);
    expect(config.corePathsDeclared).toBe(false);
  });

  it('P-4: returns the declared paths of an application project', async () => {
    await writeProjectYml({
      profile: 'application',
      core_paths: ['src/lib'],
      delivery_paths: ['src/app', 'src/components'],
      adapter_paths: ['src/lib/server/authorization'],
    });
    const config = await manager.getProfileConfig();
    expect(config.profile).toBe(ProjectProfile.APPLICATION);
    expect(config.corePaths).toEqual(['src/lib']);
    expect(config.corePathsDeclared).toBe(true);
    expect(config.deliveryPaths).toEqual(['src/app', 'src/components']);
    expect(config.adapterPaths).toEqual(['src/lib/server/authorization']);
  });

  it('P-5: keeps the v1.0 levels for the library profile', async () => {
    expect(await manager.getArticleLevel(ArticleId.TESTABLE_CORE)).toBe('critical');
    expect(await manager.getArticleLevel(ArticleId.AUTOMATION_INTERFACE)).toBe('advisory');
  });

  it('P-5: makes Article II critical for the cli profile', async () => {
    await writeProjectYml({ profile: 'cli' });
    expect(await manager.getArticleLevel(ArticleId.TESTABLE_CORE)).toBe('critical');
    expect(await manager.getArticleLevel(ArticleId.AUTOMATION_INTERFACE)).toBe('critical');
    expect(await manager.isBlocking(ArticleId.AUTOMATION_INTERFACE)).toBe(true);
  });

  it('P-5: makes Articles I and II advisory for the application profile', async () => {
    await writeProjectYml({ profile: 'application', core_paths: ['src/lib'] });
    expect(await manager.getArticleLevel(ArticleId.TESTABLE_CORE)).toBe('advisory');
    expect(await manager.getArticleLevel(ArticleId.AUTOMATION_INTERFACE)).toBe('advisory');
    expect(await manager.isBlocking(ArticleId.TESTABLE_CORE)).toBe(false);
    // Other articles keep their level for every profile
    expect(await manager.getArticleLevel(ArticleId.TEST_FIRST)).toBe('critical');
  });

  it('P-5: reads profile_defaults from constitution-levels.yml when present', async () => {
    await fs.writeFile(
      path.join(testDir, 'steering/rules/constitution-levels.yml'),
      yaml.dump({
        schema_version: '1.0',
        levels: {
          critical: { enforcement: 'block', articles: [{ id: 'CONST-001' }] },
          advisory: { enforcement: 'warn', articles: [{ id: 'CONST-002' }] },
        },
        profile_defaults: { application: { 'CONST-001': 'critical' } },
      })
    );
    await writeProjectYml({ profile: 'application', core_paths: ['src/lib'] });
    expect(await manager.getArticleLevel(ArticleId.TESTABLE_CORE)).toBe('critical');
  });

  it('P-6: lets constitution.levels override the profile default', async () => {
    await writeProjectYml({
      profile: 'application',
      core_paths: ['src/lib'],
      levels: { 'CONST-001': 'critical', 'CONST-002': 'not-a-level' },
    });
    expect(await manager.getArticleLevel(ArticleId.TESTABLE_CORE)).toBe('critical');
    expect(await manager.isBlocking(ArticleId.TESTABLE_CORE)).toBe(true);
    // Invalid override values are ignored
    expect(await manager.getArticleLevel(ArticleId.AUTOMATION_INTERFACE)).toBe('advisory');
  });

  it('lists articles by their effective level for the profile', async () => {
    await writeProjectYml({ profile: 'application', core_paths: ['src/lib'] });
    const critical = (await manager.getCriticalArticles()).map(a => a.id);
    const advisory = (await manager.getAdvisoryArticles()).map(a => a.id);
    expect(critical).not.toContain(ArticleId.TESTABLE_CORE);
    expect(advisory).toContain(ArticleId.TESTABLE_CORE);
    expect(critical).toContain(ArticleId.TEST_FIRST);
  });

  it('uses the v1.1 article names in the default configuration', async () => {
    const names = (await manager.getCriticalArticles()).map(a => a.name);
    expect(names).toContain('Article I - Testable-Core Principle');
    const flexible = (await manager.getFlexibleArticles()).map(a => a.name);
    expect(flexible).toEqual([
      'Article VII - Simplicity Gate',
      'Article VIII - Anti-Abstraction Gate',
    ]);
  });
});

describe('ConstitutionLevelManager code limits (VII-4 to VII-6)', () => {
  const testDir = '/tmp/test-constitution-code-limits';

  beforeEach(async () => {
    await fs.ensureDir(path.join(testDir, 'steering/rules'));
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  it('should default to 500 lines per file, 50 per function and 10 imports', async () => {
    const limits = await new ConstitutionLevelManager(testDir).getCodeLimits();
    expect(limits).toEqual(DEFAULT_CODE_LIMITS);
    expect(limits).toEqual({ maxFileLines: 500, maxFunctionLines: 50, maxImports: 10 });
  });

  it('should read code_limits from constitution-levels.yml', async () => {
    await fs.writeFile(
      path.join(testDir, 'steering/rules/constitution-levels.yml'),
      yaml.dump({
        levels: {},
        configurable: { code_limits: { max_file_lines: 400, max_imports: 12 } },
      })
    );
    const limits = await new ConstitutionLevelManager(testDir).getCodeLimits();
    expect(limits).toEqual({ maxFileLines: 400, maxFunctionLines: 50, maxImports: 12 });
  });

  it('should apply project overrides from steering/project.yml', async () => {
    await fs.writeFile(
      path.join(testDir, 'steering/project.yml'),
      yaml.dump({ constitution: { overrides: { code_limits: { max_function_lines: 80 } } } })
    );
    const limits = await new ConstitutionLevelManager(testDir).getCodeLimits();
    expect(limits.maxFunctionLines).toBe(80);
    expect(limits.maxFileLines).toBe(500);
  });
});

describe('EnforcementLevel', () => {
  it('should have correct values', () => {
    expect(EnforcementLevel.BLOCK).toBe('block');
    expect(EnforcementLevel.WARN).toBe('warn');
    expect(EnforcementLevel.CONFIGURE).toBe('configurable');
  });
});

describe('ArticleId', () => {
  it('should have correct article IDs', () => {
    expect(ArticleId.LIBRARY_FIRST).toBe('CONST-001');
    expect(ArticleId.TEST_FIRST).toBe('CONST-003');
    expect(ArticleId.TRACEABILITY).toBe('CONST-005');
    expect(ArticleId.REAL_SERVICE_TESTING).toBe('CONST-009');
  });

  it('should provide v1.1 names for the article IDs', () => {
    expect(ArticleId.TESTABLE_CORE).toBe('CONST-001');
    expect(ArticleId.AUTOMATION_INTERFACE).toBe('CONST-002');
    expect(ArticleId.PROJECT_MEMORY).toBe('CONST-006');
    expect(ArticleId.SIMPLICITY_GATE).toBe('CONST-007');
    expect(ArticleId.ANTI_ABSTRACTION).toBe('CONST-008');
    expect(ArticleId.INTEGRATION_FIRST).toBe('CONST-009');
  });
});

describe('DEFAULT_PROFILE_LEVELS', () => {
  it('should define the default levels of Articles I and II per profile (P-5)', () => {
    expect(DEFAULT_PROFILE_LEVELS.library).toEqual({
      'CONST-001': 'critical',
      'CONST-002': 'advisory',
    });
    expect(DEFAULT_PROFILE_LEVELS.cli).toEqual({
      'CONST-001': 'critical',
      'CONST-002': 'critical',
    });
    expect(DEFAULT_PROFILE_LEVELS.application).toEqual({
      'CONST-001': 'advisory',
      'CONST-002': 'advisory',
    });
  });
});

describe('DEFAULT_ARTICLE_LEVELS', () => {
  it('should define all articles', () => {
    expect(Object.keys(DEFAULT_ARTICLE_LEVELS).length).toBe(9);
    expect(DEFAULT_ARTICLE_LEVELS[ArticleId.LIBRARY_FIRST]).toBe('critical');
    expect(DEFAULT_ARTICLE_LEVELS[ArticleId.REAL_SERVICE_TESTING]).toBe('advisory');
  });
});
