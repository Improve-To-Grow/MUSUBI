# SDD Design Command

Generate technical design from requirements.

---

## Instructions for Claude

You are executing the `/sdd-design [feature-name]` command to create a technical design specification.

### Command Format

```bash
/sdd-design authentication
/sdd-design payment-processing
/sdd-design user-dashboard
```

### Your Task

Generate a comprehensive technical design that implements the requirements while adhering to constitutional governance.

---

## Process

### 1. Read Context (Article VI)

**CRITICAL**: Read these files BEFORE designing:

```bash
# Steering Context
steering/structure.md    # Architecture patterns to follow
steering/tech.md         # Technology stack to use
steering/product.md      # Product goals and users
steering/project.yml     # constitution.profile (library | cli | application)

# Requirements
storage/specs/{{feature-name}}-requirements.md  # What to implement
```

**Extract**:

- Architecture pattern (monolith, microservices, library-first)
- Project profile (`constitution.profile`, `core_paths`, `delivery_paths`; `library` when absent)
- Approved technologies (languages, frameworks, databases)
- Requirements to implement
- Non-functional requirements (performance, security, scale)

---

### 2. Verify Requirements Exist

Check if requirements file exists:

**If NOT found**:

```markdown
❌ **Requirements file not found**

Expected: storage/specs/{{feature-name}}-requirements.md

Please run `/sdd-requirements {{feature-name}}` first.

Design cannot proceed without requirements (Article V: Traceability).
```

**If found**: Proceed with design

---

### 3. Generate Design Document

Use template from `templates/design.md`:

#### A. Architecture Design (C4 Model)

Create **3 levels** of C4 diagrams:

**Level 1: Context Diagram**

- Show system in context
- External users
- External systems
- Integration points

**Level 2: Container Diagram**

- Major deployable units
- Databases
- Message queues
- External APIs

**Level 3: Component Diagram**

- Internal components of main container
- Controllers, services, repositories
- Data flow between components

**Example**:

````markdown
### C4 Model: Container Diagram

```text
+--------------------------------------+
|       Authentication System          |
|                                      |
|  +-------------+   +-------------+   |
|  |             |   |             |   |
|  |  Web App    +-->+  API Server |   |
|  |  (Next.js)  |   |  (Node.js)  |   |
|  |             |   |             |   |
|  +-------------+   +------+------+   |
|                           |          |
+---------------------------+----------+
                            |
                            | SQL
                            v
                   +--------+--------+
                   |   PostgreSQL    |
                   +-----------------+
```
````

#### B. Requirements Mapping

**CRITICAL (Article V)**: Each requirement SHALL map to at least one design decision (V-1), and the design document SHALL include a requirements coverage matrix (V-5).

Create matrix:

```markdown
| Component      | Requirements               | Design Rationale             |
| -------------- | -------------------------- | ---------------------------- |
| AuthService    | REQ-AUTH-001, REQ-AUTH-002 | Business logic encapsulation |
| AuthController | REQ-AUTH-003               | API exposure                 |
| UserRepository | REQ-AUTH-004               | Data persistence             |
| JWTMiddleware  | REQ-SEC-001                | Security enforcement         |
```

**Coverage Validation**:

- [ ] All functional requirements mapped
- [ ] All non-functional requirements addressed
- [ ] 100% requirements coverage

---

### 4. API Design

For each API endpoint:

**Structure**:

````markdown
#### POST /api/auth/login

**Purpose**: Authenticate user with credentials

**Maps to Requirements**: REQ-AUTH-001

**Request**:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response (Success)**:

```http
HTTP/1.1 200 OK
Set-Cookie: session=xxx; HttpOnly; Secure

{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "expiresAt": "2025-11-17T10:00:00Z"
}
```

**Response (Error)**:

```http
HTTP/1.1 401 Unauthorized

{
  "error": "Invalid credentials"
}
```

**Status Codes**:

- 200: Success
- 401: Invalid credentials
- 429: Rate limit exceeded
- 500: Server error

**Acceptance Criteria** (from REQ-AUTH-001):

- ✅ Validates email and password
- ✅ Returns session cookie
- ✅ Redirects to dashboard
````

**Generate OpenAPI Spec** (if REST API):

```yaml
openapi: 3.0.0
info:
  title: Authentication API
  version: 1.0.0
paths:
  /api/auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 12
```

---

### 5. Database Design

#### A. Entity-Relationship Diagram

```markdown
+-------------------+ +-------------------+
| users | | sessions |
+-------------------+ +-------------------+
| id (PK) | | id (PK) |
| email | | user_id (FK) |
| password_hash | | token |
| created_at | | expires_at |
+-------------------+ | created_at |
| +-------------------+
+------------------------------+
1:N
```

#### B. Schema Definition (DDL)

