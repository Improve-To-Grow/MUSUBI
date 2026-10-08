# Implementation Report: Package entry point exports defined

## Metadata

- **Change ID**: CHANGE-003
- **Proposal**: [CHANGE-003.md](CHANGE-003.md) (archived together with this report; see [CHANGE-003-archive.md](CHANGE-003-archive.md))
- **Status**: Implemented
- **Implemented**: 2026-10-08
- **Implemented By**: Yaroslav (with Claude Code)
- **Profile**: `cli` (`steering/project.yml`: `core_paths: [src]`, `delivery_paths: [bin]`)
- **Type**: Bug Fix
- **Baseline**: commit `3da9d34` on `chore/scip-typescript-replace-codegraph`
- **Approval**: `musubi-change approve CHANGE-003` (2026-10-08), with the deprecated aliases the
  proposal recommends

`require('musubi-sdd')` (`src/index.js`) now returns 64 top-level keys and none is `undefined`;
before, 11 of 58 were. The 11 classes are exported under their own names, the six names the entry
point used to advertise remain as deprecated aliases, and the API reference and `code-reviewer`
skill no longer destructure names the package does not have.

## Feature Flag

Not created. The change makes previously `undefined` exports defined; there is no behaviour to roll
out gradually (proposal, "Rollback Plan").

## Changes Applied

### ADDED

- [x] `tests/index.test.js` — 23 tests in four groups: no undefined top-level export or
  `performance` / `enterprise` / `ai` member (REQ-PKG-001); each of the 11 repaired exports is the
  value its source module exports, and every function-valued export other than the aliases has
  `name === key` (REQ-PKG-002); each alias is the canonical export (REQ-PKG-003); every name
  destructured from `require('musubi-sdd')` (optionally `.performance`, `.enterprise`, `.ai`) in
  `docs/API-REFERENCE.md` and `src/templates/**/*.md` resolves, failures reported as `file:line`
  (REQ-PKG-004) ✅
- [x] `CHANGELOG.md` — `[Unreleased]` / `### Fixed` entry above `[6.3.1-itg.2]` ✅

### MODIFIED

Source:

- [x] `src/index.js:17-18`, `:23`, `:31-33`, `:37`, `:44`, `:48`, `:65-66` — `require()` bindings
  as in the proposal's Design Changes ✅
- [x] `src/index.js:97-188` (`module.exports`) — canonical names in their groups;
  `createTraceabilityMatrix` replaced by `TraceabilityAnalyzer`; "Deprecated aliases (CHANGE-003)"
  group appended at `:180-187` ✅

Documentation and templates:

- [x] `docs/API-REFERENCE.md:120-127` — `TaskGenerator` becomes `TasksGenerator` (heading,
  `require`, `new`) ✅
- [x] `docs/API-REFERENCE.md` — "Error Handling" section (`MUSUBIError`, `ValidationError`)
  removed ✅
- [x] `src/templates/agents/claude-code/skills/code-reviewer/SKILL.md:128` and
  `.claude/skills/code-reviewer/SKILL.md:128` — `THRESHOLDS` becomes `COMPLEXITY_THRESHOLDS`; the two
  files are still byte-identical ✅
- [x] `storage/changes/change-log.md` — CHANGE-003 row ✅

Not modified, as specified: the 11 source modules, `bin/`, `steering/`, `docs/analysis/*`, released
`CHANGELOG.md` entries.

### REMOVED

- [x] `createTraceabilityMatrix` export — never defined; `TraceabilityAnalyzer#generateMatrix()` is
  the operation it named ✅

Change size: 7 files, 46 insertions and 41 deletions in existing files, plus the 139-line test file.

## Deviation from the Proposal

**The new suite stubs `@octokit/rest`.** The proposal expected the suite to load the entry point
without mocks. Under Jest it cannot: `src/index.js` requires `src/integrations/github-client.js`,
which requires `@octokit/rest` 22 at the top level, and that package is ESM only. Plain Node 22.14
loads it (`require(esm)`), but Jest supports `require(esm)` only from Node 24.9, so the suite failed
to load before any test ran. `tests/index.test.js` therefore calls
`jest.mock('@octokit/rest', () => ({ Octokit: class Octokit {} }))`. No test calls `GitHubClient`,
and every assertion is about bindings, so the stub does not weaken them. The 11 repaired modules and
the documentation files are real.

