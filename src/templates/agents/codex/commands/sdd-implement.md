# SDD Implement Command

Execute implementation tasks for a feature.

---

## Instructions for Claude

You are executing the `/sdd-implement [feature-name]` command to implement a feature following SDD workflow.

### Command Format

```bash
/sdd-implement authentication
/sdd-implement payment-processing
/sdd-implement user-dashboard
```

### Your Task

Implement the feature by executing tasks from the task breakdown document, following Test-First principles (Article III) and constitutional governance.

---

## Process

### 1. Read All Context

**CRITICAL**: Read these files first:

```bash
# Task Breakdown
storage/tasks/{{feature-name}}-tasks.md

# Design
storage/design/{{feature-name}}-design.md

# Requirements
storage/specs/{{feature-name}}-requirements.md

# Steering Context
steering/structure.md
steering/tech.md
steering/product.md
steering/project.yml   # constitution.profile (library | cli | application)
```

---

### 2. Verify Prerequisites

**Check task breakdown exists**:

```markdown
❌ **Error**: Task breakdown not found

Expected: storage/tasks/{{feature-name}}-tasks.md

Please run `/sdd-tasks {{feature-name}}` first.

Implementation requires task breakdown.
```

**Check design exists**:

```markdown
❌ **Error**: Design document not found

Expected: storage/design/{{feature-name}}-design.md

Implementation requires design document.
```

---

### 3. Use TodoWrite Tool

**IMPORTANT**: Use TodoWrite tool to track implementation progress.

```markdown
Create todos for P0 tasks:

1. TASK-001: Set Up Project Structure
2. TASK-002: Write Tests for REQ-XXX-001 (RED)
3. TASK-003: Implement [Component] (GREEN)
4. TASK-004: Refactor [Component] (BLUE)
5. TASK-005: Implement Database Repository
6. TASK-006: Implement CLI Interface (library, cli) or Route Handlers (application)
7. TASK-007: Implement API Endpoints
```

**Mark tasks as**:

- `in_progress` when starting
- `completed` when finished
- Keep EXACTLY ONE task `in_progress` at a time

---

### 4. Execute Tasks in Order

Follow task dependencies from task breakdown document.

#### TASK-001: Set Up Project Structure

Read `constitution.profile` from `steering/project.yml` (`library` when absent, P-2) and create the structure for that profile (Article I: Testable Core).

**`library` / `cli` profile: create library structure** (I-L1–I-L5):

```typescript
// Create directory structure
lib/{{feature}}/
├── src/
│   ├── index.ts          // Public API exports
│   ├── service.ts        // Business logic
│   ├── repository.ts     // Data access
│   ├── types.ts          // TypeScript types
│   └── errors.ts         // Custom errors
├── tests/
│   ├── service.test.ts
│   ├── repository.test.ts
│   └── integration.test.ts
├── cli.ts                // CLI interface (Article II)
├── package.json
├── tsconfig.json
└── README.md
```

**Create files**:

1. **lib/{{feature}}/package.json**:

```json
{
  "name": "@{{project}}/{{feature}}",
  "version": "1.0.0",
  "description": "{{Feature}} library",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "{{feature}}": "./cli.ts"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/"
  }
}
```

2. **lib/{{feature}}/src/index.ts** (Public API):

```typescript
// REQ-{{COMPONENT}}-001: Export public API
export { {{COMPONENT}}Service } from './service';
export { {{COMPONENT}}Repository } from './repository';
export type {
  {{Resource}},
  Create{{Resource}}Request,
  Create{{Resource}}Response
} from './types';
```

3. **lib/{{feature}}/src/types.ts**:

```typescript
// REQ-{{COMPONENT}}-004: Define domain types
export interface {{Resource}} {
  id: string;
  field1: string;
  field2: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create{{Resource}}Request {
  field1: string;
  field2: number;
}

export interface Create{{Resource}}Response {
  id: string;
  field1: string;
  field2: number;
}
```

**`application` profile: create core module and delivery wiring** (I-A1, I-A2, I-A3):

