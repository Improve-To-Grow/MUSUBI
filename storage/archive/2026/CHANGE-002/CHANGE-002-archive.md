# Archive Report: English-only platform, publication pipeline removed

## Metadata

- **Change ID**: CHANGE-002
- **Status**: Archived
- **Lifecycle**:
  - Proposed: 2026-10-07
  - Approved: 2026-10-07 (maintainer, in chat)
  - Implemented: 2026-10-07 (commit `deb1238` on `ITG-adjustments`)
  - Released: pending (see "Release Status")
  - Archived: 2026-10-07
- **Total Duration**: same day (proposal to archive in one working session)
- **Archive Location**: `storage/archive/2026/CHANGE-002/`
- **Related Records**: [Proposal](CHANGE-002.md), [Implementation Report](CHANGE-002-implementation.md), predecessor [CHANGE-001](../CHANGE-001/README.md)

## Release Status

MUSUBI is an npm CLI package, so "deployed to production" means published to npm. That has not
happened yet:

- The implementing commit `deb1238` exists on the local `ITG-adjustments` branch; `ITG-adjustments` is 1 commit(s) ahead of its upstream and has not been pushed since the change.
- `package.json` is still `6.3.1`; the CHANGELOG entries sit under `[Unreleased]`, next to the
  CHANGE-001 entries that are also unreleased.
- There is no feature flag and no staged rollout: this is a scope reduction, and the removed
  exports are simply absent (REQ-PUB-001).

The change was archived at the maintainer's request with implementation complete, the full suite
green and the records in place. Remaining release steps are listed under "Open Items".

## Summary

### What Was Changed

MUSUBI is English only. The technical-article publication pipeline that CHANGE-001 kept as the
single language boundary is gone: no language option, string table or locale code remains in
`src/` or `bin/`, and a test enforces the absence of CJK text in source, tests, steering and docs.

**ADDED**

- `tests/enterprise/index.test.js` — enterprise module exports pinned; five article exports and the `tech-article` module asserted absent (23 tests, REQ-PUB-001)
- `tests/language-policy.test.js` — CJK scan over `src/`, `bin/`, `tests/`, `steering/`, `docs/` (REQ-LANG-008)
- `CHANGELOG.md` `[Unreleased]` entries; `storage/changes/change-log.md` row

**MODIFIED**

- `src/enterprise/index.js` (exports), `src/validators/project-validator.js` (comment), `tests/validators/reviewer-corrections.test.js` (English fixture)
- `README.md`, `docs/USER-GUIDE.md`, `docs/API-REFERENCE.md`, `docs/guides/troubleshooting.md`, `docs/agent-output-pattern.md`, `docs/requirements/req_v6.2.md` (IMP-6.2-006-02 withdrawn), `MULTI-AGENT-DESIGN.md`, `MULTI-AGENT-IMPLEMENTATION.md`, `.github/prompts/setup-codegraph.prompt.md`
- Steering: `structure.md` ("Language Policy"), `product.md`, `project.yml.README.md`, `memories/codegraph.md` (regenerated)

**REMOVED**

- `src/enterprise/tech-article.js` (723 lines) and `tests/enterprise/tech-article.test.js` (36 tests)
- `docs/Qiita/` (12 files), `docs/DevTo/` (1 file), `docs/marketing/article-publication-checklist.md`

### Final Metrics

Performance, adoption and satisfaction metrics do not apply to an unreleased CLI refactor.

| Metric | Value |
| --- | --- |
| Test suites | 165 passed, 165 total (was 164) |
| Tests | 4908 passed, 4908 total (was 4920: 36 removed, 24 added) |
| Coverage (statements / branches / functions / lines) | 76.98% / 65.59% / 81.73% / 77.79% (thresholds 60 / 45 / 60 / 60; each within 0.1 point of CHANGE-001) |
| Lint and format | `eslint` clean; `prettier --check --end-of-line auto` clean on every changed file |
| Change size | 38 files, +748 / −13,021 lines (commit `deb1238`) |
| Bugs, incidents, rollbacks | none (not released) |
| Development time | one working session on 2026-10-07 |

### Deprecated Code

No deprecation period was used. The proposal lists the removals as breaking changes with migration
steps, nothing inside `src/` or `bin/` consumed the generator, and the article sources were
pipeline input only, so everything was deleted in the implementing commit. No archive branch was
created; git history is the backup.

Recovery, if ever needed:

```bash
git checkout 07dd8aa -- src/enterprise/tech-article.js src/enterprise/index.js tests/enterprise/tech-article.test.js docs/Qiita docs/DevTo docs/marketing/article-publication-checklist.md
```

### Feature Flag

None was created (see the implementation report). Nothing to clean up.

### Lessons Learned

#### What Went Well ✅

- The proposal listed every file and line range, so `/sdd-change-apply` was mechanical: 38 files changed without a single ambiguous decision, and the full suite was green on the first run.
- Test-first paid off immediately. The language-policy test, run before the removal, flagged its own regex line: the tooling had decoded the `u3040`-style escapes into literal Japanese characters in both the test and the proposal. The test caught a defect in the change that was writing it.
- Coverage moved by less than 0.1 point despite deleting a fully tested 723-line module, so the thresholds needed no discussion.
- The CodeGraph index was rebuilt before the analysis and refreshed after the deletions, so the "no callers" finding in the proposal was checked against a clean graph rather than the stale one found at the start.

#### What Could Be Improved 📝

