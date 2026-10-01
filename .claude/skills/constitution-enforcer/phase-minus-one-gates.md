# Phase -1 Gates

## Overview

Phase -1 Gates are pre-implementation validation gates that MUST pass before any code is written. These gates enforce constitutional compliance and prevent governance violations early in the development lifecycle.

---

## Gate Structure

```
User Request
    │
    ▼
┌─────────────────────────────────────────┐
│           PHASE -1 GATES                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Gate 1: Steering Check          │   │
│  │ Gate 2: EARS Validation         │   │
│  │ Gate 3: Testable-Core Gate      │   │
│  │ Gate 4: Test-First Confirmation │   │
│  │ Gate 5: Traceability Setup      │   │
│  │ Gate 6: Simplicity Gate         │   │
│  │ Gate 7: Anti-Abstraction Gate   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ALL GATES MUST PASS                    │
└─────────────────────────────────────────┘
    │
    ▼
Implementation Begins
```

---

## Gate 1: Steering Check (Article VI)

**Purpose**: Ensure project memory is consulted before work begins.

**Validation**:
```bash
# Check if steering files exist
required_files=(
    "steering/structure.md"
    "steering/tech.md"
    "steering/product.md"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        FAIL "VI-1–VI-3: Steering file missing: $file"
    fi
done

# Check if steering was read (agent must confirm, VI-4)
PASS "Steering files exist and will be consulted"
```

**Pass Criteria**:
- [ ] `steering/structure.md` exists (VI-1)
- [ ] `steering/tech.md` exists (VI-2)
- [ ] `steering/product.md` exists (VI-3)
- [ ] Agent confirms steering review (VI-4)

**Failure Action**:
→ Run `steering` skill to generate missing files

---

## Gate 2: EARS Validation (Article IV)

**Purpose**: Ensure requirements use EARS format.

**Validation**:
```python
def validate_ears_format(requirements_file):
    """
    Check requirements for EARS patterns.
    """
    valid_patterns = [
        r"WHEN .+ (SHALL|MUST)",           # Event-driven
        r"WHILE .+ (SHALL|MUST)",          # State-driven
        r"WHERE .+ (SHALL|MUST)",          # Optional feature
        r"IF .+ THEN .+ (SHALL|MUST)",     # Conditional
        r"The system (SHALL|MUST)",        # Ubiquitous
    ]
    
    invalid_keywords = ["should", "may", "could", "might"]
    
    for line in requirements_file:
        if any(kw in line.lower() for kw in invalid_keywords):
            FAIL(f"IV-2: Ambiguous keyword found: {line}")
        
        if "REQ-" in line and not any(re.match(p, line) for p in valid_patterns):
            WARN(f"IV-1: Requirement may not follow EARS: {line}")
    
    PASS("All requirements follow EARS format")
```

**Pass Criteria**:
- [ ] All requirements use SHALL/MUST (not should/may), with a single interpretation (IV-2)
- [ ] Requirements follow one of the 5 EARS patterns (IV-1)
- [ ] Each requirement has acceptance criteria (IV-3)
- [ ] Each requirement has unique ID (REQ-XXX)

**Failure Action**:
→ Rewrite requirements with `requirements-analyst` skill

---

## Gate 3: Testable-Core Gate (Article I)

**Purpose**: Ensure feature logic lives in core modules that are tested without the UI, server or CLI. The project profile decides what a core module is.

**Validation**:
```bash
# Read the profile and core paths from steering/project.yml
# (default profile: library, P-2; default core paths for library/cli: lib/ packages/, P-3)
profile=$(yq '.constitution.profile // "library"' steering/project.yml)
core_paths=$(yq '.constitution.core_paths // [] | .[]' steering/project.yml)

# For new features, check target directory
feature_path="$1"
core_module_path="$2" # application: core module named for the feature in design.md

case "$profile" in
library|cli)
    # I-L1: the feature starts as a library under a core path
    if [[ "$feature_path" == *"/app/"* ]] || [[ "$feature_path" == *"/web/"* ]]; then
        # Check if corresponding lib exists
        lib_path=$(echo "$feature_path" | sed 's/app\//lib\//; s/web\//lib\//')

        if [ ! -d "$lib_path" ]; then
            FAIL "I-L1: Feature must be in lib/ first before app/ or web/"
        fi
    fi
    ;;
application)
    # I-1, I-A1: the feature's core module is a folder under a core path, e.g. src/lib/<domain>/
    # (app/ is a delivery path here, not a violation)
    if ! is_under "$core_module_path" $core_paths; then
        FAIL "I-A1: Core module must be a folder under a core path (${core_paths})"
    fi
    ;;
esac

PASS "Testable-Core principle satisfied"
```

