/**
 * MUSUBI Critic System
 *
 * Quality evaluation system for SDD stages
 *
 * @module src/validators/critic-system
 * @see REQ-P0-B005
 * @inspired-by OpenHands openhands/critic/
 */

const fs = require('fs');
const path = require('path');

/**
 * Default SRS document evaluated when no content is passed in the context
 */
const DEFAULT_SRS_PATH = 'storage/specs/srs/srs-musubi-v3.0.0.md';

/**
 * Evaluation grades
 */
const Grade = {
  A: 'A', // 0.8+
  B: 'B', // 0.5-0.79
  C: 'C', // 0.3-0.49
  F: 'F', // < 0.3
};

/**
 * Stage types
 */
const StageType = {
  REQUIREMENTS: 'requirements',
  DESIGN: 'design',
  IMPLEMENTATION: 'implementation',
  TEST: 'test',
  VALIDATION: 'validation',
};

/**
 * Evaluation result
 */
class CriticResult {
  /**
   * @param {number} score - Score (0.0 - 1.0)
   * @param {string} message - Evaluation message
   * @param {Object} details - Details
   */
  constructor(score, message, details = {}) {
    this.score = Math.max(0, Math.min(1, score));
    this.message = message;
    this.details = details;
    this.timestamp = new Date();
  }

  /**
   * Whether the evaluation passed
   * @returns {boolean}
   */
  get success() {
    return this.score >= 0.5;
  }

  /**
   * Get the grade
   * @returns {string}
   */
  get grade() {
    if (this.score >= 0.8) return Grade.A;
    if (this.score >= 0.5) return Grade.B;
    if (this.score >= 0.3) return Grade.C;
    return Grade.F;
  }

  /**
   * Get the score as a percentage
   * @returns {number}
   */
  get percentage() {
    return Math.round(this.score * 100);
  }

  toJSON() {
    return {
      score: this.score,
      grade: this.grade,
      percentage: this.percentage,
      success: this.success,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Generate a report in Markdown format
   * @returns {string}
   */
  toMarkdown() {
    let md = `## Evaluation Result\n\n`;
    md += `- **Score**: ${this.percentage}%\n`;
    md += `- **Grade**: ${this.grade}\n`;
    md += `- **Status**: ${this.success ? '✅ Pass' : '❌ Fail'}\n\n`;
    md += `### Summary\n\n${this.message}\n\n`;

    if (Object.keys(this.details).length > 0) {
      md += `### Details\n\n`;
      md += `| Criterion | Score | Status |\n`;
      md += `|-----------|-------|--------|\n`;
      for (const [key, value] of Object.entries(this.details)) {
        const score = typeof value === 'number' ? value : value.score || 0;
        const pct = Math.round(score * 100);
        const status = score >= 0.5 ? '✅' : '❌';
        md += `| ${key} | ${pct}% | ${status} |\n`;
      }
    }

    return md;
  }
}

/**
 * Base critic
 */
class BaseCritic {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.weights = options.weights || {};
  }

  /**
   * Run the evaluation
   * @param {Object} context - Evaluation context
   * @returns {CriticResult}
   */
  evaluate(_context = {}) {
    throw new Error('Must implement evaluate()');
  }

  /**
   * Calculate the weighted score
   * @param {Object} scores - Score per criterion
   * @returns {number}
   */
  calculateWeightedScore(scores) {
    const entries = Object.entries(scores);
    if (entries.length === 0) return 0;

    let totalWeight = 0;
    let weightedSum = 0;

    for (const [key, value] of entries) {
      const score = typeof value === 'number' ? value : value.score || 0;
      const weight = this.weights[key] || 1;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Check whether a file exists
   * @param {string} relativePath
   * @returns {boolean}
   */
  fileExists(relativePath) {
    return fs.existsSync(path.join(this.projectRoot, relativePath));
  }

  /**
   * Read file contents
   * @param {string} relativePath
   * @returns {string|null}
   */
  readFile(relativePath) {
    const filePath = path.join(this.projectRoot, relativePath);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
  }
}

/**
 * Requirements critic
 */
class RequirementsCritic extends BaseCritic {
  constructor(options = {}) {
    super(options);
    this.weights = {
      earsCompliance: 2,
      completeness: 1.5,
      testability: 1,
      traceability: 1,
      ...options.weights,
    };
  }

  evaluate(context = {}) {
    const scores = {
      earsCompliance: this.checkEarsFormat(context),
      completeness: this.checkCompleteness(context),
      testability: this.checkTestability(context),
      traceability: this.checkTraceability(context),
    };

    const totalScore = this.calculateWeightedScore(scores);

    return new CriticResult(totalScore, this._generateMessage(totalScore, scores), scores);
  }

  /**
   * Check EARS format compliance
   */
  checkEarsFormat(context) {
    const content = context.content || this.readFile(DEFAULT_SRS_PATH) || '';

    // EARS keyword patterns
    const earsPatterns = [
      /\b(When|If|While|Where)\b.*\b(shall|should|must)\b/gi,
      /\bThe system shall\b/gi,
      /\bshall be able to\b/gi,
    ];

    const reqPattern = /REQ-[A-Z0-9]+-\d+/g;
    const requirements = content.match(reqPattern) || [];

    if (requirements.length === 0) return 0;

    // Count occurrences of EARS patterns
    let earsCount = 0;
    earsPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      earsCount += matches.length;
    });

    // EARS compliance ratio relative to the number of requirements
    return Math.min(1, earsCount / requirements.length);
  }

  /**
   * Check completeness
   */
  checkCompleteness(context) {
    const content = context.content || this.readFile(DEFAULT_SRS_PATH) || '';

    const requiredSections = [
      /## Functional Requirements/i,
      /## Non-Functional Requirements/i,
      /## Constraints/i,
    ];

    const presentSections = requiredSections.filter(pattern => pattern.test(content));
    return presentSections.length / requiredSections.length;
  }

  /**
   * Check testability
   */
  checkTestability(context) {
    const content = context.content || this.readFile(DEFAULT_SRS_PATH) || '';

    // Check for numeric targets and measurable criteria
    const measurablePatterns = [
      /\d+%/g, // Percentages
      /\d+\s*(ms|seconds?)/gi, // Durations
      /\d+\s*times?/gi, // Counts
      /less than|greater than|at least/gi,
    ];

    let measurableCount = 0;
    measurablePatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      measurableCount += matches.length;
    });

