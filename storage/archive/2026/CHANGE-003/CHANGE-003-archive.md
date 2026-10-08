# Archive Report: Package entry point exports defined

## Metadata

- **Change ID**: CHANGE-003
- **Status**: Archived
- **Lifecycle**:
  - Proposed: 2026-10-08
  - Approved: 2026-10-08 (maintainer, `musubi-change approve CHANGE-003`; aliases as recommended)
  - Implemented: 2026-10-08 (commit `a790247` on `chore/scip-typescript-replace-codegraph`)
  - Released: pending (see "Release Status")
  - Archived: 2026-10-08
- **Total Duration**: same day (proposal to archive in one working session)
- **Archive Location**: `storage/archive/2026/CHANGE-003/`
- **Related Records**: [Proposal](CHANGE-003.md), [Implementation Report](CHANGE-003-implementation.md), delta record [CHANGE-003-delta.json](CHANGE-003-delta.json), previous change [CHANGE-002](../CHANGE-002/README.md)

## Release Status

MUSUBI is an npm CLI package, distributed from GitHub as `@improve-to-grow/musubi-sdd`, so
"deployed to production" means merged into `ITG-adjustments` and released. That has not happened
yet:

- The implementing commit `a790247` exists only on the local branch
  `chore/scip-typescript-replace-codegraph`, which has no upstream and has not been pushed. The
  branch also carries `3da9d34` (scip-typescript code navigation, the baseline of this change);
  neither commit is in `ITG-adjustments` (`bcc435d`).
- `package.json` is `6.3.1-itg.2`; the CHANGELOG entry sits under `[Unreleased]`, above
  `[6.3.1-itg.2]`.
- There is no feature flag and no staged rollout: the change makes previously `undefined` exports
  defined and adds names; nothing to roll out gradually.

The change was archived at the maintainer's request with implementation complete, the full suite
green and the records in place. Remaining release steps are listed under "Open Items".

## Summary

### What Was Changed

`require('musubi-sdd')` (`src/index.js`) now returns 64 top-level keys and none is `undefined`;
before, 11 of 58 were, since the entry point was created in v5.5.0 (`9c8d401`). The 11 classes
are exported under their own names, the six names the entry point used to advertise remain as
deprecated aliases, and the API reference and the `code-reviewer` skill no longer destructure
names the package does not have.

**ADDED**

- `tests/index.test.js` — 23 tests: no undefined export or namespace member (REQ-PKG-001); each repaired export is its source module's value and every function-valued export has `name === key` (REQ-PKG-002); each alias is its canonical export (REQ-PKG-003); every name the API reference and agent templates destructure from the package resolves (REQ-PKG-004)
- Canonical exports `ASTExtractor`, `TraceabilityAnalyzer`, `TasksGenerator`, `CICDManager`, `TraceabilityMatrixReport`, `ConstitutionValidator`, `AgentMemoryManager`
- "Deprecated aliases (CHANGE-003)" group: `AstExtractor`, `TaskGenerator`, `CICDIntegration`, `TraceabilityMatrixReporter`, `Constitution`, `AgentMemory`
- `CHANGELOG.md` `[Unreleased]` / `### Fixed` entry; `storage/changes/change-log.md` row

**MODIFIED**

- `src/index.js` — `require()` bindings and `module.exports`; `GapDetector`, `DesignGenerator`, `RequirementsGenerator` and `ChangeManager` keep their names and now resolve
- `docs/API-REFERENCE.md` — task generator example uses `TasksGenerator`
- `code-reviewer` skill, template and installed copy — imports `COMPLEXITY_THRESHOLDS` instead of `THRESHOLDS`

**REMOVED**

- `createTraceabilityMatrix` export (never defined; `TraceabilityAnalyzer#generateMatrix()` is the operation it named)
- `docs/API-REFERENCE.md` "Error Handling" section (`MUSUBIError` and `ValidationError` do not exist)

**Also in the implementing commit, outside the proposal**

- `DeltaSpecManager.importProposal()` (`src/managers/delta-spec.js`, 2 tests in `tests/managers/delta-spec.test.js`): `musubi-change approve` and `reject` build `storage/changes/<id>/delta.json` from a `musubi-change init` proposal when it is missing. Needed to approve this change with the CLI.
- The Claude Code hooks (`.claude/settings.json`), the "Code Navigation" sections of `CLAUDE.md` and `AGENTS.md`, and the `code-references` skill call the global `musubi-code` command instead of `node bin/musubi-code.js`.

### Final Metrics

Performance, adoption and satisfaction metrics do not apply to an unreleased library fix.

