# SDD Tasks Command

Break down design into actionable implementation tasks.

---

## Instructions for Claude

You are executing the `/sdd-tasks [feature-name]` command to create a task breakdown document.

### Command Format

```bash
/sdd-tasks authentication
/sdd-tasks payment-processing
/sdd-tasks user-dashboard
```

### Your Task

Generate a comprehensive task breakdown that transforms the design into actionable implementation tasks with full requirements traceability.

---

## Process

### 1. Read Context

**CRITICAL**: Read these files first:

```bash
# Design and Requirements
storage/design/{{feature-name}}-design.md
storage/specs/{{feature-name}}-requirements.md

# Steering Context
steering/structure.md
steering/tech.md
steering/product.md
steering/project.yml   # constitution.profile (library | cli | application)
```

---

### 2. Verify Prerequisites

**Check design file exists**:

```markdown
❌ **Error**: Design document not found

Expected: storage/design/{{feature-name}}-design.md

Please run `/sdd-design {{feature-name}}` first.

Tasks cannot be created without design (Article V: Traceability).
```

**Check requirements file exists**:

```markdown
❌ **Error**: Requirements document not found

Expected: storage/specs/{{feature-name}}-requirements.md

Task breakdown requires requirements for traceability.
```

---

### 3. Generate Task Breakdown

Use template from `templates/tasks.md`.

#### Task Structure

Each task follows this format:

````markdown
### TASK-XXX: [Task Title]

**Priority**: P0/P1/P2/P3
**Story Points**: [1/2/3/5/8/13]
**Estimated Hours**: [N]
**Assignee**: [Unassigned initially]
**Status**: Not Started

**Description**:
[Clear description of what needs to be done]

**Requirements Coverage**:

- REQ-XXX-NNN: [Requirement title]
- REQ-XXX-NNN: [Requirement title]

**Acceptance Criteria**:

- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]

**Dependencies**:

- TASK-XXX: [Dependency description]

**Test-First Checklist** (Article III):

- [ ] Tests written BEFORE implementation (III-1)
- [ ] Red: Failing test committed (III-2)
- [ ] Green: Minimal implementation passes test (III-3)
- [ ] Blue: Refactored with confidence (III-4)

**Implementation Notes**:
[File paths, code snippets, technical details]

**Validation**:

```bash
# Commands to verify task completion
npm test src/{{file}}.test.ts
```
````

---

### 4. Create Task Hierarchy

#### Task Categories (always include):

Read `constitution.profile` from `steering/project.yml` first (`library` when absent, P-2). TASK-001 and TASK-006 depend on it.

**P0 Tasks (Critical - Launch Blockers)**:

1. **TASK-001: Set Up Project Structure (Testable Core, Article I)**
   - `library` / `cli`:
     - Create `lib/{{feature}}/` directory
     - Set up library structure per Article I (I-L1–I-L3)
     - Create CLI interface per Article II (II-L1)
   - `application`:
     - Create core module folder `src/lib/{{feature}}/` with co-located tests, no own `package.json` (I-A1, I-A2)
     - Wire delivery: route handler and server action files under delivery paths that import from the core module (I-A3)

2. **TASK-002: Write Tests for REQ-XXX-001**
   - Red phase (failing tests)
   - Test all acceptance criteria

3. **TASK-003: Implement [Component] (REQ-XXX-001)**
   - Green phase (minimal implementation)
   - Pass all tests from TASK-002

4. **TASK-004: Refactor [Component]**
   - Blue phase (improve design)
   - SOLID principles
   - Tests still pass

5. **TASK-005: Implement Database Repository**
   - Create schema
   - Migrations
   - Integration tests (real database, Article IX)

6. **TASK-006: Implement Automation Interface (Article II)**
   - `library` / `cli`: Implement CLI Interface
     - CLI commands per Article II (II-L1)
     - Help text (II-L2)
     - Error handling, exit codes (II-L4, II-L5)
   - `application`: Implement Route Handlers / Server Actions (no CLI, II-A3)
     - Delegate to core: validate input, authorize, call core, shape response (I-A3)
     - Machine-facing endpoints validate input against a schema (II-A4)
     - Return documented status and error codes (II-A5)