    // Full score with 10 or more measurable criteria
    return Math.min(1, measurableCount / 10);
  }

  /**
   * Check traceability
   */
  checkTraceability(context) {
    const content = context.content || '';

    // Check references to requirement IDs
    const reqPattern = /REQ-[A-Z0-9]+-\d+/g;
    const requirements = content.match(reqPattern) || [];

    // Count unique requirements (duplicates removed)
    const uniqueReqs = [...new Set(requirements)];

    // 5 or more unique requirements is considered good
    return Math.min(1, uniqueReqs.length / 5);
  }

  _generateMessage(score, scores) {
    if (score >= 0.8) {
      return 'Requirements are high quality: EARS-compliant with clear, testable criteria.';
    } else if (score >= 0.5) {
      return 'Requirements meet basic quality standards. Some improvements are possible.';
    } else {
      const issues = [];
      if (scores.earsCompliance < 0.5) issues.push('EARS format compliance');
      if (scores.completeness < 0.5) issues.push('add required sections');
      if (scores.testability < 0.5) issues.push('add measurable criteria');
      return `Requirements need improvement: ${issues.join(', ')}`;
    }
  }
}

/**
 * Design critic
 */
class DesignCritic extends BaseCritic {
  constructor(options = {}) {
    super(options);
    this.weights = {
      c4Compliance: 2,
      adrPresence: 1.5,
      reqCoverage: 1,
      ...options.weights,
    };
  }

  evaluate(context = {}) {
    const scores = {
      c4Compliance: this.checkC4Format(context),
      adrPresence: this.checkAdrPresence(context),
      reqCoverage: this.checkRequirementCoverage(context),
    };

    const totalScore = this.calculateWeightedScore(scores);

    return new CriticResult(totalScore, this._generateMessage(totalScore, scores), scores);
  }

