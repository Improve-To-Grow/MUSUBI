# Implementation Report: Multilingual publication support only

## Metadata

- **Change ID**: CHANGE-001
- **Proposal**: `storage/changes/CHANGE-001.md` (Status: Approved)
- **Status**: Implemented
- **Implemented**: 2026-10-06
- **Implemented By**: Yaroslav (with Claude Code)
- **Profile**: `cli` (`steering/project.yml`: `core_paths: [src]`, `delivery_paths: [bin]`)
- **Type**: Refactor / scope reduction

MUSUBI now has exactly one language boundary: `TechArticleGenerator` in
`src/enterprise/tech-article.js`. Every other artifact (steering, requirements, design, tasks,
change proposals, skill deliverables) and all agent chat are English only.

## Feature Flag

Not created. This change removes an opt-in capability instead of adding one, and REQ-LANG-007
requires the removed configuration keys to fail validation immediately. A flag that re-enabled
bilingual output would contradict the requirement, and there is no new behaviour to roll out
gradually.

## Changes Applied

### ADDED

- [x] `src/validators/project-validator.js` — `REMOVED_PROJECT_KEYS` and the validation error that names `locale`, `agents.default_language` or `agents.bilingual_output` (REQ-LANG-007) ✅
- [x] `tests/validators/reviewer-corrections.test.js` — proves `RequirementsReviewer` / `DesignReviewer.applyCorrections()` leave a sibling `.ja.md` untouched and ignore the removed `updateJapanese` option (4 tests) ✅
- [x] `tests/project-validator.test.js` — removed-key rejection (3 cases), `agents.output` still accepted, no language defaults (5 tests) ✅
- [x] `CHANGELOG.md` — `[Unreleased]` entry (Changed / Removed) ✅

### MODIFIED

Source:

- [x] `src/schemas/project-schema.json` — `agents.default_language` and `agents.bilingual_output` removed ✅
- [x] `src/validators/project-validator.js` — defaults and merge no longer carry language keys; validation fails on removed keys ✅
- [x] `src/validators/requirements-reviewer.js` — `applyCorrections()` drops `updateJapanese` and the `.ja.md` mirror; `filesModified` lists only the document and its backup ✅
- [x] `src/validators/design-reviewer.js` — same as above (ADR paths still listed) ✅
- [x] `src/orchestration/builtin-skills.js` — reviewer `correct` actions no longer pass `updateJapanese` ✅
- [x] `src/cli/init-generators.js` — `generateTechMd(languages, answers)` drops the unused locale parameter ✅

CLI:

- [x] `bin/musubi-init.js` — "Documentation language" prompt removed; `generateSteering()` writes `structure.md`, `product.md`, `tech.md` unconditionally with no `{{LOCALE}}` substitution; generated `project.yml` has no `locale` ✅
- [x] `bin/musubi-config.js` — `default_language` / `bilingual_output` defaults removed ✅
- [x] `bin/musubi-onboard.js` — same keys removed from the generated `project.yml` block ✅

Templates (7 platforms):

- [x] `src/templates/agents/claude-code/CLAUDE.md`, `codex/AGENTS.md`, `cursor/AGENTS.md`, `github-copilot/AGENTS.md`, `windsurf/AGENTS.md`, `gemini-cli/GEMINI.md`, `qwen-code/QWEN.md` — "Documentation Language" is one English-only statement; bilingual paragraph and `BILINGUAL-IMPLEMENTATION.md` pointer deleted ✅
- [x] `src/templates/shared/steering/structure.md` — documentation bullet is English only ✅
- Installed copies: the repo's `.claude/skills/*/SKILL.md` and `.github/` files already stated an English-only policy and contained no bilingual text, so nothing to re-sync. User projects re-sync with `musubi sync` (migration step 3).

Project configuration and docs:

