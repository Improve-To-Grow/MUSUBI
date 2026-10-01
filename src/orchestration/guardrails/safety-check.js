/**
 * @fileoverview Safety Check integration for Guardrails
 *
 * Provides safety checks that can integrate with MUSUBI's
 * Constitutional Articles for governance compliance. The constitutional checks follow the
 * nine articles of steering/rules/constitution.md (v1.1) and share their rules with the
 * CI checker (src/constitutional/articles.js).
 *
 * @module orchestration/guardrails/safety-check
 * @version 3.9.0
 */

'use strict';

const { BaseGuardrail, GuardrailPhase } = require('./base-guardrail');
const { rules } = require('./guardrail-rules');
const {
  CONTENT_TYPES,
  NOT_APPLICABLE,
  ConstitutionalMapping,
  checkConstitutionalCompliance,
} = require('./constitutional-compliance');

/**
 * Safety check levels
 */
const SafetyLevel = {
  /** Basic safety checks */
  BASIC: 'basic',
  /** Standard safety checks including content moderation */
  STANDARD: 'standard',
  /** Strict safety checks with constitutional compliance */
  STRICT: 'strict',
  /** Maximum safety with all checks enabled */
  PARANOID: 'paranoid',
};

/**
 * Safety check result with constitutional compliance
 * @typedef {Object} SafetyCheckResult
 * @property {boolean} safe - Whether the content is safe
 * @property {string} level - Safety level applied
 * @property {Array<string>} violations - List of violations
 * @property {Array<Object>} constitutionalViolations - Constitutional article violations
 * @property {Object} scores - Safety scores by category
 */

/**
 * Safety Check Guardrail with Constitutional Integration
 * @extends BaseGuardrail
 */
class SafetyCheckGuardrail extends BaseGuardrail {
  /**
   * @param {Object} config - Configuration
   * @param {string} [config.level='standard'] - Safety level
   * @param {boolean} [config.enforceConstitution=false] - Enforce constitutional articles
   * @param {Array<string>} [config.enabledArticles] - Specific articles to enforce
   * @param {string} [config.projectRoot] - Project whose profile and article levels apply
   * @param {Object} [config.customChecks] - Custom safety checks
   */
  constructor(config = {}) {
    super({
      name: config.name || 'SafetyCheckGuardrail',
      description: config.description || 'Safety and constitutional compliance check',
      enabled: config.enabled,
      failFast: config.failFast,
      severity: config.severity || 'error',
      tripwireEnabled: config.tripwireEnabled,
      phase: config.phase || GuardrailPhase.POST,
    });

    this.level = config.level || SafetyLevel.STANDARD;
    this.enforceConstitution = config.enforceConstitution || false;
    this.enabledArticles = config.enabledArticles || Object.keys(ConstitutionalMapping);
    this.projectRoot = config.projectRoot || null;
    this.customChecks = config.customChecks || {};

    // Build rules based on safety level
    this.rules = this.buildRules();
  }

  /**
   * Build validation rules based on safety level
   * @private
   * @returns {Array}
   */
  buildRules() {
    const builder = rules();

    switch (this.level) {
      case SafetyLevel.BASIC:
        builder.required();
        break;

      case SafetyLevel.STANDARD:
        builder.required().maxLength(50000).noInjection({ sql: true, xss: true, command: false });
        break;

      case SafetyLevel.STRICT:
        builder.required().maxLength(50000).noInjection().noPII();
        break;

      case SafetyLevel.PARANOID:
        builder
          .required()
          .maxLength(10000)
          .noInjection()
          .noPII()
          .noProhibitedWords(['hack', 'exploit', 'bypass', 'override']);
        break;
    }

    return builder.build();
  }

  /**
   * Check content for safety and constitutional compliance
   * @param {*} input - Content to check
   * @param {Object} [context] - Execution context
   * @returns {Promise<SafetyCheckResult>}
   */
  async check(input, context = {}) {
    const content = this.extractContent(input);
    const scores = {};
    const violations = await this.runSafetyRules(content, context);

    // Agent boundaries (not a constitutional article)
    const boundaryViolation = this.checkAgentBoundaries(input, context);
    if (boundaryViolation) violations.push(boundaryViolation);

    // Check constitutional compliance if enabled
    const constitutional = this.enforceConstitution
      ? await this.checkConstitutionalCompliance(input, context)
      : { violations: [] };
    if (this.enforceConstitution) scores.constitutional = constitutional.score;

    violations.push(...(await this.runCustomChecks(input, context, scores)));

    // Calculate overall safety score
    const allViolations = [...violations, ...constitutional.violations];
    const errorCount = allViolations.filter(v => v.severity === 'error').length;
    const safe = errorCount === 0;

    return this.createResult(
      safe,
      allViolations,
      safe ? 'Safety check passed' : `Safety check failed with ${errorCount} error(s)`,
      0,
      {
        level: this.level,
        safe,
        constitutionalCompliance: this.enforceConstitution,
        constitutionalViolations: constitutional.violations,
        articleScores: constitutional.articleScores,
        scores,
      }
    );
  }

