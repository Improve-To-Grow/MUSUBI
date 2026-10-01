/**
 * Requirements Reviewer
 *
 * Systematic review of requirements documents using Fagan Inspection
 * and Perspective-Based Reading (PBR)
 *
 * @module src/validators/requirements-reviewer
 */

const fs = require('fs');
const path = require('path');

/**
 * Defect severity
 */
const DefectSeverity = {
  CRITICAL: 'critical',
  MAJOR: 'major',
  MINOR: 'minor',
  SUGGESTION: 'suggestion',
};

/**
 * Defect types
 */
const DefectType = {
  MISSING: 'missing',
  INCORRECT: 'incorrect',
  AMBIGUOUS: 'ambiguous',
  CONFLICTING: 'conflicting',
  REDUNDANT: 'redundant',
  UNTESTABLE: 'untestable',
};

/**
 * Review perspectives
 */
const ReviewPerspective = {
  USER: 'user',
  DEVELOPER: 'developer',
  TESTER: 'tester',
  ARCHITECT: 'architect',
  SECURITY: 'security',
};

/**
 * Review methods
 */
const ReviewMethod = {
  FAGAN: 'fagan',
  PBR: 'pbr',
  COMBINED: 'combined',
};

/**
 * Defect
 */
class Defect {
  constructor(options = {}) {
    this.id = options.id || `DEF-${Date.now()}`;
    this.requirementId = options.requirementId || '';
    this.section = options.section || '';
    this.severity = options.severity || DefectSeverity.MINOR;
    this.type = options.type || DefectType.AMBIGUOUS;
    this.perspective = options.perspective || null;
    this.title = options.title || '';
    this.description = options.description || '';
    this.evidence = options.evidence || '';
    this.recommendation = options.recommendation || '';
    this.status = options.status || 'open';
  }

  toJSON() {
    return {
      id: this.id,
      requirementId: this.requirementId,
      section: this.section,
      severity: this.severity,
      type: this.type,
      perspective: this.perspective,
      title: this.title,
      description: this.description,
      evidence: this.evidence,
      recommendation: this.recommendation,
      status: this.status,
    };
  }
}

/**
 * Review result
 */
class ReviewResult {
  constructor() {
    this.defects = [];
    this.metrics = {
      totalDefects: 0,
      bySeverity: {},
      byType: {},
      byPerspective: {},
      reviewCoverage: 0,
      earsCompliance: 0,
      testabilityScore: 0,
    };
    this.qualityGate = {
      passed: false,
      criteria: [],
    };
    this.timestamp = new Date();
  }

  addDefect(defect) {
    this.defects.push(defect);
    this.updateMetrics();
  }

  updateMetrics() {
    this.metrics.totalDefects = this.defects.length;

    // Count by severity
    this.metrics.bySeverity = {};
    Object.values(DefectSeverity).forEach(sev => {
      this.metrics.bySeverity[sev] = this.defects.filter(d => d.severity === sev).length;
    });

    // Count by type
    this.metrics.byType = {};
    Object.values(DefectType).forEach(type => {
      this.metrics.byType[type] = this.defects.filter(d => d.type === type).length;
    });

    // Count by perspective
    this.metrics.byPerspective = {};
    Object.values(ReviewPerspective).forEach(persp => {
      this.metrics.byPerspective[persp] = this.defects.filter(d => d.perspective === persp).length;
    });
  }

