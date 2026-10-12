# Archive Report: Code navigation by default, for JavaScript/TypeScript and Python

## Metadata

- **Change ID**: CHANGE-006
- **Status**: Archived
- **Lifecycle**:
  - Proposed: 2026-10-09 (origin: the feasibility investigation of Python and mixed-project indexing, same day); revised 2026-10-12 (v1.1: mixed-project guarantees, grep guard)
  - Approved: 2026-10-12 (maintainer, `musubi-change approve CHANGE-006`)
  - Implemented: 2026-10-12 (commits `29c6c1b`, `6f534a6`, `0d846f7`, `55113ec`, `15e8b27` on `feat/code-index-python`)
  - Released: pending (see "Release Status")
  - Archived: 2026-10-12
- **Total Duration**: four days from proposal to archive; investigation, implementation and archive each in one working session
- **Archive Location**: `storage/archive/2026/CHANGE-006/`
- **Related Records**: [Proposal](CHANGE-006.md), [Implementation Report](CHANGE-006-implementation.md), delta record [CHANGE-006-delta.json](CHANGE-006-delta.json), previous change [CHANGE-005](../CHANGE-005/README.md)

## Release Status

As with CHANGE-005, "deployed to production" means merged into `ITG-adjustments` and released.
That has not happened yet:

- The five commits exist on the local branch `feat/code-index-python`, created from `9b9a2f4`
  (6.3.1-itg.2). The branch also carries the maintainer's `6303e50` (SDD command flows guide).
- `package.json` is still `6.3.1-itg.2`. The CHANGELOG entries (six `### Added`, five
  `### Changed`, one `### Removed`) sit under `[Unreleased]`. The release removes two CLI options,
  so it is at least a minor bump of the fork version.
- There is no feature flag. Projects receive the Python index, the default setup and the guard on
  `musubi upgrade` or `musubi-code setup` after the release; projects already set up get the guard
  as soon as the new version is installed, because the hook command did not change.

In this repository the change is already live: `musubi-code` is npm-linked to the working copy,
the index was rebuilt into the per-language layout, and the guard denied this agent's own Grep
calls during the implementation session.

## Summary

### What Was Changed

**ADDED**

- Python code navigation: `@sourcegraph/scip-python` 0.6.6 (exact pin) indexes `.py` and `.pyi`
  files; imports, calls on inferred receivers, `self.method()`, `super()`, base classes and
  decorators resolve across files; references are tagged `import`, `call`, `extends`,
  `decorator`, `super`, `ref`; `__init__` is the constructor (REQ-IDX-004, 005, 008, 009)
- Mixed projects: one index file per language (`.scip/index.typescript.scip`,
  `.scip/index.python.scip`) with its own fingerprint, merged into one model for every query and
  for `names.json`; `status` per language; a failing indexer leaves the other index usable
  (REQ-IDX-007, 013, 014)
- Language table in `src/code-index/indexer.js`, `detectLanguages()`, default roots with
  top-level Python directories and root files, environment and cache directories always skipped,
  `pythonArgs`, the empty `python-environment.json`, a transient pyright `extraPaths`
  configuration for src layout, and the 10-line Windows preload shim for scip-python's start-up
  crash (REQ-IDX-006, 010, 015, 016)
- Tests: `python.test.js` (12), `mixed.test.js` (5), `shim.test.js` (2), shared `fixtures.js`;
  extended `indexer`, `setup`, `hint`, `query`, `format` and `integration` suites
- Guide sections "Why scip-typescript and scip-python", "Python projects", "Grep guard",
  "Upgrading the indexers"

**MODIFIED**

- Setup runs without asking in every project with JavaScript, TypeScript or Python sources or
  project markers; `musubi init` also counts the chosen languages; other projects are reported as
  unsupported (REQ-IDX-001 to 003)
- The grep reminder became a guard: `musubi-code hint --hook` denies a Grep or shell grep whose
  pattern is only indexed names, with a reason that lists the definitions, the `refs` command and
  the escape (quote the name, or search outside the index); `--advisory` restores the note and
  setup keeps it (REQ-NAV-005, REQ-NAV-006 modified)
- Managed "Code Navigation" section, `code-references` skill, steering (`tech.md`,
  `structure.md`), user guide, CLI reference and README: both languages, "grep once for the
  quoted name", the guard (REQ-IDX-012, REQ-NAV-001/002 modified)
- `.scip/meta.json` version 2; an existing single-file index is rebuilt once

