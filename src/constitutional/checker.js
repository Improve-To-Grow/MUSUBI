/**
 * Constitutional Checker
 *
 * Checks changed files against the nine articles of steering/rules/constitution.md (v1.1).
 * Severities follow the article levels of the project profile (P-5, P-6):
 * - a definite finding in a critical article is CRITICAL and blocks the merge
 * - a heuristic finding in a critical article is HIGH
 * - Phase -1 Gate findings (VII-2, VIII-2) are HIGH and require a gate
 * - other findings in advisory and flexible articles (e.g. the code-size limits VII-4 to
 *   VII-6) are MEDIUM; requirements tagged (advisory) are LOW
 *
 * Requirement: IMP-6.2-005-01
 * Design: Section 5.1
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { ConstitutionLevelManager } = require('../validators/constitution-level-manager');
const {
  ARTICLES: ARTICLE_DEFINITIONS,
  ABSTRACTION_PATTERNS,
  DEFAULT_REQUIREMENT_PATTERNS,
  toPosix,
  isCodeFile,
  isTestFile,
  checkTestableCore,
  checkPublicInterfaceDocs,
  checkAutomationInterface,
  checkCodeSize,
  checkEarsFormat,
  checkTraceabilityReferences,
  checkAntiAbstraction,
  checkIntegrationMocks,
  checkProjectMemory,
  checkSimplicityGate,
  defaultIsMockAllowed,
} = require('./articles');

/**
 * Constitutional Articles (constitution v1.1)
 */
const ARTICLES = {
  ...ARTICLE_DEFINITIONS,
  VIII: { ...ARTICLE_DEFINITIONS.VIII, patterns: ABSTRACTION_PATTERNS },
};

/**
 * Violation severity levels
 */
const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const PHASE_MINUS_ONE_ARTICLES = ['VII', 'VIII'];

/**
 * Whether a violation needs Phase -1 Gate approval
 * @param {Object} violation - Violation
 * @returns {boolean}
 */
function isPhaseMinusOne(violation) {
  const severe = violation.severity === SEVERITY.HIGH || violation.severity === SEVERITY.CRITICAL;
  if (typeof violation.gate === 'boolean') return violation.gate && severe;
  return PHASE_MINUS_ONE_ARTICLES.includes(violation.article) && severe;
}

const SEVERITY_ICONS = {
  [SEVERITY.CRITICAL]: '🔴',
  [SEVERITY.HIGH]: '🟠',
  [SEVERITY.MEDIUM]: '🟡',
  [SEVERITY.LOW]: '🟢',
};

/**
 * Report section: summary table
 * @private
 */
function reportSummary({ summary }) {
  return [
    '## Summary',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Files Checked | ${summary.filesChecked} |`,
    `| Files Passed | ${summary.filesPassed} |`,
    `| Files Failed | ${summary.filesFailed} |`,
    `| Total Violations | ${summary.totalViolations} |`,
    '',
  ];
}

/**
 * Report section: merge decision
 * @private
 */
function reportDecision(blockDecision) {
  if (!blockDecision.shouldBlock) return ['## ✅ Merge Allowed', ''];
  const lines = ['## ⛔ Merge Blocked', '', `**Reason:** ${blockDecision.reason}`];
  if (blockDecision.requiresPhaseMinusOne) {
    lines.push(
      '',
      '> Phase -1 Gate review required. Obtain approval from the System Architect (Article VII: Project Manager; Article VIII: Software Developer).'
    );
  }
  return [...lines, ''];
}

/**
 * Report section: violation count per article
 * @private
 */
function reportByArticle({ summary }) {
  const lines = ['## Violations by Article', ''];
  for (const [article, count] of Object.entries(summary.violationsByArticle)) {
    lines.push(
      `- **Article ${article}** (${ARTICLES[article]?.name || 'Unknown'}): ${count} violations`
    );
  }
  return [...lines, ''];
}

/**
 * Report section: each violation per file
 * @private
 */
function reportDetails(results) {
  if (results.summary.totalViolations === 0) return [];
  const lines = ['## Detailed Violations', ''];
  for (const result of results.results.filter(r => r.violations.length > 0)) {
    lines.push(`### ${result.filePath}`, '');
    for (const v of result.violations) {
      const name = v.articleName ? `${v.articleName} ` : '';
      lines.push(
        `${SEVERITY_ICONS[v.severity] || '🟢'} **Article ${v.article}** ${name}(${v.severity}): ${v.message}`
      );
      if (v.line) lines.push(`  - Line: ${v.line}`);
      lines.push(`  - Suggestion: ${v.suggestion}`, '');
    }
  }
  return lines;
}

