# Delta Specification: CHANGE-006

**Type**: MODIFIED
**Target**: Code navigation by default, for JavaScript/TypeScript and Python
**Status**: implemented
**Created**: 2026-10-09T00:00:00.000Z
**Updated**: 2026-10-12T10:47:24.374Z

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