```typescript
// Create directory structure (no package.json, no cli.ts)
src/lib/{{feature}}/          // Core module
├── index.ts                  // Public interface: service, types, errors
├── service.ts                // Business logic
├── service.test.ts           // Co-located tests, run without the app server (I-2)
├── repository.ts             // Data access
├── types.ts                  // Same types as above
└── errors.ts                 // Custom errors
src/app/api/{{resource}}/
└── route.ts                  // Delivery: route handler that calls core (TASK-006)
```

For `application`, read the paths in the examples below as `lib/{{feature}}/src/*` → `src/lib/{{feature}}/*` and `lib/{{feature}}/tests/*` → `src/lib/{{feature}}/*.test.ts`.

**Mark TASK-001 as completed**.

---

#### TASK-002: Write Tests (RED Phase) 🔴

**CRITICAL (Article III)**: The developer SHALL write each test before the production code that makes it pass (III-1), starting with a test that fails (III-2).

**Create test file**:

```typescript
// lib/{{feature}}/tests/service.test.ts

describe('REQ-{{COMPONENT}}-001: [Requirement Title]', () => {
  let service: {{COMPONENT}}Service;
  let mockRepository: jest.Mocked<{{COMPONENT}}Repository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      // ... other methods
    } as any;

    service = new {{COMPONENT}}Service(mockRepository);
  });

  // Acceptance Criterion 1
  it('should [acceptance criterion 1]', async () => {
    // Arrange
    const input = { field1: 'test', field2: 42 };
    mockRepository.create.mockResolvedValue({
      id: 'uuid',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Act
    const result = await service.create(input);

    // Assert
    expect(result).toMatchObject({
      id: expect.any(String),
      field1: 'test',
      field2: 42
    });
    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });

  // Acceptance Criterion 2
  it('should [acceptance criterion 2]', async () => {
    // Test error handling
    const invalidInput = { field1: '', field2: -1 };

    await expect(service.create(invalidInput)).rejects.toThrow(
      'Validation failed'
    );
  });

  // Add tests for ALL acceptance criteria
});
```

**Run tests** (should FAIL):

```bash
npm test lib/{{feature}}/tests/service.test.ts
# Expected: Tests FAIL (service.ts doesn't exist yet)
```

**Git commit**:

```bash
git add lib/{{feature}}/tests/
git commit -m "test: add failing tests for REQ-{{COMPONENT}}-001"
```

**Mark TASK-002 as completed**.

---

#### TASK-003: Implement Code (GREEN Phase) 💚

**Create minimal implementation** to pass tests (III-3):

```typescript
// lib/{{feature}}/src/service.ts

import { {{COMPONENT}}Repository } from './repository';
import { Create{{Resource}}Request, Create{{Resource}}Response } from './types';
import { ValidationError } from './errors';

export class {{COMPONENT}}Service {
  constructor(private repository: {{COMPONENT}}Repository) {}

  /**
   * REQ-{{COMPONENT}}-001: [Requirement title]
   *
   * Acceptance Criteria:
   * - [Criterion 1]
   * - [Criterion 2]
   */
  async create(data: Create{{Resource}}Request): Promise<Create{{Resource}}Response> {
    // Acceptance Criterion 1: Validate input
    this.validateInput(data);

    // Acceptance Criterion 2: Create resource
    const result = await this.repository.create(data);

    return {
      id: result.id,
      field1: result.field1,
      field2: result.field2
    };
  }

  private validateInput(data: Create{{Resource}}Request): void {
    if (!data.field1 || data.field1.length === 0) {
      throw new ValidationError('field1 is required');
    }
    if (!data.field2 || data.field2 <= 0) {
      throw new ValidationError('field2 must be positive');
    }
  }
}
```

**Create error classes**:

```typescript
// lib/{{feature}}/src/errors.ts

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

**Run tests** (should PASS):

```bash
npm test lib/{{feature}}/tests/service.test.ts
# Expected: Tests PASS ✅
```

**Git commit**:

```bash
git add lib/{{feature}}/src/
git commit -m "feat: implement REQ-{{COMPONENT}}-001 ([requirement title])"
```

**Mark TASK-003 as completed**.

---

#### TASK-004: Refactor (BLUE Phase) 💙

**Improve code design** while keeping tests green (III-4):

```typescript
// lib/{{feature}}/src/service.ts

