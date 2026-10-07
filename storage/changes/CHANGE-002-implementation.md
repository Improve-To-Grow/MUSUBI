# Implementation Report: English-only platform, publication pipeline removed

## Metadata

- **Change ID**: CHANGE-002
- **Proposal**: [CHANGE-002.md](CHANGE-002.md)
- **Status**: Implemented
- **Implemented**: 2026-10-07
- **Implemented By**: Yaroslav (with Claude Code)
- **Profile**: `cli` (`steering/project.yml`: `core_paths: [src]`, `delivery_paths: [bin]`)
- **Type**: Refactor / scope reduction
- **Baseline**: commit `07dd8aa` on `ITG-adjustments`

MUSUBI is English only. The technical-article publication pipeline that CHANGE-001 kept as the
single language boundary (`TechArticleGenerator`, its Japanese string tables, the Qiita and Dev.to
article sources and the publication checklist) is gone, and `tests/language-policy.test.js` now
fails the suite on any CJK text under `src/`, `bin/`, `tests/`, `steering/` or `docs/`.

## Feature Flag

Not created. The change removes a capability rather than adding one, and REQ-PUB-001 requires the
removed exports to be absent, so there is nothing to roll out gradually.

## Changes Applied

### ADDED

- [x] `tests/enterprise/index.test.js` — the `enterprise` module still exports its 17 multi-tenant, experiment-report, error-recovery and rollback members and no longer exports `TechArticleGenerator`, `createTechArticleGenerator`, `PLATFORM`, `ARTICLE_TYPE` or `LANGUAGE`; `src/enterprise/tech-article` no longer resolves (23 tests, REQ-PUB-001) ✅
- [x] `tests/language-policy.test.js` — walks the working tree under `src/`, `bin/`, `tests/`, `steering/`, `docs/` (text extensions only; `node_modules`, `coverage`, `.vitepress` skipped) and fails on the first line matching `[\u3040-\u30FF\u4E00-\u9FFF]` in any file (1 test, REQ-LANG-008) ✅
- [x] `CHANGELOG.md` — `[Unreleased]` entries under Changed and Removed ✅

### MODIFIED

Source:

- [x] `src/enterprise/index.js` — `tech-article` require and the five exports removed; header comment reads "Experiment reports, error handling, rollback" ✅
- [x] `src/validators/project-validator.js` — `REMOVED_PROJECT_KEYS` comment no longer refers to the technical-article generator ✅

Tests:

- [x] `tests/validators/reviewer-corrections.test.js` — the `.ja.md` sibling fixture is now English (`SIBLING_DOC`); the four assertions that reviewers leave the sibling untouched are unchanged ✅

Documentation:

- [x] `README.md` — onboarding sample output no longer says `(en + ja)`; "Documentation Language" states English only with no exception ✅
- [x] `docs/USER-GUIDE.md` — feature bullet: English only for documents, chat and generated output ✅
- [x] `docs/guides/troubleshooting.md` — "Non-ASCII text is garbled" entry removed (it existed for article sources) ✅
- [x] `docs/API-REFERENCE.md` — `language: 'ja'` dropped from the `RequirementsGenerator` example (the class has no such option) ✅
- [x] `docs/agent-output-pattern.md` — `(JA)` deliverables removed from the System Architect example; total corrected to 6 files; `(EN)` labels dropped as redundant ✅
- [x] `MULTI-AGENT-DESIGN.md`, `MULTI-AGENT-IMPLEMENTATION.md` — bilingual claims and the dead links to `BILINGUAL-IMPLEMENTATION.md` removed ✅
- [x] `.github/prompts/setup-codegraph.prompt.md` — link to the deleted `docs/Qiita/MUSUBI-CodeGraph-MCP-Integration.md` removed ✅
- [x] `docs/requirements/req_v6.2.md` — IMP-6.2-006-02 annotated "Withdrawn by CHANGE-002 (2026-10-07)" ✅

Steering (Article VI):