7. **TASK-007: Implement API Endpoints**
   - REST/GraphQL endpoints
   - Input validation
   - Error handling
   - `application`: route handlers are built in TASK-006; use this task only for endpoints not covered there

**P1 Tasks (High - Required for Launch)**:

8. **TASK-008: Write Integration Tests**
   - Real services (Article IX: IX-1)
   - API endpoint tests
   - Coverage ≥ configured threshold, default 80% (III-6)

9. **TASK-009: Implement Caching**
   - Redis/memory cache
   - Cache invalidation

10. **TASK-010: Security Audit**
    - OWASP Top 10
    - Input validation
    - Authentication/authorization

**P2 Tasks (Medium - Nice to Have)**:

11. **TASK-011: Add Pagination**
12. **TASK-012: Add Monitoring**

**P3 Tasks (Low - Future)**:

13. **TASK-013: Performance Optimization**

---

### 5. Follow Test-First Mandate (Article III)

**CRITICAL**: The developer SHALL write each test before the production code that makes it pass (III-1). For EVERY implementation task, create 3 separate tasks: RED (III-2), GREEN (III-3) and BLUE (III-4).

````markdown
### TASK-002: Write Tests for REQ-AUTH-001 (RED)

**Priority**: P0
**Story Points**: 2
**Estimated Hours**: 3

**Description**:
Write failing tests for REQ-AUTH-001 user login functionality.

**Test-First Phase**: ❤️ RED (Failing Tests)

**Acceptance Criteria**:

- [ ] Test file created: `lib/auth/tests/service.test.ts` (`application`: `src/lib/auth/service.test.ts`)
- [ ] Tests for all acceptance criteria from REQ-AUTH-001
- [ ] Tests FAIL (red phase)
- [ ] Tests reference requirement ID: `describe('REQ-AUTH-001: ...')`
- [ ] Git commit: `test: add failing tests for REQ-AUTH-001`

**Implementation Notes**:

```typescript
// lib/auth/tests/service.test.ts
describe('REQ-AUTH-001: User Login', () => {
  it('should authenticate user with valid credentials', async () => {
    const service = new AuthService(mockRepository);
    const result = await service.login({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(result).toHaveProperty('sessionToken');
  });
});
```

---

### TASK-003: Implement AuthService.login (GREEN)

**Priority**: P0
**Story Points**: 5
**Estimated Hours**: 8

**Description**:
Implement minimal code to pass tests from TASK-002.

**Test-First Phase**: 💚 GREEN (Passing Tests)

**Requirements Coverage**:

- REQ-AUTH-001: User login functionality

**Acceptance Criteria**:

- [ ] AuthService class implemented
- [ ] login() method implemented
- [ ] All tests from TASK-002 PASS
- [ ] Code comments reference REQ-AUTH-001
- [ ] Git commit: `feat: implement REQ-AUTH-001 (user login)`

**Dependencies**:

- TASK-002: Tests must exist first

**Implementation Notes**:

```typescript
// lib/auth/src/service.ts
export class AuthService {
  /**
   * REQ-AUTH-001: Authenticate user with credentials
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Minimal implementation to pass tests
    const user = await this.repository.findByEmail(credentials.email);
    if (!user || !(await this.verifyPassword(credentials.password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid credentials');
    }
    const session = await this.createSession(user.id);
    return { sessionToken: session.token };
  }
}
```

---

### TASK-004: Refactor AuthService (BLUE)

**Priority**: P0
**Story Points**: 2
**Estimated Hours**: 3

**Description**:
Refactor AuthService for better design while keeping tests green.

**Test-First Phase**: 💙 BLUE (Refactoring)

**Acceptance Criteria**:

- [ ] Code follows SOLID principles
- [ ] No code duplication
- [ ] Proper error handling
- [ ] All tests STILL PASS
- [ ] Code review passed
- [ ] Git commit: `refactor: improve auth service design`

**Dependencies**:

- TASK-003: Implementation must be complete

**Implementation Notes**:

- Extract password verification to separate class
- Improve error messages
- Add logging
- Add input validation
````

---

### 6. Map Tasks to Requirements (Article V)

Each task breakdown SHALL map its tasks to requirements (V-6). Create **Requirements Coverage Matrix**:

```markdown
## Requirements Coverage Matrix

| Requirement ID | Priority | Tasks                        | Test Coverage | Status      |
| -------------- | -------- | ---------------------------- | ------------- | ----------- |
| REQ-AUTH-001   | P0       | TASK-002, TASK-003, TASK-004 | 95%           | Not Started |
| REQ-AUTH-002   | P0       | TASK-005, TASK-006           | 90%           | Not Started |
| REQ-AUTH-003   | P0       | TASK-007                     | 90%           | Not Started |
| REQ-PERF-001   | P1       | TASK-009                     | 80%           | Not Started |
| REQ-SEC-001    | P1       | TASK-010                     | 100%          | Not Started |

**Coverage Summary**:

- Total Requirements: [N]
- Requirements with Tasks: [N] ([%]%)
- **Coverage Goal**: 100% ✅
```

**Validation**:

- [ ] All requirements have corresponding tasks (V-6)
- [ ] All P0 requirements have P0 tasks
- [ ] No orphan tasks (tasks without requirements) (V-6)

---

### 7. Create Task Dependencies Graph

Show task execution order:

````markdown
## Task Dependencies Graph

```text
TASK-001 (Project Structure)
    ├── TASK-002 (Tests - RED)
    │       └── TASK-003 (Implementation - GREEN)
    │               ├── TASK-004 (Refactor - BLUE)
    │               ├── TASK-006 (CLI or route handlers)
    │               └── TASK-007 (API)
    │                       └── TASK-008 (Integration Tests)
    │                               └── TASK-010 (Security)
    └── TASK-005 (Repository)
            └── TASK-003 (Implementation)
```

**Critical Path**: TASK-001 → TASK-002 → TASK-003 → TASK-007 → TASK-008
````

---

### 8. Sprint Planning

Break tasks into sprints:

```markdown
## Sprint Planning

### Sprint 1 (P0 Core Functionality)

**Goal**: Implement core {{feature}} functionality

**Tasks**:

- TASK-001: Project structure (3 points)
- TASK-002: Tests for REQ-001 (2 points)
- TASK-003: Implement REQ-001 (5 points)
- TASK-004: Refactor (2 points)
- TASK-005: Database repository (5 points)
- TASK-006: CLI interface or route handlers (3 points)
- TASK-007: API endpoints (5 points)

**Total**: 25 story points
**Capacity**: 30 points/sprint
**Risk**: Medium (database complexity)

---

### Sprint 2 (P1 Production Readiness)

**Goal**: Make {{feature}} production-ready

**Tasks**:

- TASK-008: Integration tests (5 points)
- TASK-009: Caching (3 points)
- TASK-010: Security audit (3 points)

**Total**: 11 story points
**Capacity**: 30 points/sprint
**Risk**: Low
```

---

### 9. Estimate Effort

Use **Fibonacci sequence** for story points:

- 1 point = Trivial (1-2 hours)
- 2 points = Small (2-4 hours)
- 3 points = Medium (4-8 hours)
- 5 points = Large (1-2 days)
- 8 points = Very large (2-3 days)
- 13 points = Huge (3-5 days) - consider splitting

**Estimation Guidelines**:

- Include time for testing
- Include time for code review
- Include time for refactoring
- Include buffer for unknowns

---

### 10. Add Constitutional Compliance Checklist

At end of document:

````markdown
## Constitutional Compliance Validation

Before marking feature complete, verify:

### Article I: Testable Core ✅

- [ ] Each feature has a core module (I-1)
- [ ] Core module tests run without the app, a browser or a CLI (I-2)
- [ ] No imports from delivery paths into core paths (I-3)
- [ ] (`library`, `cli`) All features implemented in `lib/{{feature}}/` (I-L1)
- [ ] (`library`, `cli`) Library has independent test suite (I-L2)
- [ ] (`library`, `cli`) Library exports public API (I-L3)
- [ ] (`application`) Core module under a core path, e.g. `src/lib/{{feature}}/` (I-A1)
- [ ] (`application`) Route handlers and server actions delegate to core (I-A3)
- [ ] (`application`) No UI-only code in core paths (I-A4)

### Article II: Automation Interface ✅