  evaluateQualityGate(options = {}) {
    const {
      maxCritical = 0,
      maxMajorPercent = 20,
      minTestabilityScore = 0.7,
      minEarsCompliance = 0.8,
    } = options;

    const criteria = [];

    // Critical defect check
    const criticalCount = this.metrics.bySeverity[DefectSeverity.CRITICAL] || 0;
    criteria.push({
      name: 'No Critical Defects',
      passed: criticalCount <= maxCritical,
      actual: criticalCount,
      threshold: maxCritical,
    });

    // Major defect ratio check
    const majorCount = this.metrics.bySeverity[DefectSeverity.MAJOR] || 0;
    const majorPercent =
      this.metrics.totalDefects > 0 ? (majorCount / this.metrics.totalDefects) * 100 : 0;
    criteria.push({
      name: 'Major Defects Under Threshold',
      passed: majorPercent <= maxMajorPercent,
      actual: Math.round(majorPercent),
      threshold: maxMajorPercent,
    });

    // Testability score check
    criteria.push({
      name: 'Testability Score',
      passed: this.metrics.testabilityScore >= minTestabilityScore,
      actual: Math.round(this.metrics.testabilityScore * 100),
      threshold: Math.round(minTestabilityScore * 100),
    });

    // EARS compliance ratio check
    criteria.push({
      name: 'EARS Compliance',
      passed: this.metrics.earsCompliance >= minEarsCompliance,
      actual: Math.round(this.metrics.earsCompliance * 100),
      threshold: Math.round(minEarsCompliance * 100),
    });

    this.qualityGate.criteria = criteria;
    this.qualityGate.passed = criteria.every(c => c.passed);

    return this.qualityGate;
  }

  toMarkdown() {
    let md = `# Requirements Review Report\n\n`;
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
    md += `| **Total** | **${this.metrics.totalDefects}** |\n\n`;

    // Quality Gate
    md += `## Quality Gate\n\n`;
    md += `**Status**: ${this.qualityGate.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    md += `| Criterion | Status | Actual | Threshold |\n`;
    md += `|-----------|--------|--------|-----------|\n`;
    this.qualityGate.criteria.forEach(c => {
      md += `| ${c.name} | ${c.passed ? '✅' : '❌'} | ${c.actual} | ${c.threshold} |\n`;
    });
    md += '\n';

    // Detailed Defects
    md += `## Defects\n\n`;
    this.defects.forEach(defect => {
      md += `### ${defect.id}: ${defect.title}\n\n`;
      md += `- **Requirement**: ${defect.requirementId}\n`;
      md += `- **Section**: ${defect.section}\n`;
      md += `- **Severity**: ${defect.severity}\n`;
      md += `- **Type**: ${defect.type}\n`;
      if (defect.perspective) {
        md += `- **Perspective**: ${defect.perspective}\n`;
      }
      md += `\n**Description**: ${defect.description}\n\n`;
      if (defect.evidence) {
        md += `**Evidence**: "${defect.evidence}"\n\n`;
      }
      md += `**Recommendation**: ${defect.recommendation}\n\n`;
      md += `---\n\n`;
    });

    return md;
  }

