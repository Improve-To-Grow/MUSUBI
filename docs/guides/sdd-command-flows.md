# SDD Command Flows

The recommended order of MUSUBI commands for the two ways work enters a project:

- **Part 1, Greenfield**: a feature in a new project, from `musubi init` to `/sdd-validate`.
- **Part 2, Brownfield**: a change to an existing codebase, from `/sdd-change-init` through human
  review, `/sdd-change-apply` and `/sdd-change-archive`.

Which part applies is decided by what the work touches, not by the age of the project. When in
doubt, [Choosing the SDD Flow](choosing-the-sdd-flow.md) is the decision tree.

Each step gives the command, its argument format, what it reads and writes, and where a human
decides before the next command may run. Written for the ITG fork (`@improve-to-grow/musubi-sdd`
6.3.1-itg.2) with Claude Code as the agent.

## How to read the command formats

| Notation                                       | What it is                                                                                                                                                                                                                                    | Where you type it  |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `/sdd-<stage> <argument>`                      | SDD slash command. `musubi init` installs the nine of them into `.claude/commands/`.                                                                                                                                                          | Claude Code prompt |
| `/<skill> <action> <target>`                   | One of the 25 Claude Code skills in `.claude/skills/`. The SDD command files write the same call as `@<skill> <action> <target>`; the slash form is what you type. A skill also triggers from plain language that contains its trigger terms. | Claude Code prompt |
| `musubi …`, `musubi-change …`, `musubi-code …` | CLIs of the package.                                                                                                                                                                                                                          | Terminal           |
| 👤                                             | A human decision. The next command checks for it or assumes it.                                                                                                                                                                               |                    |

Argument conventions:

- `<feature>` is kebab-case and becomes the file stem of every artifact:
  `storage/specs/<feature>-requirements.md`, `storage/design/<feature>-design.md`,
  `storage/tasks/<feature>-tasks.md`.
- `<feature description>` is free text after the feature name. Every slash command passes the text
  after its argument to Claude verbatim; `/sdd-requirements` is the one where it carries the content,
  because the later commands read theirs from the stored artifacts. Step 2 says what to put in it.
- `<change-id>` is `CHANGE-NNN`, upper case, one higher than the last row of
  `storage/changes/change-log.md`. The upstream template shows kebab-case names (`add-2fa`) and
  `CHG-NNN` IDs; this fork uses the change ID as both the ID and the file stem
  (`storage/changes/CHANGE-NNN.md`).
- A `<path>` given to a skill is the core path of the feature as the constitution profile defines it
  (`steering/project.yml`: `core_paths`, `delivery_paths`).

---

## Part 1: Greenfield, a feature in a new project

### Step 0: install and initialise (once per project)

```bash
npm install -g @improve-to-grow/musubi-sdd
cd my-project
musubi init                           # Claude Code is the default agent; answer "Greenfield (0→1)"
musubi init --spec <url|file|repo>    # optional: seed the project from an external specification
```

`musubi init` creates `CLAUDE.md`, `.claude/commands/sdd-*.md`, `.claude/skills/`, `steering/` and
`storage/`. In a JavaScript/TypeScript project it also sets up `musubi-code` (the index in `.scip/`,
hooks in `.claude/settings.json`); until CHANGE-NNN lands this is behind a prompt or `--code-index`.

👤 Commit the scaffold.

### Step 1: project memory

```text
/sdd-steering
```

No argument. The command detects its mode: **Bootstrap** when `steering/` has no `structure.md`,
`tech.md` and `product.md`; **Sync** when they exist and the code has moved on; **Review** when you
ask it to review. It writes those three files and the `constitution:` block of
`steering/project.yml`.

👤 Read the three files and correct them. Set `constitution.profile` (`library`, `cli` or
`application`), `core_paths` and `delivery_paths`: every later check of Articles I and II depends on
them. Changes to steering files need stakeholder approval (Article VI-6), so keep them under review
like code.

### Step 2: requirements

```text
/sdd-requirements <feature> <feature description>
/sdd-requirements user-authentication email+password and Google OAuth login, no SSO, optional 2FA, GDPR, ~10k users
```

