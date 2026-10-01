/**
 * MUSUBI Critic System
 *
 * SDDステージの品質評価システム / Quality evaluation system for SDD stages
 *
 * @module src/validators/critic-system
 * @see REQ-P0-B005
 * @inspired-by OpenHands openhands/critic/
 */

const fs = require('fs');
const path = require('path');

/**
 * 評価グレード / Evaluation grades
 */
const Grade = {
  A: 'A', // 0.8+
  B: 'B', // 0.5-0.79
  C: 'C', // 0.3-0.49
  F: 'F', // < 0.3
};

/**
 * ステージタイプ / Stage types
 */
const StageType = {
  REQUIREMENTS: 'requirements',
  DESIGN: 'design',
  IMPLEMENTATION: 'implementation',
  TEST: 'test',
  VALIDATION: 'validation',
};

/**
 * 評価結果 / Evaluation result
 */
class CriticResult {
  /**
   * @param {number} score - スコア (0.0 - 1.0) / Score (0.0 - 1.0)
   * @param {string} message - 評価メッセージ / Evaluation message
   * @param {Object} details - 詳細情報 / Detailed information
   */
  constructor(score, message, details = {}) {
    this.score = Math.max(0, Math.min(1, score));
    this.message = message;
    this.details = details;
    this.timestamp = new Date();
  }

  /**
   * 成功判定 / Determine success
   * @returns {boolean}
   */
  get success() {
    return this.score >= 0.5;
  }

  /**
   * グレードを取得 / Get the grade
   * @returns {string}
   */
  get grade() {
    if (this.score >= 0.8) return Grade.A;
    if (this.score >= 0.5) return Grade.B;
    if (this.score >= 0.3) return Grade.C;
    return Grade.F;
  }

  /**
   * パーセンテージを取得 / Get the percentage
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
   * Markdown形式でレポート生成 / Generate a report in Markdown format
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
 * 基底クリティック / Base critic
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
   * 評価を実行 / Run the evaluation
   * @param {Object} context - 評価コンテキスト / Evaluation context
   * @returns {CriticResult}
   */
  evaluate(_context = {}) {
    throw new Error('Must implement evaluate()');
  }

  /**
   * 重み付けスコアを計算 / Calculate the weighted score
   * @param {Object} scores - 各項目のスコア / Score for each item
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
   * ファイルが存在するかチェック / Check whether a file exists
   * @param {string} relativePath
   * @returns {boolean}
   */
  fileExists(relativePath) {
    return fs.existsSync(path.join(this.projectRoot, relativePath));
  }

