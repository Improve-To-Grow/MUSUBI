# Implementation Report: Code navigation by default, for JavaScript/TypeScript and Python

## Metadata

- **Change ID**: CHANGE-006
- **Proposal**: [CHANGE-006.md](CHANGE-006.md) (v1.1, 2026-10-12)
- **Status**: Implemented
- **Implemented**: 2026-10-12
- **Implemented By**: Yaroslav (with Claude Code)
- **Profile**: `cli` (`steering/project.yml`: `core_paths: [src]`, `delivery_paths: [bin]`)
- **Type**: Feature (code index: Python indexer, mixed projects, mandatory setup, grep guard)
- **Baseline**: commit `9b9a2f4` on `ITG-adjustments`; branch `feat/code-index-python`
- **Approval**: `musubi-change approve CHANGE-006` (2026-10-12, 10:47 UTC); delta record in
  `storage/changes/CHANGE-006/` (status set to `implemented` by hand, 2026-10-12 11:28 UTC, as for
  CHANGE-005; no `musubi-change` command sets it)

Code navigation is now set up without asking in every project with JavaScript, TypeScript or
Python; Python and mixed projects are indexed with scip-python next to scip-typescript, each
language into its own index file; and the grep reminder of CHANGE-005 became a guard that denies a
bare-name grep for an indexed name. Everything was verified live in this session, including the
guard denying this agent's own Grep calls.

## Feature Flag

Not created. The only switch is `musubi-code hint --hook --advisory` in `.claude/settings.json`,
which turns the guard back into the CHANGE-005 note (proposal, Rollback Plan).

## Commits

Four planned commits plus one fix, all on `feat/code-index-python`, fork-only (`musubi-code` does
not exist upstream). Commits 1 to 4 were made during `/sdd-change-apply`, as the first commit of
CHANGE-005 was; `git reset --soft` turns any of them back into staged changes if the maintainer
prefers their own message. The last set is **staged, awaiting the maintainer**.

1. `29c6c1b` `feat(code-index): set up code navigation by default for supported languages (CHANGE-006)`
   — 13 files. `detectLanguages()` replaces `isJavaScriptProject()`; the init question, the
   `--code-index` / `--no-code-index` options and `setup --force` are gone; CLI reference, guide and
   CHANGELOG `### Removed`.
2. `6f534a6` `feat(code-index): index Python with scip-python, mixed projects (CHANGE-006)` — 17
   files. Dependency `@sourcegraph/scip-python` 0.6.6 (exact), language table, per-language build
   and freshness, merged model, Python tags and constructor, environment file, Windows shim,
   src-layout handling, `python.test.js`, `mixed.test.js`, `fixtures.js`, guide and CHANGELOG.
3. `0d846f7` `fix(code-index): index top-level Python files without widening the roots (CHANGE-006)`
   — 5 files. Found on this repository: its root-level `convert-agents-to-skills.py` had made the
   whole project the root (426 JavaScript files instead of 385).
4. `55113ec` `feat(code-index): grep guard denies searches for indexed names (CHANGE-006)` — 9
   files. Deny decision with reason, quoted-name escape, `--advisory`, setup keeps the option,
   guide "Grep guard" section, CHANGELOG.
