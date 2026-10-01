/**
 * Design Reviewer
 *
 * ATAM、SOLID原則、デザインパターン、結合度・凝集度、
 * エラーハンドリング、セキュリティの観点から設計書をレビュー
 * Reviews design documents from the perspectives of ATAM, SOLID principles, design patterns,
 * coupling/cohesion, error handling, and security
 *
 * @module src/validators/design-reviewer
 */

const fs = require('fs');
const path = require('path');

/**
 * 問題の深刻度 / Issue severity
 */
const IssueSeverity = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  SUGGESTION: 'suggestion',
};

/**
 * 問題のカテゴリ / Issue category
 */
const IssueCategory = {
  ATAM: 'atam',
  SOLID: 'solid',
  PATTERN: 'pattern',
  COUPLING: 'coupling',
  COHESION: 'cohesion',
  ERROR_HANDLING: 'error-handling',
  SECURITY: 'security',
  C4_MODEL: 'c4-model',
  ADR: 'adr',
};

/**
 * SOLID原則の種類 / Types of SOLID principles
 */
const SOLIDPrinciple = {
  SRP: 'srp', // Single Responsibility
  OCP: 'ocp', // Open/Closed
  LSP: 'lsp', // Liskov Substitution
  ISP: 'isp', // Interface Segregation
  DIP: 'dip', // Dependency Inversion
};

/**
 * レビュー観点 / Review perspectives
 */
const ReviewFocus = {
  ATAM: 'atam',
  SOLID: 'solid',
  PATTERNS: 'patterns',
  COUPLING_COHESION: 'coupling-cohesion',
  ERROR_HANDLING: 'error-handling',
  SECURITY: 'security',
  ALL: 'all',
};

/**
 * 品質属性 / Quality attributes
 */
const QualityAttribute = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  AVAILABILITY: 'availability',
  MODIFIABILITY: 'modifiability',
  TESTABILITY: 'testability',
  SCALABILITY: 'scalability',
  USABILITY: 'usability',
};

/**
 * 設計上の問題クラス / Design issue class
 */
class DesignIssue {
  constructor(options = {}) {
    this.id = options.id || `DES-${Date.now()}`;
    this.category = options.category || IssueCategory.SOLID;
    this.severity = options.severity || IssueSeverity.MINOR;
    this.principle = options.principle || null; // For SOLID
    this.title = options.title || '';
    this.description = options.description || '';
    this.location = options.location || '';
    this.evidence = options.evidence || '';
    this.recommendation = options.recommendation || '';
    this.status = options.status || 'open';
  }

  toJSON() {
    return {
      id: this.id,
      category: this.category,
      severity: this.severity,
      principle: this.principle,
      title: this.title,
      description: this.description,
      location: this.location,
      evidence: this.evidence,
      recommendation: this.recommendation,
      status: this.status,
    };
  }
}

/**
 * レビュー結果クラス / Review result class
 */
class DesignReviewResult {
  constructor() {
    this.issues = [];
    this.metrics = {
      totalIssues: 0,
      bySeverity: {},
      byCategory: {},
      solidCompliance: {},
      couplingScore: 0,
      cohesionScore: 0,
      securityScore: 0,
    };
    this.qualityGate = {
      passed: false,
      criteria: [],
    };
    this.timestamp = new Date();
  }

  addIssue(issue) {
    this.issues.push(issue);
    this.updateMetrics();
  }

  updateMetrics() {
    this.metrics.totalIssues = this.issues.length;

    // Severity別カウント / Count by severity
    this.metrics.bySeverity = {};
    Object.values(IssueSeverity).forEach(sev => {
      this.metrics.bySeverity[sev] = this.issues.filter(i => i.severity === sev).length;
    });

    // Category別カウント / Count by category
    this.metrics.byCategory = {};
    Object.values(IssueCategory).forEach(cat => {
      this.metrics.byCategory[cat] = this.issues.filter(i => i.category === cat).length;
    });

    // SOLID原則別カウント / Count by SOLID principle
    this.metrics.solidCompliance = {};
    Object.values(SOLIDPrinciple).forEach(principle => {
      const violations = this.issues.filter(
        i => i.category === IssueCategory.SOLID && i.principle === principle
      ).length;
      this.metrics.solidCompliance[principle] = violations === 0;
    });
  }

