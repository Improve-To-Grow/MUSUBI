/**
 * Constitution Level Manager
 *
 * Manages Constitutional Article enforcement levels.
 * Supports critical/advisory/flexible levels with project-specific overrides.
 *
 * v1.1: Project profiles (library | cli | application) decide the default levels
 * of Articles I and II ("Project Profiles" in steering/rules/constitution.md).
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Enforcement levels
 */
const EnforcementLevel = {
  BLOCK: 'block', // Violations block progress
  WARN: 'warn', // Violations show warnings
  CONFIGURE: 'configurable', // Can be overridden per project
};

/**
 * Article IDs
 *
 * The v1.1 names (TESTABLE_CORE, AUTOMATION_INTERFACE, PROJECT_MEMORY, SIMPLICITY_GATE,
 * ANTI_ABSTRACTION, INTEGRATION_FIRST) match the constitution. The older names are kept
 * as aliases for compatibility.
 */
const ArticleId = {
  TESTABLE_CORE: 'CONST-001',
  AUTOMATION_INTERFACE: 'CONST-002',
  TEST_FIRST: 'CONST-003',
  EARS_FORMAT: 'CONST-004',
  TRACEABILITY: 'CONST-005',
  PROJECT_MEMORY: 'CONST-006',
  SIMPLICITY_GATE: 'CONST-007',
  ANTI_ABSTRACTION: 'CONST-008',
  INTEGRATION_FIRST: 'CONST-009',
  // Aliases (pre-v1.1 names)
  LIBRARY_FIRST: 'CONST-001',
  CLI_INTERFACE: 'CONST-002',
  CONSTITUTION_ENFORCEMENT: 'CONST-006',
  DOCUMENTATION: 'CONST-007',
  CODE_QUALITY: 'CONST-008',
  REAL_SERVICE_TESTING: 'CONST-009',
};

/**
 * Article display names (constitution v1.1)
 */
const ARTICLE_NAMES = {
  [ArticleId.TESTABLE_CORE]: 'Article I - Testable-Core Principle',
  [ArticleId.AUTOMATION_INTERFACE]: 'Article II - Automation Interface Mandate',
  [ArticleId.TEST_FIRST]: 'Article III - Test-First Imperative',
  [ArticleId.EARS_FORMAT]: 'Article IV - EARS Requirements Format',
  [ArticleId.TRACEABILITY]: 'Article V - Traceability Mandate',
  [ArticleId.PROJECT_MEMORY]: 'Article VI - Project Memory',
  [ArticleId.SIMPLICITY_GATE]: 'Article VII - Simplicity Gate',
  [ArticleId.ANTI_ABSTRACTION]: 'Article VIII - Anti-Abstraction Gate',
  [ArticleId.INTEGRATION_FIRST]: 'Article IX - Integration-First Testing',
};

/**
 * Project profiles (constitution v1.1, "Project Profiles")
 */
const ProjectProfile = {
  LIBRARY: 'library',
  CLI: 'cli',
  APPLICATION: 'application',
};

/**
 * Profile applied when steering/project.yml declares none (P-2)
 */
const DEFAULT_PROFILE = ProjectProfile.LIBRARY;

/**
 * Default levels of Articles I and II per profile (P-5)
 */
const DEFAULT_PROFILE_LEVELS = {
  [ProjectProfile.LIBRARY]: { 'CONST-001': 'critical', 'CONST-002': 'advisory' },
  [ProjectProfile.CLI]: { 'CONST-001': 'critical', 'CONST-002': 'critical' },
  [ProjectProfile.APPLICATION]: { 'CONST-001': 'advisory', 'CONST-002': 'advisory' },
};

/**
 * Core paths used when a project declares none (P-3)
 */
const DEFAULT_CORE_PATHS = {
  [ProjectProfile.LIBRARY]: ['lib', 'packages'],
  [ProjectProfile.CLI]: ['lib', 'packages'],
  [ProjectProfile.APPLICATION]: [],
};

