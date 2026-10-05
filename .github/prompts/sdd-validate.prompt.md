# SDD Validate Command

Validate constitutional compliance and requirements coverage.

---

## Instructions for Claude

You are executing the `/sdd-validate [feature-name]` command to validate constitutional compliance and requirements coverage for a feature.

### Command Format

```bash
/sdd-validate authentication
/sdd-validate payment-processing
/sdd-validate user-dashboard
```

### Your Task

Perform comprehensive validation of the feature implementation against:

1. Constitutional Articles (9 articles)
2. Requirements coverage (100% traceability)
3. Code quality standards
4. Security standards
5. Test coverage

---

## Process

### 1. Read All Documentation

```bash
# Requirements and Design
storage/specs/{{feature-name}}-requirements.md
storage/design/{{feature-name}}-design.md
storage/tasks/{{feature-name}}-tasks.md

# Steering Context
steering/structure.md
steering/tech.md
steering/product.md
steering/project.yml          # constitution.profile, core_paths, delivery_paths
steering/rules/constitution.md

# Source Code (library / cli profile)
lib/{{feature}}/src/**/*.ts
lib/{{feature}}/tests/**/*.test.ts
app/api/{{resource}}/**/*.ts

# Source Code (application profile: core paths and delivery paths from steering/project.yml)
src/lib/{{feature}}/**/*.ts
src/app/api/{{resource}}/**/*.ts
```

---

### 2. Constitutional Validation

Validate each of the 9 Constitutional Articles.

**Determine the project profile first** (see "Project Profiles" in `steering/rules/constitution.md`):

1. Read `constitution.profile`, `core_paths`, `delivery_paths`, `adapter_paths` and `levels` from `steering/project.yml`
2. IF no profile is declared, THEN apply the `library` profile (P-2); IF a `library` or `cli` project declares no `core_paths`, THEN use `lib/` and `packages/` (P-3)
3. Determine the level of Articles I and II: the profile default (P-5) unless `constitution.levels` overrides it (P-6)

| Article        | `library` | `cli`    | `application` |
| -------------- | --------- | -------- | ------------- |
| I (CONST-001)  | critical  | critical | advisory      |
| II (CONST-002) | advisory  | critical | advisory      |

A violation in a critical article is blocking (❌ FAIL). A violation in an advisory article, or of a requirement tagged _(advisory)_, is a warning (⚠️ WARNING).

#### Article I: Testable-Core Principle

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **I-1** The project SHALL place feature logic under a core path.
- **I-2** Each core module SHALL have tests that run without starting the app, a browser or a CLI.
- **I-3** A core module SHALL NOT import from a delivery path.
- **I-5** Each exported function and class of a core module SHALL have a doc comment (`/** … */`) directly above its declaration. _(advisory)_
- **I-L1** WHERE the project profile is `library` or `cli`, each feature SHALL start as a standalone library under a core path (by default `lib/<feature>/` or `packages/<feature>/`, see P-3).
- **I-A4** WHERE the project profile is `application`, a core path SHALL NOT contain UI-only code (components, React hooks, providers).

**Level**: critical for `library` and `cli`, advisory for `application` (P-5), unless `constitution.levels.CONST-001` overrides it (P-6).

**Validation Steps**:

1. All profiles:
   - [ ] Feature logic lives under a core path (I-1)
   - [ ] Core module tests run without the app, a browser or a CLI (I-2)
   - [ ] No imports from delivery paths into core paths (I-3): grep the core paths for imports from each delivery path
   - [ ] Each exported function and class in a core path has a doc comment (`/** … */`) directly above its declaration (I-5, advisory: a warning, never a block)
   - Direct use of a framework or platform SDK in core is not a violation (I-4)
2. WHERE the profile is `library` or `cli`, verify library structure:
   - [ ] `lib/{{feature}}/` directory exists (I-L1)
   - [ ] `lib/{{feature}}/src/` exists
   - [ ] `lib/{{feature}}/tests/` exists (I-L2)
   - [ ] `lib/{{feature}}/package.json` exists (I-L4, I-L5)
   - [ ] Public API exported via `src/index.ts` (I-L3)
   - [ ] NO dependencies on application code (I-L6): grep for imports from `app/`, `pages/`, etc.; the library should only import from its own `src/` or external packages