  evaluateQualityGate(options = {}) {
    const {
      maxCritical = 0,
      maxMajorPercent = 20,
      requireSolidCompliance = true,
      requireSecurityReview = true,
    } = options;

    const criteria = [];

    // Critical問題チェック / Critical issue check
    const criticalCount = this.metrics.bySeverity[IssueSeverity.CRITICAL] || 0;
    criteria.push({
      name: 'No Critical Issues',
      passed: criticalCount <= maxCritical,
      actual: criticalCount,
      threshold: maxCritical,
    });

    // Major問題率チェック / Major issue ratio check
    const majorCount = this.metrics.bySeverity[IssueSeverity.MAJOR] || 0;
    const majorPercent =
      this.metrics.totalIssues > 0 ? (majorCount / this.metrics.totalIssues) * 100 : 0;
    criteria.push({
      name: 'Major Issues Under Threshold',
      passed: majorPercent <= maxMajorPercent,
      actual: Math.round(majorPercent),
      threshold: maxMajorPercent,
    });

    // SOLID準拠チェック / SOLID compliance check
    if (requireSolidCompliance) {
      const solidViolations = this.issues.filter(i => i.category === IssueCategory.SOLID).length;
      criteria.push({
        name: 'SOLID Principles Compliance',
        passed: solidViolations === 0,
        actual: solidViolations,
        threshold: 0,
      });
    }

    // セキュリティレビューチェック / Security review check
    if (requireSecurityReview) {
      const securityIssues = this.issues.filter(
        i => i.category === IssueCategory.SECURITY && i.severity === IssueSeverity.CRITICAL
      ).length;
      criteria.push({
        name: 'No Critical Security Issues',
        passed: securityIssues === 0,
        actual: securityIssues,
        threshold: 0,
      });
    }

    this.qualityGate.criteria = criteria;
    this.qualityGate.passed = criteria.every(c => c.passed);

    return this.qualityGate;
  }

  toMarkdown() {
    let md = `# Design Review Report\n\n`;
    md += `**Date**: ${this.timestamp.toISOString().split('T')[0]}\n\n`;

    // Summary
    md += `## Summary\n\n`;
    md += `| Severity | Count |\n`;
    md += `|----------|-------|\n`;
    Object.entries(this.metrics.bySeverity).forEach(([severity, count]) => {
      const emoji = {
        critical: '🔴',
        major: '🟠',
        minor: '🟡',
        suggestion: '🟢',
      };
      md += `| ${emoji[severity] || ''} ${severity} | ${count} |\n`;
    });
    md += `| **Total** | **${this.metrics.totalIssues}** |\n\n`;

    // By Category
    md += `## Issues by Category\n\n`;
    md += `| Category | Count |\n`;
    md += `|----------|-------|\n`;
    Object.entries(this.metrics.byCategory).forEach(([category, count]) => {
      if (count > 0) {
        md += `| ${category} | ${count} |\n`;
      }
    });
    md += '\n';

    // SOLID Compliance
    md += `## SOLID Principles Compliance\n\n`;
    md += `| Principle | Status |\n`;
    md += `|-----------|--------|\n`;
    const principleNames = {
      srp: 'Single Responsibility',
      ocp: 'Open/Closed',
      lsp: 'Liskov Substitution',
      isp: 'Interface Segregation',
      dip: 'Dependency Inversion',
    };
    Object.entries(this.metrics.solidCompliance).forEach(([principle, compliant]) => {
      md += `| ${principleNames[principle] || principle} | ${compliant ? '✅' : '❌'} |\n`;
    });
    md += '\n';

    // Quality Gate
    md += `## Quality Gate\n\n`;
    md += `**Status**: ${this.qualityGate.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    md += `| Criterion | Status | Actual | Threshold |\n`;
    md += `|-----------|--------|--------|-----------|\n`;
    this.qualityGate.criteria.forEach(c => {
      md += `| ${c.name} | ${c.passed ? '✅' : '❌'} | ${c.actual} | ${c.threshold} |\n`;
    });
    md += '\n';

    // Detailed Issues
    md += `## Detailed Issues\n\n`;
    this.issues.forEach(issue => {
      md += `### ${issue.id}: ${issue.title}\n\n`;
      md += `- **Category**: ${issue.category}\n`;
      md += `- **Severity**: ${issue.severity}\n`;
      if (issue.principle) {
        md += `- **Principle**: ${issue.principle}\n`;
      }
      if (issue.location) {
        md += `- **Location**: ${issue.location}\n`;
      }
      md += `\n**Description**: ${issue.description}\n\n`;
      if (issue.evidence) {
        md += `**Evidence**: "${issue.evidence}"\n\n`;
      }
      md += `**Recommendation**: ${issue.recommendation}\n\n`;
      md += `---\n\n`;
    });

    return md;
  }

