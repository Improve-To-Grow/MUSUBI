/**
 * Constitutional Articles
 *
 * The nine articles of steering/rules/constitution.md (v1.1) and the content-level
 * rules shared by the CI checker (./checker), the safety guardrail
 * (../orchestration/guardrails/safety-check) and the project validator
 * (../validators/constitutional-validator).
 *
 * Each rule returns findings: { article, requirement, message, suggestion, definite, advisory, gate }.
 * `definite` marks a finding that is a fact about the code (e.g. an import), not a heuristic.
 * `advisory` marks a requirement tagged (advisory) in the constitution; it never blocks.
 * `gate` marks a finding that needs Phase -1 Gate approval (VII-2, VIII-2).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { measureCode } = require('./code-metrics');
const {
  IMPORT_PATTERN,
  TEST_FILE_PATTERN,
  toPosix,
  isUnder,
  isCodeFile,
  isTestFile,
  isRouteHandler,
  isRequirementsDoc,
  isIntegrationTest,
  isCoreFile,
  isSourceFile,
  isImportLimitExempt,
  resolveImports,
} = require('./paths');
const { checkEarsFormat } = require('./ears');
const { checkCodeSize, checkPublicInterfaceDocs } = require('./code-rules');

/**
 * The nine articles (constitution v1.1)
 */
const ARTICLES = {
  I: {
    id: 'I',
    constId: 'CONST-001',
    key: 'TESTABLE_CORE',
    name: 'Testable-Core Principle',
    statement:
      'The project SHALL keep feature logic in core modules that have an explicit public interface and can be tested without the delivery mechanism (UI, HTTP server, terminal).',
  },
  II: {
    id: 'II',
    constId: 'CONST-002',
    key: 'AUTOMATION_INTERFACE',
    name: 'Automation Interface Mandate',
    statement:
      'The project SHALL make its primary functionality reachable through a documented, scriptable interface that does not require the UI.',
  },
  III: {
    id: 'III',
    constId: 'CONST-003',
    key: 'TEST_FIRST',
    name: 'Test-First Imperative',
    statement:
      'The developer SHALL write tests before the implementation that satisfies them (Red-Green-Blue cycle).',
  },
  IV: {
    id: 'IV',
    constId: 'CONST-004',
    key: 'EARS_FORMAT',
    name: 'EARS Requirements Format',
    statement: 'Every requirement SHALL use EARS (Easy Approach to Requirements Syntax) format.',
  },
  V: {
    id: 'V',
    constId: 'CONST-005',
    key: 'TRACEABILITY',
    name: 'Traceability Mandate',
    statement:
      'The project SHALL maintain 100% traceability between Requirements ↔ Design ↔ Code ↔ Tests.',
  },
  VI: {
    id: 'VI',
    constId: 'CONST-006',
    key: 'PROJECT_MEMORY',
    name: 'Project Memory',
    statement: 'Each skill SHALL consult project memory (steering files) before making decisions.',
  },
  VII: {
    id: 'VII',
    constId: 'CONST-007',
    key: 'SIMPLICITY_GATE',
    name: 'Simplicity Gate',
    statement: 'The initial architecture SHALL contain at most 3 projects.',
  },
  VIII: {
    id: 'VIII',
    constId: 'CONST-008',
    key: 'ANTI_ABSTRACTION',
    name: 'Anti-Abstraction Gate',
    statement:
      'The project SHALL use framework features directly, without custom abstraction layers.',
  },
  IX: {
    id: 'IX',
    constId: 'CONST-009',
    key: 'INTEGRATION_FIRST',
    name: 'Integration-First Testing',
    statement: 'Integration tests SHALL use real services instead of mocks.',
  },
};

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

