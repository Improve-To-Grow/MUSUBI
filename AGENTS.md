# MUSUBI - musubi

A software project using MUSUBI SDD

## Initialized with MUSUBI SDD for GitHub Copilot

This project uses **MUSUBI** (Ultimate Specification Driven Development).


### Prompts

- `#sdd-steering` - Generate/update project memory
- `#sdd-requirements <feature>` - Create EARS requirements
- `#sdd-design <feature>` - Generate C4 + ADR design
- `#sdd-tasks <feature>` - Break down into tasks
- `#sdd-implement <feature>` - Execute implementation
- `#sdd-validate <feature>` - Validate constitutional compliance


### Review Gate Prompts (v6.2.0)

- `#sdd-review-requirements <feature>` - Review requirements (EARS, stakeholders, acceptance criteria)
- `#sdd-review-design <feature>` - Review design (C4, ADR, Constitutional Articles)
- `#sdd-review-implementation <feature>` - Review implementation (coverage, lint, traceability)
- `#sdd-review-all <feature>` - Full review cycle for all phases

### Storage Paths (v6.3.0)

| Document | Path |
|----------|------|
| Requirements | `storage/specs/{feature}-requirements.md` |
| Design | `storage/design/{feature}-design.md` |
| Tasks | `storage/tasks/{feature}-tasks.md` |
| Validation | `storage/validation/{feature}-validation-report.md` |

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

**Agent**: GitHub Copilot
**Initialized**: 2026-01-02
**MUSUBI Version**: 6.3.0

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
<!-- musubi-code:end -->
