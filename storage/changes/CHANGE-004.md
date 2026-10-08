# Library imports name the upstream package and modules that do not exist

**Change ID**: CHANGE-004  
**Date**: 2026-10-08  
**Status**: ~~Proposed~~ → ~~Approved~~ → **Implemented**  
**Approved**: 2026-10-08 (maintainer, `musubi-change approve CHANGE-004`)  
**Implemented**: 2026-10-08 (two commits on `chore/scip-typescript-replace-codegraph`; see
[CHANGE-004-implementation.md](CHANGE-004-implementation.md))  
**Type**: Bug Fix (documentation and agent templates)  
**Priority**: P2  
**Baseline**: commit `451914e` on `chore/scip-typescript-replace-codegraph` (not yet merged into
`ITG-adjustments`)  
**Origin**: follow-up recorded in CHANGE-003 ("Documentation and templates use
`require('musubi-sdd')`, but this fork installs as `@improve-to-grow/musubi-sdd` from GitHub.
Fork-only; separate change.")  
**Decisions** (maintainer, 2026-10-08): fix broken paths and names in this change, not only the
package name; document a project-local install for library use; delete
`docs/guides/PLUGIN-DEVELOPMENT.md`; leave `website/` out of this change and delete it in a
follow-up change.

## Description

Make every library example in the live documentation and agent templates load the fork's
package, from a module that exists, with names that module exports, and tell readers how to
install the package so that `require()` finds it.

Three defects, found together:

1. **Upstream package name.** 84 `require()` / `import` lines in 28 live files load
   `musubi-sdd`. The fork's package is `@improve-to-grow/musubi-sdd` (`package.json` `name`, since
   `46f06ff`). `require('musubi-sdd')` never resolves against the fork, whichever way it is
   installed. Commit `46f06ff` replaced `npx musubi-sdd` and `npm install -g musubi-sdd`
   everywhere but left the library imports. The `musubi-sdd` **command** (`bin`) is unaffected and
   stays.
2. **No library install path.** The documentation prescribes only the global install
   (`npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'`). A global package is not
   resolvable from a project, so neither name works after following the docs. Checked in a scratch
   project on 2026-10-08: with the global install only, both names give `MODULE_NOT_FOUND`; after
   `npm link @improve-to-grow/musubi-sdd`, the scoped name loads (64 exports) and `musubi-sdd`
   still does not.
3. **Broken module paths and names** (also present upstream). 15 references point at 5 subpaths
   that do not exist, and 8 imported names are not exported by the module they are imported
   from. One guide, `docs/guides/PLUGIN-DEVELOPMENT.md`, describes a whole API that does not
   exist. CHANGE-003's guard (REQ-PKG-004) did not catch them: it scans only
   `docs/API-REFERENCE.md` and `src/templates/`, only `const { … } = require('musubi-sdd')`, and
   only the package root.

`docs/guides/PLUGIN-DEVELOPMENT.md` is deleted. The 1,084-line guide documents a plugin system
that does not exist: no plugin loader in `bin/` or `src/`, no `PluginDefinition` type, no
`musubi-sdd/testing` module, no `createPluginTestContext` or `mockLogger` (all confirmed absent
with `musubi-code refs`). Its two links go too (`ARCHITECTURE-DEEP-DIVE.md:915`,
`INTERACTIVE-TUTORIALS.md:676`); git history keeps the guide. Keeping it with a "Not implemented"
notice was rejected: the instructions cannot be followed, and its `peerDependencies` example
could not be made correct with an ordinary range. Every fork version is a prerelease (`-itg.N`),
so a range such as `>=5.0.0` never matches it (`semver.satisfies('6.3.1-itg.2', '>=5.0.0')` is
`false`); npm accepts only `*` for prereleases of other version tuples.

Not in scope (follow-ups):

