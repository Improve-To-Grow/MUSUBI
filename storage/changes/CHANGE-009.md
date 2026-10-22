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
| Scope | The P0 and P1 findings. The P2 and P3 findings of the same run stay open (Follow-ups). |

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

## Implementation

- **Steering:** FORK-07 rewritten (independence); FORK-09 no longer argues from upstream; `steering/product.md`, `steering/structure.md`, `steering/tech.md` and `README.md` drop the upstream merge and pull-request rules; the version scheme is described as `6.3.1-itg.N`.
- **EARS:** `src/generators/requirements.js` (`extractStatement`, `findTerms`, multi-segment `REQ_ID`, optional `THEN` after `WHEN`); `src/generators/design.js` (same id pattern).
- **Validators:** `src/validators/constitution.js` (test globs, Vitest thresholds, `storage/specs`, `storage/traceability`); `src/validators/constitutional-validator.js` (matrix in `storage/traceability/`).
- **Traceability:** `src/analyzers/traceability.js` (`findTests(testsDir, codeDir)`, `findCode` skips test files).
- **Onboard and init:** `bin/musubi-onboard.js` writes the `application` profile; `buildConstitutionYml` sets `CONST-007: critical` for it (`src/cli/init-generators.js`).
- **Article IX:** `validateArticleIX` in `src/validators/constitutional-validator.js` checks ITG projects for the Firebase Emulator instead of docker-compose; `vertex` and `gemini` are allowed mock names.
- **Scaffold `--help`:** `printHelp` in `scripts/checks/lib.mjs`; every check and CI script calls it on `--help`.
- **`musubi-requirements add`:** `bin/musubi-requirements.js` (`getInquirer`, the `--system`, `-s`, `-r` and `-c` options, one prompt per missing field, `component` from the file name).
- **Scaffold and policies:** `ci.yml` constitution job; ITG-CI-01, ITG-GIT-17, ITG-TST-03, the minimum standard of `operations.md` and the development commands of `tech.md` name the real checks.

## Verification

- `npm test`: 179 suites, 5036 tests; 5026 pass. The 10 failures are the scip-python tests that fail the same way on `ITG-adjustments` in this environment.
- New tests: the template format, multi-segment ids and whole-word matching of the EARS parser (`tests/generators/requirements.test.js`); TypeScript tests, Vitest thresholds, `storage/specs` and `storage/traceability` (`tests/validators/constitution.test.js`); the matrix in `storage/traceability/` (`tests/validators/constitutional-validator.test.js`); co-located tests (`tests/analyzers/traceability.test.js`); the `ci.yml` constitution job and the onboard profile (`tests/itg/scaffold.test.js`); `CONST-007: critical` (`tests/cli/init-constitution-profile.test.js`, `tests/itg/init-steering.test.js`); Article IX in an ITG project (`tests/validators/constitutional-validator.test.js`); `--help` of every scaffold script (`tests/itg/scaffold.test.js`); `musubi-requirements add` with options (`tests/cli/musubi-requirements-add.test.js`, which fails on the previous CLI).
- `npm run lint` and `npm run format:check` pass.
- In the clean ITG test project of 2026-10-22, with this branch's code: the requirements written in the template's multi-line format validate (5 of 5); `musubi-validate constitution` passes 9 of 9 articles; `musubi-validate project` passes, and fails with a CRITICAL VII-5 finding once a 63-line function is added and `CONST-007: critical` is set; `musubi-trace ci-check` counts the co-located test and fails on the two requirements that have no code or tests.

## Follow-ups (from the same run)

- **P2:** `musubi-validate complexity` analyzes no TypeScript; `musubi-design trace` is a stub and `add-adr` writes `ADR-ADR-NNN` at the top of the document; `musubi-tasks update` needs the number without `TASK-`; `musubi-config validate` rejects the `project.yml` that `musubi init` writes; `musubi-checkpoint` and `musubi-costs` are not in the `bin` list.
- **P3:** the `musubi-change` CLI (id format, `show`, `impact`, `archive`); `musubi-gui matrix` against `status`; the `6.0.0` marker of `musubi-upgrade check`.
- **Release:** tag `v6.3.1-itg.3` to `v6.3.1-itg.6` when the branch is merged; `ci.yml` installs MUSUBI by that tag.
- **Playbook:** report that §8.1's constitution check is `musubi-validate project` plus `musubi-trace ci-check`, not `musubi validate`.
