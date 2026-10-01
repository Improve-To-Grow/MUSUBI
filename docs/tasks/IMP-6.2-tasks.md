# MUSUBI v6.2 Task Breakdown

**Phase 6: Review Gates and Workflow Enhancement**

| Item | Content |
|------|---------|
| Document ID | MUSUBI-TASKS-2025-003 |
| Version | 6.2.0 |
| Created | 2025-12-31 |
| Sprint | 9-11 (6 weeks) |
| Requirements | [req_v6.2.md](../requirements/req_v6.2.md) |
| Design | [IMP-6.2-review-workflow-design.md](../design/IMP-6.2-review-workflow-design.md) |

---

## Overview

### Sprint Plan

| Sprint | Duration | Focus Area | Priority |
|--------|----------|------------|----------|
| Sprint 9 | Week 1-2 | Review Gate Engine, Review Prompts | Critical |
| Sprint 10 | Week 3-4 | Traceability, Dashboard, Sprint Manager | High |
| Sprint 11 | Week 5-6 | Constitution+, Steering, Docs, Recovery | Medium |

### Task Summary

| Phase | Tasks | Estimated Hours |
|-------|-------|-----------------|
| Phase 1 (Sprint 9) | 8 | 40h |
| Phase 2 (Sprint 10) | 8 | 44h |
| Phase 3 (Sprint 11) | 10 | 48h |
| **Total** | **26** | **132h** |

### Dependency Graph

```mermaid
graph TD
    subgraph "Phase 1: Review Gates (Critical)"
        T001[T-001: Base ReviewGate]
        T002[T-002: RequirementsReviewGate]
        T003[T-003: DesignReviewGate]
        T004[T-004: ImplementationReviewGate]
        T005[T-005: ReviewPromptRegistry]
        T006[T-006: EARS Checker]
        T007[T-007: C4 Checker]
        T008[T-008: Coverage Checker]
    end
    
    subgraph "Phase 2: Dashboard & Traceability (High)"
        T009[T-009: WorkflowDashboard]
        T010[T-010: TransitionRecorder]
        T011[T-011: SprintPlanner]
        T012[T-012: SprintReporter]
        T013[T-013: TraceabilityExtractor]
        T014[T-014: GapDetector]
        T015[T-015: TraceabilityMatrix Storage]
        T016[T-016: Dashboard CLI]
    end
    
    subgraph "Phase 3: Constitution & Recovery (Medium)"
        T017[T-017: ConstitutionChecker]
        T018[T-018: PhaseMinusOneGate]
        T019[T-019: ExperimentReporter]
        T020[T-020: ArticleGenerator]
        T021[T-021: SteeringSyncer]
        T022[T-022: SteeringValidator]
        T023[T-023: RecoveryGuide]
        T024[T-024: RollbackManager]
        T025[T-025: Integration Tests]
        T026[T-026: AGENTS.md Update]
    end
    
    T001 --> T002
    T001 --> T003
    T001 --> T004
    T006 --> T002
    T007 --> T003
    T008 --> T004
    T002 --> T005
    T003 --> T005
    T004 --> T005
    
    T005 --> T009
    T010 --> T009
    T011 --> T012
    T013 --> T014
    T013 --> T015
    
    T004 --> T017
    T017 --> T018
    T012 --> T019
    T014 --> T023
    T023 --> T024
    
    T005 --> T026
    T025 --> T026
```

---

## Phase 1: Review Gate Engine (Sprint 9)

### TASK-001: Implement Base ReviewGate Class

**Requirement**: IMP-6.2-001-01, IMP-6.2-001-02, IMP-6.2-001-03
**Priority**: Critical
**Estimated**: 4h
**Sprint**: 9
**Status**: ✅ Completed

**Description**: 
Implement the Base ReviewGate class with an Article I-compliant library structure. Provides the common interface and functionality for all ReviewGates.

**Implementation Path**: 
- `lib/musubi-review-gate/src/base/review-gate.ts`
- `lib/musubi-review-gate/src/types.ts`

