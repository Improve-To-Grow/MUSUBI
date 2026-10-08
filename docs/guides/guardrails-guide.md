# MUSUBI Guardrails System Guide

**Version**: 3.9.0  
**Last Updated**: 2025-12-09

---

## Overview

MUSUBI Guardrails provide input/output validation, safety checks, and constitutional compliance for AI workflows. Inspired by the [OpenAI Agents SDK](https://github.com/openai/agents-sdk) guardrails pattern.

---

## Quick Start

### CLI Usage

```bash
# Input validation
musubi-validate guardrails "user input here" --type input

# Output validation with PII redaction
musubi-validate guardrails "output content" --type output --redact

# Safety check with constitutional compliance (the content type is required)
musubi-validate guardrails --type safety --constitutional --content-type code --file src/feature.js

# Run guardrail chain
musubi-validate guardrails-chain "content" --parallel
```

### Programmatic Usage

```javascript
const { 
  InputGuardrail, 
  OutputGuardrail, 
  SafetyCheckGuardrail,
  GuardrailChain,
  createInputGuardrail,
  createOutputGuardrail
} = require('@improve-to-grow/musubi-sdd/src/orchestration/guardrails');

// Create guardrails
const inputGuardrail = createInputGuardrail('security');
const outputGuardrail = createOutputGuardrail('redact');

// Run validation
const inputResult = await inputGuardrail.run('user input');
const outputResult = await outputGuardrail.run('output content');

console.log(inputResult.passed);  // true/false
console.log(outputResult.content); // sanitized content
```

---

## Guardrail Types

### 1. InputGuardrail

Validates and sanitizes user input.

**Features**:
- Input sanitization (trim, normalize, escape)
- PII detection (email, phone, credit card, SSN)
- Injection attack prevention (SQL, XSS, command injection)
- Field-level validation

**Presets**:

| Preset | Description | Use Case |
|--------|-------------|----------|
| `userInput` | Standard user input validation | Forms, chat |
| `security` | Security-focused validation | Auth, payments |
| `strict` | Maximum validation | Sensitive data |
| `minimal` | Basic sanitization only | Trusted sources |

```javascript
// Using presets
const guard = createInputGuardrail('security');

// Custom configuration
const customGuard = new InputGuardrail({
  sanitize: {
    trim: true,
    normalizeWhitespace: true,
    removeHtml: true,
    escape: true,
    maxLength: 1000
  },
  detectPII: true,
  detectInjection: true,
  tripwire: true  // Fail immediately on violation
});
```

### 2. OutputGuardrail

Validates and sanitizes AI output.

**Features**:
- Sensitive data redaction
- Content policy enforcement
- Quality checks
- Format validation

**Redaction Patterns**:
- Email addresses → `[EMAIL REDACTED]`
- Phone numbers → `[PHONE REDACTED]`
- API keys → `[API_KEY REDACTED]`
- Passwords → `[PASSWORD REDACTED]`
- Connection strings → `[CONNECTION_STRING REDACTED]`

**Presets**:

| Preset | Description | Use Case |
|--------|-------------|----------|
| `safe` | Basic content safety | General output |
| `security` | Security-focused | Auth, secrets |
| `strict` | Maximum sanitization | Production |
| `redact` | Aggressive redaction | PII protection |

```javascript
// Using presets
const guard = createOutputGuardrail('redact');

// Custom configuration
const customGuard = new OutputGuardrail({
  redact: {
    email: true,
    phone: true,
    apiKey: true,
    password: true,
    connectionString: true
  },
  maxLength: 10000,
  tripwire: false  // Continue on violation
});
```

### 3. SafetyCheckGuardrail

Content safety, plus constitutional compliance when `enforceConstitution` is on.

**Safety Levels**:

| Level | Rules | Use Case |
|-------|-------|----------|
| `basic` | Content required | Development |
| `standard` | Required, max 50,000 characters, SQL and XSS injection | Default |
| `strict` | Required, max 50,000 characters, SQL, XSS and command injection, PII | Production |
| `paranoid` | Required, max 10,000 characters, all injection, PII, prohibited words | Security-critical |

Injection detection targets untrusted text. For typed artifacts (`context.contentType` set to `code`, `test`, `requirements` or `design`) it is skipped, because code and documents legitimately contain braces, `--` flags, table rules and comments. The other rules still apply.

**Phase**: the guardrail checks what a skill produces, so its default phase is `post` (see [With Skill Execution](#with-skill-execution)). Use `InputGuardrail` for skill input, or pass `phase: 'pre'` or `'both'`.

```javascript
const { SafetyCheckGuardrail, SafetyLevel } = require('@improve-to-grow/musubi-sdd/src/orchestration/guardrails');

const safetyGuard = new SafetyCheckGuardrail({
  level: SafetyLevel.STRICT,
  enforceConstitution: true,   // check the nine articles (needs context.contentType)
  projectRoot: process.cwd(),  // the project's profile, article levels and code limits
});

const result = await safetyGuard.run(generatedCode, {
  contentType: 'code',
  filePath: 'src/lib/auth/service.ts',
});
console.log(result.passed);
console.log(result.metadata.articleScores); // { I: 1, II: 'not-applicable', ... }
```

---

## GuardrailChain

Compose multiple guardrails for pipeline execution.

```javascript
const { GuardrailChain, InputGuardrail, OutputGuardrail, SafetyCheckGuardrail } = require('@improve-to-grow/musubi-sdd/src/orchestration/guardrails');

// Create chain
const chain = new GuardrailChain([
  new InputGuardrail({ preset: 'security' }),
  new SafetyCheckGuardrail({ level: 'HIGH' }),
  new OutputGuardrail({ preset: 'redact' })
], {
  parallel: false,       // Sequential execution
  stopOnFail: true,      // Stop on first failure
  aggregateResults: true // Collect all results
});

// Run chain
const result = await chain.run(content);
console.log(result.passed);      // All guardrails passed
console.log(result.violations);  // Array of violations
console.log(result.results);     // Individual guardrail results
```

### Parallel Execution

```javascript
const chain = new GuardrailChain([
  new InputGuardrail(),
  new SafetyCheckGuardrail(),
  new OutputGuardrail()
], {
  parallel: true  // Run all guardrails concurrently
});

// Faster for independent checks
const result = await chain.run(content);
```

---

## GuardrailRules DSL

Build custom validation rules with fluent API.

```javascript
const { RuleBuilder, RuleRegistry, CommonRuleSets } = require('@improve-to-grow/musubi-sdd/src/orchestration/guardrails');

// Build custom rules
const customRules = new RuleBuilder()
  .required()
  .minLength(10)
  .maxLength(1000)
  .pattern(/^[a-zA-Z0-9\s]+$/, 'Alphanumeric only')
  .noPII()
  .noInjection()
  .noHarmful()
  .custom((value) => !value.includes('forbidden'), 'Contains forbidden word')
  .build();

// Use built-in rule sets
const securityRules = CommonRuleSets.security;
const strictRules = CommonRuleSets.strictContent;

// Register custom rule set
RuleRegistry.register('myRules', customRules);

// Retrieve later
const rules = RuleRegistry.get('myRules');
```

### Built-in Rule Sets

| Rule Set | Description |
|----------|-------------|
| `security` | Security-focused (injection, XSS) |
| `strictContent` | Strict content validation |
| `userInput` | Standard user input rules |
| `agentOutput` | Agent output validation |

---

## CLI Reference

### guardrails Command

```bash
musubi-validate guardrails [content] [options]

Options:
  --file <path>          Read content from file (also the content's path for --constitutional)
  -t, --type <type>      Guardrail type: input, output, safety (default: input)
  -l, --level <level>    Safety level: basic, standard, strict, paranoid (default: standard)
  --constitutional       Enable constitutional compliance checks (needs --content-type)
  --content-type <type>  Artifact type of the content: code, test, requirements, design
  --redact               Enable redaction for output guardrails
  -f, --format <type>    Output format: console, json (default: console)
```

`--constitutional` without a valid `--content-type` exits with code 1 before checking anything.

### guardrails-chain Command

```bash
musubi-validate guardrails-chain [content] [options]

Options:
  --parallel           Run guardrails in parallel
  --stop-on-fail       Stop on first failure
  --types <types>      Comma-separated guardrail types
  --file <path>        Read content from file
  --output <path>      Write result to file
```

### Examples

```bash
# Validate user input
musubi-validate guardrails "Hello, my email is test@example.com" --type input

# Check a source file against the constitution
musubi-validate guardrails --type safety --level strict --constitutional --content-type code --file src/feature.js

# Check a requirements document for EARS
musubi-validate guardrails --type safety --constitutional --content-type requirements --file storage/specs/auth-requirements.md

# Redact PII from output
musubi-validate guardrails "Contact: john@example.com, 555-1234" --type output --redact

# Run full chain
musubi-validate guardrails-chain "user content here" --parallel

# Batch validation
for file in src/*.js; do
  musubi-validate guardrails --type safety --constitutional --content-type code --file "$file"
done
```

---

## Integration Examples

### With Skill Execution

`SkillExecutor` runs its guardrails around each skill: guardrails with phase `pre` check the skill input before the skill runs, guardrails with phase `post` check the skill output after it, and `both` runs in both. `InputGuardrail` defaults to `pre`, `OutputGuardrail` and `SafetyCheckGuardrail` to `post`.

Each guardrail gets the content and a context that says what it is:

- `skillId`, `executionId` and `phase`
- `contentType`: from the output (`output.contentType`), the caller (`guardrailContext.contentType`) or the skill metadata (`contentType: 'code' | 'test' | 'requirements' | 'design'`)
- `filePath`: from the output (`output.filePath`) or the caller
- everything in `options.guardrailContext` (e.g. `projectRoot`, `testsWritten`, `requirementId`)

A failing guardrail fails the execution with `Guardrail '<name>' failed (<phase>): <reason> [<codes>]`. A failing `pre` guardrail stops the skill from running. Each outcome is recorded in `result.guardrails`.

```javascript
const { SkillExecutor } = require('@improve-to-grow/musubi-sdd/src/orchestration/skill-executor');
const {
  createInputGuardrail,
  SafetyCheckGuardrail,
} = require('@improve-to-grow/musubi-sdd/src/orchestration/guardrails');

registry.registerSkill(
  { id: 'implement-service', name: 'Implement Service', contentType: 'code' },
  async input => ({ content: generateCode(input), filePath: 'src/lib/auth/service.ts' })
);

const executor = new SkillExecutor(registry);
executor.addGuardrail(createInputGuardrail('userInput')); // pre: the request
executor.addGuardrail(new SafetyCheckGuardrail({ enforceConstitution: true })); // post: the code

const result = await executor.execute('implement-service', request, {
  guardrailContext: { projectRoot: process.cwd(), requirementId: 'REQ-AUTH-001' },
});
console.log(result.guardrails); // [{ phase: 'pre', ... }, { phase: 'post', ... }]
```

### With Swarm Pattern

```javascript
const result = await engine.execute({
  pattern: PatternType.SWARM,
  input: {
    tasks: [...],
    guardrails: {
      input: { preset: 'security' },
      output: { preset: 'redact' },
      safety: { level: 'HIGH', constitutional: true }
    }
  }
});
```

### With Human-in-Loop

```javascript
const result = await engine.execute({
  pattern: PatternType.HUMAN_IN_LOOP,
  input: {
    skills: ['code-generator'],
    checkpoints: [{
      after: 'code-generator',
      guardrails: [
        { type: 'safety', level: 'HIGH' },
        { type: 'output', preset: 'security' }
      ],
      message: 'Review generated code for security'
    }]
  }
});
```

---

## Tripwire Behavior

Tripwire mode causes immediate failure on violation.

```javascript
// With tripwire (throws exception)
const strictGuard = new InputGuardrail({
  tripwire: true,
  detectInjection: true
});

try {
  await strictGuard.run("SELECT * FROM users; DROP TABLE users;");
} catch (error) {
  // GuardrailTripwireException thrown
  console.log(error.violation);
  console.log(error.guardrail);
}

// Without tripwire (returns result)
const lenientGuard = new InputGuardrail({
  tripwire: false,
  detectInjection: true
});

const result = await lenientGuard.run("SELECT * FROM users");
console.log(result.passed);     // false
console.log(result.violations); // ['SQL injection detected']
```

---

## Constitutional Compliance

The constitution governs artifacts, so a guardrail checks content against it only as the artifact it is. Set `context.contentType` to `code`, `test`, `requirements` or `design`. Content without a content type, or with an unknown one, is unclassified: the check fails with `CONSTITUTIONAL_UNCLASSIFIED`, and every article is scored not applicable.

```javascript
const { SafetyCheckGuardrail, NOT_APPLICABLE } = require('@improve-to-grow/musubi-sdd/src/orchestration/guardrails');

const guard = new SafetyCheckGuardrail({ enforceConstitution: true });

const result = await guard.run(codeContent, { contentType: 'code', requirementId: 'REQ-001' });

result.metadata.constitutionalViolations; // findings with context.requirement, e.g. 'V-2'
result.metadata.articleScores; // { I: NOT_APPLICABLE, ..., V: 1, VII: 1, VIII: 1, ... }
result.metadata.scores.constitutional; // mean of the applicable articles, or null
```

Each article is scored 1 without findings, 0.5 with warnings only, 0 with an error, and `'not-applicable'` (`NOT_APPLICABLE`) when it does not apply to the content. Only applicable articles count towards the constitutional score.

### Articles Checked

The safety guardrail checks the nine articles of `steering/rules/constitution.md`, with the same rules as the CI checker (`src/constitutional/articles.js`). An article applies only when the content type and `context` give it something to check:

| Article | Requirements | Applies when |
| ------- | ------------ | ------------ |
| I Testable-Core Principle | I-3, I-5 (advisory), I-A4, I-A5 | `code` whose `filePath` is under a core path |
| II Automation Interface Mandate | II-A4 | `code` whose `filePath` is a route handler of an `application` |
| III Test-First Imperative | III-1 | `code` with a boolean `context.testsWritten` |
| IV EARS Requirements Format | IV-1, IV-2 | `requirements` |
| V Traceability Mandate | V-2, V-4, V-5 | `code` and `test` (a requirement ID in the content, or `requirementId`/`specId` in the context); `design` (V-5: a table that lists requirement IDs) |
| VI Project Memory | VI-4 | any type, with a boolean `context.steeringLoaded` |
| VII Simplicity Gate | VII-2, VII-4, VII-5, VII-6 | VII-2: a numeric `context.projectCount`. VII-4–VII-6: `code` (with a `filePath` and a known profile, a source file in a core or delivery path) |
| VIII Anti-Abstraction Gate | VIII-2 | `code`; approved with `phaseMinusOneApproved` or `runtimeConstraintDocumented` |
| IX Integration-First Testing | IX-5 | `test` whose `filePath` is an integration test |

Severity follows the article levels of the project profile (`constitution-levels.yml`, `constitution.levels` in `steering/project.yml`). Findings in critical articles are errors and fail the check. Among Articles VII and VIII, only the Phase -1 Gate findings (VII-2, VIII-2) are errors. The code-size findings (VII-4–VII-6) are warnings at Article VII's level (CONST-007), unless the project promotes CONST-007 to critical. Findings in advisory articles, and requirements tagged _(advisory)_ such as I-5, are warnings. Pass `projectRoot` (in the config or `context`) to use a project's profile and levels; without it, the `library` defaults apply, or the defaults of `context.profile`.

The code-size limits come from `code_limits` in `constitution-levels.yml` and `constitution.overrides.code_limits` in `steering/project.yml` (defaults: 500 lines of code per file, 50 per function, 10 imports per file). `context.codeLimits` overrides them for a single check, e.g. `{ maxFunctionLines: 80 }` (keys `maxFileLines`, `maxFunctionLines`, `maxImports`).

```javascript
const guard = new SafetyCheckGuardrail({ enforceConstitution: true, projectRoot: process.cwd() });

const result = await guard.run(generatedCode, {
  contentType: 'code',
  filePath: 'src/lib/auth/service.ts',
  requirementId: 'REQ-AUTH-001',
  testsWritten: true,
});
```

Agent boundaries are a separate safety check: when `context.allowedAgents` is set, an `agentId` outside the list fails the check (`AGENT_BOUNDARY`).

---

## Best Practices

1. **Layer Guardrails**: Use chain for defense in depth
2. **Set Appropriate Levels**: Match safety level to context
3. **Enable Tripwire for Critical**: Use tripwire for security-critical paths
4. **Redact in Production**: Always redact PII in production
5. **Log Violations**: Track and analyze guardrail violations
6. **Test Your Rules**: Unit test custom rule sets
7. **Constitutional in CI**: Add constitutional checks to CI/CD

---

## Related Documentation

- [Orchestration Patterns](./orchestration-patterns.md)
- [Constitutional Governance](../steering/rules/constitution.md)
- [CLI Reference](./cli-reference.md)
- [Security Auditor Skill](../skills/security-auditor.md)