  /**
   * Run the safety rules of the configured level. Injection detection targets untrusted text;
   * typed artifacts (context.contentType: code, test, requirements, design) legitimately
   * contain braces, `--` flags, table rules and comments, so it is skipped for them.
   * @private
   * @param {string} content - Content to check
   * @param {Object} [context] - Execution context
   * @returns {Promise<Array>} Violations
   */
  async runSafetyRules(content, context = {}) {
    const isArtifact = CONTENT_TYPES.includes(context.contentType);
    const violations = [];
    for (const rule of this.rules.filter(r => !(isArtifact && r.id === 'noInjection'))) {
      try {
        const result = await Promise.resolve(rule.check(content));
        const passed = typeof result === 'object' ? result.passed : result;
        if (!passed) {
          violations.push(
            this.createViolation(rule.id.toUpperCase(), rule.message, rule.severity || 'error', {
              rule: rule.id,
            })
          );
        }
      } catch (error) {
        violations.push(
          this.createViolation('RULE_ERROR', `Rule '${rule.id}' error: ${error.message}`, 'error')
        );
      }
    }
    return violations;
  }

  /**
   * Run the custom checks and record their scores
   * @private
   * @param {*} input - Input to check
   * @param {Object} context - Execution context
   * @param {Object} scores - Scores by check name (updated)
   * @returns {Promise<Array>} Violations
   */
  async runCustomChecks(input, context, scores) {
    const violations = [];
    for (const [checkName, checkFn] of Object.entries(this.customChecks)) {
      try {
        const result = await checkFn(input, context);
        scores[checkName] = result.score || (result.passed ? 1.0 : 0.0);
        if (!result.passed) {
          violations.push(
            this.createViolation(
              `CUSTOM_${checkName.toUpperCase()}`,
              result.message || `Custom check '${checkName}' failed`,
              result.severity || 'warning'
            )
          );
        }
      } catch (error) {
        violations.push(
          this.createViolation(
            'CUSTOM_CHECK_ERROR',
            `Custom check '${checkName}' error: ${error.message}`,
            'warning'
          )
        );
      }
    }
    return violations;
  }

  /**
   * Check constitutional article compliance of the content (see ./constitutional-compliance)
   * @private
   * @param {*} input - Input to check
   * @param {Object} context - Execution context; contentType is required
   * @returns {Promise<Object>} { compliant, score, violations, articleScores }
   */
  async checkConstitutionalCompliance(input, context) {
    return checkConstitutionalCompliance({
      content: this.extractContent(input),
      input,
      context,
      enabledArticles: this.enabledArticles,
      projectRoot: context.projectRoot || this.projectRoot,
      createViolation: (...args) => this.createViolation(...args),
    });
  }

  /**
   * Agent boundaries: an agent outside context.allowedAgents fails the safety check
   * @private
   */
  checkAgentBoundaries(input, context) {
    const agentId = context.agentId || (typeof input === 'object' && input?.agentId);
    const allowedAgents = context.allowedAgents || [];

    if (!agentId || allowedAgents.length === 0 || allowedAgents.includes(agentId)) {
      return null;
    }
    return this.createViolation(
      'AGENT_BOUNDARY',
      `Agent '${agentId}' not in allowed list`,
      'error',
      { agentId, allowedAgents }
    );
  }

  /**
   * Extract content to check
   * @private
   */
  extractContent(input) {
    if (typeof input === 'string') return input;
    if (typeof input === 'object' && input !== null) {
      return input.content || input.message || input.text || JSON.stringify(input);
    }
    return String(input);
  }

  /**
   * Get guardrail info
   * @override
   */
  getInfo() {
    return {
      ...super.getInfo(),
      level: this.level,
      enforceConstitution: this.enforceConstitution,
      enabledArticles: this.enabledArticles,
      customChecksCount: Object.keys(this.customChecks).length,
    };
  }
}

/**
 * Create a SafetyCheckGuardrail with preset configuration
 * @param {string} preset - Preset name
 * @param {Object} [overrides] - Configuration overrides
 * @returns {SafetyCheckGuardrail}
 */
function createSafetyCheckGuardrail(preset = 'standard', overrides = {}) {
  const presets = {
    basic: {
      name: 'BasicSafetyGuardrail',
      level: SafetyLevel.BASIC,
    },
    standard: {
      name: 'StandardSafetyGuardrail',
      level: SafetyLevel.STANDARD,
    },
    strict: {
      name: 'StrictSafetyGuardrail',
      level: SafetyLevel.STRICT,
      enforceConstitution: true,
    },
    paranoid: {
      name: 'ParanoidSafetyGuardrail',
      level: SafetyLevel.PARANOID,
      enforceConstitution: true,
      tripwireEnabled: true,
      failFast: true,
    },
    constitutional: {
      name: 'ConstitutionalGuardrail',
      level: SafetyLevel.STANDARD,
      enforceConstitution: true,
      enabledArticles: Object.keys(ConstitutionalMapping),
    },
  };

  const config = { ...(presets[preset] || presets.standard), ...overrides };
  return new SafetyCheckGuardrail(config);
}

module.exports = {
  SafetyCheckGuardrail,
  createSafetyCheckGuardrail,
  SafetyLevel,
  ConstitutionalMapping,
  CONTENT_TYPES,
  NOT_APPLICABLE,
};
