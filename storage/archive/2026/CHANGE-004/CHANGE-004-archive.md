# Archive Report: Fork package name and working library imports

## Metadata

- **Change ID**: CHANGE-004
- **Status**: Archived
- **Lifecycle**:
  - Proposed: 2026-10-08 (follow-up recorded in CHANGE-003)
  - Approved: 2026-10-08 (maintainer, `musubi-change approve CHANGE-004`; scope decisions in the proposal header)
  - Implemented: 2026-10-08 (commit `f70352e` on `chore/scip-typescript-replace-codegraph`)
  - Released: pending (see "Release Status")
  - Archived: 2026-10-08
- **Total Duration**: same day (proposal to archive in one working session)
- **Archive Location**: `storage/archive/2026/CHANGE-004/`
- **Related Records**: [Proposal](CHANGE-004.md), [Implementation Report](CHANGE-004-implementation.md), delta record [CHANGE-004-delta.json](CHANGE-004-delta.json), previous change [CHANGE-003](../CHANGE-003/README.md)

## Release Status

MUSUBI is an npm CLI package, distributed from GitHub as `@improve-to-grow/musubi-sdd`, so
"deployed to production" means merged into `ITG-adjustments` and released. That has not happened
yet:

- The implementing commit `f70352e` exists only on the local branch
  `chore/scip-typescript-replace-codegraph`, which has no upstream and has not been pushed. The
  branch also carries `3da9d34` (scip-typescript code navigation) and CHANGE-003 (`a790247`) with
  its archive commits; none of them is in `ITG-adjustments` (`bcc435d`).
- `package.json` is `6.3.1-itg.2`; the CHANGELOG entries sit under `[Unreleased]`, above
  `[6.3.1-itg.2]`.
- There is no feature flag and no staged rollout: the change touches documentation, agent
  templates and tests only. Projects initialised before the release keep their copies of the
  agent templates (proposal, Migration Steps, step 3).

The change was archived at the maintainer's request with implementation complete, the full suite
green and the records in place. Remaining release steps are listed under "Open Items".

## Summary

### What Was Changed

Library examples in the live documentation, the agent templates and this repository's installed
skills now load `@improve-to-grow/musubi-sdd` instead of the upstream `musubi-sdd`, from modules
that exist, with names those modules export. Before, none of the 84 documented imports loaded the
fork's package, 15 pointed at subpaths that do not exist and 14 imported names the module does not
export. The API reference and the troubleshooting guide now document the project-local install
that `require()` needs, and the plugin development guide, which described an API that does not
exist, is deleted.

**ADDED**

- `tests/package-name.test.js` — 4 tests: package name and `musubi-sdd` command in `package.json`; no upstream package name in live documentation, failures as `file:line` (REQ-DIST-001); the project-local install command in the API reference "Installation" section and the troubleshooting "Cannot find module" entry (REQ-DIST-002)
- `tests/helpers/live-documentation.js` — the live documentation set of REQ-DIST-001, shared by both suites
- "Use as a library" install instructions (`npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'`) in `docs/API-REFERENCE.md` and `docs/guides/troubleshooting.md`
- `CHANGELOG.md` `[Unreleased]`: `### Removed` (plugin guide) and two `### Fixed` entries; `storage/changes/change-log.md` row

**MODIFIED**

- 80 imports in 27 files load `@improve-to-grow/musubi-sdd`: API reference, user guide, quickstart, 7 guides, 6 platform agent templates, 6 Claude Code skill templates, `src/templates/skills/browser-agent.md` and 4 installed skills (still identical to their templates)
- Subpaths start with `src/` (13 lines in 3 guides); reviewer skills come from `src/orchestration/builtin-skills`; `ErrorHandler` and `PatternRegistry` from `src/orchestration`
- `docs/USER-GUIDE.md` "Validation API" uses `checkEarsFormat` and `ConstitutionalValidator#validateAll()`
- `docs/guides/ci-cd-integration.md` downloads the GitLab and Jenkins templates from the fork and calls the fork's reusable GitHub Actions workflow, instead of copying files the package does not ship
- `tests/index.test.js` (REQ-PKG-004, modified): scans the whole live documentation set, subpaths and ESM imports; one test became four

**REMOVED**

- `docs/guides/PLUGIN-DEVELOPMENT.md` (1,084 lines) and its two links
- "TypeScript Support" (`docs/API-REFERENCE.md`; the package ships no `.d.ts`) and "Validator Extension" (`docs/guides/ARCHITECTURE-DEEP-DIVE.md`; `ValidatorRegistry` does not exist)

Nothing outside the proposal's scope went into the implementing commit; the shared test helper is
the only file the proposal did not name.

### Final Metrics

Performance, adoption and satisfaction metrics do not apply to an unreleased documentation fix.

