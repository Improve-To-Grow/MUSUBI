# Lessons Learned

Insights and improvements for musubi-sdd.

## [2025-12-10] MUSUBI Onboarding

**Challenge**: Manual project setup is time-consuming

**Solution**: Automated onboarding with codebase analysis

**Result**: Project successfully integrated with MUSUBI SDD

**Learning**: Automated analysis provides good starting point, but human review and customization is essential

---

## [2026-10-02] musubi init overwrites files in a brownfield repo

**Challenge**: Running `musubi init` on this already-initialized repo replaced `package.json`
(musubi-sdd 6.3.1 with 25 bin entries) with a bare workspace root, and rewrote
`steering/project.yml`, dropping `core_paths: [src]` / `delivery_paths: [bin]`, `reviewGate`
and `traceability`. The constitutional checker then stopped treating `src/` as source code and
one Article VII test failed. Four other tests failed only on Windows because they compared
`path.join` output against hard-coded forward slashes, and the jest e2e ignore pattern used
forward slashes, so an e2e script ran and killed the run with `process.exit(1)`.

**Solution**: Restored `package.json` and `steering/project.yml` from git (merged the detected
tech stack back in), made the four tests separator-agnostic, and changed
`testPathIgnorePatterns` to `[\/]tests[\/]e2e[\/]`.

**Result**: 163 suites green on Windows; baseline recorded in
`code_quality_report_2026-10-02.md`.

**Learning**: On a brownfield repo, review `git status` right after `musubi init` and restore
anything it clobbered before trusting test or gap results. Never hard-code `/` in path
assertions; build expectations with `path.join`. Jest ignore patterns must be
separator-agnostic to work on Windows.

---

## Template for New Lessons

```markdown
## [YYYY-MM-DD] Lesson Title

**Challenge**: What problem was faced

**Solution**: How it was solved

**Result**: What was the outcome

**Learning**: What was learned for future
```