- [x] `steering/structure.md` — "Multi-Language Support" replaced by "Language Policy": English only, enforcement test named, `locales/` tree removed ✅
- [x] `steering/product.md` — "Localization & Internationalization" states English only ✅
- [x] `steering/project.yml.README.md` — language note records CHANGE-002 ✅
- [x] `steering/memories/codegraph.md` — regenerated after the deletions (415 files, 4,469 entities) ✅
- [x] `storage/changes/change-log.md` — CHANGE-002 row ✅

Not modified (historical records, as specified): `docs/analysis/*`, `docs/plans/*`,
`docs/requirements/srs/*`, `docs/design/IMP-6.2-review-workflow-design.md`,
`docs/tasks/IMP-6.2-tasks.md`, `PROJECT-PLAN-MUSUBI.md`, released `CHANGELOG.md` entries,
`storage/archive/2026/CHANGE-001/*`. Platform instruction templates were already English-only
statements and needed no change. `.github/workflows/publish.yml` (npm release) and
`ExperimentReportGenerator` are untouched, as the proposal states.

### REMOVED

- [x] `src/enterprise/tech-article.js` (723 lines) ✅
- [x] `tests/enterprise/tech-article.test.js` (399 lines, 36 tests) ✅
- [x] `docs/Qiita/` (12 files) and `docs/DevTo/` (1 file), 11,668 lines ✅
- [x] `docs/marketing/article-publication-checklist.md` (114 lines) ✅

No deprecation period: nothing in `src/` or `bin/` consumed the generator, and the proposal lists the
removal as a breaking change with migration steps. Recovery: `git checkout 07dd8aa -- <path>`.

Change size (staged before this report was added): 37 files changed, 573 insertions(+), 13021 deletions(-). Files: 3 added, 18 modified,
16 deleted.

## Test Results

Test-first (Article III): both new suites were run before any removal. `tests/enterprise/index.test.js`
failed its six removal assertions and `tests/language-policy.test.js` listed 17 offending files
(the generator, its test, the checklist, the 12 Qiita sources, the reviewer fixture, and the
policy test itself until its regex escapes were restored). Both pass after the change.

Command: `npx jest --coverage` (full suite, 2026-10-07)

| Metric | Result | CHANGE-001 baseline |
| --- | --- | --- |
| Test suites | 165 passed, 165 total | 164 |
| Tests | 4908 passed, 4908 total | 4920 |
| Statements | 76.98% (threshold 60%) ✅ | 77.01% |
| Branches | 65.59% (threshold 45%) ✅ | 65.65% |
| Functions | 81.73% (threshold 60%) ✅ | 81.63% |
| Lines | 77.79% (threshold 60%) ✅ | 77.82% |

Removing the fully tested generator moved every global metric by less than 0.1 point.

Lint and format: `npm run lint` (eslint) is clean. `npx prettier --check --end-of-line auto` passes on
every changed JavaScript file. Note: the `format:check` npm script's single-quoted globs match no
files under Git Bash on Windows, and a plain `prettier --check` flags every CRLF file in this
working copy because `.prettierrc.json` sets `endOfLine: lf`; with `--end-of-line auto` 15
pre-existing warnings remain in files this change does not touch (for example
`bin/musubi-upgrade.js`).

Verification greps from the proposal (both empty):

```bash
git grep -l -P "[\x{3040}-\x{30FF}\x{4E00}-\x{9FFF}]" -- ':!node_modules' ':!storage/archive' ':!package-lock.json'
git grep -n -i "techarticle\|tech-article\|docs/Qiita\|docs/DevTo" -- ':!storage/archive' ':!CHANGELOG.md' ':!storage/changes'
```

Integration and E2E tests: not applicable (no CLI surface changed).

## Traceability Matrix