  /**
   * Check C4 model compliance
   */
  checkC4Format(_context) {
    const designDir = path.join(this.projectRoot, 'storage/design');
    if (!fs.existsSync(designDir)) return 0;

    // Check for C4 level keywords
    const c4Keywords = ['Context', 'Container', 'Component', 'Code'];
    const files = fs.readdirSync(designDir).filter(f => f.endsWith('.md'));

    let c4Score = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(designDir, file), 'utf-8');
      c4Keywords.forEach(keyword => {
        if (content.includes(keyword)) c4Score += 0.25;
      });
    }

    return Math.min(1, c4Score);
  }

  /**
   * Check that ADRs exist
   */
  checkAdrPresence(_context) {
    const adrDir = path.join(this.projectRoot, 'storage/design/adr');
    if (!fs.existsSync(adrDir)) return 0;

    const adrFiles = fs.readdirSync(adrDir).filter(f => f.startsWith('ADR-') && f.endsWith('.md'));

    // Full score with 3 or more ADRs
    return Math.min(1, adrFiles.length / 3);
  }

  /**
   * Check requirement coverage
   */
  checkRequirementCoverage(_context) {
    const designDir = path.join(this.projectRoot, 'storage/design');
    if (!fs.existsSync(designDir)) return 0;

    const files = fs.readdirSync(designDir).filter(f => f.endsWith('.md'));
    let reqReferences = new Set();

    for (const file of files) {
      const content = fs.readFileSync(path.join(designDir, file), 'utf-8');
      const matches = content.match(/REQ-[A-Z0-9]+-\d+/g) || [];
      matches.forEach(m => reqReferences.add(m));
    }

    // Full score with 5 or more requirement references
    return Math.min(1, reqReferences.size / 5);
  }

  _generateMessage(score, scores) {
    if (score >= 0.8) {
      return 'Design documents are high quality: C4-compliant with appropriate ADRs.';
    } else if (score >= 0.5) {
      return 'Design documents meet basic quality standards.';
    } else {
      const issues = [];
      if (scores.c4Compliance < 0.5) issues.push('apply the C4 model');
      if (scores.adrPresence < 0.5) issues.push('create ADRs');
      if (scores.reqCoverage < 0.5) issues.push('link to requirements');
      return `Design needs improvement: ${issues.join(', ')}`;
    }
  }
}

/**
 * Implementation critic
 */
class ImplementationCritic extends BaseCritic {
  constructor(options = {}) {
    super(options);
    this.weights = {
      testCoverage: 2,
      codeQuality: 1.5,
      documentation: 1,
      ...options.weights,
    };
  }

  evaluate(context = {}) {
    const scores = {
      testCoverage: this.checkTestCoverage(context),
      codeQuality: this.checkCodeQuality(context),
      documentation: this.checkDocumentation(context),
    };

    const totalScore = this.calculateWeightedScore(scores);

    return new CriticResult(totalScore, this._generateMessage(totalScore, scores), scores);
  }

  /**
   * Check test coverage
   */
  checkTestCoverage(_context) {
    // Parse coverage/coverage-summary.json if it exists
    const coveragePath = path.join(this.projectRoot, 'coverage/coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      try {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
        const total = coverage.total;
        if (total && total.lines) {
          return total.lines.pct / 100;
        }
      } catch (e) {
        // Parse failed
      }
    }

    // Check that test files exist
    const testsDir = path.join(this.projectRoot, 'tests');
    if (!fs.existsSync(testsDir)) return 0;

    const testFiles = this._countFiles(testsDir, /\.test\.js$/);
    const srcDir = path.join(this.projectRoot, 'src');
    const srcFiles = fs.existsSync(srcDir) ? this._countFiles(srcDir, /\.js$/) : 1;

