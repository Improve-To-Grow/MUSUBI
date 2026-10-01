# Design Review Checklist

Use this checklist to validate design documents before implementation.

---

## Architecture Review

### Pattern Alignment

- [ ] Architecture pattern clearly stated
- [ ] Pattern matches project needs
- [ ] Aligned with `steering/structure.md`
- [ ] Boundaries clearly defined
- [ ] Component responsibilities documented

### Steering Compliance

| Steering File | Reviewed | Aligned | Notes |
|---------------|----------|---------|-------|
| `structure.md` | ☐ | ☐ | |
| `tech.md` | ☐ | ☐ | |
| `product.md` | ☐ | ☐ | |

---

## Constitutional Compliance

### Article VII: Simplicity Gate

- [ ] Project count ≤ 3 initially, counting independently deployable units (VII-1)
- [ ] Each project has a clear purpose
- [ ] Additional projects have Phase -1 Gate approval before implementation (VII-2)
- [ ] Each additional project justified in design.md: business requirements, technical constraints, team capacity analysis (VII-3)
- [ ] Module split keeps source files ≤ 500 lines of code, functions ≤ 50 and imports ≤ 10 per file, or the configured limits (VII-4–VII-6; checked on the code, not a Phase -1 Gate item)

### Article VIII: Anti-Abstraction Gate

- [ ] Framework APIs used directly (VIII-1)
- [ ] No custom abstraction layer or wrapper library over a framework without Phase -1 Gate approval (VIII-2)
- [ ] Gate request for any abstraction includes multi-framework support justification, team expertise analysis and migration path (VIII-3)
- [ ] Project-owned client because the vendor SDK cannot run on the target runtime (VIII-4): constraint documented in design.md (VIII-5)

---

## Technical Review

### Component Design

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Single Responsibility | | |
| Clear interfaces defined | | |
| Dependencies documented | | |
| Error handling specified | | |
| Logging strategy defined | | |

### Data Design

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Data models complete | | |
| Relationships clear | | |
| Migrations planned | | |
| Validation rules defined | | |
| Privacy considerations | | |

### API Design

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Endpoints documented | | |
| Request/Response schemas | | |
| Error responses defined | | |
| Authentication specified | | |
| Rate limits considered | | |

---

## Security Review

### Security Considerations

- [ ] Authentication mechanism specified
- [ ] Authorization model defined
- [ ] Input validation planned
- [ ] Output encoding specified
- [ ] Sensitive data handling
- [ ] Secrets management approach

### Threat Model (if applicable)

| Threat | Mitigation | Owner |
|--------|------------|-------|
| [threat] | [mitigation] | [owner] |

---

## Performance Review

### Performance Considerations

- [ ] Expected load documented
- [ ] Critical paths identified
- [ ] Caching strategy defined
- [ ] Database indexes planned
- [ ] Async operations identified

### Scalability

| Aspect | Current Design | Future Consideration |
|--------|----------------|---------------------|
| Horizontal scaling | | |
| Database scaling | | |
| Cache scaling | | |

---

## Traceability

### Requirements Coverage

| Requirement ID | Component | API | Test | Coverage |
|----------------|-----------|-----|------|----------|
| REQ-XXX-001 | ☐ | ☐ | ☐ | 0% |
| REQ-XXX-002 | ☐ | ☐ | ☐ | 0% |
| REQ-XXX-003 | ☐ | ☐ | ☐ | 0% |

### ADR References

| Decision | ADR ID | Status |
|----------|--------|--------|
| [decision topic] | ADR-NNN | Proposed/Accepted |

---

## Implementation Readiness

### Pre-Implementation Checklist

- [ ] All requirements mapped to design
- [ ] Technology choices finalized
- [ ] Dependencies identified
- [ ] Risks documented
- [ ] Task breakdown possible

### Open Questions

| Question | Owner | Due Date | Resolution |
|----------|-------|----------|------------|
| [question] | [owner] | [date] | Pending |

---

## Review Sign-off

### Reviewers

| Role | Name | Date | Decision |
|------|------|------|----------|
| System Architect | | | Approve/Reject |
| Tech Lead | | | Approve/Reject |
| Security | | | Approve/Reject |

### Final Decision

- [ ] **APPROVED** - Ready for implementation
- [ ] **APPROVED WITH CHANGES** - Minor updates needed
- [ ] **REJECTED** - Significant issues to address
- [ ] **DEFERRED** - More information needed

**Status**: [ ] Draft → [ ] Review → [ ] Approved

**Next Step**: Create Task Breakdown (`tasks.md`)
