# MUSUBI - MUSUBI

MUSUBI self-maintenance project

## Initialized with MUSUBI SDD for Claude Code

This project uses **MUSUBI** (Ultimate Specification Driven Development) with 8 skill groups.

### Available Skills

Check `.claude/skills/` directory for all installed skills.


### Commands

- `/sdd-steering` - Generate/update project memory
- `/sdd-requirements <feature>` - Create EARS requirements
- `/sdd-design <feature>` - Generate C4 + ADR design
- `/sdd-tasks <feature>` - Break down into tasks
- `/sdd-implement <feature>` - Execute implementation
- `/sdd-validate <feature>` - Validate constitutional compliance

### Project Memory

- `steering/structure.md` - Architecture patterns
- `steering/tech.md` - Technology stack
- `steering/product.md` - Product context
- `steering/rules/constitution.md` - 9 Constitutional Articles

### Learn More

- [MUSUBI Documentation](https://github.com/nahisaho/MUSUBI)
- [Constitutional Governance](steering/rules/constitution.md)
- [8-Stage SDD Workflow](steering/rules/workflow.md)

---

**Agent**: Claude Code
**Initialized**: 2026-10-02
**MUSUBI Version**: 0.1.0

<!-- musubi-code:start -->
## Code Navigation

Use these commands instead of grep for questions such as "who calls, uses, instantiates or
requires X" and "what depends on this file":

- `musubi-code refs <Name>` - every reference (new, call, require, extends, ...) with the enclosing function
- `musubi-code callers <Name>` - functions that call or instantiate it
- `musubi-code deps <file>` and `musubi-code dependents <file>` - file dependencies in both directions
- `musubi-code symbols <file>` - definitions in a file

They read a compiler-accurate scip-typescript index in `.scip/` and rebuild it first when
source files changed. Use grep only for names that appear as strings, such as dynamic
`require()` paths, registries and templates.

The `code-references` skill lists all options; hooks in `.claude/settings.json` keep the
index fresh in the background.
<!-- musubi-code:end -->