- The CodeGraph index predated CHANGE-001 and `codegraph-mcp index` (incremental and `--full`) never prunes rows for deleted files or superseded entities; the MCP `reindex_repository` tool stalled with no CPU use. Stale rows had to be pruned by hand with sqlite, twice. The indexer's own summary disagreeing with `codegraph-mcp stats` is the tell.
- `musubi analyze --codegraph` also runs the whole quality analysis and writes `steering/memories/code_quality_report_<date>.md` as a side effect; `--type codegraph` is the flag that only refreshes the index report.
- The `format:check` npm script uses single-quoted globs that match no files under Git Bash on Windows, and a plain `prettier --check` flags every CRLF file because `.prettierrc.json` sets `endOfLine: lf`. The script is not a real local gate; 15 pre-existing warnings exist in untouched files.
- `musubi-trace matrix` only reads `storage/specs/`, so requirement IDs that live in change records (REQ-LANG-*, REQ-PUB-*) are invisible to the traceability tooling. The matrix for both CHANGE-001 and CHANGE-002 lives in their implementation reports instead.
- CHANGE-001 left `(en + ja)` and `(JA)` leftovers in README and docs that a repo-wide grep would have caught. The new policy test now closes that gap.

#### Recommendations for Future Changes

- Add `.gitattributes` (`* text=auto eol=lf`) and fix the `format:check` globs (double quotes, or `--end-of-line auto`) so Prettier is a real gate on Windows.
- Rebuild the CodeGraph index from an empty `.codegraph/graph.db` after any commit that deletes or rewrites files, and refresh the report with `musubi analyze --type codegraph`. Consider an upstream issue for the missing pruning.
- Point traceability tooling at `storage/changes/` and `storage/archive/` as well, or record change-level requirements in `storage/specs/`, so Article V checks cover brownfield changes.
- Keep the language-policy test; extend its scanned directories if non-English text ever appears elsewhere (for example `website/`).

## Files

### Created

- `storage/archive/2026/CHANGE-002/CHANGE-002.md` (proposal, moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-002/CHANGE-002-implementation.md` (moved from `storage/changes/`)
- `storage/archive/2026/CHANGE-002/CHANGE-002-archive.md` (this report)
- `storage/archive/2026/CHANGE-002/README.md`
- `tests/enterprise/index.test.js`, `tests/language-policy.test.js`

### Modified (implementing commit `deb1238`)

- `src/enterprise/index.js`, `src/validators/project-validator.js`, `tests/validators/reviewer-corrections.test.js`
- `README.md`, `CHANGELOG.md`, `MULTI-AGENT-DESIGN.md`, `MULTI-AGENT-IMPLEMENTATION.md`, `.github/prompts/setup-codegraph.prompt.md`
- `docs/USER-GUIDE.md`, `docs/API-REFERENCE.md`, `docs/guides/troubleshooting.md`, `docs/agent-output-pattern.md`, `docs/requirements/req_v6.2.md`
- `steering/structure.md`, `steering/product.md`, `steering/project.yml.README.md`, `steering/memories/codegraph.md`
- `storage/changes/change-log.md`

### Deleted

- `src/enterprise/tech-article.js`, `tests/enterprise/tech-article.test.js`
- `docs/Qiita/` (12 files), `docs/DevTo/MUSUBI-Constitutional-AI-for-SDD.md`, `docs/marketing/article-publication-checklist.md`

## Archival Actions

### Completed

- [x] Final metrics collected (full suite with coverage, lint and format checks of 2026-10-07)
- [x] Proposal status updated to "Archived" with the implementing commit recorded
- [x] Change log row updated
- [x] Feature flag: not applicable
- [x] Deprecated code removed (in the implementing commit)
- [x] Documentation updated (during `/sdd-change-apply`)
- [x] Steering files updated (during `/sdd-change-apply`)
- [x] Archive report created
- [x] Files moved to `storage/archive/2026/CHANGE-002/`

### Open Items

- [ ] Push `ITG-adjustments` and open or update the PR
- [ ] Choose the release version and move the CHANGE-001 and CHANGE-002 CHANGELOG entries out of `[Unreleased]`
- [ ] Publish to npm

### Backup / Recovery

The pre-change state is commit `07dd8aa`. To revert the whole change:

```bash
git revert deb1238
```

## Constitutional Compliance (Final Check)

- **Profile**: `cli` (`steering/project.yml`)
- ✅ Article I: Testable Core — remaining logic under `src/` with tests that run without the CLI; the two new suites load the real module and read the real tree
- ✅ Article II: Automation Interface — existing `musubi` CLIs remain the interface; no new library
- ✅ Article III: Test-First — both new suites observed failing before the removal and passing after; suite green; coverage above thresholds (77.79% lines vs 60%)
- ✅ Article IV: EARS Format — REQ-PUB-001, REQ-LANG-001 (modified), REQ-LANG-008
- ✅ Article V: Traceability — 3 of 3 active requirements traced to code and tests; REQ-LANG-003/004/005 removed and IMP-6.2-006-02 withdrawn with an annotation (matrix in the implementation report)
- ✅ Article VI: Project Memory — steering updated; the English-only policy and its enforcement test recorded in `steering/structure.md`
- ✅ Article VII: Simplicity — no new projects or modules; net removal of about 12,300 lines. Code-size limits (VII-4 to VII-6) unaffected: the largest new file is a 70-line test
- ✅ Article VIII: Anti-Abstraction — `fs` and `path` used directly; no wrappers added
- ✅ Article IX: Integration-First — tests use the real filesystem and the real module; nothing mocked

## Sign-Off

Archived by Yaroslav (maintainer) via `/sdd-change-archive` on 2026-10-07. No separate
engineering, product or QA sign-off is recorded for this single-maintainer project.

---

**Change archived** ✅ (release pending)