| Metric | Value |
| --- | --- |
| Test suites | 170 passed, 170 total (was 169 at baseline `451914e`) |
| Tests | 4885 passed, 4885 total (was 4878: 4 in `tests/package-name.test.js`, 3 more in `tests/index.test.js`) |
| Coverage (statements / branches / functions / lines) | 78.31% / 66.62% / 82.89% / 79.13% (thresholds 60 / 45 / 60 / 60; baseline 78.31% / 66.62% / 82.89% / 79.14%); no source code changed |
| Upstream package name in live documentation | 0 lines (proposal's `grep`; was 87: 84 imports and 3 `node_modules` paths) |
| Documented imports | all load and every imported name resolves (REQ-PKG-004 scan) |
| Lint and format | `eslint` clean; `prettier --check --end-of-line auto` clean on the three test files |
| Change size | commit `f70352e`: 40 files, +1,138 / −1,270 lines. CHANGE-004 itself, without the change records: 35 files, +396 / −1,270, of which 1,084 deletions are the plugin guide |
| Bugs, incidents, rollbacks | none (not released) |
| Development time | one working session on 2026-10-08 |

Suite, coverage, lint, format and the `grep` re-run on the archived tree on 2026-10-08.

### Deprecated Code

Nothing was deprecated or scheduled for removal. Documentation of APIs that do not exist was
removed outright. The CHANGE-003 deprecated aliases in `src/index.js` are unchanged.

### Feature Flag

None was created (see the implementation report). Nothing to clean up.

### Lessons Learned

#### What Went Well ✅

- Loading every documented import against the repository, instead of only replacing the name, found the 15 references to missing subpaths and the 8 missing names. A plain rename would have carried them over under the new name.
- Test-first caught a defect in the implementation itself: an edit script wrote `require($1musubi-sdd/src/…)` into 13 lines, and the widened scan passed because it skipped imports it could not parse. The new guard test ("loads the package by its quoted name") flags such lines, and the lines were repaired before anything was committed.
- `musubi-code symbols bin/musubi-upgrade.js` showed that `musubi-sdd upgrade` does not refresh templates, so the wrong migration step was corrected in the proposal and the CHANGELOG before release.
- The implementing commit stays within the proposal's scope, unlike CHANGE-003's `a790247`.

#### What Could Be Improved 📝

- The proposal planned two commits so that the path and name fixes could go upstream without the fork-only rename (Risks table). The split was prepared, with commit 1 staged and commit 2 in the working tree, but both were committed together as `f70352e`. The records said "two commits" until this archive. The upstream pull request now has to be rebuilt from `f70352e` (Open Items).
- `musubi-change archive CHANGE-004` could not archive the change, with or without `--force`:
  1. The delta record was still `approved`. No `musubi-change` command sets `implemented`: `apply` runs the legacy `ChangeManager.applyChange()`, which does not touch the delta record. CHANGE-003's record reached `implemented` only because it was edited by hand during apply.
  2. `--force` skips only the command's own status check (`bin/musubi-change.js:141`). `DeltaSpecManager.archive()` (`src/managers/delta-spec.js:305`) checks again and throws "Only implemented deltas can be archived".

  A `musubi-change` run after the commit (15:27 UTC) also rewrote `updatedAt` in both delta files. The records were moved by hand, as for CHANGE-003.
- The proposal counted imports before commit 1 changed the set (81 expected, 80 actual), and it stated that `musubi-sdd upgrade` refreshes templates without checking `bin/musubi-upgrade.js`.

#### Recommendations for Future Changes

- When a change plans separate commits, make them separately during `/sdd-change-apply` and record the hashes in the implementation report then, not at archive.
- Fix `musubi-change` in one change, together with the CHANGE-003 recommendations: a command (or `apply` on a delta) that sets `implemented`, `archive --force` passed through to `DeltaSpecManager.archive()`, the `storage/archive/<year>/<id>/` layout, the change-log update, and no `specs/changes/` fallback.
- Check claims about CLI behaviour in a proposal with `musubi-code` before approval, as was done for the analysis of the library code.

## Files

### Created

- `storage/archive/2026/CHANGE-004/CHANGE-004.md` (proposal, moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-004/CHANGE-004-implementation.md` (moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-004/CHANGE-004-delta.json` (the `musubi-change` delta record, moved from `storage/changes/CHANGE-004/delta.json`; `status` set to `archived` and `archivedAt` added by hand, because `musubi-change archive` refused, see "What Could Be Improved")
- `storage/archive/2026/CHANGE-004/CHANGE-004-archive.md` (this report)
- `storage/archive/2026/CHANGE-004/README.md`
- `tests/package-name.test.js`, `tests/helpers/live-documentation.js` (implementing commit)

### Modified (implementing commit `f70352e`)

- `docs/API-REFERENCE.md`, `docs/USER-GUIDE.md`, `docs/QUICKSTART.md`
- `docs/guides/`: `ARCHITECTURE-DEEP-DIVE.md`, `INTERACTIVE-TUTORIALS.md`, `builtin-skills-usage.md`, `ci-cd-integration.md`, `faq-troubleshooting.md`, `guardrails-guide.md`, `incremental-adoption.md`, `orchestration-patterns.md`, `p-label-parallelization.md`, `troubleshooting.md`
- `src/templates/agents/{codex,cursor,github-copilot,windsurf}/AGENTS.md`, `gemini-cli/GEMINI.md`, `qwen-code/QWEN.md`
- `src/templates/agents/claude-code/skills/{code-reviewer,design-reviewer,orchestrator,performance-optimizer,requirements-reviewer,security-auditor}/SKILL.md`, `src/templates/skills/browser-agent.md`
- `.claude/skills/{code-reviewer,orchestrator,performance-optimizer,security-auditor}/SKILL.md`
- `tests/index.test.js`, `CHANGELOG.md`, `storage/changes/change-log.md` (row added; updated at archive)

### Deleted

- `docs/guides/PLUGIN-DEVELOPMENT.md` (implementing commit). Recover with `git show 451914e:docs/guides/PLUGIN-DEVELOPMENT.md`.
- `storage/changes/CHANGE-004/delta.md` (at archive, as `musubi-change archive` would). It rendered the delta record, whose description is the proposal's; recover it with `git show f70352e:storage/changes/CHANGE-004/delta.md`.
- No source files.

## Archival Actions

### Completed

- [x] Final metrics collected (full suite with coverage, lint, format and the proposal's `grep` on the archived tree, 2026-10-08)
- [x] Proposal status updated to "Archived" with the implementing commit recorded
- [x] Implementation report: commit and rollback recorded (one commit instead of the planned two)
- [x] Change log row updated
- [x] Feature flag: not applicable
- [x] Deprecated code: none
- [x] Documentation updated (during `/sdd-change-apply`)
- [x] Steering files: unchanged, as the proposal states (Article VI); the `website/` entry in `steering/structure.md:544` goes with the website deletion follow-up
- [x] Archive report created
- [x] Files moved to `storage/archive/2026/CHANGE-004/`

### Open Items

- [ ] Push `chore/scip-typescript-replace-codegraph` and open the PR into `ITG-adjustments` (it carries `3da9d34` and CHANGE-003 as well)
- [ ] Choose the release version and move the CHANGE-003 and CHANGE-004 CHANGELOG entries out of `[Unreleased]`
- [ ] Open the upstream pull request to `nahisaho/MUSUBI` with the path and name fixes only, under the unscoped `musubi-sdd`: take the 15 commit-1 files listed in the implementation report ("Commits") from `f70352e` and revert the rename in them. Versions of these files with the unscoped name survive only as unreferenced git blobs (for example `54daa92`, `guardrails-guide.md`, and `6830e08`, `orchestration-patterns.md`) until `git gc` prunes them
- [ ] Follow-ups from the proposal: delete `website/` and `.github/workflows/docs.yml` (decided 2026-10-08); audit the methods the examples call (`SkillRegistry.register`, static `PatternRegistry.register`); the CI/CD guide's nonexistent `musubi-sdd init --platform` option
- [ ] New change for `musubi-change` (see "Recommendations"; also an open item of CHANGE-003)

### Backup / Recovery

The pre-change state is commit `451914e`. `git revert f70352e` undoes the change but conflicts on
the change records, which have since moved to `storage/archive/2026/CHANGE-004/`. To undo the
documentation and tests alone, while no later commit touches these paths:

```bash
git checkout 451914e -- docs .claude/skills src/templates tests/index.test.js CHANGELOG.md
git rm tests/package-name.test.js tests/helpers/live-documentation.js
```

## Constitutional Compliance (Final Check)

- **Profile**: `cli` (`steering/project.yml`)
- ✅ Article I: Testable Core — no core change; the documented library interface (I-L3) is usable from the fork
- ✅ Article II: Automation Interface — no CLI change; the documentation matches the interface (II-2)
- ✅ Article III: Test-First — RED observed before each part (2 and 5 failing), GREEN after; suite green; coverage above thresholds (79.13% lines vs 60%)
- ✅ Article IV: EARS Format — REQ-DIST-001, REQ-DIST-002 and the modified REQ-PKG-004 use the ubiquitous `SHALL` pattern
- ✅ Article V: Traceability — 3 of 3 requirements traced to documents and tests (matrix in the implementation report)
- ✅ Article VI: Project Memory — steering unchanged; `steering/structure.md:544` (`website/`) left to the website deletion follow-up
- ✅ Article VII: Simplicity — no new module; one helper shared by two test files; net −874 lines without the change records
- ✅ Article VIII: Anti-Abstraction — not applicable (no code)
- ✅ Article IX: Integration-First — the suites load the real modules and read the real documents (the `@octokit/rest` stub from CHANGE-003 remains in `tests/index.test.js`)

## Sign-Off

Archived by Yaroslav (maintainer) on 2026-10-08. `musubi-change archive CHANGE-004`, with and
without `--force`, refused the `approved` delta record; the records were then moved to the
`/sdd-change-archive` layout by hand. No separate engineering, product or QA sign-off is recorded
for this single-maintainer project.

---

**Change archived** ✅ (release pending)
