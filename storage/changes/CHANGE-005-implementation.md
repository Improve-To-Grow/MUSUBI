# Implementation Report: Claude Code reaches for grep before the code index

## Metadata

- **Change ID**: CHANGE-005
- **Proposal**: [CHANGE-005.md](CHANGE-005.md)
- **Status**: Implemented
- **Implemented**: 2026-10-08
- **Implemented By**: Yaroslav (with Claude Code)
- **Profile**: `cli` (`steering/project.yml`: `core_paths: [src]`, `delivery_paths: [bin]`)
- **Type**: Enhancement (agent instructions, Claude Code templates, code index hook)
- **Baseline**: commit `1610689` on `chore/scip-typescript-replace-codegraph`
- **Approval**: `musubi-change approve Change-005` (2026-10-08, 16:15 UTC). The CLI stored the
  delta record under the mixed-case ID, in `storage/changes/Change-005/`; it is left as created
  and normalised to `CHANGE-005` at archive time. Its status was set to `implemented` by hand
  (2026-10-08T16:38Z), as for CHANGE-003; no `musubi-change` command sets it.

Claude Code is now pointed at `musubi-code` for symbol questions in three places. The managed
"Code Navigation" section and the `code-references` skill cover definition, existence and export
questions and say "before grep". The Claude Code SDD templates and this repository's steering look
up code in the index first. A synchronous PreToolUse hook adds a note whenever a Grep or a shell
grep searches for a name that the index defines. All of this was verified live in this session.

## Feature Flag

Not created. The hook is installed by `musubi-code setup`, and removing its `PreToolUse` entries
turns it off (proposal, Migration Steps).

## Commits

Two commits, as planned:

1. `3ac90dc` `feat(code-index): index-first instructions and grep reminder hook (CHANGE-005)`
   — 11 files, code index library and CLI, skill template, guide, CHANGELOG `### Added` and the
   first two `### Changed` entries. Committed during `/sdd-change-apply`. In CHANGE-004 the
   maintainer committed; if that is preferred here too, `git reset --soft HEAD~1` turns it back
   into staged changes.
2. **Staged, awaiting the maintainer**:
   `docs(harness): index-first steps in Claude Code templates and steering (CHANGE-005)`. It holds
   the 6 Claude Code templates and their `.claude/` copies, the `musubi-code setup` refresh
   (`CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.claude/skills/code-references/SKILL.md`),
   4 steering files, `tests/code-navigation-guidance.test.js`, the third CHANGELOG `### Changed`
   entry and the change records. Hash recorded at archive time.

Both are fork-only (`musubi-code` does not exist upstream).

## Changes Applied

### ADDED

- `src/code-index/hint.js`: `parseSearches()` reads the Grep tool input and grep, rg, git grep
  and Select-String in Bash and PowerShell commands (quotes, `-e`, `--include`, `-g`, `-t`, `--`,
  redirections; a grep at the end of a pipe without paths is skipped). `symbolNames()` reduces a
  pattern to names or returns null for text. `runHint()` returns the hook JSON or `''` and never
  throws.
- `bin/musubi-code.js`: `musubi-code hint --hook [--command <cmd>] [--root <dir>]`.
- `query.definitionNames(model)`, written by `indexer.build()` to `.scip/names.json`
  (`NAMES_VERSION` 1).
- `indexer.coversDirectory()`; `indexer.resolveHookRoot` exported.
- `tests/code-index/hint.test.js` (29 tests) and `tests/code-navigation-guidance.test.js` (14).

### MODIFIED

- `src/code-index/setup.js`: `instructionSection()` writes a question → command table;
  `hookGroups()` returns groups per event and adds the PreToolUse entries; `OWN_HOOK_PATTERN`
  also matches `hint --hook`; `mergeHookSettings()` appends several groups per event.
- `src/code-index/indexer.js`: `writeNames()` after each build; a missing `names.json` makes
  `getFreshness()` report `stale`.
- `src/code-index/query.js`: `isAliasBinding()` extracted from `findEntities()` and shared.
- `src/templates/code-index/SKILL.md`: description (1,007 of 1,536 characters), table rows,
  hook paragraph.
- Claude Code templates and their `.claude/` copies: `sdd-change-init.md` (step 2 and worked
  example, plus "record which facts came from the index"), `sdd-change-apply.md` (step 5.1),
  `sdd-change-archive.md` (step 5.3: `dependents` before removal), `sdd-requirements.md`
  (brownfield research and Tool Usage), `change-impact-analyzer/SKILL.md` (Phase 2),
  `change-impact-analyzer/impact-analysis-template.md` (Finding Dependencies).
- This repository, by `musubi-code setup` (second run: all unchanged): `CLAUDE.md`, `AGENTS.md`,
  `.claude/settings.json`, `.claude/skills/code-references/SKILL.md`.
