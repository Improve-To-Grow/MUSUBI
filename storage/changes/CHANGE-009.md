# Independent fork and validation fixes for ITG projects

**Change ID**: CHANGE-009  
**Date**: 2026-10-22  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-playbook-steering`, with CHANGE-007 and CHANGE-008, not merged)  
**Approved**: 2026-10-22 (maintainer, in chat: develop the fork independently, keep the version scheme, start with the P0 fixes)  
**Type**: Governance + Bug fix  
**Priority**: P0  
**Release**: `6.3.1-itg.6`

## Description

A run of every MUSUBI CLI feature in a clean ITG test project (2026-10-22) found that the checks ITG relies on did not work for an ITG project: the CI constitution job checked nothing, the constitution validator could not see TypeScript tests or `storage/`, the EARS validator rejected the format of its own requirements template, and `musubi-trace` did not count tests that sit next to the code. Upstream (`nahisaho/MUSUBI`) has not changed since its v6.3.1 release in January 2026 and closed the fork's last pull request unmerged, so the fork no longer waits for or follows it.

## Decisions (maintainer, 2026-10-22)

| Topic | Decision |
|---|---|
| Upstream | The fork is developed independently: no upstream merges, no upstream pull requests. FORK-07 now states this; the "stay mergeable with upstream" rules are removed from steering. |
| Version scheme | Unchanged: `6.3.1-itg.N`. The base 6.3.1 stays fixed and N counts ITG releases. |
| Branch | `feat/itg-playbook-steering`; a pull request into `ITG-adjustments` when the work is done. |
| Scope | The P0 to P3 findings of the run. |

## Requirements Changes

### ADDED

- REQ-ITG-012: The EARS parser SHALL read requirement ids with several area segments (`REQ-MEETING-RSVP-001`), SHALL skip blank lines after the heading, and SHALL read a statement written over several lines or inside a code fence as one statement.
- REQ-ITG-013: The EARS validator SHALL report an ambiguous word or vague term only as a whole word ("may" is not found in "maybe"), and SHALL accept `WHEN <event>, the <system> SHALL <response>` without `THEN`.
- REQ-ITG-014: `musubi-validate constitution` SHALL count `.ts`, `.tsx`, `.mjs` and `.cjs` test files, SHALL accept Vitest coverage thresholds, and SHALL read requirements from `storage/specs/*-requirements.md` and the matrix from `storage/traceability/`.
- REQ-ITG-015: `musubi-trace` SHALL count `*.test.*` and `*.spec.*` files in the code directory as tests and SHALL NOT count them as code.
- REQ-ITG-016: The constitution job of the scaffold's `ci.yml` SHALL fail on constitution findings and traceability gaps: it regenerates `storage/traceability/matrix.md`, then runs `musubi-validate project` and `musubi-trace ci-check`.
- REQ-ITG-017: `musubi-onboard` SHALL declare the `application` profile with the ITG paths in `steering/project.yml`.
- REQ-ITG-018: WHEN `musubi init` or `musubi-onboard` declares the `application` profile, the system SHALL set `constitution.levels.CONST-007: critical`, so that a file, function or import count over the Article VII limits fails `musubi-validate project` (ITG-GIT-13).
- REQ-ITG-019: WHERE the project has `steering/rules/itg/`, `musubi-validate project` SHALL NOT recommend docker-compose for Article IX, and SHALL report package.json scripts that start the Firebase Emulator (ITG-TST-06).
- REQ-ITG-020: Every scaffold script SHALL print its header comment and exit 0 on `--help`, without doing its work (II-A7).
- REQ-ITG-021: `musubi-requirements add` SHALL load the ESM `inquirer`, SHALL add the requirement without prompts when the pattern, title, system, condition, response and criteria are given as options, SHALL prompt only for the missing ones, and SHALL take the id area from the requirements file name.
- REQ-ITG-022: The `steering/project.yml` that `musubi init` and `musubi-onboard` write SHALL pass `musubi-config validate`; the schema SHALL describe the constitution profile fields, and `musubi-config migrate` SHALL move the fields of the previous init format (`name`, `created`, `tech_stack`) to the schema.
- REQ-ITG-023: `musubi-design trace` SHALL mark a requirement as traced when a design document names its id; `musubi-design add-adr` SHALL append the ADR to the ADR section with the next number, SHALL print that number once, and SHALL run without prompts when every field is given as an option.
- REQ-ITG-024: `musubi-tasks update` SHALL accept the task id with or without `TASK-`.
- REQ-ITG-025: `musubi-validate complexity` SHALL measure TypeScript and ES module files.
- REQ-ITG-026: Every CLI in `bin/` SHALL be listed in the `bin` field of `package.json`.
- REQ-ITG-027: `musubi-change` SHALL treat a proposal made by `init` and its delta spec as one change: `show`, `impact`, `diff`, `list` and `status` SHALL find it in every status, `list` SHALL show its current status, `apply` SHALL mark it implemented, `archive` SHALL move both records to `storage/archive/`, and `validate-all` SHALL accept `CHANGE-NNN` ids.
- REQ-ITG-028: `musubi-gui matrix` SHALL read the requirement ids, designs and tasks where MUSUBI writes them and SHALL link a requirement to every design, task, code and test file that names it; `musubi-gui status` SHALL count the constitution articles and the `### TASK-NNN` tasks.
- REQ-ITG-029: `musubi init` and `musubi-onboard` SHALL record the MUSUBI version in `steering/.musubi-version`, and `musubi-upgrade` SHALL set it to the target version after an upgrade.

## Implementation

- **Steering:** FORK-07 rewritten (independence); FORK-09 no longer argues from upstream; `steering/product.md`, `steering/structure.md`, `steering/tech.md` and `README.md` drop the upstream merge and pull-request rules; the version scheme is described as `6.3.1-itg.N`.
- **EARS:** `src/generators/requirements.js` (`extractStatement`, `findTerms`, multi-segment `REQ_ID`, optional `THEN` after `WHEN`); `src/generators/design.js` (same id pattern).
- **Validators:** `src/validators/constitution.js` (test globs, Vitest thresholds, `storage/specs`, `storage/traceability`); `src/validators/constitutional-validator.js` (matrix in `storage/traceability/`).
- **Traceability:** `src/analyzers/traceability.js` (`findTests(testsDir, codeDir)`, `findCode` skips test files).
- **Onboard and init:** `bin/musubi-onboard.js` writes the `application` profile; `buildConstitutionYml` sets `CONST-007: critical` for it (`src/cli/init-generators.js`).
- **Article IX:** `validateArticleIX` in `src/validators/constitutional-validator.js` checks ITG projects for the Firebase Emulator instead of docker-compose; `vertex` and `gemini` are allowed mock names.
- **Scaffold `--help`:** `printHelp` in `scripts/checks/lib.mjs`; every check and CI script calls it on `--help`.
- **`musubi-requirements add`:** `bin/musubi-requirements.js` (`getInquirer`, the `--system`, `-s`, `-r` and `-c` options, one prompt per missing field, `component` from the file name).
- **Project configuration:** `buildProjectYml` in `src/cli/init-generators.js` (used by `bin/musubi-init.js`); `bin/musubi-onboard.js` (`schema_version`, `package_type`, framework purpose `runtime`); `src/schemas/project-schema.json` (constitution profile fields, `external_specs`, languages); `migrateToV2` in `src/validators/project-validator.js`.
- **Design:** `generateTraceabilityMatrix`, `addADR` and `findADRInsertionPoint` in `src/generators/design.js`; the `add-adr` options and the `trace` table in `bin/musubi-design.js`.
- **Tasks, complexity, bin:** `updateStatus` in `src/generators/tasks.js`; `validateComplexity` in `src/validators/constitution.js` uses `CODE_EXTENSIONS`; `package.json` `bin` lists `musubi-checkpoint`, `musubi-costs` and `musubi-dashboard`.
- **Change management:** `find`, `proposalStatus` and proposals in `list` (`src/managers/delta-spec.js`); real statuses, delta-only changes and the `storage/archive` default in `src/managers/change.js`; `CHANGE-NNN` in `ID_PATTERN` (`src/validators/delta-format.js`); `show`, `impact`, `diff`, `apply`, `archive` and the `list` table in `bin/musubi-change.js`.
- **GUI:** `src/gui/services/traceability-service.js` (id pattern, `storage/design`, `storage/tasks`, `TASK-NNN` sections, code and test mentions); `src/gui/services/project-scanner.js` (Roman-numeral articles, the three storage folders, `TASK-NNN` sections).
- **Upgrade:** `bin/musubi-init.js` and `bin/musubi-onboard.js` write `steering/.musubi-version`; `getCurrentVersion` and the end of the upgrade in `bin/musubi-upgrade.js`.
- **Scaffold and policies:** `ci.yml` constitution job; ITG-CI-01, ITG-GIT-17, ITG-TST-03, the minimum standard of `operations.md` and the development commands of `tech.md` name the real checks.

## Verification

- `npm test`: 179 suites, 5036 tests; 5026 pass. The 10 failures are the scip-python tests that fail the same way on `ITG-adjustments` in this environment.
- New tests: the template format, multi-segment ids and whole-word matching of the EARS parser (`tests/generators/requirements.test.js`); TypeScript tests, Vitest thresholds, `storage/specs` and `storage/traceability` (`tests/validators/constitution.test.js`); the matrix in `storage/traceability/` (`tests/validators/constitutional-validator.test.js`); co-located tests (`tests/analyzers/traceability.test.js`); the `ci.yml` constitution job and the onboard profile (`tests/itg/scaffold.test.js`); `CONST-007: critical` (`tests/cli/init-constitution-profile.test.js`, `tests/itg/init-steering.test.js`); Article IX in an ITG project (`tests/validators/constitutional-validator.test.js`); `--help` of every scaffold script (`tests/itg/scaffold.test.js`); `musubi-requirements add` with options (`tests/cli/musubi-requirements-add.test.js`, which fails on the previous CLI); the init and onboard `project.yml` against the schema and the migration of the old init format (`tests/project-validator.test.js`, `tests/itg/scaffold.test.js`); design trace and ADR insertion (`tests/generators/design.test.js`); `TASK-` ids (`tests/generators/tasks.test.js`); TypeScript in `complexity` (`tests/validators/constitution.test.js`); the `bin` list (`tests/cli/package-bin.test.js`); the `musubi-change` flow (`tests/cli/musubi-change-flow.test.js`, `tests/managers/change.test.js`, `tests/managers/delta-spec.test.js`); the GUI matrix and status on the MUSUBI layout (`tests/gui/traceability-service.test.js`, `tests/gui/project-scanner.test.js`); the upgrade version (`tests/cli/musubi-upgrade-version.test.js`, `tests/itg/scaffold.test.js`).
- `npm run lint` and `npm run format:check` pass.
- In the clean ITG test project of 2026-10-22, with this branch's code: the requirements written in the template's multi-line format validate (5 of 5); `musubi-validate constitution` passes 9 of 9 articles; `musubi-validate project` passes, and fails with a CRITICAL VII-5 finding once a 63-line function is added and `CONST-007: critical` is set; `musubi-trace ci-check` counts the co-located test and fails on the two requirements that have no code or tests.

## Follow-ups (from the same run)

- **Release:** tag `v6.3.1-itg.3` to `v6.3.1-itg.6` when the branch is merged; `ci.yml` installs MUSUBI by that tag.
- **Playbook:** report that §8.1's constitution check is `musubi-validate project` plus `musubi-trace ci-check`, not `musubi validate`.
