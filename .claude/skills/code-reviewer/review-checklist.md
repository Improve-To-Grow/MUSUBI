# Code Review Checklist

## Overview

A comprehensive checklist for conducting effective code reviews in MUSUBI SDD projects.

---

## Pre-Review Checks

### Before Starting Review
- [ ] PR/MR description clearly explains the change
- [ ] Linked requirements/issues are referenced
- [ ] CI/CD pipeline passes
- [ ] Tests are included and passing
- [ ] Documentation is updated if needed

---

## Code Quality Checklist

### 1. Functionality
- [ ] Code implements the requirements correctly
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logic errors
- [ ] Code works as intended (manually verified if needed)

### 2. Design & Architecture
- [ ] Follows existing architecture patterns (check `steering/structure.md`)
- [ ] SOLID principles are applied appropriately
- [ ] No unnecessary complexity
- [ ] No more than 3 projects (deployable units) without Phase -1 Gate approval (Article VII: Simplicity Gate, VII-1, VII-2)
- [ ] Framework APIs used directly; no custom wrapper over a framework without Phase -1 Gate approval (Article VIII: Anti-Abstraction, VIII-1, VIII-2)
- [ ] Testable-core principle followed for the project profile (Article I)

### 3. Code Style
- [ ] Consistent naming conventions
- [ ] Proper indentation and formatting
- [ ] Comments explain "why", not "what"
- [ ] No commented-out code
- [ ] No debug/console statements left behind

### 4. Testing
- [ ] Tests written before implementation (Article III, III-1)
- [ ] Unit tests cover core logic
- [ ] Integration tests verify component interaction
- [ ] Test names clearly describe behavior
- [ ] Edge cases and error paths are tested

### 5. Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation present
- [ ] Output encoding for user-facing data
- [ ] SQL/NoSQL injection prevention
- [ ] Authentication/authorization checked

### 6. Performance
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] No N+1 query problems
- [ ] Appropriate caching used
- [ ] Large operations are async/background

### 7. Maintainability
- [ ] Code is readable and self-documenting
- [ ] Functions/methods have at most 50 lines of code and source files at most 500 lines of code and 10 imports, or the configured limits (Article VII, VII-4–VII-6)
- [ ] No code duplication
- [ ] Dependencies are justified
- [ ] Easy to modify/extend

---

## Review Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| 🔴 **Blocker** | Critical issue, must fix | Request changes |
| 🟠 **Major** | Significant issue, should fix | Request changes |
| 🟡 **Minor** | Small issue, nice to fix | Approve with comments |
| 🔵 **Suggestion** | Optional improvement | Approve with comments |
| 💬 **Question** | Need clarification | Comment |
| 👍 **Praise** | Good implementation | Comment |

---

## Review Comment Templates

### Blocker
```
🔴 **Blocker**: [Description]

This needs to be fixed before merge because [reason].

**Suggested fix:**
```code
// Example fix
```
```

### Major Issue
```
🟠 **Major**: [Description]

This could cause [problem]. Consider [alternative approach].
```

### Minor Issue
```
🟡 **Minor**: [Description]

Not critical, but would improve [aspect].
```

### Suggestion
```
🔵 **Suggestion**: [Description]

Optional: This could be improved by [suggestion].
```

### Praise
```
👍 Nice implementation of [feature]. Clean and readable!
```

---

## Constitutional Compliance Check

During review, verify (read `constitution.profile` from `steering/project.yml` first; default `library`):

- [ ] **Article I**: Testable Core - Feature logic in a core module with tests that run without the UI, server or CLI; no imports from delivery paths (I-1–I-3)? Exported functions and classes of core modules have doc comments (I-5, advisory)?
  - `library`, `cli`: Feature in `lib/` directory (I-L1)?
  - `application`: Feature logic in a core path such as `src/lib/<domain>/`, no components or React hooks there; route handlers delegate to core (I-A3, I-A4)?
- [ ] **Article II**: Automation Interface - Primary operations reachable without the UI (II-1)?
  - `library`, `cli`: Library has CLI entry point with `--help` (II-L1, II-L2)?
  - `application`: Machine-facing endpoints validate input against a schema; `package.json` scripts resolve (II-A4, II-A10)?
- [ ] **Article III**: Test-First - Tests committed before code (III-1); every EARS requirement has a test (III-5)?
- [ ] **Article IV**: EARS - Requirements use an EARS pattern and include acceptance criteria (IV-1, IV-3)?
- [ ] **Article V**: Traceability - REQ-ID referenced in code and tests (V-2, V-4)?
- [ ] **Article VI**: Project Memory - Steering files consulted (VI-4)?
- [ ] **Article VII**: Simplicity - At most 3 projects, or Phase -1 Gate approval for more (VII-1, VII-2)? Source files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10, or the configured limits (VII-4–VII-6; a warning, not a Phase -1 Gate item)?
- [ ] **Article VIII**: Anti-Abstraction - Framework APIs used directly; any wrapper has Phase -1 Gate approval or is a runtime-constraint client documented in design.md (VIII-1, VIII-2, VIII-4, VIII-5)?
- [ ] **Article IX**: Integration-First - Integration tests use real services; each mock justified (IX-1, IX-4, IX-5)?

---

## Language-Specific Checks

### TypeScript/JavaScript
- [ ] Types are properly defined (no `any`)
- [ ] Async/await used correctly
- [ ] Error handling with try/catch
- [ ] No memory leaks (cleanup in useEffect, etc.)
- [ ] Imports are organized

### Python
- [ ] Type hints present
- [ ] Docstrings for public functions
- [ ] Context managers used for resources
- [ ] No mutable default arguments
- [ ] PEP 8 style followed

### SQL
- [ ] Parameterized queries (no string concatenation)
- [ ] Indexes for frequently queried columns
- [ ] Appropriate transaction boundaries
- [ ] No SELECT * in production code
- [ ] Migrations are reversible

---

## Review Outcome

### Approve ✅
- All blockers resolved
- All major issues resolved
- Minor issues acknowledged (can be fixed later)

### Request Changes 🔄
- Blockers or major issues exist
- Clearly list what needs to change
- Be specific and constructive

### Comment 💬
- Need more information
- Questions about approach
- Discussion needed before decision
