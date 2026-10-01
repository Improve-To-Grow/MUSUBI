# Phase -1 Gate Approval Request Template

Use this template to request approval for exceptions to Constitutional Articles VII and VIII.

---

## Gate Request

**Request ID**: GATE-YYYY-MM-DD-NNN
**Date**: YYYY-MM-DD
**Requestor**: [Name/Role]
**Gate Type**: [ ] Simplicity Gate (Article VII) [ ] Anti-Abstraction Gate (Article VIII)

---

## Request Summary

### What is being requested?

[Brief description of the exception being requested]

### Which article requires exception?

- [ ] **Article VII**: Exceeding the 3-project limit (VII-1); the additional projects are not implemented before approval (VII-2)
- [ ] **Article VIII**: Creating an abstraction layer or wrapper library over a framework (VIII-2)

A project-owned client that exists because the vendor SDK cannot run on the target runtime needs no gate request (VIII-4); document the constraint in design.md instead (VIII-5).

The code-size limits of Article VII (VII-4–VII-6) need no gate request either: findings are reported at the article's level (CONST-007), and a project changes the limits with `constitution.overrides.code_limits` in `steering/project.yml`.

---

## Justification

### Business Requirements

[Explain why this exception is necessary for business goals]

1. [Requirement 1]
2. [Requirement 2]
3. [Requirement 3]

### Technical Constraints

[Explain technical reasons requiring this exception]

1. [Constraint 1]
2. [Constraint 2]
3. [Constraint 3]

### Alternatives Considered

| Alternative | Pros | Cons | Why Not Chosen |
|-------------|------|------|----------------|
| [Option 1] | | | |
| [Option 2] | | | |
| [Option 3] | | | |

---

## For Simplicity Gate (Article VII)

A project is an independently deployable unit. design.md justifies each additional project with business requirements, technical constraints and a team capacity analysis (VII-3); this section carries the same analysis.

### Current Project Count

| # | Project | Purpose | Independently deployable? |
|---|---------|---------|--------------|
| 1 | [name] | [purpose] | Yes/No |
| 2 | [name] | [purpose] | Yes/No |
| 3 | [name] | [purpose] | Yes/No |

### Proposed Additional Projects

| # | Project | Purpose | Justification |
|---|---------|---------|---------------|
| 4 | [name] | [purpose] | [why needed] |

### Team Capacity Analysis

- Team size: [number]
- Experience level: [Junior/Mid/Senior mix]
- Current velocity: [story points/sprint]
- Capacity for additional projects: [Yes/No with explanation]

---

## For Anti-Abstraction Gate (Article VIII)

The request includes a multi-framework support justification, a team expertise analysis and a migration path (VIII-3).

### Framework Being Abstracted

- **Framework**: [name and version]
- **Purpose**: [what the framework does]

### Proposed Abstraction

```typescript
// Interface or abstraction being proposed
interface ProposedAbstraction {
  // ...
}
```

### Multi-Framework Support Justification

| Framework | Version | Use Case | Priority |
|-----------|---------|----------|----------|
| [Framework 1] | [version] | [use case] | Primary |
| [Framework 2] | [version] | [use case] | Secondary |

### Migration Path

1. **Phase 1**: [Initial state]
2. **Phase 2**: [Migration step]
3. **Phase 3**: [Target state]

### Team Expertise Analysis

| Framework | Team Members | Expertise Level |
|-----------|--------------|-----------------|
| [Framework 1] | [count] | [1-5] |
| [Framework 2] | [count] | [1-5] |

---

## Risk Assessment

### Risks of Approval

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | H/M/L | H/M/L | [mitigation] |
| [Risk 2] | H/M/L | H/M/L | [mitigation] |

### Risks of Rejection

| Risk | Probability | Impact | Notes |
|------|-------------|--------|-------|
| [Risk 1] | H/M/L | H/M/L | [notes] |
| [Risk 2] | H/M/L | H/M/L | [notes] |

---

## Conditions and Constraints

### Proposed Constraints

If approved, the following constraints will apply:

1. [ ] [Constraint 1]
2. [ ] [Constraint 2]
3. [ ] [Constraint 3]

### Review Schedule

- Initial review: [date]
- Periodic reviews: [frequency]
- Sunset date: [if applicable]

---

## Approval

### Required Approvers

**For Article VII (Simplicity Gate)**:
- [ ] System Architect
- [ ] Project Manager

**For Article VIII (Anti-Abstraction Gate)**:
- [ ] System Architect
- [ ] Software Developer Lead

### Approval Decision

| Role | Name | Decision | Date | Notes |
|------|------|----------|------|-------|
| System Architect | | Approve/Reject | | |
| Project Manager / Dev Lead | | Approve/Reject | | |

### Final Decision

- [ ] **APPROVED** - Exception granted with conditions
- [ ] **APPROVED WITH MODIFICATIONS** - Exception granted with changes
- [ ] **REJECTED** - Exception denied
- [ ] **DEFERRED** - More information needed

### Conditions of Approval

[List any conditions attached to the approval]

1. [Condition 1]
2. [Condition 2]

---

## Post-Approval Tracking

### Documentation Updates

- [ ] Updated `steering/complexity-tracking.md`
- [ ] Article VII: justification for each additional project recorded in design.md (VII-3)
- [ ] Updated architecture documentation
- [ ] Team notified

### Review Log

| Date | Reviewer | Status | Notes |
|------|----------|--------|-------|
| | | | |