**REMOVED**

- The `musubi init` question, `musubi init --code-index` / `--no-code-index`,
  `musubi upgrade --no-code-index`, `musubi-code setup --force`, `isJavaScriptProject()`,
  `.scip/index.scip`

### Deviations from the proposal

Two, both recorded in the implementation report:

- REQ-IDX-010 is met by a transient `pyrightconfig.json` (`extraPaths: ["src"]`) during the Python
  build of a src-layout project without its own pyright configuration, not by stripping the
  `src.` prefix in the model: pyright emits no occurrence for an import it cannot resolve, so there
  is nothing to normalise. It is the one transient write outside `.scip/`.
- REQ-IDX-016 indexes top-level Python files as root files instead of making the project root the
  root, after MUSUBI's own `convert-agents-to-skills.py` had widened its JavaScript index from 385
  to 426 files.

### Final Metrics

Performance, adoption and satisfaction metrics do not apply to an unreleased tooling change.

| Metric | Value |
| --- | --- |
| Test suites | 175 passed, 175 total (172 at baseline `9b9a2f4`: `python`, `mixed`, `shim`) |
| Tests | 4,971 passed, 4,971 total (4,931 at baseline) |
| Coverage (statements / branches / functions / lines) | 78.71% / 67.34% / 83.27% / 79.50% (thresholds 60 / 45 / 60 / 60; baseline 78.46% / 66.92% / 83.05% / 79.29%) |
| `src/code-index/` coverage from its own 9 suites (116 tests) | 91.96% statements, 93.72% lines; `setup.js` 98.0, `format.js` 96.5, `query.js` 92.7, `hint.js` 92.3, `indexer.js` 89.5 statements; the shim runs in the spawned indexer process and is covered by `shim.test.js` through `node -r` |
| Guard latency | 228–252 ms per call through the global CLI (limit 0.5 s) |
| Live verification (this session, this repository) | Grep tool and Bash grep for `detectLanguages` denied with the reason; quoted pattern ran; `--advisory` returned the note; `musubi-code setup` idempotent; index rebuilt into the new layout: 396 JavaScript files (scip-typescript, 15.3 s) and 1 Python file (scip-python, 1.0 s); `names.json` 3,153 names |
| Python build times (proposal, Windows) | fixture 4 files 1.0 s; httpx 60 files 11.6 s / 2.1 MB; Django 2,906 files 2 min 39 s / 79 MB |
| Lint and format | `eslint` clean on `bin/`, `src/`, `tests/`; `prettier --check --end-of-line auto` clean on every changed JS file (`npm run format:check` still flags the CRLF working copy, pre-existing) |
| Change size | 33 files, +2,189 / −399 without the change records (tests: 10 files, +998 / −40); per commit: `29c6c1b` 13 files +184/−84, `6f534a6` 17 files +1,604/−202, `0d846f7` 5 files +39/−16, `55113ec` 9 files +206/−71, `15e8b27` 20 files +1,288/−55 |
| Dependency | `@sourcegraph/scip-python` 0.6.6: 24 packages added to `package-lock.json`, `npm audit --omit=dev` 0 vulnerabilities |
| Bugs, incidents, rollbacks | none (not released); one regression found and fixed before release (roots widened by a root-level script, `0d846f7`) |
| Development time | investigation session on 2026-10-09 (plus the alternatives survey), implementation and archive sessions on 2026-10-12 |

Suite, coverage and lint were re-run on the committed tree (`6303e50`, which contains `15e8b27`)
on 2026-10-12.

### Deprecated Code

Nothing was deprecated. The removed options are gone outright (CHANGELOG `### Removed`); passing
one now fails with commander's "unknown option".

### Feature Flag

None was created. `musubi-code hint --hook --advisory` in `.claude/settings.json` turns the guard
back into the note; removing the `PreToolUse` entries turns it off.

### Lessons Learned

#### What Went Well ✅

- The investigation measured mechanisms before the proposal was written: the Windows crash and
  the shim, the `--environment` crash, the venv leak into the fingerprint, the merged model and
  the serialize round-trip were all run in a scratchpad first. scip-python itself produced no
  surprise during implementation.
- Running the unchanged `query.js` against a Python index before designing showed that only tags,
  module and constructor kinds needed Python branches; the merge was a document concatenation.
