/**
 * @fileoverview Constitutional compliance of guardrail content
 *
 * The constitution (steering/rules/constitution.md) governs artifacts, so guardrail content
 * is checked as the artifact it is: the caller sets context.contentType to code, test,
 * requirements or design. Untyped content is unclassified and fails the check. An article that
 * does not apply to the content is scored NOT_APPLICABLE, not counted as passed.
 *
 * Context fields read by the article checks:
 * - contentType: code | test | requirements | design (required)
 * - filePath: path of the content (project-relative, or absolute under projectRoot)
 * - projectRoot: project whose profile, levels and code limits apply
 * - profile, levels, codeLimits: profile configuration, { 'CONST-00x': level } and
 *   { maxFileLines, maxFunctionLines, maxImports } overrides
 * - requirementId / requirementIds / specId: requirements the content implements (V)
 * - testsWritten: whether tests were written first (III-1)
 * - steeringLoaded: whether the steering files were read (VI-4)
 * - projectCount, phaseMinusOneApproved: project count and gate approval (VII-2, VIII-2)
 * - runtimeConstraintDocumented: runtime-constraint client documented in design.md (VIII-4, VIII-5)
 *
 * @module orchestration/guardrails/constitutional-compliance
 */

'use strict';

const path = require('path');
const {
  ARTICLES,
  toPosix,
  isCoreFile,
  isRouteHandler,
  isIntegrationTest,
  isSourceFile,
  checkTestableCore,
  checkPublicInterfaceDocs,
  checkCodeSize,
  checkAutomationInterface,
  checkEarsFormat,
  checkTraceabilityReferences,
  checkDesignCoverage,
  checkAntiAbstraction,
  checkIntegrationMocks,
} = require('../../constitutional/articles');
const {
  ConstitutionLevelManager,
  DEFAULT_PROFILE,
  DEFAULT_ARTICLE_LEVELS,
  DEFAULT_PROFILE_LEVELS,
  DEFAULT_CORE_PATHS,
  DEFAULT_CODE_LIMITS,
} = require('../../validators/constitution-level-manager');

/**
 * Artifact types the constitution governs
 */
const CONTENT_TYPES = ['code', 'test', 'requirements', 'design'];

/**
 * Score of an article that does not apply to the content
 */
const NOT_APPLICABLE = 'not-applicable';

/**
 * Paths that stand for typed content without a file path
 */
const DEFAULT_PATHS = {
  code: 'content.js',
  test: 'content.test.js',
  requirements: 'requirements.md',
  design: 'design.md',
};

/**
 * Requirements each article check covers
 */
const ARTICLE_CHECKS = {
  TESTABLE_CORE: ['I-3', 'I-5', 'I-A4', 'I-A5'],
  AUTOMATION_INTERFACE: ['II-A4'],
  TEST_FIRST: ['III-1'],
  EARS_FORMAT: ['IV-1', 'IV-2'],
  TRACEABILITY: ['V-2', 'V-4', 'V-5'],
  PROJECT_MEMORY: ['VI-4'],
  SIMPLICITY_GATE: ['VII-2', 'VII-4', 'VII-5', 'VII-6'],
  ANTI_ABSTRACTION: ['VIII-2'],
  INTEGRATION_FIRST: ['IX-5'],
};

/**
 * Constitutional article mappings for guardrail rules (constitution v1.1)
 */
const ConstitutionalMapping = Object.fromEntries(
  Object.values(ARTICLES).map(article => [
    article.key,
    {
      article: article.id,
      constId: article.constId,
      title: article.name,
      checks: ARTICLE_CHECKS[article.key],
    },
  ])
);

const notApplicable = () => ({ applicable: false, findings: [] });
const applicable = findings => ({ applicable: true, findings });

/**
 * A finding for a context flag that reports a violation
 * @private
 */
function contextFinding(article, requirement, message, suggestion, extra = {}) {
  return [{ article, requirement, message, suggestion, ...extra }];
}

/**
 * Whether the input or context names the requirement the content implements
 * @private
 */
function hasRequirementReference(input, context) {
  const fromObject = source =>
    Boolean(
      source &&
      typeof source === 'object' &&
      (source.requirementId || source.requirementIds?.length || source.specId)
    );
  return fromObject(context) || fromObject(input);
}

/**
 * Article VII: the project-count gate (VII-2) and the code-size limits (VII-4 to VII-6)
 * @private
 */