const REACT_IMPORT_PATTERN = /(?:from\s+|require\(\s*)['"]react(?:-dom)?['"]/;
const REQUEST_CONTEXT_PATTERN = /['"]next\/(?:headers|server)['"]/;
// Route handlers that machines call (webhooks, n8n flows, integrations)
const MACHINE_ENDPOINT_PATTERN = /(^|\/)(webhooks?|integrations?|n8n|callbacks?)(\/|$)/i;
const SCHEMA_VALIDATION_PATTERN =
  /\b(zod|safeParse|parseAsync|yup|joi|ajv|valibot|superstruct|typebox|class-validator)\b|Schema\b/i;
const DEFAULT_REQUIREMENT_PATTERNS = [
  /\b(?:REQ|IMP|FEAT|SPEC)-[A-Z0-9][\w.-]*/,
  /@requirement\b|\bRequirement:/,
];
// Abstraction layers that Article VIII sends to a Phase -1 Gate
const ABSTRACTION_PATTERNS = [
  /\bclass\s+\w*Wrapper\b/,
  /\babstract\s+class\s+\w+/,
  /\bextends\s+Base\w+/,
  /\bimplements\s+\w+Factory\b/,
];
const MOCK_PATTERN =
  /\b(?:jest\.mock|vi\.mock|sinon\.stub|td\.replace|nock)\s*\(\s*['"]?([^'",)\s]*)/g;
const MOCK_JUSTIFICATION_PATTERN = /\bIX-[45]\b|mock[- ]justification|justification:/i;
// Services that IX-4 allows to be mocked (usage limits or costs)
const DEFAULT_MOCK_EXCEPTION_PATTERN =
  /(openai|anthropic|llm|stripe|paypal|payment|analytics|segment|mixpanel)/i;
const PROJECT_MANIFESTS = ['package.json', 'Cargo.toml', 'pyproject.toml', 'go.mod'];
// ---------------------------------------------------------------------------
// Content rules
// ---------------------------------------------------------------------------

/**
 * Article I: core code SHALL NOT import from delivery paths (I-3); in an application,
 * core paths SHALL NOT contain UI-only code (I-A4) or request-context APIs (I-A5, advisory)
 * @param {Object} input - { rel, content, profile, srcExists }
 * @returns {Object[]} Findings
 */
function checkTestableCore({ rel, content, profile, srcExists = true }) {
  if (!isCodeFile(rel) || isTestFile(rel) || !isCoreFile(rel, profile)) return [];

  const findings = [];
  const deliveryPaths = profile.deliveryPaths || [];
  if (deliveryPaths.length > 0) {
    const crossings = resolveImports(rel, content, { srcExists }).filter(target =>
      isUnder(target, deliveryPaths)
    );
    if (crossings.length > 0) {
      findings.push({
        article: 'I',
        requirement: 'I-3',
        message: `I-3: Core module imports from delivery paths: ${crossings.join(', ')}`,
        suggestion: 'Move the imported logic, types or constants into the core module',
        definite: true,
      });
    }
  }

  if (profile.profile === 'application') {
    if (/\.[jt]sx$/.test(rel) || REACT_IMPORT_PATTERN.test(content)) {
      findings.push({
        article: 'I',
        requirement: 'I-A4',
        message: 'I-A4: UI-only code (component, React hook or provider) in a core path',
        suggestion: 'Move it to a delivery path, e.g. src/components or src/hooks',
        definite: true,
      });
    }
    if (REQUEST_CONTEXT_PATTERN.test(content)) {
      findings.push({
        article: 'I',
        requirement: 'I-A5',
        message: 'I-A5: Request-context API (next/headers, next/server) in a core path',
        suggestion: 'Move this code to a delivery path, or declare its folder in adapter_paths',
        definite: true,
        advisory: true,
      });
    }
  }
  return findings;
}

/**
 * Article II: in an application, machine-facing endpoints SHALL validate input against a
 * schema (II-A4)
 * @param {Object} input - { rel, content, profile }
 * @returns {Object[]} Findings
 */
function checkAutomationInterface({ rel, content, profile }) {
  if (!profile || profile.profile !== 'application') return [];
  if (!isRouteHandler(rel) || isTestFile(rel) || !MACHINE_ENDPOINT_PATTERN.test(rel)) return [];
  if (SCHEMA_VALIDATION_PATTERN.test(content)) return [];
  return [
    {
      article: 'II',
      requirement: 'II-A4',
      message: 'II-A4: Machine-facing endpoint does not validate its input against a schema',
      suggestion:
        'Validate the input against a schema (e.g. zod safeParse) and return documented status and error codes (II-A5)',
    },
  ];
}

/**
 * Article V: source files SHALL map to requirement IDs (V-2) and tests SHALL reference the
 * requirement they verify (V-4)
 * @param {Object} input - { rel, content, patterns }
 * @returns {Object[]} Findings
 */
function checkTraceabilityReferences({ rel, content, patterns = DEFAULT_REQUIREMENT_PATTERNS }) {
  if (!isCodeFile(rel)) return [];
  const base = path.posix.basename(rel);
  if (/^index\./.test(base) || /\.config\./.test(base) || /\.d\.ts$/.test(base)) return [];
  if (patterns.some(pattern => pattern.test(content))) return [];

  return isTestFile(rel)
    ? [
        {
          article: 'V',
          requirement: 'V-4',
          message: 'V-4: Test does not reference the requirement ID it verifies',
          suggestion: 'Name the requirement ID in the test description, e.g. REQ-AUTH-001',
        },
      ]
    : [
        {
          article: 'V',
          requirement: 'V-2',
          message: 'V-2: File references no requirement ID',
          suggestion:
            'Reference the implemented requirement IDs in a comment or JSDoc, e.g. @requirement REQ-AUTH-001',
        },
      ];
}

/**
 * Article V: each design document SHALL include a requirements coverage matrix (V-5), i.e. a
 * table that lists requirement IDs
 * @param {Object} input - { content, patterns }
 * @returns {Object[]} Findings
 */
function checkDesignCoverage({ content, patterns = DEFAULT_REQUIREMENT_PATTERNS.slice(0, 1) }) {
  const tableRows = String(content)
    .split(/\r?\n/)
    .filter(line => /^\s*\|.*\|\s*$/.test(line));
  if (tableRows.some(row => patterns.some(pattern => pattern.test(row)))) return [];
  return [
    {
      article: 'V',
      requirement: 'V-5',
      message:
        'V-5: Design document has no requirements coverage matrix (a table that lists requirement IDs)',
      suggestion: 'Add a table that maps each requirement ID to its design decisions (V-1, V-5)',
    },
  ];
}

/**
 * Article VIII: no custom abstraction layer or wrapper library over a framework without
 * Phase -1 Gate approval (VIII-2)
 * @param {Object} input - { rel, content, profile }
 * @returns {Object[]} Findings
 */
function checkAntiAbstraction({ rel, content, profile }) {
  if (!isCodeFile(rel) || isTestFile(rel)) return [];
  if (profile && isUnder(rel, profile.adapterPaths || [])) return [];

  const matches = ABSTRACTION_PATTERNS.map(pattern => String(content).match(pattern))
    .filter(Boolean)
    .map(match => match[0]);
  if (matches.length === 0) return [];

  return [
    {
      article: 'VIII',
      requirement: 'VIII-2',
      message: `VIII-2: Possible abstraction layer without Phase -1 Gate approval: ${matches
        .map(m => `"${m}"`)
        .join(', ')}`,
      suggestion:
        'Call the framework directly (VIII-1), or request Phase -1 Gate approval with a multi-framework justification, team expertise analysis and migration path (VIII-3). A runtime-constraint client is valid when design.md documents the constraint (VIII-4, VIII-5)',
      gate: true,
    },
  ];
}

/**
 * Article IX: integration tests SHALL NOT mock services unless IX-4 allows it, and each mock
 * SHALL be justified (IX-5)
 * @param {Object} input - { rel, content, isMockAllowed }
 * @returns {Object[]} Findings
 */
function checkIntegrationMocks({ rel, content, isMockAllowed = defaultIsMockAllowed }) {
  if (!isIntegrationTest(rel)) return [];

  const mocked = [...String(content).matchAll(MOCK_PATTERN)].map(m => m[1] || '(unknown)');
  const unjustified = mocked.filter(target => !isMockAllowed(target));
  if (unjustified.length === 0 || MOCK_JUSTIFICATION_PATTERN.test(content)) return [];

  return [
    {
      article: 'IX',
      requirement: 'IX-5',
      message: `IX-4, IX-5: Integration test mocks ${unjustified.join(', ')} without a documented justification`,
      suggestion:
        'Use the real service or its sandbox (IX-1, IX-3); where IX-4 allows a mock, justify it in a comment, e.g. "IX-5: no test environment"',
    },
  ];
}

/**
 * Services that may be mocked without justification (IX-4: usage limits or costs)
 * @param {string} target - Mocked module or URL
 * @returns {boolean}
 */
function defaultIsMockAllowed(target) {
  return DEFAULT_MOCK_EXCEPTION_PATTERN.test(target);
}

// ---------------------------------------------------------------------------
// Project rules (file system)
// ---------------------------------------------------------------------------

/**
 * Article VI: steering/structure.md, tech.md and product.md SHALL exist (VI-1..VI-3)
 * @param {string} projectRoot - Project root
 * @returns {Object[]} Findings
 */
function checkProjectMemory(projectRoot) {
  const files = [
    ['VI-1', 'structure.md', 'architecture patterns'],
    ['VI-2', 'tech.md', 'technology stack'],
    ['VI-3', 'product.md', 'business context'],
  ];
  return files
    .filter(([, file]) => !fs.existsSync(path.join(projectRoot, 'steering', file)))
    .map(([requirement, file, topic]) => ({
      article: 'VI',
      requirement,
      message: `${requirement}: steering/${file} is missing`,
      suggestion: `Create steering/${file} with the ${topic} (run /sdd-steering)`,
      definite: true,
    }));
}

/**
 * Count deployable units: the root project plus each package under packages/
 * @param {string} projectRoot - Project root
 * @returns {number} Project count
 */
function countProjects(projectRoot) {
  const hasManifest = dir => PROJECT_MANIFESTS.some(m => fs.existsSync(path.join(dir, m)));
  let count = hasManifest(projectRoot) ? 1 : 0;

  const packagesDir = path.join(projectRoot, 'packages');
  if (fs.existsSync(packagesDir)) {
    for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
      if (entry.isDirectory() && hasManifest(path.join(packagesDir, entry.name))) count++;
    }
  }
  return count;
}

/**
 * Article VII: more than 3 projects SHALL have Phase -1 Gate approval (VII-1, VII-2).
 * steering/complexity-tracking.md records the approval.
 * @param {string} projectRoot - Project root
 * @returns {Object[]} Findings
 */
function checkSimplicityGate(projectRoot) {
  const count = countProjects(projectRoot);
  if (count <= 3) return [];
  if (fs.existsSync(path.join(projectRoot, 'steering/complexity-tracking.md'))) return [];
  return [
    {
      article: 'VII',
      requirement: 'VII-2',
      message: `VII-1, VII-2: ${count} projects (limit 3) without a Phase -1 Gate approval record`,
      suggestion:
        'Request Phase -1 Gate approval, record it in steering/complexity-tracking.md and justify each additional project in design.md (VII-3)',
      definite: true,
      gate: true,
    },
  ];
}

module.exports = {
  ARTICLES,
  ABSTRACTION_PATTERNS,
  DEFAULT_REQUIREMENT_PATTERNS,
  IMPORT_PATTERN,
  REACT_IMPORT_PATTERN,
  REQUEST_CONTEXT_PATTERN,
  MACHINE_ENDPOINT_PATTERN,
  SCHEMA_VALIDATION_PATTERN,
  TEST_FILE_PATTERN,
  toPosix,
  isUnder,
  isCodeFile,
  isTestFile,
  isRouteHandler,
  isRequirementsDoc,
  isIntegrationTest,
  isCoreFile,
  resolveImports,
  checkTestableCore,
  checkAutomationInterface,
  checkEarsFormat,
  checkTraceabilityReferences,
  checkDesignCoverage,
  checkAntiAbstraction,
  checkIntegrationMocks,
  checkCodeSize,
  checkPublicInterfaceDocs,
  checkProjectMemory,
  checkSimplicityGate,
  countProjects,
  defaultIsMockAllowed,
  isImportLimitExempt,
  isSourceFile,
  measureCode,
};
