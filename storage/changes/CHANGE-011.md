# Starter files that pass the scaffold's CI

**Change ID**: CHANGE-011  
**Date**: 2026-10-26  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-playbook-steering`, with CHANGE-007 to CHANGE-010, not merged)  
**Approved**: 2026-10-26 (maintainer, in chat: fix the five findings of the clean run of 6.3.1-itg.7)  
**Type**: Bug fix  
**Priority**: P1  
**Release**: `6.3.1-itg.8`

## Description

A clean run of `6.3.1-itg.7` (commit `28bebcc`) installed the dependencies of the `package.json` that `musubi init` writes and ran the scaffold's CI jobs in the new project. The constitution job passed, but the other jobs failed on the files MUSUBI writes: `prettier --check .` failed on MUSUBI's own scaffold and agent files, `vitest run` could not resolve the `@/` alias, ESLint had no configuration, knip reported the scaffold's `pg` import and the files the check scripts read, and the dependency ranges were old majors (ESLint 9 is out of support). Two smaller findings: the first requirement added after removing the template's placeholders was numbered 004, and Article V recommended a `coverage-matrix.md` that MUSUBI does not write.

## Requirements Changes

### ADDED

- REQ-ITG-041: The ITG scaffold SHALL include the configuration the CI jobs run with: `.prettierrc.json` and `.prettierignore` (MUSUBI's agent, steering and storage files and build output ignored), `vitest.config.ts` (the `@/` alias, Playwright's `tests/e2e/` excluded, coverage on with the thresholds of the `application` profile), `eslint.config.mjs` (typescript-eslint, eslint-plugin-security over `src/`, `functions/` and `workers/`, the `firebase-admin` restriction of ITG-PLT-14) and `knip.json` (the CI scripts and the files they read as entries, `pg` ignored).
- REQ-ITG-042: The scaffold SHALL NOT write a configuration file when the project has one for the same tool under another name (`.eslintrc.json`, `vite.config.ts`, `.prettierrc` and others), and SHALL append its missing `.gitignore` lines to an existing `.gitignore`, including the files with credentials that `scripts/ci/materialize-config.mjs` writes.
- REQ-ITG-043: Every scaffold file, and the `tsconfig.json` and `package.json` that `musubi init` writes, SHALL pass `prettier --check` with the scaffold's configuration.
- REQ-ITG-044: The `package.json` of a new application SHALL use the current majors that work together (Next.js 16.4.1 or later for OpenNext, TypeScript 6.0 for typescript-eslint, Vitest 5, ESLint 10, knip 6), SHALL list the packages the scaffold configuration loads, and SHALL NOT list packages no code imports yet.
- REQ-ITG-045: `musubi-requirements add` SHALL number a requirement after the highest `### REQ-<AREA>-NNN` heading of the file, not after ids in user stories or tables.
- REQ-ITG-046: WHEN the traceability matrix is missing, Article V of `musubi-validate project` SHALL recommend `musubi-trace matrix --format markdown --output storage/traceability/matrix.md`.

## Implementation

- **Scaffold:** `prettierrc.json`, `prettierignore`, `gitignore`, `vitest.config.ts`, `eslint.config.mjs` and `knip.json` in `src/templates/shared/itg-scaffold/`; `github/pull_request_template.md` and `scripts/checks/lib.mjs` formatted.
- **Scaffold writer:** `RENAMED`, `ALTERNATIVES`, `MERGED` and `appendMissingLines` in `src/cli/init-scaffold.js`.
- **package.json and tsconfig.json:** `nextPackageJson` ranges and `toPrettierJson` in `src/cli/init-generators.js`.
- **Ids:** `generateRequirementId` in `src/generators/requirements.js`.
- **Article V:** the recommendation in `src/validators/constitutional-validator.js`.

## Verification

- New tests: `prettier --check .` over the scaffold and the init `tsconfig.json` and `package.json`, configuration kept under another name, `.gitignore` merge (`tests/itg/scaffold.test.js`); the `package.json` dependencies (`tests/cli/init-javascript-files.test.js`); heading-only numbering (`tests/generators/requirements.test.js`); the Article V recommendation (`tests/validators/constitutional-validator.test.js`).
- A new project from `musubi init` with this branch's code and the RSVP sample code, after `npm install` (Next.js 16.4.3, TypeScript 6.0.3, Vitest 5.0.5, ESLint 10.13.0, typescript-eslint 8.72.0, knip 6.43.0): `prettier --check .` and `tsc --noEmit` pass; `eslint .`, `vitest run` and `knip` report only the sample code (two `any` types, coverage of untested stubs below 60%, an unused feature file and exported types); ESLint rejects a `firebase-admin` import in `src/`.

## Follow-ups

- A project with no source file yet fails `tsc --noEmit` (no inputs) and `vitest run` (no test files) until Sprint 0 adds the Next.js app and its first test.
- **Release:** tag `v6.3.1-itg.3` to `v6.3.1-itg.8` when the branch is merged.