export class {{COMPONENT}}Service {
  constructor(
    private repository: {{COMPONENT}}Repository,
    private validator: {{COMPONENT}}Validator  // Extract validation
  ) {}

  async create(data: Create{{Resource}}Request): Promise<Create{{Resource}}Response> {
    // Use validator
    this.validator.validate(data);

    const result = await this.repository.create(data);

    // Use mapper for response transformation
    return this.mapToResponse(result);
  }

  private mapToResponse(entity: {{Resource}}): Create{{Resource}}Response {
    return {
      id: entity.id,
      field1: entity.field1,
      field2: entity.field2
    };
  }
}
```

**Extract validator**:

```typescript
// lib/{{feature}}/src/validator.ts

export class {{COMPONENT}}Validator {
  validate(data: Create{{Resource}}Request): void {
    const errors: string[] = [];

    if (!data.field1 || data.field1.length === 0) {
      errors.push('field1 is required');
    }
    if (data.field1 && data.field1.length > 255) {
      errors.push('field1 max 255 characters');
    }
    if (!data.field2 || data.field2 <= 0) {
      errors.push('field2 must be positive');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }
}
```

**Keep the code within the limits** of `steering/rules/constitution.md` (defaults shown; the configured `code_limits` apply when set, see "Constitutional Compliance" below):

- Functions: at most 50 lines of code each; split longer ones (VII-5)
- Source files: at most 500 lines of code each (VII-4)
- Imports: at most 10 distinct modules per source file; `index` files are exempt (VII-6)
- Doc comments: a `/** … */` comment directly above each exported function and class of the core module (I-5, advisory)

**Run tests** (should STILL PASS):

```bash
npm test lib/{{feature}}/tests/service.test.ts
# Expected: Tests STILL PASS ✅
```

**Git commit**:

```bash
git add lib/{{feature}}/src/
git commit -m "refactor: extract validator and improve {{component}} service"
```

**Mark TASK-004 as completed**.

---

#### TASK-005: Implement Database Repository

**Create Prisma schema**:

```prisma
// prisma/schema.prisma

model {{Resource}} {
  id        String   @id @default(uuid())
  field1    String
  field2    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([field1])
}
```

**Generate migration**:

```bash
npx prisma migrate dev --name create_{{resource}}_table
```

**Implement repository**:

```typescript
// lib/{{feature}}/src/repository.ts

import { PrismaClient } from '@prisma/client';
import { {{Resource}}, Create{{Resource}}Request } from './types';

export class {{COMPONENT}}Repository {
  constructor(private prisma: PrismaClient) {}

  /**
   * REQ-{{COMPONENT}}-004: Persist {{resource}} to database
   */
  async create(data: Create{{Resource}}Request): Promise<{{Resource}}> {
    return this.prisma.{{resource}}.create({
      data: {
        field1: data.field1,
        field2: data.field2
      }
    });
  }

  async findById(id: string): Promise<{{Resource}} | null> {
    return this.prisma.{{resource}}.findUnique({
      where: { id }
    });
  }
}
```

**Write integration tests** (Article IX: real, isolated test database, IX-1, IX-2):

```typescript
// lib/{{feature}}/tests/integration.test.ts

import { PrismaClient } from '@prisma/client';
import { {{COMPONENT}}Repository } from '../src/repository';

describe('{{COMPONENT}}Repository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: {{COMPONENT}}Repository;

  beforeAll(async () => {
    // Use test database (Docker container)
    prisma = new PrismaClient({
      datasourceUrl: process.env.TEST_DATABASE_URL
    });
    repository = new {{COMPONENT}}Repository(prisma);

    // Clean database
    await prisma.{{resource}}.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create {{resource}} in real database', async () => {
    const data = { field1: 'test', field2: 42 };

    const result = await repository.create(data);

    expect(result).toMatchObject({
      id: expect.any(String),
      field1: 'test',
      field2: 42
    });

    // Verify in database
    const found = await repository.findById(result.id);
    expect(found).toMatchObject(data);
  });
});
```

**Run integration tests**:

```bash
docker-compose up -d test-db
npm test lib/{{feature}}/tests/integration.test.ts
```

**Mark TASK-005 as completed**.

---

#### TASK-006: Implement Automation Interface (Article II)

Use the variant for the project profile from `steering/project.yml`.

**`library` / `cli` profile: implement CLI interface** (II-L1–II-L6):

```typescript
#!/usr/bin/env node
// lib/{{feature}}/cli.ts