function checkSimplicity({ content, context, env }) {
  const gateApplies = typeof context.projectCount === 'number';
  const sizeProfile = env.rel && env.profileKnown ? env.profile : undefined;
  const sizeApplies = env.type === 'code' && isSourceFile(env.path, sizeProfile);
  if (!gateApplies && !sizeApplies) return notApplicable();

  const gate =
    gateApplies && context.projectCount > 3 && !context.phaseMinusOneApproved
      ? contextFinding(
          'VII',
          'VII-2',
          `VII-1, VII-2: ${context.projectCount} projects (limit 3) without Phase -1 Gate approval`,
          'Request Phase -1 Gate approval and justify each additional project in design.md (VII-3)',
          { gate: true }
        )
      : [];
  const size = sizeApplies
    ? checkCodeSize({ rel: env.path, content, limits: env.codeLimits, profile: sizeProfile })
    : [];
  return applicable([...gate, ...size]);
}

/**
 * Article checks. Each rule receives { content, input, context, env } and returns
 * { applicable, findings }.
 */
const ARTICLE_RULES = {
  TESTABLE_CORE: ({ content, env: { type, rel, profile } }) =>
    type === 'code' && rel && isCoreFile(rel, profile)
      ? applicable([
          ...checkTestableCore({ rel, content, profile }),
          ...checkPublicInterfaceDocs({ rel, content, profile }),
        ])
      : notApplicable(),

  AUTOMATION_INTERFACE: ({ content, env: { type, rel, profile } }) =>
    type === 'code' && rel && profile.profile === 'application' && isRouteHandler(rel)
      ? applicable(checkAutomationInterface({ rel, content, profile }))
      : notApplicable(),

  TEST_FIRST: ({ context, env }) => {
    if (env.type !== 'code' || typeof context.testsWritten !== 'boolean') return notApplicable();
    return applicable(
      context.testsWritten
        ? []
        : contextFinding(
            'III',
            'III-1',
            'III-1: Production code was written before its tests',
            'Write a failing test first (Red), then the minimal code (Green)'
          )
    );
  },

  EARS_FORMAT: ({ content, env }) =>
    env.type === 'requirements'
      ? applicable(checkEarsFormat({ rel: env.path, content, force: true }))
      : notApplicable(),

  TRACEABILITY: ({ content, input, context, env }) => {
    if (env.type === 'design') return applicable(checkDesignCoverage({ content }));
    if (env.type !== 'code' && env.type !== 'test') return notApplicable();
    if (hasRequirementReference(input, context)) return applicable([]);
    return applicable(checkTraceabilityReferences({ rel: env.path, content }));
  },

  PROJECT_MEMORY: ({ context }) => {
    if (typeof context.steeringLoaded !== 'boolean') return notApplicable();
    return applicable(
      context.steeringLoaded
        ? []
        : contextFinding(
            'VI',
            'VI-4',
            'VI-4: The steering files were not read before this work',
            'Read steering/structure.md, tech.md and product.md first'
          )
    );
  },

  SIMPLICITY_GATE: checkSimplicity,

  ANTI_ABSTRACTION: ({ content, context, env }) => {
    if (env.type !== 'code') return notApplicable();
    if (context.phaseMinusOneApproved === true || context.runtimeConstraintDocumented) {
      return applicable([]);
    }
    return applicable(checkAntiAbstraction({ rel: env.path, content, profile: env.profile }));
  },

  INTEGRATION_FIRST: ({ content, env: { type, rel } }) =>
    type === 'test' && rel && isIntegrationTest(rel)
      ? applicable(checkIntegrationMocks({ rel, content }))
      : notApplicable(),
};

/**
 * Why the content type is missing or unknown, or null when it is valid
 * @private
 */
function contentTypeError(contentType) {
  const expected = 'code, test, requirements or design';
  if (!contentType) {
    return `Unclassified content: set context.contentType to ${expected} to check it against the constitution`;
  }
  if (!CONTENT_TYPES.includes(contentType)) {
    return `Unknown contentType '${contentType}': use ${expected}`;
  }
  return null;
}

/**
 * Resolve the project profile, article levels, code limits and content path
 * @private
 */
