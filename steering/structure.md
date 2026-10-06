# Project Structure

**Project**: MUSUBI
**Last Updated**: 2026-10-02
**Version**: 1.0

---

## Architecture Pattern

**Primary Pattern**: {{ARCHITECTURE_PATTERN}}

> [Description of the architecture pattern used in this project]
> Examples: Monorepo with Library-First, Microservices, Modular Monolith, Serverless

---

## Architecture Layers (Language-Agnostic)

The following layer definitions apply regardless of programming language:

### Layer 1: Domain / Core

**Purpose**: Business logic and domain models
**Rules**:

- MUST NOT depend on any other layer
- Contains: Entities, Value Objects, Domain Services, Domain Events
- No framework dependencies, no I/O

**Language Examples**:
| Language | Location | Pattern |
|----------|----------|---------|
| TypeScript | `lib/{feature}/domain/` | Classes/Types |
| Rust | `{crate}/src/domain/` | Structs + Traits |
| Python | `src/{pkg}/domain/` | Dataclasses |
| Go | `internal/domain/` | Structs + Interfaces |
| Java | `src/main/.../domain/` | Classes + Records |

### Layer 2: Application / Use Cases

**Purpose**: Orchestrate domain logic, implement use cases
**Rules**:

- Depends only on Domain layer
- Contains: Application Services, Commands, Queries, DTOs
- No direct I/O (uses ports/interfaces)

**Language Examples**:
| Language | Location | Pattern |
|----------|----------|---------|
| TypeScript | `lib/{feature}/application/` | Service classes |
| Rust | `{crate}/src/application/` | Impl blocks |
| Python | `src/{pkg}/application/` | Service functions |
| Go | `internal/app/` | Service structs |
| Java | `src/main/.../application/` | @Service classes |

### Layer 3: Infrastructure / Adapters

**Purpose**: External integrations (DB, APIs, messaging)
**Rules**:

- Depends on Application layer (implements ports)
- Contains: Repositories, API Clients, Message Publishers
- All I/O operations here

**Language Examples**:
| Language | Location | Pattern |
|----------|----------|---------|
| TypeScript | `lib/{feature}/infrastructure/` | Repository impls |
| Rust | `{crate}/src/infrastructure/` | Trait impls |
| Python | `src/{pkg}/infrastructure/` | Repository classes |
| Go | `internal/infra/` | Interface impls |
| Java | `src/main/.../infrastructure/` | @Repository classes |

### Layer 4: Interface / Presentation

**Purpose**: Entry points (CLI, API, Web UI)
**Rules**:

- Depends on Application layer
- Contains: Controllers, CLI handlers, API routes
- Input validation and response formatting

**Language Examples**:
| Language | Location | Pattern |
|----------|----------|---------|
| TypeScript | `app/api/` or `cli/` | Route handlers |
| Rust | `{crate}/src/api/` or `cli/` | Axum handlers |
| Python | `src/{pkg}/api/` or `cli/` | FastAPI routes |
| Go | `cmd/` or `internal/api/` | HTTP handlers |
| Java | `src/main/.../api/` | @RestController |

### Layer Dependency Rules

```
┌─────────────────────────────────────────┐
│        Interface / Presentation         │ ← Entry points
├─────────────────────────────────────────┤
│        Application / Use Cases          │ ← Orchestration
├─────────────────────────────────────────┤
│        Infrastructure / Adapters        │ ← I/O & External
├─────────────────────────────────────────┤
│            Domain / Core                │ ← Pure business logic
└─────────────────────────────────────────┘

Dependency Direction: ↓ (outer → inner)
Domain layer has NO dependencies
```

---

## Directory Organization

### Root Structure

```
MUSUBI/
├── lib/                  # Core modules (Article I: Testable Core)
├── app/                  # Application code (Next.js, etc.)
├── api/                  # API routes/controllers
├── components/           # UI components
├── services/             # Business logic services
├── tests/                # Test suites
├── docs/                 # Documentation
├── storage/              # SDD artifacts
│   ├── specs/            # Requirements, design, tasks
│   ├── changes/          # Delta specifications (brownfield)
│   └── validation/       # Validation reports
├── steering/             # Project memory (this directory)
│   ├── structure.md      # This file
│   ├── tech.md           # Technology stack
│   ├── product.md        # Product context
│   └── rules/            # Constitutional governance
├── templates/            # Document templates
└── [Other directories]
```

---

## Testable-Core Pattern (Article I)

Feature logic lives in core modules that are tested without the UI, server or CLI (Article I: Testable-Core Principle). The project profile decides what a core module is.

### Profile and Paths

Record the values declared under `constitution:` in `steering/project.yml` (see "Project Profiles" in `steering/rules/constitution.md`). Without a declared profile, the `library` profile applies (P-2).