**Pass Criteria**:
- [ ] Feature logic targets a core path (I-1)
- [ ] Core module will have tests that run without the app, a browser or a CLI (I-2)
- [ ] Core module does not import from delivery paths (I-3)
- [ ] Exported functions and classes of the core module will have doc comments (I-5, advisory)
- [ ] (`library`, `cli`) New feature targets `lib/` directory first, OR an existing `lib/` module exists for the feature (I-L1)
- [ ] (`application`) Core module is a folder under a core path, e.g. `src/lib/<domain>/`, with no UI-only code (I-A1, I-A4)

**Failure Action**:
→ `library`, `cli`: Restructure to create `lib/` module first
→ `application`: Move feature logic from the delivery layer into a folder under a core path

---

## Gate 4: Test-First Confirmation (Article III)

**Purpose**: Confirm tests will be written before implementation.

**Validation**:
```bash
# This is a confirmation gate - agent must commit to test-first
echo "TEST-FIRST CONFIRMATION REQUIRED"
echo ""
echo "Do you confirm that:"
echo "1. Tests will be written BEFORE implementation code (III-1)?"
echo "2. Tests will be committed BEFORE source code (III-1)?"
echo "3. Red-Green-Blue cycle will be followed (III-2–III-4)?"
echo ""

# Agent must explicitly confirm
if [ "$CONFIRMATION" != "yes" ]; then
    FAIL "Test-First commitment not confirmed"
fi

PASS "Test-First commitment confirmed"
```

**Pass Criteria**:
- [ ] Agent confirms test-first commitment (III-1)
- [ ] Test file paths identified
- [ ] A test planned for every EARS requirement (III-5)
- [ ] Test framework confirmed in steering/tech.md

**Failure Action**:
→ Cannot proceed until test-first is confirmed

---

## Gate 5: Traceability Setup (Article V)

**Purpose**: Ensure traceability chain is established.

**Validation**:
```python
def validate_traceability_setup(feature_name):
    """
    Verify traceability chain is ready.
    """
    required_artifacts = {
        "requirements": f"storage/specs/{feature_name}-requirements.md",
        "design": f"storage/design/{feature_name}-design.md",
        "tasks": f"storage/tasks/{feature_name}-tasks.md",
    }
    
    for artifact, path in required_artifacts.items():
        if artifact == "requirements":
            # Requirements MUST exist before design
            if not os.path.exists(path):
                FAIL(f"Requirements must exist before implementation: {path}")
    
    # Confirm traceability matrix will be maintained
    PASS("Traceability setup confirmed")
```

**Pass Criteria**:
- [ ] Requirements file exists or will be created first
- [ ] Design will reference requirements and include a coverage matrix (V-1, V-5)
- [ ] Tasks will map to requirements (V-6)
- [ ] Code will map to requirements (V-2)
- [ ] Tests will reference requirement IDs (V-3, V-4)

**Failure Action**:
→ Create requirements before proceeding

---

## Gate 6: Simplicity Gate (Article VII)

**Purpose**: Limit the initial architecture to at most 3 projects. A project is an independently deployable unit.

**Not gated**: The code-size limits of Article VII (VII-4–VII-6: lines of code per file and per function, imports per file) do not decide this gate. They are checked at the article's level (CONST-007), not gated.

**Validation**:
```markdown
## Simplicity Checklist

For the proposed design, verify:

1. **Project Count**
   - [ ] Count each independently deployable unit (web app, API service, worker)
   - [ ] Initial architecture has at most 3 projects (VII-1)

2. **More Than 3 Projects**
   - [ ] Phase -1 Gate approval before implementing the additional projects (VII-2)
   - [ ] Approval from `system-architect` and `project-manager`
   - [ ] design.md justifies each additional project with business requirements,
         technical constraints and a team capacity analysis (VII-3)
```

**Pass Criteria**:
- [ ] At most 3 projects (VII-1), or Phase -1 Gate approval for the additional projects (VII-2)
- [ ] Each additional project justified in design.md (VII-3)

**Failure Action**:
→ Reduce the project count, or submit a Phase -1 Gate request (`steering/templates/phase-minus-one-gate-request.md`) with the VII-3 justification

---

## Gate 7: Anti-Abstraction Gate (Article VIII)

