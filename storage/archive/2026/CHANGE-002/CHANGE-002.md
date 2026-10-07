# English-only platform, publication pipeline removed

**Change ID**: CHANGE-002  
**Date**: 2026-10-07  
**Status**: ~~Proposed~~ → ~~Approved~~ → ~~Implemented~~ → **Archived**  
**Approved**: 2026-10-07 (maintainer, in chat)  
**Implemented**: 2026-10-07 (commit `deb1238` on `ITG-adjustments`; see [CHANGE-002-implementation.md](CHANGE-002-implementation.md))  
**Archived**: 2026-10-07 (`storage/archive/2026/CHANGE-002/`)  
**Type**: Refactor / Scope reduction  
**Priority**: P2  
**Supersedes**: CHANGE-001 (`storage/archive/2026/CHANGE-001/`), which kept one multilingual
component  
**Baseline**: commit `07dd8aa` on `ITG-adjustments`

## Description

Remove the technical-article publication pipeline and make MUSUBI English only.

CHANGE-001 (2026-10-06) made every SDD artifact and all agent chat English only, but kept one
language boundary: `TechArticleGenerator` in `src/enterprise/tech-article.js`, together with the
Japanese article sources it served and the checklist that tracked their publication. That pipeline
is a marketing workflow for one maintainer, not a feature of a specification-driven-development
tool, and it is the only reason Japanese strings, CJK regexes and platform-specific front matter
(Qiita, Zenn, Medium, Dev.to) still live in the codebase. This change deletes the whole pipeline
and leaves no language option, string table or locale code anywhere in `src/` or `bin/`.

"Publication pipeline" means the article pipeline. The npm release workflow
(`.github/workflows/publish.yml`, `musubi-release`) is not in scope and is unchanged.

Removed:

- `src/enterprise/tech-article.js`: `TechArticleGenerator`, `createTechArticleGenerator`,
  `PLATFORM`, `ARTICLE_TYPE`, `LANGUAGE`, the `STRINGS` tables, `registerLanguage()`,
  `resolveLanguage()`, CJK-aware `slugify()` / `countWords()` / `estimateReadingTime()`, and
  `generateFromExperiment()` (the bridge from experiment reports to articles).
- The five re-exports above from `src/enterprise/index.js` (and therefore from
  `require('musubi-sdd').enterprise`).
- `tests/enterprise/tech-article.test.js` (1 suite, 36 tests).
- Article sources: `docs/Qiita/*.md` (12 Japanese articles) and
  `docs/DevTo/MUSUBI-Constitutional-AI-for-SDD.md` (1 English article). The Dev.to source is
  English, but it exists only as pipeline input, so it goes with the pipeline. All 13 files stay
  recoverable from git history (see Rollback).
- `docs/marketing/article-publication-checklist.md`.

Kept:

- `ExperimentReportGenerator` (`src/enterprise/experiment-report.js`, IMP-6.2-006-01): a test
  report tool, not publication. Only its consumer `generateFromExperiment` disappears.
- `docs/marketing/awesome-list-submissions.md`: directory submissions, not article publication.
- `src/templates/shared/steering/product.md` "Localization" section: it describes the user's
  product, not MUSUBI.
- Platform instruction templates: their "Documentation Language" section is already a single
  English-only statement (CHANGE-001) and needs no change.

## Current State

- `TechArticleGenerator` has no consumer in `src/` or `bin/` other than the re-export in
  `src/enterprise/index.js:31-38` and `:76-81`. No CLI command, skill, orchestration pattern or
  workflow calls it (`git grep` over tracked files; CodeGraph confirmation recorded in the
  Appendix).
- `tests/enterprise/tech-article.test.js` is the only test that imports it.
- Japanese text in tracked, non-article files is limited to `src/enterprise/tech-article.js`
  (33 lines), `tests/enterprise/tech-article.test.js` (31 lines),
  `docs/marketing/article-publication-checklist.md` (5 lines) and one fixture heading in
  `tests/validators/reviewer-corrections.test.js:19`.
