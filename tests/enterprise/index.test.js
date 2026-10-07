/**
 * Enterprise Module Export Tests (CHANGE-002)
 *
 * The enterprise module exposes multi-tenant, experiment-report, error-recovery and rollback
 * features. Technical-article generation was removed by CHANGE-002 (REQ-PUB-001) and must not
 * come back through the public API.
 */

const enterprise = require('../../src/enterprise');

const KEPT_EXPORTS = [
  'TenantManager',
  'defaultTenantManager',
  'TenantRole',
  'Permission',
  'ExperimentReportGenerator',
  'createExperimentReportGenerator',
  'REPORT_FORMAT',
  'TEST_STATUS',
  'ErrorRecoveryHandler',
  'createErrorRecoveryHandler',
  'ERROR_CATEGORY',
  'RECOVERY_ACTION',
  'RollbackManager',
  'createRollbackManager',
  'ROLLBACK_LEVEL',
  'ROLLBACK_STATUS',
  'WORKFLOW_STAGE',
];

const REMOVED_EXPORTS = [
  'TechArticleGenerator',
  'createTechArticleGenerator',
  'PLATFORM',
  'ARTICLE_TYPE',
  'LANGUAGE',
];

describe('enterprise module exports', () => {
  it.each(KEPT_EXPORTS)('exports %s', name => {
    expect(enterprise[name]).toBeDefined();
  });

  it.each(REMOVED_EXPORTS)('does not export %s (REQ-PUB-001)', name => {
    expect(enterprise).not.toHaveProperty(name);
  });

  it('does not ship the tech-article module (REQ-PUB-001)', () => {
    expect(() => require('../../src/enterprise/tech-article')).toThrow(/Cannot find module/);
  });
});
