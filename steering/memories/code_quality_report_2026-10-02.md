# Code Quality Baseline Report

**Generated**: 2026-10-02
**Version**: MUSUBI v6.3.1
**Branch**: ITG-adjustments
**Purpose**: Brownfield baseline before new feature work. Records known test debt so it is
tracked, not blocking. Article III (Test-First) binds new code; legacy modules get tests when a
feature touches them.

## Test Suite

Run with `npx jest --coverage` (e2e suites excluded via `jest.config.js`):

| Metric | Value |
|--------|-------|
| Test suites | 163 (158 passed, 5 failed before fixes below) |
| Tests | 4,910 (4,905 passed) |
| Global line coverage | 56.8% (threshold 60%) |
| Global statement coverage | 55.75% (threshold 60%) |

The 5 failures were all Windows path-separator issues (tests hard-coding `/` against
`path.join` output) plus one caused by `musubi init` overwriting `steering/project.yml` and
dropping `core_paths: [src]`. Fixed on 2026-10-02; see `lessons_learned.md`.

## `musubi-gaps detect` vs. real coverage

`musubi-gaps detect` reported 30 "untested code" modules. That check only looks for a test file
whose name contains the module's basename. Real line coverage (jest, collected only for those
30 files) shows 13 of them are covered at 75%+ by differently named tests.

### Real gaps (line coverage under 30%)

| Module | Lines covered | Size (lines) |
|--------|---------------|--------------|
| src/cli/guardrail-options.js | 0% | 14 |
| src/cli/validate-articles.js | 0% | 64 |
| src/integrations/github-client.js | 2% | 41 |
| src/generators/changelog-generator.js | 6% | 100 |
| src/cli/init-helpers.js | 12% | 347 |
| src/llm-providers/copilot-provider.js | 12% | 60 |
| src/llm-providers/openai-provider.js | 22% | 41 |
| src/cli/init-generators.js | 25% | 80 |
| src/llm-providers/anthropic-provider.js | 27% | 30 |
| src/converters/writers/speckit-writer.js | 29% | 362 |

### Partially covered (30% to 70%)

| Module | Lines covered |
|--------|---------------|
| src/converters/writers/musubi-writer.js | 43% |
| src/orchestration/replanning/config.js | 44% |
| src/llm-providers/base-provider.js | 49% |
| src/orchestration/replanning/plan-evaluator.js | 59% |
| src/validators/design-reviewer.js | 63% |
| src/validators/requirements-reviewer.js | 67% |
| src/validators/delta-format.js | 69% |

### Covered despite the gap report (75%+)

plan-monitor, replan-history, alternative-generator, workflow-mode-manager,
constitution-level-manager, constitutional-compliance, guardrail-rules, code-rules, ears,
project-files, profile-checks, paths, skill-guardrails.

## Priorities

1. `src/cli/init-helpers.js` and `src/cli/init-generators.js`: largest real gap and the first
   place new init options land. Test before extending.
2. `src/generators/changelog-generator.js` and `src/cli/validate-articles.js`: small, pure,
   cheap to cover.
3. LLM providers and `github-client.js`: need network mocks; cover when touched.
4. `speckit-writer.js` / `musubi-writer.js`: cover alongside any converter change.

## Requirements side

`musubi-gaps detect` reported 0 requirement gaps only because `storage/specs/` holds two old
spec files. Rerun it once real EARS specs exist for new features.

---

*Baseline recorded manually from a jest coverage run; `musubi-analyze` quality metrics not yet
regenerated for v6.3.1.*