**Test First (Article III)**:
```bash
# Red phase - Write failing tests first
tests/review/gates/base-review-gate.test.ts
```

**Acceptance Criteria**:
- [ ] `ReviewGate` base class implemented
- [ ] `ReviewConfig`, `ReviewResult`, `CheckResult` types defined
- [ ] `execute()`, `validatePreConditions()`, `runChecks()` methods
- [ ] Abstract `getChecks()` method for subclasses
- [ ] Unit tests passing with 90% coverage

**Constitutional Compliance**:
- Article I: Independent library in `lib/musubi-review-gate/`
- Article III: Tests written before implementation

---

### TASK-002: Implement RequirementsReviewGate

**Requirement**: IMP-6.2-001-01
**Priority**: Critical
**Estimated**: 6h
**Sprint**: 9
**Status**: ✅ Completed
**Dependencies**: T-001, T-006

**Description**: 
Review gate for requirements documents. Checks EARS format validation, stakeholder coverage, and acceptance criteria completeness.

**Implementation Path**: 
- `lib/musubi-review-gate/src/gates/requirements-review-gate.ts`

**Test First (Article III)**:
```bash
tests/review/gates/requirements-review-gate.test.ts
```

**Acceptance Criteria**:
- [ ] Run EARS format syntax check
- [ ] Verify stakeholder coverage
- [ ] Check acceptance criteria completeness
- [ ] Record review results
- [ ] Unit tests passing with 90% coverage

---

### TASK-003: Implement DesignReviewGate

**Requirement**: IMP-6.2-001-02
**Priority**: Critical
**Estimated**: 6h
**Sprint**: 9
**Status**: ✅ Completed
**Dependencies**: T-001, T-007

**Description**: 
Review gate for design documents. Verifies C4 model completeness, ADR existence, and Constitutional Article compliance.

**Implementation Path**: 
- `lib/musubi-review-gate/src/gates/design-review-gate.ts`

**Test First (Article III)**:
```bash
tests/review/gates/design-review-gate.test.ts
```

**Acceptance Criteria**:
- [ ] Verify C4 model (Context, Container, Component) completeness
- [ ] Check ADR existence and quality
- [ ] Verify compliance with Constitutional Articles (I, II, VII, VIII)
- [ ] Unit tests passing with 90% coverage

---

### TASK-004: Implement ImplementationReviewGate

**Requirement**: IMP-6.2-001-03
**Priority**: Critical
**Estimated**: 6h
**Sprint**: 9
**Status**: ✅ Completed
**Dependencies**: T-001, T-008

**Description**: 
Review gate at implementation completion. Verifies test coverage, code quality, and traceability.

**Implementation Path**: 
- `lib/musubi-review-gate/src/gates/implementation-review-gate.ts`

**Configuration**:
```yaml
MIN_TEST_COVERAGE: 80%  # Configurable
COVERAGE_TYPE: line
LINT_STRICT: true
```

**Test First (Article III)**:
```bash
tests/review/gates/implementation-review-gate.test.ts
```

**Acceptance Criteria**:
- [ ] Verify test coverage threshold (configurable, default 80%)
- [ ] Confirm Lint/Type check passes
- [ ] Verify requirements → design → code → test traceability
- [ ] Unit tests passing with 90% coverage

---

### TASK-005: Implement ReviewPromptRegistry

**Requirement**: IMP-6.2-001-04
**Priority**: Critical
**Estimated**: 4h
**Sprint**: 9
**Status**: ✅ Completed
**Dependencies**: T-002, T-003, T-004

