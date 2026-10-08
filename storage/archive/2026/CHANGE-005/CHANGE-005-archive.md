# Archive Report: Index-first code navigation for Claude Code

## Metadata

- **Change ID**: CHANGE-005
- **Status**: Archived
- **Lifecycle**:
  - Proposed: 2026-10-08 (origin: the CHANGE-004 analysis, where symbol questions went to grep first)
  - Approved: 2026-10-08 (maintainer, `musubi-change approve Change-005`; scope decisions in the proposal header)
  - Implemented: 2026-10-08 (commits `3ac90dc` and `b4c6797` on `chore/scip-typescript-replace-codegraph`)
  - Released: pending (see "Release Status")
  - Archived: 2026-10-08
- **Total Duration**: same day (proposal to archive in one working session)
- **Archive Location**: `storage/archive/2026/CHANGE-005/`
- **Related Records**: [Proposal](CHANGE-005.md), [Implementation Report](CHANGE-005-implementation.md), delta record [CHANGE-005-delta.json](CHANGE-005-delta.json), previous change [CHANGE-004](../CHANGE-004/README.md)

## Release Status

As with CHANGE-004, "deployed to production" means merged into `ITG-adjustments` and released.
That has not happened yet:

- `3ac90dc` and `b4c6797` exist only on the local branch `chore/scip-typescript-replace-codegraph`,
  which has not been pushed. It also carries `3da9d34` (scip-typescript code navigation),
  CHANGE-003 and CHANGE-004 with their archive commits.
- `package.json` is `6.3.1-itg.2`. The CHANGELOG entries (one `### Added`, three `### Changed`)
  sit under `[Unreleased]`.
- There is no feature flag and no staged rollout. Projects receive the new section, skill and hook
  on `musubi upgrade` or `musubi-code setup` after the release. The updated SDD templates reach
  them only when they re-run `musubi init` for Claude Code.

In this repository the change is already live: `musubi-code` is npm-linked to the working copy,
and `.claude/settings.json` carries the hooks.

## Summary

### What Was Changed

Claude Code answered symbol questions (does X exist, where is it defined, what does a file export)
with grep, although the code index answers them. Four causes were found:

- the managed instructions covered usage questions only;
- 10 lines in the SDD templates prescribed `grep -r`;
- steering did not mention the index;
- nothing acted at the moment of the call.

All four are addressed.

**ADDED**

- `musubi-code hint --hook` (`src/code-index/hint.js`): synchronous PreToolUse hooks for the Grep tool, for Bash `grep`, `rg` and `git grep`, and for PowerShell `Select-String`. If the pattern names only indexed definitions, the hook adds a note with each definition and its `refs` command. It never blocks or approves, and stays silent for text, for searches outside the index and for piped greps (REQ-NAV-005, REQ-NAV-006)
- `.scip/names.json`, written after each build by `query.definitionNames()` (3,106 names on this repository). A missing list marks the index stale
- `tests/code-index/hint.test.js` (29 tests) and `tests/code-navigation-guidance.test.js` (14 tests)
- `CHANGELOG.md` `[Unreleased]`: `### Added` (grep reminder)

**MODIFIED**

- Managed "Code Navigation" section (`instructionSection()`): a question → command table, "before grep", and a precedence over SDD steps that say to grep (REQ-NAV-001, REQ-NAV-002). It is regenerated in `CLAUDE.md` and `AGENTS.md`
- `code-references` skill: definition, existence and export triggers; description is 1,007 of 1,536 characters (REQ-NAV-003)
- Claude Code SDD templates (`/sdd-change-init`, `/sdd-change-apply`, `/sdd-change-archive`, `/sdd-requirements`, the `change-impact-analyzer` skill and its template), plus their identical `.claude/` copies: index first, grep as the fallback (REQ-NAV-004)
- Steering (`tech.md`, `structure.md`, `rules/workflow.md`, `memories/suggested_commands.md`): the index-first rule and commands; the superseded `node bin/musubi-code.js` invocation replaced (REQ-NAV-007)
- `docs/guides/scip-typescript.md`: definition questions, "Grep reminder" section, and the corrected "Developing MUSUBI itself" note
- `CHANGELOG.md`: three `### Changed` entries; `storage/changes/change-log.md` row

**REMOVED**

- Nothing. Deleting `AGENTS.md` and the GitHub Copilot files was taken out of scope by the maintainer. The Copilot install was detected correctly for this workspace.

### Final Metrics

Performance, adoption and satisfaction metrics do not apply to an unreleased tooling change.

