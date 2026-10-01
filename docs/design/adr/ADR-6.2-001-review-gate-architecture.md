# ADR-6.2-001: Review Gate Architecture

**ADR ID**: ADR-6.2-001
**Status**: Proposed
**Created**: 2025-12-31
**Author**: MUSUBI Team
**Requirements**: IMP-6.2-001-01, IMP-6.2-001-02, IMP-6.2-001-03, IMP-6.2-001-04

---

## Context

The MUSUBI SDD workflow currently has no explicit review gates. From development experience on the YAGOKORO project (v1.0.0 to v5.0.0), the following problems were identified:

1. Requirements ambiguities are discovered during the design stage
2. Design changes are needed after implementation
3. Test coverage is only checked after the fact
4. Compliance with the Constitutional Articles is checked manually

Adding review gates is necessary to automate quality checks between phases and enable early detection of problems.

---

## Decision

### Architecture Pattern: Gate-Based Workflow

Place an independent ReviewGate class between each workflow phase (Requirements → Design → Tasks → Implement → Validate).

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Requirements├────►│ Requirements├────►│   Design    │
│   Phase     │     │ ReviewGate  │     │   Phase     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐             │
                    │   Design    │◄────────────┘
                    │ ReviewGate  │
                    └──────┬──────┘
                           │
┌─────────────┐            │      ┌─────────────┐
│    Tasks    │◄───────────┘      │Implementation│
│   Phase     │──────────────────►│ ReviewGate   │
└─────────────┘                   └──────┬───────┘
                                         │
                    ┌─────────────┐       │
                    │  Validate   │◄──────┘
                    │   Phase     │
                    └─────────────┘
```

### Component Design

#### 1. Base ReviewGate Interface

```typescript
interface ReviewGate {
  id: string;
  name: string;
  validate(context: ReviewContext): Promise<ReviewResult>;
  generateReport(result: ReviewResult): Promise<string>;
  persistResult(result: ReviewResult): Promise<void>;
}
```

#### 2. Gate Implementations

| Gate | Trigger | Checks | Blockers |
|------|---------|--------|----------|
| RequirementsReviewGate | Requirements doc created | EARS compliance, Stakeholders, AC | Missing EARS, No AC |
| DesignReviewGate | Design doc created | C4 model, ADR, Constitution | Missing C4, Article violation |
| ImplementationReviewGate | Sprint completed | Coverage, Lint, Traceability | Coverage < 80%, Lint errors |

#### 3. ReviewPromptRegistry

Provides unified prompt management:

```typescript
const REVIEW_PROMPTS = [
  { pattern: '#sdd-review-requirements', gate: RequirementsReviewGate },
  { pattern: '#sdd-review-design', gate: DesignReviewGate },
  { pattern: '#sdd-review-implementation', gate: ImplementationReviewGate },
  { pattern: '#sdd-review-all', gate: FullReviewGate },
];
```

---

## Alternatives Considered

### Alternative 1: Monolithic ReviewEngine

A single ReviewEngine class handles all reviews.

**Pros**:
- Simple implementation
- Avoids duplicating common logic

**Cons**:
- Violates the single responsibility principle
- Difficult to test
- Difficult to add new gate types

**Rejected**: Extensibility and maintainability take priority

### Alternative 2: Plugin-Based Architecture

Load each gate dynamically as a plugin.

**Pros**:
- High extensibility
- Supports third-party gates

**Cons**:
- Overly complex
- Possible violation of the Phase -1 Gate (Anti-Abstraction)

**Rejected**: Violates Constitutional Article VIII

---

## Consequences

### Positive

1. **Independent testing**: Each gate can be unit tested independently
2. **Extensibility**: New gate types are easy to add
3. **Clear separation of responsibilities**: Each gate handles only a specific phase
4. **AGENTS.md integration**: Functionality can be extended by adding prompts

### Negative

1. **Possible code duplication**: Common check logic may be duplicated
2. **Learning cost**: Developers need to understand multiple gate classes
3. **Configuration complexity**: Each gate needs individual configuration

### Mitigations

- Extract common logic into the `ReviewGateBase` class
- Provide thorough documentation and samples
- Provide default settings, with customization optional

---

## Implementation Notes

### File Structure

```
src/review/
├── gates/
│   ├── base-review-gate.ts          # common base class
│   ├── requirements-review-gate.ts
│   ├── design-review-gate.ts
│   └── implementation-review-gate.ts
├── checkers/
│   ├── ears-checker.ts
│   ├── c4-checker.ts
│   └── coverage-checker.ts
├── prompts/
│   └── review-prompt-registry.ts
└── index.ts
```

### Storage Structure

```
storage/reviews/
├── requirements/
│   └── {feature-id}-{timestamp}.yml
├── design/
│   └── {feature-id}-{timestamp}.yml
└── implementation/
    └── {feature-id}-{timestamp}.yml
```

---

## Related Decisions

- ADR-001: Constitutional Governance (existing)
- ADR-002: Skill-Based Architecture (existing)
- ADR-6.2-002: Traceability Storage Format (proposed)
- ADR-6.2-003: Phase -1 Gate Notification (proposed)

---

## References

- [IMP-6.2-001 Requirements](../../requirements/req_v6.2.md#imp-62-001-integrating-review-stages-into-the-workflow)
- [Constitutional Article VII](../../../steering/rules/constitution.md#article-vii-simplicity-gate-phase--1-gate)
- [Constitutional Article VIII](../../../steering/rules/constitution.md#article-viii-anti-abstraction-gate-phase--1-gate)

---

**Status**: Proposed
**Decision Date**: TBD
**Reviewers**: MUSUBI Core Team