| Requirement | Design | Implementation | Tests | Status |
| --- | --- | --- | --- | --- |
| REQ-PUB-001 | Enterprise module public API | `src/enterprise/index.js:62` (export list without the article group); `src/enterprise/tech-article.js` deleted | `tests/enterprise/index.test.js:44`, `:48` | ✅ |
| REQ-LANG-001 (MOD) | Platform "Documentation Language" sections (unchanged, already English-only); no language code in `src/`, `bin/` | deletion of `src/enterprise/tech-article.js`; `README.md` "Documentation Language" | `tests/language-policy.test.js:52`; `git grep` checks above | ✅ |
| REQ-LANG-008 | `steering/structure.md` "Language Policy", `steering/product.md` | documentation and steering edits listed above; article sources and checklist deleted | `tests/language-policy.test.js:52` | ✅ |
| REQ-LANG-003 / 004 / 005 (REM) | — | removed with `src/enterprise/tech-article.js` | `tests/enterprise/tech-article.test.js` deleted | ✅ removed |
| IMP-6.2-006-02 (withdrawn) | `docs/design/IMP-6.2-review-workflow-design.md` §8.2 (historical) | — | — | ⚠️ withdrawn, annotated in `docs/requirements/req_v6.2.md` |

Coverage: 3 active requirements, 3 implemented (100%), 3 with automated tests (100%); 3 removed and
1 withdrawn, each accounted for.

`musubi-trace matrix` reads `storage/specs/` (REQ-P4, REQ-P5, REQ-GHA), which this change does not
touch, so `storage/traceability/matrix.yml` was not regenerated; the matrix for CHANGE-002 is the
table above.

## CodeGraph

The index was refreshed after the deletions (`codegraph-mcp index .`, stale rows pruned,
`musubi analyze --type codegraph`): 415 files, 4,469 entities, 16,828 relations, no rows for
`tech-article`. Before the change the clean graph showed no caller of `TechArticleGenerator` or
`createTechArticleGenerator` and no inbound relation to the module from any other file.

## Constitutional Compliance

- **Profile**: `cli` (from `steering/project.yml`)
- ✅ Article I: Testable Core — remaining logic under `src/` keeps its tests; the two new suites run without the CLI.
- ✅ Article II: Automation Interface — no CLI change; existing `musubi` commands remain the interface.
- ✅ Article III: Test-First — RED observed on both new suites before the removal, GREEN after; full suite green; coverage above thresholds.
- ✅ Article IV: EARS Format — REQ-PUB-001, REQ-LANG-001, REQ-LANG-008 use ubiquitous `SHALL` / `SHALL NOT`.
- ✅ Article V: Traceability — matrix above; IMP-6.2-006-02 withdrawn with an annotation rather than orphaned.
- ✅ Article VI: Project Memory — `steering/structure.md`, `steering/product.md`, `steering/project.yml.README.md`, `steering/memories/codegraph.md` updated; `steering/tech.md` unchanged (no dependency change).
- ✅ Article VII: Simplicity — net removal of about 12,900 lines; no new module, project or abstraction.
- ✅ Article VIII: Anti-Abstraction — `fs` and `path` used directly in the new test; nothing wrapped.
- ✅ Article IX: Integration-First — the language-policy test reads the real working tree; the export test loads the real module.

## Deployment Readiness

- [x] Feature flag — not applicable
- [x] Documentation updated
- [x] CHANGELOG entry added
- [ ] Version bump / release notes — decide at release time (`[Unreleased]`)
- [x] Rollback plan — `git revert` of the implementing commit; files recoverable from `07dd8aa`
- [ ] Stakeholders notified — external users follow the migration steps in the proposal

## Breaking Changes and Migration

See the proposal. In short: `require('musubi-sdd').enterprise` no longer exposes the five article
exports and `src/enterprise/tech-article` no longer resolves; copy the module out of git history if
you depend on it. Article sources live in git history only; published articles are unaffected.

## Next Steps

1. Commit: `refactor(lang): remove publication pipeline and make MUSUBI English only (CHANGE-002)`.
2. Decide the release version for the `[Unreleased]` CHANGELOG entry.
3. Archive the change: `/sdd-change-archive CHANGE-002`.
