# Choosing the SDD Flow: Greenfield or Brownfield

MUSUBI has two command flows, described step by step in [SDD Command Flows](sdd-command-flows.md):

- the **feature flow** (Part 1, "greenfield"): `/sdd-requirements` → `/sdd-design` → `/sdd-tasks`
  → `/sdd-implement` → `/sdd-validate`. It produces a self-contained spec set:
  `storage/specs/<feature>-requirements.md`, `storage/design/<feature>-design.md`,
  `storage/tasks/<feature>-tasks.md`.
- the **change flow** (Part 2, "brownfield"): `/sdd-change-init` → human review →
  `/sdd-change-apply` → `/sdd-change-archive`. It produces a change record under
  `storage/changes/` with a delta (ADDED, MODIFIED, REMOVED, RENAMED), an impact analysis, a
  migration plan and a rollback plan.

The names say which kind of project each flow was written for, but the age of the project does
not decide. What the work touches decides. A new, self-contained feature in a ten-year-old
codebase can go through the feature flow; a change to a feature specified last week goes through
the change flow. The `/sdd-change-init` command encodes the rule from its side: when it finds no
existing requirements to diff against, it points to `/sdd-requirements` and reserves change
proposals for modifying documented features and refactoring existing code.

## Decision tree

Precondition for both flows: `steering/` exists and is current (`/sdd-steering`), and in a
JavaScript/TypeScript or Python project `musubi-code status` reports a fresh index.

```text
Work to do in a project that has steering
│
├─ 1. Does storage/specs/<feature>-requirements.md already exist for this feature name?
│       yes → CHANGE FLOW. The existing spec is the baseline; the delta records what moves.
│       no  ↓
│
├─ 2. Draft the delta in your head. Would any of these be non-empty?
│       · MODIFIED, REMOVED or RENAMED requirements
│       · Breaking Changes other than "none"
│       · a migration, a feature flag, or a rollback other than "delete the new files"
│       · a changed default, public API, CLI flag, config shape, data model,
│         or the design of an existing component
│       yes → CHANGE FLOW. The new feature's requirements go in the ADDED section.
│       no  ↓
│
├─ 3. Does the feature need an edit in an existing file?
│       it changes what an existing requirement promises        → CHANGE FLOW
│       it only registers the new thing in a stable extension
│       point (command table, route list, skill list)           → counts as ADDED, continue ↓
│       no edit at all                                           → continue ↓
│
├─ 4. Still unsure?
│       yes → CHANGE FLOW. A change record with an empty MODIFIED section costs a few extra
│             sections. A feature spec that turns out to have modified something leaves no
│             record of what it modified.
│       no  ↓
│
└─ FEATURE FLOW. Pick a workflow mode (steering/rules/workflow-modes.yml) and run it:
     small   requirements → implement → validate
     medium  requirements → design → tasks → implement → validate
     large   steering → requirements → design → tasks → implement → validate → review
```

## Signals at a glance

| Signal                                                                        | Flow                  |
| ----------------------------------------------------------------------------- | --------------------- |
| Only new files, plus at most a registration line in a stable extension point  | feature               |
| An existing requirement changes meaning or scope, or disappears               | change                |
| A default, flag, API, config key or schema that users already rely on changes | change                |
| A migration, a feature flag or a staged rollout is needed                     | change                |
| Rollback is "delete the new files"                                            | feature               |
| A spec for the same feature name already exists                               | change                |
| Existing code must be refactored to make room for the feature                 | change                |
| One to two hours of work that touches nothing existing                        | feature, `small` mode |

## The feature flow will not warn you

Nothing in the feature flow detects that a feature's scope reaches into existing code or
requirements. Answer the tree before starting, not while running it.

- `/sdd-requirements` has a brownfield step: research the existing implementation and, "if this
  is a change to existing system", add delta sections to the feature's requirements. That is an
  instruction to the agent, not a check. Its only hard condition is a spec with the same feature
  name (question 1). Other features' specs are not scanned for overlap.
- `/sdd-design`, `/sdd-tasks` and `/sdd-implement` do not ask about existing code. The agent
  consults `musubi-code` in those stages only because `CLAUDE.md` tells it to for symbol
  questions.
- `/sdd-validate` checks the feature's own requirements forward (requirement → design → tasks →
  code → tests). `musubi-gaps` and the traceability auditor find orphaned and untested items,
  never modified ones.
- The first automatic signal is the full test suite that `/sdd-implement` runs after each task.
  It arrives during implementation, and only for behaviour that already has a test.

To answer questions 2 and 3 with evidence instead of memory, before `/sdd-requirements`:

```bash
musubi-code dependents <file>       # what loads a file the feature will touch
musubi-code callers <Symbol>        # what calls a function the feature will touch
grep -rn 'REQ-' <those files>       # which requirements those files implement
musubi-trace impact <REQ-ID>        # design, tasks, code and tests that carry that ID
```

`musubi-trace impact` is a plain substring match on the ID, so it only sees code and tests that
carry `REQ-` comments. After requirements, `/change-impact-analyzer <description of the feature>`
gives the same picture in prose; it is not part of the feature flow, so call it yourself.

## Switching mid-flow

If the research during `/sdd-requirements` turns up MODIFIED or REMOVED items, stop there and
start `/sdd-change-init CHANGE-NNN <description>`. The drafted requirements become the proposal's
ADDED section and the items you found become its MODIFIED and REMOVED sections. Nothing after
requirements needs redoing: design changes and the implementation plan live inside the change
record. Switching the other way, from a change record to a feature spec, is not worth it. Finish
the change.

## In this repository

- All six archived changes went through the change flow, including
  [CHANGE-006](../../storage/archive/2026/CHANGE-006/README.md), typed "Feature". It was additive
  in spirit, but it removed the prompt and the flags from `musubi init`, which is question 2.
- The only feature-flow artifacts under `storage/specs/` are upstream leftovers. A feature-flow
  run would be the first in the fork, and the audit trail would then live in two places:
  `storage/specs/` for features, `storage/changes/` and `storage/archive/` for changes.
- The change flow has no short form: a proposal always carries impact, testing and rollback
  sections. The feature flow's `small` mode skips design and tasks. For a genuinely standalone
  feature the feature flow is therefore also the lighter one, which is the practical reason to
  choose it when the tree allows.

## Related guides

- [SDD Command Flows](sdd-command-flows.md): both flows step by step, with the human review points
- [Delta Specification Guide](delta-spec-guide.md): ADDED, MODIFIED, REMOVED, RENAMED format
- [Change Management Workflow](change-management-workflow.md): the delta-spec side of brownfield changes
- [Brownfield Tutorial](brownfield-tutorial.md): adopting SDD in an existing codebase
- `steering/rules/workflow-modes.yml`: the small, medium and large modes
