# Product Context

**Project**: MUSUBI (ITG fork)
**Last Updated**: 2026-10-14
**Version**: 6.3.1-itg.3

---

## Product Vision

**Vision Statement**: Every change to a codebase, greenfield or brownfield, starts from a
specification that an AI coding agent can execute and a human can audit, whichever agent the team
uses.

**Mission**: Ship one Specification Driven Development (SDD) workflow, from project memory through
requirements, design, tasks, implementation and validation, as installable commands, skills and
governance rules for seven AI coding agents, with every artifact, trace and change record kept in
the repository.

---

## Product Overview

### What is MUSUBI?

MUSUBI ("connection, binding") is a Specification Driven Development framework for AI coding
agents. It installs a set of slash commands, agent skills and constitutional rules into a project
and gives the agent a fixed workflow: steering (project memory), EARS requirements, C4 and ADR
design, task breakdown, test-first implementation and constitutional validation. Artifacts live
under `storage/`, project memory under `steering/`, and a traceability matrix links requirements
to design, tasks, code and tests. Brownfield work goes through delta specifications and change
records instead of rewriting specs.

The package also exposes the same capabilities as a Node.js library and as command-line tools
(`musubi-validate`, `musubi-trace`, `musubi-gaps`, `musubi-change`, …) that run in CI through a
GitHub Action and a reusable workflow.

### The ITG Fork

