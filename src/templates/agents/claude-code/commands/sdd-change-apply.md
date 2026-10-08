# SDD Change Apply Command

Apply a change proposal to the codebase.

---

## Instructions for GitHub Copilot

You are executing the `#sdd-change-apply [change-name]` command to implement an approved change proposal.

### Command Format

```bash
#sdd-change-apply add-2fa
#sdd-change-apply migrate-to-graphql
#sdd-change-apply refactor-auth-service
```

### Your Task

Implement the changes defined in the change proposal, following constitutional governance and best practices.

---

## Process

### 1. Read Change Proposal

**IMPORTANT**: Read the approved change proposal first:

```bash
# Read proposal
storage/changes/{{change-name}}-proposal.md
```

**Extract**:

- ADDED requirements
- MODIFIED requirements
- REMOVED requirements
- Implementation plan
- Testing requirements
- Success metrics

**Verify Approval**:

- Status must be "Approved" (not "Proposed" or "Rejected")
- If not approved, abort and notify user

---

### 2. Read Steering Context (Article VI)

```bash
# Read these files
steering/product.md      # Product context
steering/structure.md    # Architecture patterns
steering/tech.md         # Technology stack
steering/project.yml     # Constitution profile (library | cli | application)
```

---

### 3. Set Up Feature Flag

**Create Feature Flag** (for gradual rollout):

```typescript
// lib/feature-flags/flags.ts

export const FEATURE_FLAGS = {
  // ... existing flags ...

  enable_{{feature}}: {
    enabled: false,  // Start disabled
    description: '{{CHANGE_DESCRIPTION}}',
    rolloutPercentage: 0,
  },
} as const;
```

**Update Configuration**:

```typescript
// lib/feature-flags/config.ts

export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  if (process.env.NODE_ENV === 'test') {
    return true; // Always enabled in tests
  }

  const config = FEATURE_FLAGS[flag];
  if (!config.enabled) return false;

  // Gradual rollout logic
  return Math.random() * 100 < config.rolloutPercentage;
}
```

---

### 4. Implement Changes (Testable Core - Article I)

**Choose the variant by project profile**: read `constitution.profile` from `steering/project.yml` (default `library` when absent, P-2).

**For Each ADDED Requirement**:

#### Step 4.1: Create Core Module

**`library` / `cli` profile** (I-L1–I-L3):

```bash
# Create library directory
mkdir -p lib/{{feature}}/

# Create core files
touch lib/{{feature}}/index.ts
touch lib/{{feature}}/types.ts
touch lib/{{feature}}/{{feature}}.ts
touch lib/{{feature}}/{{feature}}.test.ts
touch lib/{{feature}}/cli.ts  # Article II: Automation Interface (II-L1)
```

**`application` profile** (I-A1, I-A2):

```bash
# Core module: folder under a core path, no own package.json
mkdir -p src/lib/{{feature}}/
touch src/lib/{{feature}}/index.ts
touch src/lib/{{feature}}/{{feature}}.ts
touch src/lib/{{feature}}/{{feature}}.test.ts  # Runs without the app server (I-2)

# Delivery: thin route handler (I-A3); no cli.ts (II-A3)
mkdir -p src/app/api/{{feature}}/
touch src/app/api/{{feature}}/route.ts
```

#### Step 4.2: Implement Core Logic

Paths below use the `library` layout; for the `application` profile, use `src/lib/{{feature}}/`.

**Test-First (Article III)**:

1. **RED**: Write failing test (III-2)

```typescript
// lib/{{feature}}/{{feature}}.test.ts

import { describe, it, expect } from 'vitest';
import { {{FeatureName}} } from './{{feature}}';

describe('{{FeatureName}}', () => {
  it('should {{requirement}}', () => {
    // Arrange
    const input = {{test-input}};

    // Act
    const result = new {{FeatureName}}().{{method}}(input);

    // Assert
    expect(result).toEqual({{expected-output}});
  });
});
```

2. **GREEN**: Implement to pass test (III-3)

```typescript
// lib/{{feature}}/{{feature}}.ts

export class {{FeatureName}} {
  {{method}}(input: {{InputType}}): {{OutputType}} {
    // Implementation
    return {{result}};
  }
}
```