**Purpose**: Use framework features directly; a custom abstraction layer over a framework needs Phase -1 Gate approval.

**Validation**:
```markdown
## Anti-Abstraction Checklist

For the proposed solution, verify:

1. **Framework Used Directly**
   - [ ] Framework APIs called directly (VIII-1)
   - [ ] No custom abstraction layer or wrapper library over a framework (VIII-2)

2. **Abstraction Proposed**
   - [ ] Phase -1 Gate approval from `system-architect` and `software-developer` (VIII-2)
   - [ ] Gate request includes a multi-framework support justification,
         a team expertise analysis and a migration path (VIII-3)

3. **Runtime Constraint**
   - [ ] Vendor SDK cannot run on the target runtime (VIII-4)
   - [ ] Constraint documented in design.md (VIII-5)
```

**Pass Criteria**:
- [ ] Framework APIs used directly (VIII-1)
- [ ] Any abstraction over a framework has Phase -1 Gate approval (VIII-2) with the analysis VIII-3 requires
- [ ] A project-owned client that exists because the vendor SDK cannot run on the target runtime (VIII-4) has that constraint documented in design.md (VIII-5)

**Failure Action**:
→ Use the framework directly, or submit a Phase -1 Gate request with the VIII-3 analysis

---

## Gate Execution Workflow

```
1. Receive implementation request
    │
    ├── Gate 1: Check steering files exist
    │     └── FAIL? → Run steering skill
    │
    ├── Gate 2: Validate EARS format
    │     └── FAIL? → Run requirements-analyst
    │
    ├── Gate 3: Check testable-core structure (per project profile)
    │     └── FAIL? → Restructure to lib/ first (library, cli) or move logic into a core path (application)
    │
    ├── Gate 4: Confirm test-first commitment
    │     └── FAIL? → Cannot proceed
    │
    ├── Gate 5: Verify traceability setup
    │     └── FAIL? → Create requirements first
    │
    ├── Gate 6: Simplicity check (at most 3 projects)
    │     └── FAIL? → Reduce projects or request Phase -1 Gate approval
    │
    └── Gate 7: Anti-abstraction check
          └── FAIL? → Use the framework directly or request Phase -1 Gate approval
    │
    ▼
ALL GATES PASSED → Proceed to implementation
```

---

## Gate Report Template

```markdown
# Phase -1 Gates Report

**Feature**: [Feature Name]
**Date**: [YYYY-MM-DD]
**Validator**: constitution-enforcer
**Profile**: [library | cli | application]

## Gate Results

| Gate | Status | Notes |
|------|--------|-------|
| 1. Steering Check | ✅ PASS | All files exist |
| 2. EARS Validation | ✅ PASS | 5/5 requirements valid |
| 3. Testable Core | ✅ PASS | Target: lib/auth/ |
| 4. Test-First | ✅ PASS | Commitment confirmed |
| 5. Traceability | ✅ PASS | Requirements exist |
| 6. Simplicity | ✅ PASS | 2 projects (≤ 3) |
| 7. Anti-Abstraction | ✅ PASS | Framework used directly |

## Overall Result: ✅ PASS

Implementation may proceed.

## Next Steps
1. Write tests (test-engineer)
2. Implement code (software-developer)
3. Review (code-reviewer)
```

---

## Gate Failure Escalation

### Automatic Remediation
- Gate 1: Auto-run steering skill
- Gate 2: Auto-run requirements-analyst
- Gate 5: Auto-create requirements template

### Manual Intervention Required
- Gate 3: Requires architectural decision
- Gate 4: Requires developer commitment
- Gate 6: Requires fewer projects or a Phase -1 Gate request
- Gate 7: Requires removing the wrapper or a Phase -1 Gate request

### Blocking Gates
- Gate 4 (Test-First): MUST pass - no exceptions
- Gate 2 (EARS): Blocks when EARS is required for the workflow mode (`ears_required`, medium and large by default); Article IV itself is advisory (CONST-004)

### Waivable Gates (with justification)
- Gate 6 (Simplicity): Waivable with Phase -1 Gate approval and a justification in design.md (VII-2, VII-3)
- Gate 7 (Anti-Abstraction): Waivable with Phase -1 Gate approval (VIII-2, VIII-3), or by a runtime constraint documented in design.md (VIII-4, VIII-5)

### Profile-Dependent Gates
- Gate 3 (Testable Core): Blocks when Article I is critical for the project profile (`library` and `cli` by default); warns for `application` unless `constitution.levels` sets CONST-001 to critical (P-5, P-6)