- Steering: `tech.md` ("Code Navigation" section), `structure.md` ("Navigating the Code"),
  `rules/workflow.md` (Stage 5 input; Stage 5.5 commands now `musubi-code`, plus `symbols`; DO
  and DON'T entries), `memories/suggested_commands.md` ("Code Navigation" block).
- `docs/guides/scip-typescript.md`: definition questions, "Grep reminder" section, setup table,
  troubleshooting row, and the corrected "Developing MUSUBI itself" note (see Deviations).
- Tests: `tests/code-index/setup.test.js`, `tests/code-index/integration.test.js`.
- `CHANGELOG.md`: `### Added` (grep reminder) and three `### Changed` entries under
  `[Unreleased]`.

### REMOVED

None.

## Deviations from the Proposal

**`hint --command`.** Not in the proposal. Setup with a custom `--command` (for example
`node bin/musubi-code.js`) writes `… hint --hook --command "<cmd>"`, so the note names the command
that the project actually uses.

**Class fields are left out of the names list.** The proposal said "as `refs` finds them", and
`refs` also lists class fields (`this.name = …`). With them, the list had 1,414 entries for
`name` and 1,190 for `type`, and a grep for ordinary words would have triggered a note. The list
keeps classes, functions, methods, module-level variables and exported properties: 3,106 names,
525 KB on this repository. `config`, `name`, `id`, `fs` and `path` no longer match, while
`ErrorHandler`, `checkEarsFormat` and `MUSUBI_INSTALL_COMMAND` do.

**Compound commands are covered.** The proposal listed as a risk that `if: "Bash(grep *)"` might
not match `cd x && grep …`. The live check shows that it matches.

**Guide note corrected.** `docs/guides/scip-typescript.md` "Developing MUSUBI itself" still said
that this repository runs `node bin/musubi-code.js`. Since 2026-10-08 it calls the global,
npm-linked `musubi-code`. The note now says so.

**One existing assertion changed.** `tests/code-index/setup.test.js` expected the old wording
`` `node bin/musubi-code.js refs <Name>` ``; the table now says `` `… refs X` ``.

**Test count.** The proposal expected 172 suites with about 4,920 tests. The suite has 172 suites
and 4,931 tests.

## Test Results

RED before each commit's changes:

- Commit 1: `npx jest tests/code-index`: `hint.test.js` could not load (`Cannot find module
'../../src/code-index/hint'`), 6 failed tests in `setup.test.js` and `integration.test.js`.
- Commit 2: `npx jest tests/code-navigation-guidance.test.js`: 13 of 14 failed. The identical
  copies check passed already.

GREEN, with `npx jest --coverage` on the full suite (2026-10-08):

| Metric      | Result                    | Baseline `1610689` (CHANGE-004 record) |
| ----------- | ------------------------- | -------------------------------------- |
| Test suites | 172 passed, 172 total     | 170                                    |
| Tests       | 4931 passed, 4931 total   | 4885                                   |
| Statements  | 78.47% (threshold 60%) ✅ | 78.31%                                 |
| Branches    | 66.92% (threshold 45%) ✅ | 66.61%                                 |
| Functions   | 83.05% (threshold 60%) ✅ | 82.89%                                 |
| Lines       | 79.29% (threshold 60%) ✅ | 79.13%                                 |

- `src/code-index/hint.js`: 92.13% statements, 83.46% branches, 100% functions, 95.71% lines
  (target 90%). Not covered: `writeNames()`'s error path, which writes an empty list when the
  model cannot be loaded. Triggering it needs a corrupt index; follow-up.
- `npm run lint`: clean. Prettier: every JS file of this change passes. `npm run format:check`
  does not run on Windows, because its single-quoted globs reach Prettier literally. Run with
  unquoted globs, it flags 374 untouched files for their CRLF working-copy line endings. Both
  predate this change.

### Live verification (Claude Code, this session, hooks hot-loaded after `musubi-code setup`)

| Call                                                                                   | Note added |
| -------------------------------------------------------------------------------------- | ---------- |
| Grep tool, `\bPatternRegistry\b` in `src/orchestration`                                | yes        |
| Bash `grep -rln "PatternRegistry" src/orchestration`                                   | yes        |
| Bash `cd /d/Code/MUSUBI && grep -rln "PatternRegistry" src/orchestration \| head -3`   | yes        |
| Bash `git grep -n "PatternRegistry" -- src/orchestration/index.js`                     | yes        |
| PowerShell `Select-String -Pattern 'PatternRegistry' -Path src\orchestration\index.js` | yes        |
| Bash `grep -rn "TODO: remove" src/code-index` (text)                                   | no         |

The skill listing refreshed in the same session and showed the new trigger terms.

Other checks:

- Hook latency through the global CLI: 0.22–0.23 s per call (limit 0.5 s).
- `musubi-code setup` run twice: the first run updated 4 files, the second reported all unchanged.
- The existing index had no `names.json` and turned `stale`. The asynchronous PostToolUse hook
  rebuilt it on its own and wrote the list (Migration Steps, step 1).

## Traceability Matrix

| Requirement | Design                                    | Implementation                                                        | Tests                                                                  | Status |
| ----------- | ----------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------ |
| REQ-NAV-001 | Managed section, question → command table | `src/code-index/setup.js` `instructionSection()`                      | `setup.test.js` "maps symbol questions to commands"                    | ✅     |
| REQ-NAV-002 | Precedence and grep scope                 | `instructionSection()`                                                | same test                                                              | ✅     |
| REQ-NAV-003 | Skill description and table               | `src/templates/code-index/SKILL.md`                                   | `setup.test.js` "skill description … listing cap"                      | ✅     |
| REQ-NAV-004 | Index first, grep fallback                | 6 Claude Code templates and `.claude/` copies                         | `code-navigation-guidance.test.js` (10 tests)                          | ✅     |
| REQ-NAV-005 | `names.json`, `hint --hook`, registration | `hint.js`, `indexer.js`, `query.js`, `setup.js`, `bin/musubi-code.js` | `hint.test.js`, `integration.test.js`, `setup.test.js` hook assertions | ✅     |
| REQ-NAV-006 | Silent cases, exit 0, 0.5 s               | `hint.js` `runHint()`, `coversIndex()`                                | `hint.test.js` "stays silent …", "never throws", "within 0.5 s"        | ✅     |
| REQ-NAV-007 | Steering texts                            | 4 steering files                                                      | `code-navigation-guidance.test.js` (4 tests)                           | ✅     |

## Code Navigation

The facts used during implementation came from the index first:

- `musubi-code deps src/code-index/query.js`: it requires `indexer.js`, so the indexer loads
  `query.js` lazily in `writeNames()` to avoid a load-time cycle.
- `musubi-code dependents` of `src/code-index/query.js` and `src/code-index/indexer.js`: the
  callers of the changed exports (`bin/musubi-code.js`, `bin/musubi-upgrade.js`, `setup.js`, tests).
- `musubi-code symbols` of `bin/musubi-code.js`, `src/code-index/query.js` and
  `src/code-index/indexer.js`; `musubi-code refs instructionSection` (one caller).
- grep was used for text: the grep steps in templates, steering and `.claude/`, and the CHANGELOG
  layout.

## Constitutional Compliance

- **Profile**: `cli` (from `steering/project.yml`)
- ✅ Article I: Testable Core: the hint logic is in `src/code-index/hint.js` and tested without
  the CLI or Claude Code; `bin/musubi-code.js` only reads stdin and prints.
- ✅ Article II: Automation Interface: `musubi-code hint --hook` uses the JSON-in, JSON-out
  contract of `index --hook`; `--help` lists it.
- ✅ Article III: Test-First: RED observed before both commits' changes (above), GREEN after.
- ✅ Article IV: EARS Format: REQ-NAV-001 to 007 as in the proposal.
- ✅ Article V: Traceability: matrix above.
- ✅ Article VI: Project Memory: steering updated (`tech.md`, `structure.md`, `workflow.md`,
  `memories/suggested_commands.md`).
- ✅ Article VII: Simplicity: one new module and one subcommand, no new dependency.
- ✅ Article VIII: Anti-Abstraction: Claude Code's hook JSON is used directly.
- ✅ Article IX: Integration-First: the integration test builds a real index, reads the real
  `names.json` and runs the real CLI. The live check ran in Claude Code itself.

## Follow-ups

- **Other agents' templates**: the Copilot prompts (`src/templates/agents/github-copilot/`, also
  installed in `.github/prompts/`) and the Cursor, Codex, Windsurf, Gemini CLI and Qwen Code
  templates keep the old `grep -r` steps.
- **Steering refresh** (`/sdd-steering`): `tech.md` and `structure.md` still contain template
  placeholders (React, Vue, `lib/`, `app/`, `components/`).
- **Names list noise**: 12 entries named `exports`. They are object properties called `exports`
  on lines that `isExportDefinition()` reads as exports, which is an existing quirk of that check.
- **Test `writeNames()`'s error path** (coverage note above).
- **`format:check` on Windows**: the quoting and line-ending issues above.
- **Measure the effect**: on the next `/sdd-change-init`, note how often a note appears and
  whether the analysis starts with the index (proposal Risks, last row).

## Deployment Readiness

- [x] Feature flag: not applicable
- [x] Documentation updated (`docs/guides/scip-typescript.md`, steering)
- [x] CHANGELOG entries added (`[Unreleased]`)
- [x] Live verification in Claude Code
- [ ] Commit 2: staged, awaiting the maintainer
- [ ] Version bump / release notes: decide at release time
- [x] Rollback plan: `git revert` of both commits, then remove the PreToolUse `hint --hook`
      entries from `.claude/settings.json` and run `musubi-code setup` (proposal, Rollback Plan)
