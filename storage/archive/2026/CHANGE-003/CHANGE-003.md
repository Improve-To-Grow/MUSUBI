# Package entry point: `Constitution`, `CICDIntegration` and nine other exports undefined

**Change ID**: CHANGE-003  
**Date**: 2026-10-08  
**Status**: ~~Proposed~~ → ~~Approved~~ → ~~Implemented~~ → **Archived**  
**Approved**: 2026-10-08 (maintainer, `musubi-change approve CHANGE-003`; aliases as recommended)  
**Implemented**: 2026-10-08 (commit `a790247` on `chore/scip-typescript-replace-codegraph`; see
[CHANGE-003-implementation.md](CHANGE-003-implementation.md))  
**Archived**: 2026-10-08 (`storage/archive/2026/CHANGE-003/`)  
**Type**: Bug Fix  
**Priority**: P2  
**Baseline**: commit `3da9d34` on `chore/scip-typescript-replace-codegraph` (not yet merged into
`ITG-adjustments`, which is at `bcc435d`)

## Description

Make every export of the package entry point `src/index.js` (`package.json` `main`) a defined
value, export the affected classes under their real names, and correct the documentation that
advertises names the package does not have.

`require('@improve-to-grow/musubi-sdd')` returns 58 top-level keys; 11 of them are `undefined`.
The report that opened this change named `Constitution` and `CICDIntegration`; a runtime check
over all exports finds nine more with the same defect class. All 11 have been broken since
`src/index.js` was created in commit `9c8d401` (v5.5.0, 2025-12-10). Nothing noticed because no
file in `bin/`, `src/` or `tests/` loads the entry point (see Appendix). The CLI is unaffected:
it requires modules by path.

Fixed:

- The 11 broken bindings (table under Current State). Four need only the correct `require()`
  form; seven point at a class that exists under another name.
- `docs/API-REFERENCE.md`: `TaskGenerator` example uses the real class name; the "Error Handling"
  section, which documents `MUSUBIError` and `ValidationError` classes that do not exist anywhere
  in `src/`, is removed.
- `code-reviewer` skill (template and installed copy): imports `THRESHOLDS`, which the package
  exports as `COMPLEXITY_THRESHOLDS`.

Not in scope (follow-ups):

- Documentation and templates use `require('musubi-sdd')`, but this fork installs as
  `@improve-to-grow/musubi-sdd` from GitHub. Fork-only; separate change.
- `docs/API-REFERENCE.md` "TypeScript Support" imports types from the package, which ships no
  `.d.ts` files.
- `docs/analysis/GCC-ANALYSIS-IMPROVEMENTS.md` still shows `CodeGraphMCP` (removed in `3da9d34`).
  Historical analysis document, left as-is as in CHANGE-002.

**Decision for review**: the advertised names `Constitution`, `CICDIntegration`, `AstExtractor`,
`TaskGenerator`, `TraceabilityMatrixReporter` and `AgentMemory` stay as deprecated aliases of the
real classes (REQ-PKG-003). The alternative is to export the real names only: one name per
class and six fewer keys, but `const { Constitution } = require(...)` stays `undefined` and the
documented `TaskGenerator` example needs the rename to work. This proposal recommends the
aliases because they make the reported names work and cost six lines.

## Current State

All 47 working function-valued exports use the class's own name as the key. The 11 broken ones:

