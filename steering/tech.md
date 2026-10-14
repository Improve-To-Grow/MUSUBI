# Technology Stack

**Project**: MUSUBI (ITG fork)
**Last Updated**: 2026-10-14
**Version**: 6.3.1-itg.3

---

## Overview

MUSUBI is a Node.js command-line tool and library written in CommonJS JavaScript, without a build
step. The Improve To Grow (ITG) fork of [nahisaho/MUSUBI](https://github.com/nahisaho/MUSUBI) is
distributed from GitHub as the private package `@improve-to-grow/musubi-sdd` and is never
published to the npm registry. A global install provides the `musubi-*` commands; a project-local
install of the same GitHub URL provides the `require('@improve-to-grow/musubi-sdd')` library.

```bash
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'   # install and update
```

---

## Primary Technologies

### Programming Languages

| Language   | Version                                                                     | Role      | Where                                                                                                                    |
| ---------- | --------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| JavaScript | CommonJS; ES2021+ syntax (`ecmaVersion: latest`); Node.js >= 18 (`engines`) | Primary   | `bin/` (27 scripts), `src/` and `tests/` (397 files outside `src/templates/`, the code-index count; 156 test suites)     |
| TypeScript | 5.x                                                                         | Secondary | `packages/vscode-extension/` only (27 files); a separate, unpublished package, not part of the npm package                |
| Python     | 3                                                                           | Utility   | `convert-agents-to-skills.py` at the repository root                                                                     |
| Markdown   |                                                                             | Content   | 432 files: agent, skill and command templates under `src/templates/`, `docs/`, `steering/`, `storage/`, `.claude/`       |

Nothing is transpiled: `.scip/tsconfig.json` exists only for the code index, and the package ships
no type declarations (CHANGE-004). CI runs the suite on Node 18.x (`ci.yml`, `release.yml`) and
Node 20 (constitutional, traceability and docs workflows).

### Runtime Dependencies

| Package                         | Version       | Used for                                                                                   |
| ------------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `commander`                     | ^11           | Argument parsing in every `bin/` script                                                    |
| `inquirer`                      | ^9 (ESM)      | Prompts in `musubi-init`, `musubi-onboard`, `musubi-requirements`, `musubi-design`, `musubi-sync`; loaded with dynamic `import()` |
| `chalk`                         | ^4            | Terminal colours                                                                           |
| `open`                          | ^10           | Opens the Web GUI in a browser (`musubi-gui`)                                              |
| `fs-extra`                      | ^11           | File operations throughout                                                                 |
| `glob`                          | ^10           | File discovery in `musubi-analyze`, `musubi-onboard`, `musubi-share`, `musubi-sync`        |
| `js-yaml`                       | ^4            | `steering/project.yml` and workflow YAML (`musubi-config`, `musubi-sync`, `musubi-share`, constitutional checker) |
| `yaml`                          | ^2            | Traceability matrix storage (`src/traceability/matrix-storage.js`)                         |
| `gray-matter`                   | ^4            | Front matter of specs and skills in the GUI services                                       |
| `chokidar`                      | ^4            | File watching for the GUI (`src/gui/services/file-watcher.js`)                             |
| `ajv`, `ajv-formats`            | ^8, ^2        | `project.yml` validation against `src/schemas/project-schema.json`                         |
| `express`, `cors`, `ws`         | ^4, ^2, ^8    | Web GUI server with WebSocket updates (`src/gui/server.js`)                                |
| `@octokit/rest`                 | ^22           | GitHub API (`src/integrations/github-client.js`, `musubi-resolve`, `musubi-release`)       |
| `playwright`                    | ^1.40         | Browser automation agent (`src/agents/browser/`, `musubi-browser`)                         |
| `@sourcegraph/scip-typescript`  | 0.4.0 (exact) | JavaScript/TypeScript code index (`src/code-index/`)                                       |
| `@sourcegraph/scip-python`      | 0.6.6 (exact) | Python code index; on Windows runs behind `src/code-index/scip-python-shim.js`             |

### Development Dependencies

| Package                  | Version | Used for                                                            |
| ------------------------ | ------- | ------------------------------------------------------------------- |
| `jest`                   | ^30.5   | Test runner (upgraded from 29 on 2026-10-07 for the release audit) |
| `eslint`                 | ^8.50   | Linting with `eslint:recommended` (`.eslintrc.json`, legacy config) |
| `eslint-config-prettier` | ^10     | Disables ESLint rules that conflict with Prettier                   |
| `prettier`               | ^3      | Formatting                                                          |

---

## Testing

- **Runner**: Jest 30, `testEnvironment: node`, `testMatch: tests/**/*.test.js`, `maxWorkers: 1`
  and `forceExit: true` (swarm tests leave timers; coverage workers clash on temp directories).
- **Coverage**: collected from `src/**/*.js` without `src/templates/`; global thresholds are
  60% statements, 60% lines, 60% functions and 45% branches (`jest.config.js`). The
  `reviewGate.implementation.minCoverage` of 80% in `steering/project.yml` applies to SDD
  features, not to the global gate.
- **End-to-end scripts**: `tests/e2e/` is excluded by a separator-agnostic ignore pattern; the
  scripts call `process.exit()` and need a live Ollama or large fixtures. Run them directly:
  `node tests/e2e/ollama-e2e.test.js`.
- **Documentation tests**: `tests/helpers/live-documentation.js` executes code samples from the
  docs; `tests/index.test.js` checks every export of `src/index.js`, the deprecated aliases and
  every name the documentation imports from the package.
- **Policy suites**: `tests/language-policy.test.js` (no CJK text under `src/`, `bin/`, `tests/`,
  `steering/`, `docs/`), `tests/package-name.test.js` (fork package name and install command),
  `tests/code-navigation-guidance.test.js` (index-first instructions in the agent files).

## Lint and Format

| Script                 | Command                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm test`             | `jest`                                                            |
| `npm run test:watch`   | `jest --watch`                                                    |
| `npm run test:coverage`| `jest --coverage`                                                 |
| `npm run lint`         | `eslint bin/ src/ tests/`                                         |
| `npm run lint:fix`     | `eslint bin/ src/ tests/ --fix`                                   |
| `npm run format`       | `prettier --write bin/ src/ tests/`                               |
| `npm run format:check` | `prettier --check 'bin/**/*.js' 'src/**/*.js' 'tests/**/*.js'`    |

ESLint: `env` node, es2021, jest; unused variables and arguments are allowed when prefixed with
`_`; `no-console` is off. Prettier: semicolons, single quotes, trailing commas `es5`, print width
100, two-space indent, `arrowParens: avoid`, `endOfLine: lf`. The working copy on Windows is CRLF
through `core.autocrlf = true`; git stores LF.

---

## CI/CD

| Workflow                                      | Trigger                | Jobs                                                                                                               |
| --------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ci.yml` (CI)                                 | pull request to any branch; push to `main` only | `lint` (eslint, prettier check), `test` (jest with coverage, e2e excluded), `build`, `audit`, `platform-tests`; Node 18.x |
| `release.yml` (Release)                       | tag `v*.*.*`           | `verify` (tests, lint, `npm audit --audit-level=high --omit=dev`), `create-github-release` with the pinned install command; no npm publish |
| `constitutional-check.yml`                    | pull request or push to `main` or `develop` | `constitutional-check` on changed sources, `phase-minus-one-gate`; Node 20                             |
| `constitutional-governance.yml`               | push to `main` or `develop`, pull request to `main`, manual | `constitutional-validation`, `steering-sync`, `traceability-check`; Node 20                |
| `traceability-check.yml`                      | pull request to `main` or `develop`, push to `main`, manual | `traceability` (installs the package globally, runs trace and gap checks); Node 20         |
| `docs.yml` (Deploy Documentation)             | push to `main` touching `website/`, manual | `build` (VitePress in `website/`), `deploy` to GitHub Pages; Node 20                                        |
| `musubi-reusable.yml`                         | `workflow_call`        | `musubi`: reusable workflow for consumer repositories; installs the fork from GitHub; Node 18                        |

On this fork only `ci.yml` (through pull requests) and `release.yml` (through tags) run: the
other workflows still filter on `main` and `develop`, which the fork does not use, and `ci.yml`
does not run on a direct push to `ITG-adjustments`.

`action.yml` is a composite GitHub Action (inputs `command` = validate, analyze, trace or gaps,
`feature`, `node-version` 18, `working-directory`, `fail-on-gaps`, `constitution-check`).
`templates/ci-cd/` holds a `Jenkinsfile` and a `gitlab-ci.yml` for consumer projects.

---

## Distribution and Versioning

- **Package**: `@improve-to-grow/musubi-sdd`, `"private": true`, `main: src/index.js`, no
  `exports` map (library subpaths are file paths such as
  `@improve-to-grow/musubi-sdd/src/orchestration`). `files`: `bin/`, `src/`, `README.md`,
  `LICENSE`.
- **Commands**: 25 `bin` entries in `package.json` (`musubi`, `musubi-sdd` and 23 `musubi-*`
  commands). `bin/musubi-checkpoint.js`, `bin/musubi-costs.js` and `bin/musubi-dashboard.js` exist
  but are not registered as commands.
- **Version scheme**: `<upstream base>-itg.<N>`; bump with
  `npm version prerelease --preid itg --no-git-tag-version` for every merged change that affects
  installed users, add a `CHANGELOG.md` entry, tag `v<version>`. Tags so far: `v6.3.1-itg.1`,
  `v6.3.1-itg.2`; 6.3.1-itg.3 is in `package.json` and the changelog but not yet tagged.
- **Never** `npx` (downloads the upstream registry package) or `npm update -g` (cannot update a
  GitHub install).

---

## Development Environment

### Required Tools

- Node.js >= 18 (CI covers 18 and 20) and npm; `package-lock.json` is the lock file.
  `pnpm-workspace.yaml` is a leftover: only `packages/vscode-extension/` has code, and
  `packages/cli`, `core` and `web` are empty.
- Git 2.40+; on Windows `core.autocrlf = true`.
- Python 3 only for `convert-agents-to-skills.py`; the Python indexer runs without an interpreter.
- Optional: Ollama for `tests/e2e/ollama-e2e.test.js`; a GitHub token for `musubi-resolve` and
  `musubi-release`.

### Agent Tooling

- Claude Code: `.claude/commands/sdd-*.md`, 26 skills under `.claude/skills/`, hooks in
  `.claude/settings.json`; `CLAUDE.md` carries the project instructions.
- GitHub Copilot and Cursor: root `AGENTS.md`, `.github/AGENTS.md`, `.github/prompts/`.
- `packages/vscode-extension/`: MUSUBI's own VS Code extension (TypeScript), developed separately.

---

## Code Navigation

| Tool | Use for |
|------|---------|
| `musubi-code` (scip-typescript 0.4.0 for JavaScript, scip-python 0.6.6 for Python; one index per language in `.scip/`; roots `bin`, `src`, `tests` plus the root-level `convert-agents-to-skills.py`, without `src/templates`) | Symbol questions: does X exist, where is it defined, what a file exports, who references, calls or instantiates X, file dependencies and dependents |
| grep, the Grep tool | Text: Markdown, templates, YAML and JSON, comments, string-keyed registries, dynamic `require()` paths |

Answer symbol questions with `musubi-code` before grep, also inside `/sdd-*` commands and
skills: `musubi-code refs <Name>` (definition and every reference; "No definition named" means it
does not exist), `musubi-code symbols <file>`, `musubi-code callers <Name>`,
`musubi-code deps <file>`, `musubi-code dependents <file>`. Analysis records say which facts came
from the index and which from grep. A PreToolUse hook blocks a grep that searches only for indexed
names and points to `refs`; quote the name (`'Name'`) to search it as text. Commands: `CLAUDE.md`
"Code Navigation"; guide: `docs/guides/scip-typescript.md`.

Hooks in `.claude/settings.json`: `SessionStart` (startup, resume) and `PostToolUse` (Edit, Write,
MultiEdit, Bash, PowerShell) run `musubi-code index --hook` asynchronously; `PreToolUse` runs
`musubi-code hint --hook` before the Grep tool, before `grep`, `rg` and `git grep` in Bash and
before `Select-String` in PowerShell. The index lives in `.scip/` (ignored) and rebuilds in about
18 seconds for the 397 JavaScript files.

---

## Architecture Decisions

| Decision                                        | Choice                                                                 | Rationale                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Module system                                   | CommonJS, no build step                                                | The library and CLI run from the checkout on Node 18 without transpiling; `require()` graph stays indexable |
| Distribution                                    | Private scoped package installed from GitHub (6.3.1-itg.1)             | The npm registry holds upstream only; the scoped name stops `npm update -g` from replacing the fork          |
| Code navigation                                 | scip-typescript and scip-python replace CodeGraph MCP (6.3.1-itg.2, CHANGE-006) | CodeGraph recorded no `require()` or cross-file `new X()` edges for CommonJS code                            |
| Indexer versions                                | Exact pins (0.4.0, 0.6.6)                                              | Index format and CLI flags change between indexer releases                                                  |
| Test runner                                     | Jest 30 (a582b3f, 2026-10-07)                                          | Upgraded together with limiting the release audit to shipped dependencies (`--omit=dev`)                    |
| Language                                        | English only (CHANGE-002)                                              | One language for documents, agent chat, reports and CLI output; enforced by `tests/language-policy.test.js` |
| Test isolation                                  | `maxWorkers: 1`, `forceExit: true`                                     | Swarm tests leave timers; parallel coverage workers clash on temp directories                              |

---

*Maintained with `/sdd-steering` (Sync mode). `musubi sync` refreshes the version, language and framework lists mechanically; review its output.*