`<feature>` is the first word and becomes the file stem. Everything after it is the feature
description: it reaches Claude verbatim and is read as stakeholder input. The upstream command format
shows the name alone, so the description is optional, but without it the command has to collect the
same facts from the other sources below.

Where the content of the requirements comes from, in the order the command uses it:

1. **The feature description** you typed: purpose, users, the critical workflows, what is out of
   scope, and constraints (performance, security, compliance, scale). A clause per topic is enough;
   the command expands them into EARS statements and acceptance criteria.
2. **Stakeholder interview.** For whatever the description leaves open, Claude asks with the
   AskUserQuestion tool: who the users are, what problem the feature solves, the critical workflows,
   the acceptance criteria, the constraints. In a non-interactive session (`claude -p`, CI) nobody
   can answer, so put those facts in the description.
3. **Steering.** `steering/product.md` supplies users and goals; `tech.md` and `structure.md` supply
   the constraints. A thin product.md gives thin requirements, which is why Step 1 comes first.
4. **Existing material.** Specs already in `storage/specs/`, an external specification saved by
   `musubi init --spec`, and similar features in the codebase.

Writes `storage/specs/<feature>-requirements.md`: functional requirements as EARS statements
(`WHEN`, `WHILE`, `IF … THEN`, `WHERE`, `SHALL`), IDs `REQ-<COMPONENT>-NNN`, priorities,
non-functional requirements (`REQ-PERF-001`, `REQ-SEC-001`, `REQ-SCALE-001`, `REQ-AVAIL-001`), a
coverage matrix. The document starts with **Status: Draft**.

Helpers at this stage:

```text
/constitution-enforcer validate storage/specs/<feature>-requirements.md    # Article IV, EARS form
/requirements-analyst <what to sharpen, e.g. "split REQ-AUTH-003 into testable criteria">
```

```bash
musubi-requirements --help     # CLI generator, if you prefer it to the slash command
```

👤 Review with stakeholders and move the document `Draft → In Review → Approved`. `/sdd-design`
stops when the requirements file is missing, so this file is the gate.

### Step 3: design

```text
/sdd-design <feature>
```

Reads the requirements and steering. Writes `storage/design/<feature>-design.md`: C4 context,
container and component diagrams, API design with status codes, data model, component design shaped
by the profile (core module plus thin delivery layer), security and performance sections, ADRs
(`ADR-001 …`, Status Accepted), a constitutional compliance section.

Phase -1 gates fire here: more than three projects (Article VII) or a custom abstraction over a
framework (Article VIII) halt the design until the gate is approved in
`steering/rules/phase-gates.md`.

```text
/constitution-enforcer validate storage/design/<feature>-design.md
```

👤 Design review with the team; approve or reject any gate that was triggered.

### Step 4: tasks

```text
/sdd-tasks <feature>
```

Reads design and requirements. Writes `storage/tasks/<feature>-tasks.md`: `TASK-NNN` items in
RED (write the failing test), GREEN (implement), BLUE (refactor) triples, a dependency graph, a
requirement coverage matrix, a sprint split with P0 first, estimates.

```text
/traceability-auditor validate storage/specs/<feature>-requirements.md
```

👤 Confirm scope, order and estimates. Drop or defer tasks here, not during implementation.

### Step 5: implementation

```text
/sdd-implement <feature>
```

Reads tasks, design, requirements and steering. Works through the tasks in order and test-first:
failing test, implementation, refactor; after each task it runs the tests, the linter, the type check
and the security audit. In an indexed project it looks a symbol up with `musubi-code refs`,
`callers` or `dependents` before changing it, and the hooks rebuild the index after every edit.

Skills to call while the work is in progress or when it ends:

```text
/code-reviewer review <path>
/security-auditor audit <path>
/constitution-enforcer validate <path>
/traceability-auditor validate storage/specs/<feature>-requirements.md
```

👤 Read the diff, run the suite yourself, and commit. The task breakdown gives the natural commit
grain (one task group per commit).

### Step 6: validation

```text
/sdd-validate <feature>
```

Produces the validation report: each of the nine Articles with PASS, WARNING or FAIL, the
traceability matrix (requirement → design → code → tests), code quality, security, performance,
recommendations and a sign-off block.

CLI equivalents, also usable in CI:

```bash
musubi validate <feature>        # or: musubi validate --all
musubi-trace check               # traceability validation with an exit code
musubi-gaps detect               # orphaned requirements, untested code
```