- [x] `steering/project.yml` — `locale: en` removed ✅
- [x] `steering/project.yml.README.md`, `steering/structure.md`, `steering/rules/agent-validation-checklist.md` — bilingual references replaced; `structure.md` records the single language boundary ✅
- [x] `README.md` — feature bullet removed; "Documentation Language" section rewritten ✅
- [x] `docs/USER-GUIDE.md`, `docs/guides/cli-reference.md`, `docs/guides/troubleshooting.md`, `docs/guides/INTERACTIVE-TUTORIALS.md`, `docs/agent-output-pattern.md`, `docs/gradual-output-implementation-guide.md`, `docs/snippets/phase4-gradual-output-template.md`, `PLATFORM-COMPARISON.md`, `docs/marketing/awesome-list-submissions.md` — bilingual output no longer presented as a feature ✅
- [x] `docs/guides/ARCHITECTURE-DEEP-DIVE.md` — `src/templates/index.js` and `locale-manager.js` dropped from the module tree (not in the proposal list; it documented the deleted files) ✅

Tests:

- [x] `tests/project-validator.test.js` — no longer asserts `agents.default_language` ✅
- [x] `tests/external-spec.test.js` — fixture `project.yml` has no `locale` ✅

Not modified (historical records, as specified): `docs/analysis/*`, `docs/plans/*`,
`docs/requirements/srs/*`, `MULTI-AGENT-DESIGN.md`, `MULTI-AGENT-IMPLEMENTATION.md`,
`PROJECT-PLAN-MUSUBI.md`, `docs/design/adr/ADR-P1-003-vscode-extension.md`, past `CHANGELOG.md`
entries, and the article sources under `docs/Qiita/`, `docs/DevTo/`.

### REMOVED

- [x] `BILINGUAL-IMPLEMENTATION.md` ✅
- [x] `src/templates/locale-manager.js` (`LocaleManager`) ✅
- [x] `src/templates/index.js` (only re-exported `LocaleManager`; `src/templates/template-constraints.js` stays and is imported directly) ✅
- [x] `tests/templates/locale-manager.test.js` (34 tests) ✅

No deprecation period: the proposal classifies these as breaking changes with migration steps, and
nothing inside `src/` or `bin/` consumed them.

## Test Results

Command: `npx jest --coverage` (full suite, 2026-10-06)

| Metric | Result |
| --- | --- |
| Test suites | 164 passed, 164 total |
| Tests | 4920 passed, 4920 total |
| Statements | 77.01% (threshold 60%) ✅ |
| Branches | 65.65% (threshold 45%) ✅ |
| Functions | 81.63% (threshold 60%) ✅ |
| Lines | 77.82% (threshold 60%) ✅ |

Removing `locale-manager.js` did not affect coverage: `src/templates/**` is excluded in
`jest.config.js`. `npx eslint` and `npx prettier --check` pass on every changed JavaScript file.

Targeted suites: `tests/project-validator.test.js`, `tests/external-spec.test.js`,
`tests/validators/reviewer-corrections.test.js`, `tests/builtin-skills.test.js`,
`tests/templates/`, `tests/init-platforms.test.js` (165 tests, all passing).

Integration tests: `musubi init` has no non-interactive test harness (the existing
`tests/init-platforms.test.js` only checks template files), so the removed prompt and the
English-only steering output were verified by code review of `generateSteering()`; see the
traceability matrix. E2E: not applicable.

## Traceability Matrix

