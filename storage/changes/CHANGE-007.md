# ITG Software Delivery Playbook as steering templates

**Change ID**: CHANGE-007  
**Date**: 2026-10-12  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented** (branch `feat/itg-playbook-steering`, not merged)  
**Approved**: 2026-10-08 (maintainer, in chat; plan approved before implementation)  
**Type**: Feature / Template change  
**Priority**: P1  
**Baseline**: commit `9b9a2f4` on `ITG-adjustments` (work started on `bcc435d` and was moved onto `9b9a2f4`)  
**Release**: `6.3.1-itg.3`, implements ITG Software Delivery Playbook v2.1

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
| Scaffolding | Moves to a follow-up change: CI check scripts, PR template, `deploy.yml` outline, `.env.example`. |

## Moved onto the latest `ITG-adjustments` (2026-10-12)

The work started on `bcc435d`. Meanwhile `ITG-adjustments` gained CHANGE-003 to CHANGE-005 and the `6.3.1-itg.2` release, so this change was renumbered from CHANGE-003 to CHANGE-006 and releases as `6.3.1-itg.3`. Maintainer decisions taken while combining the two:

- **`.claude/` keeps the framework, not the ITG content.** CHANGE-005 required `.claude/commands` and `.claude/skills` to be byte-identical to the Claude Code templates. Since this change, the templates carry ITG project content (policy pointers, the ITG stack examples), which does not apply to MUSUBI, a Node.js CLI. `.claude/` therefore receives framework changes only (FORK-08). The test checks the index-first steps in both places and that `.claude/` names no ITG policy.
- **All platforms stay in sync.** CHANGE-005's index-first steps were added to Claude Code only. They are now copied to every platform with `npm run sync:commands` (FORK-05). The reason is that switching agents later should need no catch-up. Copilot's own `sdd-requirements` and the gemini-cli `.toml` commands got the same steps by hand.

## Requirements Changes

### ADDED

- REQ-ITG-001: WHEN `musubi init` generates steering, the system SHALL write `steering/structure.md`, `steering/tech.md` and `steering/product.md` from the shared ITG templates, and SHALL copy the ITG policy files to `steering/rules/itg/`.
- REQ-ITG-002: WHEN `musubi init` creates constitutional governance, the system SHALL copy `constitution.md`, `constitution-levels.yml`, `ears-format.md` and `workflow.md` to `steering/rules/`.
- REQ-ITG-003: The `musubi init` profile prompt SHALL default to `application`, with core path `src/lib`, delivery paths `src/app, src/components, src/features, src/middleware` and adapter path `src/lib/auth`.
- REQ-ITG-004: Each ITG policy file SHALL:
  - name the playbook version it implements;
  - cite an existing playbook section for its rules;
  - define unique `ITG-<AREA>-NN` rule ids;
  - express decision logic as Mermaid diagrams.
- REQ-ITG-005: Every skill, every slash command on every platform, and the shared `AGENTS.md` SHALL direct agents to `steering/rules/itg/README.md`.
- REQ-ITG-006: The design command, the design document template and the system-architect skill SHALL draw architecture as Mermaid C4 and decision logic as Mermaid `flowchart`.
- REQ-ITG-007: `musubi-onboard` SHALL install the ITG policy files and add a Deviations table to the generated `tech.md`.

### MODIFIED

- Constitution template, Article VI: project memory includes the delivery policies a project adopts (no new requirement id).

### REMOVED

- `tests/architecture-layers.test.js`: it asserted the language-agnostic layer catalogue of the old `structure.md` template, which the ITG template replaces.

## Implementation

- **Playbook:**
  - `docs/itg/ITG_Software_Delivery_Playbook.md` (v2.1) and `docs/itg/PLAYBOOK_CHANGELOG.md`.
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
  - 28 `SKILL.md` files.
  - 9 commands × 6 markdown platforms, plus 9 Gemini `.toml` files.
  - `agents/shared/AGENTS.md`, `shared/documents/design.md`, `shared/constitution/constitution.md`.
  - Examples moved to the ITG stack.
- **Tests:** `tests/itg/playbook-sync.test.js`, `mermaid-blocks.test.js`, `init-steering.test.js`, `command-copies.test.js`; `tests/cli/init-constitution-profile.test.js`, `tests/init-platforms.test.js` and `tests/code-navigation-guidance.test.js` updated.
- **Sync:** `scripts/sync-commands.js` (`npm run sync:commands`).
- **Repository memory:** `steering/product.md`, `steering/structure.md`, `steering/rules/itg-fork.md`, `CLAUDE.md`.
- **Release:** `package.json` `6.3.1-itg.3`; `CHANGELOG.md`.

## Verification

- `npm test`: 175 suites, 4964 tests, all passing (after the move onto `9b9a2f4`).
- `npm run lint` and `prettier --check` pass.
- All 41 Mermaid blocks in the changed policy, steering and design templates render with Mermaid 11.4.1.
- A temporary project with the ITG steering installed:
  - has no `{{…}}` placeholders left;
  - passes `musubi status`;
  - passes `musubi validate`, with only the expected warnings of an empty project;
  - passes the steering validator, with only the existing project-name heading warning.

## Follow-ups

- **Scaffolding (Appendix C of the playbook):**
  - `scripts/checks/check-route-guards.mjs`, `check-route-logging.mjs`, `check-changelog.mjs`;
  - the PR template;
  - the `deploy.yml` outline;
  - `.env.example`.
- **Generator file names:** the `musubi-requirements`, `musubi-design` and `musubi-tasks` CLI generators write `storage/<kind>/<feature>.md`, while the slash commands and the playbook use the `-requirements` / `-design` / `-tasks` suffixes. Align the generators.
- **Gemini examples:** the Gemini CLI `sdd-implement`, `sdd-tasks` and `sdd-requirements` worked examples still show password hashing. `sdd-implement` has an ITG note saying these are TDD illustrations only. Replace them with ITG examples.
