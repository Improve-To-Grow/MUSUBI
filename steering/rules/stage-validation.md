# Stage Validation Guide

Guide to automated validation and feedback loops between stages.

## Stage Validation Commands

Validation commands to run when each stage is complete:

```bash
# On completion of requirements definition
musubi-validate requirements

# On completion of design
musubi-validate design

# On completion of task breakdown
musubi-validate tasks

# On completion of implementation (before testing)
musubi-validate implementation

# Full validation
musubi-validate all
```

## Stage Transition Checklist

### Requirements → Design

**Required conditions**:
- [ ] All requirements are written in EARS format
- [ ] Each requirement has a unique ID (REQ-XXX-NNN)
- [ ] All requirements are testable
- [ ] Priority (MoSCoW) is set
- [ ] Stakeholder review complete

**Validation commands**:
```bash
musubi-validate requirements
musubi-trace matrix --check-gaps
```

**Gatekeeper**: Product Manager / System Architect

---

### Design → Tasks

**Required conditions**:
- [ ] All requirements are mapped to design components
- [ ] Architecture complies with `steering/structure.md`
- [ ] Technology stack complies with `steering/tech.md`
- [ ] Each feature has a named core module under a core path, per the project profile in `steering/project.yml` (`library` when absent) (Article I: Testable Core, I-1)
- [ ] The automation interface is specified: a CLI for `library`/`cli`, the HTTP API for `application` (Article II: Automation Interface, II-1)
- [ ] C4 diagrams are created
- [ ] ADRs (Architecture Decision Records) are recorded
- [ ] Security and performance considerations are documented

**Validation commands**:
```bash
musubi-validate design
musubi-gaps detect --stage design
```

**Gatekeeper**: System Architect / Tech Lead

---

### Tasks → Implementation

**Required conditions**:
- [ ] Tasks are assigned to all requirements
- [ ] Task dependencies are clear
- [ ] Each task has completion criteria
- [ ] Effort estimates are provided
- [ ] 100% requirements coverage

**Validation commands**:
```bash
musubi-validate tasks
musubi-trace coverage --requirements
```

**Gatekeeper**: Project Manager / Tech Lead

---

### Implementation → Testing

**Required conditions**:
- [ ] All tasks are complete
- [ ] Code review approved
- [ ] Unit test coverage ≥ 80%
- [ ] Source files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10, or the configured limits (Article VII: Simplicity Gate, VII-4–VII-6; findings warn, not a Phase -1 Gate item)
- [ ] Exported functions and classes of core modules have doc comments (Article I: Testable Core, I-5, advisory)
- [ ] No Lint/Format errors
- [ ] No critical bugs

**Validation commands**:
```bash
npm test
npm run lint
musubi-validate implementation
```

**Gatekeeper**: Tech Lead

---

### Testing → Deployment

**Required conditions**:
- [ ] Every EARS requirement has test cases
- [ ] All tests pass
- [ ] Performance tests meet NFRs
- [ ] Security tests pass
- [ ] Test coverage report generated

**Validation commands**:
```bash
npm run test:coverage
musubi-validate testing
musubi-trace coverage --tests
```

**Gatekeeper**: QA Lead

---

### Deployment → Monitoring

**Required conditions**:
- [ ] Staging deployment succeeded
- [ ] Smoke tests pass
- [ ] Production deployment succeeded
- [ ] Health checks are normal
- [ ] Monitoring and alert setup complete
- [ ] Rollback procedure tested

**Validation commands**:
```bash
musubi-validate deployment
```

**Gatekeeper**: DevOps Lead / SRE

---

## Feedback Loops

### Feedback from Testing to Requirements

When testing uncovers a problem:

1. **Bug**: Return to Implementation
2. **Missing requirement**: Return to Requirements and add EARS requirements
3. **Design issue**: Return to Design and fix the architecture

```
Testing ──[Bug]────────→ Implementation
    │
    ├──[Requirement Gap]──→ Requirements
    │
    └──[Design Issue]─────→ Design
```

### Feedback from Monitoring to Improvement

When problems are found in production:

1. **Performance issue**: Review NFRs and revise Design
2. **Security issue**: Security Audit → revise Design
3. **Feature request**: Add new requirements to Requirements

---

## Retrospective Checklist

Perform after each iteration/release:

### Process Retrospective

- [ ] Where are the workflow bottlenecks?
- [ ] Were any stages skipped?
- [ ] Which stages had the most rework?
- [ ] Were there problems that validation missed?

### Deliverables Retrospective

- [ ] Was the quality of the requirements sufficient?
- [ ] Did the design guide the implementation appropriately?
- [ ] Were the tests able to detect problems?
- [ ] Was the documentation kept up to date?

### Improvement Actions

Record retrospective results in `steering/memories/lessons_learned.md`.

---

## Automated Validation Setup

### Validation in CI/CD

Set up automated validation in `.github/workflows/validate.yml`:

```yaml
name: SDD Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npx musubi-validate all
```

---

## Related Documents

- `steering/rules/workflow.md` - Complete workflow guide
- `steering/rules/ears-format.md` - EARS format guide
- `steering/rules/constitution.md` - 9-Article Constitution
- `steering/memories/lessons_learned.md` - Retrospective records
