# Findings of the clean ITG test run of 6.3.1-itg.6

**Change ID**: CHANGE-010  
**Date**: 2026-10-26  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-playbook-steering`, with CHANGE-007 to CHANGE-009, not merged)  
**Approved**: 2026-10-26 (maintainer, in chat: fix the three major findings, then the medium ones; then the minor ones and the `package.json` of new applications)  
**Type**: Bug fix  
**Priority**: P0  
**Release**: `6.3.1-itg.7`

## Description

`6.3.1-itg.6` (commit `479d55a`) was installed in a clean folder and every MUSUBI feature was run in a new ITG project and in an onboarded existing project (2026-10-26). Three findings break the ITG flow: the CI constitution job of a new project fails on its first step, requirement ids with several area segments (the ids `musubi-requirements add` writes) are not recognized by several checks, and `musubi init`, the step `musubi-onboard` recommends next, overwrites the steering that onboard wrote. Four medium findings concern the tsconfig of new applications, the templates and `musubi-tasks add`; four minor findings and the `package.json` of new applications were fixed after them.

## Decisions (maintainer, 2026-10-26)

| Topic | Decision |
|---|---|
| Scope | Every finding of the run: three major, four medium and four minor, and the `package.json` that `musubi init` writes for an application. |
| Release | `6.3.1-itg.7` on the same branch. |

## Requirements Changes

### ADDED

- REQ-ITG-030: `musubi-trace` SHALL create the folder of an `--output` file, so `musubi-trace matrix --output storage/traceability/matrix.md` runs in a project without `storage/traceability/`.
- REQ-ITG-031: Every module that finds requirement ids SHALL use one pattern that accepts one or more area segments (`REQ-001`, `REQ-RSVP-001`, `REQ-MEETING-RSVP-001`): Article V of `musubi-validate project`, `musubi-gaps`, `musubi-change`, `musubi-trace`, the traceability extractor, the critic system, the requirements reviewer, the delta format validator, the issue resolver, the steering reference validator, the requirements and design generators and the GUI. `musubi-change` SHALL report a malformed id instead of dropping the item, and `musubi-gaps` SHALL count the tests next to the code.
- REQ-ITG-032: `musubi init` SHALL keep the steering files that exist (`structure.md`, `tech.md`, `product.md`, `project.yml`), report them, and SHALL default the project name to the `name` in `package.json`.
- REQ-ITG-033: WHERE the profile is `application`, `musubi init` SHALL write the Next.js `tsconfig.json` with `strict`, bundler resolution and the `@/*` alias (ITG-GIT-04).
- REQ-ITG-034: The design and tasks templates SHALL name no requirement id until the author writes one; their example ids are `REQ-<AREA>-NNN` placeholders, and the tasks template fills the area in upper case.
- REQ-ITG-035: `musubi-tasks add` SHALL run without prompts when every detail is given as an option, and SHALL prompt only for the missing ones.
- REQ-ITG-036: `musubi-gui status` SHALL count as tasks the `### TASK-NNN` sections and checklist items of task documents, and only the numbered checklist items (`- [ ] TASK-001: ...`) of requirements and design documents.
- REQ-ITG-037: `musubi-trace requirement` and `musubi-trace impact` SHALL link the ADRs, C4 views, tasks and tests whose own section names the requirement id, one entry for a document that names it only elsewhere, and one entry per code file.
- REQ-ITG-038: `musubi-release status` SHALL report a repository without tags without printing git's error output.
- REQ-ITG-039: `musubi-dashboard create`, `advance` and `show` SHALL print the feature, stage and completion of the workflow.
- REQ-ITG-040: WHERE the profile is `application` and the project has no `package.json`, `musubi init` SHALL write one on the ITG stack (Next.js, OpenNext, Vitest, Playwright, ESLint with eslint-plugin-security, Prettier, knip) and `.nvmrc` with Node 22.

## Implementation

- **Trace output:** `bin/musubi-trace.js` writes every `--output` file with `fs.outputFile`.
- **Requirement ids:** `src/traceability/req-id.js` (`REQ_ID_SOURCE`, `reqIdPattern`, `isReqId`) used by `src/validators/constitutional-validator.js` (also `.tsx`, `.mjs`, `.cjs` and `.spec` tests), `src/analyzers/gap-detector.js` (`###` headings, `getTestFiles` in the code folder too), `src/managers/change.js`, `src/analyzers/traceability.js`, `src/traceability/extractor.js`, `src/validators/critic-system.js`, `src/validators/requirements-reviewer.js`, `src/validators/delta-format.js`, `src/resolvers/issue-resolver.js`, `src/steering/advanced-validation.js`, `src/generators/requirements.js`, `src/generators/design.js` and `src/gui/services/traceability-service.js`.
- **Init and onboarded steering:** `writeSteeringTemplates` returns the kept files (`src/cli/init-steering.js`); `generateSteering` keeps `project.yml` and `readPackageName` gives the default name (`bin/musubi-init.js`).
- **tsconfig:** `NEXT_TSCONFIG` and `LIBRARY_TSCONFIG` in `src/cli/init-generators.js`.
- **Templates:** `src/templates/shared/documents/design.md` and `tasks.md`; the upper-case id area in `src/generators/tasks.js`.
- **Tasks:** the `add` options of `bin/musubi-tasks.js`.
- **GUI tasks:** the `numberedOnly` option of `parseTasks` in `src/gui/services/project-scanner.js`.
- **Trace items:** `sectionAt`, `mentions`, `relatedItems` and `relatedTo` in `src/analyzers/traceability.js` (also the full task status and an id column that fits the longest id).
- **Release and dashboard:** git's stderr captured in `bin/musubi-release.js`; the workflow object passed to `formatWorkflowStatus` in `bin/musubi-dashboard.js`.
- **package.json:** `nextPackageJson` and `.nvmrc` in `src/cli/init-generators.js`.

## Verification

- New tests: `tests/cli/musubi-trace-output.test.js`; `tests/traceability/req-id.test.js`; multi-segment ids in `tests/validators/constitutional-validator.test.js`, `tests/analyzers/gap-detector.test.js` and `tests/managers/change.test.js`; kept steering in `tests/itg/init-steering.test.js`; `tests/cli/init-javascript-files.test.js` (tsconfig, package.json, `.nvmrc`); template ids in `tests/generators/tasks.test.js` and `tests/generators/design.test.js`; `tests/cli/musubi-tasks-add.test.js`; checklists of design documents in `tests/gui/project-scanner.test.js`; section links in `tests/analyzers/traceability.test.js`; `tests/cli/musubi-release-status.test.js`; `tests/cli/musubi-dashboard-bin.test.js`.
- `musubi-onboard` then `musubi init` with this branch's code in a temporary project: `project.yml` and `tech.md` stay as onboard wrote them, the name defaults to `legacy-portal`, and init reports the four kept steering files.

## Follow-ups

- **Application starter files:** the Vitest, ESLint, knip and Prettier configuration and the dependency ranges are done in CHANGE-011; `musubi init` writes no Next.js app folder.
- **Release:** tag `v6.3.1-itg.3` to `v6.3.1-itg.7` when the branch is merged (with `v6.3.1-itg.8`, CHANGE-011).