- **Delete the documentation website** (decided 2026-10-08, separate change). `website/` is a
  VitePress site (17 tracked files, own package `musubi-docs`) that has never been published:
  `.github/workflows/docs.yml` deploys it to GitHub Pages only on pushes to `main`, which the fork
  does not use (no runs); Pages is not enabled on the fork or upstream; upstream's two runs
  (2025-12-08, 2026-01-01) failed in the build job. Nothing links to it, its edit and changelog
  links point at `nahisaho/MUSUBI`, and `website/api/index.md` documents a facade API
  (`musubi.init()`, `.validate()`, `.on()`, …, `CLI`, `MUSUBIError`, `ValidationError`,
  `ConfigurationError`) that does not exist, with sidebar links to three pages that do not exist.
  The follow-up deletes `website/` and `.github/workflows/docs.yml` and removes the `website/`
  entry from `steering/structure.md:544`. Until then its 6 imports of `musubi-sdd` stay, and
  this change's tests do not scan it.
- **Example methods.** This change makes module paths and imported names resolve; it does not
  check the methods the examples call. Found during analysis: `SkillRegistry.register(...)`
  (`docs/guides/ARCHITECTURE-DEEP-DIVE.md:784`, no such method; the engine has
  `OrchestrationEngine#registerSkill`) and `PatternRegistry.register(...)` called statically
  (`:753`, `register` is an instance method). A method-level audit of the examples is a separate
  change.
- **CI/CD guide CLI flags.** `docs/guides/ci-cd-integration.md` documents
  `musubi-sdd init --platform github-actions|gitlab`. No such option exists, and no CLI command
  calls the CI generator (`musubi-code callers CICDManager`: no callers outside `src/index.js`);
  it is available only as the library class `CICDManager`.
- Historical and record documents keep the upstream name, as in CHANGE-002 and CHANGE-003:
  released `CHANGELOG.md` entries, `docs/analysis/` (including the 9 imports in
  `GCC-ANALYSIS-IMPROVEMENTS.md`), `docs/design/`, `docs/research/`, `docs/marketing/`,
  `docs/internal-specs/`, `docs/plans/`, `docs/requirements/`, `docs/tasks/`, `storage/`,
  `orchestrator/reports/`, `PROJECT-PLAN-MUSUBI.md`, `MULTI-AGENT-*.md`.
- Names that are not the npm package: the VS Code extension (`packages/vscode-extension`, its
  own package `musubi-sdd` and ID `nahisaho.musubi-sdd`), the MCP server name in
  `src/integrations/mcp-connector.js:280`, and project-name labels in `steering/`.

## Current State

### Package name (defect 1)

| Location                                                                                                             | Imports | Notes                                          |
| -------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------- |
| `docs/API-REFERENCE.md`                                                                                              | 18      | 17 `require`, 1 TypeScript `import` (`:400`)   |
| `docs/USER-GUIDE.md`                                                                                                 | 7       |                                                |
| `docs/QUICKSTART.md`                                                                                                 | 1       |                                                |
| `docs/guides/` (8 guides)                                                                                            | 27      | 3 of them in `PLUGIN-DEVELOPMENT.md` (deleted) |
| `src/templates/agents/{codex,cursor,github-copilot,windsurf}/AGENTS.md`, `gemini-cli/GEMINI.md`, `qwen-code/QWEN.md` | 18      | 3 each; installed into user projects           |
| `src/templates/agents/claude-code/skills/` (6 skills)                                                                | 8       | 4 of them also installed in `.claude/skills/`  |
| `src/templates/skills/browser-agent.md`                                                                              | 1       |                                                |
| `.claude/skills/{code-reviewer,orchestrator,performance-optimizer,security-auditor}/SKILL.md`                        | 4       | identical to their templates today             |
| **Total**                                                                                                            | **84**  | **28 files**                                   |

The package name also appears outside an import:

- `docs/guides/ci-cd-integration.md:24`, `:36`, `:46`: `cp node_modules/musubi-sdd/...`. Besides
  the name, the copied files are not in the package: `package.json` `files` is
  `["bin/", "src/", "README.md", "LICENSE"]`, so neither `templates/ci-cd/` nor
  `.github/workflows/` is installed. Copying `.github/workflows/` would also copy this
  repository's own CI.
- `docs/guides/troubleshooting.md:72`: "Cannot find module 'musubi-sdd'", answered with the
  global install, which does not fix a `require()` (defect 2).
- `docs/guides/PLUGIN-DEVELOPMENT.md:84` (JSDoc `import('musubi-sdd')`) and `:861`
  (`peerDependencies`): deleted with the guide.
- `tests/index.test.js:49`: the REQ-PKG-004 scan matches only `require('musubi-sdd')`.