- Dogfooding caught two defects the fixtures did not: this repository's root-level script widened
  the JavaScript roots, and detection ignored root files. The guard was verified against the
  agent's own tool calls in the same session, which is the strongest evidence available for a
  hook.
- Test-first held for all four planned commits (RED runs recorded: 5, 27, 6 and 4 failing tests).
- A failing test overturned a design decision early: the src-layout test showed that prefix
  stripping cannot work, before the feature was documented.

#### What Could Be Improved 📝

- **A requirement specified an impossible mechanism.** REQ-IDX-010 prescribed model
  normalisation because the investigation had checked symbol shapes, not whether unresolved
  references are emitted at all. The fix needed a transient write outside `.scip/`, against the
  letter of REQ-IDX-005. Requirements should state the outcome; mechanisms belong in the design,
  verified by an experiment when they rest on a third-party tool's behaviour.
- **REQ-IDX-016's rule was wrong for mixed repositories** and only dogfooding found it. A mixed
  fixture with a root-level script would have caught it in the RED phase.
- **Coverage was checked late.** The first full run showed `indexer.js` at 79% lines; the tests
  for queued builds, leftovers, refresh, a project-owned pyright configuration and the shim were
  added afterwards. The coverage check belongs after each commit's GREEN run.
- **Tooling friction repeated from CHANGE-005**: the Bash tool's backslash collapse broke a
  coverage regex and a README patch once each; `format:check` is still unusable on the CRLF
  working copy; `musubi-change` again needed `implemented` and `archived` set by hand and created
  a `delta.md` that the archive layout drops.
- **Commit practice** is now consistent (Claude commits the implementing commits, the maintainer
  commits the records) but still lives only in the records and in the agent's memory, not in
  steering.

#### Recommendations for Future Changes

- Write the `/sdd-change-apply` commit practice into `steering/rules/workflow.md` (open since
  CHANGE-005).
- For changes that depend on a third-party tool, add a "mechanism verified" note per requirement
  in the proposal's evidence table; `/sdd-change-init` could ask for it.
- Run `npx jest tests/<area> --coverage --collectCoverageFrom='src/<area>/**'` after every GREEN
  step, not at the end.
- Measure the guard on the next two SDD changes: count denials and how often the quoted-name
  escape was needed for a legitimate text search; if the escape dominates, widen the silence rules
  or default to `--advisory`.
- Keep the alternatives survey current: ty-scip becomes the candidate replacement once it skips
  non-identifier file names and resolves inferred receivers; the language table is the seam.

## Files

### Created