    // Ratio of test files to source files
    return Math.min(1, testFiles / Math.max(1, srcFiles * 0.5));
  }

  /**
   * Check code quality
   */
  checkCodeQuality(_context) {
    let score = 0;

    // ESLint configuration present
    if (this.fileExists('.eslintrc.js') || this.fileExists('.eslintrc.json')) {
      score += 0.3;
    }

    // Prettier configuration present
    if (this.fileExists('.prettierrc') || this.fileExists('.prettierrc.json')) {
      score += 0.2;
    }

    // package.json has lint/format scripts
    const pkg = this.readFile('package.json');
    if (pkg) {
      try {
        const pkgJson = JSON.parse(pkg);
        if (pkgJson.scripts && pkgJson.scripts.lint) {
          score += 0.3;
        }
        if (pkgJson.scripts && pkgJson.scripts.format) {
          score += 0.2;
        }
      } catch (e) {
        // Parse failed
      }
    }

    return score;
  }

  /**
   * Check documentation
   */
  checkDocumentation(_context) {
    let score = 0;

    // README.md
    if (this.fileExists('README.md')) score += 0.4;

    // CONTRIBUTING.md
    if (this.fileExists('CONTRIBUTING.md')) score += 0.2;

    // steering/ directory
    if (this.fileExists('steering/product.md')) score += 0.2;
    if (this.fileExists('steering/structure.md')) score += 0.2;

    return score;
  }

  _countFiles(dir, pattern) {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += this._countFiles(path.join(dir, entry.name), pattern);
      } else if (pattern.test(entry.name)) {
        count++;
      }
    }
    return count;
  }

  _generateMessage(score, scores) {
    if (score >= 0.8) {
      return 'Implementation is high quality: good test coverage and code quality tools configured.';
    } else if (score >= 0.5) {
      return 'Implementation meets basic quality standards.';
    } else {
      const issues = [];
      if (scores.testCoverage < 0.5) issues.push('add tests');
      if (scores.codeQuality < 0.5) issues.push('configure a linter/formatter');
      if (scores.documentation < 0.5) issues.push('improve documentation');
      return `Implementation needs improvement: ${issues.join(', ')}`;
    }
  }
}

/**
 * Critic system
 */
class CriticSystem {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.critics = {
      [StageType.REQUIREMENTS]: new RequirementsCritic({ projectRoot: this.projectRoot }),
      [StageType.DESIGN]: new DesignCritic({ projectRoot: this.projectRoot }),
      [StageType.IMPLEMENTATION]: new ImplementationCritic({ projectRoot: this.projectRoot }),
    };
  }

  /**
   * Evaluate a specific stage
   * @param {string} stage
   * @param {Object} context
   * @returns {CriticResult}
   */
  evaluate(stage, context = {}) {
    const critic = this.critics[stage];
    if (!critic) {
      throw new Error(`Unknown stage: ${stage}`);
    }
    return critic.evaluate(context);
  }

  /**
   * Evaluate all stages
   * @param {Object} context
   * @returns {Object}
   */
  evaluateAll(context = {}) {
    const results = {};
    let totalScore = 0;
    let count = 0;

    for (const [stage, critic] of Object.entries(this.critics)) {
      results[stage] = critic.evaluate(context);
      totalScore += results[stage].score;
      count++;
    }

    return {
      stages: results,
      overall: new CriticResult(
        count > 0 ? totalScore / count : 0,
        this._generateOverallMessage(results),
        { stageCount: count }
      ),
    };
  }

  /**
   * Generate a report
   * @param {Object} results
   * @returns {string}
   */
  generateReport(results) {
    let md = `# MUSUBI Quality Report\n\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;

    if (results.overall) {
      md += `## Overall Score\n\n`;
      md += `- **Score**: ${results.overall.percentage}%\n`;
      md += `- **Grade**: ${results.overall.grade}\n\n`;
    }

    md += `## Stage Results\n\n`;
    for (const [stage, result] of Object.entries(results.stages || results)) {
      md += `### ${stage}\n\n`;
      md += result.toMarkdown();
      md += '\n';
    }

    return md;
  }

  _generateOverallMessage(results) {
    const avgScore =
      Object.values(results).reduce((sum, r) => sum + r.score, 0) / Object.keys(results).length;
    if (avgScore >= 0.8) {
      return 'The project is high quality overall.';
    } else if (avgScore >= 0.5) {
      return 'The project meets basic quality standards.';
    } else {
      return 'The project needs improvement overall.';
    }
  }
}

module.exports = {
  CriticSystem,
  CriticResult,
  BaseCritic,
  RequirementsCritic,
  DesignCritic,
  ImplementationCritic,
  Grade,
  StageType,
};