### Install instructions (defect 2)

`docs/API-REFERENCE.md:7-11` gives only the global install, then `require()`s the package.
`README.md:17-25` and `CONTRIBUTING.md:250` describe the fork's distribution for CLI use only.

### Broken module paths and names (defect 3)

Checked by loading each import against the repository (package root = repository root), and
with `musubi-code refs` / `symbols` for the definitions.

| Reference                                                                                                                           | Problem                                                                                                             | Fix                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `guardrails-guide.md:35`, `:160`, `:183`, `:225`, `:336`, `:430`; `orchestration-patterns.md:445`                                   | `musubi-sdd/orchestration/guardrails`: no such path                                                                 | `…/src/orchestration/guardrails`                                                                         |
| `guardrails-guide.md:335`                                                                                                           | `musubi-sdd/orchestration/skill-executor`: no such path                                                             | `…/src/orchestration/skill-executor`                                                                     |
| `orchestration-patterns.md:36`, `:275`, `:324`; `p-label-parallelization.md:45`                                                     | `musubi-sdd/orchestration`: no such path                                                                            | `…/src/orchestration`                                                                                    |
| `p-label-parallelization.md:341`                                                                                                    | `musubi-sdd/orchestration/replanning`: no such path                                                                 | `…/src/orchestration/replanning`                                                                         |
| `builtin-skills-usage.md:43`, `:198`, `:293`; `requirements-reviewer/SKILL.md:657`, `:920`; `design-reviewer/SKILL.md:806`, `:1029` | `requirementsReviewerSkill`, `designReviewerSkill` imported from `src/orchestration`, which does not re-export them | import from `…/src/orchestration/builtin-skills`, which does                                             |
| `incremental-adoption.md:448`                                                                                                       | `ErrorHandler` from the package root                                                                                | from `…/src/orchestration`                                                                               |
| `ARCHITECTURE-DEEP-DIVE.md:753`                                                                                                     | `PatternRegistry` from the package root                                                                             | from `…/src/orchestration`                                                                               |
| `ARCHITECTURE-DEEP-DIVE.md:722-748`                                                                                                 | "2. Validator Extension": `ValidatorRegistry` does not exist                                                        | remove the subsection, renumber 3 and 4                                                                  |
| `USER-GUIDE.md:467-479`                                                                                                             | `EARSValidator` does not exist; `ConstitutionalValidator#check` does not exist                                      | rewrite with `checkEarsFormat` (`…/src/constitutional/ears`) and `ConstitutionalValidator#validateAll()` |
| `API-REFERENCE.md:397-414`                                                                                                          | "TypeScript Support" imports `type OrchestrationResult`, `type Requirement`; the package ships no `.d.ts`           | remove the section (closes the CHANGE-003 follow-up)                                                     |
| `PLUGIN-DEVELOPMENT.md:84`, `:190`, `:810`                                                                                          | `PluginDefinition`, `musubi-sdd/testing` do not exist                                                               | delete the guide                                                                                         |

With `src/` added, all names imported from the guardrails, orchestration, replanning and
skill-executor paths resolve.

## Requirements Changes

### ADDED

- REQ-DIST-001: Live documentation SHALL refer to the package as `@improve-to-grow/musubi-sdd` in
  every `require()`, `import`, `import()` type reference, `peerDependencies` entry and
  `node_modules` path. Live documentation is `README.md`, `CONTRIBUTING.md`, the Markdown files
  under `docs/` other than
  `docs/{analysis,design,internal-specs,marketing,plans,requirements,research,tasks}/`, and the
  Markdown files under `src/templates/` and `.claude/skills/`.
- REQ-DIST-002: `docs/API-REFERENCE.md` and the "Cannot find module" entry of
  `docs/guides/troubleshooting.md` SHALL give the project-local install command
  `npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'` for library use,
  separately from the global install for CLI use.

### MODIFIED

- REQ-PKG-004 (CHANGE-003): documented imports resolve.

  **Previous**: Every name that `docs/API-REFERENCE.md` or an agent template under
  `src/templates/` destructures from `require('musubi-sdd')`, or from its `performance`,
  `enterprise` or `ai` namespace, SHALL resolve to a defined export of the package entry point.

  **New**: Every `require()` or named `import` of `@improve-to-grow/musubi-sdd` or of one of its
  subpaths in live documentation (REQ-DIST-001) SHALL load an existing module of the package, and
  every name it destructures or imports SHALL be a defined export of that module, or of the
  module's `performance`, `enterprise` or `ai` namespace where the import selects one.

  **Reason**: the old scope missed 15 references to missing subpaths and 8 missing names
  (Current State). **Breaking**: no. **Migration**: none.