/**
 * ConstitutionalChecker
 *
 * Validates code against Constitutional Articles.
 */
class ConstitutionalChecker {
  /**
   * @param {Object} config - Configuration options
   * @param {string} [config.projectRoot=process.cwd()] - Project root (profile, levels, steering)
   * @param {string} [config.storageDir='storage/constitutional'] - Where results are saved
   */
  constructor(config = {}) {
    this.config = {
      projectRoot: process.cwd(),
      storageDir: 'storage/constitutional',
      ...config,
    };
    this._context = null;
  }

  /**
   * Load the project profile, article levels and traceability patterns
   * @returns {Promise<Object>} Check context
   */
  async init() {
    if (this._context) return this._context;

    const { projectRoot } = this.config;
    const manager = new ConstitutionLevelManager(projectRoot);
    const profile = await manager.getProfileConfig();
    const levels = {};
    for (const article of Object.values(ARTICLES)) {
      levels[article.id] = await manager.getArticleLevel(article.constId);
    }

    const levelsConfig = await manager.loadConfig();
    const mockExceptions = levelsConfig.configurable?.mock_allowed?.exceptions || [];
    const isMockAllowed = target =>
      defaultIsMockAllowed(target) || mockExceptions.some(e => target.includes(e));

    this._context = {
      profile,
      levels,
      codeLimits: await manager.getCodeLimits(),
      isMockAllowed,
      srcExists: fsSync.existsSync(path.join(projectRoot, 'src')),
      requirementPatterns: [...DEFAULT_REQUIREMENT_PATTERNS, ...this._loadTraceabilityPatterns()],
    };
    return this._context;
  }

  /**
   * Requirement ID patterns from steering/project.yml (traceability.patterns)
   * @private
   */
  _loadTraceabilityPatterns() {
    try {
      const file = path.join(this.config.projectRoot, 'steering/project.yml');
      const config = yaml.load(fsSync.readFileSync(file, 'utf8')) || {};
      return (config.traceability?.patterns || []).map(
        pattern => new RegExp(String(pattern).replace(/\\\\/g, '\\'))
      );
    } catch {
      return [];
    }
  }

  /**
   * Project-relative path with forward slashes
   * @private
   */
  _rel(filePath) {
    return toPosix(path.relative(this.config.projectRoot, path.resolve(filePath)));
  }

  /**
   * Severity of a finding, from its article's level
   * @private
   */
  _severity(finding) {
    if (finding.advisory) return SEVERITY.LOW;
    const level = this._context.levels[finding.article];
    if (finding.gate) return level === 'advisory' ? SEVERITY.MEDIUM : SEVERITY.HIGH;
    if (level === 'critical') return finding.definite ? SEVERITY.CRITICAL : SEVERITY.HIGH;
    return SEVERITY.MEDIUM;
  }

  /**
   * Turn rule findings into violations
   * @private
   */
  _toViolations(findings, filePath) {
    return findings.map(finding => {
      const article = ARTICLES[finding.article];
      return {
        article: finding.article,
        articleName: article.name,
        constId: article.constId,
        requirement: finding.requirement,
        level: this._context.levels[finding.article],
        severity: this._severity(finding),
        gate: Boolean(finding.gate),
        message: finding.message,
        filePath,
        suggestion: finding.suggestion,
      };
    });
  }