3. **BLUE**: Refactor (improve code quality) while keeping all tests passing (III-4)

#### Step 4.3: Create Automation Interface (Article II)

**`library` / `cli` profile**: CLI with `--help` and conventional exit codes (II-L1–II-L5):

```typescript
// lib/{{feature}}/cli.ts

#!/usr/bin/env node

import { program } from 'commander';
import { {{FeatureName}} } from './{{feature}}';

program
  .name('{{feature}}')
  .description('{{DESCRIPTION}}')
  .version('1.0.0');

program
  .command('{{action}}')
  .description('{{ACTION_DESCRIPTION}}')
  .argument('<input>', 'Input parameter')
  .action(async (input) => {
    const feature = new {{FeatureName}}();
    const result = await feature.{{method}}(input);
    console.log(result);
  });

program.parse();
```

**Make executable**:

```bash
chmod +x lib/{{feature}}/cli.ts
```

**Add to package.json**:

```json
{
  "bin": {
    "{{feature}}": "./lib/{{feature}}/cli.ts"
  }
}
```

**`application` profile**: no CLI (II-A3). The HTTP API (route handlers, Step 4.4) is the automation interface (II-A1). WHEN the change adds an operational task (seeding, backfill), add `scripts/{{task}}.ts` with `--help`, an explicit target environment and `--dry-run` for production writes, registered in `package.json` (II-A6–II-A9, advisory); each script entry SHALL reference an existing file (II-A10):

```json
{
  "scripts": {
    "{{task}}": "tsx scripts/{{task}}.ts"
  }
}
```

#### Step 4.4: Integration Layer (Framework)

**`application` profile**: the route handler stays thin (I-A3). It validates input against a schema (e.g. zod), authorizes, calls core and returns a status plus an error code (II-4, II-A4, II-A5).

**Use Framework Features Directly (Article VIII: Anti-Abstraction)**:

```typescript
// app/api/{{feature}}/route.ts (Next.js)

import { NextRequest, NextResponse } from 'next/server';
import { {{FeatureName}} } from '@/lib/{{feature}}';
import { isFeatureEnabled } from '@/lib/feature-flags';

export async function POST(req: NextRequest) {
  // Feature flag check
  if (!isFeatureEnabled('enable_{{feature}}')) {
    return NextResponse.json(
      { error: 'Feature not enabled' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const feature = new {{FeatureName}}();

  try {
    const result = await feature.{{method}}(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

---

### 5. Modify Existing Code

**For Each MODIFIED Requirement**:

#### Step 5.1: Read Current Implementation

```bash
# Find current code: definition and callers (code index, when the project has one)
musubi-code refs {{ExistingFunction}}
musubi-code callers {{ExistingFunction}}

# The name in strings, docs and templates, or projects without a code index
grep -rn "{{existing-function}}" lib/
```

#### Step 5.2: Write Tests for New Behavior

```typescript
// lib/{{component}}/{{component}}.test.ts

describe('{{Component}} - Modified Behavior', () => {
  it('should {{new-behavior}}', () => {
    // Test new behavior
  });

  it('should maintain backward compatibility', () => {
    // Test old behavior still works (if applicable)
  });
});
```

#### Step 5.3: Update Implementation

```typescript
// lib/{{component}}/{{component}}.ts

export class {{Component}} {
  {{method}}(input: {{InputType}}): {{OutputType}} {
    // NEW: Updated logic
    {{new-implementation}}

    // Maintain backward compatibility
    if ({{legacy-condition}}) {
      return {{legacy-behavior}};
    }

    return {{new-behavior}};
  }
}
```

#### Step 5.4: Update Tests

```typescript
// Update existing tests to reflect new behavior
// Add new tests for new functionality
```

---

### 6. Remove Deprecated Code

**For Each REMOVED Requirement**:

#### Step 6.1: Mark as Deprecated First

```typescript
// lib/{{component}}/{{deprecated-feature}}.ts

/**
 * @deprecated Use {{alternative}} instead. Will be removed in v2.0.0
 * @see {@link {{alternative}}}
 */
