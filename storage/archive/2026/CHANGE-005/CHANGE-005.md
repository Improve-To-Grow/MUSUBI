# Claude Code reaches for grep before the code index

**Change ID**: CHANGE-005  
**Date**: 2026-10-08  
**Status**: ~~Proposed~~ → ~~Approved~~ → ~~Implemented~~ → **Archived**  
**Approved**: 2026-10-08 (maintainer, `musubi-change approve Change-005`; the CLI stored the
delta record as `storage/changes/Change-005/`, normalised to `CHANGE-005` at archive)  
**Implemented**: 2026-10-08 (commits `3ac90dc` and `b4c6797` on
`chore/scip-typescript-replace-codegraph`; see
[CHANGE-005-implementation.md](CHANGE-005-implementation.md))  
**Archived**: 2026-10-08 (`storage/archive/2026/CHANGE-005/`, see
[CHANGE-005-archive.md](CHANGE-005-archive.md))  
**Type**: Enhancement (agent instructions, Claude Code templates, code index hook)  
**Priority**: P2  
**Baseline**: commit `1610689` on `chore/scip-typescript-replace-codegraph` (not yet merged into
`ITG-adjustments`)  
**Origin**: CHANGE-004 analysis (2026-10-08). Symbol questions (where `ErrorHandler`,
`PatternRegistry` and `checkEarsFormat` are defined, whether a plugin system exists, where a name is
exported) were first answered with grep. Re-running them with `musubi-code refs`, `symbols`,
`callers` and `dependents` confirmed the results and also found `MUSUBI_INSTALL_COMMAND`, which grep
had missed. The maintainer reports that Claude Code skills still skip the index often.  
**Decisions** (maintainer, 2026-10-08):

- Fix the wording at its source: the generator of the managed "Code Navigation" section, the
  `code-references` skill template, and the Claude Code SDD templates. Then refresh this
  repository from them, and add the rule to this repository's steering.
- Add a non-blocking reminder hook for grep searches of indexed names.
- Deleting `AGENTS.md` and the GitHub Copilot files is **out of scope**. The Copilot install
  (`AGENTS.md`, `.github/AGENTS.md`, `.github/prompts/`) was detected correctly for this workspace
  and stays, and so does the Copilot wording inside `.claude/`.

## Description

Make `musubi-code` the first tool that Claude Code uses for symbol questions in projects with a
code index, and keep grep for text. A symbol question is about a class, function, method,
constant or module: does it exist, where is it defined, what does a file export, who references,
calls, instantiates or requires it, and which files depend on a file.

There are four reasons Claude still greps:

1. **The guidance covers usages only.** The managed "Code Navigation" section (`CLAUDE.md:42-59`,
   `AGENTS.md:55-69`, written by `instructionSection()`) and the `code-references` skill
   description cover "who calls, uses, instantiates or requires X" and "what depends on this
   file". Neither says that the index also answers "does X exist", "where is X defined" or "what
   does this file export", and those were the questions that went to grep in CHANGE-004.
   `musubi-code refs` already answers them. Each result starts with kind and definition site
   (`checkEarsFormat (function) src/constitutional/ears.js:75`). For an absent name it prints
   `No definition named "EARSValidator" in the index.`
2. **The SDD commands and skills prescribe grep.** 10 lines in 6 Claude Code templates tell the
   agent to grep for code. They are installed unchanged in `.claude/` (table below), and they
   include step 2 of `/sdd-change-init`, the command that produced the CHANGE-004 analysis. While
   a command runs, its step-by-step text is the most recent and most specific instruction, and it
   says `grep -r`.
3. **Steering does not mention the index.** Every SDD command and all 25 MUSUBI skills read
   `steering/tech.md` and `steering/structure.md` first, and neither mentions `musubi-code`.
   `steering/rules/workflow.md:292-294` lists it only for code review, with the superseded
   `node bin/musubi-code.js` invocation.
4. **Nothing acts when Claude makes the call.** The code index hooks only rebuild the index, and
   they run asynchronously. Grep, as the built-in tool or in a shell, is Claude Code's
   general-purpose search. An instruction that loads at session start has to win against that
   habit on every search.

Not in scope:

- **Copilot and AGENTS.md files** (decision above): `AGENTS.md`, `.github/AGENTS.md`,
  `.github/prompts/` (9 files) and `.claude/AGENTS.md` are not deleted. The "Copilot agent that
  assists with…" descriptions of 13 skills and the "Instructions for GitHub Copilot" / `#sdd-*`
  text in 3 commands stay. `AGENTS.md` still receives the reworded managed section (Current
  State). Claude Code does not load AGENTS.md files when a CLAUDE.md exists (default "Project
  instructions" setting), so `.claude/AGENTS.md` does not compete with `CLAUDE.md`.
- **Templates of other agents.** `src/templates/agents/{github-copilot,cursor,codex,windsurf,gemini-cli,qwen-code}`
  contain the same grep steps. Their instruction files receive the new managed section through
  `musubi-code setup`, but their command templates are not changed, and the hook is Claude Code
  only. Follow-up.
- **Generic steering text.** Parts of this repository's steering are still template placeholders:
  `steering/tech.md` lists React, Vue and Next.js, and the "Root Structure" in
  `steering/structure.md` shows `lib/`, `app/` and `components/`, which do not exist. This change
  only adds the navigation rule. Refreshing steering (`/sdd-steering`) is a follow-up.
- **Text checks stay grep.** These checks match text rather than look up symbols: requirement IDs
  (`sdd-validate.md:423-424`, traceability-auditor), EARS keywords (`sdd-change-apply.md:616`),
  and the I-3 / I-L6 import-rule checks (`sdd-validate.md:95`, `:104`, `sdd-change-apply.md:600`,
  constitution-enforcer scripts). They also apply to languages that the index does not cover.

## Current State

### What Claude reads about code search

| Source                                                                                           | In context                            | What it says                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md` "Code Navigation" (managed by `instructionSection()`, `src/code-index/setup.js:152`) | session start                         | "Use these commands instead of grep for questions such as who calls, uses, instantiates or requires X"; last section of the file                                           |
| `.claude/skills/code-references/SKILL.md` (rendered from `src/templates/code-index/SKILL.md`)    | description always, body when invoked | trigger terms for usages, references and dependents only; no definition, existence or export terms; description is 803 of the 1,536 characters Claude Code lists per skill |
| `.claude/commands/sdd-*.md` (identical to `src/templates/agents/claude-code/commands/`)          | while a command runs                  | `grep -r` for related code (next table)                                                                                                                                    |
| `.claude/skills/*` (25, identical to their templates)                                            | while a skill runs                    | change-impact-analyzer: grep for usages and importers                                                                                                                      |
| `steering/tech.md`, `steering/structure.md`                                                      | first step of every command and skill | nothing                                                                                                                                                                    |
| `steering/rules/workflow.md:292-294`                                                             | when read                             | `node bin/musubi-code.js refs`, `deps`, `dependents`, under Stage 5.5 Code Review only                                                                                     |
| `steering/memories/suggested_commands.md`                                                        | steering skill                        | nothing (generic placeholder commands)                                                                                                                                     |
| `.claude/settings.json` hooks                                                                    | SessionStart, PostToolUse             | `musubi-code index --hook`, `async: true`, rebuild only                                                                                                                    |

### Symbol lookups prescribed as grep

Paths are relative to `src/templates/agents/claude-code/`. Each file is installed unchanged under
`.claude/`.

| Location                                                        | Text                                                        | Question                            | Index command                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------- | --------------------------------------------------- |
| `commands/sdd-change-init.md:53-54`                             | `grep -r "{{related-feature}}" src/` (and `lib/`)           | where the affected code is          | `refs`, `symbols`, `dependents`; grep for the words |
| `commands/sdd-change-init.md:541`                               | worked example `grep -r "authentication" src/`              | same                                | same                                                |
| `commands/sdd-change-apply.md:284`                              | `grep -r "{{existing-function}}" lib/`                      | where a function is and who uses it | `refs {{ExistingFunction}}`                         |
| `commands/sdd-change-archive.md:223`                            | `grep -r "from '@/lib/{{deprecated-feature}}'" .`           | who imports a module being removed  | `dependents <file>`                                 |
| `commands/sdd-requirements.md:63`                               | `grep -r "{{feature}}" src/`                                | existing implementation             | `refs`, `symbols`; grep for the words               |
| `commands/sdd-requirements.md:419`                              | Tool Usage: "**Grep**: Search for existing implementations" | (tool list)                         | add `musubi-code` before Grep                       |
| `skills/change-impact-analyzer/SKILL.md:296-297`                | `grep -r "User" src/ --include="*.ts"` (and `"login"`)      | affected files                      | `refs User`, `dependents <file>`                    |
| `skills/change-impact-analyzer/impact-analysis-template.md:212` | `grep -r "import.*from.*'./changed-file'" src/`             | importers of a file                 | `dependents src/changed-file.ts`                    |

Against these 10 grep lines, the index appears in 3 places: the managed section, the skill and
`workflow.md`.

### Hooks

- `hookGroups()` (`src/code-index/setup.js:110`) writes SessionStart and PostToolUse entries for
  `musubi-code index --hook`, both `async: true`. Claude Code discards the output of async hooks,
  including `additionalContext`, so these hooks cannot carry a reminder.
- A `refs` query loads the 23 MB `.scip/index.scip` and takes about 1.1 s on this repository. The
  CLI itself starts in about 0.2 s (`musubi-code --version`). A hook that runs before each grep
  must not load the index.

### Copilot install and the managed section

`detectAgents()` finds `claude-code` and `github-copilot` in this repository, so
`musubi-code setup` writes the managed section to both `CLAUDE.md` and `AGENTS.md`. Both receive
the reworded section. Setup replaces the text between `<!-- musubi-code:start -->` and
`<!-- musubi-code:end -->` on every run, including `musubi upgrade`. Hand edits inside the markers
are therefore lost, so the wording has to change in `instructionSection()`.

## Requirements Changes

### ADDED

- REQ-NAV-001: The Code Navigation section that `musubi-code setup` writes into an agent
  instruction file SHALL state that symbol questions are answered with `musubi-code` before grep,
  and SHALL map these questions to commands: whether a symbol exists and where it is defined
  (`refs`), what a file defines or exports (`symbols`), who references, calls or instantiates a
  symbol (`refs`, `callers`), and what a file depends on and what depends on it (`deps`,
  `dependents`).
- REQ-NAV-002: The Code Navigation section SHALL state that the rule also applies where an SDD
  command, prompt or skill says to grep for code. It SHALL limit grep to text that the index does
  not cover: Markdown, templates, configuration, comments, string-keyed lookups and dynamic
  `require()` paths, plus one search for the name as a string before a rename or deletion.
- REQ-NAV-003: The `code-references` skill description SHALL include trigger terms for
  definition, existence and export questions, and SHALL be at most 1,536 characters long.
- REQ-NAV-004: The Claude Code SDD command and skill templates SHALL direct symbol and
  file-dependency lookups to `musubi-code` when the project has a code index, and to grep when it
  has none. The copies installed in this repository's `.claude/` SHALL stay identical to their
  templates.
- REQ-NAV-005: WHEN Claude Code is about to run the Grep tool, or a Bash or PowerShell command that
  starts with `grep`, `rg`, `git grep` or `Select-String`, and the search pattern names one or more
  definitions in the code index, the code index PreToolUse hook SHALL add context that lists the
  matching definitions with kind and location and gives the `musubi-code refs` command for each
  name. It SHALL neither block nor approve the call.
- REQ-NAV-006: IF the definition-name list is missing or unreadable, or the pattern is not made of
  identifiers only, or the search is limited to paths or file types that the index does not
  cover, THEN the hook SHALL add nothing. In every case it SHALL exit with code 0 and return
  within 0.5 s on this repository.
- REQ-NAV-007: This repository's steering (`steering/tech.md`, `steering/structure.md`,
  `steering/rules/workflow.md`, `steering/memories/suggested_commands.md`) SHALL name
  `musubi-code` as the tool for symbol questions and SHALL invoke it as `musubi-code`.

### MODIFIED

<!-- None. The code index feature (commit 3da9d34) has no recorded requirements; REQ-NAV-001 to
REQ-NAV-003 now cover its instruction text. -->

### REMOVED

<!-- None -->

### RENAMED

<!-- None -->

## Design Changes

### ADDED

- **Definition-name list.** After each successful build, the indexer writes `.scip/names.json`.
  It maps each definition name (`Name` and `Owner.member`) to kind and `file:line`, taken from the
  same model that `refs` uses, so the hook and `refs` agree. Object-literal properties are
  excluded, as in `refs` without `--include-properties`. If the list is missing, the index counts
  as stale, so the next SessionStart or PostToolUse hook builds it for existing indexes.
- **`musubi-code hint --hook`** (`src/code-index/hint.js`, CLI in `bin/musubi-code.js`). It reads
  the PreToolUse JSON from stdin and extracts the pattern: `tool_input.pattern` for Grep; for Bash
  and PowerShell, the first pattern argument of `grep`, `egrep`, `rg`, `git grep` or
  `Select-String [-Pattern]` in `tool_input.command`, with quotes removed and `-e` handled. It then
  normalises the pattern. It removes `\b`, `\<`, `\>`, `^` and `$`, and a leading `class`,
  `function`, `async function`, `const`, `let`, `var`, `exports.` or `module.exports.`, together
  with the whitespace or `\s+` / `\s*` after it. It also removes a trailing `(` or `\(` and
  surrounding group parentheses. It splits on `|`, and every part must be an identifier or
  `Owner.member`; otherwise it is a text search and the hook stays silent. The hook stays silent
  when `path` lies outside the index roots or when `glob` / `type` selects only non-JS/TS files
  (`*.md`, `*.yml`, `*.json`, …). If a part names a definition in `.scip/names.json`, the hook
  prints the following and exits 0:

  ```json
  { "hookSpecificOutput": { "hookEventName": "PreToolUse", "additionalContext": "…" } }
  ```

  Context text (at most 5 definitions):

  ```
  musubi-code: ErrorHandler is defined in the code index.
    ErrorHandler (class) src/orchestration/error-handler.js:613  ->  musubi-code refs ErrorHandler
  refs gives the definition, exports and every reference, compiler-resolved. Keep grep for text:
  Markdown, templates, comments, string-keyed lookups.
  ```

  Without `permissionDecision`, the call goes through the normal permission flow. The hook does
  not approve it.

- **Hook registration** in `hookGroups()`: synchronous PreToolUse entries (`timeout: 10` seconds;
  no `async`, because Claude Code discards async output):
  - matcher `Grep`: `musubi-code hint --hook`
  - matcher `Bash`: the same command, once each with `"if": "Bash(grep *)"`, `"Bash(rg *)"` and
    `"Bash(git grep *)"`
  - matcher `PowerShell`: `"if": "PowerShell(Select-String *)"`

  The `if` filter uses Claude Code's permission-rule syntax, and the hook process is spawned only
  for matching calls, so other shell commands get no extra latency. `OWN_HOOK_PATTERN` also
  matches `hint --hook`, so running setup again replaces these entries and keeps every other hook.

### MODIFIED

- `instructionSection(command, forClaude)` writes the new section (draft in the Appendix) between
  the same markers. `upsertSection()` is unchanged, so setup and upgrade replace the old section in
  place in `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` and `QWEN.md`. As before, only `CLAUDE.md` names
  the skill and the hooks.
- `code-references` skill template: description and command table gain the definition, existence
  and export questions (draft in the Appendix). "Workflow for changes" and "Limits" are unchanged.
- Claude Code SDD templates (the 10 lines above): each symbol or file-dependency lookup becomes
  "code index first, grep for words and for projects without an index". The project has an index
  when its CLAUDE.md has a "Code Navigation" section. Pattern in the Appendix.

### REMOVED

<!-- None -->

## Code Changes

### ADDED

- `src/code-index/hint.js`: pattern extraction and normalisation, name lookup, hook output.
- `tests/code-index/hint.test.js`, written first (REQ-NAV-005, REQ-NAV-006): Grep, Bash and
  PowerShell inputs; the pattern forms above (`ErrorHandler`, `\bErrorHandler\b`,
  `class ErrorHandler`, `ErrorHandler|PatternRegistry`, `UserService.save`); text patterns
  (`TODO:`, `require\('x'\)`, `foo bar`); paths and globs outside the index; a missing or corrupt
  `names.json`; exit code 0 and no `permissionDecision` in every case; latency on this repository.
- `tests/code-navigation-guidance.test.js`, written first (REQ-NAV-004, REQ-NAV-007): every lookup
  step in the table above names a `musubi-code` command next to its grep fallback; the 9 commands
  and the change-impact-analyzer skill in `.claude/` are identical to their templates; the four
  steering files name `musubi-code refs` and do not contain `node bin/musubi-code.js`.
- `CHANGELOG.md`: `### Added` (hint hook, names list) and `### Changed` (instruction text, skill,
  SDD templates) under `[Unreleased]`.

### MODIFIED

Code and tests:

- `src/code-index/setup.js`: `instructionSection()`, `hookGroups()`, `OWN_HOOK_PATTERN`.
- `src/code-index/indexer.js`: write `names.json` after `build()`, and report the index as stale
  in `getFreshness()` when the list is missing.
- `bin/musubi-code.js`: `hint --hook` command.
- `tests/code-index/setup.test.js` (REQ-NAV-001 to REQ-NAV-003): section text for `CLAUDE.md`
  and `AGENTS.md`; skill description terms and length; PreToolUse groups (synchronous, with `if`);
  older hook forms replaced and foreign hooks kept.
- `tests/code-index/integration.test.js`: `names.json` after a real build; `hint --hook` through
  the CLI with stdin.

Templates and documentation:

- `src/templates/code-index/SKILL.md`.
- `src/templates/agents/claude-code/commands/`: `sdd-change-init.md`, `sdd-change-apply.md`,
  `sdd-change-archive.md`, `sdd-requirements.md`; `skills/change-impact-analyzer/`: `SKILL.md`,
  `impact-analysis-template.md`.
- `docs/guides/scip-typescript.md`: "Using it" covers the definition and existence questions;
  "How it works" covers the reminder hook and `names.json`.

This repository (refreshed with `musubi-code setup` from the templates, or copied):

- `CLAUDE.md` and `AGENTS.md`: managed section only.
- `.claude/skills/code-references/SKILL.md`, `.claude/settings.json` (PreToolUse entries).
- `.claude/commands/` (4 files) and `.claude/skills/change-impact-analyzer/` (2 files): identical
  to the templates.
- Steering (draft in the Appendix): `steering/tech.md` (new "Code Navigation" section),
  `steering/structure.md` ("Navigating the Code" under Directory Organization),
  `steering/rules/workflow.md` (Stage 5 input, Stage 5.5 commands, Best Practices),
  `steering/memories/suggested_commands.md` ("Code Navigation" block).
- `storage/changes/change-log.md`: CHANGE-005 row.

Not modified: the Copilot install files apart from the managed section in `AGENTS.md`; the
templates of other agents; the SDD library and the other CLIs.

### REMOVED

<!-- None -->

### RENAMED

<!-- None -->

## Impact Analysis

### Affected Components

- Code index (`src/code-index/`, `bin/musubi-code.js`): one new module and command, plus a names
  list next to the index.
- What `musubi init`, `musubi upgrade` and `musubi-code setup` write into JavaScript and TypeScript
  projects: instruction section, skill, hooks. Without `--no-code-index`, existing projects receive
  them on their next upgrade.
- Claude Code SDD templates that `musubi init` installs. Existing projects keep their copies until
  they re-run `musubi init` (as in CHANGE-004, `musubi upgrade` does not refresh templates).
- This repository's harness and steering.
- Not affected: the SDD library, the other CLIs, and the Copilot prompts and agent definitions.

### Breaking Changes

- [x] No breaking changes
- [ ] Breaking changes (list below)

The new hook adds about 0.2-0.3 s to Grep calls and to shell commands that start with a grep tool,
in projects that run setup. It never blocks, never approves, and stays silent when it cannot
help.

### Migration Steps

1. Existing projects: run `musubi upgrade` or `musubi-code setup` to get the section, skill and
   hook. The next index build writes `names.json`, and a missing list makes the index stale, so
   the SessionStart hook builds it.
2. Updated SDD command and skill text: re-run `musubi init` for Claude Code and confirm the
   overwrite prompt, or copy the six files.
3. To turn the reminder off, remove the PreToolUse entries from `.claude/settings.json` and use
   `musubi upgrade --no-code-index` afterwards (setup re-adds its hooks).

### Risks

| Risk                                                                                                  | Probability | Impact | Mitigation                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | ----------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reminders for names grepped as text (a constant called `config`, a word that is also a function name) | Medium      | Low    | Only patterns made entirely of identifiers; paths and file types outside the index are skipped; the note is advisory                               |
| The `if` filter does not match grep inside a compound command (`cd x && grep …`)                      | Medium      | Low    | The Grep tool is covered regardless; check live during implementation and record the result in `docs/guides/scip-typescript.md`                    |
| Hook latency on large projects                                                                        | Low         | Low    | The hook reads `names.json` only, never the index; REQ-NAV-006 sets a 0.5 s limit, measured in the test                                            |
| Template text confuses projects without an index (non-JS, or setup declined)                          | Low         | Low    | Every rewritten step keeps grep as the fallback "without a code index"                                                                             |
| Claude Code changes hook semantics (`additionalContext`, `if`)                                        | Low         | Medium | Behaviour taken from the Claude Code hooks documentation on 2026-10-08 and verified live during implementation; if it fails, the hook stays silent |
| Instructions still lose against habit                                                                 | Medium      | Medium | The hook acts on each call, independent of instructions; measure on the next `/sdd-change-init` and record it in the implementation record         |

## Testing

### Test Changes

- [x] Unit tests: `tests/code-index/hint.test.js` (new), `tests/code-index/setup.test.js`
      (extended), `tests/code-navigation-guidance.test.js` (new).
- [x] Integration tests: `tests/code-index/integration.test.js`, with a real index build of a
      fixture project, `names.json`, and `hint --hook` through the CLI.
- [ ] E2E tests: not applicable. The live Claude Code check is manual (Verification Commands).

Expected counts: 170 suites / 4,885 tests (CHANGE-004 implementation, 2026-10-08) become 172
suites / about 4,920 tests.

### Test Coverage

- Current: 78.31% statements, 66.61% branches, 82.89% functions, 79.13% lines (CHANGE-004
  implementation record). The thresholds in `jest.config.js` are 60 / 45 / 60 / 60.
- Target: new code in `src/code-index/hint.js` at 90% or more; thresholds unchanged.

### Verification Commands

```bash
# Suites first, then the full suite, lint and format
npx jest tests/code-index tests/code-navigation-guidance.test.js
npm test -- --coverage && npm run lint && npm run format:check

# Refresh this repository; a second run reports every file unchanged
musubi-code setup && musubi-code setup

# Hook by hand: a definition name gives context, a text pattern gives nothing
echo '{"tool_name":"Grep","tool_input":{"pattern":"\\bErrorHandler\\b"}}' | musubi-code hint --hook
echo '{"tool_name":"Grep","tool_input":{"pattern":"TODO: remove"}}' | musubi-code hint --hook

# No superseded invocation left in steering (prints nothing)
grep -rn "node bin/musubi-code.js" steering
```

Live check in Claude Code (manual, recorded in the implementation record): in a new session, ask
"where is ErrorHandler defined?" and run a Grep for `PatternRegistry`, a `grep -rn PatternRegistry
src` in Bash, and `cd src && grep -rn PatternRegistry .`. Note which calls received the reminder.

## Traceability

### Requirements → Design → Code → Tests

- REQ-NAV-001, REQ-NAV-002 → new managed section → `instructionSection()`; `CLAUDE.md`,
  `AGENTS.md` → `tests/code-index/setup.test.js` section text
- REQ-NAV-003 → skill description and table → `src/templates/code-index/SKILL.md` →
  `tests/code-index/setup.test.js` skill terms and length
- REQ-NAV-004 → "index first, grep fallback" steps → 6 Claude Code templates and their `.claude/`
  copies → `tests/code-navigation-guidance.test.js` templates
- REQ-NAV-005, REQ-NAV-006 → `names.json`, `hint --hook`, PreToolUse registration → `hint.js`,
  `indexer.js`, `setup.js`, `bin/musubi-code.js` → `tests/code-index/hint.test.js`,
  `integration.test.js`, `setup.test.js` hook groups
- REQ-NAV-007 → steering texts → 4 steering files → `tests/code-navigation-guidance.test.js`
  steering

## Implementation Plan

Two commits, both fork-only (`musubi-code` does not exist upstream):

1. `feat(code-index): index-first instructions and grep reminder hook (CHANGE-005)`: tests first
   (observed failing), then `hint.js`, `names.json`, setup, skill template, guide, CHANGELOG.
2. `docs(harness): index-first steps in Claude Code templates and steering (CHANGE-005)`: tests
   first, templates, `musubi-code setup` on this repository, `.claude/` copies, steering, change
   log.

## Rollback Plan

- Pre-change state: commit `1610689`.
- Whole change: `git revert` of the two commits, then remove the PreToolUse `hint --hook` entries
  from `.claude/settings.json` by hand. The reverted setup no longer recognises them as its own
  and would leave them in place, pointing at a command that no longer exists. Then run
  `musubi-code setup` to restore the previous section and skill.
- No data migration. `.scip/names.json` is in the ignored `.scip/` directory.

## Constitutional Compliance

Profile: `cli` (`steering/project.yml`, `core_paths: [src]`, `delivery_paths: [bin]`).

- Article I (Testable Core): the hint logic lives in `src/code-index/hint.js` and is tested
  without the CLI or Claude Code; `bin/musubi-code.js` only reads stdin and prints.
- Article II (Automation Interface): `musubi-code hint --hook` uses the same JSON-in, JSON-out
  contract as `index --hook`.
- Article III (Test-First): both new suites and the setup assertions are written first and
  observed failing before code and template changes.
- Article IV (EARS): REQ-NAV-001 to 004 and 007 use the ubiquitous `SHALL` pattern, REQ-NAV-005
  `WHEN`, REQ-NAV-006 `IF … THEN`; no SHOULD, MUST or MAY.
- Article V (Traceability): matrix above; each requirement has a test group.
- Article VI (Project Memory): this change updates steering (`tech.md`, `structure.md`,
  `workflow.md`, `memories/suggested_commands.md`).
- Article VII (Simplicity): one new module and one new CLI subcommand, no new dependency, and a
  JSON list instead of a second index.
- Article VIII (Anti-Abstraction): the hook uses Claude Code's hook JSON directly; no wrapper
  layer.
- Article IX (Integration-First): the integration test builds a real index and runs the real CLI.

## Appendix

### Draft: managed section (`instructionSection()`, Claude Code variant)

```markdown
<!-- musubi-code:start -->

## Code Navigation

Answer symbol questions with `musubi-code` before grep. A symbol question is about a class,
function, method, constant or module in the indexed code: does it exist, where is it defined,
what does a file export, who uses it, what depends on a file.

| Question                                   | Command                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Does `X` exist? Where is it defined?       | `musubi-code refs X`: each result starts with kind and file:line; "No definition named" means absent |
| What does a file define or export?         | `musubi-code symbols <file>`                                                                         |
| Who references, calls or instantiates `X`? | `musubi-code refs X`, `musubi-code callers X`                                                        |
| What does a file load, and what loads it?  | `musubi-code deps <file>`, `musubi-code dependents <file>`                                           |

This also applies where an SDD command, prompt or skill says to grep for code. Use grep for text
that the index does not cover: Markdown, templates, configuration, comments, string-keyed
registries and dynamic `require()` paths. Also grep once for the name as a string before a rename
or deletion. `musubi-code status` lists the indexed directories. The index is compiler-accurate
(scip-typescript, `.scip/`) and is rebuilt first when source files changed.

The `code-references` skill lists all options. Hooks in `.claude/settings.json` keep the index
fresh and add a note when a grep searches for an indexed name.

<!-- musubi-code:end -->
```

For `AGENTS.md`, `GEMINI.md` and `QWEN.md` the last paragraph is omitted, as today.

### Draft: `code-references` skill description

```yaml
description: |
  Compiler-accurate code navigation for this JavaScript/TypeScript project using a scip-typescript index:
  definitions, exports, references, callers, `new X()` instantiations, `extends`, `require()`/import sites,
  and file dependencies/dependents, resolved across files (including CommonJS `module.exports = { X }`).

  Trigger terms: where is X defined, does X exist, is X exported, what does this file export, find definition,
  who calls, who uses, who instantiates, who requires, who imports, find references, find usages, callers,
  call sites, dependents, dependencies, impact of changing, safe to delete, dead code, where is X used,
  rename, blast radius

  Use when: any question about a class, function, method, constant or module in the indexed code: whether it
  exists, where it is defined or exported, where it is used, or how files depend on each other. Use it before
  grep, also when an SDD command or skill says to grep for code. Use grep only for strings, comments,
  Markdown, templates and dynamic lookups.
```

New table rows: "Does a symbol exist, where is it defined → `musubi-code refs UserService` (first
line of each result)" and "What a file defines or exports → `musubi-code symbols user.js`".

### Draft: SDD template step (`sdd-change-init.md` step 2; the others follow the same pattern)

````markdown
```bash
# Symbols (classes, functions, modules): use the code index when CLAUDE.md has a
# "Code Navigation" section (JavaScript/TypeScript projects set up with musubi-code)
musubi-code refs {{RelatedSymbol}}          # definition, exports and every reference
musubi-code dependents {{path/to/module}}   # files that load it

# Words and text the index does not cover, and projects without a code index
grep -rn "{{related-feature}}" src/ lib/ docs/
```
````

### Draft: steering

`steering/tech.md`, new section after "Development Environment":

```markdown
## Code Navigation

| Tool                                                                                                           | Use for                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `musubi-code` (scip-typescript 0.4.0; index in `.scip/`; roots `bin`, `src`, `tests`, without `src/templates`) | Symbol questions: does X exist, where is it defined, what a file exports, who references, calls or instantiates X, file dependencies and dependents |
| grep, the Grep tool                                                                                            | Text: Markdown, templates, YAML and JSON, comments, string-keyed registries, dynamic `require()` paths                                              |

Symbol questions go to `musubi-code` first, also inside `/sdd-*` commands and skills. Analysis
records say which facts came from the index and which from grep. Commands: `CLAUDE.md`
"Code Navigation"; guide: `docs/guides/scip-typescript.md`.
```

`steering/structure.md`, under "Directory Organization":

```markdown
### Navigating the Code

`musubi-code` indexes `bin/`, `src/` and `tests/`, but not `src/templates/` or Markdown. Look up
definitions, exports, references and file dependencies with
`musubi-code refs|symbols|callers|deps|dependents` before grepping. Grep the unindexed parts
(`src/templates/`, `docs/`, `steering/`, `storage/`) for text.
```

`steering/rules/workflow.md`:

- Stage 5 Input: add "Code index (`musubi-code`) for definitions and usages".
- Stage 5.5, lines 292-294: `musubi-code refs <Name>` (definition and every reference),
  `musubi-code symbols <file>` (what a file defines and exports), `musubi-code deps <file>` /
  `dependents <file>`.
- Best Practices: DO "✅ Answer symbol questions (exists, defined, exported, used) with
  `musubi-code` before grep"; DON'T "❌ Grep for a class or function name that the code index can
  resolve".

`steering/memories/suggested_commands.md`, new block:

```bash
## Code Navigation
musubi-code refs <Name>          # definition, exports, every reference
musubi-code callers <Name>       # functions that call or instantiate it
musubi-code symbols <file>       # what a file defines
musubi-code deps <file>          # what a file loads
musubi-code dependents <file>    # what loads a file
musubi-code status               # index state and roots
```

### Analysis method

- **Code index (`musubi-code`)**, for symbol facts:
  - `symbols src/code-index/setup.js` and `dependents src/code-index/setup.js`. Setup is used by
    `bin/musubi-code.js`, `bin/musubi-init.js` and `bin/musubi-upgrade.js`, and tested in
    `tests/code-index/setup.test.js`.
  - `refs instructionSection`: one caller, `setupCodeIndex`.
  - `symbols src/constitutional/steering-sync.js`: `updateTechFile` and `updateStructureFile` only
    append entries, so hand-written steering sections survive.
  - `symbols` of `src/code-index/indexer.js`, `src/code-index/query.js` and `bin/musubi-code.js`.
  - `refs checkEarsFormat` and `refs EARSValidator`, for the definition and absence output.
  - `refs ErrorHandler` and `refs PatternRegistry`, for the example locations.
- **grep**, for text in Markdown, templates and configuration, and for path strings:
  - the grep instructions in `.claude/`, `src/templates/agents/claude-code/` and `steering/`;
  - the steering files that each command reads;
  - `AGENTS.md`, `.github/prompts` and `copilot` strings in `src/`, `bin/`, `tests/`, the
    documentation and `.claude/`.
- **cmp / diff**: `.claude/commands/` and all 25 `.claude/skills/` are identical to their
  templates; `.claude/skills/code-references/` matches the rendered code index template.
- **Node, on a scratch copy without the Copilot files**: `detectAgents()` returned only
  `claude-code`, and a `setupCodeIndex(…, { dryRun: true })` changed nothing. This informed the
  scope decision; deleting the Copilot files is now out of scope. The skill description is 803
  characters long.
- **Timing** (Git Bash `time`, 2026-10-08): `musubi-code refs ErrorHandler --no-refresh` 1.1 s,
  `musubi-code --version` 0.2 s, `node -e 0` 0.06 s.
- **Claude Code documentation** (hooks, hooks guide, memory, skills; read 2026-10-08):
  - PreToolUse `hookSpecificOutput.additionalContext` adds context and leaves the normal
    permission flow in place;
  - Claude Code discards the output of `async` hooks;
  - the per-handler `if` filter uses permission-rule syntax (PreToolUse and PostToolUse,
    among others);
  - `timeout` is in seconds;
  - each skill's listing text is capped at 1,536 characters;
  - AGENTS.md files are not loaded when a CLAUDE.md exists (default setting).

  Implementation verifies the hook behaviour live.

### Upstream

Fork-only. `musubi-code`, its setup and its hook exist only in this fork, and the template steps
name `musubi-code`. Nothing here is a candidate for `nahisaho/MUSUBI`.

### References

- Origin: CHANGE-004 analysis (`storage/archive/2026/CHANGE-004/CHANGE-004.md`, Appendix "Analysis
  method")
- Code index: commit `3da9d34`, `docs/guides/scip-typescript.md`, `src/code-index/`
- Predecessor format: `storage/archive/2026/CHANGE-004/CHANGE-004.md`

### Change History

| Version | Date       | Author   | Changes                                                                                                                                     |
| ------- | ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-10-08 | Yaroslav | Initial proposal; decisions recorded: fix in generator and Claude Code templates, reminder hook, Copilot and AGENTS.md removal out of scope |

## Approval

- [ ] Technical review complete
- [ ] Product review complete
- [ ] Security review complete (not needed: the hook reads tool input and a local names list,
      and writes only to stdout)
- [ ] Ready to apply

Approval was recorded through the Status field (Approved, 2026-10-08, `musubi-change approve`);
the checklist above is left as submitted. Implementation and archive records:
`CHANGE-005-implementation.md`, `CHANGE-005-archive.md` and `CHANGE-005-delta.json` (the
`musubi-change` delta record) in the same directory.