async function resolveContext(context, projectRoot) {
  const levels = {};
  let profile = context.profile;
  let codeLimits = { ...DEFAULT_CODE_LIMITS };

  if (projectRoot) {
    const manager = new ConstitutionLevelManager(projectRoot);
    profile = profile || (await manager.getProfileConfig());
    codeLimits = await manager.getCodeLimits();
    for (const article of Object.values(ARTICLES)) {
      levels[article.id] = await manager.getArticleLevel(article.constId);
    }
  }

  const profileName = profile?.profile || DEFAULT_PROFILE;
  for (const article of Object.values(ARTICLES)) {
    levels[article.id] =
      context.levels?.[article.constId] ||
      levels[article.id] ||
      DEFAULT_PROFILE_LEVELS[profileName]?.[article.constId] ||
      DEFAULT_ARTICLE_LEVELS[article.constId];
  }

  const rel = context.filePath ? toPosix(relativePath(context.filePath, projectRoot)) : '';
  return {
    type: context.contentType,
    profileKnown: Boolean(context.profile || projectRoot),
    profile: {
      profile: profileName,
      corePaths: profile?.corePaths || DEFAULT_CORE_PATHS[profileName] || [],
      deliveryPaths: profile?.deliveryPaths || [],
      adapterPaths: profile?.adapterPaths || [],
    },
    levels,
    codeLimits: { ...codeLimits, ...(context.codeLimits || {}) },
    rel,
    path: rel || DEFAULT_PATHS[context.contentType],
  };
}

/**
 * @private
 */
function relativePath(filePath, projectRoot) {
  return projectRoot && path.isAbsolute(filePath) ? path.relative(projectRoot, filePath) : filePath;
}

/**
 * Severity of a finding: errors for critical articles and Phase -1 Gate findings (VII-2,
 * VIII-2); warnings for advisory and flexible articles and for requirements tagged (advisory)
 * @private
 */
function findingSeverity(finding, env) {
  if (finding.advisory) return 'warning';
  if (finding.gate) return 'error';
  return env.levels[finding.article] === 'critical' ? 'error' : 'warning';
}

/**
 * Mean of the applicable article scores, or null when no article applies
 * @private
 */
function meanScore(articleScores) {
  const scores = Object.values(articleScores).filter(score => typeof score === 'number');
  return scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
}

/**
 * Result for content without a valid content type: unclassified, every article not applicable
 * @private
 */
function unclassifiedResult(typeError, context, mappings, createViolation) {
  return {
    compliant: false,
    score: null,
    violations: [
      createViolation('CONSTITUTIONAL_UNCLASSIFIED', typeError, 'error', {
        contentType: context.contentType ?? null,
      }),
    ],
    articleScores: Object.fromEntries(mappings.map(([, m]) => [m.article, NOT_APPLICABLE])),
  };
}

/**
 * Score of one article: not applicable, 1 without findings, 0 with an error, 0.5 with warnings
 * @private
 */
function articleScore(applies, severities) {
  if (!applies) return NOT_APPLICABLE;
  if (severities.length === 0) return 1;
  return severities.includes('error') ? 0 : 0.5;
}

/**
 * Turn an article's findings into guardrail violations
 * @private
 */
function articleViolations(mapping, findings, severities, createViolation) {
  return findings.map((finding, index) =>
    createViolation(
      `CONSTITUTIONAL_${finding.requirement.replace(/-/g, '_')}`,
      `Article ${mapping.article} (${mapping.title}): ${finding.message}`,
      severities[index],
      {
        article: mapping.article,
        constId: mapping.constId,
        title: mapping.title,
        requirement: finding.requirement,
        suggestion: finding.suggestion,
      }
    )
  );
}

/**
 * Check content against the enabled articles
 * @param {Object} options - { content, input, context, enabledArticles, projectRoot,
 *   createViolation(code, message, severity, details) }
 * @returns {Promise<{compliant: boolean, score: number|null, violations: Array,
 *   articleScores: Object}>}
 */
async function checkConstitutionalCompliance(options) {
  const { content, input, context, enabledArticles, projectRoot, createViolation } = options;
  const mappings = enabledArticles.map(key => [key, ConstitutionalMapping[key]]).filter(m => m[1]);

  const typeError = contentTypeError(context.contentType);
  if (typeError) return unclassifiedResult(typeError, context, mappings, createViolation);

  const env = await resolveContext(context, projectRoot);
  const violations = [];
  const articleScores = {};
  for (const [key, mapping] of mappings) {
    const { applicable: applies, findings } = ARTICLE_RULES[key]({ content, input, context, env });
    const severities = findings.map(finding => findingSeverity(finding, env));
    articleScores[mapping.article] = articleScore(applies, severities);
    violations.push(...articleViolations(mapping, findings, severities, createViolation));
  }

  return {
    compliant: !violations.some(v => v.severity === 'error'),
    score: meanScore(articleScores),
    violations,
    articleScores,
  };
}

module.exports = {
  CONTENT_TYPES,
  NOT_APPLICABLE,
  ConstitutionalMapping,
  checkConstitutionalCompliance,
};