| Setting        | Value                                           | Holds                                                                        |
| -------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| Profile        | [library \| cli \| application]                 | What the project builds (P-1)                                                |
| Core paths     | [e.g. `lib/`, `packages/` or `src/lib/`]        | Feature logic (I-1)                                                          |
| Delivery paths | [e.g. `bin/` or `src/app/`, `src/components/`]  | Pages, route handlers, server actions, UI components, CLI entry points       |
| Adapter paths  | [e.g. `src/lib/server/authorization/`, or none] | Request-context code that core logic depends on (`application` profile only) |

Rules for every profile:

- The project SHALL place feature logic under a core path (I-1).
- Each core module SHALL have tests that run without starting the app, a browser or a CLI (I-2).
- A core module SHALL NOT import from a delivery path (I-3).
- Direct use of a framework or platform SDK in a core module is not a violation (I-4).
- Each exported function and class of a core module SHALL have a doc comment (`/** … */`) directly above its declaration (I-5, advisory).

Keep the layout below that matches the profile and delete the other.

### Library Layout (`library` and `cli` profiles)

Each feature starts as a standalone library in `lib/` (I-L1). Each library follows this structure:

```
lib/{{feature}}/
├── src/
│   ├── index.ts          # Public API exports
│   ├── service.ts        # Business logic
│   ├── repository.ts     # Data access
│   ├── types.ts          # TypeScript types
│   ├── errors.ts         # Custom errors
│   └── validators.ts     # Input validation
├── tests/
│   ├── service.test.ts   # Unit tests
│   ├── repository.test.ts # Integration tests (real DB)
│   └── integration.test.ts # E2E tests
├── cli.ts                # CLI interface (Article II, II-L1)
├── package.json          # Library metadata
├── tsconfig.json         # TypeScript config
└── README.md             # Library documentation
```

#### Library Guidelines

- **Independence**: Libraries MUST NOT depend on application code (I-L6)
- **Public API**: All exports via `src/index.ts` (I-L3)
- **Testing**: Independent test suite (I-L2)
- **CLI**: All libraries expose a CLI with `--help` and conventional exit codes (Article II, II-L1–II-L5)

### Application Layout (`application` profile)

Each core module is a folder under a core path, without its own `package.json`, deployment or publication (I-A1, I-A2).

```
src/
├── lib/                          # Core path
│   └── {{feature}}/
│       ├── index.ts              # Public interface of the core module
│       ├── service.ts            # Business logic
│       ├── service.test.ts       # Co-located tests (run without the app)
│       └── repository.ts         # Data access (direct SDK use is fine, I-4)
├── app/                          # Delivery path: pages, route handlers, server actions
│   └── api/{{feature}}/route.ts  # Validates input, calls core, returns status + error code
└── components/                   # Delivery path: UI components
scripts/                          # Operational scripts with --help and --dry-run (II-A6–II-A9)
```

#### Core and Delivery Guidelines

- **Thin delivery**: Route handlers, server actions, pages and components only validate input, authorize, call core and shape the response (I-A3, advisory)
- **No UI in core**: No components, React hooks or providers under core paths (I-A4)
- **Request context**: `next/headers` and `next/server` only in delivery or adapter paths (I-A5, advisory)
- **Extraction**: A core module moves into a package only when a second consumer appears (I-A6, I-A7)
- **Automation interface**: The HTTP API (route handlers) is the automation interface; no CLI is required (Article II, II-A1, II-A3)

---

## Application Structure

### Application Organization

```
app/
├── (auth)/               # Route groups (Next.js App Router)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   └── page.tsx
├── api/                  # API routes
│   ├── auth/
│   │   └── route.ts
│   └── users/
│       └── route.ts
├── layout.tsx            # Root layout
└── page.tsx              # Home page
```

### Application Guidelines

- **Core Usage**: Applications import from core modules (`lib/` or `src/lib/`)
- **Thin Controllers**: API routes delegate to core module services
- **No Business Logic**: Business logic belongs in core modules (Article I)

---

## Component Organization

### UI Components

```
components/
├── ui/                   # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── auth/                 # Feature-specific components
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── dashboard/
│   └── StatsCard.tsx
└── shared/               # Shared components
    ├── Header.tsx
    └── Footer.tsx
```

### Component Guidelines

- **Composition**: Prefer composition over props drilling
- **Types**: All props typed with TypeScript
- **Tests**: Component tests with React Testing Library

---

## Database Organization

### Schema Organization

```
prisma/
├── schema.prisma         # Prisma schema
├── migrations/           # Database migrations
│   ├── 001_create_users_table/
│   │   └── migration.sql
│   └── 002_create_sessions_table/
│       └── migration.sql
└── seed.ts               # Database seed data
```

### Database Guidelines

- **Migrations**: All schema changes via migrations
- **Naming**: snake_case for tables and columns
- **Indexes**: Index foreign keys and frequently queried columns

---

## Test Organization

### Test Structure

```
tests/
├── unit/                 # Unit tests (per library)
│   └── auth/
│       └── service.test.ts
├── integration/          # Integration tests (real services)
│   └── auth/
│       └── login.test.ts
├── e2e/                  # End-to-end tests
│   └── auth/
│       └── user-flow.test.ts
└── fixtures/             # Test data and fixtures
    └── users.ts
```

