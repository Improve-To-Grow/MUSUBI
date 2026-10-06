# Archive Report: Multilingual publication support only

## Metadata

- **Change ID**: CHANGE-001
- **Status**: Archived
- **Lifecycle**:
  - Proposed: 2026-10-06
  - Approved: 2026-10-06
  - Implemented: 2026-10-06 (commit `3987026` on `ITG-adjustments`)
  - Released: pending (see "Release status")
  - Archived: 2026-10-06
- **Total Duration**: same day (proposal to archive in under one day)
- **Archive Location**: `storage/archive/2026/CHANGE-001/`
- **Related Records**: [Proposal](CHANGE-001.md), [Implementation Report](CHANGE-001-implementation.md)

## Release Status

MUSUBI is an npm CLI package, so "deployed to production" means published to npm. That has not
happened yet:

- The implementing commit `3987026` exists only on the local `ITG-adjustments` branch (not pushed).
- `package.json` is still `6.3.1`; the CHANGELOG entry sits under `[Unreleased]`.
- There is no feature flag and no staged rollout for this change (scope reduction; the removed
  configuration keys fail validation immediately by requirement REQ-LANG-007).

The change was archived at the maintainer's request with implementation complete, the full test
suite green and the records in place. Remaining release steps are listed under "Open Items".

## Summary

### What Was Changed

MUSUBI now has one language boundary: `TechArticleGenerator` in `src/enterprise/tech-article.js`
(per-call `language`, then `config.defaultLanguage`, then `en`; Qiita and Zenn keep Japanese
output). Every SDD artifact and all agent chat are English only.

**ADDED**

- `src/validators/project-validator.js` — `REMOVED_PROJECT_KEYS` and a validation error naming
  `locale`, `agents.default_language` or `agents.bilingual_output` (REQ-LANG-007)
- `tests/validators/reviewer-corrections.test.js` — reviewers leave `<doc>.ja.md` siblings untouched
- Five tests in `tests/project-validator.test.js`
- `CHANGELOG.md` `[Unreleased]` entry; `storage/changes/change-log.md`

**MODIFIED**

- Project schema, validator defaults/merge, `musubi init` / `config` / `onboard`, `steering/project.yml`
- `RequirementsReviewer` / `DesignReviewer.applyCorrections` (no `updateJapanese`, no `.ja.md` mirror) and their `builtin-skills` wrappers
- Seven platform instruction templates ("Documentation Language" is one English-only statement)
- README, user guide, CLI reference, tutorials, troubleshooting, platform comparison, marketing notes, architecture deep-dive, four steering files

**REMOVED**

- `BILINGUAL-IMPLEMENTATION.md`
- `src/templates/locale-manager.js` (`LocaleManager`) and `src/templates/index.js`
- `tests/templates/locale-manager.test.js` (34 tests)

### Final Metrics

Performance, adoption and satisfaction metrics do not apply to an unreleased CLI refactor.

| Metric | Value |
| --- | --- |
| Test suites | 164 passed, 164 total |
| Tests | 4920 passed, 4920 total |
| Coverage (statements / branches / functions / lines) | 77.01% / 65.65% / 81.63% / 77.82% (thresholds 60 / 45 / 60 / 60) |
| Lint and format | clean (`eslint`, `prettier --check`) |
| Change size | 42 files, +606 / −1536 lines |
| Bugs, incidents, rollbacks | none (not released) |
| Development time | one working session on 2026-10-06 |

### Deprecated Code

No deprecation period was used. The proposal lists the removals as breaking changes with
migration steps, and nothing inside `src/` or `bin/` consumed the removed module, so the code was
deleted in the implementing commit. No archive branch was created; git history is the backup.

Recovery, if ever needed:

```bash
git checkout 2f9d209 -- src/templates/locale-manager.js src/templates/index.js \
  tests/templates/locale-manager.test.js BILINGUAL-IMPLEMENTATION.md
```

### Feature Flag

None was created (see the implementation report). Nothing to clean up.

### Lessons Learned

#### What Went Well ✅

- The proposal named files and line ranges, so implementation was mechanical and every one of the seven EARS requirements traced to code and tests without interpretation.
- `tests/enterprise/tech-article.test.js` already covered REQ-LANG-003, 004 and 005, so the kept language boundary needed no new tests.
- The full suite passed on the first run after the change; `src/templates/**` is excluded from coverage collection, so deleting the module did not move any threshold.

#### What Could Be Improved 📝

