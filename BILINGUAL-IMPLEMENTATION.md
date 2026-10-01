# Bilingual Support (Optional)

MUSUBI is **English-only by default**. Every slash command, skill and platform instruction file
produces English documents, and agents talk to the user in English. `steering/project.yml` ships with
`locale: en`.

Bilingual support is an **opt-in** feature. This document describes what it covers, and exactly which
files to edit — and what to paste where — to enable it.

## Contents

- [1. Scope](#1-scope)
- [2. Language Policy](#2-language-policy)
- [3. Enabling Bilingual Support](#3-enabling-bilingual-support)
  - [3.1 Overview of Files to Edit](#31-overview-of-files-to-edit)
  - [3.2 Placeholders Used in the Templates](#32-placeholders-used-in-the-templates)
  - [Step 1: Project Configuration](#step-1-project-configuration)
  - [Step 2: Slash Commands (Markdown)](#step-2-slash-commands-markdown)
  - [Step 3: Slash Commands (Gemini CLI TOML)](#step-3-slash-commands-gemini-cli-toml)
  - [Step 4: Skills](#step-4-skills)
  - [Step 5: Chat Interaction Language](#step-5-chat-interaction-language)
  - [Step 6: Platform Instruction Files](#step-6-platform-instruction-files)
  - [Step 7: Optional Tooling](#step-7-optional-tooling)
- [4. Verification Checklist](#4-verification-checklist)
- [5. Disabling Bilingual Support](#5-disabling-bilingual-support)
- [6. History](#6-history)

---

## 1. Scope

When enabled, bilingual support covers exactly two things:

1. **MUSUBI document output** — every document produced by the MUSUBI slash commands and skills
   (steering files, requirements, design, tasks, change proposals/reports, skill deliverables) is
   written in English first (`<name>.md`, the reference) and then translated into a second language
   (`<name>.<lang>.md`, e.g. `requirements.ja.md`).
2. **Chat interactions** — the agents talk to the user in the second language (or ask the user which
   language to use at the start of a session).

Everything else stays English: MUSUBI source code, CLI output, tests, file names, IDs, and the MUSUBI
templates themselves. No MUSUBI code generates translations — the AI agents do, following the template
blocks below.

The examples use Japanese (`ja`), the second language MUSUBI originally shipped with, but any language
works.

---

## 2. Language Policy

| Version | Role | Used by | File name |
| ------- | ---- | ------- | --------- |
| English | Reference / source document | All skills and commands (always read this one) | `<name>.md` |
| Second language | Translation for team members who prefer it | Humans only | `<name>.<lang>.md` |

**Generation order**: always generate the English version first, then the translation, for each
deliverable (not all English files first and all translations at the end).

**Terms that stay in English** in translated documents:

- Requirement IDs (`REQ-AUTH-001`), task IDs (`TASK-001`), ADR numbers (`ADR-001`)
- EARS keywords (`WHEN`, `WHILE`, `IF`, `WHERE`, `SHALL`, `THEN`)
- API endpoints (`POST /api/auth/login`), database names, code identifiers, file paths
- Technical acronyms (API, REST, GraphQL, JWT, OWASP, SQL)
- Code examples and diagrams (kept identical in both versions)

**Translated**: explanatory text, design rationale, acceptance-criteria descriptions, task
descriptions, documentation prose.

**References between documents** always point at the English `.md` file, never at a translation.

---

## 3. Enabling Bilingual Support

### 3.1 Overview of Files to Edit

MUSUBI templates live in `src/templates/`. `musubi init` copies them into a project; existing projects
keep their installed copies. Edit the **templates** so that new installations get bilingual support,
and edit the **installed copies** in projects that should switch now (in this repository, the installed
copies are `.claude/` and `.github/`).

| Step | What | Template files (`src/templates/agents/…`) | Installed copies in a project |
| ---- | ---- | ------------------------------------------ | ----------------------------- |
| 1 | Project configuration | — | `steering/project.yml` |
| 2 | Slash commands (Markdown) | `claude-code/commands/sdd-*.md`, `codex/commands/sdd-*.md`, `cursor/commands/sdd-*.md`, `windsurf/commands/sdd-*.md`, `qwen-code/commands/sdd-*.md`, `github-copilot/commands/sdd-*.prompt.md` | `.claude/commands/`, `.codex/prompts/`, `.cursor/commands/`, `.windsurf/workflows/`, `.qwen/commands/`, `.github/prompts/` |
| 3 | Slash commands (TOML) | `gemini-cli/commands/sdd-*.toml` | `.gemini/commands/` |
| 4 | Skills (document output) | `claude-code/skills/*/SKILL.md`, `claude-code/skills/steering/auto-update-rules.md` | `.claude/skills/` |
| 5 | Chat interaction language | `claude-code/skills/*/SKILL.md` (all skills), `claude-code/skills/orchestrator/SKILL.md` | `.claude/skills/` |
| 6 | Platform instruction files | `claude-code/CLAUDE.md`, `codex/AGENTS.md`, `cursor/AGENTS.md`, `github-copilot/AGENTS.md`, `windsurf/AGENTS.md`, `gemini-cli/GEMINI.md`, `qwen-code/QWEN.md` | `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `QWEN.md` (project root, depending on platform) |
| 7 | Optional tooling | `steering/templates/`, `src/templates/shared/steering/`, `bin/musubi-onboard.js`, `bin/musubi-sync.js`, `packages/vscode-extension/src/utils/constants.ts` | — |

The command templates for Claude Code, Codex, Cursor, Windsurf and Qwen Code are identical: edit
`claude-code/commands/` and copy the files to the other four directories. GitHub Copilot uses the same
content with a `.prompt.md` extension (`sdd-requirements.prompt.md` has extra sections, see Step 2).

### 3.2 Placeholders Used in the Templates

The templates below are excerpts of the blocks MUSUBI used when bilingual output was mandatory.
They contain two kinds of placeholders:

| Placeholder | Replace when | Example |
| ----------- | ------------ | ------- |
| `%LANGUAGE%` | Now, when you paste the template | `Japanese` |
| `%LANG%` | Now, when you paste the template | `ja` |
| `{{feature-name}}`, `{{change-name}}`, `<change-name>`, `[N]` | Never — these are filled in by the agent at run time | — |

Every template is **conditional** on the switch in `steering/project.yml` (Step 1), so you can leave
the blocks installed and turn the feature on or off with one setting.

---

### Step 1: Project Configuration

Edit `steering/project.yml`. Keep `locale: en` — it is the primary (reference) language that
`musubi init` and `LocaleManager` use for the main documents — and add the translation language under
`agents` (the schema in `src/schemas/project-schema.json` already supports these keys; the defaults are
`enabled: false` and `languages: ["en"]`):

```yaml
locale: en # primary/reference documentation language - keep English

agents:
  default_language: "ja" # chat language (Step 5); "en" = chat in English
  bilingual_output:
    enabled: true # false = English-only documents
    languages: ["en", "ja"] # English reference + one translation language
```

These settings record the decision; no MUSUBI code reads them to generate anything. The agents act on
them through the template blocks in Steps 2–6.

---

### Step 2: Slash Commands (Markdown)

#### 2.1 Save blocks for requirements, design, tasks and changes

In each command file, replace the "Save" section listed in the table with the template below,
filling in the values from the table. Then update the summary block of the same command (last column).

| Command file | Section to replace | English path | Translation path | Extra generation-order rules (items 3+) | Summary block to update |
| ------------ | ------------------ | ------------ | ---------------- | --------------------------------------- | ----------------------- |
| `sdd-requirements.md` | `### 9. Save Document` | `storage/specs/{{feature-name}}-requirements.md` | `storage/specs/{{feature-name}}-requirements.%LANG%.md` | Ensure requirement IDs are identical in both versions. Keep technical terms (REQ-XXX-NNN, EARS keywords) in English in the %LANGUAGE% version. | `**File**:` line in `### 10. Generate Summary` |
| `sdd-design.md` | `### 11. Save Design Document` | `storage/design/{{feature-name}}-design.md` | `storage/design/{{feature-name}}-design.%LANG%.md` | Keep technical terms in English (API endpoints, database names, requirement IDs). Translate explanations and design rationale. Keep code examples and diagrams identical in both versions. | — |
| `sdd-tasks.md` | `### 11. Save Task Breakdown` | `storage/tasks/{{feature-name}}-tasks.md` | `storage/tasks/{{feature-name}}-tasks.%LANG%.md` | Keep task IDs (TASK-XXX) identical in both versions. Keep requirement IDs (REQ-XXX-NNN) in English. Translate task descriptions and acceptance criteria. | `**File**:` line in `### 12. Generate Summary` |
| `sdd-change-init.md` | `### 9. Save Document` (keep the **Update Change Log** part) | `storage/changes/{{change-name}}-proposal.md` | `storage/changes/{{change-name}}-proposal.%LANG%.md` | Keep the change ID (CHG-NNN) and ADDED/MODIFIED/REMOVED headings in English. | `**File**:` line in `### 10. Generate Summary` |
| `sdd-change-apply.md` | `**Save To**:` line at the end of `### 12. Save Implementation Summary` | `storage/changes/{{change-name}}-implementation.md` | `storage/changes/{{change-name}}-implementation.%LANG%.md` | — | — |
| `sdd-change-archive.md` | `**Save To**:` line at the end of `### 8. Create Archive Summary` | `storage/changes/{{change-name}}-archive.md` | `storage/changes/{{change-name}}-archive.%LANG%.md` | — | see 2.2 |

**Template — Save block** (excerpt of the former `### 9. Save Document (Bilingual)` of
`sdd-requirements.md`; keep the section number of the section you replace):

````markdown
### 9. Save Document (Bilingual)

**IMPORTANT**: Read `steering/project.yml`. If `agents.bilingual_output.enabled` is `true`,
create BOTH an English and a %LANGUAGE% version. Otherwise create only the English version.

**English version (Primary/Reference)**:
Save to: `storage/specs/{{feature-name}}-requirements.md`

**%LANGUAGE% version (Translation)**:
Save to: `storage/specs/{{feature-name}}-requirements.%LANG%.md`

**File Naming**:

- Use kebab-case
- Include feature name
- Add `-requirements` suffix
- Add `.%LANG%` before `.md` for the %LANGUAGE% version

**Examples**:

- `storage/specs/authentication-requirements.md` (English)
- `storage/specs/authentication-requirements.%LANG%.md` (%LANGUAGE%)

**Generation Order**:

1. Generate English version FIRST
2. Then generate the %LANGUAGE% translation
3. Ensure requirement IDs are identical in both versions
4. Keep technical terms (REQ-XXX-NNN, EARS keywords) in English in the %LANGUAGE% version
````

For `sdd-change-apply.md` and `sdd-change-archive.md` only the save line changes:

````markdown
**Save To**:

- English: `storage/changes/{{change-name}}-implementation.md`
- %LANGUAGE% (only if `agents.bilingual_output.enabled` is `true` in `steering/project.yml`): `storage/changes/{{change-name}}-implementation.%LANG%.md`
````

**Template — Summary file list** (replaces the single `**File**:` line in the summary block):

````markdown
**Files**:

- English: storage/specs/{{feature-name}}-requirements.md
- %LANGUAGE%: storage/specs/{{feature-name}}-requirements.%LANG%.md (if bilingual output is enabled)
````

#### 2.2 `sdd-change-archive.md`: move and check the translations

In `### 9. Move Files to Archive Directory`, add to the shell block after `# Move change documents`:

````bash
# Move %LANGUAGE% versions (if bilingual output is enabled)
mv storage/changes/{{change-name}}-proposal.%LANG%.md storage/archive/{{YEAR}}/{{change-name}}/
mv storage/changes/{{change-name}}-implementation.%LANG%.md storage/archive/{{YEAR}}/{{change-name}}/
mv storage/changes/{{change-name}}-archive.%LANG%.md storage/archive/{{YEAR}}/{{change-name}}/
````

In the final checklist, change `- [ ] Archive report created` to
`- [ ] Archive report created (bilingual, if enabled)`.

#### 2.3 `sdd-steering.md`

`sdd-steering.md` creates and updates the steering files, so it needs four edits:

1. **Mode list** (`### Your Task`): append to **Bootstrap Mode**
   `- Create both English (.md) and %LANGUAGE% (.%LANG%.md) versions if bilingual output is enabled`,
   and to **Sync Mode** `- Preserve both English and %LANGUAGE% versions if bilingual output is enabled`.
2. **Mode 1, step 3 "Generate Steering Files"**: insert after the `steering/product.md` bullet list:

   ````markdown
      **Bilingual output** (only if `agents.bilingual_output.enabled` is `true` in `steering/project.yml`):

      **English version is always the reference/source.**

      Create `steering/structure.%LANG%.md` (%LANGUAGE%) with:
      - Translation of structure.md content
      - All technical terms consistent with English version

      Create `steering/tech.%LANG%.md` (%LANGUAGE%) with:
      - Translation of tech.md content
      - Technology names kept in English with %LANGUAGE% explanations

      Create `steering/product.%LANG%.md` (%LANGUAGE%) with:
      - Translation of product.md content
      - Product terminology consistent with English version

      **Bilingual File Generation**:
      - Generate English version (.md) FIRST
      - Then generate %LANGUAGE% translation (.%LANG%.md)
      - English version is the reference for all skills
      - %LANGUAGE% version for %LANGUAGE%-speaking team members
   ````

3. **Mode 2, step 4 "Update Steering Files"**: append
   `- If bilingual output is enabled: update the %LANGUAGE% version (.%LANG%.md) to match, so both versions stay synchronized`.
   In the bootstrap and sync report examples, list the files as `steering/structure.md (+ .%LANG%.md)`.
4. **`## Validation`** (at the end of the file): add `- [ ] Both English and %LANGUAGE% versions (if enabled)`
   under *Completeness Check* and `- [ ] English and %LANGUAGE% versions match` under *Consistency Check*.

#### 2.4 `sdd-implement.md` and `sdd-validate.md`

Insert under `### 1. Read All Context` (implement) / `### 1. Read All Documentation` (validate), above
the file list:

````markdown
**IMPORTANT**: Always read the ENGLISH versions (.md) as they are the reference/source.
%LANGUAGE% versions (.%LANG%.md) are translations only and must not be used for implementation or validation.
````

#### 2.5 GitHub Copilot `sdd-requirements.prompt.md`

This prompt has three extra places that list the output file:

- `### Output Directory` at the top — add `- %LANGUAGE%: \`storage/specs/{{feature-name}}-requirements.%LANG%.md\` (if bilingual output is enabled)`.
- `### 12. Save Document` — replace with the Save block template above.
- `**Output Directory Summary**` at the end — add the same `%LANGUAGE% version` line.

---

### Step 3: Slash Commands (Gemini CLI TOML)

The Gemini CLI commands (`gemini-cli/commands/sdd-*.toml`) contain the same steps in a shorter form.
Replace the save step in each file with this template (excerpt of the former
`# Step 6: Bilingual Output` of `sdd-requirements.toml`):

````markdown
# Step 6: Bilingual Output

**IMPORTANT**: Read `steering/project.yml`. If `agents.bilingual_output.enabled` is `true`,
create BOTH an English and a %LANGUAGE% version. Otherwise create only the English version.

**English version (Primary/Reference)**:
Save to: `storage/specs/{{feature-name}}-requirements.md`

**%LANGUAGE% version (Translation)**:
Save to: `storage/specs/{{feature-name}}-requirements.%LANG%.md`

Translation rules:
- Keep requirement IDs in English (REQ-AUTH-001)
- Keep EARS keywords in English (WHEN, SHALL, IF, THEN, etc.)
- Keep technical terms in English (API, REST, JWT, etc.)
- Translate explanations and descriptions to %LANGUAGE%
````

| TOML file | Step to replace | Paths | Translation rules to use |
| --------- | --------------- | ----- | ------------------------ |
| `sdd-requirements.toml` | `# Step 6: Save Document` | `storage/specs/{{feature-name}}-requirements[.%LANG%].md` | as in the template |
| `sdd-design.toml` | `# Step 4: Save Design Document` | `storage/design/{{feature-name}}-design[.%LANG%].md` | Keep technical terms (API, JWT, bcrypt, etc.), code examples, requirement IDs and ADR numbers unchanged; translate explanations and descriptions |
| `sdd-tasks.toml` | `# Step 5: Save Task Breakdown` | `storage/tasks/{{feature-name}}-tasks[.%LANG%].md` | Keep task IDs, requirement IDs, file paths and code examples unchanged; translate descriptions and criteria |
| `sdd-change-init.toml` | `# Step 7: Save Documents` | `storage/changes/<change-name>-proposal[.%LANG%].md` | — |
| `sdd-change-apply.toml` | `# Step 12: Save Implementation Report` | `storage/changes/<change-name>-implementation[.%LANG%].md` | — |
| `sdd-change-archive.toml` | `Save to:` line in `# Step 8: Create Archive Report` and the `mv` list in `# Step 9` | `storage/changes/<change-name>-archive[.%LANG%].md` | — |
| `sdd-steering.toml` | Same four edits as `sdd-steering.md` (Step 2.3) | `steering/*.%LANG%.md` | — |
| `sdd-implement.toml`, `sdd-validate.toml`, `sdd-design.toml`, `sdd-tasks.toml` | `# Step 1` read list | — | Add `**Note**: Always read English versions (.md), not %LANGUAGE% translations (.%LANG%.md)` |

In the validation checklists at the end of `sdd-requirements.toml`, `sdd-design.toml` and
`sdd-tasks.toml`, add:

````markdown
N. **Bilingual** (if enabled):
   - Both English and %LANGUAGE% versions created
   - Technical terms consistent
   - IDs identical (requirement / task IDs, diagrams)
````

---

### Step 4: Skills

All skill templates are in `src/templates/agents/claude-code/skills/<skill>/SKILL.md`.

#### 4.1 Documentation Language Policy (all document-producing skills)

Each document-producing skill has a short section near the top:

```markdown
## 3. Documentation Language Policy

- Write all documentation and deliverables in **English** (e.g. `design-document.md`).
- Communicate with the user in English.
```

Skills with this section: ai-ml-engineer, api-designer, bug-hunter, cloud-architect, code-reviewer,
database-administrator, database-schema-designer, design-reviewer, devops-engineer, orchestrator,
performance-optimizer, project-manager, quality-assurance, requirements-analyst, requirements-reviewer,
security-auditor, software-developer, steering, system-architect, technical-writer, test-engineer,
ui-ux-designer. (The section number varies per skill; keep it.)

Replace the body of the section with this template (excerpt of the former policy block shared by all
skills; the chat bullet is covered in Step 5):

````markdown
## 3. Documentation Language Policy

**Bilingual output**: read `steering/project.yml`. If `agents.bilingual_output.enabled` is `true`,
always create both English and %LANGUAGE% versions. Otherwise write English only.

### Document Creation

1. **Primary Language**: Create all documentation in **English** first
2. **Translation**: After completing the English version, create a %LANGUAGE% translation
3. **File Naming Convention**:
   - English version: `filename.md`
   - %LANGUAGE% version: `filename.%LANG%.md`
   - Example: `design-document.md` (English), `design-document.%LANG%.md` (%LANGUAGE%)

### Document Reference

**CRITICAL: Mandatory rules when referencing other agents' deliverables**

1. **Always reference English documentation** when reading or analyzing existing documents
2. If only a %LANGUAGE% version exists, use it but note that an English version should be created
3. When citing documentation in your deliverables, reference the English version
4. **When specifying file paths, always use `.md` (do not use `.%LANG%.md`)**

**Reference examples:**

```
✅ Correct: requirements/srs/srs-project-v1.0.md
❌ Incorrect: requirements/srs/srs-project-v1.0.%LANG%.md
```

**Reason:**

- The English version is the primary document and the baseline referenced from other documents
- To maintain consistency in collaboration between agents
- To unify references within code and systems

### Document Generation Order

For each deliverable:

1. Generate English version (`.md`)
2. Immediately generate %LANGUAGE% version (`.%LANG%.md`)
3. Update progress report with both files
4. Move to next deliverable

**Prohibited:**

- ❌ Creating only the English version and skipping the %LANGUAGE% version
- ❌ Creating all English versions first and then all %LANGUAGE% versions later
- ❌ Asking the user whether a %LANGUAGE% version is needed (it is required while bilingual output is enabled)
````

#### 4.2 Project Memory section (all skills that read steering)

In `## Project Memory (Steering System)`, insert after the list of steering files:

````markdown
**IMPORTANT: Always read the ENGLISH versions (.md) - they are the reference/source documents.**

**Note**: %LANGUAGE% versions (`.%LANG%.md`) are translations only. Always use English versions (.md) for all work.
````

#### 4.3 Incremental deliverable generation (skills with a "deliverables" phase)

Skills that generate several files one at a time (api-designer, cloud-architect,
database-schema-designer, project-manager, requirements-analyst, system-architect, technical-writer,
ui-ux-designer, and others with an "Incremental Deliverable Generation" phase) announce a delivery
plan and then generate *Step 1..N*. With bilingual output enabled, each English step is followed by its
translation. Add this to the delivery plan and the step list (excerpt of the former
`docs/snippets/phase4-gradual-output-template.md`):

````markdown
[Deliverables to generate] (English, plus %LANGUAGE% versions if bilingual output is enabled)
1. [Deliverable 1 name]
2. [Deliverable 2 name]

Total: N files (X files × 2 languages)

...

**Step X: [Deliverable 1 name] - %LANGUAGE% Version**

```
🤖 [X/N] Generating the %LANGUAGE% version of [Deliverable 1 name]...

📝 ./[appropriate-path]/[file-name]-[date].%LANG%.md
✅ Save complete

[X/N] Complete. Proceeding to the next file.
```
````

and to the final summary:

````markdown
## 📊 Generation Summary
- **Files created**: N
- **English versions**: X
- **%LANGUAGE% versions**: Y
````

#### 4.4 Skill-specific places

| Skill | Where | What to add |
| ----- | ----- | ----------- |
| `steering/SKILL.md` | steering file tree, completion report, "Apply changes" lists | `structure.%LANG%.md`, `tech.%LANG%.md`, `product.%LANG%.md` next to the English files ("update both the English and %LANGUAGE% versions") |
| `steering/auto-update-rules.md` | update workflow; best practices | After each `Update steering/<file>.md` step: `Generate steering/<file>.%LANG%.md (%LANGUAGE% translation)`; best practice "Bilingual updates: update English and %LANGUAGE% versions together" |
| `technical-writer/SKILL.md` | 10-step documentation flow | After step 10, steps 11–20 that generate the `.%LANG%.md` version of each of the 10 documents (README, installation, quick start, OpenAPI, user guide, developer guide, CONTRIBUTING, tutorial, authentication, CHANGELOG) |
| `requirements-reviewer/SKILL.md`, `design-reviewer/SKILL.md` | numbered list in `Document Correction Process` | `5. **Sync the %LANGUAGE% version**: after fixing the English version, apply the same fixes to the %LANGUAGE% version`. The JavaScript `applyCorrections()` already does this for `.ja.md` files (see Step 7.4) |
| Skills that update steering (api-designer, database-administrator, devops-engineer, quality-assurance, security-auditor, software-developer, test-engineer, …) | "Update steering" step | `Update both the English and %LANGUAGE% versions` |

---

### Step 5: Chat Interaction Language

Chat language is independent of document output: you can translate documents and keep chatting in
English, or the other way round.

#### 5.1 All skills

In each skill's `Documentation Language Policy` section (Step 4.1), replace the bullet
`- Communicate with the user in English.` with:

````markdown
- **Chat language**: communicate with the user in the language set by `agents.default_language` in
  `steering/project.yml` (questions, progress messages, summaries); if it is missing, use English.
  Keep file names, IDs, commands and code in English.
````

Optionally restore the role statement in `## 1. Role Definition`, e.g. for bug-hunter:
`... propose fixes through structured dialogue in %LANGUAGE%.`

#### 5.2 Orchestrator: ask for the language at session start

In `orchestrator/SKILL.md`, replace the `## Documentation Language Policy` section with this template
(excerpt of the former *Language Preference Policy*):

````markdown
## Language Preference Policy

**CRITICAL**: When starting a new session with the Orchestrator:

1. **First Interaction**: ALWAYS ask the user their language preference (English or %LANGUAGE%) for console output
2. **Remember Choice**: Store the language preference for the entire session
3. **Apply Consistently**: Use the selected language for all console output, progress messages, and user-facing text
4. **Documentation**: Documents are always created in English first, then translated to %LANGUAGE% (`.md` and `.%LANG%.md`) if bilingual output is enabled
5. **Agent Communication**: When invoking sub-agents, inform them of the user's language preference

**Language Selection Process**:

- Show bilingual greeting (English + %LANGUAGE%)
- Offer simple choice: a) English, b) %LANGUAGE%
- Wait for user response before proceeding
- Confirm selection in chosen language
- Continue entire session in selected language
````

and insert before `### Welcome Message` in `## Session Start Message`:

````markdown
### Language Selection

**IMPORTANT**: When the Orchestrator is first invoked, ALWAYS start by asking the user their preferred language for console output.

```
🎭 **Orchestrator AI**

Welcome!

Which language would you like to use for console output?
[The same question in %LANGUAGE%]

Please select:
a) English
b) %LANGUAGE%

👤 User: [Wait for response]
```

**After receiving the language preference**, proceed with the welcome message in the selected language.
````

---

### Step 6: Platform Instruction Files

Each platform instruction file has a `## Documentation Language` section stating that output is
English. Replace it with this template (excerpt of the former `## Bilingual Documentation` section of
`claude-code/CLAUDE.md`; in `AGENTS.md` files write "Prompts", in `GEMINI.md`/`QWEN.md` "Commands"
instead of "Skills"):

````markdown
## Bilingual Documentation

**When `agents.bilingual_output.enabled` is `true` in `steering/project.yml`, all agent-generated
documents are created in both English and %LANGUAGE%.**

### Language Policy

- **English**: Reference/source documents (`.md`)
- **%LANGUAGE%**: Translations (`.%LANG%.md`)
- **Skills**: Always read English versions for work
- **Code References**: Requirement IDs, technical terms stay in English

### Files Generated Bilingually

**Steering Context**:

- `steering/structure.md` + `steering/structure.%LANG%.md`
- `steering/tech.md` + `steering/tech.%LANG%.md`
- `steering/product.md` + `steering/product.%LANG%.md`

**Specifications**:

- `storage/specs/[feature]-requirements.md` + `.%LANG%.md`
- `storage/design/[feature]-design.md` + `.%LANG%.md`
- `storage/tasks/[feature]-tasks.md` + `.%LANG%.md`
````

Optionally add `- 🌐 **Bilingual Documentation** - Documents created in English and %LANGUAGE%` to the
feature list at the top of the file.

---

### Step 7: Optional Tooling

These are not required: once Steps 1–6 are done, the agents produce and maintain the translations.

#### 7.1 Steering and document templates

- `LocaleManager` (`src/templates/locale-manager.js`) looks for localized document templates in
  `steering/templates/<category>.<lang>.md` (categories: `requirements`, `design`, `tasks`,
  `adr-template`, `research`, `workflow-guide`) and falls back to the English `<category>.md`. To give
  translators a starting structure, add e.g. `steering/templates/requirements.%LANG%.md` as a translation
  of `steering/templates/requirements.md`.
- `musubi init` asks for a *documentation language* and copies `src/templates/shared/steering/<name>.<locale>.md`
  when it exists. A non-English answer makes that language the **primary** language (it writes
  `steering/<name>.<locale>.md` instead of `<name>.md`). For bilingual output with English as the
  reference, answer **English** and enable bilingual output in Step 1.

#### 7.2 Onboarding and sync CLI (`bin/musubi-onboard.js`, `bin/musubi-sync.js`)

Both commands write the English steering files only:

- `musubi-onboard`: `generateStructureMd()`, `generateTechMd()` and `generateProductMd()` write
  `steering/<name>.md`. They used to also write a `steering/<name>.ja.md` copy with hard-coded Japanese
  headings.
- `musubi-sync`: `updateTechMd()` (new frameworks) and `updateStructureMd()` (new directories) update the
  English files. They used to also patch `steering/tech.ja.md` / `steering/structure.ja.md`.

With bilingual output enabled, run `/sdd-steering` after `musubi-onboard` or `musubi-sync`: its sync mode
(Step 2.3) creates or updates the translations. If you prefer to generate them in code, add a second
`fs.writeFile('steering/<name>.%LANG%.md', ...)` in each of the functions above, and keep the translated
headings in a separate locale resource file rather than inline in the source.

#### 7.3 VS Code extension

`packages/vscode-extension/src/utils/constants.ts` lists the steering files shown in the *Steering*
tree view. Add the translations so they show up:

```typescript
export const STEERING_FILES = [
  'product.md',
  'structure.md',
  'tech.md',
  'product.%LANG%.md',
  'structure.%LANG%.md',
  'tech.%LANG%.md',
  'project.yml',
];
```

#### 7.4 Already language-neutral (no change needed)

- `src/validators/requirements-reviewer.js` and `src/validators/design-reviewer.js`:
  `applyCorrections(documentPath, ..., { updateJapanese })` applies the same text replacements to a
  sibling `<doc>.ja.md` when one exists (on by default, `updateJapanese: false` turns it off). For a
  language other than Japanese, change the `.ja.md` suffix in both files.
- `LocaleManager.detectProjectLocale()` reads `locale` from `steering/project.yml`.
- The browser automation context (`src/agents/browser/context-manager.js`) defaults to `locale: 'en-US'`
  and `timezoneId: 'UTC'`; pass `locale` / `timezoneId` options to change them.

---

## 4. Verification Checklist

After enabling, run `/sdd-steering` and `/sdd-requirements <feature>` in a test project and check:

- [ ] `steering/project.yml` has `agents.bilingual_output.enabled: true` and the language in `languages`
- [ ] `steering/structure.md`, `tech.md`, `product.md` and their `.%LANG%.md` translations exist
- [ ] `storage/specs/<feature>-requirements.md` and `<feature>-requirements.%LANG%.md` exist, with identical requirement IDs
- [ ] IDs, EARS keywords, code and file paths are unchanged in the translation
- [ ] Other documents and skills reference the English `.md` files only
- [ ] If `agents.default_language` is not `en` (or another language is chosen in the orchestrator), the agents chat in that language
- [ ] `/sdd-design` and `/sdd-tasks` produce translations too (all platforms you use)

---

## 5. Disabling Bilingual Support

Set `agents.bilingual_output.enabled: false` and `agents.default_language: "en"` in
`steering/project.yml`. Because every template block is conditional, the agents return to English-only
output and chat. Existing `.%LANG%.md` files are left in place; delete them if they are no longer needed.

---

## 6. History

- **2025-11-17** — Bilingual documentation was introduced as a **mandatory** feature: all slash commands
  and 19 skills generated an English `.md` and a Japanese `.ja.md` version of every document, and the
  orchestrator asked users to choose English or Japanese at session start.
- **2026-10-01** — The repository was translated to English, the mandatory bilingual blocks were removed
  from all commands, skills and platform instruction files, `steering/project.yml` was switched to
  `locale: en`, and Japanese translations (`*.ja.md`) of repository documents were deleted. Bilingual
  output became the opt-in feature described in this document.