  toJSON() {
    return {
      issues: this.issues.map(i => i.toJSON()),
      metrics: this.metrics,
      qualityGate: this.qualityGate,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Design Reviewer クラス / Design Reviewer class
 */
class DesignReviewer {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;

    // SOLID違反を検出するためのパターン / Patterns for detecting SOLID violations
    this.solidViolationPatterns = {
      srp: [
        /class\s+\w*(Manager|Handler|Processor|Service|Controller)\b/gi,
        /class\s+\w*And\w*/gi,
        /\bGod\s*(Class|Object)\b/gi,
      ],
      ocp: [
        /switch\s*\([^)]*type[^)]*\)/gi,
        /if\s*\([^)]*instanceof[^)]*\)/gi,
        /switch\s*\([^)]*\.getClass\(\)/gi,
      ],
      lsp: [/throw\s+new\s+(NotImplementedException|UnsupportedOperationException)/gi],
      isp: [/interface\s+\w+\s*\{[^}]{500,}\}/gi], // Large interfaces
      dip: [
        /new\s+[A-Z]\w+\s*\([^)]*\)/g, // Direct instantiation pattern
        /import\s+.*\bimpl\b/gi,
      ],
    };

    // デザインパターンの検出 / Design pattern detection
    this.patternIndicators = {
      singleton: /\bgetInstance\b|\bINSTANCE\b|\bprivate\s+static/gi,
      factory: /\bFactory\b|\bcreate[A-Z]\w+\(/gi,
      observer: /\bObserver\b|\bListener\b|\bsubscribe\b|\bpublish\b/gi,
      strategy: /\bStrategy\b|\bPolicy\b/gi,
      decorator: /\bDecorator\b|\bWrapper\b/gi,
      adapter: /\bAdapter\b|\bBridge\b/gi,
      facade: /\bFacade\b/gi,
      repository: /\bRepository\b/gi,
    };

    // セキュリティ関連キーワード / Security-related keywords
    this.securityKeywords = {
      authentication: /\b(auth|login|oauth|jwt|token|session|credential|password)\b/gi,
      authorization: /\b(permission|role|access|rbac|abac|acl|policy)\b/gi,
      encryption: /\b(encrypt|decrypt|hash|salt|aes|rsa|ssl|tls|https)\b/gi,
      validation: /\b(validate|sanitize|escape|xss|injection|csrf)\b/gi,
    };

    // エラーハンドリングパターン / Error handling patterns
    this.errorHandlingPatterns = {
      emptyTry: /try\s*\{[^}]*\}\s*catch\s*\([^)]*\)\s*\{\s*\}/gi,
      genericCatch: /catch\s*\(\s*(Exception|Error|Throwable)\s+/gi,
      swallowException: /catch\s*\([^)]*\)\s*\{\s*\/\/\s*(ignore|swallow)/gi,
    };
  }

  /**
   * ドキュメントを読み込む / Read the document
   */
  async loadDocument(documentPath) {
    const fullPath = path.isAbsolute(documentPath)
      ? documentPath
      : path.join(this.projectPath, documentPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Document not found: ${fullPath}`);
    }

    return fs.readFileSync(fullPath, 'utf-8');
  }

  /**
   * SOLID原則のレビュー / Review SOLID principles
   */
  reviewSOLID(content, _options = {}) {
    const issues = [];
    let issueCounter = 1;

    // SRP (Single Responsibility Principle) チェック / check
    this.solidViolationPatterns.srp.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        issues.push(
          new DesignIssue({
            id: `DES-SOLID-${String(issueCounter++).padStart(3, '0')}`,
            category: IssueCategory.SOLID,
            principle: SOLIDPrinciple.SRP,
            severity: IssueSeverity.MAJOR,
            title: 'Potential SRP Violation',
            description: `Class naming suggests multiple responsibilities: "${match}"`,
            evidence: match,
            recommendation:
              'Consider splitting into smaller, focused classes. Each class should have only one reason to change.',
          })
        );
      });
    });

    // OCP (Open/Closed Principle) チェック / check
    this.solidViolationPatterns.ocp.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        issues.push(
          new DesignIssue({
            id: `DES-SOLID-${String(issueCounter++).padStart(3, '0')}`,
            category: IssueCategory.SOLID,
            principle: SOLIDPrinciple.OCP,
            severity: IssueSeverity.MAJOR,
            title: 'Potential OCP Violation',
            description: 'Type-based switching suggests need for polymorphism',
            evidence: match,
            recommendation:
              'Use Strategy pattern or polymorphism instead of switch/if-else on types.',
          })
        );
      });
    });

    // LSP (Liskov Substitution Principle) チェック / check
    this.solidViolationPatterns.lsp.forEach(pattern => {
      const matches = content.match(pattern) || [];
      matches.forEach(match => {
        issues.push(
          new DesignIssue({
            id: `DES-SOLID-${String(issueCounter++).padStart(3, '0')}`,
            category: IssueCategory.SOLID,
            principle: SOLIDPrinciple.LSP,
            severity: IssueSeverity.MAJOR,
            title: 'Potential LSP Violation',
            description: 'NotImplementedException suggests subtype cannot substitute base type',
            evidence: match,
            recommendation:
              'Ensure subclasses can fully substitute their parent classes. Consider redesigning the inheritance hierarchy.',
          })
        );
      });
    });

    // ISP (Interface Segregation Principle) チェック / check
    if (/interface\s+\w+\s*\{/gi.test(content)) {
      // Check for "fat" interfaces mentioned in design
      if (/fat\s+interface|large\s+interface|많은\s+메서드/gi.test(content)) {
        issues.push(
          new DesignIssue({
            id: `DES-SOLID-${String(issueCounter++).padStart(3, '0')}`,
            category: IssueCategory.SOLID,
            principle: SOLIDPrinciple.ISP,
            severity: IssueSeverity.MINOR,
            title: 'Potential ISP Concern',
            description: 'Document mentions large interfaces',
            recommendation:
              'Split large interfaces into smaller, role-specific interfaces (e.g., IReadable, IWritable).',
          })
        );
      }
    }

    // DIP (Dependency Inversion Principle) チェック / check
    if (/directly\s+depend|concrete\s+class|tight\s+coupling|直接依存/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-SOLID-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.SOLID,
          principle: SOLIDPrinciple.DIP,
          severity: IssueSeverity.MAJOR,
          title: 'Potential DIP Violation',
          description: 'Design mentions direct dependencies on concrete classes',
          recommendation:
            'Depend on abstractions (interfaces) rather than concrete implementations. Use dependency injection.',
        })
      );
    }

    return issues;
  }

  /**
   * デザインパターンのレビュー / Review design patterns
   */
  reviewPatterns(content, _options = {}) {
    const issues = [];
    let issueCounter = 1;
    const detectedPatterns = [];

    // パターン検出 / Pattern detection
    Object.entries(this.patternIndicators).forEach(([pattern, regex]) => {
      if (regex.test(content)) {
        detectedPatterns.push(pattern);
      }
    });

    // Singleton乱用チェック / Singleton overuse check
    if (detectedPatterns.includes('singleton')) {
      const singletonCount = (content.match(/Singleton|getInstance|INSTANCE/gi) || []).length;
      if (singletonCount > 3) {
        issues.push(
          new DesignIssue({
            id: `DES-PAT-${String(issueCounter++).padStart(3, '0')}`,
            category: IssueCategory.PATTERN,
            severity: IssueSeverity.MAJOR,
            title: 'Excessive Singleton Usage',
            description: `Multiple Singleton patterns detected (${singletonCount} occurrences). May indicate global state abuse.`,
            recommendation:
              'Consider using Dependency Injection instead of Singletons for better testability.',
          })
        );
      }
    }

    // 必要なパターンの欠如チェック / Check for missing necessary patterns
    if (
      /複雑.*生成|complex.*creation|オブジェクト.*生成/gi.test(content) &&
      !detectedPatterns.includes('factory')
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-PAT-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.PATTERN,
          severity: IssueSeverity.MINOR,
          title: 'Missing Factory Pattern',
          description: 'Complex object creation mentioned but no Factory pattern detected',
          recommendation: 'Consider using Factory pattern to encapsulate complex object creation.',
        })
      );
    }

    // イベント処理があるがObserverパターンがない / Event handling exists but no Observer pattern
    if (
      /event|イベント|notification|通知/gi.test(content) &&
      !detectedPatterns.includes('observer')
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-PAT-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.PATTERN,
          severity: IssueSeverity.SUGGESTION,
          title: 'Consider Observer Pattern',
          description: 'Event handling mentioned. Observer pattern might be beneficial.',
          recommendation: 'Consider Observer/Pub-Sub pattern for decoupled event notification.',
        })
      );
    }

    return issues;
  }

  /**
   * 結合度・凝集度のレビュー / Review coupling and cohesion
   */
  reviewCouplingCohesion(content, _options = {}) {
    const issues = [];
    let issueCounter = 1;

    // 高結合の兆候 / Signs of high coupling
    if (/tight\s*coupling|密結合|強結合|直接.*依存/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-CC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.COUPLING,
          severity: IssueSeverity.MAJOR,
          title: 'High Coupling Detected',
          description: 'Design mentions tight coupling between components',
          recommendation: 'Reduce coupling through interfaces, events, or dependency injection.',
        })
      );
    }

    // グローバル状態の使用 / Use of global state
    if (/global\s*(state|variable)|グローバル.*変数|共有.*状態/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-CC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.COUPLING,
          severity: IssueSeverity.MAJOR,
          title: 'Global State Usage',
          description: 'Design mentions global state which creates implicit coupling',
          recommendation: 'Avoid global state. Use explicit dependency passing instead.',
        })
      );
    }

    // 低凝集の兆候 / Signs of low cohesion
    if (/utility\s*class|ヘルパー.*クラス|misc|その他/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-CC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.COHESION,
          severity: IssueSeverity.MINOR,
          title: 'Low Cohesion Indicator',
          description: 'Utility/Helper classes often indicate low cohesion',
          recommendation:
            'Move utility methods to the classes that use them, or create domain-specific classes.',
        })
      );
    }

    // 循環依存 / Circular dependencies
    if (/circular\s*dependency|循環.*依存|相互.*依存/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-CC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.COUPLING,
          severity: IssueSeverity.CRITICAL,
          title: 'Circular Dependency',
          description: 'Circular dependency mentioned in design',
          recommendation:
            'Break circular dependencies using interfaces, events, or extracting common code.',
        })
      );
    }

    return issues;
  }

  /**
   * エラーハンドリングのレビュー / Review error handling
   */
  reviewErrorHandling(content, _options = {}) {
    const issues = [];
    let issueCounter = 1;

    // エラーハンドリング戦略の有無 / Presence of an error handling strategy
    if (!/error\s*handling|エラー.*ハンドリング|例外.*処理|exception/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-ERR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ERROR_HANDLING,
          severity: IssueSeverity.MAJOR,
          title: 'Missing Error Handling Strategy',
          description: 'No error handling strategy documented',
          recommendation:
            'Define error handling strategy including exception hierarchy, retry policies, and graceful degradation.',
        })
      );
    }

    // リトライ戦略 / Retry strategy
    if (
      /network|API|外部.*サービス|external.*service/gi.test(content) &&
      !/retry|リトライ|再試行|backoff/gi.test(content)
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-ERR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ERROR_HANDLING,
          severity: IssueSeverity.MINOR,
          title: 'Missing Retry Strategy',
          description: 'External service integration without retry strategy',
          recommendation: 'Add retry with exponential backoff for external service calls.',
        })
      );
    }

    // サーキットブレーカー / Circuit breaker
    if (
      /microservice|マイクロサービス|distributed/gi.test(content) &&
      !/circuit\s*breaker|サーキット.*ブレーカー/gi.test(content)
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-ERR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ERROR_HANDLING,
          severity: IssueSeverity.MINOR,
          title: 'Consider Circuit Breaker',
          description: 'Distributed system without circuit breaker pattern',
          recommendation: 'Implement circuit breaker pattern to prevent cascade failures.',
        })
      );
    }

    // グレースフルデグラデーション / Graceful degradation
    if (!/graceful\s*degradation|縮退運転|フォールバック|fallback/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-ERR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ERROR_HANDLING,
          severity: IssueSeverity.SUGGESTION,
          title: 'Consider Graceful Degradation',
          description: 'No graceful degradation strategy documented',
          recommendation: 'Define fallback behaviors for when components fail.',
        })
      );
    }

    return issues;
  }

  /**
   * セキュリティのレビュー / Review security
   */
  reviewSecurity(content, _options = {}) {
    const issues = [];
    let issueCounter = 1;

    // 認証 / Authentication
    if (
      /user|ユーザー|account|アカウント/gi.test(content) &&
      !this.securityKeywords.authentication.test(content)
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-SEC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.SECURITY,
          severity: IssueSeverity.CRITICAL,
          title: 'Missing Authentication Design',
          description: 'User-facing system without authentication strategy documented',
          recommendation:
            'Define authentication method (OAuth, JWT, etc.), password policy, and MFA requirements.',
        })
      );
    }

    // 認可 / Authorization
    if (
      /role|権限|permission|管理者|admin/gi.test(content) &&
      !/authorization|認可|access\s*control|アクセス制御/gi.test(content)
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-SEC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.SECURITY,
          severity: IssueSeverity.MAJOR,
          title: 'Missing Authorization Design',
          description: 'Role-based features without authorization strategy',
          recommendation:
            'Define RBAC/ABAC model, permission hierarchy, and access control enforcement points.',
        })
      );
    }

    // データ保護 / Data protection
    if (
      /personal|個人|sensitive|機密|PII|password/gi.test(content) &&
      !this.securityKeywords.encryption.test(content)
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-SEC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.SECURITY,
          severity: IssueSeverity.CRITICAL,
          title: 'Missing Data Protection Design',
          description: 'Sensitive data handling without encryption strategy',
          recommendation:
            'Define encryption at rest/transit, key management, and data classification.',
        })
      );
    }

    // 入力検証 / Input validation
    if (
      /input|入力|form|フォーム|API/gi.test(content) &&
      !this.securityKeywords.validation.test(content)
    ) {
      issues.push(
        new DesignIssue({
          id: `DES-SEC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.SECURITY,
          severity: IssueSeverity.MAJOR,
          title: 'Missing Input Validation Design',
          description: 'User input without validation/sanitization strategy',
          recommendation:
            'Define input validation rules, sanitization methods, and output encoding.',
        })
      );
    }

    // 監査ログ / Audit logging
    if (!/audit|監査|logging|ログ/gi.test(content)) {
      issues.push(
        new DesignIssue({
          id: `DES-SEC-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.SECURITY,
          severity: IssueSeverity.MINOR,
          title: 'Missing Audit Logging Design',
          description: 'No audit logging strategy documented',
          recommendation:
            'Define security-relevant events to log, log retention policy, and log protection.',
        })
      );
    }

    return issues;
  }

  /**
   * C4モデルのレビュー / Review the C4 model
   */
  reviewC4Model(content, _options = {}) {
    const issues = [];
    let issueCounter = 1;

    // C4ダイアグラムの有無 / Presence of C4 diagrams
    const hasContext = /context\s*diagram|コンテキスト.*図|システム.*境界/gi.test(content);
    const hasContainer = /container\s*diagram|コンテナ.*図|アプリケーション.*構成/gi.test(content);
    const hasComponent = /component\s*diagram|コンポーネント.*図/gi.test(content);

    if (!hasContext) {
      issues.push(
        new DesignIssue({
          id: `DES-C4-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.C4_MODEL,
          severity: IssueSeverity.MAJOR,
          title: 'Missing Context Diagram',
          description: 'C4 Context diagram not found',
          recommendation:
            'Add Context diagram showing system boundary, actors, and external systems.',
        })
      );
    }

    if (!hasContainer) {
      issues.push(
        new DesignIssue({
          id: `DES-C4-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.C4_MODEL,
          severity: IssueSeverity.MAJOR,
          title: 'Missing Container Diagram',
          description: 'C4 Container diagram not found',
          recommendation:
            'Add Container diagram showing applications, databases, and their interactions.',
        })
      );
    }

    if (!hasComponent) {
      issues.push(
        new DesignIssue({
          id: `DES-C4-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.C4_MODEL,
          severity: IssueSeverity.MINOR,
          title: 'Missing Component Diagram',
          description: 'C4 Component diagram not found',
          recommendation: 'Add Component diagram for key containers showing internal structure.',
        })
      );
    }

    return issues;
  }

  /**
   * ADRのレビュー / Review ADRs
   */
  reviewADR(content, _options = {}) {
    const issues = [];
    let issueCounter = 1;

    // ADRの基本構造チェック / Check basic ADR structure
    const hasStatus = /status:\s*(proposed|accepted|deprecated|superseded)/gi.test(content);
    const hasContext = /##\s*context|##\s*背景|##\s*コンテキスト/gi.test(content);
    const hasDecision = /##\s*decision|##\s*決定/gi.test(content);
    const hasConsequences = /##\s*consequences|##\s*結果|##\s*影響/gi.test(content);
    const hasAlternatives = /##\s*alternatives|##\s*代替案|options\s*considered/gi.test(content);

    if (!hasStatus) {
      issues.push(
        new DesignIssue({
          id: `DES-ADR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ADR,
          severity: IssueSeverity.MINOR,
          title: 'Missing ADR Status',
          description: 'ADR status not specified',
          recommendation: 'Add status: proposed/accepted/deprecated/superseded.',
        })
      );
    }

    if (!hasContext) {
      issues.push(
        new DesignIssue({
          id: `DES-ADR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ADR,
          severity: IssueSeverity.MAJOR,
          title: 'Missing ADR Context',
          description: 'ADR context/background not documented',
          recommendation: 'Add Context section explaining the problem/situation.',
        })
      );
    }

    if (!hasDecision) {
      issues.push(
        new DesignIssue({
          id: `DES-ADR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ADR,
          severity: IssueSeverity.CRITICAL,
          title: 'Missing ADR Decision',
          description: 'ADR decision not clearly stated',
          recommendation: 'Add Decision section clearly stating what was decided.',
        })
      );
    }

    if (!hasConsequences) {
      issues.push(
        new DesignIssue({
          id: `DES-ADR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ADR,
          severity: IssueSeverity.MAJOR,
          title: 'Missing ADR Consequences',
          description: 'ADR consequences not documented',
          recommendation: 'Add Consequences section with both positive and negative impacts.',
        })
      );
    }

    if (!hasAlternatives) {
      issues.push(
        new DesignIssue({
          id: `DES-ADR-${String(issueCounter++).padStart(3, '0')}`,
          category: IssueCategory.ADR,
          severity: IssueSeverity.MINOR,
          title: 'Missing ADR Alternatives',
          description: 'ADR alternatives considered not documented',
          recommendation: 'Add Alternatives section showing other options that were considered.',
        })
      );
    }

    return issues;
  }

  /**
   * 総合レビュー / Comprehensive review
   */
  async review(documentPath, options = {}) {
    const content = await this.loadDocument(documentPath);
    const focus = options.focus || [ReviewFocus.ALL];
    const isAllFocus = focus.includes(ReviewFocus.ALL);

    const result = new DesignReviewResult();

    // 各観点でレビュー / Review from each perspective
    if (isAllFocus || focus.includes(ReviewFocus.SOLID)) {
      const solidIssues = this.reviewSOLID(content, options);
      solidIssues.forEach(issue => result.addIssue(issue));
    }

    if (isAllFocus || focus.includes(ReviewFocus.PATTERNS)) {
      const patternIssues = this.reviewPatterns(content, options);
      patternIssues.forEach(issue => result.addIssue(issue));
    }

    if (isAllFocus || focus.includes(ReviewFocus.COUPLING_COHESION)) {
      const ccIssues = this.reviewCouplingCohesion(content, options);
      ccIssues.forEach(issue => result.addIssue(issue));
    }

    if (isAllFocus || focus.includes(ReviewFocus.ERROR_HANDLING)) {
      const errorIssues = this.reviewErrorHandling(content, options);
      errorIssues.forEach(issue => result.addIssue(issue));
    }

    if (isAllFocus || focus.includes(ReviewFocus.SECURITY)) {
      const securityIssues = this.reviewSecurity(content, options);
      securityIssues.forEach(issue => result.addIssue(issue));
    }

    // C4とADRは特定のドキュメントタイプの場合のみ / C4 and ADR are checked only for specific document types
    if (options.checkC4 || /c4|architecture|アーキテクチャ/gi.test(content)) {
      const c4Issues = this.reviewC4Model(content, options);
      c4Issues.forEach(issue => result.addIssue(issue));
    }

    if (options.checkADR || /ADR|decision\s*record|意思決定/gi.test(content)) {
      const adrIssues = this.reviewADR(content, options);
      adrIssues.forEach(issue => result.addIssue(issue));
    }

    result.evaluateQualityGate(options.qualityGateOptions);

    return result;
  }

  /**
   * レビュー結果に基づいてドキュメントを修正 / Correct the document based on review results
   * @param {string} documentPath - 修正対象のドキュメントパス / Path of the document to correct
   * @param {Array} corrections - 修正指示の配列 / Array of correction instructions
   * @param {Object} options - オプション / Options
   * @returns {Object} 修正結果 / Correction result
   */
  async applyCorrections(documentPath, corrections, options = {}) {
    const fullPath = path.isAbsolute(documentPath)
      ? documentPath
      : path.join(this.projectPath, documentPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Document not found: ${fullPath}`);
    }

    // バックアップ作成 / Create backup
    if (options.createBackup !== false) {
      const backupPath = `${fullPath}.backup`;
      fs.copyFileSync(fullPath, backupPath);
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const appliedChanges = [];
    const rejectedFindings = [];
    const adrsCreated = [];

    for (const correction of corrections) {
      const { issueId, action, newDesign, reason } = correction;

      switch (action) {
        case 'accept': {
          // 推奨を適用 / Apply recommendation
          const issue = this._findIssueInContent(content, issueId);
          if (issue && issue.evidence && issue.recommendation) {
            content = content.replace(issue.evidence, issue.recommendation);
            appliedChanges.push({
              issueId,
              action: 'accepted',
              category: issue.category,
              original: issue.evidence,
              corrected: issue.recommendation,
            });
          }
          break;
        }

        case 'modify': {
          // カスタム修正を適用 / Apply custom correction
          const modifyIssue = this._findIssueInContent(content, issueId);
          if (modifyIssue && modifyIssue.evidence && newDesign) {
            content = content.replace(modifyIssue.evidence, newDesign);
            appliedChanges.push({
              issueId,
              action: 'modified',
              category: modifyIssue.category,
              original: modifyIssue.evidence,
              corrected: newDesign,
            });
          }
          break;
        }

        case 'reject':
          rejectedFindings.push({
            issueId,
            reason: reason || 'No reason provided',
          });
          break;

        case 'reject-with-adr':
          // ADRを作成して却下 / Create an ADR and reject
          rejectedFindings.push({
            issueId,
            reason: reason || 'See ADR',
            hasADR: true,
          });

          if (options.generateADRs !== false) {
            const adr = this._generateADR(issueId, reason, options.adrPath);
            adrsCreated.push(adr);
          }
          break;
      }
    }

    // 変更履歴を追加 / Add change history
    const changeHistoryEntry = this._generateChangeHistoryEntry(appliedChanges);
    if (changeHistoryEntry && !content.includes('## Change History')) {
      content += `\n\n## Change History\n\n${changeHistoryEntry}`;
    } else if (changeHistoryEntry) {
      content = content.replace(
        /## Change History\n/,
        `## Change History\n\n${changeHistoryEntry}`
      );
    }

    // ファイルを保存 / Save the file
    fs.writeFileSync(fullPath, content, 'utf-8');

    // 日本語版も更新 / Also update the Japanese version
    if (options.updateJapanese !== false) {
      const jaPath = fullPath.replace(/\.md$/, '.ja.md');
      if (fs.existsSync(jaPath)) {
        let jaContent = fs.readFileSync(jaPath, 'utf-8');
        for (const change of appliedChanges) {
          if (jaContent.includes(change.original)) {
            jaContent = jaContent.replace(change.original, change.corrected);
          }
        }
        fs.writeFileSync(jaPath, jaContent, 'utf-8');
      }
    }

    // 再レビューして品質ゲートを更新 / Re-review and update the quality gate
    const updatedResult = await this.review(documentPath, options.reviewOptions || {});

    return {
      success: true,
      changesApplied: appliedChanges,
      rejectedFindings,
      adrsCreated,
      updatedQualityGate: updatedResult.qualityGate,
      updatedMetrics: updatedResult.metrics,
      updatedSolidCompliance: updatedResult.metrics.solidCompliance,
      filesModified: [
        fullPath,
        options.createBackup !== false ? `${fullPath}.backup` : null,
        options.updateJapanese !== false && fs.existsSync(fullPath.replace(/\.md$/, '.ja.md'))
          ? fullPath.replace(/\.md$/, '.ja.md')
          : null,
        ...adrsCreated.map(adr => adr.path),
      ].filter(Boolean),
    };
  }

  /**
   * 修正レポートを生成 / Generate correction report
   */
  generateCorrectionReport(correctionResult) {
    const {
      changesApplied,
      rejectedFindings,
      adrsCreated,
      updatedQualityGate,
      updatedSolidCompliance,
      filesModified,
    } = correctionResult;

    let report = `## 📝 Design Correction Report\n\n`;
    report += `**Correction Date**: ${new Date().toISOString().split('T')[0]}\n\n`;

    // Changes Applied
    report += `### Changes Applied\n\n`;
    if (changesApplied.length > 0) {
      report += `| Issue ID | Category | Action | Summary |\n`;
      report += `|----------|----------|--------|----------|\n`;
      changesApplied.forEach(change => {
        const summary = change.corrected.substring(0, 40) + '...';
        report += `| ${change.issueId} | ${change.category} | ${change.action} | ${summary} |\n`;
      });
    } else {
      report += `No changes applied.\n`;
    }
    report += `\n`;

    // ADRs Created
    if (adrsCreated.length > 0) {
      report += `### ADRs Created\n\n`;
      report += `| ADR ID | Issue | Decision |\n`;
      report += `|--------|-------|----------|\n`;
      adrsCreated.forEach(adr => {
        report += `| ${adr.id} | ${adr.issueId} | ${adr.decision} |\n`;
      });
      report += `\n`;
    }

    // Rejected Findings
    report += `### Rejected Findings\n\n`;
    if (rejectedFindings.length > 0) {
      report += `| Issue ID | Justification | ADR |\n`;
      report += `|----------|---------------|-----|\n`;
      rejectedFindings.forEach(finding => {
        const hasADR = finding.hasADR ? '✅' : '-';
        report += `| ${finding.issueId} | ${finding.reason} | ${hasADR} |\n`;
      });
    } else {
      report += `No findings rejected.\n`;
    }
    report += `\n`;

    // SOLID Compliance
    if (updatedSolidCompliance) {
      report += `### Updated SOLID Compliance\n\n`;
      report += `| Principle | Status |\n`;
      report += `|-----------|--------|\n`;
      const principleNames = {
        srp: 'Single Responsibility',
        ocp: 'Open/Closed',
        lsp: 'Liskov Substitution',
        isp: 'Interface Segregation',
        dip: 'Dependency Inversion',
      };
      Object.entries(updatedSolidCompliance).forEach(([principle, compliant]) => {
        report += `| ${principleNames[principle] || principle} | ${compliant ? '✅' : '❌'} |\n`;
      });
      report += `\n`;
    }

    // Quality Gate
    report += `### Updated Quality Gate\n\n`;
    report += `**Status**: ${updatedQualityGate.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    report += `| Criterion | Status |\n`;
    report += `|-----------|--------|\n`;
    updatedQualityGate.criteria.forEach(c => {
      report += `| ${c.name} | ${c.passed ? '✅' : '❌'} (${c.actual}/${c.threshold}) |\n`;
    });
    report += `\n`;

    // Files Modified
    report += `### Files Modified\n\n`;
    filesModified.forEach((file, index) => {
      report += `${index + 1}. \`${file}\`\n`;
    });

    return report;
  }

  /**
   * 内部: 問題情報を取得（簡易実装） / Internal: get issue information (simplified implementation)
   */
  _findIssueInContent(_content, issueId) {
    // 実際の実装ではレビュー結果から問題を検索 / In a real implementation, search issues from the review results
    return {
      id: issueId,
      category: 'unknown',
      evidence: '',
      recommendation: '',
    };
  }

  /**
   * 内部: ADRを生成 / Internal: generate ADR
   */
  _generateADR(issueId, reason, adrPath) {
    const adrId = `ADR-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];

    const adrContent = `# ${adrId}: Design Decision for ${issueId}

## Status

Accepted

## Context

During design review, issue ${issueId} was identified. After analysis, the team decided to accept the current design with documented rationale.

## Decision

${reason || 'The current design is acceptable for the project requirements.'}

## Consequences

### Positive
- Decision is documented and traceable
- Team alignment on design approach

### Negative
- May require revisiting in future iterations

## Date

${date}
`;

    const adrFilePath = adrPath
      ? path.join(adrPath, `${adrId}-${issueId.toLowerCase()}.md`)
      : `docs/adr/${adrId}-${issueId.toLowerCase()}.md`;

    // 実際のファイル書き込みは呼び出し元で行う / Actual file writing is done by the caller
    return {
      id: adrId,
      issueId,
      decision: reason || 'Accepted current design',
      path: adrFilePath,
      content: adrContent,
    };
  }

  /**
   * 内部: 変更履歴エントリを生成 / Internal: generate change history entry
   */
  _generateChangeHistoryEntry(appliedChanges) {
    if (appliedChanges.length === 0) return null;

    const date = new Date().toISOString().split('T')[0];
    let entry = `### ${date} - Design Review Corrections\n\n`;
    entry += `| Issue ID | Category | Change Type |\n`;
    entry += `|----------|----------|-------------|\n`;
    appliedChanges.forEach(change => {
      entry += `| ${change.issueId} | ${change.category} | ${change.action} |\n`;
    });
    entry += `\n`;

    return entry;
  }
}

module.exports = {
  DesignReviewer,
  DesignReviewResult,
  DesignIssue,
  IssueSeverity,
  IssueCategory,
  SOLIDPrinciple,
  ReviewFocus,
  QualityAttribute,
};