import { Command } from 'commander';
import { {{COMPONENT}}Service } from './src/service';
import { {{COMPONENT}}Repository } from './src/repository';
import { PrismaClient } from '@prisma/client';

const program = new Command();
const prisma = new PrismaClient();
const repository = new {{COMPONENT}}Repository(prisma);
const service = new {{COMPONENT}}Service(repository);

program
  .name('{{feature}}')
  .description('CLI for {{feature}} operations')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new {{resource}}')
  .requiredOption('--field1 <value>', 'Field 1 value')
  .requiredOption('--field2 <value>', 'Field 2 value', parseInt)
  .action(async (options) => {
    try {
      const result = await service.create({
        field1: options.field1,
        field2: options.field2
      });
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program
  .command('get')
  .description('Get {{resource}} by ID')
  .requiredOption('--id <uuid>', 'Resource ID')
  .action(async (options) => {
    try {
      const result = await repository.findById(options.id);
      if (!result) {
        console.error('Not found');
        process.exit(1);
      }
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
```

**Test CLI**:

```bash
chmod +x lib/{{feature}}/cli.ts
./lib/{{feature}}/cli.ts --help
./lib/{{feature}}/cli.ts create --field1=test --field2=42
```

**`application` profile: implement route handlers that delegate to core** (I-A3, II-A1, II-A4, II-A5). No CLI is required (II-A3).

```typescript
// src/app/api/{{resource}}/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { {{component}}Service, ValidationError } from '@/lib/{{feature}}'; // core module

// II-A4: validate input against a schema
const Create{{Resource}}Schema = z.object({
  field1: z.string().min(1),
  field2: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const parsed = Create{{Resource}}Schema.safeParse(await request.json());
  if (!parsed.success) {
    // II-4, II-A5: documented status plus machine-readable error code
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  try {
    // I-A3: delegate to core, then shape the response
    const result = await {{component}}Service.create(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: { code: 'VALIDATION_FAILED' } }, { status: 400 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
```

Server actions follow the same pattern: validate, authorize, call core, return a result. Operational tasks (seeding, user creation) go in `scripts/*.ts`, registered in `package.json`, with `--help`, an explicit target environment and `--dry-run` for production writes (II-A6–II-A9, advisory).

**Mark TASK-006 as completed**.

---

#### TASK-007: Implement API Endpoints

For `application`, route handlers are built in TASK-006; use this task only for endpoints not covered there.

```typescript
// app/api/{{resource}}/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { {{COMPONENT}}Service } from '@/lib/{{feature}}';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // REQ-{{COMPONENT}}-001: Create {{resource}}
    const result = await service.create(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'ID required' },
      { status: 400 }
    );
  }

  const result = await repository.findById(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
```

**Mark TASK-007 as completed**.

---

### 5. Run Validation After Each Task

After completing each task:

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check

# Run security audit
npm audit
```

---

### 6. After All P0 Tasks Complete

Run comprehensive validation:

```bash
# application profile: use src/lib/{{feature}}/ (core) and the delivery paths instead of lib/{{feature}}/

# Traceability validation
@traceability-auditor validate requirements.md tasks.md lib/{{feature}}/

# Constitutional validation
@constitution-enforcer validate lib/{{feature}}/

# Code review
@code-reviewer review lib/{{feature}}/src/

# Security audit
@security-auditor audit lib/{{feature}}/
```

---

### 7. Generate Implementation Summary

```markdown
## ✅ Implementation Complete

**Feature**: {{FEATURE_NAME}}

### Tasks Completed:

- ✅ TASK-001: Project structure (Testable Core)
- ✅ TASK-002: Tests written (RED)
- ✅ TASK-003: Implementation (GREEN)
- ✅ TASK-004: Refactoring (BLUE)
- ✅ TASK-005: Database repository
- ✅ TASK-006: CLI interface (`library`, `cli`) / route handlers (`application`)
- ✅ TASK-007: API endpoints

### Test Results:

- Unit Tests: [N] passing
- Integration Tests: [N] passing
- Coverage: [%]% (target: 80%)

### Constitutional Compliance:

- ✅ Article I: Testable Core: core module lib/{{feature}}/ (`library`, `cli`) or src/lib/{{feature}}/ (`application`)
- ✅ Article II: Automation Interface: CLI (`library`, `cli`) or HTTP API with schema-validated endpoints (`application`)
- ✅ Article III: Test-First followed (Red-Green-Blue)
- ✅ Article V: All requirements implemented
- ✅ Article VII: Code within the size limits (VII-4–VII-6)
- ✅ Article IX: Integration tests use real database

### Files Created:

- lib/{{feature}}/src/service.ts
- lib/{{feature}}/src/repository.ts
- lib/{{feature}}/src/types.ts
- lib/{{feature}}/cli.ts
- lib/{{feature}}/tests/\*.test.ts
- app/api/{{resource}}/route.ts
- (`application` instead: src/lib/{{feature}}/\*, src/app/api/{{resource}}/route.ts, no cli.ts)

### Next Steps:

1. Run full test suite
2. Deploy to staging: `@devops-engineer deploy staging`
3. Run acceptance tests
4. Deploy to production
```

---

## Tool Usage

### Required:

- **Read**: Tasks, design, requirements, steering
- **Write**: Create source files
- **Edit**: Modify existing files
- **Bash**: Run tests, migrations, CLI commands
- **TodoWrite**: Track implementation progress

---

## Constitutional Compliance

Throughout implementation, ensure:

### Article I: Testable Core ✅

- Core module tests run without the app, a browser or a CLI (I-2)
- No imports from delivery paths into core paths (I-3)
- Each exported function and class of a core module has a doc comment (`/** … */`) directly above its declaration (I-5, advisory)
- `library` / `cli`: All code in `lib/{{feature}}/` (I-L1)
- `library` / `cli`: No application dependencies (I-L6)
- `application`: Feature logic in `src/lib/{{feature}}/`; route handlers and server actions delegate to it (I-A1, I-A3)
- `application`: No UI-only code in core paths (I-A4)

### Article II: Automation Interface ✅

- `library` / `cli`: CLI commands implemented (II-L1)
- `library` / `cli`: Help text provided (II-L2)
- `application`: Machine-facing endpoints validate input against a schema and return documented status and error codes (II-A4, II-A5)
- `application`: Every `package.json` script references an existing file (II-A10)

### Article III: Test-First ✅

- Tests written BEFORE code (III-1)
- Red-Green-Blue cycle (III-2–III-4)
- Git history proves it

### Article V: Traceability ✅

- Code comments reference REQ-IDs (V-2)
- Tests reference REQ-IDs (V-4)
- Commit messages reference REQ-IDs

### Article VII: Simplicity (Code Size) ✅

- Each function SHALL contain at most 50 lines of code (VII-5)
- Each source file SHALL contain at most 500 lines of code (VII-4)
- Each source file other than an `index` file SHALL import at most 10 distinct modules (VII-6)
- These are the defaults: `code_limits` in `steering/rules/constitution-levels.yml` sets them, and `constitution.overrides.code_limits` in `steering/project.yml` overrides them per project
- A line of code is a line with something other than whitespace and comments; source files are the JavaScript and TypeScript files in core and delivery paths, without tests, type declarations and generated, vendored or template files
- The code-size limits are not Phase -1 Gate items: violations are reported at Article VII's level (CONST-007), as warnings by default

### Article IX: Integration Testing ✅

- Integration tests use real database (IX-1)
- Docker Compose for an isolated test DB (IX-2)
- Mocks only for services that are unavailable in the test environment, have usage limits or costs, or have no test environment, each justified in the test documentation (IX-4, IX-5)

---

**Execution**: Begin implementation now for the specified feature.