/**
 * Code-size limits of Article VII (VII-4 to VII-6), in lines of code
 * - 500 lines per file: upper limit for files of significant systems (Clean Code)
 * - 50 lines per function: ESLint max-lines-per-function default
 * - 10 imports per file: eslint-plugin-import max-dependencies default
 */
const DEFAULT_CODE_LIMITS = {
  maxFileLines: 500,
  maxFunctionLines: 50,
  maxImports: 10,
};

const LEVELS = ['critical', 'advisory', 'flexible'];

const LEVEL_ENFORCEMENT = {
  critical: EnforcementLevel.BLOCK,
  advisory: EnforcementLevel.WARN,
  flexible: EnforcementLevel.CONFIGURE,
};

/**
 * Normalize a path list from project.yml (string or array) to forward-slash relative paths
 * @param {string|string[]|undefined} value - Declared paths
 * @returns {string[]} Normalized paths
 */
function toPathList(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list
    .filter(item => typeof item === 'string' && item.trim() !== '')
    .map(item => item.trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, ''));
}

/**
 * Default article levels
 */
const DEFAULT_ARTICLE_LEVELS = {
  [ArticleId.LIBRARY_FIRST]: 'critical',
  [ArticleId.CLI_INTERFACE]: 'advisory',
  [ArticleId.TEST_FIRST]: 'critical',
  [ArticleId.EARS_FORMAT]: 'advisory',
  [ArticleId.TRACEABILITY]: 'critical',
  [ArticleId.CONSTITUTION_ENFORCEMENT]: 'advisory',
  [ArticleId.DOCUMENTATION]: 'flexible',
  [ArticleId.CODE_QUALITY]: 'flexible',
  [ArticleId.REAL_SERVICE_TESTING]: 'advisory',
};

/**
 * Resolves article levels, the project profile and configurable values (coverage, mocks,
 * EARS, ADR, code-size limits) from steering/rules/constitution-levels.yml and
 * steering/project.yml
 */