  toJSON() {
    return {
      defects: this.defects.map(d => d.toJSON()),
      metrics: this.metrics,
      qualityGate: this.qualityGate,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Requirements Reviewer
 */
class RequirementsReviewer {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.earsPatterns = {
      ubiquitous: /^The\s+\w+\s+shall\s+/i,
      eventDriven: /^When\s+.+,\s+the\s+\w+\s+shall\s+/i,
      stateDriven: /^While\s+.+,\s+the\s+\w+\s+shall\s+/i,
      unwanted: /^If\s+.+,\s+then\s+the\s+\w+\s+shall\s+/i,
      optional: /^Where\s+.+,\s+the\s+\w+\s+shall\s+/i,
    };
    this.ambiguousTerms = [
      'quickly',
      'fast',
      'slow',
      'many',
      'few',
      'often',
      'sometimes',
      'usually',
      'normally',
      'appropriate',
      'suitable',
      'adequate',
      'reasonable',
      'user-friendly',
      'easy',
      'simple',
      'flexible',
      'efficient',
      'effective',
      'robust',
      'scalable',
      'secure',
      'reliable',
      'etc',
      'and so on',
      'as needed',
      'if necessary',
      'when required',
      'as appropriate',
    ];
  }

  /**
   * Load a document
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
   * Extract requirements
   */
  extractRequirements(content) {
    const requirements = [];
    const reqPattern = /(?:REQ-[A-Z0-9]+-\d+|FR-\d+|NFR-\d+|UC-\d+)[:\s]+([^\n]+)/gi;
    let match;

    while ((match = reqPattern.exec(content)) !== null) {
      requirements.push({
        id: match[0].split(/[:\s]/)[0],
        text: match[1] || '',
        fullText: match[0],
      });
    }

    return requirements;
  }

  /**
   * Check EARS format compliance
   */
  checkEarsCompliance(requirements) {
    let compliantCount = 0;

    requirements.forEach(req => {
      const text = req.text;
      const isCompliant = Object.values(this.earsPatterns).some(pattern => pattern.test(text));
      if (isCompliant) {
        compliantCount++;
      }
    });

    return requirements.length > 0 ? compliantCount / requirements.length : 0;
  }

  /**
   * Find ambiguous terms
   */
  findAmbiguousTerms(text) {
    const found = [];
    this.ambiguousTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(text)) {
        found.push(term);
      }
    });
    return found;
  }

  /**
   * Check testability
   */
  checkTestability(requirements) {
    let testableCount = 0;

    requirements.forEach(req => {
      const text = req.text.toLowerCase();

      // Testability indicators
      const hasNumber = /\d+/.test(text);
      const hasUnit = /\b(%|seconds?|minutes?|hours?|days?|percent)/i.test(text);
      const hasQuantifier = /\b(within|at least|at most|maximum|minimum)/i.test(text);
      const ambiguousTerms = this.findAmbiguousTerms(text);

      const testabilityScore =
        (hasNumber ? 0.3 : 0) +
        (hasUnit ? 0.3 : 0) +
        (hasQuantifier ? 0.2 : 0) +
        (ambiguousTerms.length === 0 ? 0.2 : 0);

      if (testabilityScore >= 0.5) {
        testableCount++;
      }
    });

    return requirements.length > 0 ? testableCount / requirements.length : 0;
  }

  /**
   * Fagan Inspection style review
   */
  async reviewFagan(content, _options = {}) {
    const result = new ReviewResult();
    const requirements = this.extractRequirements(content);

    let defectCounter = 1;

    // Phase 1: Completeness Check
    const requiredSections = [
      { pattern: /## .*Functional/i, name: 'Functional Requirements' },
      { pattern: /## .*Non-Functional/i, name: 'Non-Functional Requirements' },
      { pattern: /## .*Constraints/i, name: 'Constraints' },
      { pattern: /## .*Glossary|## .*Definitions/i, name: 'Glossary/Definitions' },
    ];

    requiredSections.forEach(section => {
      if (!section.pattern.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            severity: DefectSeverity.MAJOR,
            type: DefectType.MISSING,
            title: `Missing Section: ${section.name}`,
            description: `Required section "${section.name}" is not found in the document.`,
            recommendation: `Add a section for "${section.name}" to ensure completeness.`,
          })
        );
      }
    });

    // Phase 2: Requirements Quality Check
    requirements.forEach(req => {
      // Ambiguity check
      const ambiguousTerms = this.findAmbiguousTerms(req.text);
      if (ambiguousTerms.length > 0) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            requirementId: req.id,
            severity: DefectSeverity.MAJOR,
            type: DefectType.AMBIGUOUS,
            title: `Ambiguous Terms in ${req.id}`,
            description: `Requirement contains ambiguous terms: ${ambiguousTerms.join(', ')}`,
            evidence: req.fullText,
            recommendation: `Replace ambiguous terms with measurable criteria. Example: "quickly" → "within 2 seconds"`,
          })
        );
      }

      // EARS format check
      const isEarsCompliant = Object.values(this.earsPatterns).some(pattern =>
        pattern.test(req.text)
      );
      if (!isEarsCompliant && req.text.length > 10) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            requirementId: req.id,
            severity: DefectSeverity.MINOR,
            type: DefectType.AMBIGUOUS,
            title: `Non-EARS Format in ${req.id}`,
            description: `Requirement does not follow EARS format patterns.`,
            evidence: req.fullText,
            recommendation: `Convert to EARS format. Example patterns: "The system shall...", "When X, the system shall...", "While X, the system shall..."`,
          })
        );
      }

      // Missing test criteria check
      const hasTestCriteria =
        /\d+/.test(req.text) ||
        /shall (not )?be (able to )?/i.test(req.text) ||
        /must (not )?/i.test(req.text);
      if (!hasTestCriteria && req.text.length > 20) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            requirementId: req.id,
            severity: DefectSeverity.MINOR,
            type: DefectType.UNTESTABLE,
            title: `Potentially Untestable: ${req.id}`,
            description: `Requirement may lack measurable acceptance criteria.`,
            evidence: req.fullText,
            recommendation: `Add specific, measurable criteria. Include numbers, thresholds, or clear pass/fail conditions.`,
          })
        );
      }
    });

    // Phase 3: Consistency Check
    // Check for duplicate requirement IDs
    const idCounts = {};
    requirements.forEach(req => {
      idCounts[req.id] = (idCounts[req.id] || 0) + 1;
    });

    Object.entries(idCounts).forEach(([id, count]) => {
      if (count > 1) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            requirementId: id,
            severity: DefectSeverity.MAJOR,
            type: DefectType.REDUNDANT,
            title: `Duplicate Requirement ID: ${id}`,
            description: `Requirement ID "${id}" appears ${count} times in the document.`,
            recommendation: `Review and consolidate duplicate requirements or assign unique IDs.`,
          })
        );
      }
    });

    // Update metrics
    result.metrics.earsCompliance = this.checkEarsCompliance(requirements);
    result.metrics.testabilityScore = this.checkTestability(requirements);
    result.metrics.reviewCoverage = 1.0;

    result.evaluateQualityGate();

    return result;
  }

  /**
   * Perspective-Based Reading review
   */
  async reviewPBR(content, options = {}) {
    const result = new ReviewResult();
    const requirements = this.extractRequirements(content);
    const perspectives = options.perspectives || Object.values(ReviewPerspective);

    let defectCounter = 1;

    // User Perspective
    if (perspectives.includes(ReviewPerspective.USER)) {
      // Check for user scenarios
      if (!/user|actor/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.USER,
            severity: DefectSeverity.MAJOR,
            type: DefectType.MISSING,
            title: 'Missing User Scenarios',
            description: 'Document does not clearly identify users or user scenarios.',
            recommendation:
              'Add user personas and scenarios to clarify who will use the system and how.',
          })
        );
      }

      // Check for error message requirements
      if (!/error.*message/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.USER,
            severity: DefectSeverity.MINOR,
            type: DefectType.MISSING,
            title: 'Missing Error Message Requirements',
            description: 'No requirements found for error messages or user feedback.',
            recommendation: 'Define how error conditions are communicated to users.',
          })
        );
      }
    }

    // Developer Perspective
    if (perspectives.includes(ReviewPerspective.DEVELOPER)) {
      // Check that data types are defined
      requirements.forEach(req => {
        if (/data|output|input|value/i.test(req.text)) {
          if (!/type|format|string|number|integer|boolean/i.test(req.text)) {
            result.addDefect(
              new Defect({
                id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
                requirementId: req.id,
                perspective: ReviewPerspective.DEVELOPER,
                severity: DefectSeverity.MINOR,
                type: DefectType.MISSING,
                title: `Missing Data Type: ${req.id}`,
                description: 'Requirement mentions data but does not specify data types.',
                evidence: req.fullText,
                recommendation: 'Specify data types, formats, and valid ranges.',
              })
            );
          }
        }
      });

      // API interface check
      if (/API|interface/i.test(content)) {
        if (!/endpoint|request|response|JSON|XML/i.test(content)) {
          result.addDefect(
            new Defect({
              id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
              perspective: ReviewPerspective.DEVELOPER,
              severity: DefectSeverity.MAJOR,
              type: DefectType.MISSING,
              title: 'Incomplete API Specifications',
              description: 'API/interfaces mentioned but details not specified.',
              recommendation:
                'Define API endpoints, request/response formats, authentication, and error codes.',
            })
          );
        }
      }
    }

    // Tester Perspective
    if (perspectives.includes(ReviewPerspective.TESTER)) {
      requirements.forEach(req => {
        // Boundary value check
        if (/range|between|limit/i.test(req.text)) {
          if (!/min|max|boundary|\d+/i.test(req.text)) {
            result.addDefect(
              new Defect({
                id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
                requirementId: req.id,
                perspective: ReviewPerspective.TESTER,
                severity: DefectSeverity.MINOR,
                type: DefectType.MISSING,
                title: `Missing Boundary Values: ${req.id}`,
                description: 'Requirement mentions ranges but boundary values are not specified.',
                evidence: req.fullText,
                recommendation: 'Specify exact minimum and maximum values for boundary testing.',
              })
            );
          }
        }
      });

      // Acceptance criteria check
      if (!/acceptance criteria|verification/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.TESTER,
            severity: DefectSeverity.MAJOR,
            type: DefectType.MISSING,
            title: 'Missing Acceptance Criteria',
            description: 'Document does not include explicit acceptance criteria.',
            recommendation:
              'Add acceptance criteria section with testable conditions for each requirement.',
          })
        );
      }
    }

    // Architect Perspective
    if (perspectives.includes(ReviewPerspective.ARCHITECT)) {
      // Scalability requirements check
      if (!/scalability|concurrent/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.ARCHITECT,
            severity: DefectSeverity.MINOR,
            type: DefectType.MISSING,
            title: 'Missing Scalability Requirements',
            description: 'No requirements found for system scalability.',
            recommendation: 'Define expected load, concurrent users, and scaling requirements.',
          })
        );
      }

      // Availability requirements check
      if (!/availability|SLA|uptime/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.ARCHITECT,
            severity: DefectSeverity.MINOR,
            type: DefectType.MISSING,
            title: 'Missing Availability Requirements',
            description: 'No availability/SLA requirements defined.',
            recommendation:
              'Specify target availability (e.g., 99.9% uptime) and recovery time objectives.',
          })
        );
      }
    }

    // Security Perspective
    if (perspectives.includes(ReviewPerspective.SECURITY)) {
      // Authentication requirements check
      if (/login|authentication/i.test(content) && !/password.*policy|MFA|2FA/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.SECURITY,
            severity: DefectSeverity.MAJOR,
            type: DefectType.MISSING,
            title: 'Incomplete Authentication Requirements',
            description: 'Authentication mentioned but security policies not defined.',
            recommendation:
              'Define password policy, MFA requirements, session management, and lockout policies.',
          })
        );
      }

      // Data protection check
      if (/personal|PII|sensitive/i.test(content) && !/encryption|GDPR|anonymize/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.SECURITY,
            severity: DefectSeverity.CRITICAL,
            type: DefectType.MISSING,
            title: 'Missing Data Protection Requirements',
            description: 'Sensitive data mentioned but protection requirements not specified.',
            recommendation:
              'Define data encryption, retention, anonymization, and compliance requirements (GDPR, etc.).',
          })
        );
      }

      // Audit logging check
      if (!/audit.*log|logging/i.test(content)) {
        result.addDefect(
          new Defect({
            id: `DEF-${String(defectCounter++).padStart(3, '0')}`,
            perspective: ReviewPerspective.SECURITY,
            severity: DefectSeverity.MINOR,
            type: DefectType.MISSING,
            title: 'Missing Audit Requirements',
            description: 'No audit logging requirements found.',
            recommendation:
              'Define what events should be logged for security and compliance purposes.',
          })
        );
      }
    }

    // Update metrics
    result.metrics.earsCompliance = this.checkEarsCompliance(requirements);
    result.metrics.testabilityScore = this.checkTestability(requirements);
    result.metrics.reviewCoverage = perspectives.length / Object.values(ReviewPerspective).length;

    result.evaluateQualityGate();

    return result;
  }

  /**
   * Combined review (Fagan + PBR)
   */
  async review(documentPath, options = {}) {
    const content = await this.loadDocument(documentPath);
    const method = options.method || ReviewMethod.COMBINED;

    switch (method) {
      case ReviewMethod.FAGAN:
        return this.reviewFagan(content, options);
      case ReviewMethod.PBR:
        return this.reviewPBR(content, options);
      case ReviewMethod.COMBINED:
      default: {
        // Run both reviews and merge the results
        const faganResult = await this.reviewFagan(content, options);
        const pbrResult = await this.reviewPBR(content, options);

        // Merge results
        const combinedResult = new ReviewResult();
        const allDefects = [...faganResult.defects, ...pbrResult.defects];

        // Remove duplicates (same requirementId, type and title)
        const seen = new Set();
        allDefects.forEach(defect => {
          const key = `${defect.requirementId}-${defect.type}-${defect.title}`;
          if (!seen.has(key)) {
            seen.add(key);
            combinedResult.addDefect(defect);
          }
        });

        // Combine metrics
        combinedResult.metrics.earsCompliance =
          (faganResult.metrics.earsCompliance + pbrResult.metrics.earsCompliance) / 2;
        combinedResult.metrics.testabilityScore =
          (faganResult.metrics.testabilityScore + pbrResult.metrics.testabilityScore) / 2;
        combinedResult.metrics.reviewCoverage = 1.0;

        combinedResult.evaluateQualityGate(options.qualityGateOptions);

        return combinedResult;
      }
    }
  }

  /**
   * Apply corrections to a document based on review results
   *
   * When `options.updateJapanese` is not false and a sibling `<doc>.ja.md` exists, the same
   * text replacements are applied to it (language-neutral; no translation is performed).
   * @param {string} documentPath - Path of the document to correct
   * @param {Array} corrections - List of correction instructions
   * @param {Object} options - Options
   * @returns {Object} Correction result
   */
  async applyCorrections(documentPath, corrections, options = {}) {
    const fullPath = path.isAbsolute(documentPath)
      ? documentPath
      : path.join(this.projectPath, documentPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Document not found: ${fullPath}`);
    }

    // Create a backup
    if (options.createBackup !== false) {
      const backupPath = `${fullPath}.backup`;
      fs.copyFileSync(fullPath, backupPath);
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const appliedChanges = [];
    const rejectedFindings = [];

    for (const correction of corrections) {
      const { defectId, action, newText, reason } = correction;

      switch (action) {
        case 'accept': {
          // Apply the recommendation
          const defect = this._findDefectInContent(content, defectId);
          if (defect && defect.evidence && defect.recommendation) {
            content = content.replace(defect.evidence, defect.recommendation);
            appliedChanges.push({
              defectId,
              action: 'accepted',
              original: defect.evidence,
              corrected: defect.recommendation,
            });
          }
          break;
        }

        case 'modify': {
          // Apply a custom correction
          const modifyDefect = this._findDefectInContent(content, defectId);
          if (modifyDefect && modifyDefect.evidence && newText) {
            content = content.replace(modifyDefect.evidence, newText);
            appliedChanges.push({
              defectId,
              action: 'modified',
              original: modifyDefect.evidence,
              corrected: newText,
            });
          }
          break;
        }

        case 'reject':
          rejectedFindings.push({
            defectId,
            reason: reason || 'No reason provided',
          });
          break;
      }
    }

    // Append change history
    const changeHistoryEntry = this._generateChangeHistoryEntry(appliedChanges);
    if (changeHistoryEntry && !content.includes('## Change History')) {
      content += `\n\n## Change History\n\n${changeHistoryEntry}`;
    } else if (changeHistoryEntry) {
      content = content.replace(
        /## Change History\n/,
        `## Change History\n\n${changeHistoryEntry}`
      );
    }

    // Save the file
    fs.writeFileSync(fullPath, content, 'utf-8');

    // Apply the same replacements to an existing <doc>.ja.md translation, if any
    if (options.updateJapanese !== false) {
      const jaPath = fullPath.replace(/\.md$/, '.ja.md');
      if (fs.existsSync(jaPath)) {
        // Simple text replacement only; corrected text is not translated
        let jaContent = fs.readFileSync(jaPath, 'utf-8');
        for (const change of appliedChanges) {
          if (jaContent.includes(change.original)) {
            jaContent = jaContent.replace(change.original, change.corrected);
          }
        }
        fs.writeFileSync(jaPath, jaContent, 'utf-8');
      }
    }

    // Re-review to update the quality gate
    const updatedResult = await this.review(documentPath, options.reviewOptions || {});

    return {
      success: true,
      changesApplied: appliedChanges,
      rejectedFindings,
      updatedQualityGate: updatedResult.qualityGate,
      updatedMetrics: updatedResult.metrics,
      filesModified: [
        fullPath,
        options.createBackup !== false ? `${fullPath}.backup` : null,
        options.updateJapanese !== false && fs.existsSync(fullPath.replace(/\.md$/, '.ja.md'))
          ? fullPath.replace(/\.md$/, '.ja.md')
          : null,
      ].filter(Boolean),
    };
  }

  /**
   * Generate a correction report
   */
  generateCorrectionReport(correctionResult) {
    const { changesApplied, rejectedFindings, updatedQualityGate, filesModified } =
      correctionResult;

    let report = `## 📝 Correction Report\n\n`;
    report += `**Correction Date**: ${new Date().toISOString().split('T')[0]}\n\n`;

    // Changes Applied
    report += `### Changes Applied\n\n`;
    if (changesApplied.length > 0) {
      report += `| Defect ID | Action | Original | Corrected |\n`;
      report += `|-----------|--------|----------|----------|\n`;
      changesApplied.forEach(change => {
        const original = change.original.substring(0, 30) + '...';
        const corrected = change.corrected.substring(0, 30) + '...';
        report += `| ${change.defectId} | ${change.action} | "${original}" | "${corrected}" |\n`;
      });
    } else {
      report += `No changes applied.\n`;
    }
    report += `\n`;

    // Rejected Findings
    report += `### Rejected Findings\n\n`;
    if (rejectedFindings.length > 0) {
      report += `| Defect ID | Reason |\n`;
      report += `|-----------|--------|\n`;
      rejectedFindings.forEach(finding => {
        report += `| ${finding.defectId} | ${finding.reason} |\n`;
      });
    } else {
      report += `No findings rejected.\n`;
    }
    report += `\n`;

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
   * Internal: look up defect details (simplified implementation)
   */
  _findDefectInContent(_content, defectId) {
    // A full implementation would look up the defect in the review results;
    // this returns a simple placeholder
    return {
      id: defectId,
      evidence: '',
      recommendation: '',
    };
  }

  /**
   * Internal: generate a change history entry
   */
  _generateChangeHistoryEntry(appliedChanges) {
    if (appliedChanges.length === 0) return null;

    const date = new Date().toISOString().split('T')[0];
    let entry = `### ${date} - Requirements Review Corrections\n\n`;
    entry += `| Defect ID | Change Type |\n`;
    entry += `|-----------|-------------|\n`;
    appliedChanges.forEach(change => {
      entry += `| ${change.defectId} | ${change.action} |\n`;
    });
    entry += `\n`;

    return entry;
  }
}

module.exports = {
  RequirementsReviewer,
  ReviewResult,
  Defect,
  DefectSeverity,
  DefectType,
  ReviewPerspective,
  ReviewMethod,
};
