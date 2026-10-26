# OpenNext files in the ITG scaffold

**Change ID**: CHANGE-012  
**Date**: 2026-10-26  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-playbook-steering`, with CHANGE-007 to CHANGE-011, not merged)  
**Approved**: 2026-10-26 (maintainer, in chat: add the ITG versions of `open-next.config.ts`, `next.config.ts` when missing and `wrangler.jsonc` to the scaffold; leave out the jose patch and list it for the playbook)  
**Type**: Feature  
**Priority**: P1  
**Release**: `6.3.1-itg.9`

## Description

The scaffold's CI build job (`opennextjs-cloudflare build`) failed on every new project: OpenNext needs `open-next.config.ts`, a `wrangler.jsonc` and a `next.config`, and neither `musubi init` nor create-next-app writes the first two (tested 2026-10-26). `opennextjs-cloudflare migrate` writes them, but with defaults the ITG stack does not use (an R2 cache and bucket, no staging and production environments, `deploy` scripts that bypass the deploy workflow). The ITG Project Setup Guide v2.2 §10.2 and §15 describe the ITG versions.

## Requirements Changes

### ADDED

- REQ-ITG-048: The ITG scaffold SHALL write `open-next.config.ts` with the OpenNext defaults (no R2 or KV cache) and, when the project has no `next.config`, a `next.config.ts` that calls `initOpenNextCloudflareForDev()` (Project Setup Guide §10.2).
- REQ-ITG-049: The ITG scaffold SHALL write the `wrangler.jsonc` of the Project Setup Guide §15: the Worker names, the staging hostname and the log queue named after the project, the five rate-limit bindings per environment with `<id>` placeholders, the compatibility date of the day, no production routes until the client domain is known and Hyperdrive only as a comment for PostgreSQL projects.
- REQ-ITG-050: WHEN the project has a `next.config` that does not call `initOpenNextCloudflareForDev()`, `musubi init` and `musubi-onboard` SHALL keep it and say that the call is missing; a `wrangler.json` or `wrangler.toml` SHALL keep `wrangler.jsonc` out.
- REQ-ITG-051: The `tsconfig.json` that `musubi init` writes SHALL be the one `next build` of Next.js 16 leaves unchanged, and `.prettierignore` SHALL list `tsconfig.json`, which `next build` and create-next-app write in their own format.

## Decisions (maintainer, 2026-10-26)

| Topic | Decision |
|---|---|
| jose patch | Not added: jose 6 has no `workerd` export condition and builds without it. Listed in `docs/itg/PLAYBOOK_FEEDBACK.md`. |
| Playbook feedback | The points to report to the playbook, so far spread over CHANGE-007 to CHANGE-009, are collected in `docs/itg/PLAYBOOK_FEEDBACK.md`. |

## Implementation

- **Scaffold:** `open-next.config.ts`, `next.config.ts` and `wrangler.jsonc` in `src/templates/shared/itg-scaffold/`; `tsconfig.json` in `prettierignore`; `open-next.config.ts` as a knip entry.
- **Scaffold writer:** the `{{APP_NAME}}` and `{{DATE}}` values (`appName`), the `next.config` and `wrangler` alternatives, and the note of `nextConfigWithoutOpenNext` (`src/cli/init-scaffold.js`); `bin/musubi-init.js` passes the project name and prints the notes, as `bin/musubi-onboard.js` does.
- **tsconfig.json:** `NEXT_TSCONFIG` in `src/cli/init-generators.js` (`jsx: react-jsx`, `.next/dev/types/**/*.ts`, `**/*.mts`).
- **Playbook feedback:** `docs/itg/PLAYBOOK_FEEDBACK.md`.

## Verification

- New tests in `tests/itg/scaffold.test.js`: the parsed `wrangler.jsonc` (names, date, queues, rate limits, no production routes, no Hyperdrive), `open-next.config.ts` and `next.config.ts`, a kept `next.config.mjs` and `wrangler.toml` and the note; the formatting test covers the new files. `tests/cli/init-javascript-files.test.js`: the Next.js 16 tsconfig values.
- Project names of 4 and 60 characters: the written files pass `prettier --check .`.
- In the starter project of CHANGE-011 with a Next.js page and the three files from the scaffold: `opennextjs-cloudflare build` writes `.open-next/worker.js`; `wrangler deploy --dry-run --env staging` and `--env production` list the `LOG_QUEUE` binding (and the five rate limits on staging); `next build` leaves `tsconfig.json` unchanged; `prettier --check .` and `tsc --noEmit` pass and `eslint` and `knip` report only the sample code.

## Follow-ups

- The `<id>` placeholders of `wrangler.jsonc` are filled in Setup Guide step 5 before the first deploy; `wrangler deploy` fails with them.
- create-next-app 16 writes a root `AGENTS.md`; whether `musubi init` for GitHub Copilot or Cursor (which write a root `AGENTS.md` too) keeps it was not checked.
- **Release:** tag `v6.3.1-itg.3` to `v6.3.1-itg.9` when the branch is merged.