| Export (line in `src/index.js`)    | Import as written                                                              | What the module exports                                                                                         | Cause                       |
| ---------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `AstExtractor` (:17)               | `{ AstExtractor }` from `./analyzers/ast-extractor`                            | `{ ASTExtractor, createASTExtractor, extractAST, PATTERNS }`                                                    | Wrong case                  |
| `GapDetector` (:18)                | `{ GapDetector }` from `./analyzers/gap-detector`                              | `GapDetector` (default)                                                                                         | Default export destructured |
| `createTraceabilityMatrix` (:23)   | `{ createTraceabilityMatrix }` from `./analyzers/traceability`                 | `TraceabilityAnalyzer` (default)                                                                                | No such function            |
| `DesignGenerator` (:31)            | `{ DesignGenerator }` from `./generators/design`                               | `DesignGenerator` (default)                                                                                     | Default export destructured |
| `RequirementsGenerator` (:32)      | `{ RequirementsGenerator }` from `./generators/requirements`                   | `RequirementsGenerator` (default)                                                                               | Default export destructured |
| `TaskGenerator` (:33)              | `{ TaskGenerator }` from `./generators/tasks`                                  | `TasksGenerator` (default)                                                                                      | Default export, other name  |
| `CICDIntegration` (:37)            | `{ CICDIntegration }` from `./integrations/cicd`                               | `{ CICDManager, createCICDManager, WorkflowGenerator, PreCommitGenerator, PipelineValidator, CIProvider, ... }` | No such class               |
| `TraceabilityMatrixReporter` (:44) | `{ TraceabilityMatrixReporter }` from `./reporters/traceability-matrix-report` | `{ TraceabilityMatrixReport, ReportFormat }`                                                                    | Other name                  |
| `Constitution` (:48)               | `{ Constitution }` from `./validators/constitution`                            | `ConstitutionValidator` (default)                                                                               | Default export, other name  |
| `AgentMemory` (:65)                | `{ AgentMemory }` from `./managers/agent-memory`                               | `{ AgentMemoryManager, LearningItem, MemoryStore, LearningCategory, EXTRACTION_PATTERNS }`                      | Other name                  |
| `ChangeManager` (:66)              | `{ ChangeManager }` from `./managers/change`                                   | `ChangeManager` (default)                                                                                       | Default export destructured |

- The module shapes were the same in `9c8d401`, so the bindings never worked.
- The `performance` (32 keys), `enterprise` (23) and `ai` (16) namespaces have no undefined
  members.
- `docs/API-REFERENCE.md` documents four of the broken names as working examples: `GapDetector`
  (:72), `RequirementsGenerator` (:94), `DesignGenerator` (:111) and `TaskGenerator` (:125). It
  also documents `MUSUBIError` and `ValidationError` (:417-433); neither class exists. The only
  `Error` subclasses in `src/` are `WorkflowError` and `GuardrailTripwireException`, and neither
  is exported from the entry point.
- `src/templates/agents/claude-code/skills/code-reviewer/SKILL.md:128` and its installed copy
  `.claude/skills/code-reviewer/SKILL.md:128` import `THRESHOLDS`; the package exports
  `COMPLEXITY_THRESHOLDS`.
- No test loads `src/index.js`.
- Upstream `nahisaho/MUSUBI` (`main`, checked 2026-10-08) has the same imports.

## Requirements Changes

### ADDED

- REQ-PKG-001: The package entry point (`src/index.js`) SHALL bind every top-level export, and
  every member of its `performance`, `enterprise` and `ai` namespaces, to a defined value.
- REQ-PKG-002: The package entry point SHALL export each class under the name the class
  declares, and each such export SHALL be the same value that the class's source module exports.
- REQ-PKG-003: The package entry point SHALL export `AstExtractor`, `TaskGenerator`,
  `CICDIntegration`, `TraceabilityMatrixReporter`, `Constitution` and `AgentMemory` as aliases of
  `ASTExtractor`, `TasksGenerator`, `CICDManager`, `TraceabilityMatrixReport`,
  `ConstitutionValidator` and `AgentMemoryManager` respectively.
- REQ-PKG-004: Every name that `docs/API-REFERENCE.md` or an agent template under
  `src/templates/` destructures from `require('musubi-sdd')`, or from its `performance`,
  `enterprise` or `ai` namespace, SHALL resolve to a defined export of the package entry point.

### MODIFIED