**Maps to Requirements**: Document which requirements need which tables.

```sql
-- REQ-AUTH-004: User storage
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- REQ-AUTH-005: Session management
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

#### C. Migration Strategy

````markdown
**Migration Tool**: Prisma Migrate

**Initial Migration**:

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```
````

---

### 6. Component Design (Testable Core, Article I)

**CRITICAL**: Read `constitution.profile` from `steering/project.yml` before designing components. IF no profile is declared, THEN use `library` (P-2). The profile decides what a core module is and which variant below applies.

- The design SHALL name the core module for each feature (I-1).
- WHERE the project profile is `application`, the design SHALL list the delivery paths of each feature and each machine-facing endpoint with its input schema and documented status and error codes (II-A4, II-A5).

#### Variant: `library` / `cli` profile

Design features as libraries first (I-L1–I-L3), each with a CLI (II-L1).

````markdown
### Authentication Library

**Location**: `lib/auth/`

**Responsibilities**:

- Business logic for authentication
- Password hashing
- Session management
- JWT generation/validation

**Directory Structure**:

```text
lib/auth/
├── src/
│   ├── index.ts         # Public API
│   ├── service.ts       # AuthService class
│   ├── repository.ts    # UserRepository class
│   ├── password.ts      # Password hashing utilities
│   ├── jwt.ts           # JWT utilities
│   └── types.ts         # TypeScript types
├── tests/
│   ├── service.test.ts
│   ├── repository.test.ts
│   └── integration.test.ts
├── cli.ts               # CLI interface (Article II)
└── package.json
```

**Public API**:

```typescript
// lib/auth/src/index.ts
export { AuthService } from './service';
export { UserRepository } from './repository';
export type { User, Session, LoginRequest, LoginResponse } from './types';
```

**CLI Interface** (Article II):

```bash
# lib/auth/cli.ts commands:
auth create-user --email=user@example.com --password=secret
auth login --email=user@example.com --password=secret
auth logout --session-id=uuid
auth validate-session --token=xxx
```
````

#### Variant: `application` profile

Design each feature as a core module folder under a core path, with no own `package.json` (I-A1, I-A2). Route handlers and server actions delegate to it (I-A3). The HTTP API is the automation interface, so there is no `cli.ts` (II-A1, II-A3).

````markdown
### Authentication Core Module

**Core module**: `src/lib/auth/`

```text
src/lib/auth/
├── index.ts             # Public interface
├── service.ts           # login(), logout(), validateSession()
├── service.test.ts      # Runs without the app server (I-2)
├── password.ts
└── types.ts
```

**Delivery paths** (delegate to `src/lib/auth/`, I-A3):

- `src/app/api/auth/login/route.ts`: validates input, calls core, returns status and error code
- `src/app/login/actions.ts`: server action used by `src/app/login/page.tsx`

**Machine-facing endpoints** (II-A4, II-A5):

| Endpoint                 | Caller      | Input schema                | Status and error codes                                  |
| ------------------------ | ----------- | --------------------------- | ------------------------------------------------------- |
| POST /api/auth/login     | API clients | `LoginSchema` (zod)         | 200; 400 `VALIDATION_FAILED`; 401 `INVALID_CREDENTIALS` |
| POST /api/auth/provision | n8n flow    | `ProvisionUserSchema` (zod) | 201; 400 `VALIDATION_FAILED`; 409 `USER_EXISTS`         |

**Operational scripts** (advisory, II-A6–II-A9): `scripts/create-user.ts` with `--help`, `--env` and `--dry-run`, registered in `package.json`
````

---

### 7. Security Design (REQ-SEC-001)

Always include security design:

```markdown
### Authentication

- **Method**: JWT tokens
- **Storage**: HTTP-only cookies
- **Expiry**: 24 hours
- **Refresh**: 7-day refresh tokens

### Authorization

- **Method**: Role-Based Access Control (RBAC)
- **Roles**: admin, user, guest
- **Permissions**: Defined per endpoint

### Data Protection

- **Passwords**: bcrypt hash (cost factor 12)
- **Tokens**: Cryptographically signed JWT
- **HTTPS**: TLS 1.3 enforced
- **Sensitive Data**: PII encrypted at rest

### Input Validation

- **XSS Prevention**: Output encoding
- **SQL Injection**: Parameterized queries (ORM)
- **CSRF**: CSRF tokens on state-changing operations
- **Rate Limiting**: 5 failed login attempts → account lock
```

---

### 8. Performance Design (REQ-PERF-001)

```markdown
### Caching Strategy

- **Layer**: Redis
- **TTL**: User sessions (24 hours)
- **Invalidation**: On logout

### Database Optimization

- **Indexes**: email (unique), session token (unique)
- **Connection Pooling**: 20 connections max
- **Query Optimization**: Eager load user with session

### API Performance Targets

- **Response Time**: < 200ms (95th percentile)
- **Throughput**: 1000 requests/second
- **Concurrency**: 10,000 concurrent users
```