| Metric | Value |
| --- | --- |
| Test suites | 169 passed, 169 total (was 168 at baseline `3da9d34`) |
| Tests | 4878 passed, 4878 total (was 4853: 23 in `tests/index.test.js`, 2 in `tests/managers/delta-spec.test.js`) |
| Coverage (statements / branches / functions / lines) | 78.30% / 66.60% / 82.89% / 79.13% (thresholds 60 / 45 / 60 / 60; baseline 78.11% / 66.60% / 82.89% / 78.93%); `src/index.js` 0% → 100% |
| Package entry point | 64 top-level keys, 0 `undefined` (was 58 keys, 11 `undefined`) |
| Lint and format | `eslint` clean; `prettier --check --end-of-line auto` clean on `src/index.js` and `tests/index.test.js` |
| Change size | commit `a790247`: 17 files, +914 / −60 lines. CHANGE-003 itself: 7 files, +185 / −41; the rest is the change records and the two bundled edits |
| Bugs, incidents, rollbacks | none (not released) |
| Development time | one working session on 2026-10-08 |

Suite, coverage, export count and lint re-run on the archived tree on 2026-10-08.

### Deprecated Code

Nothing was scheduled for removal; the change adds deprecations instead. The six aliases are
grouped and commented at the end of `module.exports` (`src/index.js:180-187`), and the CHANGELOG
names the canonical replacement of each. No removal version is set; a later change can delete the
group. `createTraceabilityMatrix` was removed outright because it was never defined.

### Feature Flag

None was created (see the implementation report). Nothing to clean up.

### Lessons Learned

#### What Went Well ✅

- A runtime check over every export, rather than the two names in the report, turned `Constitution` and `CICDIntegration` into the full set of 11, and the documentation scan in REQ-PKG-004 found `THRESHOLDS`, `MUSUBIError` and `ValidationError` as well.
- Test-first worked as intended: 19 of 23 tests failed before the fix, naming each broken export and each bad documentation line as `file:line`; all 23 passed after it.
- `musubi-code dependents src/index.js` answered "who loads the entry point" (no file in `bin/`, `src/` or `tests/`) in one command. This was the first change to use the scip-typescript index from `3da9d34`, and it settled the "no breaking changes" claim and the safety of the aliases and of the removal.
- The proposal listed every line to change, so the implementation needed one decision outside it (the `@octokit/rest` stub below).

#### What Could Be Improved 📝

- `musubi-change archive` does not produce the archive that `/sdd-change-archive` documents. It was run twice:
  1. With a delta present, `DeltaSpecManager.archive()` wrote `storage/archive/CHANGE-003.json`, deleted `storage/changes/CHANGE-003/` (including `delta.md`) and left the proposal and the implementation report in `storage/changes/` (committed as `4eaae6f`).
  2. With the delta gone, the command fell back to the legacy `ChangeManager.archiveChange()`, which moved the proposal to `specs/changes/CHANGE-003.md`, a directory nothing else in MUSUBI uses, and left the implementation report behind.

  Neither path writes an archive report, a README or a change-log update, or uses `storage/archive/<year>/<id>/`. Both print "Delta merged to canonical specification", but nothing was merged, and the delta path prints `result.mergedTo`, which `archive()` does not return. The records were moved by hand.
- `musubi-change init` and `musubi-change approve` used different storage (`<id>.md` versus `<id>/delta.json`), so approving this change needed a code fix first (`importProposal()`). The fix went into the same commit as the change.
- The implementation report asked for CHANGE-003's files to be committed on their own; `a790247` also carries the `delta-spec` fix and the `musubi-code` hook and docs switch. The commit message names all three, but an upstream pull request for CHANGE-003 has to be cut from a subset of the commit.
- The proposal expected the new suite to run without mocks. Under Jest it cannot load `src/index.js` without stubbing the ESM-only `@octokit/rest` (Jest supports `require(esm)` only from Node 24.9). The load chain was not checked when the proposal was written, so the Article IX deviation appeared only during implementation.
- When the proposal was written, `musubi-code` was not on `PATH` and the analysis used `node bin/musubi-code.js`; the global command was linked afterwards, which is why the implementing commit switches the hooks and docs to it.

#### Recommendations for Future Changes

- Make `musubi-change archive` follow the `/sdd-change-archive` layout: move `<id>.md`, `<id>-implementation.md` and the delta record into `storage/archive/<year>/<id>/`, update `storage/changes/change-log.md`, drop the `specs/changes/` fallback, and only print "merged" when something was merged. Until then, archive with `/sdd-change-archive` and not the CLI.
- Make `musubi-change init` write the delta record that `approve`, `apply` and `archive` read, so one storage format serves the whole lifecycle.
- Load `@octokit/rest` lazily in the `GitHubClient` constructor (implementation report, "Follow-ups"); this would let `tests/index.test.js` drop its stub and make `require('musubi-sdd')` work on Node versions without `require(esm)`.
- Before writing "without mocks" into a proposal's test plan, load the target module under Jest once.
- Commit each change's files on their own, as the implementation report asks, so a change maps to one commit for revert and upstream.

## Files

### Created