- Documentation still advertises Japanese output or bilingual files in: `README.md:518-520`
  (onboarding sample output says `(en + ja)`; `musubi onboard` has written English files only
  since CHANGE-001), `README.md:864-868`, `docs/USER-GUIDE.md:35`,
  `docs/guides/troubleshooting.md:488-505`, `docs/API-REFERENCE.md:98` (`language: 'ja'` on
  `RequirementsGenerator`, which has no such option), `docs/agent-output-pattern.md:179-184`,
  `MULTI-AGENT-DESIGN.md:250-251,349,375` and `MULTI-AGENT-IMPLEMENTATION.md:194,372,402` (both
  still link to the deleted `BILINGUAL-IMPLEMENTATION.md`), `steering/structure.md:472-495`,
  `steering/product.md:507-520`, `steering/project.yml.README.md:141-143`.
- `.github/prompts/setup-codegraph.prompt.md:104` links to
  `docs/Qiita/MUSUBI-CodeGraph-MCP-Integration.md`, which this change deletes.
- The originating requirement IMP-6.2-006-02 ("Technical Article Template Generation",
  `docs/requirements/req_v6.2.md:351-372`) is still marked implemented.

## Requirements Changes

### ADDED

- REQ-PUB-001: The system SHALL NOT provide technical-article generation or publication tooling;
  the `enterprise` module SHALL NOT export `TechArticleGenerator`, `createTechArticleGenerator`,
  `PLATFORM`, `ARTICLE_TYPE` or `LANGUAGE`.
- REQ-LANG-008: The repository SHALL contain no non-English prose (CJK characters) in `src/`,
  `bin/`, `tests/`, `steering/` or `docs/`, and SHALL NOT keep article sources or publication
  checklists; project documentation SHALL describe English as the only output language.

### MODIFIED

- REQ-LANG-001: The system SHALL produce all SDD artifacts (steering files, requirements,
  design, tasks, change proposals, skill deliverables) in English only.
  - **New**: The system SHALL emit all generated text (SDD artifacts, reports, CLI output and
    generator boilerplate) in English only, and SHALL NOT expose a language option, string table
    or locale code for any other language in `src/` or `bin/`.
  - **Reason**: CHANGE-001 scoped the requirement to SDD artifacts so that article generation
    could stay multilingual. With the pipeline gone, the requirement covers every output.
  - **Breaking Change**: Yes (see Impact Analysis). **Backward Compatibility**: none; there is no
    English-only mode to opt into because English is the only mode.

### REMOVED

- REQ-LANG-003 (article boilerplate in the resolved output language): no generator emits
  language-dependent boilerplate any more.
- REQ-LANG-004 (Japanese output for Qiita and Zenn): the platforms are no longer modelled.
- REQ-LANG-005 (unknown language code falls back to English): there is no language code to
  resolve.
- IMP-6.2-006-02 (Technical Article Template Generation, `docs/requirements/req_v6.2.md`):
  withdrawn. The requirement record stays in the v6.2 SRS with a one-line "Withdrawn by
  CHANGE-002" note so that the traceability check does not report it as unimplemented.

Unchanged: REQ-LANG-002 (English chat), REQ-LANG-006 (no language choice in `init` / `onboard` /
`project.yml`), REQ-LANG-007 (validator rejects removed keys).

### RENAMED

<!-- None -->

## Design Changes

### ADDED

<!-- None -->

### MODIFIED

- Enterprise module public API (`src/enterprise/index.js`): drops the "Tech Article
  (IMP-6.2-006-02)" export group; the header comment no longer lists "Document generation" as an
  article concern.
- `steering/structure.md` "Multi-Language Support": becomes a "Language Policy" section stating
  English only, with no language boundary and no `locales/` tree.
- `steering/product.md` "Localization & Internationalization": English only; the placeholder
  secondary languages and i18n strategy are removed.
- Project validator comment and `steering/project.yml.README.md`: no longer point to the
  technical-article generator as the remaining multilingual component.

### REMOVED

- `TechArticleGenerator` component (design section 8.2 "ArticleGenerator" in
  `docs/design/IMP-6.2-review-workflow-design.md` becomes historical).
- The "single language boundary" concept introduced by CHANGE-001.

## Code Changes

### ADDED

- `tests/enterprise/index.test.js`: asserts the enterprise module exports the multi-tenant,
  experiment-report, error-recovery and rollback groups and does **not** export
  `TechArticleGenerator`, `createTechArticleGenerator`, `PLATFORM`, `ARTICLE_TYPE` or `LANGUAGE`
  (REQ-PUB-001).
