# Implementation Report: Fork package name in library imports

## Metadata

- **Change ID**: CHANGE-004
- **Proposal**: [CHANGE-004.md](CHANGE-004.md)
- **Status**: Implemented
- **Implemented**: 2026-10-08
- **Implemented By**: Yaroslav (with Claude Code)
- **Profile**: `cli` (`steering/project.yml`: `core_paths: [src]`, `delivery_paths: [bin]`)
- **Type**: Bug Fix (documentation and agent templates)
- **Baseline**: commit `451914e` on `chore/scip-typescript-replace-codegraph`
- **Approval**: `musubi-change approve CHANGE-004` (2026-10-08); scope decisions in the proposal
  header

Library examples in the live documentation and agent templates now load
`@improve-to-grow/musubi-sdd`, from modules that exist, with names those modules export. The API
reference and the troubleshooting guide document the project-local install that `require()`
needs. The plugin development guide, which described an API that does not exist, is deleted. Two
test suites guard the result.

## Feature Flag

Not created. The change touches documentation, agent templates and tests only.

## Commits

Two commits, as the proposal's Risks table plans, so that the first can go upstream:

1. **Upstreamable** (unscoped `musubi-sdd`): documented module paths and names, deletion of
   `docs/guides/PLUGIN-DEVELOPMENT.md`, removal of "TypeScript Support" and "Validator
   Extension", the widened REQ-PKG-004 scan with the unscoped name, `tests/helpers/live-documentation.js`,
   CHANGELOG `### Removed` and the first `### Fixed` entry. 15 files.
2. **Fork-only**: the rename to `@improve-to-grow/musubi-sdd` in 27 files, the install
   instructions, the CI/CD guide, `tests/package-name.test.js`, the REQ-PKG-004 scan switched to
   the scoped name, the second CHANGELOG entry and the change records.

Commit hashes: recorded at archive time.

## Changes Applied

### ADDED

- [x] `tests/helpers/live-documentation.js` — the live documentation set of REQ-DIST-001
      (`README.md`, `CONTRIBUTING.md`, `docs/` without its eight record folders, `src/templates/`,
      `.claude/skills/`), shared by both suites ✅
- [x] `tests/package-name.test.js` — 4 tests: package name and `musubi-sdd` command in
      `package.json`; no upstream package name in live documentation, failures as `file:line`
      (REQ-DIST-001); the project-local install command and the fork's package name in the API
      reference "Installation" section and the troubleshooting "Cannot find module" entry
      (REQ-DIST-002) ✅
- [x] `CHANGELOG.md` — `[Unreleased]`: `### Removed` (plugin guide) and two `### Fixed` entries
      (documented imports; fork package name) ✅

### MODIFIED

Tests:

- [x] `tests/index.test.js` (REQ-PKG-004) — scans the live documentation set instead of the API
      reference and templates; matches the package with an optional subpath in
      `const { … } = require(…)[.ns]` and `import { … } from …`; loads subpaths from the repository
      root. One test became four: imports are found, every `require()` / `import()` of the package
      is a quoted name the scan can read, every module loads, every name resolves ✅

Documentation and templates, commit 1:

- [x] Subpaths gain `src/`: `docs/guides/guardrails-guide.md` (7), `orchestration-patterns.md`
      (4), `p-label-parallelization.md` (2) ✅
- [x] Reviewer skills imported from `src/orchestration/builtin-skills`:
      `docs/guides/builtin-skills-usage.md` (3), `requirements-reviewer/SKILL.md` (2),
      `design-reviewer/SKILL.md` (2) templates ✅
- [x] `ErrorHandler` (`incremental-adoption.md`) and `PatternRegistry`
      (`ARCHITECTURE-DEEP-DIVE.md`) imported from `src/orchestration` ✅
- [x] `docs/USER-GUIDE.md` "Validation API": `checkEarsFormat({ content, force: true })` and
      `await new ConstitutionalValidator(projectRoot).validateAll()` ✅
- [x] `docs/API-REFERENCE.md`: "TypeScript Support" removed ✅
- [x] `docs/guides/ARCHITECTURE-DEEP-DIVE.md`: "Validator Extension" removed, later subsections
      renumbered, plugin guide link removed; `INTERACTIVE-TUTORIALS.md`: plugin guide link removed ✅

Documentation and templates, commit 2:

