# Project Structure

**Project**: MUSUBI (ITG fork)
**Last Updated**: 2026-10-14
**Version**: 6.3.1-itg.3

---

## Architecture Pattern

**Primary Pattern**: Command-line tool over a library core (constitution profile `cli`)

MUSUBI is one npm package with three parts. Thin command scripts in `bin/` parse arguments and
call modules in `src/`, which hold every piece of feature logic and are also exported as a library
through `src/index.js`. The third part, `src/templates/`, is not code that runs inside MUSUBI: it
is the content that `musubi init`, `musubi upgrade` and `musubi-code setup` copy into user
projects (agent instructions, skills, commands, memory files, architecture templates).

```
bin/musubi-*.js          delivery path: one script per command, plus the `musubi` dispatcher
      │ require()
      ▼
src/<concern>/*.js       core path: analyzers, generators, validators, managers, orchestration, …
      │ module.exports
      ▼
src/index.js             library entry point: every public class under its own name
src/templates/           installed content, read only by init, upgrade and setup
```

### Template Layers (ITG fork)

`steering/` (this folder) is memory for agents working on MUSUBI itself and is not shipped.
`src/templates/shared/steering/` and `src/templates/shared/steering/rules/itg/` are what
`musubi init` installs into ITG projects; they implement the ITG Software Delivery Playbook
(`docs/itg/`). The rules for changing them, with a diagram of the layers, are in
[rules/itg-fork.md](rules/itg-fork.md).

### Layers

| Layer              | Location                                                   | Holds                                                                                                     | Rules                                                                              |
| ------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Delivery           | `bin/`                                                     | 27 scripts; `bin/musubi.js` dispatches `init`, `status`, `validate`, `sync`, `upgrade`, `code`, `info`     | Argument parsing, prompts, console output; no feature logic                        |
| Core               | `src/` except `src/templates/`                             | 24 concern directories plus `phase4-integration.js` and `phase5-integration.js`                           | May use any dependency directly (I-4); SHALL NOT `require()` from `bin/` (I-3)      |
| Library entry      | `src/index.js`                                             | Aggregated exports and the deprecated aliases from CHANGE-003                                             | Every export defined; `tests/index.test.js` checks each name                       |
| Integration edges  | `src/cli/`, `src/gui/`, `src/dashboard/`, `src/integrations/` | Shared CLI helpers, Express and WebSocket servers, GitHub, MCP and CI/CD clients                        | All I/O with external systems lives here                                           |
| Installed content  | `src/templates/`                                           | `agents/<platform>/`, `skills/`, `memories/`, `architectures/`, `code-index/`, `shared/`                  | Excluded from coverage and from the code index; reaches users only through install |

### Core Concerns (`src/`)

| Directory                                     | Responsibility                                                                                                  |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `agents/`                                     | Agent loop, registry, function tools, browser automation agent (`agents/browser/`, Playwright)                   |
| `ai/`, `enterprise/`, `performance/`, `monitoring/` | Phase 6 modules: advanced AI, multi-tenant and rollback, caching and lazy loading, cost tracking and observability |
| `analyzers/`                                  | Complexity, AST extraction, gap, impact, security, stuck-agent, large-project and traceability analysis          |
| `cli/`                                        | Helpers shared by `bin/`: init generators, validate articles, guardrail options, dashboard CLI                   |
| `code-index/`                                 | scip-typescript and scip-python indexing, queries, the grep guard (`hint.js`), project setup                     |
| `constitutional/`                             | Articles, checker, EARS checks, code metrics and rules, Phase -1 gate, paths, steering sync, CI reporter         |
| `converters/`                                 | Spec Kit and MUSUBI format conversion (`parsers/`, `ir/`, `writers/`)                                            |
| `dashboard/`, `gui/`                          | Workflow dashboard, sprint planning; the Web GUI server and its services                                         |
| `generators/`                                 | Requirements, design, tasks, changelog and Rust migration generators                                              |
| `integrations/`                               | GitHub client, MCP connector, CI/CD manager, platform definitions, tool discovery                                 |
| `llm-providers/`                              | Anthropic, OpenAI, Copilot and Ollama providers behind `base-provider.js`                                        |
| `managers/`                                   | Agent memory and condenser, change and delta-spec management, checkpoints, workflows and modes, skills, packages |
| `orchestration/`                              | Orchestration engine, skill registry and executor, guardrails, patterns, reasoning, replanning                   |
| `reporters/`, `resolvers/`, `schemas/`        | Coverage and traceability reports; GitHub issue resolver; `project-schema.json`                                  |
| `steering/`                                   | Steering auto-update, validation, quality metrics, template constraints                                           |
| `traceability/`                               | Requirement extraction, gap detection, matrix storage                                                             |
| `validators/`                                 | Constitution and level management, project files, requirements and design reviewers, delta format, critic system |