- `tests/language-policy.test.js`: scans tracked files under `src/`, `bin/`, `tests/`,
  `steering/` and `docs/` for Hiragana, Katakana and CJK Unified Ideographs
  (`[\u3040-\u30FF\u4E00-\u9FFF]`) and fails on any hit (REQ-LANG-008). Runs in the normal
  `npm test` suite.
- `CHANGELOG.md`: entry under `[Unreleased]`.

### MODIFIED

Source:

- `src/enterprise/index.js:5`: header comment.
- `src/enterprise/index.js:31-38`, `:76-81`: remove the `tech-article` require and the five
  exports.
- `src/validators/project-validator.js:43`: comment no longer mentions the technical-article
  generator.

Tests:

- `tests/validators/reviewer-corrections.test.js:19`: the `JA_DOC` fixture becomes an English
  `SIBLING_DOC`; the behaviour under test (reviewers leave `<doc>.ja.md` siblings untouched) is
  unchanged.

Documentation and steering:

- `README.md:518-520`: onboarding sample output lists `structure.md`, `tech.md`, `product.md`
  without `(en + ja)`.
- `README.md:864-868`: "Documentation Language" drops the technical-article exception.
- `docs/USER-GUIDE.md:35`: "English for all documents, chat and generated output".
- `docs/guides/troubleshooting.md:488-505`: the "Non-ASCII text is garbled" entry is removed
  (it existed for article sources).
- `docs/API-REFERENCE.md:98`: drop `language: 'ja'` from the `RequirementsGenerator` example.
- `docs/agent-output-pattern.md:179-184`: remove the `(JA)` output items and correct the file
  total.
- `MULTI-AGENT-DESIGN.md:250-251`, `:349`, `:375`; `MULTI-AGENT-IMPLEMENTATION.md:194`, `:372`,
  `:402`: remove bilingual claims and the dead links to `BILINGUAL-IMPLEMENTATION.md`.
- `steering/structure.md:472-495`, `steering/product.md:507-520`,
  `steering/project.yml.README.md:141-143`: as described under Design Changes.
- `.github/prompts/setup-codegraph.prompt.md:104`: remove the link to the deleted article.
- `docs/requirements/req_v6.2.md:351-372`: add "Withdrawn by CHANGE-002 (2026-10-07)".
- `steering/memories/codegraph.md`: regenerate after the deletions
  (`musubi analyze --codegraph`).
- `storage/changes/change-log.md`: CHANGE-002 row.

Not modified (historical records, left as-is): `docs/analysis/*`, `docs/plans/*`,
`docs/requirements/srs/*`, `docs/design/IMP-6.2-review-workflow-design.md`,
`docs/tasks/IMP-6.2-tasks.md`, `PROJECT-PLAN-MUSUBI.md`, released `CHANGELOG.md` entries,
`storage/archive/2026/CHANGE-001/*`.

### REMOVED

- `src/enterprise/tech-article.js` (723 lines)
- `tests/enterprise/tech-article.test.js` (399 lines, 36 tests)
- `docs/Qiita/` (12 files) and `docs/DevTo/` (1 file): 11,668 lines, about 460 KB
- `docs/marketing/article-publication-checklist.md` (114 lines)

Net: about 12,900 lines removed; two small test files added.

### RENAMED

<!-- None -->

## Impact Analysis

### Affected Components

- Enterprise module (`src/enterprise/`): public API shrinks; `ExperimentReportGenerator`,
  `TenantManager`, `ErrorRecoveryHandler`, `RollbackManager` unchanged.
- Package entry `src/index.js`: unchanged code, but `require('musubi-sdd').enterprise` loses five
  members.
- Documentation (README, user guide, API reference, troubleshooting, output-pattern guide,
  multi-agent design docs), steering (`structure.md`, `product.md`, `project.yml.README.md`,
  `memories/codegraph.md`), GitHub Copilot prompt `setup-codegraph`.
- Repository content: `docs/Qiita/`, `docs/DevTo/`, `docs/marketing/`.
- CI: `npm test` loses one suite and gains two; coverage thresholds unchanged (see Testing).