| Requirement | Design | Implementation | Tests | Status |
| --- | --- | --- | --- | --- |
| REQ-LANG-001 | Platform "Documentation Language" section; `musubi init` English-only steering | `src/templates/agents/claude-code/CLAUDE.md:144`, `codex/AGENTS.md:93`, `cursor/AGENTS.md:93`, `github-copilot/AGENTS.md:93`, `windsurf/AGENTS.md:93`, `gemini-cli/GEMINI.md:87`, `qwen-code/QWEN.md:87`; `bin/musubi-init.js:613` | `tests/init-platforms.test.js` (templates present); `generateSteering()` reviewed manually (interactive CLI) | ✅ |
| REQ-LANG-002 | Platform "Documentation Language" section | same template lines as above | Manual review (chat behaviour) | ✅ |
| REQ-LANG-003 | `TechArticleGenerator.resolveLanguage` | `src/enterprise/tech-article.js:192` | `tests/enterprise/tech-article.test.js:287` (`resolveLanguage`), `:377` (config default) | ✅ unchanged |
| REQ-LANG-004 | `LANGUAGE.JA`, Qiita/Zenn templates | `src/enterprise/tech-article.js:53` | `tests/enterprise/tech-article.test.js:303` (`Japanese output`), `:339` | ✅ unchanged |
| REQ-LANG-005 | `getStrings` fallback | `src/enterprise/tech-article.js:202` | `tests/enterprise/tech-article.test.js:298` | ✅ unchanged |
| REQ-LANG-006 | No language prompt / keys in init, onboard, config, schema | `bin/musubi-init.js:613`, `:656`; `bin/musubi-onboard.js`; `bin/musubi-config.js`; `src/schemas/project-schema.json` | `tests/project-validator.test.js:140`, `:299`; `tests/external-spec.test.js:174`; init/onboard prompts verified manually | ✅ |
| REQ-LANG-007 | Project validator removed-key error | `src/validators/project-validator.js:45`, `:121` | `tests/project-validator.test.js:97-137` | ✅ |
| Reviewer `.ja.md` siblings untouched (design change) | Reviewer correction methods | `src/validators/requirements-reviewer.js:793`, `src/validators/design-reviewer.js:974`, `src/orchestration/builtin-skills.js` | `tests/validators/reviewer-corrections.test.js:63`, `:73` | ✅ |

Coverage: 7 requirements, 7 implemented (100%), 7 with automated or manual verification; 5 of 7
have automated tests (REQ-LANG-002 is a chat-behaviour rule, REQ-LANG-001's CLI half is
interactive).

## Constitutional Compliance

- **Profile**: `cli` (from `steering/project.yml`)
- ✅ Article I: Testable Core — all logic lives under `src/` (`validators`, `orchestration`, `cli`) with tests that run without the CLI; `bin/` only prompts and writes files.
- ✅ Article II: Automation Interface — existing CLIs (`musubi init`, `musubi config`, `musubi onboard`) remain the interface; no new library was introduced, so no new CLI is required.
- ✅ Article III: Test-First — removed-key and reviewer tests were written against the proposal's requirements before the implementation was finalised; red → green → formatted.
- ✅ Article IV: EARS Format — REQ-LANG-001…007 in the proposal use WHEN / WHERE / IF…THEN / SHALL.
- ✅ Article V: Traceability — matrix above.
- ✅ Article VI: Project Memory — `steering/structure.md`, `steering/project.yml`, `steering/project.yml.README.md`, `steering/rules/agent-validation-checklist.md` updated; `steering/tech.md` unchanged (no dependency changes).
- ✅ Article VII: Simplicity — net −1,380 lines (156 insertions, 1,536 deletions); one module and one guide removed, nothing added beyond the validator check.
- ✅ Article VIII: Anti-Abstraction — framework APIs (`ajv`, `fs-extra`, `js-yaml`) called directly; no wrappers added.
- ✅ Article IX: Integration-First — tests use the real filesystem (temp dirs) and the real reviewers; only the placeholder defect lookup is stubbed to force a replacement.

## Deployment Readiness

- [x] Feature flag — not applicable (see above)
- [x] Documentation updated
- [x] CHANGELOG entry added
- [ ] Version bump / release notes — decide at release time (`[Unreleased]`)
- [x] Rollback plan — `git revert` of the implementing commit restores every file (no data migration)
- [ ] Stakeholders notified — external users must follow the migration steps in the proposal

## Breaking Changes and Migration

See the proposal's "Breaking Changes" and "Migration Steps". In short: remove `locale`,
`agents.default_language`, `agents.bilingual_output` from `steering/project.yml` (validation now
fails until you do); delete or archive `<name>.<lang>.md` translations; re-sync platform instruction
files; drop any `LocaleManager` usage. Article generation needs no change.

## Next Steps

1. Review the working tree (`git status`): 35 modified, 4 deleted, 2 new files (this report and `tests/validators/reviewer-corrections.test.js`).
2. Commit: `refactor(lang): restrict multilingual support to technical-article publication (CHANGE-001)`.
3. Decide the release version for the `[Unreleased]` CHANGELOG entry.
4. Archive the change: `/sdd-change-archive CHANGE-001`.
