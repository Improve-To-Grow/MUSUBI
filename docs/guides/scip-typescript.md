# Code Navigation with musubi-code

`musubi-code` answers questions such as "where is `ErrorHandler` defined?", "does `EARSValidator` exist?", "who instantiates `ConstitutionValidator`?", "which functions call `makeWidget`?" and "which files depend on `src/validators/constitution.js`?" for JavaScript and TypeScript projects, with compiler accuracy.

It ships with MUSUBI. `musubi init` and `musubi upgrade` set it up in a project, so AI coding agents use it before grep. In Claude Code a skill tells the agent when to use it, hooks keep its index fresh without anyone running a command, and a reminder hook points grep searches for indexed names to it.

## Why scip-typescript

`musubi-code` is built on [`@sourcegraph/scip-typescript`](https://github.com/sourcegraph/scip-typescript), which indexes a project with the TypeScript compiler and writes a [SCIP](https://github.com/sourcegraph/scip) index: every definition and every reference, resolved across files. For CommonJS code that means destructured `require()` bindings, `new X()` calls, `extends` clauses and method calls all point at the right definition.

The usual alternatives fall short on CommonJS:

| Approach | Gap |
| --- | --- |
| grep | Misses aliases and destructured bindings; matches comments and strings |
| Editor "find references" (TypeScript language service) | Does not follow `module.exports = { X }`; from the class it finds only the export line |
| Tree-sitter code graphs (codegraph-mcp, Shotgun, cartog and others) | Record no `require()` or cross-file `new X()` edges for CommonJS |

On the MUSUBI repository the index covers about 385 files, builds in about 15 seconds, takes about 23 MB, and answers a query in about one second.

## Setting it up

MUSUBI must be installed globally, because the hooks, skill and instructions call the `musubi-code` command:

```bash
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
```

| Situation | How |
| --- | --- |
| New project | `musubi init` asks "Set up compiler-accurate code navigation for AI agents?" when the project uses JavaScript/TypeScript or already has a `package.json`/`tsconfig.json`. `--code-index` and `--no-code-index` answer it in advance |
| Existing MUSUBI project | `musubi upgrade` adds it to JavaScript/TypeScript projects that lack it, even when the project is already at the current version. `--dry-run` previews, `--no-code-index` skips |
| Any JavaScript/TypeScript project | `musubi-code setup` in the project directory |

`musubi-code setup` options:

| Option | Meaning |
| --- | --- |
| `--agent <agent...>` | Agents to configure: `claude-code`, `github-copilot`, `cursor`, `gemini-cli`, `codex`, `qwen-code`, `windsurf`, or their short aliases. Default: the agents whose files the project already has, else Claude Code |
| `--dry-run` | Show what would change without writing |
| `--force` | Also set up a directory without `package.json`, `tsconfig.json` or `jsconfig.json` |
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
musubi-code callers makeWidget              # distinct calling functions
musubi-code deps bin/musubi-validate.js     # files and packages a file uses
musubi-code dependents src/validators/constitution.js
musubi-code symbols constitution.js         # what a file defines and exports
musubi-code status                          # index freshness
musubi-code index                           # rebuild now
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

- The tag (`new`, `extends`, `super`, `call`, `require`, `import`, `export`, `ref`) is read from the source line. The reference itself is resolved by the compiler.
- `in <name>` is the innermost named function, method or class around the reference. `top level` means module scope or an anonymous callback.
- A class result includes its constructor calls. For `module.exports = Name` it also lists every file that requires the module.

In Claude Code you can simply ask, for example "where is ErrorHandler defined?", "who instantiates ConstitutionLevelManager?" or "what breaks if I delete src/validators/constitution.js?". The `code-references` skill picks the command.

## How it works

1. A hook (session start, or after an edit or shell command) runs `musubi-code index --hook` in the background.
2. The command ignores edits to files outside the index. Otherwise it fingerprints the indexed source files (path, size, modification time) and compares the result with `.scip/meta.json`.
3. When the fingerprint changed, it runs scip-typescript under a lock and swaps the new index in atomically. Triggers that arrive during a build queue one follow-up build instead of starting another.
4. Queries wait for a running build and rebuild a stale index before answering, so results are correct even without hooks.
5. After each build, the names that the index defines are written to `.scip/names.json` for the grep reminder. An index without that file counts as stale, so existing indexes get it on their next hook run.

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

Nothing is written outside `.scip/`. Projects without a `tsconfig.json` get a generated one in `.scip/tsconfig.json`. The indexer's own `--infer-tsconfig` option is avoided because it creates `./tsconfig.json`.

## Configuration

Optional, in the project's `package.json`:

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
| `roots` | Existing directories among `bin`, `src`, `lib`, `app`, `scripts`, `tests`, `test`, otherwise the project root | Directories to index |
| `exclude` | none | Paths under the roots to skip. `node_modules`, `dist`, `build`, `out` and `coverage` are always skipped |
| `tsconfig` | `"auto"` | `"auto"` uses `./tsconfig.json` when it exists. `"generated"` always uses `.scip/tsconfig.json` built from `roots` |
| `indexerArgs` | `[]` | Extra scip-typescript arguments, for example `["--yarn-workspaces"]` or `["--pnpm-workspaces"]` |

### Other AI coding agents

GitHub Copilot, Cursor, Codex, Gemini CLI, Qwen Code and Windsurf have no Claude Code skills or hooks. Setup gives them the "Code Navigation" section in their instruction file, and each query refreshes a stale index itself, so no hook is required. They get no grep reminder.

### TypeScript projects and monorepos

- A project with a `tsconfig.json` at the root is indexed with that configuration. Keep `roots` pointing at the directories that tsconfig covers so staleness detection sees the same files.
- For workspaces, set `"indexerArgs": ["--yarn-workspaces"]` or `["--pnpm-workspaces"]` and list the package directories in `roots`.
- Large repositories may need more memory: `NODE_OPTIONS=--max-old-space-size=8192 musubi-code index`.

## Limits

- Only files under the configured roots are indexed. `musubi-code status` shows them.
- Dynamic lookups are invisible to the compiler: `require(variable)`, registries keyed by strings, `obj[name]()`, and names inside Markdown, YAML or templates. Before deleting or renaming something, also grep for the name as a string.
- Calls on values whose type cannot be inferred, such as untyped parameters, are not linked to a definition. JSDoc type annotations improve resolution.
- Teammates without MUSUBI installed get no index: their hooks fail silently and the commands are unavailable.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `musubi-code: command not found` | Install or update MUSUBI globally with the command above |
| Hooks never rebuild | Check `.scip/index.log`; start a new session so `.claude/settings.json` is reloaded; confirm the session runs from the project root |
| `could not acquire the index build lock` | A build crashed while holding the lock. The lock expires after 15 minutes or when its process is gone; deleting `.scip/build.lock` also works |
| Query results look outdated | `musubi-code status`, then `musubi-code index` |
| A name returns several results | Add `--file <path>` |
| No grep reminder appears | Check that `.scip/names.json` exists (`musubi-code index` writes it) and that `.claude/settings.json` has the `PreToolUse` entries (`musubi-code setup`). The hook runs only for the Grep tool and for shell commands that start with a grep tool |

## Developing MUSUBI itself

- The code lives in `src/code-index/` (`indexer.js`, `query.js`, `format.js`, `setup.js`, `hint.js`), the CLI in `bin/musubi-code.js`, the skill template in `src/templates/code-index/SKILL.md`, and the tests in `tests/code-index/`.
- This repository calls the global `musubi-code`. Link it to the working copy with `npm link` in the repository, so hooks and queries run the code being changed. Its skill, hooks and the sections in `CLAUDE.md` and `AGENTS.md` come from `musubi-code setup`.
- The `package.json` `"scip"` block excludes `src/templates`.

### Upgrading scip-typescript

The query module reads the index with the protobuf bindings in `@sourcegraph/scip-typescript/dist/src/scip.js`, which is not a public API, so the dependency is pinned to an exact version.

1. Install the new exact version: `npm install --save-exact @sourcegraph/scip-typescript@<version>`.
2. Run `npx jest tests/code-index`. The end-to-end test builds a fixture index and decodes it with the bundled bindings, so it fails if `dist/src/scip.js` moved or changed shape.
3. Rebuild: `node bin/musubi-code.js index`. The fingerprint includes the indexer version, so hooks in user projects also rebuild on their own.