### REMOVED

<!-- None -->

### RENAMED

<!-- None -->

## Design Changes

### ADDED

- "Use as a library" install instructions:
  `npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'`, then
  `require('@improve-to-grow/musubi-sdd')`. A project-local install is recorded in
  `package.json`, is reproducible and works in CI; `npm link` to the global install is not
  documented.
- Subpath convention for examples: the package has no `exports` map, so subpaths are file paths
  from the package root and always start with `src/`
  (`@improve-to-grow/musubi-sdd/src/orchestration/guardrails`).

### MODIFIED

- CI/CD templates (`docs/guides/ci-cd-integration.md`): GitLab and Jenkins templates are
  downloaded from the fork instead of copied from `node_modules`
  (`curl -fsSL -o .gitlab-ci.yml https://raw.githubusercontent.com/Improve-To-Grow/MUSUBI/ITG-adjustments/templates/ci-cd/gitlab-ci.yml`,
  likewise `Jenkinsfile`). The GitHub Actions copy line becomes a call of the fork's reusable
  workflow (`uses: Improve-To-Grow/MUSUBI/.github/workflows/musubi-reusable.yml@ITG-adjustments`,
  input `command`).

### REMOVED

- Documentation of APIs that do not exist: "TypeScript Support" (`docs/API-REFERENCE.md`),
  "Validator Extension" (`docs/guides/ARCHITECTURE-DEEP-DIVE.md`) and the plugin development
  guide (`docs/guides/PLUGIN-DEVELOPMENT.md`).

## Code Changes

### ADDED

- `tests/package-name.test.js`, written first (REQ-DIST-001, REQ-DIST-002):
  - no live documentation file contains `require('musubi-sdd`, `import('musubi-sdd`,
    `from 'musubi-sdd`, `node_modules/musubi-sdd` or a `"musubi-sdd":` dependency entry; a
    failure names file and line;
  - the two REQ-DIST-002 locations contain the project-local install command.
- `CHANGELOG.md`: `### Fixed` and `### Removed` entries under `[Unreleased]`.

### MODIFIED

Tests:

- `tests/index.test.js` (REQ-PKG-004): the scan covers the live documentation set, matches the
  scoped name with an optional subpath, and both `const { … } = require(…)[.ns]` and
  `import { … } from …`. Subpaths are loaded from the repository root.

Documentation and templates (81 import lines in 27 files after the guide deletion, plus):

- `docs/API-REFERENCE.md`: scoped name; library install command; "TypeScript Support" removed.
- `docs/USER-GUIDE.md`, `docs/QUICKSTART.md`: scoped name; Validation API example rewritten.
- `docs/guides/`: `guardrails-guide.md`, `orchestration-patterns.md`,
  `p-label-parallelization.md`, `builtin-skills-usage.md`, `incremental-adoption.md`,
  `ARCHITECTURE-DEEP-DIVE.md`, `faq-troubleshooting.md`: scoped name and the defect 3 fixes;
  `ARCHITECTURE-DEEP-DIVE.md` and `INTERACTIVE-TUTORIALS.md`: link to the deleted guide removed;
  `ci-cd-integration.md`: CI template sources; `troubleshooting.md`: "Cannot find module" entry
  for `@improve-to-grow/musubi-sdd` with the local install.
- Agent templates under `src/templates/` (6 platform files, 6 Claude Code skills,
  `skills/browser-agent.md`) and the 4 installed copies under `.claude/skills/`: scoped name and
  subpath fixes. Installed copies stay identical to their templates.
- `storage/changes/change-log.md`: CHANGE-004 row.

Not modified: `src/`, `bin/` and `package.json` code; `README.md` and `CONTRIBUTING.md` (no
imports; already describe the fork); `website/` and `.github/workflows/docs.yml` (deletion
follow-up); historical documents (Description).

### REMOVED