- `storage/archive/2026/CHANGE-003/CHANGE-003.md` (proposal, moved from `storage/changes/`; `musubi-change archive` had put it in `specs/changes/`)
- `storage/archive/2026/CHANGE-003/CHANGE-003-implementation.md` (moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-003/CHANGE-003-delta.json` (the `musubi-change` delta record: written by `musubi-change archive` as `storage/archive/CHANGE-003.json` from `storage/changes/CHANGE-003/delta.json`, then moved here)
- `storage/archive/2026/CHANGE-003/CHANGE-003-archive.md` (this report)
- `storage/archive/2026/CHANGE-003/README.md`
- `tests/index.test.js`

### Modified (implementing commit `a790247`)

- `src/index.js`, `docs/API-REFERENCE.md`, `CHANGELOG.md`, `storage/changes/change-log.md`
- `src/templates/agents/claude-code/skills/code-reviewer/SKILL.md`, `.claude/skills/code-reviewer/SKILL.md`
- Outside the proposal: `src/managers/delta-spec.js`, `tests/managers/delta-spec.test.js`, `.claude/settings.json`, `.claude/skills/code-references/SKILL.md`, `CLAUDE.md`, `AGENTS.md`

### Deleted

- `storage/changes/CHANGE-003/delta.md` (by `musubi-change archive`, commit `4eaae6f`). It rendered the delta record, whose description is the proposal's; recover it with `git show a790247:storage/changes/CHANGE-003/delta.md`.
- No source files.

## Archival Actions

### Completed

- [x] Final metrics collected (full suite with coverage, export count and lint on the archived tree, 2026-10-08)
- [x] Proposal status updated to "Archived" with the implementing commit recorded
- [x] Change log row updated
- [x] Feature flag: not applicable
- [x] Deprecated code: the six aliases stay by design (REQ-PKG-003); `createTraceabilityMatrix` removed in the implementing commit
- [x] Documentation updated (during `/sdd-change-apply`)
- [x] Steering files: unchanged, as the proposal states (Article VI)
- [x] Archive report created
- [x] Files moved to `storage/archive/2026/CHANGE-003/`; the stray `specs/` directory removed

### Open Items

- [ ] Push `chore/scip-typescript-replace-codegraph` and open the PR into `ITG-adjustments` (it carries `3da9d34` as well)
- [ ] Choose the release version and move the CHANGE-003 CHANGELOG entry out of `[Unreleased]`
- [ ] Open the upstream pull request to `nahisaho/MUSUBI` with the CHANGE-003 files only (`src/index.js`, `tests/index.test.js`, `docs/API-REFERENCE.md`, the `code-reviewer` template, the CHANGELOG entry); upstream `main` has the same broken imports
- [ ] Follow-ups from the implementation report: lazy `@octokit/rest` load, `musubi-resolve` constructor bug, `src/managers/index.js`, API reference examples that call methods the classes lack, `musubi-sdd` versus `@improve-to-grow/musubi-sdd`, the "TypeScript Support" section
- [ ] New change for `musubi-change archive` (see "Recommendations")

### Backup / Recovery

The pre-change state is commit `3da9d34`. `git revert a790247` undoes the change but also the
`delta-spec` fix and the `musubi-code` hook and docs switch bundled in that commit. To undo
CHANGE-003 alone:

```bash
git checkout 3da9d34 -- src/index.js docs/API-REFERENCE.md src/templates/agents/claude-code/skills/code-reviewer/SKILL.md .claude/skills/code-reviewer/SKILL.md
git rm tests/index.test.js
# then remove the CHANGE-003 entry from CHANGELOG.md by hand
```

## Constitutional Compliance (Final Check)

- **Profile**: `cli` (`steering/project.yml`)
- ✅ Article I: Testable Core — the entry point exports the library's public API again (I-L3); the new suite runs without the CLI (I-2)
- ✅ Article II: Automation Interface — no CLI change; the documented library interface matches the code (II-2)
- ✅ Article III: Test-First — 19 of 23 tests observed failing before the fix and all passing after; suite green; coverage above thresholds (79.13% lines vs 60%)
- ✅ Article IV: EARS Format — REQ-PKG-001 to REQ-PKG-004 use the ubiquitous `SHALL` pattern
- ✅ Article V: Traceability — 4 of 4 requirements traced to code and tests (matrix in the implementation report)
- ✅ Article VI: Project Memory — steering unchanged; `steering/structure.md` already states the public API rule
- ✅ Article VII: Simplicity — one changed module and one test file; no new module or project
- ✅ Article VIII: Anti-Abstraction — aliases are plain re-exports, not a wrapper layer
- ⚠️ Article IX: Integration-First — the suite loads the real entry point, the 11 real modules and the real documents; `@octokit/rest` is stubbed because Jest cannot load the ESM-only package (implementation report, "Deviation from the Proposal")

## Sign-Off

Archived by Yaroslav (maintainer) on 2026-10-08. `musubi-change archive CHANGE-003` was run
first; the records were then completed and moved to the `/sdd-change-archive` layout by hand. No
separate engineering, product or QA sign-off is recorded for this single-maintainer project.

---

**Change archived** ✅ (release pending)