👤 Sign off. A FAIL loops back to Step 5; a wrong requirement loops back to Step 2 and then forward
through design and tasks again.

### Step 7: after the feature

- `/sdd-steering` once more (Sync mode) so the new component, dependencies and decisions enter
  project memory.
- The optional later stages of `steering/rules/workflow.md`, each with its skill:
  `/code-reviewer` (review), `/quality-assurance` (test strategy), `/devops-engineer deploy staging`
  (deployment), `/release-coordinator` (release notes, flags, rollback),
  `/site-reliability-engineer` (monitoring), then a retrospective.

### How many steps: workflow modes

`steering/rules/workflow-modes.yml` defines three sizes. Pick one before Step 2.

| Mode     | Size           | Steps                                                                    | Skipped artifacts   |
| -------- | -------------- | ------------------------------------------------------------------------ | ------------------- |
| `small`  | 1 to 2 hours   | requirements → implement → validate                                      | design.md, tasks.md |
| `medium` | 1 to 2 days    | requirements → design → tasks → implement → validate                     | none                |
| `large`  | a week or more | steering → requirements → design → tasks → implement → validate → review | none; ADRs required |

```bash
musubi-workflow init <feature> --mode <small|medium|large>   # record the choice
musubi-workflow next                                       # advance the stage
musubi-workflow status
```

### Greenfield at a glance

```text
musubi init                               👤 commit scaffold
/sdd-steering                             👤 fix steering, set the profile
/sdd-requirements <feature> <description> 👤 stakeholder review, Status → Approved
/sdd-design <feature>                     👤 design review, Phase -1 gates
/sdd-tasks <feature>                      👤 confirm scope and order
/sdd-implement <feature>                  👤 review diff, commit
/sdd-validate <feature>                   👤 sign off
/sdd-steering                                (Sync)
```

---

## Part 2: Brownfield, a change to an existing codebase

### Step 0: once per codebase

```bash
musubi init                  # answer "Brownfield (1→n)"
```

```text
/sdd-steering                # Bootstrap: reverse-engineers structure, tech and product from the code
```

👤 Correct the generated steering; every later command reads it first. In a JavaScript/TypeScript
project check that `musubi-code status` reports a fresh index.

### Step 1: proposal

```text
/sdd-change-init <change-id> <loose description of the change>
/sdd-change-init CHANGE-007 make the release audit tolerate jest 30
```

The description may be loose; the command turns it into the proposal. It reads steering, analyses
the current implementation (symbols through the code index with `refs`, `symbols` and
`dependents`; text through grep; the proposal records which fact came from which), reads the existing
requirements and designs, drafts the proposal, assigns the ID and adds a row to
`storage/changes/change-log.md`.

Writes `storage/changes/<change-id>.md` with:

- **Header**: Change ID, Date, **Status: Proposed**, Type, Priority, Baseline (commit and branch),
  Origin, and a **Decisions** list that names the choices the maintainer has to make or has made.
- **Description** and **Current State** (what exists, with file and line references).
- **Requirements Changes**: ADDED, MODIFIED, REMOVED, RENAMED, each in EARS form.
- **Design Changes** and **Code Changes** in the same four groups.
- **Impact Analysis**: affected components, breaking changes, migration steps, risks.
- **Testing**: test changes, coverage, verification commands.
- **Traceability**, **Implementation Plan** (the planned commits), **Rollback Plan**,
  **Constitutional Compliance**, and an **Approval** checklist.

The archived proposals under `storage/archive/2026/` are the models to compare against.

Helpers:

```text
/change-impact-analyzer <name the proposal file or describe the change>
```

```bash
musubi-code refs <Symbol>          # every reference, definition first
musubi-code dependents <file>      # files that load a file you intend to change
musubi-change validate <change-id> # delta format check, once a delta record exists (Step 2)
```

### Step 2: 👤 human review and approval

1. Read the proposal. The Decisions list, Breaking Changes, Implementation Plan and Rollback Plan
   are the parts that cost the most to get wrong.
2. Ask for revisions in the same or a new session ("revise CHANGE-007: …"). Each revision bumps the
   version in the proposal's Change History and in the change-log row; the status stays Proposed.