---

## Directory Organization

### Root Structure

```
MUSUBI/
├── bin/                        # CLI entry points (delivery path)
├── src/                        # Library core (core path); src/index.js is the package entry
│   └── templates/              # Content installed into user projects
├── tests/                      # Jest suites mirroring src/, plus cross-cutting suites
│   ├── e2e/                    # Scripts run directly with node (excluded from jest)
│   └── helpers/                # live-documentation.js executes code samples from the docs
├── docs/                       # Guides, analysis, design, plans, research, API and user guides
├── website/                    # VitePress documentation site (GitHub Pages)
├── steering/                   # Project memory: core files, project.yml, rules/, templates/, memories/
├── storage/                    # SDD artifacts (see below)
├── templates/ci-cd/            # Jenkinsfile and gitlab-ci.yml for consumer projects
├── packages/vscode-extension/  # MUSUBI VS Code extension (TypeScript); cli/, core/, web/ are empty
├── orchestrator/reports/       # Historical phase and sprint reports
├── .claude/                    # Claude Code commands, skills, settings.json (hooks), AGENTS.md
├── .github/workflows/          # CI, release, constitutional, traceability, docs, reusable workflow
├── .scip/                      # Generated code index (ignored)
├── coverage/                   # Generated by jest --coverage (ignored)
├── action.yml                  # Composite GitHub Action
├── convert-agents-to-skills.py # Root-level Python utility
├── jest.config.js, .eslintrc.json, .prettierrc.json
├── CLAUDE.md, AGENTS.md        # Agent instructions (Claude Code; Copilot and Cursor)
└── *-DESIGN.md, PROJECT-PLAN-MUSUBI.md, … # Historical design records at the root
```

### Navigating the Code

`musubi-code` indexes `bin/`, `src/`, `tests/` and the root-level `convert-agents-to-skills.py`
(JavaScript with scip-typescript, Python with scip-python), but not `src/templates/` or Markdown.
Look up definitions, exports, references and file dependencies with `musubi-code refs <Name>`,
`musubi-code symbols <file>`, `musubi-code callers <Name>` and
`musubi-code deps|dependents <file>` before grep. Grep the unindexed parts (`src/templates/`,
`docs/`, `steering/`, `storage/`) for text, and grep once for the quoted name (`'Name'`) before
renaming or deleting it (dynamic `require()` paths and string-keyed registries are invisible to the
index; a bare-name grep for an indexed name is blocked by the guard hook).

---

## Testable-Core Pattern (Article I)

Feature logic lives in core modules that are tested without the CLI (Article I: Testable-Core
Principle). The project profile decides what a core module is.

### Profile and Paths

Declared under `constitution:` in `steering/project.yml` (see "Project Profiles" in
`steering/rules/constitution.md`).

| Setting        | Value  | Holds                                                                     |
| -------------- | ------ | ------------------------------------------------------------------------- |
| Profile        | `cli`  | Command-line tool (P-1); Articles I and II at level `critical`            |
| Core paths     | `src/` | Feature logic (I-1), including the library entry point                    |
| Delivery paths | `bin/` | CLI entry points                                                          |
| Adapter paths  | none   | Only the `application` profile declares them                              |

Rules for every profile:

- The project SHALL place feature logic under a core path (I-1).
- Each core module SHALL have tests that run without starting the app, a browser or a CLI (I-2).
- A core module SHALL NOT import from a delivery path (I-3).
- Direct use of a framework or platform SDK in a core module is not a violation (I-4).
- Each exported function and class of a core module SHALL have a doc comment (`/** … */`) directly above its declaration (I-5, advisory).

### Module Layout

With `core_paths: [src]` the `cli` profile's "one library per feature" (I-L1) maps onto one
directory per concern under `src/`, not onto `lib/<feature>/` packages:

```
src/<concern>/
├── index.js                 # Public API of the concern, where one exists (orchestration, steering, managers, …)
├── <kebab-name>.js          # One class or module per file; `module.exports = { ClassName, CONSTANT }`
└── <sub-area>/              # Larger concerns split further (orchestration/guardrails, patterns, reasoning, replanning)

tests/<concern>/<kebab-name>.test.js   # Suite per module, run without the CLI (I-2)
bin/musubi-<command>.js                # commander arguments, inquirer prompts, chalk output; calls src/
```