The alternative, moving the `require('@octokit/rest')` into the `GitHubClient` constructor, edits a
module outside the approved scope and changes the optional-dependency fallback in
`src/resolvers/issue-resolver.js:15-20` (its `try`/`catch` would stop catching the load failure).
Recorded as a follow-up below.

## Test Results

Test-first (Article III): `tests/index.test.js` was run before `src/index.js` and the documents
changed: 19 failed, 4 passed. The failures were exactly the 11 undefined names, the 11 repaired
canonical exports, the 6 aliases, and REQ-PKG-004 listing `docs/API-REFERENCE.md:72 GapDetector`,
`:94 RequirementsGenerator`, `:111 DesignGenerator`, `:125 TaskGenerator`, `:420 MUSUBIError`,
`:420 ValidationError` and `code-reviewer/SKILL.md:128 THRESHOLDS`. The four passes were the three
namespace checks (already clean) and the `name === key` check (vacuous while the 11 were
`undefined`). After the change: 23 passed.

Command: `npx jest --coverage` (full suite, 2026-10-08)

| Metric      | Result                       | Baseline `3da9d34` (proposal) |
| ----------- | ---------------------------- | ----------------------------- |
| Test suites | 169 passed, 169 total        | 168                           |
| Tests       | 4878 passed, 4878 total      | 4853                          |
| Statements  | 78.31% (threshold 60%) ✅    | 78.11%                        |
| Branches    | 66.62% (threshold 45%) ✅    | 66.60%                        |
| Functions   | 82.89% (threshold 60%) ✅    | 82.89%                        |
| Lines       | 79.14% (threshold 60%) ✅    | 78.93%                        |

`src/index.js` is now 100% covered (it was 0%). Of the 25 new tests, 23 are this suite; the other
2 are in `tests/managers/delta-spec.test.js` and come from an unrelated, uncommitted fix in the same
working tree (`musubi-change approve` / `reject` now build `storage/changes/<id>/delta.json` from
the `musubi-change init` proposal when it is missing).

Proposal verification command: `node -e "const m=require('./src');..."` prints nothing and exits 0;
the entry point has 64 keys.

Lint and format: `npm run lint` is clean. `npx prettier --check --end-of-line auto` passes on
`src/index.js` and `tests/index.test.js` (see CHANGE-002 for why `--end-of-line auto` is needed in
this CRLF working copy).

Integration and E2E tests: not applicable (no CLI change).

## Traceability Matrix

| Requirement | Design                     | Implementation                                                   | Tests                                       | Status |
| ----------- | -------------------------- | ---------------------------------------------------------------- | ------------------------------------------- | ------ |
| REQ-PKG-001 | Package public API         | `src/index.js:17-66` (`require()` bindings)                      | `tests/index.test.js:89`, `:93`             | ✅     |
| REQ-PKG-002 | Canonical export names     | `src/index.js:97-178` (`module.exports`)                         | `tests/index.test.js:100`, `:108`           | ✅     |
| REQ-PKG-003 | Deprecated alias group     | `src/index.js:180-187`                                           | `tests/index.test.js:119`                   | ✅     |
| REQ-PKG-004 | Documented API             | `docs/API-REFERENCE.md`, `code-reviewer` `SKILL.md:128` (2 copies) | `tests/index.test.js:126`                   | ✅     |

Coverage: 4 requirements, 4 implemented (100%), 4 with automated tests (100%).

`storage/traceability/matrix.yml` was not regenerated: `musubi-trace matrix` reads
`storage/specs/`, which this change does not touch. The matrix for CHANGE-003 is the table above.

## Code Navigation

Checked after the change with `musubi-code` (scip-typescript index, rebuilt 2026-10-08T13:57:57Z
after the edits, 387 files):

- `musubi-code dependents src/index.js`: only `tests/index.test.js`, which confirms the proposal's
  finding that no code in `bin/` or `src/` loads the entry point.
- `musubi-code refs` for `AstExtractor`, `TaskGenerator`, `CICDIntegration`,
  `TraceabilityMatrixReporter`, `Constitution` and `createTraceabilityMatrix`: no definitions or
  references outside `src/index.js`; `AgentMemory` only in `src/managers/index.js`, which nothing
  loads. A `grep` of `bin/`, `src/` and `tests/` for the same names as strings finds only
  `src/index.js`, `tests/index.test.js` and prose. The aliases and the removal affect no caller.
