---
name: code-references
description: |
  Compiler-accurate code navigation for this JavaScript/TypeScript project using a scip-typescript index:
  references, callers, `new X()` instantiations, `extends`, `require()`/import sites, and file
  dependencies/dependents, resolved across files (including CommonJS `module.exports = { X }`).

  Trigger terms: who calls, who uses, who instantiates, who requires, who imports, find references,
  find usages, callers, call sites, dependents, dependencies, impact of changing, safe to delete, dead code,
  where is X used, rename, blast radius

  Use when: you need to know where a class, function, method or file is used before changing, renaming,
  moving or deleting it, or to trace how modules depend on each other. Prefer this over grep for symbol
  usage; use grep only for strings, comments and dynamic lookups.
allowed-tools: [Read, Grep, Glob, 'Bash(musubi-code *)', 'PowerShell(musubi-code *)']
---

# Code References (scip-typescript)

`musubi-code` answers usage questions from `.scip/index.scip`, a SCIP index built by
`@sourcegraph/scip-typescript` with the TypeScript compiler. Unlike grep it resolves aliases,
destructured `require()` bindings and method calls on typed receivers; unlike editor "find references"
it follows `module.exports = { X }` across files.

## Commands

Run from the project root. Each query rebuilds the index first when source files changed; the hooks in
`.claude/settings.json` usually keep it fresh already.

| Question                                 | Command                                          |
| ---------------------------------------- | ------------------------------------------------ |
| Every use of a class, function or method | `musubi-code refs UserService`                  |
| A method                                 | `musubi-code refs UserService.save`             |
| Which functions call or instantiate it   | `musubi-code callers createOrder`               |
| What a file depends on (files, packages) | `musubi-code deps src/app.js`                   |
| Which files depend on a file             | `musubi-code dependents src/services/user.js`   |
| Definitions in a file                    | `musubi-code symbols user.js`                   |
| Index state                              | `musubi-code status`                            |
| Rebuild now                              | `musubi-code index`                             |

Options: `--file <path>` narrows a name to definitions in matching files, `--limit <n>` caps references
per definition (default 100, `0` for all), `--json` gives machine-readable output, `--no-refresh` skips the
freshness check, `--include-properties` also matches object-literal properties.

File arguments accept a path relative to the project root or a unique suffix such as `user.js`.

## Reading the output

```
Widget (class) lib/widget.js:1
  6 references in 3 files: 2 new, 2 require, 1 extends, 1 export
  lib/app.js
        1  require  top level                         const { makeWidget, Widget } = require('./widget');
        4  new      in main                           const plain = new Widget('plain');
```

- Each reference has a tag: `new`, `extends`, `super`, `call`, `require`, `import`, `export` or `ref`.
  The reference itself is compiler-resolved; the tag is read from the surrounding source line.
- `in <name>` is the innermost named function, method or class containing the reference. `top level`
  means module scope or an anonymous callback (for example a test callback or a CLI action handler).
- A class result includes its constructor calls (`new`), and for `module.exports = Name` every file that
  requires the module.
- Several results for one name mean several definitions; use `--file` to pick one.

## Workflow for changes

1. Before renaming, moving or deleting a symbol, run `refs` (or `callers`) and read every listed site.
2. Before deleting or moving a file, run `dependents <file>`.
3. Then grep once for the name as a string, because the index cannot see dynamic lookups:
   `require(variable)`, registries keyed by strings, `obj[name]()`, and text in Markdown, YAML or templates.
4. After editing, the PostToolUse hook rebuilds the index in the background; the next query waits for it.

## Limits

- Only the directories in `package.json` `"scip"."roots"` are indexed (default: whichever of `bin`, `src`,
  `lib`, `app`, `scripts`, `tests`, `test` exist). `musubi-code status` shows the roots.
- Calls on values whose type TypeScript cannot infer (untyped parameters, `any`) are not resolved to a
  definition. JSDoc types improve this.
- If the index cannot be built, `musubi-code index` prints the reason.

This skill is managed by MUSUBI (`musubi-code setup`); running setup again overwrites local edits.
