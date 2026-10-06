# Multilingual publication support only

**Change ID**: CHANGE-001  
**Date**: 2026-10-06  
**Status**: Approved  
**Type**: Refactor / Scope reduction  
**Priority**: P2

## Description

Restrict multilingual support in MUSUBI to technical-article creation and publication.
Everything else (SDD documents, agent chat, steering, templates, CLI prompts, project
configuration) is English only.

Commit `08df929` already made MUSUBI English-by-default and turned bilingual document/chat
output into an opt-in feature. This change removes that opt-in path entirely, together with
the locale machinery that only existed to serve it, and leaves exactly one language boundary
in the codebase: `TechArticleGenerator` in `src/enterprise/tech-article.js`.

Kept (article scope):

- `src/enterprise/tech-article.js`: `LANGUAGE`, `STRINGS`, `registerLanguage()`,
  `resolveLanguage()` (per-call `language`, then `config.defaultLanguage`, then `en`),
  CJK-aware `estimateReadingTime()`. Qiita and Zenn remain Japanese-first platforms.
- `src/enterprise/index.js`: `LANGUAGE` export.
- `tests/enterprise/tech-article.test.js`.
- `docs/Qiita/*.md`, `docs/DevTo/*.md`: article sources stay in their publication language.
- `docs/marketing/article-publication-checklist.md`.

Removed (everything else):

- Opt-in bilingual document output and second-language chat (`BILINGUAL-IMPLEMENTATION.md`).
- `LocaleManager` and the locale-specific steering-template lookup (`src/templates/`).
- `musubi init` "Documentation language" prompt and locale-suffixed steering files
  (`structure.ja.md`, `tech.ja.md`, and so on).
- `agents.default_language`, `agents.bilingual_output` and top-level `locale` in
  `steering/project.yml` and its JSON schema.
- `.ja.md` sibling handling (`updateJapanese`) in the requirements and design reviewers.

## Requirements Changes

### ADDED

- REQ-LANG-001: The system SHALL produce all SDD artifacts (steering files, requirements, design, tasks, change proposals, skill deliverables) in English only.
- REQ-LANG-002: The system SHALL conduct all agent-user chat interactions in English.
- REQ-LANG-003: WHEN a technical article is generated, the system SHALL emit generator boilerplate (headings, labels, reading-time text) in the resolved output language, resolved as per-call `language`, then `config.defaultLanguage`, then `en`.
- REQ-LANG-004: WHERE the target platform is Qiita or Zenn, the system SHALL support Japanese (`ja`) article output.
- REQ-LANG-005: IF an unknown article language code is requested, THEN the system SHALL fall back to English rather than fail.
- REQ-LANG-006: The system SHALL NOT offer a documentation-language choice in `musubi init`, `musubi onboard`, or `steering/project.yml`.
- REQ-LANG-007: IF `steering/project.yml` contains `locale`, `agents.default_language` or `agents.bilingual_output`, THEN the project validator SHALL fail validation with an error naming the removed key.

### MODIFIED

<!-- None. No existing EARS requirement covers language; the previous behaviour was documented only in BILINGUAL-IMPLEMENTATION.md, which this change supersedes. -->

### REMOVED

<!-- No requirement IDs are removed. The following capabilities had no EARS requirement and are dropped: -->
<!-- Opt-in bilingual output (BILINGUAL-IMPLEMENTATION.md sections 1-5): translated <name>.<lang>.md copies of every document and second-language chat. -->
<!-- Locale-specific steering template lookup (steering/templates/<file>.<locale>.md). -->

### RENAMED

<!-- None -->

## Design Changes

### ADDED

<!-- None. The article language model (LANGUAGE / STRINGS / registerLanguage) already exists and becomes the single, documented language boundary. -->

### MODIFIED

- Project configuration schema: `agents` object drops `default_language` and `bilingual_output`; top-level `locale` is not reintroduced.
- Project validator: defaults no longer carry `agents.default_language` / `agents.bilingual_output`; validation fails with an error for any removed key (REQ-LANG-007).
- Requirements / Design reviewers: correction-apply methods no longer take `updateJapanese` and no longer mirror replacements into `<doc>.ja.md`.
- Platform instruction files: the "Documentation Language" section becomes a single statement that all documents and chat are English. The bilingual paragraph and the pointer to `BILINGUAL-IMPLEMENTATION.md` are deleted (7 platforms).
- `musubi init`: writes `structure.md`, `tech.md`, `product.md` unconditionally; no locale prompt, no `{{LOCALE}}` substitution, no `locale` key in generated `project.yml`.