### Test Guidelines

- **Test-First**: Tests written BEFORE implementation (Article III, III-1)
- **Real Services**: Integration tests use real DB/cache (Article IX, IX-1); mocks only where IX-4 allows them, each justified (IX-5)
- **Coverage**: Configured threshold, default 80% (III-6)
- **Naming**: `*.test.ts` for unit, `*.integration.test.ts` for integration

---

## Documentation Organization

### Documentation Structure

```
docs/
├── architecture/         # Architecture documentation
│   ├── c4-diagrams/
│   └── adr/              # Architecture Decision Records
├── api/                  # API documentation
│   ├── openapi.yaml
│   └── graphql.schema
├── guides/               # Developer guides
│   ├── getting-started.md
│   └── contributing.md
└── runbooks/             # Operational runbooks
    ├── deployment.md
    └── troubleshooting.md
```

---

## SDD Artifacts Organization

### Storage Directory

```
storage/
├── specs/                # Specifications
│   ├── auth-requirements.md
│   ├── auth-design.md
│   ├── auth-tasks.md
│   └── payment-requirements.md
├── changes/              # Delta specifications (brownfield)
│   ├── add-2fa.md
│   └── upgrade-jwt.md
├── features/             # Feature tracking
│   ├── auth.json
│   └── payment.json
└── validation/           # Validation reports
    ├── auth-validation-report.md
    └── payment-validation-report.md
```

---

## Naming Conventions

### File Naming

- **TypeScript**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **React Components**: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `formatDate.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`
- **Constants**: `SCREAMING_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)

### Directory Naming

- **Features**: `kebab-case` (e.g., `user-management/`)
- **Components**: `kebab-case` or `PascalCase` (consistent within project)

### Variable Naming

- **Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **Enums**: `PascalCase`

---

## Integration Patterns

### Core → Delivery Integration (Article I)

```typescript
// ✅ CORRECT: Delivery code (application, route handler, CLI) imports from a core module
import { AuthService } from '@/lib/auth';

const authService = new AuthService(repository);
const result = await authService.login(credentials);
```

```typescript
// ❌ WRONG: Core module imports from a delivery path
// A core module SHALL NOT import from a delivery path (I-3)
import { AuthContext } from '@/app/contexts/auth'; // Violation!
```

### Service → Repository Pattern

```typescript
// Service layer (business logic)
export class AuthService {
  constructor(private repository: UserRepository) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Business logic here
    const user = await this.repository.findByEmail(credentials.email);
    // ...
  }
}

// Repository layer (data access)
export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```

---

## Deployment Structure

### Deployment Units

**Projects** (independently deployable):

1. MUSUBI - Main application

> ⚠️ **Simplicity Gate (Article VII)**: The initial architecture SHALL NOT exceed 3 projects (VII-1).
> Additional projects need Phase -1 Gate approval before implementation (VII-2) and a justification in design.md: business requirements, technical constraints, team capacity analysis (VII-3).

### Environment Structure

```
environments/
├── development/
│   └── .env.development
├── staging/
│   └── .env.staging
└── production/
    └── .env.production
```

---

## Multi-Language Support

### Language Policy

- **Primary Language**: English
- **Documentation**: English (`.md`) only; no translated copies (CHANGE-001)
- **Language boundary**: `src/enterprise/tech-article.js` (`TechArticleGenerator`) is the only multilingual component; it emits Qiita/Zenn articles in Japanese through its `language` option
- **Code Comments**: English
- **UI Strings**: i18n framework

### i18n Organization

```
locales/
├── en/
│   ├── common.json
│   └── auth.json
└── ja/
    ├── common.json
    └── auth.json
```

---

## Version Control

### Branch Organization

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `hotfix/*` - Hotfix branches
- `release/*` - Release branches

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example**:

```
feat(auth): implement user login (REQ-AUTH-001)

Add login functionality with email and password authentication.
Session created with 24-hour expiry.

Closes REQ-AUTH-001
```

---

## Constitutional Compliance

This structure enforces:

- **Article I**: Testable Core: feature logic in core modules under the declared core paths (libraries in `lib/` for `library`/`cli`, folders such as `src/lib/<domain>/` for `application`)
- **Article II**: Automation Interface: a CLI per library for `library`/`cli`, the HTTP API for `application`
- **Article III**: Test structure supports Test-First (III-1)
- **Article VI**: Steering files maintain project memory
- **Article VII**: Source files stay within the code-size limits: ≤ 500 lines of code per file, ≤ 50 per function, ≤ 10 imports per file except `index` files, or the configured limits (VII-4–VII-6)

---

## Release Notes

Release history is kept in [CHANGELOG.md](../CHANGELOG.md) and is not repeated here.

---

**Last Updated**: 2026-10-02
**Maintained By**: {{MAINTAINER}}


## New Directories (Detected 2026-10-02)

```
website/
tests/
templates/
storage/
steering/
src/
packages/
orchestrator/
docs/
bin/
```