- [ ] All major operations callable without the UI (II-1)
- [ ] (`library`, `cli`) CLI interface implemented (II-L1)
- [ ] (`library`, `cli`) Help text provided (II-L2)
- [ ] (`application`) Machine-facing endpoints validate input against a schema (II-A4)
- [ ] (`application`) Machine-facing endpoints return documented status and error codes (II-A5)
- [ ] (`application`) All `package.json` scripts resolve to existing files (II-A10)

### Article III: Test-First ✅

- [ ] Tests written BEFORE implementation (III-1)
- [ ] Git history shows Red-Green-Blue cycle (III-2–III-4)
- [ ] All tests passing

### Article V: Traceability ✅

- [ ] All requirements mapped to tasks (V-6)
- [ ] All tasks mapped to code
- [ ] All code mapped to tests
- [ ] 100% coverage achieved

### Article IX: Integration Testing ✅

- [ ] Integration tests use real database (IX-1, IX-2)
- [ ] Integration tests use real cache (IX-1)
- [ ] Mocks justified (if used) (IX-4, IX-5)

**Validation Commands**:

```bash
@traceability-auditor validate requirements.md tasks.md src/
@constitution-enforcer validate src/
@code-reviewer review src/
```
````

---

### 11. Save Task Breakdown

Save to: `storage/tasks/{{feature-name}}-tasks.md`

**File Naming**:

- Match requirements and design files

---

### 12. Generate Summary

```markdown
## ✅ Task Breakdown Complete

**Feature**: {{FEATURE_NAME}}
**File**: storage/tasks/{{feature-name}}-tasks.md

### Summary:

- **Total Tasks**: [N]
  - P0 (Critical): [N] tasks, [N] story points
  - P1 (High): [N] tasks, [N] story points
  - P2 (Medium): [N] tasks, [N] story points
  - P3 (Low): [N] tasks, [N] story points

### Sprint Allocation:

- Sprint 1: [N] tasks ([N] points)
- Sprint 2: [N] tasks ([N] points)
- Sprint 3: [N] tasks ([N] points)

### Requirements Coverage:

- Total Requirements: [N]
- Requirements with Tasks: [N] (100% ✅)

### Test-First Tasks:

- RED (Test) tasks: [N]
- GREEN (Implement) tasks: [N]
- BLUE (Refactor) tasks: [N]

### Estimated Effort:

- Total Story Points: [N]
- Total Hours: [N]
- Team Capacity: [N] points/sprint
- Estimated Duration: [N] sprints

### Constitutional Compliance:

- ✅ Article I: Testable Core structure planned (profile: [library / cli / application])
- ✅ Article II: Automation Interface tasks included (CLI or route handlers)
- ✅ Article III: Test-first tasks (Red-Green-Blue)
- ✅ Article V: 100% requirements coverage
- ✅ Article IX: Integration test tasks with real services

### Critical Path:

TASK-001 → TASK-002 → TASK-003 → TASK-007 → TASK-008

### Next Steps:

1. Review task breakdown with team
2. Allocate tasks to developers
3. Begin Sprint 1 implementation
4. OR use orchestrator: `@orchestrator implement {{feature-name}}`
```

---

## Tool Usage

### Required:

- **Read**: Design, requirements, steering files
- **Write**: Task breakdown document

### Optional:

- **AskUserQuestion**: Get team capacity, sprint length

---

## Validation Checklist

Before completing:

- [ ] All requirements have corresponding tasks (V-6)
- [ ] Test-First tasks (Red-Green-Blue) for all implementations (III-2–III-4)
- [ ] Task dependencies identified
- [ ] Story points estimated
- [ ] Sprint allocation complete
- [ ] Requirements coverage matrix 100%
- [ ] Constitutional compliance checklist included
- [ ] Document saved to storage/specs/
- [ ] Summary presented

---

## Edge Cases

### Missing Design

```markdown
❌ **Error**: Design document not found

Expected: storage/design/{{feature-name}}-design.md

Please run `/sdd-design {{feature-name}}` first.
```

### No Requirements

```markdown
❌ **Error**: Requirements document not found

Expected: storage/specs/{{feature-name}}-requirements.md

Task breakdown requires requirements for traceability.
```

---

**Execution**: Begin task breakdown generation now for the specified feature.