- [x] 80 imports in 27 files load `@improve-to-grow/musubi-sdd`: `docs/API-REFERENCE.md` (17),
      `docs/USER-GUIDE.md` (8), `docs/QUICKSTART.md` (1), 7 guides (32), 6 platform agent templates
      (18), 6 Claude Code skill templates (8), `src/templates/skills/browser-agent.md` (1), 4 installed
      skills under `.claude/skills/` (4, still identical to their templates) ✅
- [x] `docs/API-REFERENCE.md` "Installation": global install for the CLI, project-local install
      for library use, the package name, and the `src/` subpath convention ✅
- [x] `docs/guides/troubleshooting.md`: "Cannot find module '@improve-to-grow/musubi-sdd'" with
      cause and the project-local install ✅
- [x] `docs/guides/ci-cd-integration.md`: GitLab and Jenkins templates downloaded from
      `raw.githubusercontent.com/Improve-To-Grow/MUSUBI/ITG-adjustments/templates/ci-cd/` (both URLs
      return 200; the fork is public); GitHub Actions example calls
      `Improve-To-Grow/MUSUBI/.github/workflows/musubi-reusable.yml@ITG-adjustments` with the
      permissions that workflow declares ✅
- [x] `storage/changes/CHANGE-004.md` status and migration step; `change-log.md` row ✅

Not modified: `src/`, `bin/`, `package.json`, `README.md`, `CONTRIBUTING.md`, `website/`,
`.github/workflows/docs.yml`, historical documents.

### REMOVED

- [x] `docs/guides/PLUGIN-DEVELOPMENT.md` (1,084 lines) ✅

## Deviations from the Proposal

**80 imports, not 81.** The proposal counted 81 imports in 27 files after the guide deletion.
Commit 1 changed the count before the rename: removing "TypeScript Support" and "Validator
Extension" took two imports away and the rewritten USER-GUIDE example added one.

**Migration step 3 was wrong.** The proposal said `musubi-sdd upgrade` refreshes agent templates
in existing projects. It does not: `bin/musubi-upgrade.js` runs version migrations
(`migrateToV620`, `migrateToV621`) and the code-index setup only. Existing projects either edit
the package name by hand or re-run `musubi-sdd init` for the agent and confirm its "Overwrite?"
prompt (`bin/musubi-init.js:125-138`). The proposal and the CHANGELOG say so.

**One more guard test.** The commit 1 edit script replaced the 13 subpaths with a callback that
returned the replacement string unexpanded, so the files read `require($1musubi-sdd/src/…)`. The
widened scan still passed: it skips any import it cannot parse. The 13 lines were repaired before
anything was committed, and REQ-PKG-004 gained the test "loads the package by its quoted name in
every `require()` and `import()`", which flags all 7 broken lines in the faulty
`guardrails-guide.md`. Both commits contain it.

**Expected test count.** The proposal expected about 4,883 tests; the suite has 4,885 (the guard
above and the split of the REQ-PKG-004 test).

## Test Results

Test-first (Article III):

- Commit 1: the widened REQ-PKG-004 scan was run before any document changed: 2 failed, 23 passed.
  The failures were the 15 references to the 5 missing subpaths and the 14 references to the 8
  missing names, as in the proposal's table. After the fixes: 26 passed (with the guard).
- Commit 2: `tests/package-name.test.js` and the scoped REQ-PKG-004 scan were run before the
  rename: 5 failed, 25 passed (REQ-DIST-001 listed 83 lines: 80 imports and 3 `node_modules`
  paths; REQ-DIST-002 failed for both files; REQ-PKG-004 found no scoped imports and flagged the
  unscoped ones). After the change: 30 passed.

Command: `npx jest --coverage` (full suite, 2026-10-08)

| Metric      | Result                    | Baseline `451914e` |
| ----------- | ------------------------- | ------------------ |
| Test suites | 170 passed, 170 total     | 169                |
| Tests       | 4885 passed, 4885 total   | 4878               |
| Statements  | 78.31% (threshold 60%) ✅ | 78.31%             |
| Branches    | 66.61% (threshold 45%) ✅ | 66.62%             |
| Functions   | 82.89% (threshold 60%) ✅ | 82.89%             |
| Lines       | 79.13% (threshold 60%) ✅ | 79.14%             |

No source code changed; the coverage differences are within run-to-run variation.

Proposal verification commands:

- The `grep` for upstream package names in live documentation prints nothing.
- Project-local install, in a scratch project:
  `npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'` records
  `@improve-to-grow/musubi-sdd` as a devDependency; `require('@improve-to-grow/musubi-sdd')` loads
  (59 keys: `ITG-adjustments` does not have CHANGE-003 yet); `require('musubi-sdd')` gives
  `MODULE_NOT_FOUND`.
