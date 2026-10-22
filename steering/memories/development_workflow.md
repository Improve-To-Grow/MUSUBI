# Development Workflow

Common development workflows for MUSUBI (ITG fork). Commands are documented in
`suggested_commands.md`; this file describes the flows.

## Setup

```bash
git clone git@github.com:Improve-To-Grow/MUSUBI.git
cd MUSUBI
npm install                      # Node.js >= 18; package-lock.json is the lock file
musubi-code status               # the code index; hooks keep it fresh in Claude Code
```

- No `.env` file and no build step. Run the commands from the checkout with
  `node bin/musubi-<command>.js …`, or `npm link` to shadow the global GitHub install while
  developing (reinstall from GitHub afterwards).
- Windows: the working copy is CRLF (`core.autocrlf = true`), git stores LF; scripted edits must
  match either line ending.

## Daily Development

1. Branch from `ITG-adjustments`: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`.
2. Read steering first (`steering/structure.md`, `tech.md`, `product.md`); answer symbol
   questions with `musubi-code refs <Name>` before grep.
3. Write the test, then the code (`tests/<concern>/<module>.test.js` mirrors `src/`).
4. Run `npm test` (single suite: `npx jest tests/<concern>/<module>.test.js`), `npm run lint`,
   `npm run format:check`. CI runs the same three plus build, audit and platform tests.
5. Commit with a conventional message and scope, naming the change or requirement:
   `feat(code-index): … (CHANGE-006)`.
6. Open a pull request into `ITG-adjustments`; merge after CI passes.

End-to-end scripts are not part of `npm test`: `node tests/e2e/ollama-e2e.test.js` needs a running
Ollama.

## Feature Flow (greenfield)

`/sdd-steering` → `/sdd-requirements <feature> <description>` → `/sdd-design <feature>` →
`/sdd-tasks <feature>` → `/sdd-implement <feature>` → `/sdd-validate <feature>` →
`musubi-trace check`, `musubi-gaps detect` → `/sdd-steering` (Sync). Pick the workflow mode
(`small`, `medium`, `large`) before requirements; `musubi-workflow init <feature> --mode <mode>`
records it.

## Change Flow (brownfield)

1. `/sdd-change-init CHANGE-NNN <description>`: proposal under `storage/changes/CHANGE-NNN/`,
   row in `storage/changes/change-log.md`. The analysis cites `musubi-code` for symbol facts.
2. Maintainer review; `musubi-change approve CHANGE-NNN` records the approval.
3. `/sdd-change-apply CHANGE-NNN`: implementation commits on a work branch, steering updates,
   `CHANGE-NNN-implementation.md`.
4. Archive by hand: move the proposal, implementation report, archive report
   (`CHANGE-NNN-archive.md`), `CHANGE-NNN-delta.json` and a README into
   `storage/archive/<year>/CHANGE-NNN/`; set the delta status; update the change-log row with the
   commits and the archive path. `musubi-change archive` does not handle an approved delta.
5. Add the user-visible outcome to `CHANGELOG.md` under `[Unreleased]`.

Records so far: CHANGE-001 to CHANGE-006 under `storage/archive/2026/`.

## Steering Upkeep

- `musubi sync --dry-run` shows mechanical drift (version, languages, frameworks, directories);
  its edits are crude, so prefer `/sdd-steering` (Sync) for prose and approve the diff.
- `/sdd-steering` after any change to architecture, dependencies or product context (VI-5).
- Memory files are edited by hand or through the steering skill's memory mode:
  `architecture_decisions.md` for decisions, `lessons_learned.md` after retrospectives,
  `domain_knowledge.md` for vocabulary, `suggested_commands.md` for commands.
- Never re-run `musubi-onboard` here: it regenerates the steering files and, without
  `--skip-memories`, overwrites all memory files with blank templates.

## Release

1. Move the `[Unreleased]` entries of `CHANGELOG.md` into a new `[6.3.1-itg.N]` section with the
   date.
2. `npm version prerelease --preid itg --no-git-tag-version` (bumps `package.json` and the lock
   file); update `version` and `updated` in `steering/project.yml`.
3. Commit `chore(release): bump version to <version>` and merge into `ITG-adjustments` through a
   pull request.
4. Tag `v<version>` and push the tag. `release.yml` runs tests, lint and
   `npm audit --audit-level=high --omit=dev`, then creates the GitHub release with the pinned
   install command. Nothing is published to npm.
5. Users update with `npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'`.

Tags so far: `v6.3.1-itg.1`, `v6.3.1-itg.2`; `6.3.1-itg.3` is bumped and in the changelog but not
yet tagged.

## Upstream

- Upstream is `nahisaho/MUSUBI` (`main`). Add it as the `upstream` remote; on a new upstream
  release, merge it into `ITG-adjustments` and reset the version to `<upstream>-itg.1`.
- Generic fixes go upstream as per-theme pull requests cut from the fork commits, without the
  fork-only files (install instructions, ITG versioning, `storage/` records).

## CI Workflows

| Workflow                        | Runs                                                              |
| ------------------------------- | ----------------------------------------------------------------- |
| `ci.yml`                        | lint, format check, tests with coverage, build, audit, platform init tests |
| `constitutional-check.yml`, `constitutional-governance.yml` | constitutional validation, Phase -1 gate, steering sync, traceability |
| `traceability-check.yml`        | trace and gap checks with the globally installed package          |
| `docs.yml`                      | VitePress build of `website/` and deploy to GitHub Pages          |
| `release.yml`                   | verification and GitHub release on `v*.*.*` tags                  |
| `musubi-reusable.yml`           | reusable workflow for consumer repositories                       |

Only `ci.yml` (pull requests to any branch) and `release.yml` (tags) run on this fork; the other
workflows filter on `main` and `develop`, and `ci.yml` skips direct pushes to `ITG-adjustments`.

---

_Updated 2026-10-14 with `/sdd-steering`._