### Breaking Changes

- [ ] No breaking changes
- [x] Breaking changes (list below)

1. `require('musubi-sdd').enterprise` no longer exports `TechArticleGenerator`,
   `createTechArticleGenerator`, `PLATFORM`, `ARTICLE_TYPE`, `LANGUAGE`.
2. `require('musubi-sdd/src/enterprise/tech-article')` no longer resolves.
3. Article sources and the publication checklist are no longer in the repository.

No `steering/project.yml` key, CLI command or flag changes: nothing in `bin/` ever exposed the
generator, so `musubi` users see no behavioural difference.

### Migration Steps

1. External code that used `TechArticleGenerator`: copy the module out of git history
   (`git show 07dd8aa:src/enterprise/tech-article.js`) into your own project, or switch to a
   dedicated article tool. MUSUBI will not reintroduce it.
2. Article authors: retrieve sources with
   `git show 07dd8aa:docs/Qiita/<file>.md` (or check out the `docs/Qiita` tree at `07dd8aa`)
   and keep them outside this repository. Articles already published on Qiita and Dev.to are
   unaffected.
3. Any fork that still carries `.ja.md` steering siblings or Japanese article sources must remove
   them before `tests/language-policy.test.js` passes.

### Risks

| Risk                                                                   | Probability | Impact | Mitigation                                                                                                  |
| ---------------------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| An external npm consumer imports `TechArticleGenerator`                | Low         | Low    | Listed as breaking change; module recoverable from git; CHANGELOG entry                                     |
| Global coverage dips below threshold after removing a well-tested file | Low         | Medium | tech-article.js is 723 of about 60k source lines; verify with `npm test -- --coverage` before commit         |
| Language-policy test flags legitimate non-English content later        | Low         | Low    | The test scans only the listed directories; `node_modules` and `storage/archive` are excluded               |
| Documentation links to deleted article paths remain                    | Low         | Low    | `git grep "docs/Qiita\|docs/DevTo"` must return nothing outside `storage/archive` and released CHANGELOG   |

## Testing

### Test Changes

- [x] Unit tests updated
  - Delete `tests/enterprise/tech-article.test.js` (36 tests).
  - Add `tests/enterprise/index.test.js` (REQ-PUB-001).
  - Add `tests/language-policy.test.js` (REQ-LANG-008).
  - `tests/validators/reviewer-corrections.test.js`: English fixture; assertions unchanged.
- [ ] Integration tests updated: not applicable (no CLI surface changes).
- [ ] E2E tests updated: not applicable.

Expected counts: 164 suites / 4,920 tests (CHANGE-001 archive) become 165 suites / about 4,890
tests.

### Test Coverage

- Current coverage (CHANGE-001 archive, 2026-10-06): 77.01% statements, 65.65% branches, 81.63%
  functions, 77.82% lines; thresholds in `jest.config.js` are 60 / 45 / 60 / 60.
- Target: thresholds unchanged. Removing a fully tested file lowers the global averages by a
  fraction of a point at most; confirm with `npm test -- --coverage`.

### Verification Commands

```bash
# No CJK prose outside archives and node_modules
git grep -l -P "[\x{3040}-\x{30FF}\x{4E00}-\x{9FFF}]" -- ':!node_modules' ':!storage/archive' ':!package-lock.json'

# No references to the pipeline
git grep -n -i "techarticle\|tech-article\|docs/Qiita\|docs/DevTo" -- ':!storage/archive' ':!CHANGELOG.md'

# Suite, lint, format
npm test -- --coverage && npm run lint && npm run format:check
```

Both `git grep` commands must print nothing.

## Traceability

### Requirements → Design → Code → Tests

- REQ-PUB-001 → Enterprise module public API → `src/enterprise/index.js` →
  `tests/enterprise/index.test.js`
- REQ-LANG-001 (modified) → Platform instruction "Documentation Language"; absence of language
  options in `src/`, `bin/` → `src/templates/agents/*/{CLAUDE,AGENTS,GEMINI,QWEN}.md` (unchanged),
  deletion of `src/enterprise/tech-article.js` → `tests/language-policy.test.js`
- REQ-LANG-008 → `steering/structure.md` Language Policy, `steering/product.md` → documentation
  edits listed above → `tests/language-policy.test.js` (CJK scan) and the `git grep` checks