3. WHERE the profile is `application`, verify the core module:
   - [ ] Core module is a folder under a core path, e.g. `src/lib/{{feature}}/` (I-A1); no own `package.json`, deployment or publication required (I-A2)
   - [ ] No UI-only code in core paths (I-A4): no components (`*.tsx`), React hooks or providers
   - [ ] Route handlers and server actions delegate to core (I-A3, advisory)
   - [ ] Request-context APIs (`next/headers`, `next/server`) only in delivery or adapter paths (I-A5, advisory)

**Example Output** (`library` / `cli` profile):

```markdown
### Article I: Testable-Core Principle

**Profile**: library (Article I level: critical)
**Status**: ✅ PASS

**Evidence**:

- Library location: `lib/auth/` (I-L1)
- Public API: `lib/auth/src/index.ts` (I-L3)
- Independent tests: `lib/auth/tests/` (I-L2)
- No application dependencies found (I-L6)

**Files Checked**:

- lib/auth/src/service.ts
- lib/auth/src/repository.ts
- lib/auth/src/index.ts
```

**Example Output** (`application` profile):

```markdown
### Article I: Testable-Core Principle

**Profile**: application (Article I level: advisory)
**Status**: ✅ PASS

**Evidence**:

- Core module: `src/lib/auth/` (I-A1)
- Co-located tests: `src/lib/auth/*.test.ts`, run without the app server (I-2)
- No imports from `src/app/`, `src/components/`, `src/hooks/` into `src/lib/` (I-3)
- No UI-only code in core paths (I-A4)
- Route handler `src/app/api/auth/login/route.ts` validates input and calls core (I-A3)
```

**OR if violation** (`library` / `cli` profile):

```markdown
### Article I: Testable-Core Principle

**Profile**: library (Article I level: critical)
**Status**: ❌ FAIL

**Violations**:

1. Feature implemented in `app/components/` instead of `lib/` (I-L1)
2. Missing independent test suite (I-L2)

**Required Actions**:

- Move feature to `lib/{{feature}}/`
- Create independent test suite
- Expose public API via `src/index.ts`
```

**OR if violation** (`application` profile, Article I advisory by default):

```markdown
### Article I: Testable-Core Principle

**Profile**: application (Article I level: advisory)
**Status**: ⚠️ WARNING

**Violations**:

1. `src/lib/auth/session.ts` imports from `src/components/` (I-3)
2. `src/lib/auth/LoginForm.tsx`: UI component in a core path (I-A4)

**Required Actions**:

- Move UI code to a delivery path (`src/components/`)
- Remove the delivery-path import from core
```

---

#### Article II: Automation Interface Mandate

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **II-1** The project SHALL make each feature's primary operations callable without the UI.
- **II-4** IF an operation called through the automation interface fails, THEN the interface SHALL return a machine-readable error (a non-zero exit code, or an HTTP status plus an error code).
- **II-L1** WHERE the project profile is `library` or `cli`, each library SHALL provide a CLI that exposes its primary functionality.
- **II-A1** WHERE the project profile is `application`, the project SHALL provide its automation interface as an HTTP API (route handlers).
- **II-A4** WHERE the project profile is `application`, WHEN a machine-facing endpoint (webhook, n8n flow, integration) receives a request, the endpoint SHALL validate the input against a schema.
- **II-A10** WHERE the project profile is `application`, each `package.json` script SHALL reference a file that exists.

**Level**: advisory for `library`, critical for `cli`, advisory for `application` (P-5), unless `constitution.levels.CONST-002` overrides it (P-6).

**Validation Steps**:

1. WHERE the profile is `library` or `cli`:
   1. Check `lib/{{feature}}/cli.ts` exists (II-L1)
   2. Verify CLI functionality:
      - [ ] Executable shebang (`#!/usr/bin/env node`)
      - [ ] Help text (`--help` flag) with usage examples (II-L2)
      - [ ] Commands for primary operations (II-L1)
      - [ ] Same flag for the same option across commands (II-L3)
      - [ ] Proper exit codes (0=success, non-zero=error) (II-L4, II-L5)
   3. Test CLI:
      ```bash
      ./lib/{{feature}}/cli.ts --help
      ```
2. WHERE the profile is `application` (no CLI required, II-A3):
   - [ ] Primary operations reachable through route handlers (II-A1), or a core function for internal callers and tests (II-A2)
   - [ ] Machine-facing endpoints (webhooks, n8n, integrations) validate input against a schema, e.g. zod (II-A4)
   - [ ] Machine-facing endpoints return their documented status and error codes (II-A5)
   - [ ] Every `package.json` script references an existing file (II-A10)
   - [ ] Ops tasks are `scripts/` registered in `package.json`, with `--help`, an explicit target environment and a dry run for production writes (II-A6–II-A9, advisory)

**Example Output** (`library` / `cli` profile):

````markdown
### Article II: Automation Interface Mandate

**Profile**: cli (Article II level: critical)
**Status**: ✅ PASS

**Evidence**:

- CLI file: `lib/auth/cli.ts` (II-L1)
- Commands: create-user, login, logout, validate-session
- Help text: ✅ Available via `--help` (II-L2)
- Exit codes: ✅ Proper handling (II-L4, II-L5)

**CLI Test**:

```bash
$ ./lib/auth/cli.ts --help
Usage: auth [command] [options]

Commands:
  create-user    Create a new user
  login          Authenticate user
  logout         End user session
  validate-session  Validate session token

Options:
  -h, --help     Display help
  -v, --version  Display version
```
````

**Example Output** (`application` profile):

```markdown
### Article II: Automation Interface Mandate

**Profile**: application (Article II level: advisory)
**Status**: ⚠️ WARNING

**Evidence**:

- HTTP API: `src/app/api/auth/login/route.ts` calls `src/lib/auth/` (II-A1)
- Schema validation: ✅ zod schema on `src/app/api/webhooks/n8n/route.ts` (II-A4)
- Error responses: ✅ status plus error code, e.g. `400 { "code": "INVALID_INPUT" }` (II-4, II-A5)
- CLI: not required (II-A3)

**Findings**:

1. `package.json` script `db:seed` references `scripts/seed.ts`, which does not exist (II-A10)
```

---

#### Article III: Test-First Imperative

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **III-1** The developer SHALL write each test before the production code that makes it pass.
- **III-2** WHEN the developer starts a new behavior, the developer SHALL first write a test that fails (**Red**).
- **III-3** WHEN a failing test exists, the developer SHALL write the minimal code that makes it pass (**Green**).
- **III-4** WHEN the test passes, the developer SHALL refactor while keeping all tests passing (**Blue**).
- **III-5** The test suite SHALL cover every EARS requirement of the feature.
- **III-6** The test suite SHALL reach the configured coverage threshold (`coverage_threshold` in `steering/rules/constitution-levels.yml`, default 80%).
- **III-7** Integration tests SHALL use real services, as Article IX defines.

**Validation Steps**:

1. Check git history for Red-Green-Blue pattern (III-1):
   ```bash
   git log --oneline lib/{{feature}}/
   ```
2. Verify test commits BEFORE implementation commits:
   - `test: add failing tests for REQ-XXX-001` (RED, III-2)
   - `feat: implement REQ-XXX-001` (GREEN, III-3)
   - `refactor: improve {{component}}` (BLUE, III-4)
3. Verify that every EARS requirement has at least one test (III-5)
4. Check test coverage ≥ the configured threshold, default 80% (III-6):
   ```bash
   npm test -- --coverage
   ```
5. Integration tests use real services (III-7): see Article IX

**Example Output**:

````markdown
### Article III: Test-First Imperative

**Status**: ✅ PASS

**Evidence from Git History**:

```
abc123f test: add failing tests for REQ-AUTH-001
def456g feat: implement REQ-AUTH-001 (user login)
ghi789h refactor: extract validator from auth service
```

**Red-Green-Blue Cycle**: ✅ Verified in git history

**Test Coverage**:

- Statements: 92%
- Branches: 88%
- Functions: 95%
- Lines: 91%
- **Overall**: 91.5% ✅ (target: 80%)
````

---

#### Article IV: EARS Requirements Format

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **IV-1** Each requirement SHALL use one of the 5 EARS patterns:
  1. **Event-driven**: `WHEN [event], the [system] SHALL [response]`
  2. **State-driven**: `WHILE [state], the [system] SHALL [response]`
  3. **Unwanted behavior**: `IF [error], THEN the [system] SHALL [response]`
  4. **Optional features**: `WHERE [feature enabled], the [system] SHALL [response]`
  5. **Ubiquitous**: `The [system] SHALL [requirement]`
- **IV-2** Each requirement SHALL have a single interpretation.
- **IV-3** Each requirement SHALL include acceptance criteria.
- **IV-4** Each requirement SHALL be traceable to design and tests (see Article V).

**Validation Steps**:

1. Read `storage/specs/{{feature-name}}-requirements.md`
2. Check that each requirement matches one of the 5 EARS patterns of IV-1, and count the requirements per pattern
3. Verify keywords:
   - [ ] Uses SHALL/SHALL NOT (not SHOULD/MUST/MAY) (IV-1)
   - [ ] No ambiguous language: each requirement has a single interpretation (IV-2)
4. Verify structure:
   - [ ] Unique IDs (REQ-XXX-NNN)
   - [ ] Acceptance criteria defined (IV-3)
   - [ ] Testable and measurable
   - [ ] Traceable to design and tests (IV-4): see Article V

**Example Output**:

````markdown
### Article IV: EARS Requirements Format

**Status**: ✅ PASS

**Requirements Checked**: 15

**EARS Patterns Used**:

- Ubiquitous: 5 requirements
- Event-driven: 7 requirements
- State-driven: 1 requirement
- Unwanted behavior: 2 requirements
- Optional feature: 0 requirements

**Keyword Compliance**:

- ✅ All requirements use SHALL/SHALL NOT
- ✅ No ambiguous keywords found (SHOULD, MUST, MAY)

**Sample Requirement**:

```markdown
### REQ-AUTH-001: User Login

WHEN a user provides valid credentials,
the authentication system SHALL authenticate the user
AND the system SHALL create a session.

**Acceptance Criteria**:

- Email and password validated
- Session created with 24-hour expiry
```

✅ Valid EARS format (Event-driven pattern)
````

---

#### Article V: Traceability Mandate

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **V-1** Each requirement SHALL map to at least one design decision (architecture, API, database).
- **V-2** Each requirement SHALL map to its implementation (source files, functions).
- **V-3** Each requirement SHALL map to at least one test (test case, scenario).
- **V-4** Each test SHALL reference the ID of the requirement it verifies.
- **V-5** Each design document SHALL include a requirements coverage matrix.
- **V-6** Each task breakdown SHALL map its tasks to requirements.

**Validation Steps**:

1. Extract all requirement IDs from requirements.md
2. For each requirement, verify:
   - [ ] Mapped in design.md (V-1), which includes a requirements coverage matrix (V-5)
   - [ ] Mapped to tasks in tasks.md (V-6)
   - [ ] Implemented in code (grep for REQ-XXX-NNN in source) (V-2)
   - [ ] Tested, with the requirement ID in the test (grep for REQ-XXX-NNN in tests) (V-3, V-4)
3. Calculate coverage percentages
4. Identify gaps

**Example Output**:

```markdown
### Article V: Traceability Mandate

**Status**: ✅ PASS

**Traceability Matrix**:

| Requirement  | Design                     | Code                           | Tests                                     | Status   |
| ------------ | -------------------------- | ------------------------------ | ----------------------------------------- | -------- |
| REQ-AUTH-001 | ✅ design.md#auth-service  | ✅ lib/auth/src/service.ts:45  | ✅ lib/auth/tests/service.test.ts:23      | Complete |
| REQ-AUTH-002 | ✅ design.md#password-hash | ✅ lib/auth/src/password.ts:12 | ✅ lib/auth/tests/password.test.ts:8      | Complete |
| REQ-AUTH-003 | ✅ design.md#session-mgmt  | ✅ lib/auth/src/service.ts:89  | ✅ lib/auth/tests/service.test.ts:67      | Complete |
| REQ-PERF-001 | ✅ design.md#caching       | ✅ lib/auth/src/cache.ts:23    | ✅ lib/auth/tests/integration.test.ts:112 | Complete |
| REQ-SEC-001  | ✅ design.md#security      | ✅ lib/auth/src/password.ts:34 | ✅ lib/auth/tests/security.test.ts:45     | Complete |

**Coverage Summary**:

- Total Requirements: 5
- Requirements → Design: 5 (100% ✅)
- Requirements → Code: 5 (100% ✅)
- Requirements → Tests: 5 (100% ✅)
- **Overall Coverage**: 100% ✅

**Gap Analysis**: No gaps detected
```

**OR if gaps detected**:

```markdown
### Article V: Traceability Mandate

**Status**: ❌ FAIL

**Gaps Detected**:

1. REQ-AUTH-004: No test coverage found
2. REQ-PERF-001: Not implemented in code
3. REQ-SEC-002: Not mentioned in design

**Coverage Summary**:

- Requirements → Design: 4/5 (80%)
- Requirements → Code: 4/5 (80%)
- Requirements → Tests: 3/5 (60%) ❌

**Required Actions**:

- Add tests for REQ-AUTH-004
- Implement REQ-PERF-001
- Update design.md to cover REQ-SEC-002
```

---

#### Article VI: Project Memory (Steering System)

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **VI-1** `steering/structure.md` SHALL define the architecture patterns.
- **VI-2** `steering/tech.md` SHALL define the technology stack.
- **VI-3** `steering/product.md` SHALL define the business context.
- **VI-4** WHEN a skill starts executing, the skill SHALL read the steering files first.
- **VI-5** WHEN the architecture, technology stack or business context changes, the project SHALL update the affected steering files.
- **VI-6** WHEN a change to a steering file is proposed, the project SHALL obtain stakeholder approval before applying it.

**Validation Steps**:

1. Verify steering files exist (VI-1–VI-3) and are current (VI-5)
2. Check if implementation aligns with steering:
   - Architecture pattern from `steering/structure.md` (VI-1)
   - Technology stack from `steering/tech.md` (VI-2)
   - Product goals from `steering/product.md` (VI-3)
3. Verify that changes to steering files were approved (VI-6)

**Example Output**:

```markdown
### Article VI: Project Memory

**Status**: ✅ PASS

**Steering Alignment**:

**Architecture (steering/structure.md)**:

- Expected: Library-first pattern
- Actual: ✅ Feature implemented as library (`lib/auth/`)

**Technology Stack (steering/tech.md)**:

- Expected: TypeScript, Next.js, PostgreSQL, Prisma
- Actual: ✅ All technologies used correctly

**Product Context (steering/product.md)**:

- Product Goal: B2B SaaS authentication
- Feature Alignment: ✅ Implements user authentication for B2B use case
```

---

#### Article VII: Simplicity Gate (Phase -1)

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **VII-1** The initial architecture SHALL NOT exceed 3 projects.
- **VII-2** IF a design needs more than 3 projects, THEN implementation of the additional projects SHALL NOT begin before Phase -1 Gate approval.
- **VII-3** IF a design needs more than 3 projects, THEN design.md SHALL justify each additional project with business requirements, technical constraints and a team capacity analysis.
- **VII-4** Each source file SHALL contain at most the configured maximum of lines of code (`code_limits.max_file_lines` in `steering/rules/constitution-levels.yml`, default 500).
- **VII-5** Each function SHALL contain at most the configured maximum of lines of code (`code_limits.max_function_lines`, default 50).
- **VII-6** Each source file other than an `index` file SHALL import at most the configured maximum of distinct modules (`code_limits.max_imports`, default 10).

**Level**: Article VII (CONST-007) is flexible. Only the project limit needs a Phase -1 Gate (VII-2). The code-size limits (VII-4–VII-6) are not Phase -1 Gate items: a violation is reported at Article VII's level, as a warning (⚠️ WARNING) unless the project promotes CONST-007 in `constitution.levels` (P-6).

**Validation Steps**:

1. Count projects, i.e. independently deployable units (VII-1)
2. If > 3, check for Phase -1 Gate approval before work on the additional projects began (VII-2), and for the justification of each additional project in design.md (VII-3)
3. Check the code-size limits of the source files in core and delivery paths (tests, type declarations and generated, vendored or template files are not source files; a line of code is a line with something other than whitespace and comments):
   - [ ] Each source file has at most 500 lines of code (VII-4)
   - [ ] Each function has at most 50 lines of code, nested functions included (VII-5)
   - [ ] Each source file other than an `index` file imports at most 10 distinct modules (VII-6)
   - The numbers are the defaults. Use the configured limits when set: `code_limits` in `steering/rules/constitution-levels.yml`, overridden per project by `constitution.overrides.code_limits` in `steering/project.yml` (e.g. `max_function_lines: 80`)
   - Measure with `musubi-validate project`, which reports the source files, functions and import lists over the configured limits

**Example Output**:

```markdown
### Article VII: Simplicity Gate

**Status**: ✅ PASS

**Project Count**: 1 (monorepo with libraries)

**Projects**:

1. Main application (Next.js with libraries)

**Within Limit**: ✅ (≤ 3)

**Code-Size Limits** (VII-4–VII-6, defaults): ✅ 14 source files within 500 lines of code per file, 50 per function and 10 imports
```

**OR if a code-size limit is exceeded** (no Phase -1 Gate needed):

```markdown
### Article VII: Simplicity Gate

**Status**: ⚠️ WARNING

**Project Count**: 1 ✅ (≤ 3)

**Code-Size Findings**:

1. `lib/auth/src/service.ts`: function `login` has 68 lines of code (limit 50, VII-5)

**Required Actions**:

- Split `login` into smaller functions, or raise `max_function_lines` in `constitution.overrides.code_limits` (`steering/project.yml`)
```

---

#### Article VIII: Anti-Abstraction Gate (Phase -1)

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **VIII-1** The project SHALL call framework APIs directly.
- **VIII-2** The project SHALL NOT build a custom abstraction layer or wrapper library over a framework without Phase -1 Gate approval, except for a runtime-constraint client (VIII-4).
- **VIII-3** IF a design proposes an abstraction over a framework, THEN its Phase -1 Gate request SHALL include a multi-framework support justification, a team expertise analysis and a migration path.
- **VIII-4** IF the vendor SDK cannot run on the target runtime (e.g. `firebase-admin` on Cloudflare Workers), THEN the `constitution-enforcer` SHALL accept a project-owned client for that service as a valid abstraction.
- **VIII-5** WHERE a project-owned client exists because of a runtime constraint, design.md SHALL document that constraint.

**Validation Steps**:

1. Check that framework APIs are called directly (VIII-1), and search for custom abstraction layers or wrapper libraries over a framework (VIII-2):
   - Custom ORM wrappers
   - Custom HTTP client wrappers
   - Custom logging abstractions
2. If found, verify Phase -1 Gate approval (VIII-2), with a gate request that includes a multi-framework support justification, a team expertise analysis and a migration path (VIII-3)
3. Runtime constraint: IF the vendor SDK cannot run on the target runtime, THEN accept a project-owned client for that service as a valid abstraction without gate approval (VIII-4), and check that design.md documents the constraint (VIII-5)

**Example Output**:

```markdown
### Article VIII: Anti-Abstraction Gate

**Status**: ✅ PASS

**Framework Usage Analysis**:

- **ORM**: Uses Prisma directly ✅ (no custom wrapper)
- **Password Hashing**: Uses bcrypt directly ✅
- **HTTP**: Uses Next.js API routes directly ✅
- **Validation**: Uses Zod directly ✅

**Custom Abstractions**: None detected ✅
```

**OR if violation**:

```markdown
### Article VIII: Anti-Abstraction Gate

**Status**: ⚠️ WARNING

**Custom Abstractions Detected**:

1. `lib/database/wrapper.ts` - Custom Prisma wrapper

**Phase -1 Gate Approval**: ❌ Not found in design.md

**Required Actions**:

- Justify abstraction in a Phase -1 Gate request: multi-framework support need, team expertise and migration path (VIII-3); or document a runtime constraint in design.md (VIII-4, VIII-5)
- OR remove abstraction and use Prisma directly
- Document in design.md ADR
- Get approval from @system-architect + @software-developer
```

---

#### Article IX: Integration-First Testing

**Requirement** (EARS, from `steering/rules/constitution.md`):

- **IX-1** Integration tests SHALL use real databases, APIs and services.
- **IX-2** Each test database SHALL be isolated (container or test schema).
- **IX-3** Integration tests SHALL call external APIs through their sandbox or test environments.
- **IX-4** Integration tests SHALL NOT mock a service unless the service is unavailable in the test environment, has usage limits or costs, or has no test environment.
- **IX-5** WHERE a test uses a mock, the test documentation SHALL justify that mock.

**Validation Steps**:

1. Check integration tests use real services (IX-1, III-7):
   - Real database, isolated (Docker, test schema) (IX-2)
   - Real cache (Redis test instance)
   - Real external APIs (sandbox environments) (IX-3)
2. Verify that each mock covers a service that is unavailable in the test environment, has usage limits or costs, or has no test environment (IX-4), and that the test documentation justifies it (IX-5)

**Example Output**:

````markdown
### Article IX: Integration-First Testing

**Status**: ✅ PASS

**Integration Tests Analysis**:

**Database Tests**:

- Uses: Real PostgreSQL (Docker Compose)
- Evidence: `lib/auth/tests/integration.test.ts:12`

```typescript
beforeAll(async () => {
  prisma = new PrismaClient({
    datasourceUrl: process.env.TEST_DATABASE_URL, // Real DB
  });
});
```

- ✅ Real database confirmed

**Cache Tests**:

- Uses: Real Redis (Docker Compose)
- ✅ Real cache confirmed

**External API Tests**:

- Payment API: Uses sandbox environment ✅
- Email API: **Mock** ⚠️
  - Justification: No test environment available ✅
  - Documented in: `tests/README.md`

**Mock Usage**: 1 justified mock found (Email API)

- ✅ Justification documented
````

---

### 3. Code Quality Validation

Run code quality checks:

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Code review
@code-reviewer review lib/{{feature}}/src/
```

**Example Output**:

```markdown
## Code Quality Validation

**Linting**: ✅ No issues (ESLint)
**Type Checking**: ✅ No errors (TypeScript)
**Code Review**: ✅ Passed

**SOLID Principles**:

- Single Responsibility: ✅ Each class has one responsibility
- Open/Closed: ✅ Open for extension, closed for modification
- Liskov Substitution: ✅ Proper inheritance
- Interface Segregation: ✅ Small, focused interfaces
- Dependency Inversion: ✅ Depends on abstractions

**Best Practices**:

- ✅ Proper error handling
- ✅ Input validation
- ✅ No code duplication
- ✅ Clear naming conventions
- ✅ Proper TypeScript types
```

---

### 4. Security Validation

```bash
@security-auditor audit lib/{{feature}}/
```

**Example Output**:

```markdown
## Security Validation

**OWASP Top 10 Check**:

- ✅ A01: Broken Access Control - Auth middleware enforced
- ✅ A02: Cryptographic Failures - bcrypt used (cost 12)
- ✅ A03: Injection - Parameterized queries (Prisma ORM)
- ✅ A04: Insecure Design - Security by design principles
- ✅ A05: Security Misconfiguration - Proper config
- ✅ A06: Vulnerable Components - npm audit passed
- ✅ A07: Auth Failures - Proper auth implementation
- ✅ A08: Data Integrity - Input validation
- ✅ A09: Logging Failures - Proper logging
- ✅ A10: SSRF - No server-side requests

**Vulnerabilities**: 0 critical, 0 high, 0 medium
```

---

### 5. Performance Validation

```bash
@performance-optimizer analyze lib/{{feature}}/
```

**Example Output**:

```markdown
## Performance Validation

**Response Time** (from REQ-PERF-001):

- Target: < 200ms (95th percentile)
- Actual: 150ms (95th percentile) ✅
- 99th percentile: 280ms ✅

**Database Queries**:

- N+1 queries: None detected ✅
- Indexes: ✅ Properly indexed
- Connection pooling: ✅ Configured (20 connections)

**Caching**:

- Redis cache: ✅ Implemented
- Hit rate: 85%
- TTL: 5 minutes
```

---

### 6. Generate Validation Report

**Save to**: `storage/validation/{{feature-name}}-validation-report.md`

**Report Structure**:

```markdown
# Validation Report: {{FEATURE_NAME}}

**Date**: {{DATE}}
**Status**: ✅ PASS / ❌ FAIL
**Validator**: {{VALIDATOR}}

---

## Executive Summary

**Overall Status**: ✅ PASS

**Project Profile**: {{PROFILE}} (library | cli | application, from `steering/project.yml`)
**Constitutional Compliance**: 9/9 articles ✅
**Requirements Coverage**: 100% ✅
**Test Coverage**: 91.5% ✅
**Security**: 0 vulnerabilities ✅
**Performance**: Within targets ✅

---

## Constitutional Validation

[Include all 9 articles validation results]

---

## Requirements Traceability

[Include traceability matrix]

---

## Code Quality

[Include code quality results]

---

## Security

[Include security audit results]

---

## Performance

[Include performance validation results]

---

## Recommendations

[Optional improvements, non-blocking issues]

---

## Sign-Off

**Validated By**: [Name/Role]
**Date**: {{DATE}}
**Approved for Production**: ✅ YES / ❌ NO
```

---

### 7. Generate Summary

```markdown
## ✅ Validation Complete

**Feature**: {{FEATURE_NAME}}
**Report**: storage/validation/{{feature-name}}-validation-report.md

### Validation Summary:

**Project Profile**: {{PROFILE}} (from `steering/project.yml`)

**Constitutional Compliance**:

- ✅ Article I: Testable Core (core modules tested without the UI, server or CLI)
- ✅ Article II: Automation Interface (CLI for library/cli, HTTP API for application)
- ✅ Article III: Test-First
- ✅ Article IV: EARS Format
- ✅ Article V: Traceability (100%)
- ✅ Article VI: Steering Alignment
- ✅ Article VII: Simplicity (1 project ≤ 3; code within the size limits)
- ✅ Article VIII: No Custom Abstractions
- ✅ Article IX: Integration Tests (Real Services)

**Overall**: 9/9 ✅

**Coverage**:

- Requirements → Design: 100% ✅
- Requirements → Code: 100% ✅
- Requirements → Tests: 100% ✅
- Test Coverage: 91.5% ✅ (target: 80%)

**Quality**:

- Linting: ✅ Pass
- Type Checking: ✅ Pass
- Code Review: ✅ Pass
- Security: 0 vulnerabilities ✅
- Performance: Within targets ✅

**Production Readiness**: ✅ APPROVED

### Next Steps:

1. Deploy to staging
2. Run acceptance tests
3. Get stakeholder sign-off
4. Deploy to production: `@devops-engineer deploy production`
```

---

## Tool Usage

### Required:

- **Read**: All specification documents, source code, tests
- **Grep**: Search for requirement IDs, patterns
- **Bash**: Run tests, linters, coverage tools

### Skills to Invoke:

- `@traceability-auditor`: Validate 100% coverage
- `@code-reviewer`: Code quality review
- `@security-auditor`: OWASP Top 10 validation
- `@performance-optimizer`: Performance analysis

---

## Exit Codes

Based on validation results:

- **Exit 0**: ✅ All validations passed
- **Exit 1**: ❌ Constitutional violations detected in a critical article (level per profile, P-5/P-6)
- **Exit 2**: ⚠️ Warnings (non-blocking issues, including violations in advisory articles)

---

**Execution**: Begin validation now for the specified feature.