<!-- None: no existing requirement covers the package entry point. Constitution I-L3 ("each
library SHALL export a public API") is the governing rule and is unchanged. -->

### REMOVED

<!-- None -->

### RENAMED

<!-- None -->

## Design Changes

### ADDED

- Canonical exports in the package public API: `ASTExtractor`, `TraceabilityAnalyzer`,
  `TasksGenerator`, `CICDManager`, `TraceabilityMatrixReport`, `ConstitutionValidator`,
  `AgentMemoryManager` (REQ-PKG-002).
- A "Deprecated aliases (CHANGE-003)" group at the end of `module.exports` holding the six
  REQ-PKG-003 names. A later change can remove the group.

### MODIFIED

- Package public API (`src/index.js`): `GapDetector`, `DesignGenerator`,
  `RequirementsGenerator` and `ChangeManager` keep their names and become defined. Top-level
  exports go from 58 keys (11 undefined) to 64 keys (none undefined).

  ```javascript
  const { ASTExtractor } = require('./analyzers/ast-extractor');
  const GapDetector = require('./analyzers/gap-detector');
  const TraceabilityAnalyzer = require('./analyzers/traceability');
  const DesignGenerator = require('./generators/design');
  const RequirementsGenerator = require('./generators/requirements');
  const TasksGenerator = require('./generators/tasks');
  const { CICDManager } = require('./integrations/cicd');
  const { TraceabilityMatrixReport } = require('./reporters/traceability-matrix-report');
  const ConstitutionValidator = require('./validators/constitution');
  const { AgentMemoryManager } = require('./managers/agent-memory');
  const ChangeManager = require('./managers/change');
  ```

- `CICDIntegration` maps to `CICDManager`, the facade class of `src/integrations/cicd.js`
  (`detect`, `generate`, `generateAll`, `generatePreCommit`, `validate`). The provider enums and
  generator classes stay available from `src/integrations/cicd.js`, as today.

### REMOVED

- `createTraceabilityMatrix` export. It has never been defined, no function of that name exists,
  and nothing documents it. `TraceabilityAnalyzer#generateMatrix()` is the operation it named.

## Code Changes

### ADDED

- `tests/index.test.js` (about 25 tests), written first:
  - no top-level export and no `performance` / `enterprise` / `ai` member is `undefined`
    (REQ-PKG-001);
  - each of the 11 repaired exports is identical (`toBe`) to the value its source module exports,
    and every function-valued export other than the six aliases has `name === key` (REQ-PKG-002);
  - each alias is identical to its canonical export (REQ-PKG-003);
  - every name destructured from `require('musubi-sdd')` (optionally `.performance`,
    `.enterprise`, `.ai`) in `docs/API-REFERENCE.md` and `src/templates/**/*.md` is defined; a
    failure names the file and line (REQ-PKG-004).
- `CHANGELOG.md`: `### Fixed` entry under a new `[Unreleased]` heading above `[6.3.1-itg.2]`,
  listing the repaired names, the new canonical names, the deprecated aliases and the removed
  `createTraceabilityMatrix`.

### MODIFIED

Source:

- `src/index.js:17`, `:18`, `:23`, `:31-33`, `:37`, `:44`, `:48`, `:65-66`: corrected `require()`
  bindings (see Design Changes).
- `src/index.js:97-179` (`module.exports`): canonical names in their groups,
  `createTraceabilityMatrix` replaced by `TraceabilityAnalyzer`, deprecated alias group appended.

Documentation and templates:

- `docs/API-REFERENCE.md:120-135`: `TaskGenerator` becomes `TasksGenerator` (heading, `require`,
  `new`).
- `docs/API-REFERENCE.md:417-433`: remove the "Error Handling" section.
- `src/templates/agents/claude-code/skills/code-reviewer/SKILL.md:128` and
  `.claude/skills/code-reviewer/SKILL.md:128`: `THRESHOLDS` becomes `COMPLEXITY_THRESHOLDS`
  (the two files are identical today and stay identical).
- `storage/changes/change-log.md`: CHANGE-003 row.

Not modified: the 11 source modules, `bin/`, `steering/`, `docs/analysis/*`, released
`CHANGELOG.md` entries.

### REMOVED

<!-- None (no files removed) -->

### RENAMED

<!-- None -->

## Impact Analysis

### Affected Components

- Package entry point `src/index.js`: library consumers of `@improve-to-grow/musubi-sdd`.
- Documentation: `docs/API-REFERENCE.md`.
- Agent templates: `code-reviewer` skill (shipped template and this repository's installed copy).
- CLI (`bin/`): none; no CLI command loads the entry point.
- Test suite: one new suite.

### Breaking Changes

- [x] No breaking changes
- [ ] Breaking changes (list below)

Every changed key was `undefined` before, so any code that used one already failed. New keys are
additive. The removed `createTraceabilityMatrix` was never defined; only code that checks for the
key's presence (`'createTraceabilityMatrix' in exports`) sees a difference.

### Migration Steps

1. None required. Code written against the advertised names starts working.
2. Optional: move from the deprecated aliases to the canonical names: `AstExtractor` to
   `ASTExtractor`, `TaskGenerator` to `TasksGenerator`, `CICDIntegration` to `CICDManager`,
   `TraceabilityMatrixReporter` to `TraceabilityMatrixReport`, `Constitution` to
   `ConstitutionValidator`, `AgentMemory` to `AgentMemoryManager`.
3. Anyone looking for `createTraceabilityMatrix`: use
   `await new TraceabilityAnalyzer(workspaceRoot).generateMatrix(options)`.

### Risks

| Risk                                                                             | Probability | Impact | Mitigation                                                                                          |
| -------------------------------------------------------------------------------- | ----------- | ------ | --------------------------------------------------------------------------------------------------- |
| Loading the entry point gains side effects or cost                               | Low         | Low    | The 11 modules are already required today; only the binding changes                                 |
| Aliases become permanent and two names per class confuse users                   | Medium      | Low    | Grouped and commented as deprecated; CHANGELOG names the canonical names; removal by a later change |
| `Constitution` / `ConstitutionValidator` confused with `ConstitutionalValidator` | Medium      | Low    | Both stay exported (different modules); the alias comment names the source file                     |
| The documentation scan in the new test is brittle                                | Low         | Low    | Matches only `const { ... } = require('musubi-sdd')[.namespace]`; a failure reports file and line   |
| Conflict with `3da9d34`, which edited the same block of `src/index.js`           | Medium      | Low    | Branch from `3da9d34`, or from `ITG-adjustments` after that branch merges                           |

## Testing

### Test Changes

- [x] Unit tests updated: add `tests/index.test.js` (REQ-PKG-001 to REQ-PKG-004).
- [ ] Integration tests updated: not applicable. The new suite loads the real entry point and reads
      the real documentation files, without mocks.
- [ ] E2E tests updated: not applicable (no CLI change).

Expected counts: 168 suites / 4,853 tests (2026-10-08, baseline `3da9d34`) become 169 suites /
about 4,878 tests.

### Test Coverage

- Current coverage (2026-10-08, `npx jest --coverage`, baseline `3da9d34`): 78.11% statements,
  66.60% branches, 82.89% functions, 78.93% lines; thresholds in `jest.config.js` are
  60 / 45 / 60 / 60. All 168 suites passed. A first run that day had one failing test, which did
  not reproduce on re-run and is unrelated to `src/index.js` (no test loads it).
- Target: thresholds unchanged. `src/index.js` becomes covered; the global figures rise slightly.

### Verification Commands

```bash
# No undefined top-level export (prints nothing and exits 0 when fixed)
node -e "const m=require('./src');const u=Object.keys(m).filter(k=>m[k]===undefined);if(u.length){console.error(u);process.exit(1)}"

# New suite, then the full suite, lint and format
npx jest tests/index.test.js
npm test -- --coverage && npm run lint && npm run format:check
```

Before the fix the first command prints the 11 names and exits 1.

## Traceability

### Requirements → Design → Code → Tests

- REQ-PKG-001 → Package public API → `src/index.js` `require()` bindings →
  `tests/index.test.js` "no undefined export"
- REQ-PKG-002 → Canonical export names → `src/index.js` `module.exports` →
  `tests/index.test.js` identity and `name === key` checks
- REQ-PKG-003 → Deprecated alias group → `src/index.js` `module.exports` →
  `tests/index.test.js` alias identity checks
- REQ-PKG-004 → Documented API → `docs/API-REFERENCE.md`, `code-reviewer` `SKILL.md` →
  `tests/index.test.js` documentation scan

## Rollback Plan

- Pre-change state: commit `3da9d34`.
- Whole change: `git revert <implementing commit>`.
- No feature flag, data migration or staged rollout: this fixes bindings in an npm CLI package
  that is distributed from GitHub.

## Constitutional Compliance

Profile: `cli` (`steering/project.yml`, `core_paths: [src]`, `delivery_paths: [bin]`).

- Article I (Testable Core): restores I-L3 ("each library SHALL export a public API") for the
  package entry point. The new suite runs without the CLI (I-2).
- Article II (Automation Interface): no CLI change. The documented library interface
  (`docs/API-REFERENCE.md`) now matches the code (II-2).
- Article III (Test-First): `tests/index.test.js` is written first and observed failing on the
  11 names, `THRESHOLDS`, `MUSUBIError` and `ValidationError` before `src/index.js` and the
  documents change.
- Article IV (EARS): REQ-PKG-001 to REQ-PKG-004 use the ubiquitous `SHALL` pattern; no SHOULD,
  MUST or MAY.
- Article V (Traceability): matrix above; each requirement has one test group.
- Article VI (Project Memory): steering is unchanged. `steering/structure.md:192` already states
  "Public API: All exports via `src/index.ts` (I-L3)"; its `.ts` is generic template text.
- Article VII (Simplicity): no new module or project; about 20 changed lines in `src/index.js`
  and one test file.
- Article VIII (Anti-Abstraction): aliases are plain re-exports, not a wrapper layer.
- Article IX (Integration-First): the suite loads the real entry point and the real documents.

## Appendix

### Code navigation

`node bin/musubi-code.js dependents src/index.js` (scip-typescript index, 2026-10-08) reports
0 dependent files: no code in `bin/`, `src/` or `tests/` loads the entry point. The
`musubi-code` command named in `CLAUDE.md` was not on `PATH` in this environment, so the
repository script was used. String references to `require('musubi-sdd')` in documents and
templates were found with `grep`, because the index does not cover Markdown.

### Upstream

`nahisaho/MUSUBI` `main` has the same broken imports in `src/index.js`. The fix touches no
fork-only file, so it can go upstream as its own pull request. The `@improve-to-grow` package-name
follow-up is fork-only and would not.

### References

- Origin: commit `9c8d401` ("feat: add src/index.js exports and update agent skills with v5.5.0
  modules", 2025-12-10)
- Constitution: `steering/rules/constitution.md` I-L3, II-2
- Documentation: `docs/API-REFERENCE.md`
- Predecessor format: `storage/archive/2026/CHANGE-002/CHANGE-002.md`

### Change History

| Version | Date       | Author   | Changes          |
| ------- | ---------- | -------- | ---------------- |
| 1.0     | 2026-10-08 | Yaroslav | Initial proposal |

## Approval

- [ ] Technical review complete
- [ ] Product review complete
- [ ] Security review complete (not needed: no security surface)
- [ ] Ready to apply

Approval was recorded through the Status field (Approved, 2026-10-08, `musubi-change approve`);
the checklist above is left as submitted. Implementation and archive records:
`CHANGE-003-implementation.md`, `CHANGE-003-archive.md` and `CHANGE-003-delta.json` (the
`musubi-change` delta record) in the same directory.