- `docs/guides/PLUGIN-DEVELOPMENT.md`.

### RENAMED

<!-- None -->

## Impact Analysis

### Affected Components

- Documentation (`docs/`): library examples, install instructions, CI/CD setup; one guide
  removed.
- Agent templates (`src/templates/`): what `musubi-sdd init` installs into user projects; existing
  projects keep their copies (Migration Steps, step 3).
- This repository's installed skills (`.claude/skills/`).
- Test suite: one new suite, one widened scan.
- CLI, library code, the package entry point and the website: none.

### Breaking Changes

- [x] No breaking changes
- [ ] Breaking changes (list below)

No code changes. Every corrected example failed before. Removing the documentation of
nonexistent APIs removes nothing that worked.

### Migration Steps

1. Projects that use MUSUBI as a library install it locally:
   `npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'`.
2. Replace `require('musubi-sdd…')` with `require('@improve-to-grow/musubi-sdd…')`, and
   `musubi-sdd/orchestration…` with `@improve-to-grow/musubi-sdd/src/orchestration…`.
3. Projects initialised before this change keep their copies of the agent templates: replace the
   package name by hand, or re-run `musubi-sdd init` for the agent and confirm the overwrite
   prompt. (Corrected during implementation: `musubi-sdd upgrade` runs version migrations only and
   does not refresh templates.)

### Risks

| Risk                                                                                            | Probability | Impact | Mitigation                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| The deleted plugin guide was wanted as design notes for a future plugin system                  | Low         | Low    | Git history keeps the guide                                                                                                         |
| A local install from GitHub is slower than from the registry and needs network access to GitHub | Medium      | Low    | Same source as the prescribed global install; CI already installs from GitHub (`MUSUBI_INSTALL_COMMAND`)                            |
| The widened scan flags code that is meant to fail or is pseudo-code                             | Low         | Low    | Scan only the live documentation set; a failure names file and line                                                                 |
| Template and installed skill copies drift                                                       | Low         | Low    | Edit both in the same commit; the scan covers both                                                                                  |
| Upstream contribution of the path and name fixes is harder when mixed with the fork rename      | Medium      | Low    | Two commits: path/name fixes and removals first (upstreamable with the unscoped name), then the rename and install text (fork-only) |

## Testing

### Test Changes

- [x] Unit tests updated: add `tests/package-name.test.js` (REQ-DIST-001, REQ-DIST-002); widen
      the REQ-PKG-004 scan in `tests/index.test.js`.
- [ ] Integration tests updated: not applicable. Both suites read the real documents and load the
      real modules, without mocks.
- [ ] E2E tests updated: not applicable (no CLI change).

Expected counts: 169 suites / 4,878 tests (CHANGE-003 implementation, 2026-10-08) become 170
suites / about 4,883 tests.

### Test Coverage

- Current: 78.31% statements, 66.62% branches, 82.89% functions, 79.14% lines (CHANGE-003
  implementation record); thresholds in `jest.config.js` are 60 / 45 / 60 / 60.
- Target: thresholds unchanged. No source code changes, so coverage stays the same.

### Verification Commands

```bash
# No upstream package name in live documentation (prints nothing when fixed)
grep -rnE "(require\(|import\(|from )['\"]musubi-sdd|node_modules/musubi-sdd" \
  README.md CONTRIBUTING.md docs/*.md docs/guides docs/examples docs/snippets src/templates .claude/skills

# The fork's package loads from a project-local install
mkdir -p /tmp/lib-check && cd /tmp/lib-check && npm init -y >/dev/null \
  && npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments' \
  && node -e "console.log(Object.keys(require('@improve-to-grow/musubi-sdd')).length)"

# Suites, then the full suite, lint and format
npx jest tests/package-name.test.js tests/index.test.js
npm test -- --coverage && npm run lint && npm run format:check
```

Before the fix the first command prints 87 lines (84 imports and the 3 `node_modules` paths),
and the widened REQ-PKG-004 scan fails on the 15 references to missing subpaths and on every
reference to the 8 missing names.

## Traceability

### Requirements → Design → Code → Tests

- REQ-DIST-001 → package name in documentation → 27 files plus the CI/CD and troubleshooting
  guides → `tests/package-name.test.js` "no upstream package name"