- `storage/archive/2026/CHANGE-006/CHANGE-006.md` (proposal, moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-006/CHANGE-006-implementation.md` (moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-006/CHANGE-006-delta.json`: the `musubi-change` delta record, moved from `storage/changes/CHANGE-006/delta.json`; `status` set to `archived` and `archivedAt` added by hand, `updatedAt` kept from the implemented state
- `storage/archive/2026/CHANGE-006/CHANGE-006-archive.md` (this report)
- `storage/archive/2026/CHANGE-006/README.md`
- Implementing commits: `src/code-index/scip-python-shim.js`, `tests/code-index/{fixtures.js,python.test.js,mixed.test.js,shim.test.js}`

### Modified (implementing commits)

- `29c6c1b`: `src/code-index/{indexer,setup,format}.js`, `bin/{musubi-code,musubi-init,musubi,musubi-upgrade}.js`, `tests/code-index/{indexer,setup,integration}.test.js`, `docs/guides/{cli-reference,scip-typescript}.md`, `CHANGELOG.md`
- `6f534a6`: `package.json`, `package-lock.json`, `src/code-index/{indexer,query,hint,format}.js`, `bin/musubi-code.js`, `tests/code-index/{indexer,format,hint,query}.test.js`, `docs/guides/scip-typescript.md`, `CHANGELOG.md`
- `0d846f7`: `src/code-index/{indexer,format}.js`, `tests/code-index/indexer.test.js`, `docs/guides/scip-typescript.md`, `CHANGELOG.md`
- `55113ec`: `src/code-index/{hint,setup}.js`, `bin/musubi-code.js`, `src/templates/code-index/SKILL.md`, `tests/code-index/{hint,setup,integration}.test.js`, `docs/guides/scip-typescript.md`, `CHANGELOG.md`
- `15e8b27`: `src/code-index/{setup,indexer}.js`, `src/templates/code-index/SKILL.md`, `.claude/skills/code-references/SKILL.md`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/USER-GUIDE.md`, `docs/guides/cli-reference.md`, `steering/{tech,structure}.md`, `tests/code-index/{setup,indexer,python}.test.js`, the change records
- At archive: `storage/changes/change-log.md` (row updated)

### Deleted

- `storage/changes/CHANGE-006/delta.md` (at archive, as for CHANGE-005). Recover with `git show 15e8b27:storage/changes/CHANGE-006/delta.md`.
- No source files.

## Archival Actions

### Completed

- [x] Final metrics collected (full suite with coverage and lint on `6303e50`, 2026-10-12)
- [x] Proposal status updated to "Archived" with all five commits recorded
- [x] Implementation report: the maintainer's commit `15e8b27` and message recorded
- [x] Change log row updated
- [x] Feature flag: not applicable
- [x] Deprecated code: none
- [x] Documentation updated (during `/sdd-change-apply`)
- [x] Steering files updated (during `/sdd-change-apply`: `tech.md`, `structure.md`)
- [x] Archive report created
- [x] Files moved to `storage/archive/2026/CHANGE-006/`

### Open Items

- [ ] Push `feat/code-index-python` and open the PR into `ITG-adjustments`
- [ ] Choose the release version (the `### Removed` entries make it at least a minor bump) and move the `[Unreleased]` entries out
- [ ] Follow-ups from the proposal and the implementation report:
  - third-party package resolution for Python (generate `python-environment.json` from the project's virtualenv);
  - index-first steps in the other agents' command templates (open since CHANGE-005);
  - query-side scaling for very large indexes (a Django-size index is deserialized per query);
  - ty-scip as the replacement candidate for scip-python (preview 0.1.0: aborts on non-identifier file names, drops inferred receivers);
  - drop the Windows shim once a scip-python release contains the fix for issue #210
- [ ] Measure the guard's effect on the next two SDD changes (denials, escapes)
- [ ] Write the commit practice into `steering/rules/workflow.md`; make `format:check` portable; the `musubi-change` CLI gaps (open since CHANGE-003)

### Backup / Recovery

The pre-change state is commit `9b9a2f4`. To undo the change:

1. `git revert 15e8b27 55113ec 0d846f7 6f534a6 29c6c1b` (newest first). Reverting `15e8b27` conflicts on the change records, which have since moved to `storage/archive/2026/CHANGE-006/`; resolve by keeping the archive.
2. `npm install` to drop `@sourcegraph/scip-python`.
3. `musubi-code setup` in affected projects to restore the previous section and skill wording. The reverted `getFreshness()` does not know the per-language files and rebuilds `.scip/index.scip` once.

To keep the change but turn the guard into a note, add `--advisory` to the four `hint --hook` entries in `.claude/settings.json`. Everything generated lives in the ignored `.scip/`.

## Constitutional Compliance (Final Check)

- **Profile**: `cli` (`steering/project.yml`)
- ✅ Article I: Testable Core: language detection, builds, Python symbol rules and the guard are in `src/code-index/` and tested without the CLI or Claude Code
- ✅ Article II: Automation Interface: every behaviour reachable through `musubi-code`; `hint --hook` keeps the JSON contract and adds the deny decision and `--advisory`
- ✅ Article III: Test-First: RED before each of the four planned commits, GREEN after; coverage above thresholds (79.50% lines vs 60%)
- ✅ Article IV: EARS Format: REQ-IDX-001 to 016 and the modified REQ-NAV-001/002/005/006 (ubiquitous, `WHEN`, `IF … THEN`)
- ✅ Article V: Traceability: 16 new and 4 modified requirements traced to code and tests (matrix in the implementation report); two deviations recorded with their reasons
- ✅ Article VI: Project Memory: steering updated
- ✅ Article VII: Simplicity: one new dependency, one 10-line shim, no new CLI command, the optional path deleted, one option as the rollback switch
- ✅ Article VIII: Anti-Abstraction: a two-entry language table; both indexers called through their CLIs; Claude Code's hook JSON used directly
- ✅ Article IX: Integration-First: real scip-typescript and scip-python builds and the real CLI in three end-to-end suites; live checks in Claude Code

## Sign-Off

Archived by Yaroslav (maintainer) on 2026-10-12. The records were moved to the
`/sdd-change-archive` layout by hand, as for CHANGE-003 to CHANGE-005. No separate engineering,
product or QA sign-off is recorded for this single-maintainer project.

---

**Change archived** ✅ (release pending)