  /**
   * ファイル内容を読み込み / Read file contents
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
 * 要件クリティック / Requirements critic
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
   * EARS形式準拠チェック / EARS format compliance check
   */
  checkEarsFormat(context) {
    const content =
      context.content || this.readFile('storage/specs/srs/srs-musubi-v3.0.0.ja.md') || '';

    // EARS キーワードパターン / EARS keyword patterns
    const earsPatterns = [
      /\b(When|If|While|Where)\b.*\b(shall|should|must)\b/gi,
      /\bThe system shall\b/gi,
      /\bshall be able to\b/gi,
    ];

    const reqPattern = /REQ-[A-Z0-9]+-\d+/g;
    const requirements = content.match(reqPattern) || [];

    if (requirements.length === 0) return 0;

    // EARS パターンの出現をカウント / Count occurrences of EARS patterns
    let earsCount = 0;
    earsPatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      earsCount += matches.length;
    });

    // 要件数に対するEARS準拠率 / EARS compliance rate relative to the number of requirements
    return Math.min(1, earsCount / requirements.length);
  }

  /**
   * 完全性チェック / Completeness check
   */
  checkCompleteness(context) {
    const content =
      context.content || this.readFile('storage/specs/srs/srs-musubi-v3.0.0.ja.md') || '';

    const requiredSections = [
      /## 機能要件|## Functional Requirements/i, // EN: matches "Functional Requirements" heading (JA/EN)
      /## 非機能要件|## Non-Functional Requirements/i, // EN: matches "Non-Functional Requirements" heading (JA/EN)
      /## 制約|## Constraints/i, // EN: matches "Constraints" heading (JA/EN)
    ];

    const presentSections = requiredSections.filter(pattern => pattern.test(content));
    return presentSections.length / requiredSections.length;
  }

  /**
   * テスト可能性チェック / Testability check
   */
  checkTestability(context) {
    const content =
      context.content || this.readFile('storage/specs/srs/srs-musubi-v3.0.0.ja.md') || '';

    // 数値目標や測定可能な基準があるかチェック / Check for numeric targets or measurable criteria
    const measurablePatterns = [
      /\d+%/g, // パーセンテージ / Percentage
      /\d+\s*(秒|ms|ミリ秒|seconds?)/gi, // 時間 / Time (秒 = seconds, ミリ秒 = milliseconds)
      /\d+\s*(回|times?)/gi, // 回数 / Count (回 = times)
      /less than|greater than|at least|最大|最小/gi, // EN: 最大 = maximum, 最小 = minimum
    ];

    let measurableCount = 0;
    measurablePatterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      measurableCount += matches.length;
    });

    // 測定可能な基準が10個以上あれば満点 / Full score if there are 10 or more measurable criteria
    return Math.min(1, measurableCount / 10);
  }

  /**
   * トレーサビリティチェック / Traceability check
   */
  checkTraceability(context) {
    const content = context.content || '';

    // 要件IDへの参照をチェック / Check references to requirement IDs
    const reqPattern = /REQ-[A-Z0-9]+-\d+/g;
    const requirements = content.match(reqPattern) || [];

    // 重複を除去してユニークな要件数をカウント / Remove duplicates and count unique requirements
    const uniqueReqs = [...new Set(requirements)];

    // 5つ以上のユニーク要件があれば良好 / Good if there are 5 or more unique requirements
    return Math.min(1, uniqueReqs.length / 5);
  }

  _generateMessage(score, scores) {
    if (score >= 0.8) {
      return '要件定義は高品質です。EARS形式に準拠し、テスト可能な基準が明確です。'; // EN: The requirements definition is high quality. It complies with the EARS format and has clear testable criteria.
    } else if (score >= 0.5) {
      return '要件定義は基本的な品質基準を満たしています。いくつかの改善点があります。'; // EN: The requirements definition meets basic quality standards. There are some areas for improvement.
    } else {
      const issues = [];
      if (scores.earsCompliance < 0.5) issues.push('EARS形式への準拠'); // EN: EARS format compliance
      if (scores.completeness < 0.5) issues.push('必須セクションの追加'); // EN: Add required sections
      if (scores.testability < 0.5) issues.push('測定可能な基準の追加'); // EN: Add measurable criteria
      return `要件定義には改善が必要です: ${issues.join(', ')}`; // EN: The requirements definition needs improvement: ${issues}
    }
  }
}

