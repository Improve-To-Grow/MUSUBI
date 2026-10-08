# Delta Specification: CHANGE-003

**Type**: MODIFIED
**Target**: Package entry point: `Constitution`, `CICDIntegration` and nine other exports undefined
**Status**: implemented
**Created**: 2026-10-08T00:00:00.000Z
**Updated**: 2026-10-08T14:00:21.093Z

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