3. Approve. Record it in two places:

   ```bash
   musubi-change approve CHANGE-007     # upper-case ID; writes the delta record storage/changes/CHANGE-007/
   ```

   and in the proposal header: `**Status**: ~~Proposed~~ → **Approved**`, with the date and the
   decisions taken; tick the Approval checklist. `/sdd-change-apply` aborts when the status is not
   Approved. Pass the ID in upper case: a mixed-case ID creates a mixed-case directory that has to be
   renamed at archive time.

4. Create the work branch from the baseline commit if it does not exist yet.

Useful while reviewing: `musubi-change show <change-id>`, `musubi-change impact <change-id>`,
`musubi-change list`, `musubi-change status`.

### Step 3: apply

```text
/sdd-change-apply <change-id>
```

Reads the approved proposal and steering. Then, in order: a feature flag when the proposal calls for
one; the ADDED parts in the core path of the profile; MODIFIED code after `musubi-code refs` and
`callers` plus one grep for the name as a string; REMOVED code with a migration guide; database
migrations when there are any; tests first for all of it (Articles III and IX); the traceability
matrix; the constitutional checks; the steering updates (components, dependencies). It ends by
writing `storage/changes/<change-id>-implementation.md` with **Status: Implemented**, the applied
ADDED, MODIFIED and REMOVED items, test results, compliance and the commits.

Fork practice (CHANGE-004 and CHANGE-005): the command follows the Implementation Plan one commit at
a time, stages that set of files and proposes the message; the maintainer commits. Commit hashes go
into the report once they exist.

Skills during the work: `/code-reviewer review <path>`, `/security-auditor audit <path>`,
`/constitution-enforcer validate <path>`, `/traceability-auditor validate <requirements or proposal>`.

### Step 4: 👤 review the implementation

- Run the verification commands the proposal lists, at least `npm test`, `npm run lint` and
  `npm run format:check`.
- Read the diff and commit each staged set under the planned message.
- Put the hashes into the implementation report and into the proposal header
  (`**Implemented**: <date> (commits … on <branch>)`).
- Open the pull request to the main branch and merge after CI.
- No `musubi-change` command sets the delta record to `implemented`; set it by hand or leave it for
  the archive step.

### Step 5: archive

```text
/sdd-change-archive <change-id>
```

The fork archives into `storage/archive/<year>/<change-id>/`, by hand (see the note below):

- move the proposal, the implementation report and the delta record there as `<change-id>.md`,
  `<change-id>-implementation.md` and `<change-id>-delta.json` (status `archived`, `archivedAt` set);
- write `<change-id>-archive.md` (lifecycle dates, release status, what changed, final metrics,
  lessons learned, files, sign-off) and a `README.md` that lists the three documents and the quick
  facts;
- set the proposal header to `~~Proposed~~ → ~~Approved~~ → ~~Implemented~~ → **Archived**` with
  the commit hashes;
- update the row in `storage/changes/change-log.md` (edit that one row; do not run prettier on the
  file, it realigns every row);
- add the CHANGELOG entry under `[Unreleased]`, remove the feature flag if there was one, and refresh
  the steering sections the change touched.

Note on the CLI: `musubi-change archive` does not produce this layout. It writes
`storage/archive/<id>.json`, moves the proposal to `specs/changes/`, writes no reports, and cannot
archive a delta that is still `approved`, with or without `--force`. The slash command does the
work; the CLI's archive step is not part of the flow.

👤 Commit the archive (`chore(changes): archive CHANGE-007 into storage/archive/2026`), then
`/sdd-steering` (Sync) if the archive step left anything out of project memory, and release when
ready.

### Brownfield at a glance

```text
/sdd-change-init CHANGE-NNN <loose description>   → storage/changes/CHANGE-NNN.md, Status Proposed
👤 review, request revisions, decide the open points
musubi-change approve CHANGE-NNN                  + header Status → Approved
/sdd-change-apply CHANGE-NNN                      → code, tests, CHANGE-NNN-implementation.md; commits staged
👤 run checks, commit, record hashes, merge PR
/sdd-change-archive CHANGE-NNN                    → storage/archive/<year>/CHANGE-NNN/, change-log row, CHANGELOG
👤 commit the archive; release
```

---

