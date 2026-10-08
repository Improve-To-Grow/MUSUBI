# Delta Specification: Change-005

**Type**: MODIFIED
**Target**: Claude Code reaches for grep before the code index
**Status**: implemented
**Created**: 2026-10-08T00:00:00.000Z
**Updated**: 2026-10-08T16:38:25.827Z

## Description

Make `musubi-code` the first tool that Claude Code uses for symbol questions in projects with a
code index, and keep grep for text. A symbol question is about a class, function, method,
constant or module: does it exist, where is it defined, what does a file export, who references,
calls, instantiates or requires it, and which files depend on a file.

There are four reasons Claude still greps:

1. **The guidance covers usages only.** The managed "Code Navigation" section (`CLAUDE.md:42-59`,
   `AGENTS.md:55-69`, written by `instructionSection()`) and the `code-references` skill
   description cover "who calls, uses, instantiates or requires X" and "what depends on this
   file". Neither says that the index also answers "does X exist", "where is X defined" or "what
   does this file export", and those were the questions that went to grep in CHANGE-004.
   `musubi-code refs` already answers them. Each result starts with kind and definition site
   (`checkEarsFormat (function) src/constitutional/ears.js:75`). For an absent name it prints
   `No definition named "EARSValidator" in the index.`
2. **The SDD commands and skills prescribe grep.** 10 lines in 6 Claude Code templates tell the
   agent to grep for code. They are installed unchanged in `.claude/` (table below), and they
   include step 2 of `/sdd-change-init`, the command that produced the CHANGE-004 analysis. While
   a command runs, its step-by-step text is the most recent and most specific instruction, and it
   says `grep -r`.
3. **Steering does not mention the index.** Every SDD command and all 25 MUSUBI skills read
   `steering/tech.md` and `steering/structure.md` first, and neither mentions `musubi-code`.
   `steering/rules/workflow.md:292-294` lists it only for code review, with the superseded
   `node bin/musubi-code.js` invocation.
4. **Nothing acts when Claude makes the call.** The code index hooks only rebuild the index, and
   they run asynchronously. Grep, as the built-in tool or in a shell, is Claude Code's
   general-purpose search. An instruction that loads at session start has to win against that
   habit on every search.

Not in scope:

- **Copilot and AGENTS.md files** (decision above): `AGENTS.md`, `.github/AGENTS.md`,
  `.github/prompts/` (9 files) and `.claude/AGENTS.md` are not deleted. The "Copilot agent that
  assists with…" descriptions of 13 skills and the "Instructions for GitHub Copilot" / `#sdd-*`
  text in 3 commands stay. `AGENTS.md` still receives the reworded managed section (Current
  State). Claude Code does not load AGENTS.md files when a CLAUDE.md exists (default "Project
  instructions" setting), so `.claude/AGENTS.md` does not compete with `CLAUDE.md`.
- **Templates of other agents.** `src/templates/agents/{github-copilot,cursor,codex,windsurf,gemini-cli,qwen-code}`
  contain the same grep steps. Their instruction files receive the new managed section through
  `musubi-code setup`, but their command templates are not changed, and the hook is Claude Code
  only. Follow-up.
- **Generic steering text.** Parts of this repository's steering are still template placeholders:
  `steering/tech.md` lists React, Vue and Next.js, and the "Root Structure" in
  `steering/structure.md` shows `lib/`, `app/` and `components/`, which do not exist. This change
  only adds the navigation rule. Refreshing steering (`/sdd-steering`) is a follow-up.
- **Text checks stay grep.** These checks match text rather than look up symbols: requirement IDs
  (`sdd-validate.md:423-424`, traceability-auditor), EARS keywords (`sdd-change-apply.md:616`),
  and the I-3 / I-L6 import-rule checks (`sdd-validate.md:95`, `:104`, `sdd-change-apply.md:600`,
  constitution-enforcer scripts). They also apply to languages that the index does not cover.