- REQ-DIST-002 → "Use as a library" install instructions → `docs/API-REFERENCE.md`,
  `docs/guides/troubleshooting.md` → `tests/package-name.test.js` "library install command"
- REQ-PKG-004 (modified) → subpath convention; removed nonexistent APIs → defect 3 fixes →
  `tests/index.test.js` documentation scan

## Rollback Plan

- Pre-change state: commit `451914e`.
- Whole change: `git revert` of the implementing commits.
- No feature flag, data migration or staged rollout: documentation and templates only.

## Constitutional Compliance

Profile: `cli` (`steering/project.yml`, `core_paths: [src]`, `delivery_paths: [bin]`).

- Article I (Testable Core): no core change. The documented library interface (I-L3) becomes
  usable from the fork.
- Article II (Automation Interface): no CLI change. Documentation matches the interface (II-2).
- Article III (Test-First): both scans are written first and observed failing (87 name hits,
  15 paths, 8 names, 2 missing install commands) before any document changes.
- Article IV (EARS): REQ-DIST-001, REQ-DIST-002 and the modified REQ-PKG-004 use the ubiquitous
  `SHALL` pattern; no SHOULD, MUST or MAY.
- Article V (Traceability): matrix above; each requirement has one test group.
- Article VI (Project Memory): steering unchanged; it names the project, not the package import.
  (`steering/structure.md:544` lists `website/`; the website deletion follow-up updates it.)
- Article VII (Simplicity): no new module; one test file; net reduction of documentation.
- Article VIII (Anti-Abstraction): not applicable (no code).
- Article IX (Integration-First): the scans load the real modules and read the real documents.

## Appendix

### Analysis method

- Package-name occurrences: `grep` (they are strings in Markdown, which the scip-typescript
  index does not cover). 85 files mention `musubi-sdd`; most are the `musubi-sdd` command,
  historical documents or other packages (Description).
- Import resolution: a scratch script that loads every documented import against the
  repository and checks each binding; a scratch project with the global install for the
  name-resolution check.
- Definitions and callers: `musubi-code refs` / `symbols` / `callers` / `dependents`
  (scip-typescript index, 387 files, 2026-10-08). Confirmed absent: `EARSValidator`,
  `ValidatorRegistry`, `PluginDefinition`, `createPluginTestContext`, `mockLogger`,
  `OrchestrationResult`, `SkillRegistry.register`, `ConstitutionalValidator.check`. Confirmed
  present: `checkEarsFormat` (`src/constitutional/ears.js:75`), `ErrorHandler` and
  `PatternRegistry` (exported by `src/orchestration/index.js`), `requirementsReviewerSkill`
  (exported by `src/orchestration/builtin-skills.js`). `src/index.js` has one dependent,
  `tests/index.test.js`.
- `MUSUBI_INSTALL_COMMAND` (`src/integrations/cicd.js:9`), used by every generated CI config,
  already installs the fork from GitHub.
- Website status: `gh api repos/<repo>/pages` (404 for both repositories) and
  `gh run list --workflow docs.yml` (fork: none; upstream: 2 failed runs), 2026-10-08.

### Upstream

Defects 1 and 2 are fork-only. Defect 3 (subpaths, names, nonexistent APIs) exists on upstream
`nahisaho/MUSUBI` `main` as well. Implemented as two commits (Risks), the first can go upstream
with the unscoped name.

### References

- Origin: CHANGE-003 follow-up (`storage/archive/2026/CHANGE-003/CHANGE-003.md`)
- Fork distribution: commit `46f06ff`, `README.md:17-25`, `CONTRIBUTING.md:250`
- Constitution: `steering/rules/constitution.md` I-L3, II-2
- Predecessor format: `storage/archive/2026/CHANGE-003/CHANGE-003.md`

### Change History

| Version | Date       | Author   | Changes                                                                                       |
| ------- | ---------- | -------- | --------------------------------------------------------------------------------------------- |
| 1.0     | 2026-10-08 | Yaroslav | Initial proposal                                                                              |
| 1.1     | 2026-10-08 | Yaroslav | Decisions recorded: delete the plugin guide; `website/` out of scope, deletion as a follow-up |

## Approval

- [ ] Technical review complete
- [ ] Product review complete
- [ ] Security review complete (not needed: no security surface)
- [ ] Ready to apply
