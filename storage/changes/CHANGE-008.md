# ITG project scaffolding from the playbook appendices

**Change ID**: CHANGE-008  
**Date**: 2026-10-22  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-scaffolding`, on top of `feat/itg-playbook-steering`, not merged)  
**Approved**: 2026-10-22 (maintainer, in chat: scaffolding as its own change after CHANGE-007)  
**Type**: Feature / Template change  
**Priority**: P1  
**Baseline**: `feat/itg-playbook-steering` at `193d4c6` (CHANGE-007, playbook v2.2)  
**Release**: `6.3.1-itg.5`, implements Appendix C of ITG Software Delivery Playbook v2.2

## Description

Playbook v2.2 §3.3 says a new project is initialized with the ITG profile, which includes "the CI check scripts from this playbook". CHANGE-007 installed the policies and steering; this change installs the files of Appendix C and §4.4 so that a new ITG repository starts with them:

- `.env.example` (C.1)
- `.github/pull_request_template.md` (§4.4)
- `.github/workflows/ci.yml` (§8.1), `deploy.yml` (§8.2.1, C.2) and `ci-cleanup.yml` (§7.3, C.2)
- `scripts/checks/`: the eight CI gate scripts of C.3
- `scripts/ci/`: configuration materialization, Worker deploy and `migrate.mjs` (§2.1.3, §3.5, §8.2.1)

## Decisions (maintainer, 2026-10-22)

| Topic | Decision |
|---|---|
| Scope | Appendix C, the PR template and the `scripts/ci/` helpers the deploy workflow calls. Not the application code of §12 of the setup guide (route wrapper, recorders, REST clients): that is project code. |
| When | `musubi init` writes the scaffold when the constitution profile is `application` (every ITG project). `musubi-onboard` writes it into existing projects (maintainer decision, 2026-10-22). Existing files are never overwritten; both report them as kept. |
| Branch | Its own branch on top of `feat/itg-playbook-steering`, so the two changes can be reviewed apart. |

## Implementation decisions (playbook gaps, to report back)

- **Configuration classes come from `.env.example`.** The deploy workflow passes `toJSON(vars)` and `toJSON(secrets)` to `scripts/ci/materialize-config.mjs`, which reads the class (Public, Server configuration, Credentials, CI only) and the readers (application Worker, `workers/log-relay`, `functions/`) from the block headers of the committed `.env.example`, exactly as Appendix C.1 writes them. One source, no second key list.
- **Workers are deployed with `npx wrangler`, not `cloudflare/wrangler-action`.** Server configuration values can contain spaces (`EMAIL_SENDER_NAME`), and the action's single `command` string does not carry them safely; `scripts/ci/deploy-worker.mjs` passes every `--var` as its own argument.
- **Route logging catalogue.** C.3 accepts "the wrapper's automatic event (route id registered in the event catalogue)" without naming the catalogue. `check-route-logging.mjs` reads it from `src/lib/logs/route-events.ts` (a route id quoted there counts) or accepts an explicit `recordAuditEvent` / `recordAppEvent` call.
- **Functions deploy credential.** As the Project Setup Guide v2.2 does, the Functions job authenticates with `FIREBASE_DEPLOY_SERVICE_ACCOUNT`, which the playbook does not name yet.
- **Rules cases are project data.** `check-rules.mjs` sends the fixed cases of §11.6 built from `scripts/checks/rules-cases.json` (tenant upload path, allowed content type, size limit), which the project fills.

## Requirements Changes

### ADDED

- REQ-ITG-008: WHEN `musubi init` runs with the `application` profile, the system SHALL write `.env.example`, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, `deploy.yml`, `ci-cleanup.yml`, the eight scripts of `scripts/checks/` and the three scripts of `scripts/ci/` into the project, and SHALL NOT overwrite a file that already exists.
- REQ-ITG-009: Each check script SHALL exit with status 1 and name the offending file (and line where it has one) when its check fails, and with status 0 otherwise.
- REQ-ITG-010: `scripts/ci/materialize-config.mjs` SHALL route every key of `.env.example` to the deployables its block header names, and SHALL write no CI-only credential to a deployable.
- REQ-ITG-011: WHEN `musubi-onboard` generates steering for an existing project, the system SHALL write the same scaffold as REQ-ITG-008 and SHALL NOT overwrite a file that already exists.

## Implementation

- **Templates:** `src/templates/shared/itg-scaffold/`, stored without leading dots (`env.example`, `github/`) so that packaging keeps them; init writes them as `.env.example` and `.github/`. `{{MUSUBI_TAG}}` in `ci.yml` becomes the tag of the installing version.
- **Code:** `src/cli/init-scaffold.js` (`writeItgScaffold`), called by `bin/musubi-init.js` after the constitution when the profile is `application`, and by `bin/musubi-onboard.js` after the ITG policies.
- **Scripts:** `scripts/checks/lib.mjs` holds the shared helpers (file walk, comment stripping, `git diff` against `BASE_REF`, reporting), so the eight checks repeat no logic (ITG-GIT-14).
- **Policies:** ITG-DEL-03, ITG-LOG-02 and ITG-CI-01 name the scaffold, the route event catalogue and the workflows.
- **Release:** `package.json` `6.3.1-itg.5`; `CHANGELOG.md`.

## Verification

- `tests/itg/scaffold.test.js` (22 tests): `musubi-onboard --auto-approve` in an existing project writes the scaffold and keeps its `.env.example`; init output and the kept-file rule; every check script passing and failing in a real temporary project (`check-changelog` and `check-rules` in a temporary git repository); `materialize-config.mjs` routing for `--deploy`, `--functions` and `--github-env` against the shipped `.env.example`; `deploy-worker.mjs` argv with a fake `npx`; `migrate.mjs` input errors. `.env.example` is checked to equal Appendix C.1 of the playbook copy.
- `npm test`: 179 suites, 5025 tests; 5015 pass, the 10 failures are the scip-python tests that fail the same way on `ITG-adjustments` in this environment.
- `npm run lint`, `npm run format:check`, `node --check` and ESLint (ES modules) over the `.mjs` scripts pass.
- Not verified here: the workflows on GitHub, `wrangler` and `firebase-tools` against real projects, the Security Rules API call of `check-rules.mjs` and `migrate.mjs` against a database. The first ITG project that runs them records what it finds in `documentation/hardening/` (ITG-PLT-03).

## Follow-ups

- `ci-cleanup.yml` calls the project's `npm run ops:cleanup-ci`, which the project writes in Sprint 0 with `scripts/ops/seed-test-users`.
- Report to the playbook: the route event catalogue path, `FIREBASE_DEPLOY_SERVICE_ACCOUNT`, and Workers deployed with `npx wrangler` instead of `cloudflare/wrangler-action`.