**Description**: 
Manages registration and execution of review prompts (#sdd-review-*).

**Implementation Path**: 
- `lib/musubi-review-gate/src/registry/prompt-registry.ts`
- `src/agents/review-agent.ts` (integration)

**Prompts**:
- `#sdd-review-requirements <feature>` - Requirements review
- `#sdd-review-design <feature>` - Design review
- `#sdd-review-implementation <feature>` - Implementation review
- `#sdd-review-all <feature>` - Full review cycle

**Test First (Article III)**:
```bash
tests/review/registry/prompt-registry.test.ts
```

**Acceptance Criteria**:
- [ ] 4 review prompts are registered
- [ ] Appropriate ReviewGate is triggered when a prompt is executed
- [ ] Review results are saved to `storage/reviews/`
- [ ] Unit tests passing with 85% coverage

---

### TASK-006: Implement EARS Checker

**Requirement**: IMP-6.2-001-01
**Priority**: High
**Estimated**: 4h
**Sprint**: 9
**Status**: ✅ Completed

**Description**: 
Validation logic for EARS (Easy Approach to Requirements Syntax) patterns.

**Implementation Path**: 
- `lib/musubi-review-gate/src/checkers/ears-checker.ts`

**EARS Patterns**:
| Pattern | Keyword | Example |
|---------|---------|---------|
| Ubiquitous | The system SHALL | The system SHALL provide... |
| Event-driven | WHEN...SHALL | WHEN x occurs, the system SHALL... |
| State-driven | WHILE...SHALL | WHILE in state X, the system SHALL... |
| Optional | WHERE...SHALL | WHERE condition, the system SHALL... |
| Unwanted | IF...THEN | IF error occurs, THEN the system SHALL... |

**Test First (Article III)**:
```bash
tests/review/checkers/ears-checker.test.ts
```

**Acceptance Criteria**:
- [ ] Detect the 5 EARS patterns
- [ ] Report invalid patterns as errors
- [ ] Generate usage statistics per pattern
- [ ] Unit tests passing with 90% coverage

---

### TASK-007: Implement C4 Checker

**Requirement**: IMP-6.2-001-02
**Priority**: High
**Estimated**: 4h
**Sprint**: 9
**Status**: ✅ Completed

**Description**: 
Completeness verification of the C4 architecture model (Context, Container, Component).

**Implementation Path**: 
- `lib/musubi-review-gate/src/checkers/c4-checker.ts`

**Required Levels**:
- Level 1: System Context (Required)
- Level 2: Container (Required)
- Level 3: Component (Required for complex features)
- Level 4: Code (Optional)

**Test First (Article III)**:
```bash
tests/review/checkers/c4-checker.test.ts
```

**Acceptance Criteria**:
- [ ] Check existence of Levels 1-3
- [ ] Validate Mermaid diagram syntax
- [ ] Report missing levels as errors
- [ ] Unit tests passing with 85% coverage

---

### TASK-008: Implement Coverage Checker

**Requirement**: IMP-6.2-001-03
**Priority**: High
**Estimated**: 6h
**Sprint**: 9
**Status**: ✅ Completed

**Description**: 
Test coverage validation logic. Parses Jest/NYC output and validates thresholds.

**Implementation Path**: 
- `lib/musubi-review-gate/src/checkers/coverage-checker.ts`

**Configuration**:
```typescript
interface CoverageConfig {
  minCoverage: number;      // default: 80
  coverageType: 'line' | 'branch' | 'function';
  coverageDir: string;      // default: 'coverage'
}
```

**Test First (Article III)**:
```bash
tests/review/checkers/coverage-checker.test.ts
```

**Acceptance Criteria**:
- [ ] Parse Jest coverage JSON/LCOV
- [ ] Compare against configurable thresholds
- [ ] Validate per line/branch/function
- [ ] Unit tests passing with 85% coverage

---

## Phase 2: Dashboard & Traceability (Sprint 10)

### TASK-009: Implement WorkflowDashboard

**Requirement**: IMP-6.2-002-01
**Priority**: High
**Estimated**: 6h
**Sprint**: 10
**Status**: ✅ Completed
**Dependencies**: T-005

**Description**: 
Dashboard visualizing workflow progress. Shows stages, completion rate, blockers, and next action suggestions.

**Implementation Path**: 
- `src/dashboard/workflow-dashboard.ts`

**Storage Format** (YAML per ADR-6.2-002):
```yaml
# storage/dashboard/{feature-id}.yml
featureId: "IMP-6.2"
currentStage: "design"
completionPercentage: 45
stages:
  requirements:
    status: completed
    completedAt: "2025-12-31T10:00:00Z"
  design:
    status: in-progress
    startedAt: "2025-12-31T11:00:00Z"
blockers:
  - id: "BLK-001"
    description: "Waiting for ADR review"
nextActions:
  - "Complete C4 Level 3 diagram"
  - "Write ADR for storage format"
```

**Test First (Article III)**:
```bash
tests/dashboard/workflow-dashboard.test.ts
```

**Acceptance Criteria**:
- [ ] Visualize workflow stages for each feature
- [ ] Calculate and display completion rate (%)
- [ ] Explicitly display blockers
- [ ] Suggest next actions
- [ ] Unit tests passing with 85% coverage

---

### TASK-010: Implement TransitionRecorder

**Requirement**: IMP-6.2-002-02
**Priority**: High
**Estimated**: 4h
**Sprint**: 10
**Status**: ✅ Completed

**Description**: 
Records transitions between stages. Timestamp, approver, status.

**Implementation Path**: 
- `src/dashboard/transition-recorder.ts`

**Storage Format**:
```yaml
# storage/transitions/{feature-id}.yml
featureId: "IMP-6.2"
transitions:
  - from: "requirements"
    to: "design"
    timestamp: "2025-12-31T10:30:00Z"
    reviewer: "AI-Agent"
    reviewType: "automated"
    status: "approved"
    gateResult:
      passed: true
      score: 95
```

**Test First (Article III)**:
```bash
tests/dashboard/transition-recorder.test.ts
```

**Acceptance Criteria**:
- [ ] Automatically record stage transitions
- [ ] Add timestamps
- [ ] Record approver (Human/AI)
- [ ] Save approval status
- [ ] Unit tests passing with 85% coverage

---

### TASK-011: Implement SprintPlanner

**Requirement**: IMP-6.2-003-01
**Priority**: High
**Estimated**: 6h
**Sprint**: 10
**Status**: ✅ Completed

**Description**: 
Generate and manage sprint planning templates.

**Implementation Path**: 
- `src/sprint/sprint-planner.ts`

**Template Output**:
```markdown
# Sprint Plan: {sprintName}

**Sprint ID**: {sprintId}
**Duration**: {startDate} - {endDate}

## Sprint Goals
| # | Goal | Requirements | Priority |
|---|------|--------------|----------|
| 1 | {goal1} | IMP-6.2-001 | Must |

## Task Breakdown
| Task ID | Title | Req ID | Est. | Status | Dependencies |
|---------|-------|--------|------|--------|--------------|
| T-001 | {task1} | IMP-6.2-001-01 | 4h | Todo | - |
```

**Test First (Article III)**:
```bash
tests/sprint/sprint-planner.test.ts
```

**Acceptance Criteria**:
- [ ] Generate sprint planning template
- [ ] Define sprint goals
- [ ] Task breakdown and requirements tracing
- [ ] Record effort estimates
- [ ] Dependency mapping
- [ ] Unit tests passing with 85% coverage

---

### TASK-012: Implement SprintReporter

**Requirement**: IMP-6.2-003-02
**Priority**: High
**Estimated**: 6h
**Sprint**: 10
**Status**: ✅ Completed
**Dependencies**: T-011

**Description**: 
Automatic generation of sprint completion reports.

**Implementation Path**: 
- `src/sprint/sprint-reporter.ts`

**Report Contents**:
- Sprint summary (planned/completed/carry-over)
- List of delivered features
- Test results (pass/fail/skip, coverage)
- Performance metrics (velocity, defects)
- Lessons Learned

**Test First (Article III)**:
```bash
tests/sprint/sprint-reporter.test.ts
```

**Acceptance Criteria**:
- [ ] Automatically generate a report when the sprint completes
- [ ] Include list of delivered features
- [ ] Include test results (pass/fail/skip)
- [ ] Include performance metrics
- [ ] Include a Lessons Learned section
- [ ] Unit tests passing with 85% coverage

---

### TASK-013: Implement TraceabilityExtractor

**Requirement**: IMP-6.2-004-01
**Priority**: High
**Estimated**: 6h
**Sprint**: 10
**Status**: ✅ Completed

**Description**: 
Automatic extraction of requirement ID patterns from code, tests, and commits.

**Implementation Path**: 
- `src/traceability/extractor.ts`

**Extraction Patterns**:
```typescript
const PATTERNS = [
  /REQ-[A-Z0-9]+-\d{3}/g,           // REQ-XXX-NNN
  /IMP-\d+\.\d+-\d{3}(?:-\d{2})?/g, // IMP-6.2-001 or IMP-6.2-001-01
];
```

**Test First (Article III)**:
```bash
tests/traceability/extractor.test.ts
```

**Acceptance Criteria**:
- [ ] Extract REQ/IMP from code comments
- [ ] Extract REQ/IMP from test descriptions
- [ ] Extract REQ/IMP from commit messages
- [ ] Reflect in the traceability matrix
- [ ] Unit tests passing with 85% coverage

---

### TASK-014: Implement GapDetector

**Requirement**: IMP-6.2-004-02
**Priority**: High
**Estimated**: 6h
**Sprint**: 10
**Status**: ✅ Completed
**Dependencies**: T-013

**Description**: 
Detection of requirements without implementation/tests (traceability gaps).

**Implementation Path**: 
- `src/traceability/gap-detector.ts`

**Gap Types**:
| Gap Type | Severity | Description |
|----------|----------|-------------|
| Missing Design | High | Requirement has no design section |
| Missing Code | Critical | Requirement has no implementation code |
| Missing Test | Critical | Requirement has no tests |
| Missing Commit | Low | Requirement has no related commits |

**Test First (Article III)**:
```bash
tests/traceability/gap-detector.test.ts
```

**Acceptance Criteria**:
- [ ] Detect requirements without implementation
- [ ] Detect requirements without tests
- [ ] Display gap warnings
- [ ] Suggest corrective actions
- [ ] Unit tests passing with 85% coverage

---

### TASK-015: Implement Traceability Matrix Storage

**Requirement**: IMP-6.2-004-01
**Priority**: Medium
**Estimated**: 4h
**Sprint**: 10
**Status**: ✅ Completed
**Dependencies**: T-013

**Description**: 
YAML persistence of the traceability matrix (compliant with ADR-6.2-002).

**Implementation Path**: 
- `src/traceability/matrix-storage.ts`

**Storage Format**:
```yaml
# storage/traceability/matrix.yml
requirements:
  IMP-6.2-001-01:
    design:
      - path: "docs/design/IMP-6.2-review-workflow-design.md"
        section: "3.1"
    code:
      - path: "src/review/gates/requirements-review-gate.ts"
        line: 15
    tests:
      - path: "tests/review/requirements-review-gate.test.ts"
        line: 25
```

**Test First (Article III)**:
```bash
tests/traceability/matrix-storage.test.ts
```

**Acceptance Criteria**:
- [ ] Save matrix in YAML format
- [ ] Requirements → deliverables mapping
- [ ] Load, update, and diff detection
- [ ] Unit tests passing with 85% coverage

---

### TASK-016: Implement Dashboard CLI

**Requirement**: IMP-6.2-002-01
**Priority**: Medium
**Estimated**: 4h
**Sprint**: 10
**Status**: ✅ Completed
**Dependencies**: T-009

**Description**: 
CLI interface for the dashboard (Article II compliant).

**Implementation Path**: 
- `bin/musubi-dash.js`
- CLI integration in `bin/musubi.js`

**Commands**:
```bash
musubi dash                    # Show current feature dashboard
musubi dash --feature IMP-6.2  # Show specific feature
musubi dash --all              # Show all features
musubi dash --json             # Output as JSON
```

**Test First (Article III)**:
```bash
tests/cli/musubi-dash.test.ts
```

**Acceptance Criteria**:
- [ ] Implement `musubi dash` command
- [ ] Terminal display and JSON output
- [ ] Feature filtering
- [ ] Unit tests passing with 80% coverage

---

## Phase 3: Constitution & Recovery (Sprint 11)

### TASK-017: Implement ConstitutionChecker

**Requirement**: IMP-6.2-005-01
**Priority**: Medium
**Estimated**: 8h
**Sprint**: 11
**Status**: ✅ Completed
**Dependencies**: T-004

**Description**: 
Automatic validation of all 9 Constitutional Articles. Blocks on commit/PR.

**Implementation Path**: 
- `src/constitution/checker.ts`
- `src/constitution/article-checkers/` (per-article)

**Articles**:
| Article | Name | Checker |
|---------|------|---------|
| I | Library-First | Check `lib/` structure |
| II | CLI Interface | Check `bin/` existence |
| III | Test-First | Check test file dates |
| IV | Knowledge-Driven | Check steering/ files |
| V | Human Approval | Check approval records |
| VI | Reversibility | Check rollback capability |
| VII | Simplicity | Check LOC/complexity |
| VIII | Anti-Abstraction | Check inheritance depth |
| IX | Error-Driven | Check error handling |

**Test First (Article III)**:
```bash
tests/constitution/checker.test.ts
```

**Acceptance Criteria**:
- [ ] Validation logic for all 9 Articles
- [ ] Run checks at commit time
- [ ] Validation before PR/MR merge
- [ ] Block on violations
- [ ] Present remediation steps
- [ ] Unit tests passing with 90% coverage

---

### TASK-018: Implement PhaseMinusOneGate

**Requirement**: IMP-6.2-005-02
**Priority**: Medium
**Estimated**: 6h
**Sprint**: 11
**Status**: ✅ Completed
**Dependencies**: T-017

**Description**: 
Automatic Phase -1 Gate trigger when Article VII/VIII violations are detected.

**Implementation Path**: 
- `src/constitution/phase-minus-one-gate.ts`

**Workflow**:
1. Article VII (Simplicity) or VIII (Anti-Abstraction) violation detected
2. Auto-trigger Phase -1 Gate
3. Notify required reviewers (System Architect, Project Manager)
4. Wait for approval workflow
5. Final Human Developer approval

**Test First (Article III)**:
```bash
tests/constitution/phase-minus-one-gate.test.ts
```

**Acceptance Criteria**:
- [ ] Automatically detect Article VII/VIII violations
- [ ] Automatically trigger Phase -1 Gate review
- [ ] Notify reviewers (GitHub/GitLab integration)
- [ ] Approval/rejection workflow
- [ ] Unit tests passing with 90% coverage

---

### TASK-019: Implement ExperimentReporter

**Requirement**: IMP-6.2-006-01
**Priority**: Medium
**Estimated**: 4h
**Sprint**: 11
**Status**: ✅ Completed
**Dependencies**: T-012

**Description**: 
Automatic generation of experiment reports from test results.

**Implementation Path**: 
- `src/docs/experiment-reporter.ts`

**Report Contents**:
- Test Summary (pass/fail/skip)
- Performance Metrics (duration, memory)
- Observations (categorized insights)
- Recommendations

**Test First (Article III)**:
```bash
tests/docs/experiment-reporter.test.ts
```

**Acceptance Criteria**:
- [ ] Automatically generate a report after test execution
- [ ] Include test summary
- [ ] Include performance metrics
- [ ] Include Observations section
- [ ] Unit tests passing with 85% coverage

---

### TASK-020: Implement ArticleGenerator

**Requirement**: IMP-6.2-006-02
**Priority**: Low
**Estimated**: 6h
**Sprint**: 11
**Status**: ✅ Completed

**Description**: 
Generate technical article templates (supports Qiita, Zenn, Medium, Dev.to).

**Implementation Path**: 
- `src/docs/article-generator.ts`

**Platforms**:
| Platform | Format | Special Support |
|----------|--------|-----------------|
| Qiita | Markdown + Qiita extensions | Tags, organizations |
| Zenn | Markdown + Zenn extensions | Books/Scraps |
| Medium | Rich Text conversion | Code block optimization |
| Dev.to | Markdown | Front Matter |

**Test First (Article III)**:
```bash
tests/docs/article-generator.test.ts
```

**Acceptance Criteria**:
- [ ] Generate technical article templates
- [ ] Support 4 platforms
- [ ] Include code samples and diagrams
- [ ] Generate publication-quality drafts
- [ ] Unit tests passing with 80% coverage

---

### TASK-021: Implement SteeringSyncer

**Requirement**: IMP-6.2-007-01
**Priority**: Medium
**Estimated**: 4h
**Sprint**: 11
**Status**: ✅ Completed

**Description**: 
Automatic update of steering/*.md on version release.

**Implementation Path**: 
- `src/steering/syncer.ts`

**Sync Targets**:
- `steering/product.md` - Version, feature list
- `steering/tech.md` - Tech stack update
- `steering/structure.md` - Structure update

**Test First (Article III)**:
```bash
tests/steering/syncer.test.ts
```

**Acceptance Criteria**:
- [ ] Automatically update on version release
- [ ] Sync product.md/tech.md/structure.md
- [ ] Update version number and feature list
- [ ] Automatic commit (optional)
- [ ] Unit tests passing with 85% coverage

---

### TASK-022: Implement SteeringValidator

**Requirement**: IMP-6.2-007-02
**Priority**: Medium
**Estimated**: 4h
**Sprint**: 11
**Status**: ✅ Completed

**Description**: 
Consistency check across steering/*.md.

**Implementation Path**: 
- `src/steering/validator.ts`

**Validation Rules**:
- Version numbers match
- Feature lists match
- Tech stack consistency
- Structure description consistency

**Test First (Article III)**:
```bash
tests/steering/validator.test.ts
```

**Acceptance Criteria**:
- [ ] Consistency check across steering/*.md
- [ ] Warn on inconsistencies
- [ ] Suggest automatic fixes
- [ ] Unit tests passing with 85% coverage

---

### TASK-023: Implement RecoveryGuide

**Requirement**: IMP-6.2-008-01
**Priority**: Medium
**Estimated**: 6h
**Sprint**: 11
**Status**: ✅ Completed
**Dependencies**: T-014

**Description**: 
Recovery guidance for failed stages. Root cause analysis and fix procedure suggestions.

**Implementation Path**: 
- `src/recovery/recovery-guide.ts`
- `templates/recovery/*.yml` (remediation templates)

**Error Pattern Catalog**:
| Error Type | Auto-Recoverable | Est. Fix Time |
|------------|------------------|---------------|
| TEST_FAILURE | No | 30min-2h |
| LINT_ERROR | Yes (auto-fix) | 5min |
| TYPE_ERROR | No | 15min-1h |
| EARS_VIOLATION | No | 15min |
| COVERAGE_LOW | No | 1-4h |

**Test First (Article III)**:
```bash
tests/recovery/recovery-guide.test.ts
```

**Acceptance Criteria**:
- [ ] Automatic analysis on failure
- [ ] Identify root cause
- [ ] Suggest fix procedures
- [ ] Record failure history
- [ ] Attempt auto-recovery (Lint)
- [ ] Unit tests passing with 85% coverage

---

### TASK-024: Implement RollbackManager

**Requirement**: IMP-6.2-008-02
**Priority**: Medium
**Estimated**: 6h
**Sprint**: 11
**Status**: ✅ Completed
**Dependencies**: T-023

**Description**: 
Rollback functionality for workflow stages (4 granularity levels).

**Implementation Path**: 
- `src/recovery/rollback-manager.ts`

**Rollback Granularity**:
| Level | Target | Description |
|-------|--------|-------------|
| File | Individual file | Revert a specific file to the previous version |
| Commit | Git commit | Revert up to the specified commit |
| Stage | Workflow stage | Per Req/Design/Task/Impl unit |
| Sprint | Entire sprint | Return to the start of the sprint |

**Test First (Article III)**:
```bash
tests/recovery/rollback-manager.test.ts
```

**Acceptance Criteria**:
- [ ] Rollback at 4 granularity levels
- [ ] Dry-run (preview) mode
- [ ] Confirmation prompt
- [ ] Clean up partial changes
- [ ] Record rollback history
- [ ] Unit tests passing with 85% coverage

---

### TASK-025: Implement Integration Tests

**Requirement**: All IMP-6.2-*
**Priority**: High
**Estimated**: 8h
**Sprint**: 11
**Status**: ✅ Completed
**Dependencies**: T-001 through T-024

**Description**: 
E2E integration tests for the full review cycle.

**Implementation Path**: 
- `tests/integration/full-review-cycle.test.ts`
- `tests/integration/workflow-e2e.test.ts`

**Test Scenarios**:
1. Full requirements → design → implementation review cycle
2. Phase -1 Gate trigger and resolution
3. Traceability gap detection and recovery
4. Dashboard state persistence
5. Rollback scenarios

**Acceptance Criteria**:
- [ ] E2E test of the complete review cycle
- [ ] Phase -1 Gate integration test
- [ ] Traceability integration test
- [ ] Dashboard integration test
- [ ] Rollback integration test
- [ ] Integration tests passing

---

### TASK-026: Update AGENTS.md with Review Prompts

**Requirement**: IMP-6.2-001-04
**Priority**: High
**Estimated**: 2h
**Sprint**: 11
**Status**: ✅ Completed
**Dependencies**: T-005, T-025

**Description**: 
Add review prompts to AGENTS.md.

**Implementation Path**: 
- `AGENTS.md`

**New Prompts**:
```markdown
### Review Prompts
- `#sdd-review-requirements <feature>` - Review requirements document
- `#sdd-review-design <feature>` - Review design document
- `#sdd-review-implementation <feature>` - Review implementation
- `#sdd-review-all <feature>` - Full review cycle
```

**Acceptance Criteria**:
- [ ] Add 4 review prompts to AGENTS.md
- [ ] Description and usage example for each prompt
- [ ] Consistency with existing prompts

---

## Appendix

### A. Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| EARS Checker complexity | Medium | Medium | Start with simple patterns, iterate |
| C4 validation accuracy | High | Medium | Allow manual override |
| Constitution checker false positives | High | Medium | Configurable strictness levels |
| Phase -1 Gate workflow complexity | Medium | Low | Start with GitHub only |

### B. Constitutional Compliance Checklist

| Article | Task(s) | Compliance Method |
|---------|---------|-------------------|
| I - Library-First | T-001 | `lib/musubi-review-gate/` structure |
| II - CLI Interface | T-016 | `musubi dash` command |
| III - Test-First | All | Tests written before implementation |
| VII - Simplicity | T-017, T-018 | ConstitutionChecker enforces |
| VIII - Anti-Abstraction | T-017, T-018 | Max inheritance depth check |

### C. Traceability Summary

| Requirement | Tasks |
|-------------|-------|
| IMP-6.2-001-01 | T-001, T-002, T-006 |
| IMP-6.2-001-02 | T-001, T-003, T-007 |
| IMP-6.2-001-03 | T-001, T-004, T-008 |
| IMP-6.2-001-04 | T-005, T-026 |
| IMP-6.2-002-01 | T-009, T-016 |
| IMP-6.2-002-02 | T-010 |
| IMP-6.2-003-01 | T-011 |
| IMP-6.2-003-02 | T-012 |
| IMP-6.2-004-01 | T-013, T-015 |
| IMP-6.2-004-02 | T-014 |
| IMP-6.2-005-01 | T-017 |
| IMP-6.2-005-02 | T-018 |
| IMP-6.2-006-01 | T-019 |
| IMP-6.2-006-02 | T-020 |
| IMP-6.2-007-01 | T-021 |
| IMP-6.2-007-02 | T-022 |
| IMP-6.2-008-01 | T-023 |
| IMP-6.2-008-02 | T-024 |

---

**Document Status**: ✅ Completed
**Implementation Version**: MUSUBI v6.2.0
**Completion Date**: 2025-12-31
**Test Coverage**: 4,827 tests passing (159 test suites)
