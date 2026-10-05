# Delta Specification Guide

This guide explains how to use **Delta Specifications** in MUSUBI for managing changes to existing (brownfield) projects.

## What are Delta Specs?

Delta Specifications are documents that track **changes** to your project's specifications and requirements. Unlike traditional specs that describe the complete state, delta specs describe what has been **ADDED**, **MODIFIED**, **REMOVED**, or **RENAMED**.

## Delta Markers

MUSUBI uses four markers to identify changes:

| Marker | Description | Example |
|--------|-------------|---------|
| `[ADDED]` | New requirements, features, or code | `[ADDED] REQ-015: User profile export` |
| `[MODIFIED]` | Changes to existing items | `[MODIFIED] REQ-003: Updated validation rules` |
| `[REMOVED]` | Deprecated or deleted items | `[REMOVED] REQ-007: Legacy login system` |
| `[RENAMED]` | Items that have been renamed | `[RENAMED] REQ-001 → REQ-001-AUTH` |

## Creating a Delta Spec

### 1. Initialize a Change Proposal

```bash
musubi-change init --title "Add Export Feature" --type "feature"
```

This creates a new change proposal in `storage/changes/`:

```
storage/
└── changes/
    └── CHG-20251208-export-feature/
        ├── proposal.md
        ├── delta-spec.md
        └── status.json
```

### 2. Write Your Delta Spec

```markdown
# Delta Specification: Export Feature

## Change ID: CHG-20251208-export-feature
## Status: Draft

---

## Requirements

### [ADDED] REQ-015: User Profile Export
**Priority**: P1
**Description**: Users shall be able to export their profile data in JSON format.

### [ADDED] REQ-016: Export Notification
**Priority**: P2
**Description**: The system shall notify users when export is complete.

### [MODIFIED] REQ-003: Data Privacy
**Original**: User data is stored encrypted.
**Updated**: User data is stored encrypted and export includes encryption metadata.

## Design

### [ADDED] DES-015: Export Service Architecture
- New ExportService class
- Queue-based processing
- S3 storage integration

## Impact Analysis

### Affected Components
- UserController
- DataService
- NotificationService

### Estimated Effort
- Backend: 3 days
- Frontend: 2 days
- Testing: 2 days
```

### 3. Validate the Delta Spec

```bash
musubi-change validate CHG-20251208-export-feature
```

MUSUBI validates:
- ✅ Correct marker syntax
- ✅ Required fields present
- ✅ Valid requirement IDs
- ✅ No conflicting changes

## Delta Spec Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    DRAFT    │ ──▶ │   REVIEW    │ ──▶ │  APPROVED   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                    │
       │ validate         │ approve            │ apply
       ▼                  ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   REJECTED  │ ◀── │   CHANGES   │     │   ACTIVE    │
└─────────────┘     │  REQUESTED  │     └─────────────┘
                    └─────────────┘            │
                                               │ archive
                                               ▼
                                        ┌─────────────┐
                                        │  ARCHIVED   │
                                        └─────────────┘
```

### Available Commands

```bash
# View change details
musubi-change show <change-id>

# Analyze impact
musubi-change impact <change-id>

# Approve/reject change
musubi-change approve <change-id>
musubi-change reject <change-id> --reason "Missing test plan"

# Apply approved change
musubi-change apply <change-id>

# Archive completed change
musubi-change archive <change-id>

# List all changes
musubi-change list --status active
```

## Impact Analysis

When you run `musubi-change impact`, MUSUBI analyzes:

### Dependency Chain
- Files that directly reference changed requirements
- Files that depend on changed files
- Test files that need updating

### Risk Assessment
| Level | Description |
|-------|-------------|
| LOW | Isolated change, minimal dependencies |
| MEDIUM | Multiple files affected, testing required |
| HIGH | Core functionality affected, extensive testing required |
| CRITICAL | Breaking changes, migration needed |

### Example Output

```
📊 Impact Analysis: CHG-20251208-export-feature

Files Affected:
  ├── src/services/UserService.js (MODIFIED)
  ├── src/controllers/UserController.js (MODIFIED)
  └── tests/services/UserService.test.js (MODIFIED)

Dependencies:
  ├── src/utils/encryption.js
  └── src/services/NotificationService.js

Risk Level: MEDIUM
Estimated Effort: 7 days
Recommendations:
  - Add unit tests for ExportService
  - Update API documentation
  - Consider rate limiting for export endpoint
```

## Best Practices

### 1. Atomic Changes
Keep delta specs focused on a single logical change.

```markdown
❌ Bad: "Update user system"
✅ Good: "Add user profile export feature"
```

### 2. Clear Descriptions
Include before/after context for modifications.

```markdown
### [MODIFIED] REQ-003: Password Policy
**Before**: Passwords must be at least 8 characters.
**After**: Passwords must be at least 12 characters with complexity requirements.
**Reason**: Security audit recommendation SEC-2024-015
```

### 3. Link to Related Items
Reference related changes and requirements.

```markdown
### [ADDED] REQ-017: Export Audit Log
**Related**: REQ-015, REQ-016
**Implements**: SEC-REQ-042 (Compliance requirement)
```

### 4. Version Your Changes
Include version information for tracking.

```markdown
## Version History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-08 | @dev | Initial draft |
| 1.1 | 2025-12-09 | @reviewer | Added security considerations |
```

## Archiving Completed Changes

Once a change is fully implemented and verified:

```bash
musubi-change archive CHG-20251208-export-feature
```

This:
1. Merges delta spec into main specifications (`storage/specs/`)
2. Updates requirement IDs and links
3. Generates a change summary
4. Moves change folder to archived state

## Integration with CI/CD

Add traceability checks to your pipeline:

```yaml
# .github/workflows/traceability-check.yml
- name: Validate Delta Specs
  run: musubi-change validate-all

- name: Check Traceability
  run: musubi-trace ci-check --strictness standard
```

## Next Steps

- [Brownfield Tutorial](./brownfield.md) - Converting existing projects
- [Change Management Guide](./change-management.md) - Full workflow details
- [Traceability Examples](../examples/traceability-matrix.md) - Matrix examples

---

*Part of MUSUBI - Ultimate Specification Driven Development*
