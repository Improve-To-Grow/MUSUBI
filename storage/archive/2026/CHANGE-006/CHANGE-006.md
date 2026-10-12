# Code navigation by default, for JavaScript/TypeScript and Python

**Change ID**: CHANGE-006  
**Date**: 2026-10-09 (revised 2026-10-12: mixed-project guarantees, grep guard)  
**Status**: ~~Proposed~~ → ~~Approved~~ → ~~Implemented~~ → **Archived**  
**Approved**: 2026-10-12 (maintainer, `musubi-change approve CHANGE-006`; delta record created in
`storage/changes/CHANGE-006/`, archived as [CHANGE-006-delta.json](CHANGE-006-delta.json))  
**Implemented**: 2026-10-12 (commits `29c6c1b`, `6f534a6`, `0d846f7`, `55113ec` and `15e8b27` on
`feat/code-index-python`; see [CHANGE-006-implementation.md](CHANGE-006-implementation.md))  
**Archived**: 2026-10-12 (`storage/archive/2026/CHANGE-006/`, see
[CHANGE-006-archive.md](CHANGE-006-archive.md))  
**Type**: Feature (code index: Python indexer, mixed projects, mandatory setup)  
**Priority**: P1  
**Baseline**: commit `9b9a2f4` on `ITG-adjustments` (6.3.1-itg.2); work branch
`feat/code-index-python`, created from it on 2026-10-09  
**Origin**: feasibility investigation of 2026-10-09 (Claude Code session). Verdict: feasible.
Python and mixed Python/JavaScript indexing can be added to `musubi-code` on top of the current
design with Sourcegraph's `@sourcegraph/scip-python`, which emits the same SCIP format and is itself
an npm package. One real blocker exists (scip-python crashes at startup on Windows) and a working
workaround was verified. All measurements below were taken on the maintainer's Windows 11 machine
on 2026-10-09 (Node 22.14, Python 3.14.2).  
**Decisions** (maintainer, 2026-10-09):

- The question "Set up compiler-accurate code navigation for AI agents?" leaves the `musubi init`
  questionnaire. Code navigation is set up whenever the project uses a supported language
  (JavaScript, TypeScript, Python). Developers do not choose; `--code-index` and `--no-code-index`
  are removed from `musubi init` and `musubi upgrade`.
- Pure Python projects and mixed JavaScript/TypeScript + Python projects are indexed with
  `@sourcegraph/scip-python`, using the tested approach from the investigation (preload shim on
  Windows, `--environment` always passed, per-language index files merged at query time).
- Alternatives (ty-scip 0.1.0, pyrefly-producer, a pyright-LSP crawler) were evaluated and are not
  adopted now: ty-scip aborts on Django-style trees (`migrations/0001_initial.py`, locale
  directories named `is`) and drops calls on inferred receivers; pyrefly-producer ships a macOS
  wheel only; pyright has no index export. The indexer sits behind a per-language adapter so one of
  them can replace scip-python later without touching the query layer.
- Mixed JavaScript/TypeScript + Python projects are a first-class case, not a side effect
  (maintainer, 2026-10-12): both indexers run on the same tree, each on its own file types, the
  query layer answers from one model, and an integration test with a mixed fixture guards it.
  Verified on 2026-10-12 (table in the Description).
- The grep reminder hook from CHANGE-005 becomes a grep guard (maintainer, 2026-10-12): when a
  Grep or shell grep searches only for names the index defines, the hook denies the call and tells
  Claude which `musubi-code refs` command to run instead. It stays silent, and the search runs, for
  text patterns, quoted names and searches outside the index.

## Description

`musubi-code` indexes JavaScript and TypeScript only, and only when the developer accepts a prompt
in `musubi init` (or passes `--code-index`). This change does three things:

1. **Indexing becomes the default for supported languages.** `musubi init`, `musubi upgrade` and
   `musubi-code setup` configure code navigation in every project that has JavaScript, TypeScript
   or Python sources or project markers. The prompt, the `--code-index` / `--no-code-index` options
   and `musubi-code setup --force` disappear. Projects in other languages are reported as
   unsupported and left alone.
2. **Python joins the index.** `.py` and `.pyi` files under the configured roots are indexed with
   `@sourcegraph/scip-python` (a Node package, pinned exactly like scip-typescript). A project may
   contain both languages: each language is indexed by its own tool into its own file under
   `.scip/`, tracked by its own fingerprint, and the query layer loads whichever files exist as one
   model. `refs`, `callers`, `deps`, `dependents`, `symbols`, `status`, `index --hook` and
   `hint --hook` work the same for both languages. A mixed project is the combination of both,
   and the proposal treats it as its own case: shared roots and exclusions, both tools skipping
   each other's directories (`node_modules`, `.venv`), one model, one names list, and a test that
   builds both indexes on one fixture.
3. **The grep reminder becomes a grep guard.** CHANGE-005 added a synchronous PreToolUse hook that
   adds a note when a Grep or shell grep searches for a name the index defines. The note still
   loses against habit often enough. The hook now denies such a search
   (`permissionDecision: "deny"`) with a reason that lists the definitions, the `musubi-code refs`
   command and how to search the name as text. The silence rules of CHANGE-005 stay: text
   patterns, searches limited to paths or file types outside the index, a missing names list, and
   now also a quoted name (`'Name'`), which is the documented way to grep a name as a string.

What was verified (facts the design relies on; measured on 2026-10-09 unless noted):