Improve To Grow (ITG) maintains this fork of [nahisaho/MUSUBI](https://github.com/nahisaho/MUSUBI)
for its own projects and develops it independently: upstream has not changed since its v6.3.1
release in January 2026, so the fork merges no upstream releases and sends no pull requests
(CHANGE-009). It differs from the original in:

- **Distribution**: installed from GitHub as the private package `@improve-to-grow/musubi-sdd`,
  versioned `6.3.1-itg.N`; never `npx`, never the npm registry (6.3.1-itg.1)
- **ITG delivery standard**: `musubi init` installs the ITG Software Delivery Playbook
  (`docs/itg/`) as steering: ITG steering templates with a Deviations table, one policy file per
  playbook area with `ITG-*` rule ids and Mermaid diagrams (`steering/rules/itg/`), the
  `application` profile, and Mermaid C4 design output (6.3.1-itg.4, CHANGE-007). Maintainer rules
  for this layer are in [rules/itg-fork.md](rules/itg-fork.md)
- **Code navigation**: `musubi-code`, a compiler-accurate index built with scip-typescript and
  scip-python, set up by default, with a grep guard in Claude Code and index-first instructions in
  the SDD commands (6.3.1-itg.2, 6.3.1-itg.3)
- **English only**: the multilingual and technical-article publication features are removed
  (CHANGE-001, CHANGE-002)
- **Repairs**: every package export defined (CHANGE-003), documented imports and package name
  corrected (CHANGE-004), Jest 30 and a release audit limited to shipped dependencies
- **Records**: change proposals, implementation reports and archive reports under
  `storage/changes/` and `storage/archive/`, archived by hand

### Problem Statement

**Problem**: Teams that code with AI agents lose the thread between intent and code.

- Each agent (Claude Code, Copilot, Cursor, Gemini CLI, Codex, Qwen Code, Windsurf) has its own
  command and instruction format, so a workflow built for one does not carry over
- Requirements written in prose are ambiguous, and the agent fills the gaps on its own
- Nothing links a requirement to the design, the task, the code and the test that satisfy it
- Quality depends on the agent's mood of the day: no gates, no simplicity limits, no test-first
- Existing systems have no safe way to express "what changes" without rewriting the whole spec
- Agents answer "where is X used" by grepping, which misses `require()` and `new X()` edges

### Solution

**Solution**: One SDD workflow, installed once, enforced by rules and tooling.

- The same `/sdd-*` commands and 27 skills for all seven agents, generated from one template set
- EARS requirements with five patterns and stable IDs (`REQ-<AREA>-NNN`)
- A traceability matrix (`musubi-trace`, `musubi-gaps`) from requirements to tests
- Nine constitutional articles with Phase -1 gates, checked by `musubi-validate` and in CI
- Delta specifications and change records (`CHANGE-NNN`) for brownfield changes
- A compiler-accurate code index (`musubi-code`) that the agent consults before grep

---

## Target Users

### Primary Users

#### User Persona 1: Developer working with an AI coding agent

**Demographics**:

- **Role**: Software engineer at ITG or on an ITG client project
- **Organization Size**: Small teams, one to ten engineers per repository
- **Technical Level**: Professional; Claude Code is the main agent, Copilot and Cursor also in use

**Goals**:

- Hand a feature or a change to the agent with a specification it cannot misread
- Keep steering, specs and change records in the repository, reviewed like code
- Know where a symbol is defined and used before renaming or deleting it

**Pain Points**:

- Agents invent requirements and skip tests when nothing stops them
- Context about the project is lost between sessions
- grep-based "usages" miss CommonJS `require()` and `new X()` edges

**Use Cases**:

- `/sdd-requirements`, `/sdd-design`, `/sdd-tasks`, `/sdd-implement`, `/sdd-validate` for a feature
- `/sdd-change-init`, `musubi-change approve`, `/sdd-change-apply`, archive for a change
- `musubi-code refs`, `callers`, `deps`, `dependents` during analysis

#### User Persona 2: Lead introducing SDD into an existing codebase

**Demographics**:

- **Role**: Tech lead or consultant onboarding a brownfield project
- **Organization Size**: Client teams of any size
- **Technical Level**: Senior; decides the project profile and the governance level

**Goals**:

- Generate steering from the code in minutes (`musubi-onboard`, `/sdd-steering`) and keep it in sync
- Adopt the constitution gradually (`application` profile starts advisory)
- Make every change auditable through a proposal, approval and archive

**Pain Points**:

- Framework-specific SDD tools lock the team to one agent
- Governance that blocks on day one gets switched off

**Use Cases**:

- `musubi init --<platform>` for each agent in use
- `musubi sync --dry-run` and `/sdd-steering` (Sync) after merges
- `musubi-validate`, the GitHub Action and the reusable workflow in CI

### Secondary Users

- **Library consumers**: scripts and tools that `require('@improve-to-grow/musubi-sdd')` for the
  analyzers, generators, validators and orchestration modules
- **CI maintainers**: wire `action.yml`, `musubi-reusable.yml`, the GitLab and Jenkins templates

---

## Core Product Capabilities

### Must-Have Features

1. **Project memory (steering)**: `steering/structure.md`, `tech.md`, `product.md`,
   `project.yml`, rules and memories; generated by `musubi-onboard` or `/sdd-steering`, kept
   current by `musubi sync` and `/sdd-steering` (Sync). Every skill reads it first (Article VI).
2. **EARS requirements**: `/sdd-requirements`, `musubi-requirements`; five patterns, stable IDs,
   review gate for EARS form, stakeholder coverage and acceptance criteria.
3. **Design and tasks**: `/sdd-design` (C4 context, container, component; ADRs; Articles I, II,
   VII, VIII checked), `/sdd-tasks` (P-labels for parallel execution), `musubi-design`,
   `musubi-tasks`.
4. **Implementation and validation**: `/sdd-implement` (test-first), `/sdd-validate` and
   `musubi-validate` (nine articles, Phase -1 gates, profile levels).
5. **Change management**: `/sdd-change-init`, `/sdd-change-apply`, `/sdd-change-archive`,
   `musubi-change` (approve, validate, show, impact, list, status); delta records with ADDED,
   MODIFIED and REMOVED requirements.
6. **Traceability**: `musubi-trace`, `musubi-gaps`; matrix under `storage/traceability/`.
7. **Multi-agent install**: `musubi init` for Claude Code (skills and commands), GitHub Copilot,
   Cursor, Gemini CLI, Codex CLI, Qwen Code and Windsurf (AGENTS.md or GEMINI.md plus commands).
8. **Code navigation**: `musubi-code` (index, status, refs, callers, deps, dependents, symbols,
   setup, hint) for JavaScript, TypeScript and Python.

### Supporting Features

9. **Orchestration and workflow**: `musubi-orchestrate` (patterns over skills, guardrails,
   replanning), `musubi-workflow` (modes small, medium, large; stage tracking),
   `musubi-release`, `musubi-analyze` (quality, dependencies, security, stuck detection).
10. **Agent memory and sharing**: `musubi-remember` (JSON memory bank), `musubi-share`
    (export, import and merge `steering/memories/` across teams and platforms).
11. **Automation and integration**: `musubi-resolve` (GitHub issues), `musubi-browser`
    (Playwright agent), `musubi-convert` (Spec Kit), `musubi-config`, `musubi-upgrade`, Web GUI
    (`musubi-gui`), MCP connector, LLM providers (Anthropic, OpenAI, Copilot, Ollama).

### Roadmap

- `CHANGELOG.md` "Unreleased" lists what is merged but not released; the next release tags
  `v6.3.1-itg.3`.
- Follow-up from CHANGE-004: decide the future of `website/`.

---

## Product Principles

### Design Principles

1. **Specification before code**: no implementation without requirements, design and tasks
   recorded under `storage/`; brownfield changes without a change record are not applied.
2. **Constitution over convention**: nine articles with explicit levels per project profile;
   Phase -1 gates decide project count and abstractions before implementation.
3. **Memory in the repository**: steering, memories, specs and change records are files under
   version control, reviewed like code; steering changes need approval (VI-6).
4. **Index first**: symbol questions go to `musubi-code` before grep; analysis records say which
   facts came from the index.
5. **Same workflow for every agent**: one template set under `src/templates/` generates all
   seven platforms; platform-specific behaviour is a formatting difference, not a feature gap.
6. **English only**: one language for documents, chat, reports and CLI output.

### User Experience Principles

1. **Commands, not conversation**: every stage is a slash command with a fixed input and output
   file; the agent asks one question at a time when it needs input.
2. **Dry runs and approvals**: anything that rewrites files (`musubi sync`, `musubi upgrade`,
   `musubi-code setup`, steering updates) previews or asks first.
3. **Install from one URL**: one command installs and updates; `musubi-sdd --version` tells
   whether a machine is current.

---

## Success Metrics

### Technical Metrics

| Metric                         | Target                                  | Measurement                                       |
| ------------------------------ | --------------------------------------- | ------------------------------------------------- |
| **CI on `ITG-adjustments`**    | Green: lint, format, tests, build, audit | `ci.yml` on every push and pull request           |
| **Coverage**                   | ≥ 60% statements, lines, functions; ≥ 45% branches | `npm run test:coverage`, `jest.config.js` |
| **Constitutional compliance**  | No critical violations                  | `musubi validate`, constitutional workflows       |
| **Traceability**               | 100% requirement to test coverage per feature | `musubi-trace check`, `musubi-gaps detect`   |
| **Release audit**              | No high or critical advisories in shipped dependencies | `npm audit --audit-level=high --omit=dev` |
| **Code index freshness**       | `fresh` for both languages              | `musubi-code status`                              |

### Adoption Metrics

| Metric                          | Measurement                                          |
| ------------------------------- | ---------------------------------------------------- |
| Installed version per machine   | `musubi-sdd --version` ends in the current `-itg.N`  |
| Changes with records            | Every merged behavioural change has a `CHANGE-NNN` row in `storage/changes/change-log.md` |
| Steering freshness              | `Last Updated` in the steering files follows the last structural change |

---

## User Workflows

### Primary Workflow 1: Greenfield feature

**User Goal**: Build a feature from a one-line description with full traceability

**Steps**:

1. `/sdd-steering` creates or refreshes project memory (Bootstrap or Sync)
2. `/sdd-requirements <feature> <description>` writes `storage/specs/<feature>-requirements.md`
3. `/sdd-design <feature>` writes `storage/design/<feature>-design.md` (C4, ADRs, Phase -1 gates)
4. `/sdd-tasks <feature>` writes `storage/tasks/<feature>-tasks.md`
5. `/sdd-implement <feature>` works through the tasks test-first
6. `/sdd-validate <feature>` checks the articles; `musubi-trace` and `musubi-gaps` close the matrix
7. `/sdd-steering` (Sync) records the new component and dependencies

**Success Criteria**:

- Every requirement has a design element, a task, code and a test
- No critical constitutional violation at validation

### Primary Workflow 2: Brownfield change

**User Goal**: Change an existing system with an auditable record

**Steps**:

1. `/sdd-change-init CHANGE-NNN <description>` analyses the code (index first) and writes the proposal under `storage/changes/CHANGE-NNN/`
2. The maintainer reviews; `musubi-change approve CHANGE-NNN` records approval
3. `/sdd-change-apply CHANGE-NNN` implements test-first, updates steering, writes the implementation report
4. The records move to `storage/archive/<year>/CHANGE-NNN/` with an archive report and README; the change-log row and `CHANGELOG.md` are updated
5. The version bumps to the next `-itg.N` when the change affects installed users

**Success Criteria**:

- The proposal states which facts came from the index and which from grep
- The archive README lists the commits and the outcome

Both flows are described step by step in `docs/guides/sdd-command-flows.md`.

---

## Business Domain

### Domain Concepts

Key concepts and terminology (see `steering/memories/domain_knowledge.md` for the full glossary):

1. **Steering**: the project memory under `steering/`: three core files, `project.yml`, rules, templates and memories; read by every skill before it acts
2. **Constitution**: nine articles with EARS-style requirement IDs, enforced at `critical` or `advisory` level per project profile (`library`, `cli`, `application`)
3. **Phase -1 Gate**: the approval that Articles VII and VIII require before a fourth project or a wrapper abstraction; exceptions tracked in `steering/complexity-tracking.md`
4. **EARS requirement**: a requirement in one of five patterns (ubiquitous, event-driven, state-driven, unwanted behaviour, optional) with a stable ID
5. **Delta specification / change record**: ADDED, MODIFIED and REMOVED requirements for a brownfield change, tracked as `CHANGE-NNN` through proposed, approved, implemented and archived
6. **Traceability matrix**: the mapping requirement → design → task → code → test, stored as YAML and checked for gaps
7. **Skill / agent**: a specialist instruction set (requirements analyst, system architect, constitution enforcer, …) installed per platform; 27 in total including the orchestrator's built-ins
8. **Workflow mode**: `small`, `medium` or `large`, deciding which stages a feature goes through
9. **Code index**: the SCIP index in `.scip/` that answers symbol questions; the grep guard redirects bare-name greps to it

### Business Rules

1. **Steering changes need approval** (VI-6): a sync presents its diff and applies it only after the maintainer agrees
2. **No change without a record**: behavioural changes to an existing system go through a `CHANGE-NNN` proposal, approval, apply and archive
3. **Every installed-user-visible change bumps the version**: `-itg.N` increments, `CHANGELOG.md` gains an entry, the tag `v<version>` creates the release
4. **English only**: CJK text under `src/`, `bin/`, `tests/`, `steering/` or `docs/` fails the suite
5. **Install from GitHub only**: documentation, templates and generated CI never use `npx` or the registry package

---

## Constraints & Requirements

### Technical Constraints

- Node.js >= 18; runs on Windows and Linux (CI on Ubuntu; development on Windows with CRLF working copies)
- No build step and no `exports` map: library consumers depend on file paths under `src/`
- Every change is recorded in `storage/changes/`; there is no upstream to stay mergeable with (CHANGE-009)
- CommonJS throughout; `inquirer` 9 is the one ESM dependency and is loaded with dynamic `import()`

### Compliance Requirements

- **License**: MIT (upstream and fork)
- **Supply chain**: `npm audit --audit-level=high --omit=dev` must pass before a release; exact pins for the scip indexers

### Non-Functional Requirements

- **Offline by default**: every SDD command works without network access; GitHub, MCP, LLM providers and the browser agent are opt-in integrations
- **Index build**: about 18 seconds for the 397 JavaScript files of this repository; queries rebuild a stale index first
- **Idempotent setup**: `musubi init`, `musubi upgrade` and `musubi-code setup` can be re-run; `musubi init` asks before overwriting agent files

---

## Stakeholders

| Role                 | Who                                        | Responsibilities                                            |
| -------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| **Maintainer**       | Improve To Grow (ITG)                      | Fork releases, change approvals, steering approval (VI-6)   |
| **Original project** | nahisaho/MUSUBI                            | Origin of the code (MIT, v6.3.1); no longer followed        |
| **Users**            | ITG engineers and client project teams     | Run the workflow, propose changes, report issues            |
| **AI agents**        | Claude Code first; Copilot, Cursor, others | Execute the commands and skills; read steering before acting |

---

## Integrations

### Existing Integrations

| Integration                                    | Purpose                                                       | Where                                                        |
| ---------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf | Commands, skills and instruction files per agent | `src/templates/agents/<platform>/`, `musubi init --<platform>` |
| GitHub Actions                                 | `action.yml` and `musubi-reusable.yml` for consumer CI        | repository root, `.github/workflows/`                        |
| GitLab CI, Jenkins                             | Pipeline templates for consumers                              | `templates/ci-cd/`                                           |
| GitHub API                                     | Issue resolution, releases, pull requests                     | `src/integrations/github-client.js`, `musubi-resolve`, `musubi-release` |
| MCP                                            | Connector and tool adapters for MCP servers                   | `src/integrations/mcp-connector.js`, `src/integrations/mcp/` |
| LLM providers                                  | Anthropic, OpenAI, Copilot, Ollama for replanning and agents  | `src/llm-providers/`                                         |
| Playwright                                     | Browser automation agent                                      | `src/agents/browser/`, `musubi-browser`                      |
| Spec Kit                                       | Import and export of specifications                           | `src/converters/`, `musubi-convert`                          |
| scip-typescript, scip-python                   | Code index                                                    | `src/code-index/`, `musubi-code`                             |

### Planned Integrations

None beyond the roadmap items above; new integrations go through a change proposal.

---

## Localization & Internationalization

MUSUBI is English only (CHANGE-002). All documents, agent chat, reports and CLI output are
written in English; there is no secondary language, no localization setting and no i18n
framework. The former technical-article publication pipeline (Qiita, Zenn, Medium and Dev.to
templates with Japanese boilerplate) was removed.

---

## Release Notes

Release history is kept in [CHANGELOG.md](../CHANGELOG.md) and is not repeated here.

---

**Last Updated**: 2026-10-14
**Maintained By**: Improve To Grow (ITG)
