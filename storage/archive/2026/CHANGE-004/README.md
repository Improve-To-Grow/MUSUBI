# Change Archive: Fork package name and working library imports

**Change ID**: CHANGE-004
**Archived**: 2026-10-08

## Documents

- [Proposal](CHANGE-004.md)
- [Implementation Report](CHANGE-004-implementation.md)
- [Archive Report](CHANGE-004-archive.md)
- [Delta record](CHANGE-004-delta.json) (`musubi-change` approve/archive state)

## Quick Facts

- **Type**: Bug fix (documentation and agent templates)
- **Duration**: same day (proposed, implemented and archived on 2026-10-08)
- **Commit**: `f70352e` on `chore/scip-typescript-replace-codegraph` (not yet merged into `ITG-adjustments`)
- **Status**: Archived ✅ (release pending; CHANGELOG entries under `[Unreleased]`)
- **Outcome**: the 80 library imports in live documentation, agent templates and installed skills load `@improve-to-grow/musubi-sdd` from modules that exist, with names those modules export; the API reference and troubleshooting guide document the project-local install; the plugin development guide (nonexistent API) is deleted; `tests/package-name.test.js` and the widened REQ-PKG-004 scan in `tests/index.test.js` guard the result