#### Guidelines

- **No logic in bin/**: a command script validates arguments, calls one or more core modules and
  prints the result; `bin/musubi.js` delegates its subcommands to the `musubi-*` scripts.
- **Public API**: every public class is exported from `src/index.js` under its own name; a renamed
  export keeps a deprecated alias (CHANGE-003). Library subpaths are file paths from the package
  root, for example `@improve-to-grow/musubi-sdd/src/orchestration`, because `package.json`
  declares no `exports` map (CHANGE-004).
- **Automation interface** (Article II): every command exposes `--help` and conventional exit
  codes; long-running commands offer `--dry-run` where they change files (`musubi sync`,
  `musubi upgrade`, `musubi-code setup`).
- **Templates are content**: a change under `src/templates/` reaches users only through
  `musubi init` or `musubi upgrade`; the repository's own copies under `.claude/` are refreshed by
  re-running init for Claude Code.

---

## Test Organization

### Test Structure

```
tests/
├── <concern>/                # Mirrors src/: agents, analyzers, cli, code-index, constitutional, … validators
├── *.test.js                 # Cross-cutting suites: index exports, language policy, package name, init platforms, …
├── e2e/                      # enterprise-scale and Ollama scripts; call process.exit, run with node directly
├── helpers/                  # live-documentation.js runs the code samples of the docs
└── test-output/              # Scratch output written by suites
```

### Test Guidelines

- **Test-First**: tests written before implementation (Article III, III-1); change proposals list
  the suites they add.
- **Real services**: suites exercise the real file system in temporary directories (Article IX);
  mocks only where IX-4 allows them, each justified (IX-5).
- **Coverage**: global thresholds 60% statements, lines and functions, 45% branches
  (`jest.config.js`); `src/templates/` excluded.
- **Naming**: `<module>.test.js` next to the mirrored path; e2e scripts keep the `.test.js` suffix
  but are excluded by the jest ignore pattern.
- **Windows**: compare paths separator-agnostically (`path.join` against `path.join`, never against
  a literal `/`); the e2e ignore pattern is written for both separators.

---

## Documentation Organization

```
docs/
├── guides/                 # User-facing guides (scip-typescript, sdd-command-flows, change management, CLI reference, …)
├── analysis/               # Framework comparisons and analyses (SERENA steering comparison, SDD framework summary)
├── design/, plans/, requirements/, tasks/, research/, internal-specs/   # Design and planning records
├── examples/, snippets/, assets/, marketing/
└── API-REFERENCE.md, USER-GUIDE.md, QUICKSTART.md, github-action.md, BRANCH-PROTECTION-SETUP.md
website/                    # VitePress site: guide/, reference/, agents/, skills/, api/, examples/
```

Release history lives only in `CHANGELOG.md`; the README and steering files link to it.

---

## SDD Artifacts Organization

```
storage/
├── specs/                  # <feature>-requirements.md
├── design/                 # <feature>-design.md
├── tasks/                  # <feature>-tasks.md
├── changes/                # Active delta records: CHANGE-NNN/ (proposal, delta.md) and change-log.md
├── archive/<year>/CHANGE-NNN/   # Archived changes: proposal, implementation report, archive report, delta JSON, README
├── traceability/           # matrix.yml (from `traceability.outputPath` in project.yml)
├── reviews/, transitions/, workflows/, dashboard/   # Review results, workflow state and dashboards
```

Archived change records are moved by hand into `storage/archive/<year>/<change-id>/`, and the row
in `storage/changes/change-log.md` is updated with the commits and the archive path.

---

## Naming Conventions

### File Naming

- **Modules and scripts**: `kebab-case.js` (`agent-memory.js`, `bin/musubi-change.js`)
- **Tests**: `<module>.test.js` under the mirrored `tests/<concern>/` path
- **Templates and documents**: `kebab-case.md`; SDD artifacts `<feature>-requirements.md`,
  `<feature>-design.md`, `<feature>-tasks.md`
- **Change records**: `CHANGE-NNN.md`, `CHANGE-NNN-implementation.md`, `CHANGE-NNN-archive.md`

### Identifiers

- **Variables and functions**: `camelCase`; **classes**: `PascalCase`; **constants**:
  `SCREAMING_SNAKE_CASE`; unused parameters prefixed with `_`
- **Requirements**: `REQ-<AREA>-NNN`; **implementation tasks**: `IMP-<n>.<m>-NNN`
  (`traceability.patterns` in `project.yml`); **changes**: `CHANGE-NNN`; **gate exceptions**:
  `GATE-<date>-NNN`

### Directory Naming

- `kebab-case` everywhere (`code-index/`, `llm-providers/`, `vscode-extension/`)

---

## Integration Patterns

### Delivery to Core (Article I)

```javascript
// ✅ bin/musubi-code.js: parse arguments, call the core module, print
const { program } = require('commander');
const { buildIndex } = require('../src/code-index/indexer');
program.command('index').action(async opts => {
  const result = await buildIndex(process.cwd(), opts);
  console.log(result.summary);
});
```

```javascript
// ❌ src/code-index/indexer.js requiring a command script
const cli = require('../../bin/musubi-code'); // Violation of I-3
```

### Library Entry Point

```javascript
// src/index.js: every public class under its own name, old names as deprecated aliases
const { ASTExtractor } = require('./analyzers/ast-extractor');
module.exports = {
  ASTExtractor,
  AstExtractor: ASTExtractor, // deprecated alias (CHANGE-003)
};
```

### External Systems

GitHub (`@octokit/rest`), MCP servers, LLM providers and the browser (Playwright) are reached
only through `src/integrations/`, `src/llm-providers/` and `src/agents/browser/`; core analysis
and generation modules take their input as data.

---

## Deployment Structure

### Deployment Units

1. **The package** `@improve-to-grow/musubi-sdd`: CLI (global install) and library
   (project-local install), both from `github:Improve-To-Grow/MUSUBI#ITG-adjustments`
2. **GitHub Action** (`action.yml`) and the reusable workflow (`musubi-reusable.yml`) for
   consumer repositories
3. **Documentation site** (`website/`, VitePress, GitHub Pages)

`packages/vscode-extension/` is developed in the repository but not released.

> ⚠️ **Simplicity Gate (Article VII)**: The initial architecture SHALL NOT exceed 3 projects (VII-1).
> Additional projects need Phase -1 Gate approval before implementation (VII-2) and a justification in design.md: business requirements, technical constraints, team capacity analysis (VII-3).
> `steering/complexity-tracking.md` records the count and any exception.

### Runtime Environments

MUSUBI runs on the developer's machine and in CI; there are no staging or production
environments. Configuration comes from `steering/project.yml`, `package.json` and command flags,
not from environment files.

---

## Language Policy

MUSUBI is English only (CHANGE-001, CHANGE-002).

- **Documentation**: English (`.md`) only; no translated copies
- **Generated output**: all SDD artifacts, reports and CLI output in English; no language option, string table or locale code in `src/` or `bin/`
- **Agent chat**: English
- **Code comments**: English
- **Enforcement**: `tests/language-policy.test.js` fails the suite on CJK text under `src/`, `bin/`, `tests/`, `steering/` or `docs/` (REQ-LANG-008)

---

## Version Control

### Branch Organization

- `ITG-adjustments`: the fork's default and release branch (origin `Improve-To-Grow/MUSUBI`)
- `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `test/*`: work branches, merged through
  pull requests into `ITG-adjustments` after CI passes
- Upstream: `nahisaho/MUSUBI` `main`; new upstream releases are merged into `ITG-adjustments` and
  the version resets to `<upstream>-itg.1`; fork fixes go back upstream as per-theme pull requests

### Commit Message Convention

```
<type>(<scope>): <subject> (CHANGE-NNN)

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Scopes** in use: `code-index`, `deps`, `docs`, `templates`, `changes`, `release`, `steering`,
`lang`, `exports`, `ci`, `gui`

**Example**:

```
feat(code-index): grep guard denies searches for indexed names (CHANGE-006)

The PreToolUse hook now returns permissionDecision "deny" when a grep
pattern consists only of names the index defines.
```

---

## Constitutional Compliance

This structure enforces:

- **Article I**: Testable Core: feature logic under `src/` (core path) with suites under `tests/`
  that run without the CLI; `bin/` (delivery path) holds no logic
- **Article II**: Automation Interface: every feature is reachable through a `musubi-*` command
  with `--help` and exit codes
- **Article III**: Test structure supports Test-First (III-1)
- **Article VI**: Steering files maintain project memory; `/sdd-steering` (Sync) after changes
- **Article VII**: Source files stay within the code-size limits: ≤ 500 lines of code per file, ≤ 50 per function, ≤ 10 imports per file except `index` files, or the configured limits (VII-4–VII-6)

---

## Release Notes

Release history is kept in [CHANGELOG.md](../CHANGELOG.md) and is not repeated here.

---

**Last Updated**: 2026-10-14
**Maintained By**: Improve To Grow (ITG)
