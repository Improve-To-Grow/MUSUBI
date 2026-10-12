# Code Navigation with musubi-code

`musubi-code` answers questions such as "where is `ErrorHandler` defined?", "does `EARSValidator` exist?", "who instantiates `ConstitutionValidator`?", "which functions call `make_user`?" and "which files depend on `src/validators/constitution.js`?" for JavaScript, TypeScript and Python projects, mixed ones included, with compiler accuracy.

It ships with MUSUBI. `musubi init` and `musubi upgrade` set it up in every project with a supported language, so AI coding agents use it before grep. In Claude Code a skill tells the agent when to use it, hooks keep its index fresh without anyone running a command, and a reminder hook points grep searches for indexed names to it.

## Why scip-typescript and scip-python

`musubi-code` is built on two Sourcegraph indexers that write [SCIP](https://github.com/sourcegraph/scip) indexes: every definition and every reference, resolved across files. Both are npm packages pinned to exact versions, so nothing else needs to be installed.

- [`@sourcegraph/scip-typescript`](https://github.com/sourcegraph/scip-typescript) indexes JavaScript and TypeScript with the TypeScript compiler. For CommonJS code that means destructured `require()` bindings, `new X()` calls, `extends` clauses and method calls all point at the right definition.
- [`@sourcegraph/scip-python`](https://github.com/sourcegraph/scip-python) indexes Python with pyright. Imports (absolute and relative), calls on values whose type is inferred (`user = make_user(x); user.save()`), `self.method()`, `super()`, base classes and decorators resolve across files.

Each language is indexed into its own file (`.scip/index.typescript.scip`, `.scip/index.python.scip`) with its own fingerprint, so an edit rebuilds only the language it touches, and every query reads whichever files exist as one model. A mixed project asks `musubi-code refs User` and `musubi-code refs Widget` the same way.

The usual alternatives fall short:

| Approach | Gap |
| --- | --- |
| grep | Misses aliases and destructured bindings; matches comments and strings |
| Editor "find references" (TypeScript language service) | Does not follow `module.exports = { X }`; from the class it finds only the export line |
| Tree-sitter code graphs (codegraph-mcp, Shotgun, cartog and others) | Record no `require()` or cross-file `new X()` edges for CommonJS; no type inference for Python receivers |
| Newer Python SCIP indexers (ty-scip 0.1.0) | Abort on file names that are not identifiers (`migrations/0001_initial.py`) and drop calls on inferred receivers; revisit later |

On the MUSUBI repository the JavaScript index covers about 385 files, builds in about 15 seconds, takes about 23 MB, and answers a query in about one second. Python builds on Windows: httpx (60 files) in 12 seconds for 2 MB, Django (2,906 files) in 2 minutes 39 seconds for 79 MB.

## Setting it up

MUSUBI must be installed globally, because the hooks, skill and instructions call the `musubi-code` command:

```bash
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
```

| Situation | How |
| --- | --- |
| New project | `musubi init` sets it up when the chosen languages or the files present include JavaScript, TypeScript or Python: a project marker (`package.json`, `tsconfig.json`, `jsconfig.json`, `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements.txt`, `Pipfile`) or source files under the roots. There is no question and no option |
| Existing MUSUBI project | `musubi upgrade` adds it to every project with a supported language that lacks it, even when the project is already at the current version. `--dry-run` previews |
| Any project with a supported language | `musubi-code setup` in the project directory. Other projects are reported as unsupported and left alone |

`musubi-code setup` options:

| Option | Meaning |
| --- | --- |
| `--agent <agent...>` | Agents to configure: `claude-code`, `github-copilot`, `cursor`, `gemini-cli`, `codex`, `qwen-code`, `windsurf`, or their short aliases. Default: the agents whose files the project already has, else Claude Code |
| `--dry-run` | Show what would change without writing |
| `--command <command>` | Command the hooks, skill and instructions call (default `musubi-code`) |
| `--root <dir>` | Project directory (default: found from the current directory) |

What setup writes. Every step is idempotent, so running it again reports each file as unchanged:

| File | Change |
| --- | --- |
| `.gitignore` | Adds `.scip/` |
| `.claude/skills/code-references/SKILL.md` | Claude Code only. Tells Claude when and how to query; managed by MUSUBI, so setup overwrites local edits |
| `.claude/settings.json` | Claude Code only. Adds async `SessionStart` and `PostToolUse` hooks running `musubi-code index --hook`, and synchronous `PreToolUse` hooks running `musubi-code hint --hook` ([Grep reminder](#grep-reminder)); keeps every other setting and hook, and replaces earlier versions of its own hooks |
| `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` or `QWEN.md` | Adds or replaces a "Code Navigation" section between `<!-- musubi-code:start -->` and `<!-- musubi-code:end -->`. It maps symbol questions (does it exist, where is it defined, what does a file export, who uses it, what depends on a file) to commands and tells the agent to ask the index before grep, also where an SDD command or skill says to grep |

Setup does not build the index. The first session-start hook or the first query builds it; `musubi-code index` builds it immediately.

## Using it

```bash
musubi-code refs ErrorHandler               # where it is defined (first line), then every reference
musubi-code refs EARSValidator              # "No definition named ..." when it does not exist
musubi-code refs ConstitutionValidator      # every reference, tagged, with the enclosing function
musubi-code refs Widget.render              # a method
musubi-code refs User.save                  # a Python method, the same way
musubi-code callers makeWidget              # distinct calling functions
musubi-code callers make_user
musubi-code deps bin/musubi-validate.js     # files and packages a file uses
musubi-code deps pkg/service.py
musubi-code dependents src/validators/constitution.js
musubi-code symbols constitution.js         # what a file defines and exports
musubi-code status                          # index freshness, per language
musubi-code index                           # rebuild now (every language; --if-stale: only stale ones)
```

`musubi code <command>` is the same command through the main CLI.

Query options: `--file <path>` narrows a name to definitions in matching files, `--limit <n>` caps the references shown (default 100, `0` for all), `--json` prints machine-readable output, `--no-refresh` skips the freshness check, and `--include-properties` also matches object-literal properties.

Example:

```text
ConstitutionLevelManager (class) src/validators/constitution-level-manager.js:149
  21 references in 9 files: 12 new, 8 require, 1 export
  src/cli/validate-articles.js
       10  require  top level                         ConstitutionLevelManager,
       22  new      in printProfileArticles           const profileConfig = await new ConstitutionLevelManager(cwd).getProfileConfig();
```

- The tag (`new`, `extends`, `super`, `call`, `require`, `import`, `export`, `decorator`, `ref`) is read from the source line. The reference itself is resolved by the compiler. In Python, `import x` and `from x import y` lines are `import`, a base class is `extends`, `@name` is `decorator`, `super().name()` is `super`, and a class call `User(...)` is `call`.
- `in <name>` is the innermost named function, method or class around the reference. `top level` means module scope or an anonymous callback.
- A class result includes its constructor calls. For `module.exports = Name` it also lists every file that requires the module. A Python `__init__` is reported as the constructor.

In Claude Code you can simply ask, for example "where is ErrorHandler defined?", "who instantiates ConstitutionLevelManager?" or "what breaks if I delete src/validators/constitution.js?". The `code-references` skill picks the command.

## How it works

1. A hook (session start, or after an edit or shell command) runs `musubi-code index --hook` in the background.
2. The command ignores edits to files outside the index. Otherwise it fingerprints the indexed source files (path, size, modification time) per language and compares each result with `.scip/meta.json`.
3. For every language whose fingerprint changed, it runs that language's indexer under a lock and swaps the new index file in atomically. An edit to a `.py` file leaves the JavaScript index untouched. Triggers that arrive during a build queue one follow-up build instead of starting another.
4. Queries wait for a running build and rebuild the stale languages before answering, so results are correct even without hooks.
5. After each build, the names that both indexes define are written to `.scip/names.json` for the grep reminder. An index without that file counts as stale, so existing indexes get it on their next hook run.
6. If one indexer fails, the other language's index stays in place and usable; the error is in `.scip/index.log`.

### Grep reminder

Instructions alone do not stop an agent from reaching for grep, which is its general-purpose search. So setup also adds synchronous `PreToolUse` hooks that run `musubi-code hint --hook` before the Grep tool and before shell commands that start with `grep`, `rg`, `git grep` (Bash) or `Select-String` (PowerShell). The shell entries use Claude Code's `if` filter, so other commands do not start the hook.

When the search pattern consists only of names that the index defines (word boundaries, `class`, `function`, `new`, `exports.` and a trailing `(` are ignored; `A|B` is allowed), the hook adds a note for Claude:

```text
musubi-code: ErrorHandler and PatternRegistry are defined in the code index:
  ErrorHandler (class) src/orchestration/error-handler.js:613  ->  `musubi-code refs ErrorHandler`
  PatternRegistry (property) src/orchestration/index.js:304  ->  `musubi-code refs PatternRegistry`
  PatternRegistry (class) src/orchestration/pattern-registry.js:106  ->  `musubi-code refs PatternRegistry`
`musubi-code refs` gives the definition, exports and every reference, compiler-resolved.
Keep grep for text: Markdown, templates, comments and string-keyed lookups.
```

The hook never blocks or approves the search. It stays silent for text patterns, for searches limited to paths or file types outside the index (for example `docs/` or `*.md`), for greps that filter piped output, and when `.scip/names.json` is missing. The names list holds classes, functions, methods, module-level variables and exported properties; class fields and other object properties are left out, so common words such as `name` or `path` do not trigger it. It reads only that list, not the index: on this repository a call takes about 0.2 seconds, mostly Node.js start-up.

Nothing is written outside `.scip/`, with one transient exception for src-layout Python projects (below). Projects without a `tsconfig.json` get a generated one in `.scip/tsconfig.json`. The indexer's own `--infer-tsconfig` option is avoided because it creates `./tsconfig.json`. scip-python always receives `.scip/python-environment.json`, so it never runs pip.

## Configuration

Optional, in the project's `package.json` (a Python-only project can add a `package.json` holding just this block):

```json
{
  "scip": {
    "roots": ["src", "test"],
    "exclude": ["src/generated"]
  }
}
```

| Key | Default | Meaning |
| --- | --- | --- |
| `roots` | Existing directories among `bin`, `src`, `lib`, `app`, `scripts`, `tests`, `test`, plus every other top-level directory that holds Python files directly (a package or a scripts directory); otherwise the project root. Top-level Python files (`manage.py`, `conftest.py`, `setup.py`) are indexed as well without widening the roots | Directories to index |
| `exclude` | none | Paths under the roots to skip. `node_modules`, `dist`, `build`, `out`, `coverage`, `.venv`, `venv`, `__pycache__`, `.tox`, `.mypy_cache`, `.pytest_cache`, `.ruff_cache`, `.eggs` and `*.egg-info` are always skipped, by both indexers and by the fingerprint |
| `tsconfig` | `"auto"` | `"auto"` uses `./tsconfig.json` when it exists. `"generated"` always uses `.scip/tsconfig.json` built from `roots` |
| `indexerArgs` | `[]` | Extra scip-typescript arguments, for example `["--yarn-workspaces"]` or `["--pnpm-workspaces"]` |
| `pythonArgs` | `[]` | Extra scip-python arguments |

### Python projects

- scip-python indexes the whole project root; `musubi-code` keeps only the documents under `roots` that `exclude` does not name, so `status` counts what the queries see.
- The index is built with an empty environment (`.scip/python-environment.json` is `[]` unless you maintain it in scip-python's format). First-party code and the standard library resolve; the standard library shows up as `python (standard library)` in `deps`. References into installed third-party packages are not linked.
- src layout (`src/demo/core.py` imported as `demo.core`): when the project has a `src/` directory and no pyright configuration of its own (`pyrightconfig.json`, or `[tool.pyright]` in `pyproject.toml`), the build writes `pyrightconfig.json` with `extraPaths: ["src"]` next to `pyproject.toml` for the duration of the Python build and removes it afterwards. Without it, pyright cannot resolve the package from `tests/` and the references never reach the index. A project with its own pyright configuration must set `extraPaths` itself.
- Windows: scip-python 0.6.x crashes at start-up on Windows ([issue #210](https://github.com/sourcegraph/scip-python/issues/210)); `musubi-code` loads a 10-line preload module that replaces the one invalid pattern, so the unmodified package runs. It is not used on other platforms.
- Python 3.12 and newer syntax is tolerated by the bundled pyright (1.1.301): functions that use t-strings or PEP 695 generics still get definitions and references, but `type X = ...` aliases and PEP 695 type parameters come out with empty names, and nothing inside a t-string resolves.
- Large repositories take a while (Django-size: about 3 minutes); builds run in the background and only the Python index is rebuilt after a `.py` edit. `exclude` large generated or vendored directories.

### Other AI coding agents

GitHub Copilot, Cursor, Codex, Gemini CLI, Qwen Code and Windsurf have no Claude Code skills or hooks. Setup gives them the "Code Navigation" section in their instruction file, and each query refreshes a stale index itself, so no hook is required. They get no grep reminder.

### TypeScript projects and monorepos

- A project with a `tsconfig.json` at the root is indexed with that configuration. Keep `roots` pointing at the directories that tsconfig covers so staleness detection sees the same files.
- For workspaces, set `"indexerArgs": ["--yarn-workspaces"]` or `["--pnpm-workspaces"]` and list the package directories in `roots`.
- Large repositories may need more memory: `NODE_OPTIONS=--max-old-space-size=8192 musubi-code index`.

## Limits

- Only files under the configured roots are indexed. `musubi-code status` shows them, per language.
- Dynamic lookups are invisible to the compiler: `require(variable)`, `importlib.import_module(name)`, `getattr(obj, name)`, registries keyed by strings, `obj[name]()`, and names inside Markdown, YAML or templates. Before deleting or renaming something, also grep for the name as a string.
- Calls on values whose type cannot be inferred, such as untyped parameters, are not linked to a definition. JSDoc type annotations and Python type hints improve resolution.
- Python references into installed third-party packages are not linked (empty environment, above).
- Teammates without MUSUBI installed get no index: their hooks fail silently and the commands are unavailable.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `musubi-code: command not found` | Install or update MUSUBI globally with the command above |
| Hooks never rebuild | Check `.scip/index.log`; start a new session so `.claude/settings.json` is reloaded; confirm the session runs from the project root |
| `could not acquire the index build lock` | A build crashed while holding the lock. The lock expires after 15 minutes or when its process is gone; deleting `.scip/build.lock` also works |
| Query results look outdated | `musubi-code status`, then `musubi-code index` |
| `scip-python exited with status 1` in `.scip/index.log` | The last lines of its output follow the message. A `pyproject.toml` without a `[tool.pyright]` section only produces a warning. Check `"scip"."pythonArgs"`; the JavaScript index keeps working meanwhile |
| A Python definition exists but `refs` finds no uses from `tests/` | src layout with your own pyright configuration: add `"extraPaths": ["src"]` to it |
| A name returns several results | Add `--file <path>` |
| No grep reminder appears | Check that `.scip/names.json` exists (`musubi-code index` writes it) and that `.claude/settings.json` has the `PreToolUse` entries (`musubi-code setup`). The hook runs only for the Grep tool and for shell commands that start with a grep tool |

## Developing MUSUBI itself

- The code lives in `src/code-index/` (`indexer.js` with the language table, `query.js`, `format.js`, `setup.js`, `hint.js`, `scip-python-shim.js`), the CLI in `bin/musubi-code.js`, the skill template in `src/templates/code-index/SKILL.md`, and the tests in `tests/code-index/` (`integration.test.js` for CommonJS, `python.test.js` for Python and src layout, `mixed.test.js` for both languages on one tree; `fixtures.js` holds the fixture projects).
- This repository calls the global `musubi-code`. Link it to the working copy with `npm link` in the repository, so hooks and queries run the code being changed. Its skill, hooks and the sections in `CLAUDE.md` and `AGENTS.md` come from `musubi-code setup`.
- The `package.json` `"scip"` block excludes `src/templates`.

### Upgrading the indexers

The query module reads both indexes with the protobuf bindings in `@sourcegraph/scip-typescript/dist/src/scip.js`, which is not a public API, so both dependencies are pinned to exact versions.

1. Install the new exact version: `npm install --save-exact @sourcegraph/scip-typescript@<version>` or `@sourcegraph/scip-python@<version>`.
2. Run `npx jest tests/code-index`. The end-to-end tests build fixture indexes and decode them with the bundled bindings, so they fail if `dist/src/scip.js` moved or changed shape, or if scip-python's command line changed.
3. Rebuild: `node bin/musubi-code.js index`. The fingerprint includes the indexer version, so hooks in user projects also rebuild on their own.
4. scip-python: once a release contains the fix for issue #210 (PR #224), delete `src/code-index/scip-python-shim.js` and its use in `indexer.js`; the mixed test on Windows shows whether the shim is still needed.
