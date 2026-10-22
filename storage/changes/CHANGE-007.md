# ITG Software Delivery Playbook as steering templates

**Change ID**: CHANGE-007  
**Date**: 2026-10-12, updated to playbook v2.2 on 2026-10-22  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-playbook-steering`, not merged)  
**Approved**: 2026-10-08 (maintainer, in chat; plan approved before implementation)  
**Type**: Feature / Template change  
**Priority**: P1  
**Baseline**: `ITG-adjustments` at `a1acbb6`, merged into the branch on 2026-10-22 (work started on `bcc435d`, moved onto `9b9a2f4` on 2026-10-12)  
**Release**: `6.3.1-itg.4`, implements ITG Software Delivery Playbook v2.2

## Description

Make every ITG project start from the ITG Software Delivery Playbook. Agents should apply its policies without being asked. `musubi init` installs the playbook as steering:

- ITG default steering templates
- One policy file per playbook area, with rule ids and Mermaid decision diagrams
- Agent instructions that point to those policies
- Design output as Mermaid C4

Yaroslav's request: "create steering files based on what's described here, so agents pick up those policies automatically", and "Mermaid C4 design diagrams are better for AI to parse, and for humans, than long if/else verbal descriptions of decision trees".

## Decisions (maintainer, 2026-10-08)

| Topic | Decision |
|---|---|
| Scope | The init templates (`src/templates/**`). This repository's own `steering/` only gets maintainer rules (`steering/rules/itg-fork.md`). |
| Platforms | Shared steering, so all seven platforms get it. Every platform's commands point to the policies. |
| Mermaid | In the policy files and steering templates, and in the design generators (`/sdd-design`, design template, system-architect skill). |
| Path conflict | MUSUBI's artifact paths stay. The playbook is corrected (v2.0 → v2.1): `storage/specs/<feature>-requirements.md`, `storage/design/<feature>-design.md`, `storage/tasks/<feature>-tasks.md`, `storage/traceability/matrix.md`. |
| ITG mode | Always on in the fork, with no flag. |
| Scaffolding | Moves to a follow-up change: CI check scripts, PR template, `deploy.yml` outline, `.env.example`. Confirmed again for v2.2 on 2026-10-22: a separate change (CHANGE-008). |

## Updated to playbook v2.2 (2026-10-22)

The branch first implemented a pre-release v2.1 copy (2026-10-08). The canonical playbook moved on to v2.1 (2026-10-13), v2.1.1 and the v2.2 draft (2026-10-19), which the maintainer named the approach MUSUBI must follow. Steps:

- **Merge first.** `ITG-adjustments` was merged into the branch before any v2.2 work, so later merges do not conflict. It had released its own CHANGE-006 (Python code navigation) as `6.3.1-itg.3`, so this change became **CHANGE-007** and releases as **`6.3.1-itg.4`**. `steering/product.md` and `steering/structure.md` take the ITG-adjustments rewrite and add the ITG template layer notes.
- **Playbook copy.** `docs/itg/` holds the canonical v2.2 file and its changelog unchanged. The canonical file has no front matter, so `tests/itg/playbook-sync.test.js` reads the version from the `**Version X.Y` header, the versions table and the `→ vX.Y` changelog heading.
- **Path conflict, again.** v2.2 §3.3 and §5.4 used folder paths (`storage/specs/<feature>/requirements.md`, `matrix.yml`). Maintainer decision (2026-10-22): the playbook is corrected, MUSUBI's paths stay. The correction is made in the canonical v2.2 draft and its changelog in the playbook repository (not committed there by this change) and copied into `docs/itg/`.
- **Policies rewritten** for v2.2. Rule ids keep their topic where the topic still exists, so the references in commands and skills stay valid; ITG-SEC-18 (inbound webhooks) is retired because v2.2 §11.7 covers outbound webhooks only; ITG-SEC-24 (kill switch loader), ITG-LOG-17 (generated audit catalogue) and ITG-TST-12 to ITG-TST-14 (fixed test users, App Check in CI, rules test) are new. The main v2.2 changes they carry: Required and Recommended stack classes; Identity Platform with App Check and reCAPTCHA Enterprise instead of Turnstile; bearer-only sessions with the account-state check; Firestore rules deny all client access, Storage uploads tenant-scoped, reads through signed URLs; Firebase Storage instead of R2; Functions for triggers and schedules only (no Cron Triggers, no HTTP Functions); Neon + Hyperdrive instead of the shared VPS PostgreSQL; three configuration classes; log delivery through a Cloudflare Queue and the log-relay Worker; per-table retention; nonce-based CSP; feature registry and kill switch; GitHub Team rulesets as the production guard; `release/X.Y.Z` branches; CI-applied migrations without `schema.sql`; `itg-restore` for restore tests; `europe-west4` everywhere.
- **Skills (maintainer decision).** The general ITG pointer that 27 skills repeated is removed and those skills are back to their upstream text: the generated agent file already carries the rule, and Claude Code runs skills in the conversation where that file is loaded. The precedence sentence (an ITG policy wins over a skill, a command or a template example) moved into the generated agent block and the shared `AGENTS.md`. `steering` and `system-architect` keep their role-specific ITG content. FORK-09 records the rule.
- **Templates.** `tech.md`, `structure.md` and `product.md`, the design document template, the `/sdd-design`, `/sdd-implement`, `/sdd-change-apply`, `/sdd-validate` and `/sdd-tasks` commands on every platform and the system-architect skill drop what v2.2 removed and use `tenantId`. The default adapter paths of the `application` profile add `src/lib/api`, where v2.2 puts the route wrappers.

## Moved onto the latest `ITG-adjustments` (2026-10-12)

The work started on `bcc435d`. Meanwhile `ITG-adjustments` gained CHANGE-003 to CHANGE-005 and the `6.3.1-itg.2` release, so this change was renumbered from CHANGE-003 to CHANGE-006 and releases as `6.3.1-itg.3`. Maintainer decisions taken while combining the two:

- **`.claude/` keeps the framework, not the ITG content.** CHANGE-005 required `.claude/commands` and `.claude/skills` to be byte-identical to the Claude Code templates. Since this change, the templates carry ITG project content (policy pointers, the ITG stack examples), which does not apply to MUSUBI, a Node.js CLI. `.claude/` therefore receives framework changes only (FORK-08). The test checks the index-first steps in both places and that `.claude/` names no ITG policy.
- **All platforms stay in sync.** CHANGE-005's index-first steps were added to Claude Code only. They are now copied to every platform with `npm run sync:commands` (FORK-05). The reason is that switching agents later should need no catch-up. Copilot's own `sdd-requirements` and the gemini-cli `.toml` commands got the same steps by hand.

## Requirements Changes

### ADDED

- REQ-ITG-001: WHEN `musubi init` generates steering, the system SHALL write `steering/structure.md`, `steering/tech.md` and `steering/product.md` from the shared ITG templates, and SHALL copy the ITG policy files to `steering/rules/itg/`.
- REQ-ITG-002: WHEN `musubi init` creates constitutional governance, the system SHALL copy `constitution.md`, `constitution-levels.yml`, `ears-format.md` and `workflow.md` to `steering/rules/`.
- REQ-ITG-003: The `musubi init` profile prompt SHALL default to `application`, with core path `src/lib`, delivery paths `src/app, src/components, src/features, src/middleware` and adapter paths `src/lib/auth, src/lib/api`.
- REQ-ITG-004: Each ITG policy file SHALL:
  - name the playbook version it implements;
  - cite an existing playbook section for its rules;
  - define unique `ITG-<AREA>-NN` rule ids;
  - express decision logic as Mermaid diagrams.
- REQ-ITG-005 (modified 2026-10-22): The agent file that `musubi init` generates (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, …), the shared `AGENTS.md` and every slash command on every platform SHALL direct agents to `steering/rules/itg/README.md` and SHALL state that an ITG policy wins over a skill, a command or a template example. A skill SHALL carry ITG content only where it is specific to its role (`steering`, `system-architect`); the general pointer is not repeated in skills.
- REQ-ITG-006: The design command, the design document template and the system-architect skill SHALL draw architecture as Mermaid C4 and decision logic as Mermaid `flowchart`.
- REQ-ITG-007: `musubi-onboard` SHALL install the ITG policy files and add a Deviations table to the generated `tech.md`.

### MODIFIED

- Constitution template, Article VI: project memory includes the delivery policies a project adopts (no new requirement id).

### REMOVED

- `tests/architecture-layers.test.js`: it asserted the language-agnostic layer catalogue of the old `structure.md` template, which the ITG template replaces.

## Implementation

- **Playbook:**
  - `docs/itg/ITG_Software_Delivery_Playbook.md` (v2.2 since 2026-10-22) and `docs/itg/PLAYBOOK_CHANGELOG.md`.
  - These are identical to the canonical copies, which were updated in the same change.
- **Policies:** `src/templates/shared/steering/rules/itg/`:
  - `README.md` (index, role → policy map, deviation process);
  - `delivery-lifecycle.md`, `platform.md`, `data.md`, `integrations.md`, `security.md`, `logging.md`, `testing.md`, `git-and-code-quality.md`, `ci-cd-and-release.md`, `operations.md`;
  - 163 rules in total, 25 Mermaid diagrams.
- **Steering templates:** `tech.md`, `structure.md` and `product.md` rewritten from the ITG defaults.
- **Code:**
  - New `src/cli/init-steering.js`.
  - `bin/musubi-init.js`: `generateSteering()`, `createConstitution()`, the profile and adapter prompts, and the ITG block in the generated agent file.
  - `bin/musubi-onboard.js`.
  - `src/cli/init-generators.js` (`defaultApplicationPaths`).
- **Agent templates:**
  - 2 skills with role-specific ITG content: `steering` (ITG steering rules, drift reporting) and `system-architect` (Mermaid C4 rule, ITG example diagram, `c4-model-guide.md`). The other skills stay as upstream ships them (see the 2026-10-22 decision below).
  - 9 commands × 6 markdown platforms, plus 9 Gemini `.toml` files.
  - `agents/shared/AGENTS.md`, `shared/documents/design.md`, `shared/constitution/constitution.md`.
  - Examples moved to the ITG stack.
- **Tests:** `tests/itg/playbook-sync.test.js`, `mermaid-blocks.test.js`, `init-steering.test.js`, `command-copies.test.js`; `tests/cli/init-constitution-profile.test.js`, `tests/init-platforms.test.js` and `tests/code-navigation-guidance.test.js` updated.
- **Sync:** `scripts/sync-commands.js` (`npm run sync:commands`).
- **Repository memory:** `steering/product.md`, `steering/structure.md`, `steering/rules/itg-fork.md`, `CLAUDE.md`.
- **Release:** `package.json` `6.3.1-itg.3`; `CHANGELOG.md`.

## Verification

After the v2.2 update (2026-10-22):

- `npm test`: 178 suites, 5004 tests; 4994 pass. The 10 failures are the scip-python tests of `tests/code-index/python.test.js` and `mixed.test.js`, which fail the same way on `ITG-adjustments` itself in this environment (the Python indexer finds no definitions); they are not caused by this change.
- `tests/itg/` (45 tests) passes against the canonical v2.2 copy: every policy names v2.2, cites only sections that exist in it, and defines every rule id the policies and steering templates reference.
- `npm run lint` and `npm run format:check` pass.
- A temporary project with the ITG steering installed has all eleven policy files and no `{{…}}` placeholders; `musubi validate constitution` reports only the expected findings of an empty project (no tests yet).

Before the v2.2 update (2026-10-12):

- `npm test`: 175 suites, 4964 tests, all passing (after the move onto `9b9a2f4`).
- `npm run lint` and `prettier --check` pass.
- All 41 Mermaid blocks in the changed policy, steering and design templates render with Mermaid 11.4.1.
- A temporary project with the ITG steering installed:
  - has no `{{…}}` placeholders left;
  - passes `musubi status`;
  - passes `musubi validate`, with only the expected warnings of an empty project;
  - passes the steering validator, with only the existing project-name heading warning.

## Follow-ups

- **Scaffolding (CHANGE-008, Appendix C of the playbook v2.2):**
  - the eight check scripts of C.3: `check-route-guards`, `check-route-logging`, `check-function-triggers`, `check-changelog`, `check-audit-catalogue`, `check-feature-registry`, `check-rules`, `check-ai-provider`;
  - the PR template;
  - `.github/workflows/ci.yml`, `deploy.yml` and `ci-cleanup.yml` (C.2);
  - `.env.example` (C.1).
- **Playbook repository:** commit the path correction of v2.2 §3.3 and §5.4 and its changelog row there. The Project Setup Guide v2.2 also asks the playbook to name `FIREBASE_DEPLOY_SERVICE_ACCOUNT` (the credential of the Functions deploy job) in §2.1.3 and C.1; the policies follow the playbook once it decides.
- ~~**Templates not yet on the ITG stack**~~ done 2026-10-22: the `tasks.md` document template (data access through the Firestore REST client, route handlers through `withApiRoute`, integration tests against staging, polling instead of a Redis cache) and the Article IX checklist and tools of the constitution template name the ITG test setup. The IX-2 statement itself is unchanged.
- ~~**Generator file names**~~ done 2026-10-22: the `musubi-requirements`, `musubi-design` and `musubi-tasks` generators write `<feature>-requirements.md`, `<feature>-design.md` and `<feature>-tasks.md`, as the slash commands and the playbook do.
- ~~**Gemini examples**~~ done 2026-10-22: the Gemini CLI `sdd-requirements`, `sdd-tasks` and `sdd-implement` worked examples implement the meeting RSVP feature that `sdd-design` already uses, instead of password hashing and JWT.
