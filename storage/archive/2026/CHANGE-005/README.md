# Change Archive: Index-first code navigation for Claude Code

**Change ID**: CHANGE-005
**Archived**: 2026-10-08

## Documents

- [Proposal](CHANGE-005.md)
- [Implementation Report](CHANGE-005-implementation.md)
- [Archive Report](CHANGE-005-archive.md)
- [Delta record](CHANGE-005-delta.json) (`musubi-change` approve state; implemented and archived set by hand)

## Quick Facts

- **Type**: Enhancement (agent instructions, Claude Code templates, code index hook)
- **Duration**: same day (proposed, implemented and archived on 2026-10-08)
- **Commits**: `3ac90dc` (code index) and `b4c6797` (templates, steering, this repository's install) on `chore/scip-typescript-replace-codegraph` (not yet merged into `ITG-adjustments`)
- **Status**: Archived ✅ (release pending; CHANGELOG entries under `[Unreleased]`)
- **Outcome**: Claude Code is pointed at `musubi-code` for symbol questions. The managed "Code Navigation" section and the `code-references` skill cover definition, existence and export questions. The Claude Code SDD templates and steering ask the index before grep. A synchronous PreToolUse hook (`musubi-code hint --hook`) adds a note when a Grep or shell grep searches for an indexed name, verified live for the Grep tool, Bash `grep`/`git grep` (also inside `cd … && grep …`) and PowerShell `Select-String`
- **Out of scope** (maintainer decision): deleting `AGENTS.md` and the GitHub Copilot files