### REMOVED

- `LocaleManager` class and the `src/templates` module (its only export; no consumers other than its own tests).
- `BILINGUAL-IMPLEMENTATION.md` (opt-in guide).

## Code Changes

### ADDED

- `src/validators/project-validator.js`: validation error for removed `project.yml` keys (REQ-LANG-007).
- `CHANGELOG.md`: entry under the next release.

### MODIFIED

Source:

- `src/schemas/project-schema.json:129-145`: remove `agents.default_language`, `agents.bilingual_output`.
- `src/validators/project-validator.js:29-31`, `:149-153`: drop defaults/merge of `default_language` and `bilingual_output`; fail validation on removed keys.
- `src/validators/requirements-reviewer.js:786-897`: remove `updateJapanese` option and `.ja.md` sibling replacement.
- `src/validators/design-reviewer.js:967-1096`: same as above.
- `src/orchestration/builtin-skills.js:435`, `:664`: stop passing `updateJapanese`.

CLI:

- `bin/musubi-init.js:153-165`: remove the "Documentation language" prompt.
- `bin/musubi-init.js:631-665`: remove locale-suffixed template lookup and output filenames.
- `bin/musubi-init.js:682`: stop writing `locale` into generated `project.yml`.
- `bin/musubi-config.js:189`: remove `bilingual_output` default.
- `bin/musubi-onboard.js:437-441`: remove `default_language` and `bilingual_output` from the generated `project.yml` block.

Templates (installed copies in `.claude/`, `.github/` and root instruction files follow):

- `src/templates/agents/claude-code/CLAUDE.md:148-149`
- `src/templates/agents/codex/AGENTS.md:97-98`
- `src/templates/agents/cursor/AGENTS.md:97-98`
- `src/templates/agents/github-copilot/AGENTS.md:97-98`
- `src/templates/agents/windsurf/AGENTS.md:97-98`
- `src/templates/agents/gemini-cli/GEMINI.md:91-92`
- `src/templates/agents/qwen-code/QWEN.md:91-92`
- `src/templates/shared/steering/structure.md`: drop bilingual mention.

Project config and docs:

- `steering/project.yml:4`: remove `locale: en`.
- `steering/project.yml.README.md`, `steering/structure.md`, `steering/rules/agent-validation-checklist.md`: drop bilingual references.
- `README.md:462`, `:1225-1227`: remove the "Optional Bilingual Output" feature bullet and the enabling paragraph.
- `docs/USER-GUIDE.md`, `docs/guides/cli-reference.md`, `docs/guides/troubleshooting.md`, `docs/guides/INTERACTIVE-TUTORIALS.md`, `docs/agent-output-pattern.md`, `docs/gradual-output-implementation-guide.md`, `docs/snippets/phase4-gradual-output-template.md`, `PLATFORM-COMPARISON.md`, `docs/marketing/awesome-list-submissions.md`: remove bilingual output as a current feature.
- `CHANGELOG.md`: add entry.

Not modified (historical records, left as-is): `docs/analysis/*`, `docs/plans/*`,
`docs/requirements/srs/*`, `MULTI-AGENT-DESIGN.md`, `MULTI-AGENT-IMPLEMENTATION.md`,
`PROJECT-PLAN-MUSUBI.md`, `docs/design/adr/ADR-P1-003-vscode-extension.md`.

### REMOVED

- `BILINGUAL-IMPLEMENTATION.md`
- `src/templates/locale-manager.js`
- `src/templates/index.js` (only re-exported `LocaleManager`; no consumers in `src/`, `bin/`)
- `tests/templates/locale-manager.test.js` (34 tests)

### RENAMED

<!-- None -->

## Impact Analysis

### Affected Components

- Project configuration (JSON schema, `project-validator`, `musubi config`, `musubi onboard`)
- CLI initialisation (`musubi init`)
- Requirements and design reviewers, and their `builtin-skills` wrappers
- Platform instruction templates (Claude Code, Codex, Cursor, GitHub Copilot, Windsurf, Gemini CLI, Qwen Code)
- `src/templates` module (`LocaleManager`): deleted
- Documentation (README, user guide, CLI reference, steering docs)
- Enterprise tech-article generator: unchanged, becomes the sole language boundary

