# ADR-P1-004: Spec Kit Compatibility

## Status

Proposed

## Date

2025-12-07

## Context

MUSUBI and GitHub Spec Kit are both tools that promote Specification-Driven Development (SDD). Because many development teams may evaluate and use both tools, providing interoperability offers the following benefits:

1. **Migration path**: Make it easy to migrate from Spec Kit to MUSUBI, or vice versa
2. **Ecosystem integration**: Spec Kit users can leverage MUSUBI features (constitutional governance, EARS format)
3. **Interoperability**: Specs can be shared and exchanged between projects
4. **Avoid vendor lock-in**: Users are not tied to a specific tool

### Spec Kit Structure

GitHub Spec Kit uses the following structure:

```
.specify/
├── memory/
│   └── constitution.md          # Project constitution
├── templates/
│   ├── spec-template.md        # Spec template
│   ├── plan-template.md        # Plan template
│   ├── tasks-template.md       # Task template
│   └── commands/               # Slash command definitions
├── scripts/
│   ├── bash/                   # Bash scripts
│   └── powershell/             # PowerShell scripts
└── specs/
    └── ###-feature-name/
        ├── spec.md             # Feature specification
        ├── plan.md             # Implementation plan
        ├── tasks.md            # Task list
        ├── research.md         # Research (optional)
        ├── data-model.md       # Data model (optional)
        ├── quickstart.md       # Quickstart (optional)
        └── contracts/          # API contracts
```

### MUSUBI Structure

MUSUBI uses the following structure:

```
steering/
├── product.md                  # Product context
├── structure.md                # Architecture patterns
├── tech.md                     # Technology stack
├── project.yml                 # Project configuration
├── rules/
│   ├── constitution.md         # 9-article constitution
│   └── workflow.md             # 8-stage workflow
├── memories/                   # Memory system
└── templates/                  # EARS templates
storage/
└── specs/                      # Spec storage
```

## Decision

We implement a **bidirectional conversion system** that enables two-way conversion between MUSUBI and Spec Kit via the `musubi-convert` command.

### Key Architecture Decisions

#### 1. Conversion Architecture: Intermediate Representation (IR) Pattern

**Options**:
- A. Direct conversion (MUSUBI → Spec Kit, Spec Kit → MUSUBI)
- B. Conversion via Intermediate Representation (IR)
- C. Plugin-based conversion

**Decision**: B. Conversion via Intermediate Representation (IR)

**Reason**:
- Easy to extend to other formats (Kiro, OpenSpec, etc.) in the future
- Keeps conversion logic complexity at O(n) (direct conversion is O(n²))
- Easy to test and debug
- Conversion accuracy can be verified clearly

#### 2. Mapping Strategy: Structural Mapping + Semantic Mapping

**Options**:
- A. Structural mapping only (file → file)
- B. Semantic mapping only (content analysis)
- C. Structural mapping + semantic mapping (hybrid)

**Decision**: C. Structural mapping + semantic mapping

**Reason**:
- File structure can be mapped directly
- Content (EARS format ↔ User Stories) requires semantic conversion
- Combining both achieves high-accuracy conversion

#### 3. Constitution Mapping: Extended Mapping

**Spec Kit Constitution** → **MUSUBI 9 Articles** mapping:

| Spec Kit Section | MUSUBI Article |
|-----------------|----------------|
| Core Principles | Article I: Specification Primacy |
| Quality Standards | Article II: Test-First Development |
| Architecture | Article III: Architectural Compliance |
| Security | Article IV: Traceability Requirements |
| Governance | Article V: Change Control Protocol |
| (implicit) | Article VI: Separation of Concerns |
| (implicit) | Article VII: Documentation Standards |
| (implicit) | Article VIII: Continuous Validation |
| (implicit) | Article IX: Graceful Degradation |

**Decision**: Fully preserve MUSUBI's 9 Articles and fill in missing parts when converting from Spec Kit

#### 4. Requirements Format Mapping: EARS ↔ User Stories

**Spec Kit User Story format**:
```markdown
### User Story: [Title]
**Priority**: [P1/P2/P3]
As a [user type], I want to [action] so that [benefit]
**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
```

**MUSUBI EARS format**:
```markdown
### REQ-XXX: [Title]
**Pattern**: [Ubiquitous/Event-Driven/State-Driven/Optional/Complex]
**Priority**: [P0/P1/P2/P3]
WHEN [trigger], the system SHALL [action]
**Acceptance Criteria**:
- AC1: [criterion]
- AC2: [criterion]
```

**Decision**: Define bidirectional conversion rules and minimize information loss

#### 5. CLI Interface Design

```bash
# Spec Kit → MUSUBI
musubi-convert --from-speckit [path] [--output dir] [--dry-run] [--verbose]

# MUSUBI → Spec Kit
musubi-convert --to-speckit [--output dir] [--dry-run] [--verbose]

# Validation only
musubi-convert --validate [format] [path]

# Round-trip test
musubi-convert --roundtrip [path]
```

## Consequences

### Positive

1. **Improved interoperability**: Spec Kit users can easily try MUSUBI
2. **Migration path**: Projects can be migrated incrementally
3. **Ecosystem growth**: Both tools' communities benefit each other
4. **Future extensibility**: The IR pattern makes supporting other formats easy

### Negative

1. **Development cost**: Implementing and testing conversion logic takes time
2. **Maintenance burden**: Need to keep up with Spec Kit specification changes
3. **Information loss risk**: A complete 1:1 mapping is difficult

### Risks

| Risk | Probability | Impact | Mitigation |
|--------|------|------|------|
| Spec Kit spec changes | Medium | Medium | Version pinning, abstraction layer |
| Conversion accuracy issues | Low | High | Thorough testing, round-trip verification |
| Performance | Low | Low | Streaming processing, caching |

## Related Decisions

- ADR-P1-003: VS Code Extension (UI integration of conversion features)
- REQ-P1-004: Spec Kit Compatibility (requirements definition)

## References

- GitHub Spec Kit: https://github.com/github/spec-kit
- EARS Notation: docs/requirements/ears-format.md
- MUSUBI Constitution: steering/rules/constitution.md