  /**
   * Check file for constitutional violations
   * @param {string} filePath - File path to check
   * @returns {Promise<Object>} Check result
   */
  async checkFile(filePath) {
    await this.init();
    const content = await fs.readFile(filePath, 'utf-8');

    const violations = [
      ...(await this.checkArticleI(content, filePath)),
      ...(await this.checkArticleII(content, filePath)),
      ...(await this.checkArticleIII(filePath)),
      ...(await this.checkArticleIV(content, filePath)),
      ...(await this.checkArticleV(content, filePath)),
      ...(await this.checkArticleVII(content, filePath)),
      ...(await this.checkArticleVIII(content, filePath)),
      ...(await this.checkArticleIX(content, filePath)),
    ];

    return {
      filePath,
      violations,
      passed: violations.length === 0,
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Article I: Testable-Core Principle (I-3, I-5, I-A4, I-A5)
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleI(content, filePath) {
    const { profile, srcExists } = await this.init();
    const rel = this._rel(filePath);
    const findings = [
      ...checkTestableCore({ rel, content, profile, srcExists }),
      ...checkPublicInterfaceDocs({ rel, content, profile }),
    ];
    return this._toViolations(findings, filePath);
  }

  /**
   * Article II: Automation Interface Mandate (II-A4)
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleII(content, filePath) {
    const { profile } = await this.init();
    const findings = checkAutomationInterface({ rel: this._rel(filePath), content, profile });
    return this._toViolations(findings, filePath);
  }

  /**
   * Article III: Test-First Imperative (III-1): a source file has a test
   * @param {string} filePath - Source file path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleIII(filePath) {
    await this.init();
    const rel = this._rel(filePath);
    const base = path.posix.basename(rel);
    if (!isCodeFile(rel) || isTestFile(rel) || /^index\.|\.config\.|\.d\.ts$/.test(base)) {
      return [];
    }

    for (const candidate of this._testCandidates(filePath)) {
      try {
        await fs.access(candidate);
        return [];
      } catch {
        // Continue checking
      }
    }

    const ext = path.extname(filePath);
    return this._toViolations(
      [
        {
          article: 'III',
          requirement: 'III-1',
          message: 'III-1: No test file found for this source file',
          suggestion: `Write the test first, e.g. ${path.basename(filePath, ext)}.test${ext}`,
        },
      ],
      filePath
    );
  }

  /**
   * Test files that would cover a source file: next to it, in __tests__, or mirrored
   * under tests/ or test/
   * @private
   */
  _testCandidates(filePath) {
    const absolute = path.resolve(filePath);
    const dir = path.dirname(absolute);
    const ext = path.extname(absolute);
    const base = path.basename(absolute, ext);
    const candidates = [
      path.join(dir, `${base}.test${ext}`),
      path.join(dir, `${base}.spec${ext}`),
      path.join(dir, '__tests__', `${base}.test${ext}`),
    ];

    const segments = this._rel(filePath).split('/');
    if (['src', 'lib'].includes(segments[0])) {
      const mirrored = [...segments.slice(1, -1), `${base}.test${ext}`];
      for (const testDir of ['tests', 'test']) {
        candidates.push(path.join(this.config.projectRoot, testDir, ...mirrored));
      }
    }
    return candidates;
  }

  /**
   * Article IV: EARS Requirements Format (IV-1, IV-2) for requirements documents
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleIV(content, filePath) {
    await this.init();
    return this._toViolations(checkEarsFormat({ rel: this._rel(filePath), content }), filePath);
  }

  /**
   * Article V: Traceability Mandate (V-2, V-4)
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleV(content, filePath) {
    const { requirementPatterns } = await this.init();
    const findings = checkTraceabilityReferences({
      rel: this._rel(filePath),
      content,
      patterns: requirementPatterns,
    });
    return this._toViolations(findings, filePath);
  }

  /**
   * Article VI: Project Memory (VI-1..VI-3), checked once per project
   * @returns {Promise<Array>} Violations
   */
  async checkArticleVI() {
    await this.init();
    return this._toViolations(checkProjectMemory(this.config.projectRoot), 'steering');
  }

  /**
   * Article VII: code-size limits of a source file (VII-4 to VII-6)
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleVII(content, filePath) {
    const { profile, codeLimits } = await this.init();
    const findings = checkCodeSize({
      rel: this._rel(filePath),
      content,
      limits: codeLimits,
      profile,
    });
    return this._toViolations(findings, filePath);
  }

  /**
   * Article VII: Simplicity Gate (VII-1, VII-2), checked once per project
   * @returns {Promise<Array>} Violations
   */
  async checkSimplicityGate() {
    await this.init();
    return this._toViolations(checkSimplicityGate(this.config.projectRoot), '.');
  }

  /**
   * Article VIII: Anti-Abstraction Gate (VIII-2)
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleVIII(content, filePath) {
    const { profile } = await this.init();
    const findings = checkAntiAbstraction({ rel: this._rel(filePath), content, profile });
    return this._toViolations(findings, filePath);
  }

  /**
   * Article IX: Integration-First Testing (IX-4, IX-5)
   * @param {string} content - File content
   * @param {string} filePath - File path
   * @returns {Promise<Array>} Violations
   */
  async checkArticleIX(content, filePath) {
    const { isMockAllowed } = await this.init();
    const findings = checkIntegrationMocks({ rel: this._rel(filePath), content, isMockAllowed });
    return this._toViolations(findings, filePath);
  }

  /**
   * Check multiple files, plus the project-level Articles VI and VII
   * @param {Array} filePaths - File paths to check
   * @returns {Promise<Object>} Check results
   */
  async checkFiles(filePaths) {
    await this.init();
    const results = [];

    for (const filePath of filePaths) {
      try {
        results.push(await this.checkFile(filePath));
      } catch (error) {
        results.push({
          filePath,
          error: error.message,
          violations: [],
          passed: false,
        });
      }
    }
    const fileResults = [...results];

    const projectViolations = [
      ...(await this.checkArticleVI()),
      ...(await this.checkSimplicityGate()),
    ];
    if (projectViolations.length > 0) {
      results.push({
        filePath: '(project)',
        scope: 'project',
        violations: projectViolations,
        passed: false,
      });
    }

    const violationsByArticle = {};
    let totalViolations = 0;
    for (const v of results.flatMap(r => r.violations)) {
      violationsByArticle[v.article] = (violationsByArticle[v.article] || 0) + 1;
      totalViolations++;
    }

    return {
      results,
      summary: {
        filesChecked: filePaths.length,
        filesPassed: fileResults.filter(r => r.passed).length,
        filesFailed: fileResults.filter(r => !r.passed).length,
        totalViolations,
        violationsByArticle,
      },
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Check directory recursively
   * @param {string} directory - Directory to check
   * @param {Object} options - Options
   * @returns {Promise<Object>} Check results
   */
  async checkDirectory(directory, options = {}) {
    const extensions = options.extensions || ['.js', '.ts'];
    const exclude = options.exclude || ['node_modules', '.git', 'dist', 'coverage'];

    const files = await this.findFiles(directory, extensions, exclude);
    return await this.checkFiles(files);
  }

  /**
   * Find files recursively
   * @param {string} dir - Directory
   * @param {Array} extensions - File extensions
   * @param {Array} exclude - Exclude patterns
   * @returns {Promise<Array>} File paths
   */
  async findFiles(dir, extensions, exclude) {
    const files = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (exclude.some(e => entry.name.includes(e))) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFiles = await this.findFiles(fullPath, extensions, exclude);
          files.push(...subFiles);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch {
      // Ignore errors
    }

    return files;
  }

  /**
   * Check if merge should be blocked
   * @param {Object} results - Check results
   * @returns {Object} Block decision
   */
  shouldBlockMerge(results) {
    const violations = results.results.flatMap(r => r.violations);
    const criticalViolations = violations.filter(v => v.severity === SEVERITY.CRITICAL);
    const highViolations = violations.filter(v => v.severity === SEVERITY.HIGH);

    // Phase -1 Gate findings (VII-2, VIII-2); violations without a gate flag fall back to
    // their article (VII, VIII)
    const phaseMinusOneViolations = violations.filter(v => isPhaseMinusOne(v));

    return {
      shouldBlock: criticalViolations.length > 0 || phaseMinusOneViolations.length > 0,
      reason:
        criticalViolations.length > 0
          ? 'Critical violations found'
          : phaseMinusOneViolations.length > 0
            ? 'Phase -1 Gate review required due to Article VII/VIII violations'
            : null,
      criticalCount: criticalViolations.length,
      highCount: highViolations.length,
      requiresPhaseMinusOne: phaseMinusOneViolations.length > 0,
    };
  }

  /**
   * Generate compliance report
   * @param {Object} results - Check results
   * @returns {string} Markdown report
   */
  generateReport(results) {
    const lines = ['# Constitutional Compliance Report', '', `**Generated:** ${results.checkedAt}`];
    if (this._context?.profile) {
      lines.push(`**Profile:** ${this._context.profile.profile}`);
    }
    lines.push(
      '',
      ...reportSummary(results),
      ...reportDecision(this.shouldBlockMerge(results)),
      ...reportByArticle(results),
      ...reportDetails(results)
    );
    return lines.join('\n');
  }

  /**
   * Save check results
   * @param {string} featureId - Feature ID
   * @param {Object} results - Check results
   */
  async saveResults(featureId, results) {
    await this.ensureStorageDir();
    const filePath = path.join(this.config.storageDir, `${featureId}.json`);
    await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf-8');
  }

  /**
   * Load check results
   * @param {string} featureId - Feature ID
   * @returns {Promise<Object|null>} Results or null
   */
  async loadResults(featureId) {
    try {
      const filePath = path.join(this.config.storageDir, `${featureId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Ensure storage directory exists
   */
  async ensureStorageDir() {
    try {
      await fs.access(this.config.storageDir);
    } catch {
      await fs.mkdir(this.config.storageDir, { recursive: true });
    }
  }
}

module.exports = {
  ConstitutionalChecker,
  ARTICLES,
  SEVERITY,
  isPhaseMinusOne,
};