export function {{deprecatedFunction}}() {
  console.warn('{{deprecatedFunction}} is deprecated. Use {{alternative}} instead.');
  // Keep implementation for now
}
```

#### Step 6.2: Add Deprecation Notice

```typescript
// Show deprecation warning
if (process.env.NODE_ENV !== 'production') {
  console.warn(`
    ⚠️  DEPRECATION WARNING
    
    The feature "{{feature}}" is deprecated and will be removed in version {{version}}.
    
    Migration: Use "{{alternative}}" instead.
    See: {{migration-guide-url}}
  `);
}
```

#### Step 6.3: Update Documentation

````markdown
## Migration Guide: {{DEPRECATED_FEATURE}}

### Timeline

- **Deprecation**: {{DATE}}
- **End of Life**: {{EOL_DATE}} ({{DAYS}} days notice)

### Migration Steps

1. Replace old code:

   ```typescript
   // ❌ OLD (deprecated)
   {{old-code}}

   // ✅ NEW (recommended)
   {{new-code}}
   ```

2. Update imports:

   ```typescript
   // ❌ OLD
   import { {{old-import}} } from '{{old-path}}';

   // ✅ NEW
   import { {{new-import}} } from '{{new-path}}';
   ```

3. Test changes
4. Deploy

### Breaking Changes

{{list-of-breaking-changes}}
````

---

### 7. Database Migrations

**If Schema Changes Required**:

#### Step 7.1: Create Migration

```bash
# Prisma example
npx prisma migrate dev --name {{change-name}}
```

#### Step 7.2: Write Migration Script

```sql
-- migrations/{{timestamp}}_{{change-name}}.sql

-- Backup existing data
CREATE TABLE {{table}}_backup AS SELECT * FROM {{table}};

-- Add new columns
ALTER TABLE {{table}} ADD COLUMN {{new-column}} {{type}};

-- Modify existing columns
ALTER TABLE {{table}} ALTER COLUMN {{column}} TYPE {{new-type}};

-- Remove deprecated columns (after deprecation period)
-- ALTER TABLE {{table}} DROP COLUMN {{old-column}};

-- Create indexes
CREATE INDEX idx_{{table}}_{{column}} ON {{table}}({{column}});
```

#### Step 7.3: Write Rollback Script

```sql
-- migrations/{{timestamp}}_{{change-name}}_rollback.sql

-- Restore from backup
DROP TABLE {{table}};
CREATE TABLE {{table}} AS SELECT * FROM {{table}}_backup;

-- Or reverse operations
ALTER TABLE {{table}} DROP COLUMN {{new-column}};
```

#### Step 7.4: Test Migration

```bash
# Test forward migration
npm run db:migrate

# Test rollback
npm run db:rollback

# Verify data integrity
npm run db:verify
```

---

### 8. Write Tests (Article III & IX)

**Test Coverage Requirements**:

- Coverage at or above the configured threshold, default 80% (III-6)
- Integration tests use real services instead of mocks (III-7, Article IX: IX-1)

#### Unit Tests

```typescript
// lib/{{feature}}/{{feature}}.test.ts

describe('{{FeatureName}}', () => {
  describe('{{method}}', () => {
    it('should handle valid input', () => {
      // Happy path
    });

    it('should reject invalid input', () => {
      // Error handling
    });

    it('should handle edge cases', () => {
      // Boundary conditions
    });
  });
});
```

#### Integration Tests (Article IX: Integration-First)

```typescript
// lib/{{feature}}/{{feature}}.integration.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

describe('{{FeatureName}} Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Use REAL database (test database)
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.TEST_DATABASE_URL }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should {{requirement}} with real database', async () => {
    // Arrange: Set up test data
    const testData = await prisma.{{model}}.create({
      data: {{test-data}}
    });

    // Act: Execute feature
    const feature = new {{FeatureName}}(prisma);
    const result = await feature.{{method}}(testData.id);

    // Assert: Verify result
    expect(result).toBeDefined();

    // Cleanup
    await prisma.{{model}}.delete({ where: { id: testData.id } });
  });
});
```

#### E2E Tests

```typescript
// tests/e2e/{{feature}}.spec.ts

import { test, expect } from '@playwright/test';