5. **Staged**: `docs(code-index): language-neutral skill, section and guides (CHANGE-006)` —
   managed section and skill template wording (both languages, quoted name, guard), this
   repository refreshed with `musubi-code setup` (`CLAUDE.md`, `AGENTS.md`,
   `.claude/skills/code-references/SKILL.md`; `.claude/settings.json` unchanged), steering
   (`tech.md`, `structure.md`), `docs/USER-GUIDE.md`, `docs/guides/cli-reference.md`, `README.md`
   (one line; the maintainer's uncommitted SDD Command Flows line is left in the working tree),
   `detectLanguages()` counting root files, `shim.test.js`, extra coverage tests, and the change
   records (proposal status, delta record, change log, this report).

## Changes Applied

### ADDED

- `src/code-index/scip-python-shim.js`: the Windows preload (REQ-IDX-006).
- `src/code-index/indexer.js`: `LANGUAGES` table (`typescript`, `python`: label, tool, extensions,
  markers, indexer package and module, index file), `languageOf()`, `detectLanguages()`,
  `defaultRoots()` with root files, `projectIdentity()`, `withSrcLayoutConfig()`, per-language
  `runIndexer()`, `META_VERSION` 2, `staleLanguages()`, `removeLeftovers()`.
- `src/code-index/query.js`: Python branch of `classifyReference()` (`import`, `extends`,
  `decorator`, `super`, `call`, `ref`), Python modules and `__init__` constructors in
  `describeSymbol()`, `loadModel()` over every index file with the roots post-filter,
  `python (standard library)` in `deps`.
- `src/code-index/hint.js`: `findDefinitions()`, `noteText()`, `reasonText()`; `runHint()` returns
  a deny decision, or the note with `advisory`.
- `src/code-index/setup.js`: `languages` option, `ownHookCommands()`, `--advisory` detection.
- `bin/musubi-code.js`: `status` per language, `index --if-stale` per language,
  `hint --hook --advisory`.
- Tests: `tests/code-index/python.test.js` (12), `mixed.test.js` (5), `shim.test.js` (2),
  `fixtures.js` (shared fixture projects and helpers).
- `package.json`: `"@sourcegraph/scip-python": "0.6.6"` (+24 packages in `package-lock.json`;
  `npm audit --omit=dev` reports 0 vulnerabilities).
- `docs/guides/scip-typescript.md`: "Why scip-typescript and scip-python", "Python projects",
  "Grep guard", "Upgrading the indexers", troubleshooting rows.
- `CHANGELOG.md` under `[Unreleased]`: `### Added` (Python, mixed projects, roots, `pythonArgs`,
  shim, guide), `### Changed` (guard, per-language files, environment file, src layout, setup by
  default), `### Removed` (question and options).

### MODIFIED

- `bin/musubi-init.js`, `bin/musubi.js`, `bin/musubi-upgrade.js`: setup runs for every supported
  language; `musubi init` passes the chosen languages.
- `src/code-index/format.js`: `formatStatus()` per language (`state`, `roots + root files`,
  one line per language with its build), `formatSetup()` names the languages.
- `src/templates/code-index/SKILL.md`: description and title name both languages, Python method
  example, "grep once for the quoted name", the guard paragraph, limits per language.
- Managed section (`instructionSection()`): "dynamic `require()` or `importlib` paths, and once
  for the quoted name (`'Name'`)", "scip-typescript for JavaScript/TypeScript, scip-python for
  Python", and for Claude Code "block a grep that searches only for indexed names, pointing to
  `refs`; quote the name to search it as text".
- `tests/code-index/`: `setup.test.js`, `indexer.test.js`, `integration.test.js`,
  `hint.test.js`, `query.test.js`, `format.test.js` extended or rewritten for the new behaviour.
- Steering: `steering/tech.md` (indexer row names both tools and the root file; the hook blocks),
  `steering/structure.md` (languages, quoted name, guard).
- `docs/USER-GUIDE.md`, `docs/guides/cli-reference.md`, `README.md`: wording.

### REMOVED

- The `musubi init` question and `answers.codeIndex`; `musubi init --code-index`,
  `--no-code-index`; `musubi upgrade --no-code-index`; `musubi-code setup --force`;
  `isJavaScriptProject()`; the single `.scip/index.scip` (replaced by per-language files; an
  existing index is rebuilt once).

### Deviations from the proposal

- **REQ-IDX-010 (src layout)**: the proposal planned to strip the `src.` prefix in the model. That
  cannot work: pyright emits no occurrence at all for an import it cannot resolve, so the
  references from `tests/` never reach the index (verified: the src-layout test failed with an
  empty reference list). The requirement is met at build time instead: when a project has `src/`
  and no pyright configuration of its own, the Python build writes `pyrightconfig.json` with
  `extraPaths: ["src"]` next to `pyproject.toml` for the duration of the indexer run and removes
  it afterwards. A project-owned configuration is never touched (tested). This is the one
  transient write outside `.scip/` (REQ-IDX-005); the guide documents it.
- **REQ-IDX-016 (default roots)**: top-level Python files are indexed as root files next to the
  default roots rather than by making the project root the root, so a stray script does not widen
  the JavaScript index (commit `0d846f7`). `status` prints them after the roots.
- **Third commit scope**: the guard's skill paragraph and the guide section were written in commit
  4 of the plan (`55113ec`) because they describe the hook's own behaviour; the language-neutral
  wording stayed in the staged docs commit.

## Test Results

- Written first and observed failing: 5 tests for commit 1, 27 for commit 2, 6 for the guard, 4
  for the final wording; then implemented to green.
- Full suite (`npm test -- --coverage`, 2026-10-12): **174 suites passed, 4,965 tests passed**
  (CHANGE-005 record: 172 suites). `npm run lint` clean. `npm run format:check` reports every file
  on this Windows checkout because the working copy is CRLF and `.prettierrc` says `lf`
  (pre-existing; CI checks out LF); every changed file passes `prettier --check --end-of-line auto`.
- Coverage, whole project: 78.47% statements, 66.75% branches, 82.88% functions, 79.35% lines
  (thresholds 60 / 45 / 60 / 60; CHANGE-005 record: 78.47 / 66.61 / 82.89 / 79.13).
- Coverage, `src/code-index/` from its own suites (`npx jest tests/code-index --coverage
  --collectCoverageFrom='src/code-index/**/*.js'`, 9 suites, 116 tests): 91.96% statements,
  84.02% branches, 95.85% functions, 93.72% lines. Per file: `setup.js` 98.0, `format.js` 96.5,
  `query.js` 92.7, `hint.js` 92.3, `indexer.js` 89.5 statements (uncovered: lock expiry and
  retry paths, `readStdin`, indexer-missing errors); `scip-python-shim.js` shows 0 because it
  runs in the spawned indexer process; `shim.test.js` exercises it through `node -r`.
- The Python and mixed suites build real scip-python and scip-typescript indexes; on this machine
  the three end-to-end suites take about 45 seconds together.

### Live checks (Claude Code, this session, this repository)

- `musubi-code setup` (global command, npm-linked to this working copy) updated `CLAUDE.md`,
  `AGENTS.md` and the skill, left `.claude/settings.json` unchanged, reported
  "JavaScript/TypeScript, Python", and reported every file unchanged on the second run.
- `musubi-code index --if-stale` rebuilt this repository into the new layout; `status`:
  roots `bin, src, tests + convert-agents-to-skills.py (excluding src/templates)`, 397 files,
  `index.typescript.scip` 396 files (scip-typescript 0.4.0, 15.3 s), `index.python.scip` 1 file
  (scip-python 0.6.6, 1.0 s). `musubi-code refs detectLanguages` answered from the merged model.
- Guard: the Grep tool with pattern `detectLanguages` was denied; the hook's reason (definition
  at `src/code-index/indexer.js:190`, the `refs` command, the quoted-pattern escape) was shown to
  the agent. The Grep tool with pattern `'detectLanguages'` ran. A Bash `grep -rln detectLanguages
  src bin` was denied with "the command is blocked because its grep searches for
  detectLanguages". `musubi-code hint --hook --advisory` returned the note.
