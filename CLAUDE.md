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

Answer symbol questions with `musubi-code` before grep. A symbol question is about a class,
function, method, constant or module in the indexed code: does it exist, where is it defined,
what does a file export, who uses it, what depends on a file.

| Question                                   | Command                                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Does `X` exist? Where is it defined?       | `musubi-code refs X`: each result starts with kind and file:line; "No definition named" means absent |
| What does a file define or export?         | `musubi-code symbols <file>`                                                                         |
| Who references, calls or instantiates `X`? | `musubi-code refs X`, `musubi-code callers X`                                                        |
| What does a file load, and what loads it?  | `musubi-code deps <file>`, `musubi-code dependents <file>`                                           |

This also applies where an SDD command, prompt or skill says to grep for code. Use grep for
text the index does not cover: Markdown, templates, configuration, comments, string-keyed registries
and dynamic `require()` paths, and once for the name as a string before a rename or deletion.
`musubi-code status` lists the indexed directories. The index is compiler-accurate (scip-typescript,
`.scip/`) and is rebuilt first when source files changed.

The `code-references` skill lists all options. Hooks in `.claude/settings.json` keep the index
fresh and add a note when a grep searches for an indexed name.
<!-- musubi-code:end -->