- REQ-LANG-003 / 004 / 005 (removed) → `tests/enterprise/tech-article.test.js` deleted with the
  implementation
- IMP-6.2-006-02 (withdrawn) → `docs/requirements/req_v6.2.md` annotation

## Rollback Plan

- Pre-change state: commit `07dd8aa`.
- Whole change: `git revert <implementing commit>`.
- Individual files:

  ```bash
  git checkout 07dd8aa -- src/enterprise/tech-article.js src/enterprise/index.js \
    tests/enterprise/tech-article.test.js docs/Qiita docs/DevTo \
    docs/marketing/article-publication-checklist.md
  ```

- No feature flag, data migration or staged rollout: this is an unreleased scope reduction in an
  npm CLI package, as with CHANGE-001.

## Constitutional Compliance

Profile: `cli` (`steering/project.yml`).

- Article I (Testable Core): remaining logic under `src/` keeps its tests; the two new tests run
  without the CLI (I-1, I-2).
- Article II (Automation Interface): no CLI change; existing `musubi` commands remain the
  interface.
- Article III (Test-First): the two new tests are written from REQ-PUB-001 and REQ-LANG-008 before
  the deletions; suite must be green with coverage above thresholds.
- Article IV (EARS): REQ-PUB-001, REQ-LANG-001, REQ-LANG-008 use ubiquitous `SHALL` / `SHALL NOT`
  patterns; no SHOULD / MUST / MAY.
- Article V (Traceability): matrix above; one requirement withdrawn with an annotation rather
  than silently orphaned.
- Article VI (Project Memory): `steering/structure.md`, `steering/product.md`,
  `steering/project.yml.README.md` and `steering/memories/codegraph.md` updated during apply.
- Article VII (Simplicity): net removal of about 12,900 lines; no new module, project or
  abstraction. Code-size limits (VII-4 to VII-6) unaffected.
- Article VIII (Anti-Abstraction): nothing added.
- Article IX (Integration-First): the language-policy test reads the real working tree; no mocks.

## Appendix

### CodeGraph

The CodeGraph index (`steering/memories/codegraph.md`) was regenerated on 2026-10-07 before this
proposal was finalised. The previous index (2026-10-06T07:41Z) predated CHANGE-001. The MCP
`reindex_repository` call stalled and was stopped; `codegraph-mcp index . --full` then left 70
rows from deleted or rewritten files in place (the indexer upserts and never prunes), and those
rows were pruned by hand before querying. Final index: 415 files, 4,490 entities,
16,911 relations.

Findings on the clean graph:

- One `TechArticleGenerator` class entity (`src/enterprise/tech-article.js:155-706`), one
  `createTechArticleGenerator` function (`:713-715`), 21 methods.
- `find_callers` on both symbols: none. No relation from any other file targets an entity in
  `src/enterprise/tech-article.js`; the file's outgoing relations are `calls` to unresolved
  globals (`Object.entries`, `fs.writeFile` and the like).
- Caveat: the indexer records neither `require()` edges nor cross-file `new X()` calls, so the
  re-export in `src/enterprise/index.js` and the test file's usage are invisible to it.
  `git grep` remains the authoritative consumer check; graph and grep agree that nothing outside
  the pipeline uses the generator.

### References

- Predecessor: `storage/archive/2026/CHANGE-001/CHANGE-001.md`
- Originating requirement: `docs/requirements/req_v6.2.md` IMP-6.2-006-02
- Design: `docs/design/IMP-6.2-review-workflow-design.md` section 8.2
- Tasks: `docs/tasks/IMP-6.2-tasks.md` T-020

### Change History

| Version | Date       | Author   | Changes          |
| ------- | ---------- | -------- | ---------------- |
| 1.0     | 2026-10-07 | Yaroslav | Initial proposal |

## Approval

- [ ] Technical review complete
- [ ] Product review complete
- [ ] Security review complete (not needed: no security surface)
- [ ] Ready to apply

Approval was recorded through the Status field (Approved, 2026-10-07, maintainer in chat); the
checklist above is left as submitted. Implementation and archive records:
`CHANGE-002-implementation.md`, `CHANGE-002-archive.md` in the same directory.
