# Task Execution Checklist

Use this checklist during implementation to ensure quality and compliance.

---

## Pre-Implementation (Per Task)

### Context Check

- [ ] Read related steering files
- [ ] Review requirements for this task
- [ ] Review design for this task
- [ ] Understand dependencies
- [ ] Check for blocking tasks

### Test-First Setup (Article III)

- [ ] Write failing test FIRST (Red, III-2)
- [ ] Test covers requirement (III-5)
- [ ] Test file committed before code (III-1)
- [ ] Test description includes REQ-ID (V-4)

---

## Implementation

### Code Quality

- [ ] Follows project coding standards
- [ ] Meaningful variable/function names
- [ ] Appropriate comments (why, not what)
- [ ] No hardcoded values (use config)
- [ ] Error handling implemented
- [ ] Logging added

### Constitutional Compliance

Read `constitution.profile` from `steering/project.yml` (`library` when absent) to pick the Article I and II check.

| Article | Check | Status |
|---------|-------|--------|
| I: Testable Core | Feature logic in a core module with tests that run without the app (I-1, I-2); no imports from delivery paths (I-3). `library`/`cli`: library in `lib/` (I-L1); `application`: folder under a core path such as `src/lib/`, no UI-only code there (I-A1, I-A4). Exported functions and classes of core modules have a `/** … */` doc comment (I-5, advisory) | ☐ |
| II: Automation Interface | `library`/`cli`: CLI added for functionality (II-L1); `application`: route handler or core function, no CLI required (II-A1–II-A3) | ☐ |
| III: Test-First | Tests written before code (III-1); Red-Green-Blue followed (III-2–III-4) | ☐ |
| VII: Simplicity | Source files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10 per file except `index` files, or the configured limits (VII-4–VII-6); a warning, not a Phase -1 Gate item | ☐ |
| VIII: Anti-Abstraction | Framework used directly (VIII-1); no wrapper over a framework without Phase -1 Gate approval (VIII-2); project-owned client because the vendor SDK cannot run on the target runtime (VIII-4) has the constraint documented in design.md (VIII-5) | ☐ |
| IX: Integration-First | Integration tests use real services (IX-1); each mock justified (IX-4, IX-5) | ☐ |

---

## Testing

### Test Verification

- [ ] Unit tests pass
- [ ] Test makes requirement verifiable
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] Code passes (Green)
- [ ] Refactor completed (Blue)

### Coverage

```bash
# Check coverage
npm test -- --coverage

# Expected: ≥80%
```

---

## Traceability Update

### Update Coverage Matrix

| Item | Before | After |
|------|--------|-------|
| REQ → Code | ☐ | ☑ |
| REQ → Test | ☐ | ☑ |
| Design → Code | ☐ | ☑ |

### Documentation Updates

- [ ] Code comments include REQ-IDs
- [ ] API documentation updated
- [ ] README updated (if needed)
- [ ] Changelog entry added

---

## Code Review Preparation

### Self-Review

- [ ] Code diff reviewed
- [ ] No debug code remaining
- [ ] No commented-out code
- [ ] No TODO without issue link
- [ ] Tests all pass locally

### PR Description

```markdown
## Summary
[What does this PR do?]

## Requirements Addressed
- REQ-XXX-001: [description]
- REQ-XXX-002: [description]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests written before implementation
- [ ] Constitutional compliance verified
- [ ] Documentation updated
```

---

## Post-Implementation

### Task Completion

- [ ] All acceptance criteria met
- [ ] All subtasks completed
- [ ] Code merged to main branch
- [ ] Task status updated to ✓

### Progress Update

```markdown
# In tasks.md
### X.X (P) [Task Title]
...
**Status**: [✓] Completed
**Completed**: YYYY-MM-DD
**Notes**: [Any implementation notes]
```

---

## Retrospective Notes

### What Went Well

- [Note 1]

### What Could Improve

- [Note 1]

### Lessons Learned

- [Lesson 1]

---

## Quick Reference Commands

```bash
# Run constitutional validation
musubi-validate constitution

# Run specific article validation
musubi-validate article 3  # Test-First

# Run tests with coverage
npm test -- --coverage

# Trace requirements
musubi-trace --feature [feature-name]

# Check for gaps
musubi-gaps --verbose
```