- `RequirementsReviewer._findDefectInContent` and `DesignReviewer._findIssueInContent` are placeholders that return empty evidence, so `applyCorrections` never applies a change in real use. The new test must stub them. This predates CHANGE-001 and deserves its own fix.
- `musubi init` has no non-interactive entry point, so the prompt removal (REQ-LANG-006) and English-only steering output (REQ-LANG-001) could only be verified by reading `generateSteering()`.
- `storage/traceability/matrix.yml` (the `traceability.outputPath` in `steering/project.yml`) was not regenerated; the traceability matrix lives in the implementation report instead.
- The working copy uses CRLF line endings; scripted edits that matched `\n` silently did nothing until changed to `\r?\n`.
- Files were staged from the IDE while the commit ran, so the first commit captured only the new files and had to be amended.

#### Recommendations for Future Changes

- Give `musubi init` a testable seam (export `generateSteering()` or add a non-interactive defaults mode) before the next CLI-facing change.
- Implement the reviewer defect lookup from review results, or document `applyCorrections` as review-result driven.
- Regenerate the traceability matrix (`musubi trace` / traceability validator) as part of `/sdd-change-apply`.
- Commit from a quiet index: check `git status` immediately before `git commit` when an IDE is open.

## Files

### Created

- `storage/archive/2026/CHANGE-001/CHANGE-001.md` (proposal, moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-001/CHANGE-001-implementation.md` (moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-001/CHANGE-001-archive.md` (this report)
- `storage/archive/2026/CHANGE-001/README.md`
- `storage/changes/change-log.md`
- `tests/validators/reviewer-corrections.test.js`

### Modified (implementing commit `3987026`)

- `steering/project.yml`, `steering/structure.md`, `steering/project.yml.README.md`, `steering/rules/agent-validation-checklist.md`
- `README.md`, `CHANGELOG.md`, `PLATFORM-COMPARISON.md`, nine files under `docs/`
- `src/schemas/project-schema.json`, three files under `src/validators/`, `src/orchestration/builtin-skills.js`, `src/cli/init-generators.js`
- `bin/musubi-init.js`, `bin/musubi-config.js`, `bin/musubi-onboard.js`
- Seven platform templates under `src/templates/agents/`, `src/templates/shared/steering/structure.md`
- `tests/project-validator.test.js`, `tests/external-spec.test.js`

### Deleted

- `BILINGUAL-IMPLEMENTATION.md`, `src/templates/locale-manager.js`, `src/templates/index.js`, `tests/templates/locale-manager.test.js`

## Archival Actions

### Completed

- [x] Final metrics collected (test run and coverage of 2026-10-06)
- [x] Proposal status updated to "Archived"
- [x] Change log created (`storage/changes/change-log.md`)
- [x] Feature flag: not applicable
- [x] Deprecated code removed (in the implementing commit)
- [x] Documentation updated (during `/sdd-change-apply`)
- [x] Steering files updated (during `/sdd-change-apply`)
- [x] Archive report created
- [x] Files moved to `storage/archive/2026/CHANGE-001/`

### Open Items

- [ ] Push `ITG-adjustments` and open the PR
- [ ] Choose the release version and move the CHANGELOG entry out of `[Unreleased]`
- [ ] Publish to npm
- [ ] Commit the archival itself (these files are in the working tree, not yet committed)

### Backup / Recovery

The pre-change state is commit `2f9d209`. To revert the whole change:

```bash
git revert 3987026
```

## Constitutional Compliance (Final Check)

- **Profile**: `cli` (`steering/project.yml`)
- ✅ Article I: Testable Core — logic under `src/` with tests that run without the CLI
- ✅ Article II: Automation Interface — existing `musubi` CLIs remain the interface; no new library
- ✅ Article III: Test-First — tests written from the proposal's requirements; suite green; coverage above thresholds (77.8% lines vs 60%)
- ✅ Article IV: EARS Format — REQ-LANG-001…007
- ✅ Article V: Traceability — 7 of 7 requirements traced (matrix in the implementation report)
- ✅ Article VI: Project Memory — steering updated; language boundary recorded in `steering/structure.md`
- ✅ Article VII: Simplicity — no new projects or modules; net removal of about 930 lines of code and docs. Code-size limits (VII-4 to VII-6) were not re-measured because no file grew beyond the validator's 47 added lines.
- ✅ Article VIII: Anti-Abstraction — framework APIs used directly, no wrappers added
- ✅ Article IX: Integration-First — tests use the real filesystem and reviewers; only the placeholder defect lookup is stubbed

## Sign-Off

Archived by Yaroslav (maintainer) via `/sdd-change-archive` on 2026-10-06. No separate
engineering, product or QA sign-off is recorded for this single-maintainer project.

---

**Change archived** ✅ (release pending)