class ConstitutionLevelManager {
  /**
   * Create a new ConstitutionLevelManager
   * @param {string} projectRoot - Project root directory
   */
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.configPath = path.join(projectRoot, 'steering/rules/constitution-levels.yml');
    this.projectConfigPath = path.join(projectRoot, 'steering/project.yml');
    this._config = null;
    this._projectConfig = null;
  }

  /**
   * Load constitution levels configuration
   * @returns {Promise<object>} Configuration object
   */
  async loadConfig() {
    if (this._config) return this._config;

    try {
      if (await fs.pathExists(this.configPath)) {
        const content = await fs.readFile(this.configPath, 'utf8');
        this._config = yaml.load(content);
        return this._config;
      }
    } catch (error) {
      console.warn(`Warning: Could not load constitution levels config: ${error.message}`);
    }

    // Return default configuration
    return this._getDefaultConfig();
  }

  /**
   * Load project-specific overrides
   * @returns {Promise<object|null>} Project overrides or null
   */
  async loadProjectOverrides() {
    if (this._projectConfig !== null) return this._projectConfig;

    try {
      if (await fs.pathExists(this.projectConfigPath)) {
        const content = await fs.readFile(this.projectConfigPath, 'utf8');
        const config = yaml.load(content);
        this._projectConfig = config.constitution || null;
        return this._projectConfig;
      }
    } catch {
      // Project config is optional
    }

    this._projectConfig = null;
    return null;
  }

  /**
   * Get default configuration
   * @private
   */
  _getDefaultConfig() {
    return {
      schema_version: '1.0',
      levels: {
        critical: {
          enforcement: EnforcementLevel.BLOCK,
          articles: [
            { id: ArticleId.TESTABLE_CORE, name: ARTICLE_NAMES[ArticleId.TESTABLE_CORE] },
            { id: ArticleId.TEST_FIRST, name: ARTICLE_NAMES[ArticleId.TEST_FIRST] },
            { id: ArticleId.TRACEABILITY, name: ARTICLE_NAMES[ArticleId.TRACEABILITY] },
          ],
        },
        advisory: {
          enforcement: EnforcementLevel.WARN,
          articles: [
            {
              id: ArticleId.AUTOMATION_INTERFACE,
              name: ARTICLE_NAMES[ArticleId.AUTOMATION_INTERFACE],
            },
            { id: ArticleId.EARS_FORMAT, name: ARTICLE_NAMES[ArticleId.EARS_FORMAT] },
            { id: ArticleId.INTEGRATION_FIRST, name: ARTICLE_NAMES[ArticleId.INTEGRATION_FIRST] },
          ],
        },
        flexible: {
          enforcement: EnforcementLevel.CONFIGURE,
          articles: [
            { id: ArticleId.SIMPLICITY_GATE, name: ARTICLE_NAMES[ArticleId.SIMPLICITY_GATE] },
            { id: ArticleId.ANTI_ABSTRACTION, name: ARTICLE_NAMES[ArticleId.ANTI_ABSTRACTION] },
          ],
        },
      },
      profile_defaults: DEFAULT_PROFILE_LEVELS,
      configurable: {
        coverage_threshold: { default: 80, min: 50, max: 100 },
        mock_allowed: { default: false },
        ears_required: { default: true },
        adr_required: { default: false },
        code_limits: {
          max_file_lines: DEFAULT_CODE_LIMITS.maxFileLines,
          max_function_lines: DEFAULT_CODE_LIMITS.maxFunctionLines,
          max_imports: DEFAULT_CODE_LIMITS.maxImports,
        },
      },
    };
  }

  /**
   * Get the project profile and its paths from steering/project.yml
   * @returns {Promise<object>} Profile configuration:
   *   profile, declared, valid, declaredProfile, corePaths, corePathsDeclared,
   *   deliveryPaths, adapterPaths, levels
   */
  async getProfileConfig() {
    const project = (await this.loadProjectOverrides()) || {};
    const declaredProfile = project.profile ?? null;
    const declared = declaredProfile !== null;
    const valid = !declared || Object.values(ProjectProfile).includes(declaredProfile);
    const profile = declared && valid ? declaredProfile : DEFAULT_PROFILE; // P-2
    const declaredCorePaths = toPathList(project.core_paths);
    const corePathsDeclared = declaredCorePaths.length > 0;

    return {
      profile,
      declared,
      valid,
      declaredProfile,
      corePaths: corePathsDeclared ? declaredCorePaths : [...DEFAULT_CORE_PATHS[profile]], // P-3
      corePathsDeclared,
      deliveryPaths: toPathList(project.delivery_paths),
      adapterPaths: toPathList(project.adapter_paths),
      levels: project.levels && typeof project.levels === 'object' ? project.levels : {},
    };
  }

  /**
   * Get the project profile (library | cli | application)
   * @returns {Promise<string>} Profile
   */
  async getProfile() {
    return (await this.getProfileConfig()).profile;
  }

  /**
   * Get article level
   *
   * Resolution order: constitution.levels in steering/project.yml (P-6), the profile
   * default from profile_defaults (P-5), the article's place under `levels`, and finally
   * DEFAULT_ARTICLE_LEVELS.
   * @param {string} articleId - Article ID (e.g., 'CONST-001')
   * @returns {Promise<string>} Level ('critical', 'advisory', or 'flexible')
   */
  async getArticleLevel(articleId) {
    const config = await this.loadConfig();
    const { profile, levels: projectLevels } = await this.getProfileConfig();

    if (LEVELS.includes(projectLevels[articleId])) {
      return projectLevels[articleId];
    }

    const profileLevel = config.profile_defaults?.[profile]?.[articleId];
    if (LEVELS.includes(profileLevel)) {
      return profileLevel;
    }

    for (const [level, levelConfig] of Object.entries(config.levels || {})) {
      const articles = levelConfig.articles || [];
      if (articles.some(a => a.id === articleId)) {
        return level;
      }
    }

    return DEFAULT_ARTICLE_LEVELS[articleId] || 'advisory';
  }

  /**
   * Get enforcement type for an article
   * @param {string} articleId - Article ID
   * @returns {Promise<string>} Enforcement type ('block', 'warn', or 'configurable')
   */
  async getEnforcementType(articleId) {
    const level = await this.getArticleLevel(articleId);
    const config = await this.loadConfig();

    const levelConfig = config.levels?.[level];
    return levelConfig?.enforcement || LEVEL_ENFORCEMENT[level] || EnforcementLevel.WARN;
  }

  /**
   * Check if an article is blocking (critical)
   * @param {string} articleId - Article ID
   * @returns {Promise<boolean>} True if blocking
   */
  async isBlocking(articleId) {
    const enforcement = await this.getEnforcementType(articleId);
    return enforcement === EnforcementLevel.BLOCK;
  }

  /**
   * Get all critical articles
   * @returns {Promise<object[]>} Critical articles
   */
  async getCriticalArticles() {
    return this._getArticlesAtLevel('critical');
  }

  /**
   * Get all advisory articles
   * @returns {Promise<object[]>} Advisory articles
   */
  async getAdvisoryArticles() {
    return this._getArticlesAtLevel('advisory');
  }

  /**
   * Get all flexible articles
   * @returns {Promise<object[]>} Flexible articles
   */
  async getFlexibleArticles() {
    return this._getArticlesAtLevel('flexible');
  }

  /**
   * Get the articles whose effective level (after profile defaults and project
   * overrides) equals the given level
   * @param {string} level - 'critical', 'advisory' or 'flexible'
   * @returns {Promise<object[]>} Articles
   * @private
   */
  async _getArticlesAtLevel(level) {
    const config = await this.loadConfig();
    const { levels: projectLevels } = await this.getProfileConfig();
    const articles = [];
    const seen = new Set();

    for (const levelConfig of Object.values(config.levels || {})) {
      for (const article of levelConfig?.articles || []) {
        if (seen.has(article.id)) continue;
        seen.add(article.id);
        articles.push(article);
      }
    }
    // Articles that only appear in project overrides
    for (const articleId of Object.keys(projectLevels)) {
      if (!seen.has(articleId) && ARTICLE_NAMES[articleId]) {
        seen.add(articleId);
        articles.push({ id: articleId, name: ARTICLE_NAMES[articleId] });
      }
    }

    const result = [];
    for (const article of articles) {
      if ((await this.getArticleLevel(article.id)) === level) {
        result.push(article);
      }
    }
    return result;
  }

  /**
   * Get configurable setting value
   * @param {string} setting - Setting name (e.g., 'coverage_threshold')
   * @param {object} context - Context for resolution (e.g., { packageType: 'cli' })
   * @returns {Promise<*>} Setting value
   */
  async getConfigValue(setting, context = {}) {
    const config = await this.loadConfig();
    const overrides = await this.loadProjectOverrides();

    // Check project overrides first
    if (overrides?.overrides?.[setting] !== undefined) {
      return overrides.overrides[setting];
    }

    const settingConfig = config.configurable?.[setting];
    if (!settingConfig) {
      return null;
    }

    // Check package-specific rules
    if (context.packageType && config.validation?.package_rules?.[context.packageType]) {
      const packageRule = config.validation.package_rules[context.packageType];
      if (packageRule[setting] !== undefined) {
        return packageRule[setting];
      }
    }

    // Check mode-specific defaults
    if (context.mode && settingConfig.per_mode && settingConfig.mode_defaults) {
      if (settingConfig.mode_defaults[context.mode] !== undefined) {
        return settingConfig.mode_defaults[context.mode];
      }
    }

    return settingConfig.default;
  }

  /**
   * Get coverage threshold
   * @param {object} context - Context (packageType, mode)
   * @returns {Promise<number>} Coverage threshold
   */
  async getCoverageThreshold(context = {}) {
    return (await this.getConfigValue('coverage_threshold', context)) || 80;
  }

  /**
   * Check if mocking is allowed
   * @param {string} dependency - Dependency to mock (optional)
   * @param {object} context - Context
   * @returns {Promise<boolean>} True if allowed
   */
  async isMockAllowed(dependency = null, context = {}) {
    const config = await this.loadConfig();
    const overrides = await this.loadProjectOverrides();

    // Check if dependency is in allowed list
    if (dependency) {
      const allowedMocks = [
        ...(config.configurable?.mock_allowed?.exceptions || []),
        ...(overrides?.overrides?.mock_allowed || []),
      ];

      for (const pattern of allowedMocks) {
        if (dependency.includes(pattern) || pattern === dependency) {
          return true;
        }
      }
    }

    return await this.getConfigValue('mock_allowed', context);
  }

  /**
   * Check if EARS format is required
   * @param {object} context - Context (mode, packageType)
   * @returns {Promise<boolean>} True if required
   */
  async isEarsRequired(context = {}) {
    return await this.getConfigValue('ears_required', context);
  }

  /**
   * Check if ADR is required
   * @param {object} context - Context (mode, packageType)
   * @returns {Promise<boolean>} True if required
   */
  async isAdrRequired(context = {}) {
    return await this.getConfigValue('adr_required', context);
  }

  /**
   * Get the code-size limits of Article VII (VII-4 to VII-6)
   *
   * constitution-levels.yml (configurable.code_limits) sets them; steering/project.yml
   * (constitution.overrides.code_limits) overrides single values.
   * @returns {Promise<{maxFileLines: number, maxFunctionLines: number, maxImports: number}>}
   */
  async getCodeLimits() {
    const config = await this.loadConfig();
    const overrides = await this.loadProjectOverrides();
    const sources = [config.configurable?.code_limits, overrides?.overrides?.code_limits];
    const limits = { ...DEFAULT_CODE_LIMITS };
    const keys = {
      max_file_lines: 'maxFileLines',
      max_function_lines: 'maxFunctionLines',
      max_imports: 'maxImports',
    };

    for (const source of sources) {
      for (const [yamlKey, key] of Object.entries(keys)) {
        const value = source?.[yamlKey];
        if (Number.isInteger(value) && value > 0) {
          limits[key] = value;
        }
      }
    }
    return limits;
  }

  /**
   * Validate against constitution
   * @param {object} validation - Validation data
   * @returns {Promise<object>} Validation result
   */
  async validate(validation) {
    const results = {
      passed: true,
      critical: [],
      advisory: [],
      flexible: [],
    };

    // Check critical articles
    const criticalArticles = await this.getCriticalArticles();
    for (const article of criticalArticles) {
      const check = validation[article.id];
      if (check === false) {
        results.passed = false;
        results.critical.push({
          article,
          status: 'failed',
          blocking: true,
        });
      } else if (check === true) {
        results.critical.push({
          article,
          status: 'passed',
          blocking: false,
        });
      }
    }

    // Check advisory articles
    const advisoryArticles = await this.getAdvisoryArticles();
    for (const article of advisoryArticles) {
      const check = validation[article.id];
      if (check === false) {
        results.advisory.push({
          article,
          status: 'warning',
          blocking: false,
        });
      } else if (check === true) {
        results.advisory.push({
          article,
          status: 'passed',
          blocking: false,
        });
      }
    }

    return results;
  }

  /**
   * Get summary of all levels
   * @returns {Promise<object>} Level summary
   */
  async getSummary() {
    return {
      critical: await this.getCriticalArticles(),
      advisory: await this.getAdvisoryArticles(),
      flexible: await this.getFlexibleArticles(),
      configurable: {
        coverage_threshold: await this.getCoverageThreshold(),
        mock_allowed: await this.isMockAllowed(),
        ears_required: await this.isEarsRequired(),
        adr_required: await this.isAdrRequired(),
      },
    };
  }
}

module.exports = {
  ConstitutionLevelManager,
  EnforcementLevel,
  ArticleId,
  ARTICLE_NAMES,
  ProjectProfile,
  DEFAULT_PROFILE,
  DEFAULT_ARTICLE_LEVELS,
  DEFAULT_PROFILE_LEVELS,
  DEFAULT_CORE_PATHS,
  DEFAULT_CODE_LIMITS,
};