### Breaking Changes

- [ ] No breaking changes
- [x] Breaking changes (list below)

1. `LocaleManager`, `SUPPORTED_LOCALES`, `LOCALE_NAMES`, `TEMPLATE_CATEGORIES` are no longer exported from `src/templates`.
2. `musubi init` no longer prompts for a documentation language and no longer generates locale-suffixed steering files (`structure.ja.md` etc.).
3. `steering/project.yml` keys `locale`, `agents.default_language` and `agents.bilingual_output` are no longer recognised (validation error).
4. `RequirementsReviewer` / `DesignReviewer` correction methods no longer accept `updateJapanese` and no longer update `<doc>.ja.md` siblings; the corresponding `builtin-skills` input field is dropped.
5. The opt-in bilingual document/chat feature described in `BILINGUAL-IMPLEMENTATION.md` is gone; there is no supported way to re-enable it.

### Migration Steps

1. Remove `locale`, `agents.default_language` and `agents.bilingual_output` from `steering/project.yml` (validation fails until you do).
2. Delete or archive any `<name>.<lang>.md` translations; MUSUBI no longer reads or updates them, and cross-references must point at the English `.md`.
3. Re-sync platform instruction files (`musubi sync`, or edit the "Documentation Language" section of `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` / `QWEN.md` by hand).
4. Replace any `require("…/src/templates")` / `LocaleManager` usage: none known inside MUSUBI; external users must drop it.
5. Article generation needs no change: keep passing `language` per call (or `defaultLanguage` in the generator config) exactly as today.

## Testing

### Test Changes

- [x] Unit tests updated
  - Delete `tests/templates/locale-manager.test.js`.
  - `tests/project-validator.test.js:108`, `:252`: stop asserting `agents.default_language`; add a test for the removed-key validation error (REQ-LANG-007).
  - `tests/external-spec.test.js:178`: drop `locale: en` from the fixture `project.yml`.
  - Reviewer tests: add a case proving a sibling `.ja.md` is left untouched after corrections.
  - `tests/enterprise/tech-article.test.js`: unchanged; it already covers REQ-LANG-003/004/005 (language precedence, `ja` for Qiita/Zenn, unknown-code fallback).
- [ ] Integration tests updated: `musubi init` snapshot (no locale prompt, English-only steering files), if such a test exists.
- [ ] E2E tests updated: not applicable.

### Test Coverage

- Current coverage: global thresholds in `jest.config.js` are 60% lines / functions / statements, 45% branches.
- Target coverage: unchanged thresholds. Removing `locale-manager.js` and its 34 tests must not drop any global metric below threshold; verify with `npm test -- --coverage`.

## Traceability

### Requirements → Design → Code → Tests

- REQ-LANG-001 → Platform instruction "Documentation Language" section → `src/templates/agents/*/{CLAUDE,AGENTS,GEMINI,QWEN}.md`, `bin/musubi-init.js` → `musubi init` test
- REQ-LANG-002 → Platform instruction "Documentation Language" section → `src/templates/agents/*/{CLAUDE,AGENTS,GEMINI,QWEN}.md` → manual review (chat behaviour)
- REQ-LANG-003 → `TechArticleGenerator.resolveLanguage` → `src/enterprise/tech-article.js` → `tests/enterprise/tech-article.test.js`
- REQ-LANG-004 → `LANGUAGE.JA`, Qiita/Zenn platform templates → `src/enterprise/tech-article.js` → `tests/enterprise/tech-article.test.js`
- REQ-LANG-005 → `getStrings` fallback → `src/enterprise/tech-article.js` → `tests/enterprise/tech-article.test.js`
- REQ-LANG-006 → `musubi init` / `onboard` / `config` prompts and generated `project.yml` → `bin/musubi-init.js`, `bin/musubi-onboard.js`, `bin/musubi-config.js`, `src/schemas/project-schema.json` → `tests/project-validator.test.js`, `tests/external-spec.test.js`
- REQ-LANG-007 → Project validator removed-key error → `src/validators/project-validator.js` → `tests/project-validator.test.js`

## Approval

- [ ] Technical review complete
- [ ] Product review complete
- [ ] Security review complete (not needed: no security surface)
- [ ] Ready to apply