| Fact                                                                                                                                                     | Evidence                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The scip-typescript protobuf bindings (`dist/src/scip.js`) decode a scip-python index                                                                     | fixture index decoded and queried with the current `query.js`                                                                                                                                                                            |
| `query.js` already answers correctly on a Python index                                                                                                   | `refs User`, `refs User.save`, `callers make_user`, `deps`, `dependents`, `symbols`, `definitionNames()` returned the right sites; cross-file imports, `User()` calls, `user.save()` on an inferred type, `self.describe()`, `super().save()` and relative imports resolve; untyped parameters do not (as in JS) |
| Every published scip-python (0.5.0 to 0.6.6) and the `scip-python-plus` fork crash on Windows at module load: `new RegExp(path.sep, 'g')`                  | upstream issue #210 (open since 2026-04-04), PR #224 (one line, `/[\\/]/g`, open since 2026-08-16, unreviewed), PR #211 closed unmerged; last upstream commit 2025-09-05                                                                  |
| A `node -r` preload shim that rewrites exactly `new RegExp('\\', flags)` to `new RegExp('[\\\\/]', flags)` makes the unmodified package work on Windows | 4 of 4 fixture files indexed with all cross-file references; setting `path.sep = '/'` instead yields 0 documents                                                                                                                         |
| `--environment <json>` must always be passed                                                                                                             | without it and without `python`/`pip` on PATH the indexer throws; with pip detection a build costs about 10 s more on this machine                                                                                                        |
| pyright excludes `node_modules`, `.venv` and `__pycache__` by itself                                                                                     | fixture with `node_modules/foo/x.py` and `.venv/.../y.py`: "Total Project Files 3"                                                                                                                                                       |
| src-layout projects lose cross-package references from `tests/` unless pyright sees `extraPaths = ["src"]`                                               | upstream issue #221; `.scip/pyrightconfig.json` with `--cwd .scip` does not work (0 documents)                                                                                                                                           |
| Build time and size (patched build, `--environment []`)                                                                                                  | fixture 4 files 1.0 s; httpx 60 files 11.6 s / 2.1 MB; Django 2906 files 2 min 39 s / 79 MB; MUSUBI itself (JS) 385 files 15 s / 23 MB                                                                                                    |
| Dependency footprint                                                                                                                                     | 61 packages, 66 MB, `npm audit --omit=dev` reports 0 vulnerabilities                                                                                                                                                                     |
| Python 3.12 to 3.14 syntax (bundled pyright 1.1.301, stdlib stubs 3.11)                                                                                  | no crash; functions using t-strings or PEP 695 generics still get definitions and cross-file references; `type X = …` aliases and PEP 695 type parameters are emitted with empty names; nothing inside a t-string resolves                |
| Mixed project (2026-10-12): scip-typescript and scip-python each index only their own files on one tree                                                 | fixture with `web/*.js`, `pkg/*.py`, `tests/`, `node_modules/foo/index.js`, `.venv/…/leak.js` and `.venv/…/leak.py`: 2 JS documents, 4 Python documents; neither tool indexed `node_modules` or `.venv`                                        |
| Mixed project (2026-10-12): the two indexes load as one model through the current `query.js`, and a merged index survives a serialize round-trip        | 6 documents, 48 definitions, one project package; `refs Widget` / `refs User`, `callers makeWidget` / `callers make_user`, `deps` and `dependents` for `web/server.js` and `pkg/service.py`, `symbols` for both, `definitionNames()` with both languages, `suggestNames()` across both; no symbol collision (`scip-typescript npm …` vs `scip-python python …`) |
| Mixed project (2026-10-12): the fingerprint counts `.venv/…/leak.js` while TypeScript skips dot-directories, so `.venv` edits trigger rebuilds and a `venv/` without the dot would be indexed | `status` reports 3 source files for 2 indexed documents; `ALWAYS_EXCLUDED_DIRS` (`indexer.js:36`) and the generated tsconfig (`:306`) know only `node_modules`, `.git`, `.scip`, `coverage`, `dist`, `build`, `out`                                 |
| Claude Code PreToolUse hooks can deny a tool call (2026-10-12)                                                                                           | hooks reference (code.claude.com/docs/en/hooks): `hookSpecificOutput.permissionDecision: "deny"` prevents the call and `permissionDecisionReason` is shown to Claude; the deprecated top-level `decision: "block"` maps to it                    |

Not in scope:

- **Third-party package resolution for Python.** The index is built with an empty environment
  (`[]`), so references into installed packages are not linked and `deps` lists no Python
  packages. A later change can generate the environment file from the project's virtualenv.
- **Templates of other agents** (GitHub Copilot, Cursor, Codex, Gemini CLI, Qwen Code, Windsurf):
  they receive the updated managed section through setup, as today; their command templates are
  not changed (CHANGE-005 follow-up still open).
- **Query-side scaling** for very large indexes (a 79 MB Django index is deserialized on every
  query). Not Python-specific; follow-up.
- **Upstreaming.** `musubi-code` does not exist in nahisaho/MUSUBI; this change is fork-only.
- **Replacing scip-python with ty-scip.** Tracked as a follow-up; the adapter boundary is designed
  for it.

## Current State

### Optional setup

- `bin/musubi-init.js:339-358` asks "Set up compiler-accurate code navigation for AI agents
  (references, callers, dependencies)?" when `answers.languages` contains `javascript` or a
  `package.json`, `tsconfig.json` or `jsconfig.json` exists; `answers.codeIndex` defaults to
  `false` otherwise. `bin/musubi-init.js:566-577` calls `setupCodeIndex()` with
  `force: options.codeIndex === true`; `:593-595` prints the "Find where code is used" next step.
- `bin/musubi.js:125-127` defines `--code-index` / `--no-code-index` on `init`, `:145` passes
  `codeIndex`, `:368` defines `--no-code-index` on `upgrade`.
- `bin/musubi-upgrade.js:29-42` `applyCodeIndexSetup()` returns when `options.codeIndex === false`
  or `!isJavaScriptProject(projectDir)`; `:266` defines `--no-code-index`.
- `src/code-index/setup.js:248-325` `setupCodeIndex()` returns `skippedReason` "no package.json,
  tsconfig.json or jsconfig.json (use --force to set up anyway)" unless `force`.
  `bin/musubi-code.js:197` `setup` has `--force`.
- `src/code-index/indexer.js:61` `PROJECT_MARKERS` (`package.json`, `tsconfig.json`,
  `jsconfig.json`) drive `findProjectRoot()` and `isJavaScriptProject()` (`:90`).

Callers (code index, `musubi-code refs`): `setupCodeIndex` is called from `bin/musubi-code.js:211`,
`bin/musubi-init.js:567`, `bin/musubi-upgrade.js:31` and 10 sites in
`tests/code-index/setup.test.js`; `isJavaScriptProject` from `bin/musubi-upgrade.js:30`,
`src/code-index/setup.js:266` and `tests/code-index/indexer.test.js:82-83`; `hasChanges` from
`bin/musubi-upgrade.js:32` and two tests. `src/code-index/indexer.js` has 7 dependents
(`bin/musubi-code.js`, `bin/musubi-upgrade.js`, `hint.js`, `query.js`, `setup.js`, two test files);
`setup.js` has 4. Nothing outside `tests/code-index/` references `codeIndex` or the flags (grep).

### JavaScript/TypeScript only

- `indexer.js`: `SOURCE_EXTENSIONS` (`:45`) lists JS/TS extensions only; `runIndexer()` (`:387`)
  spawns `@sourcegraph/scip-typescript/dist/src/main.js` with a generated `.scip/tsconfig.json`
  when the project has none; `build()` (`:448`) writes one `.scip/index.scip`, `meta.json`
  (fingerprint, files, indexer version, tsconfig) and `names.json`; `getFreshness()` (`:255`)
  compares one fingerprint.
- `query.js`: `loadModel()` (`:738`) deserializes one file; `classifyReference()` (`:225`) knows
  `require`, `import`, `new`, `extends`, `super`, `call`, `export`; a module symbol is one that
  ends in `/` (`buildModel()`, `:312`, check at `:334`); `depsQuery()` (`:578`) sets `required`
  from `require` / `import` tags on module symbols.
- `hint.js`: `SOURCE_TYPES` (`:34`) `js`, `ts`, `javascript`, `typescript`, `jsx`, `tsx`;
  `LEADING_KEYWORDS` (`:37`) JS keywords; `globCoversSource()` uses `SOURCE_EXTENSIONS`.
- Wording "JavaScript/TypeScript" in the skill template (`src/templates/code-index/SKILL.md`), the
  managed section (`instructionSection()`, `setup.js:183`), `docs/guides/scip-typescript.md`,
  `docs/guides/cli-reference.md:53-54, 61, 232`, `docs/USER-GUIDE.md:194`, `README.md:303`,
  `CHANGELOG.md:14-17` (grep).