/**
 * 設計クリティック / Design critic
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
   * C4モデル準拠チェック / C4 model compliance check
   */
  checkC4Format(_context) {
    const designDir = path.join(this.projectRoot, 'storage/design');
    if (!fs.existsSync(designDir)) return 0;

    // C4レベルのキーワードをチェック / Check C4 level keywords
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
   * ADR存在チェック / ADR presence check
   */
  checkAdrPresence(_context) {
    const adrDir = path.join(this.projectRoot, 'storage/design/adr');
    if (!fs.existsSync(adrDir)) return 0;

    const adrFiles = fs.readdirSync(adrDir).filter(f => f.startsWith('ADR-') && f.endsWith('.md'));

    // 3つ以上のADRがあれば満点 / Full score if there are 3 or more ADRs
    return Math.min(1, adrFiles.length / 3);
  }

  /**
   * 要件カバレッジチェック / Requirements coverage check
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

    // 5つ以上の要件参照があれば満点 / Full score if there are 5 or more requirement references
    return Math.min(1, reqReferences.size / 5);
  }

  _generateMessage(score, scores) {
    if (score >= 0.8) {
      return '設計ドキュメントは高品質です。C4モデルに準拠し、ADRが適切に作成されています。'; // EN: The design document is high quality. It complies with the C4 model and ADRs are properly created.
    } else if (score >= 0.5) {
      return '設計ドキュメントは基本的な品質を満たしています。'; // EN: The design document meets basic quality.
    } else {
      const issues = [];
      if (scores.c4Compliance < 0.5) issues.push('C4モデルの適用'); // EN: Apply the C4 model
      if (scores.adrPresence < 0.5) issues.push('ADRの作成'); // EN: Create ADRs
      if (scores.reqCoverage < 0.5) issues.push('要件へのリンク'); // EN: Link to requirements
      return `設計には改善が必要です: ${issues.join(', ')}`; // EN: The design needs improvement: ${issues}
    }
  }
}

/**
 * 実装クリティック / Implementation critic
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
   * テストカバレッジチェック / Test coverage check
   */
  checkTestCoverage(_context) {
    // coverage/lcov-report/index.html があればパース / parse coverage/lcov-report/index.html if it exists
    const coveragePath = path.join(this.projectRoot, 'coverage/coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      try {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
        const total = coverage.total;
        if (total && total.lines) {
          return total.lines.pct / 100;
        }
      } catch (e) {
        // パース失敗 / Parse failed
      }
    }

    // テストファイルの存在をチェック / Check that test files exist
    const testsDir = path.join(this.projectRoot, 'tests');
    if (!fs.existsSync(testsDir)) return 0;

    const testFiles = this._countFiles(testsDir, /\.test\.js$/);
    const srcDir = path.join(this.projectRoot, 'src');
    const srcFiles = fs.existsSync(srcDir) ? this._countFiles(srcDir, /\.js$/) : 1;

    // テストファイル数とソースファイル数の比率 / Ratio of test files to source files
    return Math.min(1, testFiles / Math.max(1, srcFiles * 0.5));
  }

  /**
   * コード品質チェック / Code quality check
   */
  checkCodeQuality(_context) {
    let score = 0;

    // ESLint設定の存在 / ESLint config exists
    if (this.fileExists('.eslintrc.js') || this.fileExists('.eslintrc.json')) {
      score += 0.3;
    }

    // Prettier設定の存在 / Prettier config exists
    if (this.fileExists('.prettierrc') || this.fileExists('.prettierrc.json')) {
      score += 0.2;
    }

    // package.json に lint スクリプトがあるか / Whether package.json has a lint script
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
        // パース失敗 / Parse failed
      }
    }

    return score;
  }

  /**
   * ドキュメントチェック / Documentation check
   */
  checkDocumentation(_context) {
    let score = 0;

    // README.md
    if (this.fileExists('README.md')) score += 0.4;

    // CONTRIBUTING.md
    if (this.fileExists('CONTRIBUTING.md')) score += 0.2;

    // steering/ ディレクトリ / steering/ directory
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
      return '実装は高品質です。テストカバレッジが高く、コード品質ツールが設定されています。'; // EN: The implementation is high quality. Test coverage is high and code quality tools are configured.
    } else if (score >= 0.5) {
      return '実装は基本的な品質を満たしています。'; // EN: The implementation meets basic quality.
    } else {
      const issues = [];
      if (scores.testCoverage < 0.5) issues.push('テストの追加'); // EN: Add tests
      if (scores.codeQuality < 0.5) issues.push('リンター/フォーマッターの設定'); // EN: Configure linter/formatter
      if (scores.documentation < 0.5) issues.push('ドキュメントの充実'); // EN: Improve documentation
      return `実装には改善が必要です: ${issues.join(', ')}`; // EN: The implementation needs improvement: ${issues}
    }
  }
}

/**
 * クリティックシステム / Critic system
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
   * 特定ステージを評価 / Evaluate a specific stage
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
   * 全ステージを評価 / Evaluate all stages
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
   * レポートを生成 / Generate a report
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
      return 'プロジェクトは全体的に高品質です。'; // EN: The project is of high quality overall.
    } else if (avgScore >= 0.5) {
      return 'プロジェクトは基本的な品質を満たしています。'; // EN: The project meets basic quality.
    } else {
      return 'プロジェクトには全体的な改善が必要です。'; // EN: The project needs overall improvement.
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