- Mixed fixture from the proposal's verification: both index files, `status` with 2 and 4 files,
  the eight cross-language queries, `.venv`, `venv` and `node_modules` absent from the index and
  the count (`mixed.test.js`).

## Constitutional Compliance

- **Profile**: `cli`
- ✅ Article I (Testable Core): language detection, build orchestration, the Python symbol rules
  and the guard live in `src/code-index/` with tests that do not go through the CLI; `bin/` parses
  options and prints.
- ✅ Article II (Automation Interface): every behaviour is reachable through `musubi-code`
  (`setup`, `index`, `status`, queries, `--json`); `index --hook` unchanged; `hint --hook` keeps
  the JSON-in, JSON-out contract and adds the deny decision and `--advisory`.
- ✅ Article III (Test-First): each commit's tests were written first and observed failing.
- ✅ Article IV (EARS): REQ-IDX-001 to 016 and the modified REQ-NAV-001/002/005/006 in the
  proposal.
- ✅ Article V (Traceability): matrix below.
- ✅ Article VI (Project Memory): `steering/tech.md` and `steering/structure.md` updated.
- ✅ Article VII (Simplicity): one new dependency, one 10-line shim, no new CLI command, the
  optional path deleted, one option (`--advisory`) as the rollback switch.
- ✅ Article VIII (Anti-Abstraction): a two-entry language table; both indexers called through
  their CLIs; Claude Code's hook JSON used directly.