### Python in `musubi init`

`bin/musubi-init.js:238` offers `Python` as a language; for a Python primary language init writes
a `pyproject.toml` (`:883-889`, `requires-python = ">=3.11"`). Nothing indexes it.

### Mixed projects today

- `loadConfig()` (`indexer.js:99`) defaults `roots` to the existing standard directories (`bin`,
  `src`, `lib`, `app`, `scripts`, `tests`, `test`) and falls back to `.` only when none exists. A
  Python project with `mypkg/`, `manage.py` and `tests/` would get `roots: ['tests']`.
- `ALWAYS_EXCLUDED_DIRS` (`indexer.js:36`) and `writeGeneratedTsconfig()` (`:290`, exclude at
  `:306`) skip `node_modules`, `.git`, `.scip`, `coverage`, `dist`, `build` and `out`; no Python
  environment or cache directory. TypeScript skips dot-directories on its own; a `venv/` would be
  indexed.
- Nothing merges two indexes: `loadModel()` (`query.js:738`) reads one file.

### Grep reminder (CHANGE-005)

- `hintText()` (`hint.js`) returns `additionalContext` only; `runHint()` never sets a decision.
  `tests/code-index/hint.test.js:149` asserts that no `permissionDecision` is returned.
- The wording "adds a note" / "never blocks" is in `hint.js:7`, `setup.js:219` (managed section),
  `src/templates/code-index/SKILL.md:76-77`, `docs/guides/scip-typescript.md:99-114` ("Grep
  reminder") and `:164`, `steering/tech.md:60` (grep).
- The advice "grep once for the name as a string before a rename or deletion" is in
  `setup.js:211`, `SKILL.md:72`, `docs/guides/scip-typescript.md:151` and
  `steering/structure.md:145` (grep). A guard that denies bare-name searches needs this advice to
  name a pattern the guard allows.
- Hook registration: `hookGroups()` (`setup.js:117`), synchronous, `timeout: 10`, `if` filters
  `Bash(grep *)`, `Bash(rg *)`, `Bash(git grep *)`, `PowerShell(Select-String *)`;
  `OWN_HOOK_PATTERN` (`:38`) recognises `hint --hook` for replacement on later setup runs.

### Tests

`tests/code-index/`: `format` (98 lines), `hint` (243), `indexer` (135), `integration` (275, real
scip-typescript build of a CommonJS fixture), `query` (100), `setup` (249). The suite has 172
suites; statements 78.47% (CHANGE-005 implementation record). `tests/code-index/setup.test.js:223`
asserts the `skippedReason` for a `pyproject.toml`-only project and the `--force` dry run;
`tests/code-index/indexer.test.js:82-83` asserts `isJavaScriptProject()`.

## Requirements Changes

### ADDED

- REQ-IDX-001: `musubi init` SHALL set up code navigation without asking WHEN the project has
  JavaScript, TypeScript or Python sources or project markers (`package.json`, `tsconfig.json`,
  `jsconfig.json`, `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements.txt`, `Pipfile`), or
  WHEN the selected languages include JavaScript/TypeScript or Python. `musubi init` SHALL NOT ask
  whether to set it up and SHALL NOT accept `--code-index` or `--no-code-index`.
- REQ-IDX-002: `musubi upgrade` SHALL set up code navigation in every project that meets the
  condition of REQ-IDX-001 and SHALL NOT accept `--no-code-index`. `--dry-run` SHALL still preview
  the setup.
- REQ-IDX-003: `musubi-code setup` SHALL configure a project that meets the condition of
  REQ-IDX-001 and SHALL report "no JavaScript, TypeScript or Python sources" with exit code 1
  otherwise. It SHALL NOT accept `--force`.
- REQ-IDX-004: The indexer SHALL treat `.py` and `.pyi` files under the configured roots as indexed
  sources, with the same `roots` and `exclude` settings as JavaScript/TypeScript, and SHALL
  include them in the fingerprint and in `musubi-code status`.
- REQ-IDX-005: WHEN a build runs and the project has Python sources, the indexer SHALL run
  `@sourcegraph/scip-python` with `--environment` pointing at `.scip/python-environment.json`
  (default content `[]`), `--project-name` and `--project-version` from `package.json` or
  `pyproject.toml` when present, `--quiet`, and `--output` set to a temporary file that replaces
  `.scip/index.python.scip` atomically. It SHALL write nothing outside `.scip/`.
- REQ-IDX-006: WHEN the platform is Windows, the indexer SHALL start scip-python with a preload
  module (`node -r`) that replaces the invalid separator pattern `new RegExp('\\', flags)` with
  `new RegExp('[\\\\/]', flags)` and changes nothing else. The preload SHALL NOT be used on other
  platforms.
- REQ-IDX-007: The indexer SHALL keep one index file and one fingerprint per language
  (`index.typescript.scip`, `index.python.scip`) and SHALL rebuild only the languages whose
  fingerprint changed. `meta.json` SHALL record both. An index written by the previous layout
  (`index.scip`, single fingerprint) SHALL count as missing and SHALL be removed on the next build.
- REQ-IDX-008: Queries SHALL load every language index that exists as one model, so that `refs`,
  `callers`, `symbols`, `deps`, `dependents`, `suggestNames()` and `definitionNames()` cover both
  languages, and `names.json` SHALL contain the definitions of both.
- REQ-IDX-009: For Python references the tag SHALL be `import` for `import x` and
  `from x import y` lines, `extends` for a base class in a `class` statement, `decorator` for a
  name after `@`, `super` for `super()`, `call` for `name(`, and `ref` otherwise. A Python module
  symbol (`<module>/__init__:`) SHALL count as a module for `deps`, `dependents` and `symbols`.
- REQ-IDX-010: WHEN a Python document lies under a top-level `src/` directory and its module
  symbols carry the `src.` namespace prefix, the model SHALL strip that prefix from its definitions
  and from every reference that carries it, so that references from `tests/` resolve.
- REQ-IDX-011: The grep reminder hook SHALL treat `.py` and `.pyi` files, the ripgrep types `py`
  and `python`, and patterns starting with `def`, `async def` or `class` as indexed-name searches,
  with the same silence rules as today.
- REQ-IDX-012: The managed Code Navigation section, the `code-references` skill, the guide and the
  CLI reference SHALL describe the index as covering JavaScript/TypeScript (scip-typescript) and
  Python (scip-python), and the skill SHALL stay at most 1,536 characters in its description.
- REQ-IDX-013: IF scip-python is missing from the installation, or exits with a non-zero status,
  THEN the build SHALL fail with a message naming scip-python and the last lines of its output, the
  hook SHALL log it to `.scip/index.log` and return `error`, and an existing TypeScript index
  SHALL stay usable.
- REQ-IDX-014: A project with both JavaScript/TypeScript and Python sources SHALL be indexed by
  both tools on the same tree, each tool covering only its own file types, and every query
  (`refs`, `callers`, `deps`, `dependents`, `symbols`, `suggestNames()`, `definitionNames()` and
  `status`) SHALL answer from one model that holds both indexes. A definition SHALL be found by
  name without a language option, and `status` SHALL list files and freshness per language.
- REQ-IDX-015: The indexer SHALL always skip `.venv`, `venv`, `__pycache__`, `.tox`,
  `.mypy_cache`, `.pytest_cache`, `.ruff_cache`, `.eggs` and `*.egg-info` directories, in addition
  to `node_modules`, `.git`, `.scip`, `coverage`, `dist`, `build` and `out`, in the fingerprint,
  in `isIndexedPath()`, in the generated `.scip/tsconfig.json` and when loading a scip-python
  index, so that the file count of `status` equals the number of indexed documents.
- REQ-IDX-016: WHEN a project has Python sources and `scip.roots` is not configured, the default
  roots SHALL be the existing standard directories plus every top-level directory that contains a
  `.py` file or an `__init__.py`, and top-level `.py` files SHALL be indexed. Because scip-python
  indexes the whole project root, its index SHALL be filtered to the roots and `exclude` settings
  after the build.

### MODIFIED

- REQ-NAV-005 (CHANGE-005), modified: WHEN Claude Code is about to run the Grep tool, or a Bash
  or PowerShell command that starts with `grep`, `rg`, `git grep` or `Select-String`, and the
  search pattern consists only of names that the code index defines, and the search can reach
  indexed files, the code index PreToolUse hook SHALL deny the call
  (`hookSpecificOutput.permissionDecision: "deny"`) with a `permissionDecisionReason` that lists
  the matching definitions with kind and location, gives the `musubi-code refs` command for each
  name, and states how to search the name as text (a quoted pattern, or paths and file types
  outside the index). Previously: add context, never block.
- REQ-NAV-006 (CHANGE-005), modified: IF the definition-name list is missing or unreadable, or
  the pattern is not made of identifiers only (a quoted name such as `'ErrorHandler'` counts as
  text), or the search is limited to paths or file types that the index does not cover, THEN the
  hook SHALL NOT deny the call and SHALL add nothing. WHEN the hook runs with `--advisory`, it
  SHALL add the CHANGE-005 note instead of denying. In every case it SHALL exit with code 0 and
  return within 0.5 s on this repository, and an internal error SHALL leave the search allowed.
- REQ-NAV-001 and REQ-NAV-002 (CHANGE-005), modified: where the managed section, the skill and
  the steering say to grep "once for the name as a string" before a rename or deletion, they SHALL
  say to grep once for the quoted name (`'Name'` or `"Name"`), which the guard allows, and the
  managed section SHALL say that the hook blocks a grep for indexed names.
- Behaviour recorded in `CHANGELOG.md` 6.3.1-itg.2 "`musubi init` asks whether to set up code
  navigation …" and "`musubi upgrade` … `--no-code-index` skips it": replaced by REQ-IDX-001 and
  REQ-IDX-002 (no recorded requirement IDs exist for the code index before CHANGE-005).

### REMOVED

- The `musubi init` prompt and the options `musubi init --code-index`, `musubi init
  --no-code-index`, `musubi upgrade --no-code-index`, `musubi-code setup --force`.

### RENAMED

<!-- None -->

## Design Changes

### ADDED

- **Language adapters** in `src/code-index/indexer.js` (or a small `languages.js` next to it):

  ```js
  const LANGUAGES = {
    typescript: {
      extensions: ['.js', '.cjs', '.mjs', '.jsx', '.ts', '.cts', '.mts', '.tsx'],
      markers: ['package.json', 'tsconfig.json', 'jsconfig.json'],
      indexer: '@sourcegraph/scip-typescript', // dist/src/main.js, as today
      indexFile: 'index.typescript.scip',
      run(cfg, files, tmpPath) { /* today's runIndexer */ },
    },
    python: {
      extensions: ['.py', '.pyi'],
      markers: ['pyproject.toml', 'setup.py', 'setup.cfg', 'requirements.txt', 'Pipfile'],
      indexer: '@sourcegraph/scip-python', // index.js
      indexFile: 'index.python.scip',
      run(cfg, files, tmpPath) { /* REQ-IDX-005, REQ-IDX-006 */ },
    },
  };
  ```

  `listSourceFiles()` returns files with their language; `computeFingerprint()` hashes per
  language (configuration, indexer version, file list); `getFreshness()` returns `missing`,
  `stale` or `fresh` per language and overall; `build()` runs only the stale languages under the
  existing lock, then `writeNames()` from the merged model. `isJavaScriptProject()` becomes
  `detectLanguages(root)` returning the languages with markers or sources;
  `findProjectRoot()` uses the union of markers.

- **scip-python invocation**: `node [-r <shim>] <scip-python/index.js> index --cwd <root>
  --project-name <name> --project-version <version> --environment .scip/python-environment.json
  --quiet --output <tmp>`; `cwd` is the project root; stdout/stderr captured as for
  scip-typescript. `python-environment.json` is written with `[]` when missing and left alone when
  present, so a project can hand-maintain it (scip-python's documented format). Optional
  `"scip": { "pythonArgs": [] }` in `package.json` for extra arguments, mirroring `indexerArgs`
  (renamed in docs to "scip-typescript arguments", key unchanged).
- **Windows preload shim** `src/code-index/scip-python-shim.js` (about 10 lines): wraps the
  global `RegExp` constructor; when the pattern is exactly `\` it substitutes `[\\/]`; otherwise it
  delegates. Loaded with `process.execPath -r <shim>` only when `process.platform === 'win32'`.
  Documented as a workaround for scip-python issue #210, to be dropped when a release contains
  PR #224 (the fingerprint includes the indexer version, so projects rebuild on upgrade).
- **Mixed model**: `loadModel()` deserializes each existing language index and passes the
  concatenated `documents` to `buildModel()`. Symbols from the two tools cannot collide (`scip-typescript`
  vs `scip-python` scheme). `projectPackages` already collects both package identities.
- **Python symbol handling** in `query.js`: `describeSymbol()` maps a sole `__init__:` meta
  descriptor to kind `module`; `buildModel()` records `moduleSymbol` for it; `classifyReference()`
  gets the Python branch of REQ-IDX-009 (selected by file extension); REQ-IDX-010 prefix
  normalisation runs in `buildModel()` for documents under `src/`.
- **Mixed-project guarantees** (REQ-IDX-014 to 016):
  - `build()` runs each language's adapter on the same root; both runs capture their output, and a
    failure of one leaves the other language's index in place (REQ-IDX-013).
  - `loadModel()` deserializes every `index.<language>.scip` that exists and hands the
    concatenated document lists to `buildModel()`; the Python documents are post-filtered to the
    roots and `exclude` settings (scip-python has no roots option). `names.json` is written from
    that merged model, so the guard knows both languages.
  - `ALWAYS_EXCLUDED_DIRS` gains the Python environment and cache directories; the generated
    tsconfig lists them in `exclude` (TypeScript skips dot-directories by itself, `venv/` and
    `__pycache__/` it would not), so a mixed project never indexes `.venv/…/static/*.js`.
  - `defaultRoots()` adds top-level Python packages and `.py`-containing directories when Python
    sources exist; `status` prints roots, files and freshness per language.
  - Verified on 2026-10-12 with the current `query.js` (Description table); the implementation
    keeps that fixture as `tests/code-index/mixed.test.js`.
- **Python fixture** and **mixed fixture** for the integration tests: a package with class
  inheritance, a decorator, a relative import, `self.method()`, `super()` and a `tests/` module;
  the mixed fixture adds two CommonJS files (`web/widget.js`, `web/server.js`), a
  `node_modules/foo/index.js` and a `.venv/` with one `.js` and one `.py` file, none of which may
  appear in the index or in the file count.
- **Grep guard** (REQ-NAV-005 and REQ-NAV-006 modified). `hintText()` keeps its parsing, the
  names lookup and the silence rules, and returns a decision instead of context:

  ```json
  {
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "…"
    }
  }
  ```

  Reason text (draft in the Appendix): the definitions with kind and `file:line` (at most 5), the
  `musubi-code refs` command per name, one line on what `refs` gives, and one line on how to
  search the name as text. The quoted-name escape needs no code: `'ErrorHandler'` and
  `"ErrorHandler"` already fail the identifier test in `symbolNames()`, in the Grep tool and after
  the shell parser removes the outer quotes of `grep -rn "'ErrorHandler'" src`. A deny applies to
  the whole tool call, so a compound Bash command that contains such a grep is denied as a whole;
  the reason says so. `hint --hook --advisory` returns the CHANGE-005 `additionalContext` form
  instead; `mergeHookSettings()` keeps `--advisory` on an existing own hook entry when setup runs
  again, so a project's choice survives `musubi upgrade`. Without the option the hook command in
  `.claude/settings.json` is unchanged, so projects already set up get the guard with the new
  MUSUBI version.

### MODIFIED

- `setupCodeIndex()`: `force` option removed; `skippedReason` text from REQ-IDX-003; the managed
  section (`instructionSection()`) says "JavaScript/TypeScript and Python (scip-typescript,
  scip-python)"; `.gitignore` entry unchanged.
- `musubi init`: the prompt block and `answers.codeIndex` go; setup runs after the guide is written
  whenever `detectLanguages()` finds a supported language or `answers.languages` includes
  `javascript` or `python`; the "Find where code is used" next step is printed when setup ran.
- `musubi upgrade`: `applyCodeIndexSetup()` runs when `detectLanguages()` is non-empty; the
  "Skip with --no-code-index" line goes.
- `bin/musubi-code.js`: `setup` without `--force`; `status` shows per-language files and
  freshness; `index` builds stale languages (or all with no `--if-stale`).
- `hint.js`: extensions, types and keywords from REQ-IDX-011; `hintText()` builds the deny
  decision of the grep guard (ADDED above); `--advisory` keeps the CHANGE-005 note.
- Managed section (`instructionSection()`), skill "Workflow for changes" step 3 and
  `steering/structure.md` "Navigating the Code": "grep once for the name as a string" becomes
  "grep once for the quoted name"; the hook sentence says that it blocks and how to search text.
- Skill template, guide (`docs/guides/scip-typescript.md`, title and sections; "Grep reminder"
  becomes "Grep guard"; file name kept so links stay valid), `cli-reference.md`, `USER-GUIDE.md`,
  `README.md`, `CHANGELOG.md`.
- `package.json`: `"@sourcegraph/scip-python": "0.6.6"` (exact, like scip-typescript).

### REMOVED

- The optional path: prompt, flags, `force`.

## Code Changes

### ADDED

- `src/code-index/scip-python-shim.js`.
- Language table and `detectLanguages()` (in `indexer.js` or `languages.js`).
- `tests/code-index/python.test.js`, written first: Python fixture built through `runHook()`;
  `refs User`, `refs User.save`, `callers make_user`, `deps`/`dependents` with `required`,
  `symbols`, Python tags, `src/` normalisation, default roots for a root-level package,
  missing-indexer error path, and the shim's substitution rule in isolation. On Windows the suite
  exercises the shim for real.
- `tests/code-index/mixed.test.js`, written first (REQ-IDX-014 to 016): the mixed fixture built
  through `runHook()`; both `index.<language>.scip` files exist; `status` lists both languages
  with 2 and 4 files; the eight queries of the 2026-10-12 verification return the same results
  from the merged model; `names.json` holds `Widget` and `User`; `.venv` and `node_modules` files
  are neither indexed nor counted; editing a `.py` file rebuilds only the Python index (the
  TypeScript `meta` entry keeps its `builtAt`).
- `CHANGELOG.md` under `[Unreleased]`: `### Added` (Python, mixed projects, shim), `### Changed`
  (setup by default, per-language index files, wording), `### Removed` (prompt and flags).

### MODIFIED

Code and tests:

- `src/code-index/indexer.js`: language table, `listSourceFiles()`, `computeFingerprint()`,
  `getFreshness()`, `build()`, `runIndexer()` → per-language `run`, `statusReport()`,
  `isIndexedPath()`, `coversDirectory()`, `findProjectRoot()`, `ALWAYS_EXCLUDED_DIRS` and
  `writeGeneratedTsconfig()` excludes (REQ-IDX-015), `defaultRoots()` (REQ-IDX-016);
  `isJavaScriptProject` replaced by `detectLanguages` (export list updated).
- `src/code-index/query.js`: `loadModel()`, `buildModel()`, `describeSymbol()`,
  `classifyReference()`, `depsQuery()`/`dependentsQuery()` `required` flag.
- `src/code-index/hint.js`: `SOURCE_TYPES`, `LEADING_KEYWORDS`, `globCoversSource()` via the
  language table; `hintText()` and `runHint()` return the deny decision, `advisory` option,
  module comment (`:7`).
- `src/code-index/setup.js`, `src/code-index/format.js` (status per language).
- `bin/musubi-code.js` (`setup` without `--force`, `status` per language,
  `hint --hook --advisory`), `bin/musubi-init.js`, `bin/musubi.js`, `bin/musubi-upgrade.js`.
- `tests/code-index/setup.test.js` (`:223` test rewritten: a `pyproject.toml` project is set up,
  a `Cargo.toml` project is skipped), `tests/code-index/indexer.test.js` (`:82-83`),
  `tests/code-index/integration.test.js` (index file name, meta layout), `tests/code-index/hint.test.js`
  (Python patterns and `--type py`; the `:149` assertion that no `permissionDecision` is returned
  is inverted; new cases: deny JSON and reason text for Grep, Bash and PowerShell, quoted name
  allowed, `--glob '*.md'` and `docs/` allowed, `--advisory` note, fail-open on a corrupt
  `names.json`, latency).

Templates and documentation:

- `src/templates/code-index/SKILL.md`; `docs/guides/scip-typescript.md`;
  `docs/guides/cli-reference.md`; `docs/USER-GUIDE.md`; `README.md`.

This repository (refreshed with `musubi-code setup`): `CLAUDE.md`, `AGENTS.md`,
`.claude/skills/code-references/SKILL.md` (managed section and skill wording only; the hook
commands in `.claude/settings.json` are unchanged, so the guard applies here as soon as the new
version is linked); `steering/tech.md` "Code Navigation" row (indexer list) and `:60` (the hook
blocks), `steering/structure.md` "Navigating the Code" `:145` (quoted name; scope unchanged, this
repository has no Python); `storage/changes/change-log.md`.

### REMOVED

- `bin/musubi-init.js:339-358` prompt block; `bin/musubi.js:125-127, :368` options;
  `bin/musubi-upgrade.js:266` option and `:41` hint line; `setup --force`.

### RENAMED

- `.scip/index.scip` → `.scip/index.typescript.scip` (generated file, ignored by git).
- `isJavaScriptProject()` → `detectLanguages()` (different return type; all 4 call sites updated).

## Impact Analysis

### Affected Components

- Code index library and CLI (`src/code-index/`, `bin/musubi-code.js`).
- `musubi init` and `musubi upgrade` behaviour in every project with a supported language; the
  flags disappear from `bin/musubi.js`.
- The global MUSUBI installation: one more runtime dependency (66 MB, 61 packages).
- Projects already set up: their next hook run or query sees the old `index.scip` as missing and
  rebuilds once (15 s on this repository).
- Claude Code sessions in every project with the hooks: a Grep or shell grep whose pattern is only
  indexed names is denied with a reason. The hook command in `.claude/settings.json` is the same,
  so the guard takes effect with the new MUSUBI version without re-running setup.
- Not affected: the SDD library, the other CLIs, the agent templates apart from the managed
  section, `.scip/` contents of users who never run the new version.

### Breaking Changes

- [ ] No breaking changes
- [x] Breaking changes (list below)

| Change                                                                | Component                         | Severity | Mitigation                                                                                                   |
| --------------------------------------------------------------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `--code-index` / `--no-code-index` / `setup --force` removed          | `musubi init`, `upgrade`, `setup` | Low      | commander reports "unknown option"; CHANGELOG `### Removed`; the options shipped in 6.3.1-itg.2 only        |
| Projects with Python sources get hooks, skill and section on upgrade  | `musubi upgrade`                  | Low      | `--dry-run` previews; changes are the same idempotent files as for JS projects                                |
| `.scip/index.scip` replaced by per-language files                     | `.scip/` (git-ignored)            | Low      | one automatic rebuild; `musubi-code status` explains                                                         |
| `isJavaScriptProject` no longer exported from `src/code-index/indexer` | library users                     | Low      | not part of `src/index.js`; fork-only API; `detectLanguages()` documented in the guide                       |
| A grep for an indexed name is denied in Claude Code (was a note)      | `hint --hook`, every set-up project | Medium   | the reason gives the `refs` command and the quoted-pattern escape; silent for text, quoted names and searches outside the index; fail-open on any error; `--advisory` restores the note |

### Migration Steps

1. Install the new version globally (`npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'`
   after merge).
2. Existing JS projects: nothing to do; the next session rebuilds into the new file name.
3. Python or mixed projects: `musubi upgrade` (or `musubi-code setup`), then start a session or
   run `musubi-code index`.
4. src-layout Python projects: references resolve through REQ-IDX-010; projects that already set
   `[tool.pyright] extraPaths` keep working.
5. Scripts that passed `--no-code-index`: remove the option.
6. Projects that prefer the note to the guard: add `--advisory` to the four `hint --hook` entries
   in `.claude/settings.json`; setup keeps the option on later runs.

### Risks

| Risk                                                                                                   | Probability | Impact | Mitigation                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------ | ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scip-python upstream stays unmaintained; the shim must live on                                         | High        | Low    | Shim is 10 lines, tested in isolation and end-to-end; adapter boundary allows ty-scip later; indexer version pinned                                                    |
| A future scip-python release changes CLI or bundle so the shim no longer applies                       | Low         | Medium | Exact pin; the integration test fails on upgrade; `getFreshness()` includes the version                                                                                |
| Long builds on large Python repositories (Django-size: 2 min 39 s)                                     | Medium      | Medium | Builds are async and queued; per-language fingerprints avoid rebuilding JS for a `.py` edit; `exclude` in `package.json` `scip`; documented in the guide               |
| scip-python runs `python`/`pip` detection and fails on machines without Python                         | Low         | Low    | `--environment` always passed, so detection never runs                                                                                                                 |
| 3.12+ `type` aliases and PEP 695 type parameters indexed with empty names                              | Medium      | Low    | Documented limit; `suggestNames()` cannot help there; revisit with ty-scip                                                                                              |
| Unsupported-language projects (Rust, Go, …) now get a message instead of a prompt                      | Low         | Low    | Message names the supported languages; nothing is written                                                                                                              |
| `src.` normalisation collides with a real top-level package named `src`                                | Low         | Low    | Applied only to documents under `src/`; documented                                                                                                                     |
| Memory for Django-size indexes at query time                                                           | Medium      | Medium | Out of scope here; follow-up noted; `NODE_OPTIONS=--max-old-space-size` documented                                                                                     |
| The guard blocks a search Claude needs (a name as text inside indexed source, such as a comment)       | Medium      | Medium | The reason names the escape (quoted pattern, paths or types outside the index); `refs` already lists every resolved use; `--advisory` per project; record the denied calls of the next two SDD changes in their implementation records |
| A deny on a compound Bash command blocks unrelated commands in it                                      | Low         | Low    | The reason says the whole command was denied; Claude re-runs the other parts                                                                                           |
| Stale `names.json` (a definition deleted since the last build) denies a grep for a name no longer defined | Low         | Low    | `musubi-code refs` rebuilds first and answers "No definition named", after which the list no longer holds the name                                                      |
| Mixed projects: scip-python indexes a `.py` file that `roots`/`exclude` leave out, or vice versa        | Low         | Low    | post-filter to roots and `exclude` after the build; `status` compares file count and documents; mixed fixture test                                                      |

## Testing

### Test Changes

- [x] Unit tests: `tests/code-index/python.test.js` (new, shim rule, language detection,
      Python tags, prefix normalisation), `setup.test.js`, `indexer.test.js`, `hint.test.js`
      (guard: deny, escapes, `--advisory`, fail-open), `query.test.js` (extended).
- [x] Integration tests: `python.test.js` builds a real scip-python index of the Python fixture;
      `mixed.test.js` builds both indexes of the mixed fixture and queries the merged model;
      `integration.test.js` keeps the CommonJS fixture.
- [ ] E2E tests: not applicable. Live Claude Code check is manual (below).

Expected: 174 suites; the Python and mixed integrations add about 20 s per run (CI on Linux,
Windows locally).

### Test Coverage

- Current: 78.47% statements (CHANGE-005 record); thresholds 60 / 45 / 60 / 60 unchanged.
- Target: new and changed code in `src/code-index/` at 85% statements or more.

### Verification Commands

```bash
# Suites first, then the full suite, lint and format
npx jest tests/code-index
npm test -- --coverage && npm run lint && npm run format:check

# This repository (JS only): rebuild into the new layout, status per language
musubi-code index && musubi-code status

# A Python project (for example the httpx source tree): setup, build, query
musubi-code setup && musubi-code index && musubi-code refs Client && musubi-code dependents httpx/_client.py

# A mixed project (the mixed fixture, or any repository with both languages): both index files,
# one model, per-language status, nothing from node_modules or .venv
ls .scip/ && musubi-code status
musubi-code refs Widget && musubi-code refs User
musubi-code deps web/server.js && musubi-code deps pkg/service.py
musubi-code symbols .venv/Lib/site-packages/x/static/leak.js   # "is not in the index"

# Guard by hand: a defined name is denied, a quoted name and a docs-only search pass
echo '{"tool_name":"Grep","tool_input":{"pattern":"ErrorHandler"}}' | musubi-code hint --hook
echo '{"tool_name":"Grep","tool_input":{"pattern":"'"'"'ErrorHandler'"'"'"}}' | musubi-code hint --hook
echo '{"tool_name":"Grep","tool_input":{"pattern":"ErrorHandler","glob":"*.md"}}' | musubi-code hint --hook
echo '{"tool_name":"Grep","tool_input":{"pattern":"ErrorHandler"}}' | musubi-code hint --hook --advisory

# No prompt, no flags
musubi init --help | grep -c code-index   # prints 0
musubi upgrade --help | grep -c code-index
```

Live check in Claude Code (manual, recorded in the implementation record): in a mixed project,
ask "where is `User` defined?" and "who calls `makeWidget`?"; run a Grep for `make_user` and a
Bash `grep -rn make_user .` and note that both are denied with the reason; run
`grep -rn "'make_user'" .` and a Grep limited to `docs/` and note that both run; note that the
skill is picked.

## Traceability

### Requirements → Design → Code → Tests

- REQ-IDX-001, 002, 003 → setup by default, `detectLanguages()` → `musubi-init.js`, `musubi.js`,
  `musubi-upgrade.js`, `setup.js`, `musubi-code.js` → `setup.test.js`, `indexer.test.js`,
  `python.test.js` (detection)
- REQ-IDX-004, 005, 007, 013 → language adapters, per-language build → `indexer.js`, `format.js`
  → `python.test.js` (build, status, error path), `integration.test.js` (layout)
- REQ-IDX-006 → preload shim → `scip-python-shim.js` → `python.test.js` (rule in isolation; real
  build on Windows)
- REQ-IDX-008, 009, 010 → mixed model, Python symbols → `query.js` → `python.test.js`,
  `query.test.js`
- REQ-IDX-011 → hint language table → `hint.js` → `hint.test.js`
- REQ-IDX-012 → wording → skill template, `setup.js`, docs → `setup.test.js` (section and skill
  length)
- REQ-IDX-014, 015, 016 → mixed-project guarantees (merge, excluded directories, default roots,
  post-filter) → `indexer.js`, `query.js`, `format.js` → `mixed.test.js`, `indexer.test.js`
- REQ-NAV-005, REQ-NAV-006 (modified) → grep guard → `hint.js`, `bin/musubi-code.js`,
  `setup.js` (`--advisory` kept) → `hint.test.js`, `setup.test.js`
- REQ-NAV-001, REQ-NAV-002 (modified) → quoted-name wording → `setup.js`, skill template,
  steering → `setup.test.js`, `tests/code-navigation-guidance.test.js`

## Implementation Plan

Four commits on `feat/code-index-python`, all fork-only; the maintainer commits (as in
CHANGE-004 and CHANGE-005):

1. `feat(code-index): set up code navigation by default for supported languages (CHANGE-006)`:
   tests first (observed failing), language detection, removal of prompt and flags, setup and
   upgrade changes, CLI reference and CHANGELOG `### Removed`.
2. `feat(code-index): index Python with scip-python, mixed projects (CHANGE-006)`: tests first
   (`python.test.js`, `mixed.test.js`), dependency, language adapters, shim, excluded
   directories, default roots, per-language build and freshness, merged model and post-filter,
   Python tags and prefix normalisation, hint language rules, status, guide and CHANGELOG
   `### Added`/`### Changed`.
3. `feat(code-index): grep guard denies searches for indexed names (CHANGE-006)`: tests first
   (`hint.test.js`), deny decision and reason, `--advisory`, `mergeHookSettings()` keeps it,
   guide "Grep guard" section, CHANGELOG `### Changed`.
4. `docs(code-index): language-neutral skill, section and guides (CHANGE-006)`: skill template,
   managed section (quoted name, guard sentence), docs, `musubi-code setup` on this repository,
   steering rows, change log.

Estimated effort: three to five days.

## Rollback Plan

- Pre-change state: commit `9b9a2f4`.
- Whole change: `git revert` of the three commits, `npm install` (drops scip-python), then
  `musubi-code setup` in affected projects to restore the previous section and skill wording. The
  reverted `getFreshness()` does not know the per-language files, sees `index.scip` as missing
  and rebuilds once.
- Guard only: add `--advisory` to the four `hint --hook` entries in `.claude/settings.json`, or
  remove them; both the new and the reverted setup recognise the entries (`OWN_HOOK_PATTERN`).
- No data migration. Everything generated lives in the ignored `.scip/`.

## Constitutional Compliance

Profile: `cli` (`steering/project.yml`, `core_paths: [src]`, `delivery_paths: [bin]`).

- Article I (Testable Core): language detection, build orchestration, the shim rule and the Python
  symbol handling live in `src/code-index/` and are tested without the CLI; `bin/` only parses
  options and prints.
- Article II (Automation Interface): every behaviour is reachable through `musubi-code`
  (`setup`, `index`, `status`, queries, `--json`); `index --hook` is unchanged; `hint --hook`
  keeps the JSON-in, JSON-out contract and gains the deny decision and `--advisory`.
- Article III (Test-First): `python.test.js` and the changed assertions are written first and
  observed failing.
- Article IV (EARS): REQ-IDX-001 to 013 use `SHALL` with `WHEN` / `IF … THEN` where conditional;
  no SHOULD, MUST or MAY.
- Article V (Traceability): matrix above; each requirement has a test group.
- Article VI (Project Memory): steering `tech.md` and `structure.md` rows updated; the
  feasibility findings are recorded in the Appendix.
- Article VII (Simplicity): one new dependency and one 10-line shim; no new CLI command; the
  optional path is deleted rather than kept behind a flag; the guard reuses the existing hook,
  names list and silence rules and adds one option (`--advisory`) as the rollback switch.
- Article VIII (Anti-Abstraction): the language table is a plain object with two entries, not a
  plugin system; scip-python is called through its documented CLI.
- Article IX (Integration-First): the Python test builds a real index with the real tool and
  queries it through the real CLI.

## Appendix

### Draft: managed section (`instructionSection()`, Claude Code variant)

The third and fourth paragraphs change (the first two and the table stay):

```markdown
This also applies where an SDD command, prompt or skill says to grep for code. Use grep for
text the index does not cover: Markdown, templates, configuration, comments, string-keyed
registries and dynamic `require()` or `importlib` paths, and once for the quoted name (`'Name'`)
before a rename or deletion. `musubi-code status` lists the indexed directories and languages.
The index is compiler-accurate (scip-typescript for JavaScript/TypeScript, scip-python for
Python; `.scip/`) and is rebuilt first when source files changed.

The `code-references` skill lists all options. Hooks in `.claude/settings.json` keep the index
fresh and block a grep that searches only for indexed names, pointing to `refs`; quote the name
to search it as text.
```

### Draft: `code-references` skill description (first paragraph)

```yaml
description: |
  Compiler-accurate code navigation for this project's JavaScript/TypeScript and Python code, from
  scip-typescript and scip-python indexes: definitions, exports, references, callers, `new X()` and
  `Class()` instantiations, `extends` / base classes, `require()` / import sites, decorators, and file
  dependencies/dependents, resolved across files (including CommonJS `module.exports = { X }`).
```

Trigger terms and "Use when" unchanged (length checked by `setup.test.js`).

### Draft: Python reference output

```text
User (class) pkg/models.py:22
  4 references in 3 files: 2 call, 2 import
  pkg/service.py
        1  import   top level                         from pkg.models import User, make_user
       11  call     in run                            direct = User(name, "x")
  tests/test_service.py
        7  ref      in test_run                       assert isinstance(models.make_user("a"), models.User)
```

### Draft: preload shim

```js
// scip-python builds `new RegExp(path.sep, 'g')`, invalid on Windows (upstream issue #210,
// fix in PR #224). Rewrite exactly that pattern; everything else is untouched.
const NativeRegExp = RegExp;
function PatchedRegExp(pattern, flags) {
  if (pattern === '\\') pattern = '[\\\\/]';
  return new.target ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags);
}
PatchedRegExp.prototype = NativeRegExp.prototype;
Object.setPrototypeOf(PatchedRegExp, NativeRegExp);
global.RegExp = PatchedRegExp;
```

### Draft: grep guard reason (`permissionDecisionReason`)

```text
musubi-code: grep for ErrorHandler is blocked; the code index defines it:
  ErrorHandler (class) src/orchestration/error-handler.js:613  ->  `musubi-code refs ErrorHandler`
`musubi-code refs` gives the definition, exports and every reference, compiler-resolved.
To search the name as text (strings, comments, Markdown, dynamic lookups), quote it
(pattern 'ErrorHandler') or limit the search to paths or file types outside the index.
```

For a Bash or PowerShell call the first line reads "the command is blocked because its grep
searches for ErrorHandler, which the code index defines:". With `--advisory` the text is the
CHANGE-005 note, unchanged, as `additionalContext`.

### Draft: `code-references` skill, "Workflow for changes" step 3 and hook paragraph

```markdown
3. Then grep once for the quoted name (`'Name'`), because the index cannot see dynamic lookups:
   `require(variable)`, `importlib.import_module(name)`, registries keyed by strings, `obj[name]()`,
   and text in Markdown, YAML or templates. A bare-name grep is blocked by the guard (below).

A PreToolUse hook (`{{CODE_CMD}} hint --hook`) blocks a Grep or shell grep whose pattern is only
names the index defines, and answers with the definitions and the `refs` command. It lets text
searches, quoted names and searches limited to paths or file types outside the index through.
```

### Analysis method

From the code index (`musubi-code refs`, `symbols`, `dependents`): the call sites of
`setupCodeIndex`, `isJavaScriptProject`, `applyCodeIndexSetup`, `runHook`, `loadConfig`,
`hasChanges`, `detectAgents`; the dependents of `indexer.js` and `setup.js`; the symbol list of
`indexer.js`. From grep: the flag names and `codeIndex` in `bin/`, `docs/`, `src/templates/`,
`README.md`, `CHANGELOG.md`; the "JavaScript/TypeScript" wording; the language choices and
Python branches in `bin/musubi-init.js`. From experiments in the session scratchpad (not in the
repository): scip-python 0.5.0 to 0.6.6 and scip-python-plus 0.7.5 on Windows, the preload shim,
`--environment`, src-layout behaviour, the modern-syntax fixture, timings for httpx and Django,
ty-scip 0.1.0 on the same fixtures, and the unchanged `query.js` run against both indexes. On
2026-10-12: a mixed fixture (`web/*.js`, `pkg/*.py`, `tests/`, `node_modules/`, `.venv/`) built
with `musubi-code index` (scip-typescript, roots `.`) and with scip-python under the shim, the two
indexes merged in memory and run through the unchanged `query.js`, and a serialize round-trip of
the merged index; the Claude Code hooks reference (code.claude.com/docs/en/hooks) for
`permissionDecision: "deny"` and `permissionDecisionReason`, which is shown to Claude.

### Alternatives considered (2026-10-09)

| Tool                                             | Engine                                     | Python syntax                     | Windows             | Verdict                                                                 |
| ------------------------------------------------ | ------------------------------------------ | --------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| `@sourcegraph/scip-python` 0.6.6 (and forks)     | pyright 1.1.301, stubs 3.11                | 3.12+ degrades, no crash          | crash; shim works   | adopted                                                                 |
| `ty-scip` 0.1.0 (PyPI wheels incl. win_amd64)    | ty / Ruff crates, pinned unpublished       | 3.14 stubs, PEP 695 and t-strings | works               | not yet: aborts on non-identifier file names, drops inferred receivers |
| `pyrefly-producer` 0.9.5                         | Pyrefly git rev                            | current                           | macOS arm64 only    | no                                                                      |
| pyright / basedpyright / Pyrefly / ty / Zuban    | current                                    | 3.14                              | yes                 | no index export; a MUSUBI-built LSP crawler would be weeks of work       |
| stack-graphs, tree-sitter graph tools            | syntax only                                | n/a                               | yes                 | archived or no cross-file resolution                                    |

### Upstream

Fork-only: `musubi-code` does not exist in nahisaho/MUSUBI. Not a candidate for the upstream PR
series.

### References

- `docs/guides/scip-typescript.md`, `src/code-index/`, `tests/code-index/`
- scip-python: https://github.com/sourcegraph/scip-python — issue #210 (Windows crash), PR #224
  (fix), issue #221 (src-layout), environment file format in the README
- ty-scip: https://github.com/brendan-m-murphy/ty-scip
- CHANGE-005 (`storage/archive/2026/CHANGE-005/`): managed section, skill, hint hook

### Change History

| Version | Date       | Author                     | Changes          |
| ------- | ---------- | -------------------------- | ---------------- |
| 1.0     | 2026-10-09 | Yaroslav (with Claude Code) | Initial proposal |
| 1.1     | 2026-10-12 | Yaroslav (with Claude Code) | Mixed-project guarantees (REQ-IDX-014 to 016, mixed fixture test, verification of 2026-10-12); grep reminder becomes a blocking guard (REQ-NAV-005 and 006 modified, quoted-name escape, `--advisory`) |

## Approval

- [ ] Maintainer review of the decisions above (default setup, scip-python, per-language index
      files, shim on Windows only, empty Python environment, mixed-project roots and excluded
      directories, guard escape by quoted name, `--advisory` as the only opt-out)
- [ ] `musubi-change approve CHANGE-006`