| Metric                                               | Value                                                                                                                                     |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Test suites                                          | 172 passed, 172 total (170 at baseline `1610689`)                                                                                         |
| Tests                                                | 4931 passed, 4931 total (4885 at baseline: 29 in `hint.test.js`, 14 in `code-navigation-guidance.test.js`, 3 more in `tests/code-index/`) |
| Coverage (statements / branches / functions / lines) | 78.46% / 66.92% / 83.05% / 79.29% (thresholds 60 / 45 / 60 / 60; baseline 78.31% / 66.61% / 82.89% / 79.13%)                              |
| `src/code-index/hint.js` coverage                    | 92.13% statements, 95.71% lines (target 90%)                                                                                              |
| Hook latency                                         | 0.22–0.23 s per call through the global CLI (limit 0.5 s)                                                                                 |
| Live verification                                    | note added for the Grep tool, Bash `grep`, `cd … && grep …`, `git grep`, PowerShell `Select-String`; no note for a text grep              |
| Lint and format                                      | `eslint` clean; `prettier --check --end-of-line auto` clean on the 9 JS files of the change                                               |
| Change size                                          | `3ac90dc`: 11 files, +1,099 / −62; `b4c6797`: 27 files, +1,271 / −81; without the change records: 32 files, +1,438 / −143                 |
| Bugs, incidents, rollbacks                           | none (not released)                                                                                                                       |
| Development time                                     | one working session on 2026-10-08                                                                                                         |

Suite, coverage, lint and format were re-run on the committed tree (`b4c6797`) on 2026-10-08.
The implementation run measured 78.47% statements; the 0.01-point difference is run-to-run
variance with the same code.

### Deprecated Code

Nothing was deprecated or removed.

### Feature Flag

None was created. To turn the reminder off, remove the `PreToolUse` entries from
`.claude/settings.json` (proposal, Migration Steps).

### Lessons Learned

#### What Went Well ✅

- The index answered the design questions during implementation as well. `musubi-code deps src/code-index/query.js` showed that `query.js` requires `indexer.js`, so the indexer loads it lazily instead of creating a load-time cycle, and this was decided before any code was written.
- The names list was prototyped on the real repository before it was implemented. The data (1,414 entries for `name`, 1,190 for `type`) drove the decision to leave class fields out, instead of finding the noise after release.
- Claude Code hot-loads hooks, so the hook was verified live in the same session. This resolved the proposal's open risk (the `if` filter does match `cd x && grep …`) and covered all five call paths.
- Test-first worked in both commits (RED, then GREEN). The first GREEN run also exposed a defect in a test: `toHaveProperty('constructor')` matched the inherited `Object.prototype.constructor`.
- The background PostToolUse hook rebuilt the stale index on its own and wrote `names.json`, which exercised the upgrade path for existing indexes without extra steps.

#### What Could Be Improved 📝

- **Who commits.** In CHANGE-004 the maintainer committed. During this apply, Claude committed the first commit (`3ac90dc`) itself and staged the second, which the maintainer then committed with their own message (`b4c6797`). The records first said "two commits" before both existed. The practice should be agreed once.
- **Unchecked numbers.** Two figures in the implementation record's first draft were wrong (28 instead of 29 tests, 1,064 instead of 1,007 characters). They were caught by re-measuring before staging, and should have been measured before writing.
- **`musubi-change` gaps again.** The delta record was created under `Change-005` while the proposal is `CHANGE-005`. Its `implemented` and `archived` states had to be set by hand, as for CHANGE-003 and CHANGE-004.
- **Format check on Windows.** `npm run format:check` does not run on Windows (single-quoted globs), and the CRLF working copy flags 374 untouched files. Verification needed `prettier --check --end-of-line auto` on explicit files.
- **Copilot wording left in.** The Claude commands still begin with "Instructions for GitHub Copilot" and use `#sdd-*` syntax (out of scope by decision), so the command being run says one thing and the harness another.

#### Recommendations for Future Changes

- Decide whether `/sdd-change-apply` commits or stages, and write it into the command or the steering (for example `steering/rules/workflow.md`).
- Measure the effect on the next `/sdd-change-init`: how many notes appear, and whether the analysis starts with the index. If notes are frequent, Claude still greps first, and blocking or stronger wording can be weighed with data.
- Include `musubi-change` ID handling in the pending CLI fix change (recommended in CHANGE-003 and CHANGE-004): accept and store IDs in the proposal's case, set `implemented`, and archive into `storage/archive/<year>/<id>/`.
- Make `format:check` portable (double-quoted globs, `--end-of-line auto`) in a small separate change.

## Files

### Created

