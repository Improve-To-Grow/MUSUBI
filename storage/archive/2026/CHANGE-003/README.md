# Change Archive: Package entry point exports defined

**Change ID**: CHANGE-003
**Archived**: 2026-10-08

## Documents

- [Proposal](CHANGE-003.md)
- [Implementation Report](CHANGE-003-implementation.md)
- [Archive Report](CHANGE-003-archive.md)
- [Delta record](CHANGE-003-delta.json) (`musubi-change` approve/archive state)

## Quick Facts

- **Type**: Bug fix
- **Duration**: same day (proposed, implemented and archived on 2026-10-08)
- **Commit**: `a790247` on `chore/scip-typescript-replace-codegraph` (not yet merged into `ITG-adjustments`)
- **Status**: Archived ✅ (release pending; CHANGELOG entry under `[Unreleased]`)
- **Outcome**: every export of `require('musubi-sdd')` (`src/index.js`) is defined (64 keys, was 11 of 58 `undefined`); classes exported under their own names with the old names as deprecated aliases; `tests/index.test.js` guards the exports and the documented API
