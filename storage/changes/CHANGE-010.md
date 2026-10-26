# Findings of the clean ITG test run of 6.3.1-itg.6

**Change ID**: CHANGE-010  
**Date**: 2026-10-26  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-playbook-steering`, with CHANGE-007 to CHANGE-009, not merged)  
**Approved**: 2026-10-26 (maintainer, in chat: fix the three major findings, then the medium ones)  
**Type**: Bug fix  
**Priority**: P0  
**Release**: `6.3.1-itg.7`

## Description

`6.3.1-itg.6` (commit `479d55a`) was installed in a clean folder and every MUSUBI feature was run in a new ITG project and in an onboarded existing project (2026-10-26). Three findings break the ITG flow: the CI constitution job of a new project fails on its first step, requirement ids with several area segments (the ids `musubi-requirements add` writes) are not recognized by several checks, and `musubi init`, the step `musubi-onboard` recommends next, overwrites the steering that onboard wrote. Four medium findings concern the tsconfig of new applications, the templates and `musubi-tasks add`.

## Decisions (maintainer, 2026-10-26)

| Topic | Decision |
|---|---|
| Scope | The three major and four medium findings. The minor findings stay open (Follow-ups). |
| Release | `6.3.1-itg.7` on the same branch. |

## Requirements Changes

### ADDED

- REQ-ITG-030: `musubi-trace` SHALL create the folder of an `--output` file, so `musubi-trace matrix --output storage/traceability/matrix.md` runs in a project without `storage/traceability/`.
- REQ-ITG-031: Every module that finds requirement ids SHALL use one pattern that accepts one or more area segments (`REQ-001`, `REQ-RSVP-001`, `REQ-MEETING-RSVP-001`): Article V of `musubi-validate project`, `musubi-gaps`, `musubi-change`, `musubi-trace`, the traceability extractor, the critic system, the requirements reviewer, the delta format validator, the issue resolver, the steering reference validator, the requirements and design generators and the GUI. `musubi-change` SHALL report a malformed id instead of dropping the item, and `musubi-gaps` SHALL count the tests next to the code.
- REQ-ITG-032: `musubi init` SHALL keep the steering files that exist (`structure.md`, `tech.md`, `product.md`, `project.yml`), report them, and SHALL default the project name to the `name` in `package.json`.
- REQ-ITG-033: WHERE the profile is `application`, `musubi init` SHALL write the Next.js `tsconfig.json` with `strict`, bundler resolution and the `@/*` alias (ITG-GIT-04).
- REQ-ITG-034: The design and tasks templates SHALL name no requirement id until the author writes one; their example ids are `REQ-<AREA>-NNN` placeholders, and the tasks template fills the area in upper case.
- REQ-ITG-035: `musubi-tasks add` SHALL run without prompts when every detail is given as an option, and SHALL prompt only for the missing ones.

## Implementation

- **Trace output:** `bin/musubi-trace.js` writes every `--output` file with `fs.outputFile`.
- **Requirement ids:** `src/traceability/req-id.js` (`REQ_ID_SOURCE`, `reqIdPattern`, `isReqId`) used by `src/validators/constitutional-validator.js` (also `.tsx`, `.mjs`, `.cjs` and `.spec` tests), `src/analyzers/gap-detector.js` (`###` headings, `getTestFiles` in the code folder too), `src/managers/change.js`, `src/analyzers/traceability.js`, `src/traceability/extractor.js`, `src/validators/critic-system.js`, `src/validators/requirements-reviewer.js`, `src/validators/delta-format.js`, `src/resolvers/issue-resolver.js`, `src/steering/advanced-validation.js`, `src/generators/requirements.js`, `src/generators/design.js` and `src/gui/services/traceability-service.js`.
- **Init and onboarded steering:** `writeSteeringTemplates` returns the kept files (`src/cli/init-steering.js`); `generateSteering` keeps `project.yml` and `readPackageName` gives the default name (`bin/musubi-init.js`).
- **tsconfig:** `NEXT_TSCONFIG` and `LIBRARY_TSCONFIG` in `src/cli/init-generators.js`.
- **Templates:** `src/templates/shared/documents/design.md` and `tasks.md`; the upper-case id area in `src/generators/tasks.js`.
- **Tasks:** the `add` options of `bin/musubi-tasks.js`.

## Verification

- New tests: `tests/cli/musubi-trace-output.test.js`; `tests/traceability/req-id.test.js`; multi-segment ids in `tests/validators/constitutional-validator.test.js`, `tests/analyzers/gap-detector.test.js` and `tests/managers/change.test.js`; kept steering in `tests/itg/init-steering.test.js`; `tests/cli/init-tsconfig.test.js`; template ids in `tests/generators/tasks.test.js` and `tests/generators/design.test.js`; `tests/cli/musubi-tasks-add.test.js`.
- `musubi-onboard` then `musubi init` with this branch's code in a temporary project: `project.yml` and `tech.md` stay as onboard wrote them, the name defaults to `legacy-portal`, and init reports the four kept steering files.

## Follow-ups

- **Minor findings of the run:** `musubi-gui status` counts the checklist items of requirements and design documents as tasks; `musubi-trace requirement` and `impact` link every ADR and every task of a document; `musubi-release status` prints git's "fatal: No names found"; `musubi-dashboard create` shows "Unknown / N/A".
- **package.json of new applications:** `musubi init` still writes the library `package.json` (Jest, `dist/`) when none exists; an ITG application uses Vitest and Next.js.
- **Release:** tag `v6.3.1-itg.3` to `v6.3.1-itg.7` when the branch is merged.