- `storage/archive/2026/CHANGE-005/CHANGE-005.md` (proposal, moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-005/CHANGE-005-implementation.md` (moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-005/CHANGE-005-delta.json`: the `musubi-change` delta record, moved from `storage/changes/Change-005/delta.json`. By hand: `id` normalised from `Change-005` to `CHANGE-005`, `status` set to `archived` and `archivedAt` added; `updatedAt` kept from the implemented state
- `storage/archive/2026/CHANGE-005/CHANGE-005-archive.md` (this report)
- `storage/archive/2026/CHANGE-005/README.md`
- `src/code-index/hint.js`, `tests/code-index/hint.test.js`, `tests/code-navigation-guidance.test.js` (implementing commits)

### Modified (implementing commits)

- `3ac90dc`: `src/code-index/{indexer,query,setup}.js`, `bin/musubi-code.js`, `src/templates/code-index/SKILL.md`, `docs/guides/scip-typescript.md`, `tests/code-index/{setup,integration}.test.js`, `CHANGELOG.md`
- `b4c6797`: `src/templates/agents/claude-code/commands/{sdd-change-init,sdd-change-apply,sdd-change-archive,sdd-requirements}.md`, `src/templates/agents/claude-code/skills/change-impact-analyzer/{SKILL.md,impact-analysis-template.md}` and their `.claude/` copies; `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`, `.claude/skills/code-references/SKILL.md`; `steering/{tech.md,structure.md,rules/workflow.md,memories/suggested_commands.md}`; `CHANGELOG.md`; `storage/changes/change-log.md` (row added; updated at archive)

### Deleted

- `storage/changes/Change-005/delta.md` (at archive, as `musubi-change archive` would). It rendered the delta record, whose description is the proposal's. Recover with `git show b4c6797:storage/changes/Change-005/delta.md`.
- No source files.

## Archival Actions

### Completed

- [x] Final metrics collected (full suite with coverage, lint and format on `b4c6797`, 2026-10-08)
- [x] Proposal status updated to "Archived" with both commits recorded
- [x] Implementation report: commit 2 hash and message recorded
- [x] Change log row updated
- [x] Feature flag: not applicable
- [x] Deprecated code: none
- [x] Documentation updated (during `/sdd-change-apply`)
- [x] Steering files updated (during `/sdd-change-apply`, REQ-NAV-007)
- [x] Archive report created
- [x] Files moved to `storage/archive/2026/CHANGE-005/`

### Open Items

- [ ] Push `chore/scip-typescript-replace-codegraph` and open the PR into `ITG-adjustments`
- [ ] Choose the release version and move the CHANGE-003, CHANGE-004 and CHANGE-005 CHANGELOG entries out of `[Unreleased]`
- [ ] Follow-ups from the implementation report:
  - give the Copilot and other agents' templates the index-first steps;
  - refresh steering placeholders (`/sdd-steering`);
  - the `exports` entries in the names list;
  - a test for `writeNames()`'s error path;
  - a portable `format:check`.
- [ ] Measure the hint's effect on the next `/sdd-change-init`
- [ ] Agree on the commit practice for `/sdd-change-apply` (see "Recommendations")
- [ ] New change for `musubi-change` (open since CHANGE-003)

### Backup / Recovery

The pre-change state is commit `1610689`. To undo the change:

1. `git revert b4c6797 3ac90dc`. Reverting `b4c6797` conflicts on the change records, which have since moved to `storage/archive/2026/CHANGE-005/`. Resolve by keeping the archive.
2. Remove the PreToolUse `hint --hook` entries from `.claude/settings.json` by hand. The reverted setup no longer recognises them as its own.
3. Run `musubi-code setup` to restore the previous section and skill.

`.scip/names.json` is in the ignored `.scip/` directory and can be deleted.

## Constitutional Compliance (Final Check)

- **Profile**: `cli` (`steering/project.yml`)
- ✅ Article I: Testable Core: the hint logic is in `src/code-index/hint.js` and tested without the CLI or Claude Code
- ✅ Article II: Automation Interface: `musubi-code hint --hook` follows the JSON-in, JSON-out contract of `index --hook`
- ✅ Article III: Test-First: RED before both commits (`hint.js` missing plus 6 failing; 13 of 14 failing), GREEN after; coverage above thresholds (79.29% lines vs 60%)
- ✅ Article IV: EARS Format: REQ-NAV-001 to REQ-NAV-007 (ubiquitous, `WHEN`, `IF … THEN`)
- ✅ Article V: Traceability: 7 of 7 requirements traced to code and tests (matrix in the implementation report)
- ✅ Article VI: Project Memory: steering updated
- ✅ Article VII: Simplicity: one new module and one subcommand, no new dependency
- ✅ Article VIII: Anti-Abstraction: Claude Code's hook JSON used directly
- ✅ Article IX: Integration-First: real index build, real `names.json` and real CLI in the integration test; live check in Claude Code

## Sign-Off

Archived by Yaroslav (maintainer) on 2026-10-08. The records were moved to the
`/sdd-change-archive` layout by hand, as for CHANGE-003 and CHANGE-004. No separate engineering,
product or QA sign-off is recorded for this single-maintainer project.

---

**Change archived** ✅ (release pending)