- `musubi-code dependents src/integrations/github-client.js`: `src/index.js`,
  `src/resolvers/issue-resolver.js` and `bin/musubi-resolve.js` (see Follow-ups).

## Constitutional Compliance

- **Profile**: `cli` (from `steering/project.yml`)
- ✅ Article I: Testable Core — the entry point exports the library's public API again (I-L3); the
  new suite runs without the CLI (I-2).
- ✅ Article II: Automation Interface — no CLI change; the documented library interface matches
  the code (II-2).
- ✅ Article III: Test-First — RED (19 failing) observed before the fix, GREEN after; full suite
  green; coverage above thresholds.
- ✅ Article IV: EARS Format — REQ-PKG-001 to REQ-PKG-004 use the ubiquitous `SHALL` pattern.
- ✅ Article V: Traceability — matrix above; one test group per requirement.
- ✅ Article VI: Project Memory — steering unchanged, as the proposal states
  (`steering/structure.md` already names the public API rule).
- ✅ Article VII: Simplicity — one changed module and one test file; no new module or project.
- ✅ Article VIII: Anti-Abstraction — aliases are plain re-exports.
- ⚠️ Article IX: Integration-First — the suite loads the real entry point, the real 11 modules and
  the real documents; `@octokit/rest` is stubbed for the reason under "Deviation from the
  Proposal".

## Deployment Readiness

- [x] Feature flag — not applicable
- [x] Documentation updated
- [x] CHANGELOG entry added (`[Unreleased]`)
- [x] Commit — the working tree also holds unrelated uncommitted edits (`.claude/settings.json`,
  `AGENTS.md`, `CLAUDE.md`, six `bin/` files, the `delta-spec` fix); commit CHANGE-003's files on
  their own — committed as `a790247` together with the `delta-spec` fix and the
  `.claude/settings.json`, `AGENTS.md`, `CLAUDE.md` and `code-references` skill edits
- [ ] Version bump / release notes — decide at release time
- [x] Rollback plan — `git revert` of the implementing commit; pre-change state is `3da9d34`

## Follow-ups (not in scope)

- `require('musubi-sdd')` throws on Node versions without `require(esm)` (before 20.19 and 22.12;
  `package.json` `engines` says `>=18.0.0`) because `github-client.js` loads the ESM-only
  `@octokit/rest` eagerly. Loading it lazily in the `GitHubClient` constructor would fix this and
  let the new suite drop its stub; its two other dependents, `src/resolvers/issue-resolver.js` and
  `bin/musubi-resolve.js`, both rely on the load failing, so they would need their own check.
- `musubi-resolve` is broken by the same defect class as this change: `bin/musubi-resolve.js:26-27`
  assigns the whole `issue-resolver` and `github-client` module objects to `IssueResolver` and
  `GitHubClient`, so `node bin/musubi-resolve.js --dry-run 1` fails with
  `IssueResolver is not a constructor` (`:130`), and `musubi-resolve list` would fail the same way
  at `new GitHubClient` (`:266`).
- `src/managers/index.js` exports module objects under class names (`AgentMemory`,
  `DeltaSpecManager`, ...). Nothing loads it (`musubi-code dependents src/managers/index.js`: 0
  files).
- The API reference examples for `GapDetector` (`detectGaps()`; the class has `detectAllGaps()`),
  `RequirementsGenerator`, `DesignGenerator` and `TasksGenerator` (option objects and `generate()`;
  the classes take a root directory and have `init()`) call APIs that do not exist. CHANGE-003 only
  makes the names resolve.
- The follow-ups listed in the proposal: `require('musubi-sdd')` vs `@improve-to-grow/musubi-sdd`,
  the "TypeScript Support" section, `docs/analysis/GCC-ANALYSIS-IMPROVEMENTS.md`.

## Next Steps

1. Review the implementation.
2. Commit CHANGE-003's files on their own, for example
   `fix(index): define all package entry point exports (CHANGE-003)` — done, `a790247`
   (`fix(exports): ...`; it also carries the `delta-spec` fix and the `musubi-code` hook and
   docs switch, see [CHANGE-003-archive.md](CHANGE-003-archive.md)).
3. Archive the change: `/sdd-change-archive CHANGE-003` — done, 2026-10-08.
4. Optional: open the upstream pull request (the fix touches no fork-only file).
