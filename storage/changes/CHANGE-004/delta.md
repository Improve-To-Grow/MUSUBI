# Delta Specification: CHANGE-004

**Type**: MODIFIED
**Target**: Library imports name the upstream package and modules that do not exist
**Status**: approved
**Created**: 2026-10-08T00:00:00.000Z
**Updated**: 2026-10-08T15:07:45.894Z

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