- ✅ Article IX (Integration-First): real indexes and the real CLI in `integration.test.js`,
  `python.test.js`, `mixed.test.js`.

## Traceability

| Requirement | Code | Tests |
| --- | --- | --- |
| REQ-IDX-001, 002, 003 | `detectLanguages()`, `setupCodeIndex()` (`languages`), `musubi-init.js`, `musubi.js`, `musubi-upgrade.js` | `setup.test.js` (set up / skipped / selected), `indexer.test.js` (detection), `integration.test.js` (CLI, no options) |
| REQ-IDX-004, 005, 007, 013 | `LANGUAGES`, `listSourceFiles()`, `computeFingerprint()`, `getFreshness()`, `build()`, `runIndexer()`, `pythonArgs()` | `python.test.js` (index file, environment file, meta v2, stale, refresh, leftovers, nothing to index), `mixed.test.js` (per-language rebuild, failing indexer) |
| REQ-IDX-006 | `scip-python-shim.js`, `pythonArgs()` on win32 | `shim.test.js`; every Python build on this Windows machine |
| REQ-IDX-008, 009 | `loadModel()`, `describeSymbol()`, `classifyPythonReference()`, `definitionNames()` | `python.test.js` (refs, callers, deps, dependents, symbols, names.json), `query.test.js` (symbols, tags) |
| REQ-IDX-010 | `withSrcLayoutConfig()` | `python.test.js` (src layout without and with own configuration) |
| REQ-IDX-011 | `hint.js` `SOURCE_TYPES`, `LEADING_KEYWORDS`, `SOURCE_EXTENSIONS` | `hint.test.js` (`def`, `async def`, `*.py`, `py`, `python`) |
| REQ-IDX-012 | `instructionSection()`, `SKILL.md` template, guides | `setup.test.js` (section, skill description and length) |
| REQ-IDX-014, 015, 016 | `loadModel()` merge and post-filter, `ALWAYS_EXCLUDED_DIRS`, `writeGeneratedTsconfig()`, `defaultRoots()`, `statusReport()` | `mixed.test.js`, `indexer.test.js` (roots, root files, exclusions) |
| REQ-NAV-005, 006 (modified) | `reasonText()`, `noteText()`, `runHint()`, `hookGroups()`, `mergeHookSettings()` | `hint.test.js` (deny, escapes, advisory, fail-open, latency), `setup.test.js` (`--advisory` kept), `integration.test.js` (CLI) |
| REQ-NAV-001, 002 (modified) | `instructionSection()`, `SKILL.md`, steering | `setup.test.js`, `tests/code-navigation-guidance.test.js` |

## Next Steps

1. Maintainer: review and commit the staged set (suggested message above), then merge
   `feat/code-index-python` into `ITG-adjustments`.
2. Release: the entries sit under `[Unreleased]` in `CHANGELOG.md`; the next version removes two
   CLI options (`### Removed`).
3. Archive: `/sdd-change-archive CHANGE-006` (by hand into `storage/archive/2026/CHANGE-006/`, as
   for CHANGE-005).
4. Follow-ups noted in the proposal: third-party package resolution for Python (generate the
   environment file from the project's virtualenv), the other agents' command templates
   (CHANGE-005 follow-up), query-side scaling for very large indexes, and ty-scip as a
   replacement for scip-python once it skips non-identifier file names and resolves inferred
   receivers; the language table is the seam for that.
