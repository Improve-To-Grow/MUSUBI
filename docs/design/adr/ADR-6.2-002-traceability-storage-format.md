# ADR-6.2-002: Traceability Storage Format

**ADR ID**: ADR-6.2-002
**Status**: Proposed
**Created**: 2025-12-31
**Author**: MUSUBI Team
**Requirements**: IMP-6.2-004-01, IMP-6.2-004-02

---

## Context

MUSUBI's traceability feature (IMP-6.2-004) needs to automatically extract and store the correspondence between requirement IDs (REQ-XXX-NNN, IMP-X.X-XXX-NN) and code, tests, and commits.

The choice of storage format affects the following requirements:
- Readability (human review)
- Git diff display
- Query performance
- Scalability

---

## Decision

### Primary Storage: YAML Format

Store the traceability matrix in YAML format at `storage/traceability/matrix.yml`.

```yaml
# storage/traceability/matrix.yml

version: "1.0"
lastUpdated: "2025-12-31T12:00:00Z"
scanConfig:
  patterns:
    - "REQ-[A-Z0-9]+-\\d{3}"
    - "IMP-\\d+\\.\\d+-\\d{3}(?:-\\d{2})?"
  includeGlobs:
    - "src/**/*.ts"
    - "tests/**/*.test.ts"
  excludeGlobs:
    - "node_modules/**"

requirements:
  IMP-6.2-001-01:
    title: "Requirements Review Gate"
    design:
      - path: "docs/design/IMP-6.2-review-workflow-design.md"
        section: "3.1"
        lastVerified: "2025-12-31"
    code:
      - path: "src/review/gates/requirements-review-gate.ts"
        line: 15
        type: "class"
        lastVerified: "2025-12-31"
    tests:
      - path: "tests/review/requirements-review-gate.test.ts"
        line: 25
        description: "should validate EARS compliance"
        lastVerified: "2025-12-31"
    commits:
      - sha: "abc1234"
        message: "feat(review): implement requirements review gate [IMP-6.2-001-01]"
        date: "2025-12-31"
    status: "fully-traced"  # fully-traced | partial | untraced

summary:
  totalRequirements: 18
  fullyTraced: 15
  partiallyTraced: 2
  untraced: 1
  coveragePercent: 94.4
```

### Index Files for Performance

For large projects, generate an index file for quick lookup:

```yaml
# storage/traceability/index.yml

byFile:
  "src/review/gates/requirements-review-gate.ts":
    - IMP-6.2-001-01
    - IMP-6.2-001-04
  "src/review/checkers/ears-checker.ts":
    - IMP-6.2-001-01

byStatus:
  untraced:
    - IMP-6.2-008-02
  partial:
    - IMP-6.2-006-01
    - IMP-6.2-006-02
```

---

## Alternatives Considered

### Alternative 1: JSON Format

```json
{
  "requirements": {
    "IMP-6.2-001-01": {
      "code": [{ "path": "src/...", "line": 15 }]
    }
  }
}
```

**Pros**:
- Easy to parse programmatically
- Widely supported

**Cons**:
- Does not support comments
- Low readability
- Git diffs are hard to read

**Rejected**: Readability and Git compatibility take priority

### Alternative 2: SQLite Database

```sql
CREATE TABLE traceability_links (
  requirement_id TEXT,
  source_type TEXT,
  source_path TEXT,
  source_line INTEGER
);
```

**Pros**:
- Fast queries
- Handles large datasets
- Supports complex queries

**Cons**:
- Binary file, so Git diff is not possible
- Additional dependency
- Over-engineering

**Rejected**: Violates Article VII (Simplicity), lacks Git compatibility

### Alternative 3: Markdown Tables

```markdown
| Requirement | Design | Code | Test | Commit |
|-------------|--------|------|------|--------|
| IMP-6.2-001-01 | ✓ | ✓ | ✓ | ✓ |
```

**Pros**:
- High readability
- Can be rendered on GitHub/GitLab

**Cons**:
- Difficult to parse programmatically
- Cannot include detailed information
- Difficult to update automatically

**Rejected**: Poor fit with automation

---

## Consequences

### Positive

1. **Readability**: Humans can review and edit the file directly
2. **Git compatibility**: Diffs are displayed clearly
3. **Consistency**: Same format as existing MUSUBI configuration files (project.yml, etc.)
4. **Comments**: The YAML format supports comments

### Negative

1. **Performance**: Loading may become slow with 10,000+ requirements
2. **Complex queries**: Flexible queries like SQL are difficult
3. **Type safety**: Schema validation is required

### Mitigations

- **Performance**: Provide quick lookup via index files
- **Future extension**: Prepare a migration path to SQLite if needed
- **Schema validation**: Validate with JSON Schema

---

## Schema Definition

```yaml
# schemas/traceability-matrix.schema.yml

type: object
required:
  - version
  - requirements
properties:
  version:
    type: string
    pattern: "^\\d+\\.\\d+$"
  lastUpdated:
    type: string
    format: date-time
  requirements:
    type: object
    additionalProperties:
      type: object
      properties:
        title:
          type: string
        design:
          type: array
          items:
            type: object
            required: [path]
            properties:
              path: { type: string }
              section: { type: string }
        code:
          type: array
          items:
            type: object
            required: [path, line]
        tests:
          type: array
          items:
            type: object
            required: [path]
        commits:
          type: array
          items:
            type: object
            required: [sha, message]
        status:
          type: string
          enum: [fully-traced, partial, untraced]
```

---

## Migration Path

Migration plan if SQLite becomes necessary in the future:

1. Create a YAML→SQLite importer
2. Run both formats in parallel for a transition period
3. Switch SQLite to primary
4. Keep the YAML export feature (for readability)

---

## Related Decisions

- ADR-6.2-001: Review Gate Architecture
- ADR-6.2-003: Phase -1 Gate Notification

---

## References

- [IMP-6.2-004 Requirements](../../requirements/req_v6.2.md#imp-62-004-bidirectional-traceability-matrix)
- [Article V: Traceability Mandate](../../../steering/rules/constitution.md#article-v-traceability-mandate)

---

**Status**: Proposed
**Decision Date**: TBD
**Reviewers**: MUSUBI Core Team