- The rewritten USER-GUIDE example runs: `checkEarsFormat` returns `[]` for an EARS statement and
  an IV-1 finding for "The login should be fast."; `validateAll()` on this repository reports
  `COMPLIANT`.
- The 4 installed skills are byte-identical to their templates.

Lint and format: `npm run lint` is clean; `npx prettier --check --end-of-line auto` passes on the
three test files. Line endings of every edited document are preserved (CRLF working copy).

Integration and E2E tests: not applicable (no CLI change). Both suites read the real documents
and load the real modules.

## Traceability Matrix

| Requirement            | Design                           | Implementation                                                           | Tests                                             | Status |
| ---------------------- | -------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------- | ------ |
| REQ-DIST-001           | Package name in documentation    | 27 files (commit 2), `docs/guides/ci-cd-integration.md`                  | `tests/package-name.test.js:48`, `:55`            | ✅     |
| REQ-DIST-002           | "Use as a library" install       | `docs/API-REFERENCE.md` "Installation", `docs/guides/troubleshooting.md` | `tests/package-name.test.js:72`                   | ✅     |
| REQ-PKG-004 (modified) | Subpath convention; removed APIs | commit 1 document fixes, `tests/helpers/live-documentation.js`           | `tests/index.test.js:177`, `:181`, `:185`, `:193` | ✅     |

Coverage: 3 requirements, 3 implemented (100%), 3 with automated tests (100%).
`storage/traceability/matrix.yml` was not regenerated: `musubi-trace matrix` reads
`storage/specs/`, which this change does not touch.

## Code Navigation

- `musubi-code dependents tests/helpers/live-documentation.js`: `tests/index.test.js` and
  `tests/package-name.test.js`, using `ROOT`, `liveDocumentation` and `relative`.
- `musubi-code symbols bin/musubi-upgrade.js`: `applyCodeIndexSetup`, `migrateToV620`,
  `migrateToV621` and version helpers; no template refresh (Deviations).
- The analysis behind the proposal (definitions, callers, dependents) is in the proposal's
  appendix.

## Constitutional Compliance

- **Profile**: `cli` (from `steering/project.yml`)
- ✅ Article I: Testable Core — no core change; the documented library interface (I-L3) is usable
  from the fork.
- ✅ Article II: Automation Interface — no CLI change; documentation matches the interface (II-2).
- ✅ Article III: Test-First — RED observed before each commit's changes (2 and 5 failing), GREEN
  after; full suite green; coverage above thresholds.
- ✅ Article IV: EARS Format — REQ-DIST-001, REQ-DIST-002 and the modified REQ-PKG-004 use the
  ubiquitous `SHALL` pattern.
- ✅ Article V: Traceability — matrix above.
- ✅ Article VI: Project Memory — steering unchanged. `steering/structure.md:544` still lists
  `website/`; the website deletion follow-up removes it.
- ✅ Article VII: Simplicity — no new module; one helper shared by two test files; net −1,000
  documentation lines.
- ✅ Article VIII: Anti-Abstraction — not applicable (no code).
- ✅ Article IX: Integration-First — the suites load the real modules and read the real
  documents.

## Follow-ups

- **Delete the documentation website** (decided 2026-10-08): `website/`,
  `.github/workflows/docs.yml`, the `website/` entry in `steering/structure.md:544`.
- **Example methods**: `SkillRegistry.register(...)` and the static `PatternRegistry.register(...)`
  in `docs/guides/ARCHITECTURE-DEEP-DIVE.md` call methods that do not exist in that form.
- **CI/CD guide CLI flags**: `musubi-sdd init --platform …` does not exist; the generator is the
  library class `CICDManager`.
- **Upstream**: commit 1 can be proposed to `nahisaho/MUSUBI` as its own pull request; its
  CHANGELOG hunk sits under the fork's `[Unreleased]` CHANGE-003 entry and needs rebasing there.

## Deployment Readiness

- [x] Feature flag — not applicable
- [x] Documentation updated
- [x] CHANGELOG entries added (`[Unreleased]`)
- [ ] Commits — commit 1 is staged in the index, commit 2 is in the working tree; committing
      awaits the maintainer
- [ ] Version bump / release notes — decide at release time
- [x] Rollback plan — `git revert` of the two commits; pre-change state is `451914e`
