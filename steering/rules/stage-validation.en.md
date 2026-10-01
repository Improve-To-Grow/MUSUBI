# Stage Validation Guide

A guide to automated validation and feedback loops between stages.

## Stage Validation Commands

Validation commands to run when each stage is completed:

```bash
# When requirements definition is complete
musubi-validate requirements

# When design is complete
musubi-validate design

# When task breakdown is complete
musubi-validate tasks

# When implementation is complete (before testing)
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
- [ ] Stakeholder review is complete

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
- [ ] Tech stack complies with `steering/tech.md`
- [ ] C4 diagrams have been created
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
- [ ] Effort estimates exist
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
- [ ] Health checks normal
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure tested

**Validation commands**:
```bash
musubi-validate deployment
```

**Gatekeeper**: DevOps Lead / SRE

---

## Feedback Loops

### Testing → Feedback to Requirements

When testing finds a problem:

1. **Bug**: Return to Implementation
2. **Missing requirement**: Return to Requirements and add an EARS requirement
3. **Design problem**: Return to Design and revise the architecture

```
Testing ──[Bug]────────→ Implementation
    │
    ├──[Requirement Gap]──→ Requirements
    │
    └──[Design Issue]─────→ Design
```

### Monitoring → Feedback for Improvement

When a problem is found in production:

1. **Performance problem**: Review NFRs and revise Design
2. **Security problem**: Security Audit → revise Design
3. **Feature request**: Add a new requirement to Requirements

---

## Retrospective Checklist

Carry out after each iteration/release:

### Process Retrospective

- [ ] Where are the workflow bottlenecks?
- [ ] Were any stages skipped?
- [ ] Which stages had the most rework?
- [ ] Were any problems missed by validation?

### Deliverables Retrospective

- [ ] Was the quality of requirements sufficient?
- [ ] Did the design guide implementation appropriately?
- [ ] Did the tests detect the problems?
- [ ] Was documentation kept up to date?

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
- `steering/rules/constitution.md` - 9-article constitution
- `steering/memories/lessons_learned.md` - Retrospective records
