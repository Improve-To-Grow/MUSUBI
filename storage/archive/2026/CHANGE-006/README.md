# Change Archive: Code navigation by default, for JavaScript/TypeScript and Python

**Change ID**: CHANGE-006
**Archived**: 2026-10-12

## Documents

- [Proposal](CHANGE-006.md) (v1.1: mixed-project guarantees and the grep guard added on 2026-10-12)
- [Implementation Report](CHANGE-006-implementation.md)
- [Archive Report](CHANGE-006-archive.md)
- [Delta record](CHANGE-006-delta.json) (`musubi-change` approve state; implemented and archived set by hand)

## Quick Facts

- **Type**: Feature (code index: Python indexer, mixed projects, mandatory setup, grep guard)
- **Duration**: four days from proposal (2026-10-09) to archive (2026-10-12); implemented and archived on 2026-10-12
- **Commits**: `29c6c1b`, `6f534a6`, `0d846f7`, `55113ec`, `15e8b27` on `feat/code-index-python` (not yet merged into `ITG-adjustments`)
- **Status**: Archived ✅ (release pending; CHANGELOG entries under `[Unreleased]`)
- **Outcome**: `musubi init`, `musubi upgrade` and `musubi-code setup` configure code navigation without asking in every project with JavaScript, TypeScript or Python. Python and mixed projects are indexed with `@sourcegraph/scip-python` next to scip-typescript, one index file per language, read as one model. The CHANGE-005 grep reminder became a guard that denies a bare-name grep for an indexed name and points to `musubi-code refs`; a quoted name or `--advisory` lets the search run
- **Deviations** (recorded in the implementation report): src-layout references are made resolvable with a transient pyright `extraPaths` configuration during the build, not by normalising symbols; top-level Python files are indexed as root files instead of widening the roots