## Reference: command formats

### SDD slash commands

| Command                                             | Reads                                         | Writes                                                                 |
| --------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `/sdd-steering`                                     | the codebase, existing steering               | `steering/structure.md`, `tech.md`, `product.md`, `project.yml`        |
| `/sdd-requirements <feature> <feature description>` | the description, steering, existing specs     | `storage/specs/<feature>-requirements.md`                              |
| `/sdd-design <feature>`                             | requirements, steering                        | `storage/design/<feature>-design.md`                                   |
| `/sdd-tasks <feature>`                              | design, requirements, steering                | `storage/tasks/<feature>-tasks.md`                                     |
| `/sdd-implement <feature>`                          | tasks, design, requirements, steering         | source and test files, implementation summary                          |
| `/sdd-validate <feature>`                           | all of the above plus the code                | validation report                                                      |
| `/sdd-change-init <change-id> <description>`        | steering, code, existing specs and designs    | `storage/changes/<change-id>.md`, change-log row                       |
| `/sdd-change-apply <change-id>`                     | approved proposal, steering                   | code, tests, `storage/changes/<change-id>-implementation.md`, steering |
| `/sdd-change-archive <change-id>`                   | proposal, implementation report, delta record | `storage/archive/<year>/<change-id>/`, change-log row, CHANGELOG       |

### Skills the SDD commands call

| Skill call                                          | Checks or does                                             |
| --------------------------------------------------- | ---------------------------------------------------------- |
| `/constitution-enforcer validate <file or path>`    | the nine Articles and Phase -1 gates, per the profile      |
| `/traceability-auditor validate <requirements>`     | requirement → design → task → code → test coverage         |
| `/code-reviewer review <path>`                      | quality, SOLID, smells                                     |
| `/security-auditor audit <path>`                    | OWASP, dependency and secret issues                        |
| `/performance-optimizer analyze <path>`             | bottlenecks and benchmarks                                 |
| `/change-impact-analyzer <proposal or description>` | affected components, breaking changes, migration plan      |
| `/devops-engineer deploy <environment>`             | pipeline and deployment steps                              |
| `/orchestrator implement <feature>`                 | plans and coordinates the other skills for a large feature |

Other skills (`/requirements-analyst`, `/system-architect`, `/software-developer`, `/test-engineer`,
`/quality-assurance`, `/release-coordinator`, `/site-reliability-engineer`, `/technical-writer`, …)
take a task in plain words after the name.

### CLIs that appear in the flows

| Command                                                                  | Purpose                                                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `musubi init [--spec <source>]`                                          | scaffold MUSUBI for Claude Code; `--copilot`, `--cursor`, … for other agents |
| `musubi validate [<feature>] [--all]`                                    | constitutional validation from the terminal                                  |
| `musubi sync [--dry-run]`                                                | steering sync without the agent                                              |
| `musubi upgrade`                                                         | bring an initialised project to the installed MUSUBI version                 |
| `musubi-change approve <change-id>`                                      | record approval as a delta record                                            |
| `musubi-change validate`, `show`, `impact`, `list`, `status`             | inspect delta records                                                        |
| `musubi-code refs`, `callers`, `deps`, `dependents`, `symbols`, `status` | code navigation on the scip index (`musubi code …` also works)               |
| `musubi-trace check`, `musubi-gaps detect`                               | traceability and gap checks, CI-ready                                        |
| `musubi-workflow init <feature> --mode <mode>`                           | record the workflow mode and track stages                                    |

## Related guides

- [Choosing the SDD Flow](choosing-the-sdd-flow.md): decision tree for Part 1 versus Part 2
- [Change Management Workflow](change-management-workflow.md): the delta-spec side of brownfield changes
- [Delta Specification Guide](delta-spec-guide.md): ADDED, MODIFIED, REMOVED, RENAMED format
- [Brownfield Tutorial](brownfield-tutorial.md) and [Brownfield Project Tutorial](brownfield.md)
- [Code Navigation (musubi-code)](scip-typescript.md): the index the SDD commands query first
- `steering/rules/workflow.md`: the full stage list with completion criteria and quality gates
- `steering/rules/workflow-modes.yml`: the small, medium and large modes
- `steering/rules/phase-gates.md`: the Phase -1 gate approval process