test.describe('{{Feature}} E2E Tests', () => {
  test('should complete {{workflow}}', async ({ page }) => {
    // Navigate
    await page.goto('/{{feature}}');

    // Interact
    await page.fill('input[name="{{field}}"]', '{{value}}');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

---

### 9. Update Traceability Matrix

**Create/Update Traceability Document**:

```markdown
## Traceability Matrix: {{CHANGE_NAME}}

| Requirement ID     | Design      | Implementation                  | Tests                   | Status |
| ------------------ | ----------- | ------------------------------- | ----------------------- | ------ |
| REQ-NEW-001        | Section 4.1 | lib/{{feature}}/{{file}}.ts:L25 | {{feature}}.test.ts:L40 | ✅     |
| REQ-AUTH-001 (MOD) | Section 7.2 | lib/auth/password.ts:L15        | password.test.ts:L30    | ✅     |
| REQ-AUTH-015 (REM) | -           | Deprecated                      | -                       | ⚠️     |

### Coverage

- Total Requirements: 15
- Implemented: 13 (87%)
- Tested: 13 (100% of implemented)
- Code Coverage: 85%
```

---

### 10. Constitutional Validation

**Run Validation** (Article I-IX):

```bash
# Profile: constitution.profile in steering/project.yml (default: library)

# Article I: Testable Core
# library / cli profile
ls -la lib/{{feature}}/  # Must exist
# application profile
ls -la src/lib/{{feature}}/  # Must exist (I-A1)
grep -rE "from '@/(app|components|hooks|contexts)/" src/lib/{{feature}}/  # Must be empty (I-3)
# all profiles: each exported function and class in core has a /** … */ doc comment above it (I-5, advisory)

# Article II: Automation Interface
# library / cli profile
ls -la lib/{{feature}}/cli.ts  # Must exist
./lib/{{feature}}/cli.ts --help  # Must work
# application profile (no CLI, II-A3)
ls -la src/app/api/{{feature}}/route.ts  # Must exist and validate input with a schema (II-A1, II-A4)
npm pkg get scripts  # Each script SHALL reference an existing file (II-A10)

# Article III: Test-First
npm test -- lib/{{feature}}/  # Must pass (application: src/lib/{{feature}}/)
npm run coverage  # Must be >= configured threshold, default 80% (III-6)

# Article IV: EARS Format
grep -E "WHEN|SHALL|IF|WHILE|WHERE" storage/changes/{{change-name}}-proposal.md

# Article V: Traceability
# Check traceability matrix exists and is complete

# Article VIII: Anti-Abstraction
# Verify framework APIs are called directly (VIII-1); wrappers need Phase -1 Gate approval (VIII-2)

# Article IX: Integration-First Testing
ls -la lib/{{feature}}/*.integration.test.ts  # Must exist and use real services (IX-1)
```

---

### 11. Update Steering (Auto-Update)

**After Implementation, Update Steering Files**:

```markdown
<!-- steering/structure.md -->

## Components

### {{Feature}} (Added: {{DATE}})

- **Location**: `lib/{{feature}}/`
- **Purpose**: {{DESCRIPTION}}
- **Pattern**: {{PATTERN}}
- **Dependencies**: {{DEPENDENCIES}}
```

```markdown
<!-- steering/tech.md -->

## Technology Stack

### New Dependencies ({{CHANGE_NAME}})

- `{{package}}@{{version}}` - {{PURPOSE}}
```

---

### 12. Save Implementation Summary

**Create Implementation Report**:

```markdown
# Implementation Report: {{CHANGE_NAME}}

## Metadata

- **Change ID**: CHG-{{NUMBER}}
- **Status**: Implemented
- **Implemented**: {{DATE}}
- **Implemented By**: {{AUTHOR}}

## Changes Applied

### ADDED

<!-- library / cli profile -->

- [ ] lib/{{feature}}/ - Core library ✅
- [ ] lib/{{feature}}/cli.ts - CLI interface ✅
- [ ] lib/{{feature}}/{{feature}}.test.ts - Tests ✅
- [ ] app/api/{{feature}}/route.ts - API endpoint ✅

<!-- application profile -->

- [ ] src/lib/{{feature}}/ - Core module ✅
- [ ] src/lib/{{feature}}/{{feature}}.test.ts - Tests ✅
- [ ] src/app/api/{{feature}}/route.ts - API endpoint (schema-validated) ✅

### MODIFIED

- [ ] lib/auth/password.ts - Updated hashing ✅
- [ ] lib/auth/password.test.ts - Updated tests ✅

### REMOVED

- [ ] lib/auth/remember-me.ts - Deprecated (EOL: {{DATE}}) ⚠️

## Test Results

### Coverage

- Unit Tests: 45 passed
- Integration Tests: 12 passed
- E2E Tests: 5 passed
- **Coverage**: 87% (target: 80%) ✅

### Performance

- P95 latency: 145ms (target: <200ms) ✅
- Throughput: 1250 req/s (target: >1000) ✅

## Constitutional Compliance

- **Profile**: {{PROFILE}} (from `steering/project.yml`)
- ✅ Article I: Testable Core
- ✅ Article II: Automation Interface (CLI for library/cli, HTTP API for application)
- ✅ Article III: Test-First (RED-GREEN-BLUE)
- ✅ Article IV: EARS Format
- ✅ Article V: Traceability Matrix Complete
- ✅ Article VI: Steering Updated
- ✅ Article VIII: No Unnecessary Abstractions
- ✅ Article IX: Integration Tests Included

## Deployment Readiness

- [ ] Feature flag created ✅
- [ ] Monitoring/alerts configured ✅
- [ ] Documentation updated ✅
- [ ] Rollback plan tested ✅
- [ ] Stakeholders notified ✅

## Next Steps

1. Merge PR: `feat: {{change-name}}`
2. Deploy to staging
3. Run smoke tests
4. Deploy to production (canary rollout)
5. Monitor metrics for 48 hours
6. Enable feature flag gradually (5% → 50% → 100%)
7. Archive change: `#sdd-change-archive {{change-name}}`
```

**Save To**: `storage/changes/{{change-name}}-implementation.md`

---

### 13. Generate Summary

```markdown
## ✅ Change Implementation Complete

**Change**: {{CHANGE_NAME}}
**Change ID**: CHG-{{NUMBER}}

### Implementation Summary:

- **Files Added**: [N]
- **Files Modified**: [N]
- **Files Deprecated**: [N]
- **Tests Written**: [N]
- **Test Coverage**: XX%

### Constitutional Compliance:

- ✅ All 9 articles verified

### Quality Metrics:

- ✅ Tests: [N] passed, 0 failed
- ✅ Coverage: XX% (>= 80%)
- ✅ Performance: Within SLA
- ✅ Security: Audit passed

### Deployment Status:

- Feature flag: Created (disabled)
- Staging: Not deployed
- Production: Not deployed

### Next Steps:

1. Review implementation
2. Merge PR
3. Deploy to staging
4. Enable feature flag gradually
5. Archive change: `#sdd-change-archive {{change-name}}`
```

---

## Validation Checklist

Before completing, verify:

- [ ] Change proposal read and understood
- [ ] Approval status verified
- [ ] Steering context applied
- [ ] Feature flag created
- [ ] Project profile read from `steering/project.yml` (default `library`)
- [ ] Feature logic in a core module with tests that run without the UI, server or CLI (Article I: I-1, I-2)
  - `library` / `cli`: library under `lib/{{feature}}/` (I-L1)
  - `application`: core module under `src/lib/{{feature}}/`, no UI-only code in core (I-A1, I-A4)
- [ ] Exported functions and classes of core modules have doc comments (Article I: I-5, advisory)
- [ ] Automation interface provided (Article II)
  - `library` / `cli`: CLI with `--help` (II-L1, II-L2)
  - `application`: route handler with schema validation (II-A1, II-A4); `package.json` scripts resolve (II-A10)
- [ ] Tests written first (Article III: III-1)
- [ ] Test coverage >= configured threshold, default 80% (III-6)
- [ ] Integration tests included, using real services (Article IX: IX-1)
- [ ] Traceability matrix updated
- [ ] Constitutional compliance verified
- [ ] Steering files updated
- [ ] Implementation report saved
- [ ] Summary presented to user

---

**Execution**: Begin change implementation now for the specified change.