---

### 9. Constitutional Compliance Validation

#### Article I: Testable Core

- [ ] Profile read from `steering/project.yml` (`library` when absent, P-2)
- [ ] Core module named for each feature (I-1)
- [ ] Core module has tests that run without the app, a browser or a CLI (I-2)
- [ ] No imports from delivery paths into core paths (I-3)
- [ ] (`library`, `cli`) Feature designed as library (`lib/{{feature}}/`) (I-L1)
- [ ] (`library`, `cli`) Library has independent test suite (I-L2)
- [ ] (`library`, `cli`) Library has public API (`index.ts`) (I-L3)
- [ ] (`library`, `cli`) No dependencies on application code (I-L6)
- [ ] (`application`) Core module is a folder under a core path, e.g. `src/lib/{{feature}}/` (I-A1)
- [ ] (`application`) Route handlers and server actions delegate to core (I-A3)
- [ ] (`application`) No UI-only code (components, React hooks, providers) in core paths (I-A4)

#### Article II: Automation Interface

- [ ] All major operations callable without the UI (II-1)
- [ ] Interface documented: help text or schema (II-2)
- [ ] Machine-readable errors: exit codes, or status plus error code (II-4)
- [ ] (`library`, `cli`) CLI interface specified (`cli.ts`) (II-L1)
- [ ] (`library`, `cli`) Help text documented (II-L2)
- [ ] (`library`, `cli`) Exit codes defined (II-L4, II-L5)
- [ ] (`application`) Delivery paths listed for each feature
- [ ] (`application`) Each machine-facing endpoint listed with input schema and documented status and error codes (II-A4, II-A5)

#### Article VII: Simplicity Gate (Phase -1)

- [ ] Count projects (independently deployable units): at most 3 in the initial architecture (VII-1)
- [ ] If > 3 projects: Phase -1 Gate approval before the additional projects are implemented (VII-2), and design.md justifies each additional project with business requirements, technical constraints and a team capacity analysis (VII-3)
- [ ] Components sized so the code can stay within the code-size limits: source files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10 (`index` files exempt), or the configured `code_limits` (VII-4–VII-6); these limits are not Phase -1 Gate items

#### Article VIII: Anti-Abstraction Gate (Phase -1)

- [ ] Framework APIs called directly (VIII-1)
- [ ] Check for custom abstraction layers or wrapper libraries over a framework: each needs Phase -1 Gate approval (VIII-2)
- [ ] If custom wrappers exist: Phase -1 Gate request with a multi-framework support justification, a team expertise analysis and a migration path (VIII-3)
- [ ] IF the design introduces a project-owned client because the vendor SDK cannot run on the target runtime (VIII-4), THEN design.md SHALL document that constraint: SDK, runtime and client location (VIII-5)

**Validation Section**:

```markdown
## Constitutional Compliance

### Article I: Testable Core ✅

- Profile: `library` (`steering/project.yml`)
- Authentication implemented as library: `lib/auth/` (I-L1)
- Independent test suite: `lib/auth/tests/` (I-L2)
- Public API: `lib/auth/src/index.ts` (I-L3)
- (`application` instead) Core module `src/lib/auth/` with co-located tests; route handlers delegate to it (I-A1, I-2, I-A3)

### Article II: Automation Interface ✅

- CLI commands: create-user, login, logout, validate-session (II-L1)
- Help text: `auth --help` (II-L2)
- (`application` instead) HTTP API, no CLI: `POST /api/auth/login` validates input against `LoginSchema` and returns documented status and error codes (II-A1, II-A3, II-A4, II-A5)

### Article VII: Simplicity Gate ✅

- Project count: 1 (monorepo with libraries)
- Within limit (≤ 3)

### Article VIII: Anti-Abstraction ✅

- Uses Prisma ORM directly (no custom wrapper)
- Uses bcrypt directly (no custom abstraction)
```

---

### 10. Architecture Decision Records (ADR)

Document key decisions:

```markdown
### ADR-001: Use JWT for Session Management

**Status**: Accepted
**Date**: 2025-11-16

**Context**:
Need stateless authentication for REQ-AUTH-001.

**Decision**:
Use JWT tokens stored in HTTP-only cookies.

**Consequences**:

- ✅ Stateless (scalable)
- ✅ No session storage needed
- ❌ Token revocation requires blocklist
- ❌ Larger cookie size

**Alternatives Considered**:

- Session-based: Rejected (requires session store, not scalable)
- OAuth 2.0: Deferred to future (overkill for v1)
```

Document ADRs for:

- Database choice
- Authentication method
- API style (REST vs GraphQL)
- Caching strategy
- Major framework choices

---

### 11. Save Design Document

Save to: `storage/design/{{feature-name}}-design.md`

**File Naming**:

- Use kebab-case
- Match requirements file name
- Add `-design` suffix

**Examples**:

- `storage/design/authentication-design.md`
- `storage/design/payment-processing-design.md`

---

### 12. Validation

Run constitutional validation:

```bash
@constitution-enforcer validate storage/design/{{feature-name}}-design.md
```

**Checks**:

- Article I: Testable Core: core module named for each feature, per the project profile (I-1)
- Article II: Automation Interface: CLI specified (`library`, `cli`), or delivery paths and machine-facing endpoints with schemas listed (`application`)
- Article V: All requirements mapped (V-1), requirements coverage matrix included (V-5)
- Article VII: Project count ≤ 3 (VII-1), or gate-approved and justified (VII-2, VII-3)
- Article VIII: No custom abstractions (VIII-1, VIII-2), or gate-approved and justified (VIII-3)

---

### 13. Generate Summary

```markdown
## ✅ Technical Design Complete

**Feature**: {{FEATURE_NAME}}
**File**: storage/design/{{feature-name}}-design.md

### Architecture Summary:

- **Pattern**: [Library-first / Microservices / Monolith]
- **Profile**: [library / cli / application]
- **Components**: [N] components
- **Core Modules**: lib/{{feature}}/ (`library`, `cli`) or src/lib/{{feature}}/ (`application`)
- **Database Tables**: [N] tables

### Requirements Coverage:

- **Total Requirements**: [N]
- **Requirements Mapped**: [N] (100%)
- **Unmapped Requirements**: 0 ✅

### API Endpoints:

- POST /api/{{feature}}/... ([N] endpoints total)

### Database:

- Tables: [N]
- Indexes: [N]
- Foreign Keys: [N]

### ADRs Created:

- ADR-001: [Decision]
- ADR-002: [Decision]

### Constitutional Compliance:

- ✅ Article I: Testable Core: core module named for each feature
- ✅ Article II: Automation Interface defined (CLI, or HTTP API with schemas)
- ✅ Article V: 100% requirements coverage
- ✅ Article VI: Aligned with steering context
- ✅ Article VII: Project count within limit
- ✅ Article VIII: No custom abstractions

### Next Steps:

1. Review design with team
2. Get architecture approval
3. Break down into tasks: `/sdd-tasks {{feature-name}}`
```

---

## Tool Usage

### Required:

- **Read**: Steering files, requirements document
- **Write**: Design document
- **Grep/Glob**: Analyze existing codebase (brownfield)

### Optional:

- **AskUserQuestion**: Clarify design decisions
- **WebSearch**: Research design patterns
- **mcp**context7**get-library-docs**: Framework documentation

---

## Phase -1 Gate Triggers

### Trigger Simplicity Gate (Article VII)

If project count > 3:

```markdown
⚠️ **Phase -1 Gate: Simplicity**

This design proposes [N] projects (> 3 limit).

**Required Justification** (VII-3):

1. Business requirements necessitating separation
2. Technical constraints
3. Team capacity analysis for managing [N] projects

Please provide justification or reduce project count.

**Approval Required** before the additional projects are implemented (VII-2): @system-architect + @project-manager
```

### Trigger Anti-Abstraction Gate (Article VIII)

If custom abstraction layers detected:

A project-owned client that exists because the vendor SDK cannot run on the target runtime is a valid abstraction (VIII-4) and does not trigger this gate; document the constraint in design.md instead (VIII-5).

```markdown
⚠️ **Phase -1 Gate: Anti-Abstraction**

This design includes custom abstraction layers:

- [Abstraction 1]: Wrapper around [framework]
- [Abstraction 2]: Custom [pattern]

**Required Justification** (VIII-3):

1. Multi-framework support needed
2. Team expertise rationale
3. Migration path

Please justify or use framework APIs directly (VIII-1).

**Approval Required** (VIII-2): @system-architect + @software-developer
```

---

## Edge Cases

### Missing Requirements

If requirements file doesn't exist:

```markdown
❌ **Error**: Requirements not found

Expected: storage/specs/{{feature-name}}-requirements.md

Please run `/sdd-requirements {{feature-name}}` first.

Design requires requirements for traceability (Article V).
```

### Missing Steering

If steering files don't exist:

```markdown
⚠️ **Warning**: Steering context not found

Designing without steering context may result in:

- Architecture misalignment
- Technology stack mismatch
- Product goal misalignment

Recommendation: Run `/sdd-steering` first.

Continue anyway? [Prompt user]
```

---

**Execution**: Begin technical design generation now for the specified feature.
