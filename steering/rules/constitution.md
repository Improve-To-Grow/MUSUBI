# Constitutional Governance

**Version**: 1.1
**Status**: Immutable
**Enforcement**: Mandatory via `constitution-enforcer` skill

---

## Overview

This document defines the 9 Constitutional Articles that govern all development activities in this project. These articles are **immutable** and must be enforced at every stage of the SDD workflow.

**Enforcement Agent**: The `constitution-enforcer` skill validates compliance with these articles before proceeding to implementation.

### Requirement Notation

Every article and the Project Profiles section state their rules as EARS requirements (see Article IV and `steering/rules/ears-format.md`). Each requirement has an ID for traceability.

- `SHALL` and `SHALL NOT` are binding at the article's enforcement level (see [Project Profiles](#project-profiles)).
- `WHERE the project profile is …` limits a requirement to that profile. A requirement without a profile clause applies to every profile.
- A requirement tagged _(advisory)_ produces a warning, never a block, even when its article is critical.
- A requirement whose subject is the `constitution-enforcer` states what the enforcer accepts or does not demand.

---

## Project Profiles

The project profile states what kind of software the project builds. It decides how Articles I and II are met.

| Profile       | Use for                                                   |
| ------------- | --------------------------------------------------------- |
| `library`     | Packages that are published or shared with other projects |
| `cli`         | Command-line tools                                        |
| `application` | Web apps and services deployed as one unit                |

The profile and its paths are declared in `steering/project.yml`:

```yaml
constitution:
  profile: application # library | cli | application
  core_paths: [src/lib] # where feature logic lives
  delivery_paths: # pages, routes, UI, CLI entry points
    [src/app, src/components, src/hooks, src/contexts]
  adapter_paths: [] # request-context code, e.g. src/lib/server/authorization
  levels: # optional per-article override
    CONST-001: advisory
```

### Requirements

- **P-1** The project SHALL declare its profile as `constitution.profile` in `steering/project.yml`, with the value `library`, `cli` or `application`.
- **P-2** IF `steering/project.yml` declares no profile, THEN the `constitution-enforcer` SHALL apply the `library` profile.
- **P-3** IF a `library` or `cli` project declares no `core_paths`, THEN the `constitution-enforcer` SHALL use `lib/` and `packages/` as core paths.
- **P-4** WHERE the project profile is `application`, `steering/project.yml` SHALL declare `core_paths` and `delivery_paths`.
- **P-5** The `constitution-enforcer` SHALL apply the default article levels of the declared profile, as listed in the table below.
- **P-6** WHERE `steering/project.yml` declares a level for an article under `constitution.levels`, the `constitution-enforcer` SHALL apply that level instead of the profile default.

### Default Levels per Profile

| Article        | `library` | `cli`    | `application` |
| -------------- | --------- | -------- | ------------- |
| I (CONST-001)  | critical  | critical | advisory      |
| II (CONST-002) | advisory  | critical | advisory      |

Articles III–IX keep the levels in `steering/rules/constitution-levels.yml` for every profile. `library` keeps the v1.0 levels. `application` starts at advisory so that adopting MUSUBI in an existing app does not block on day one. Once the core/delivery boundary check is clean, the project promotes CONST-001 to `critical` through `constitution.levels`.

---

## Article I: Testable-Core Principle

**Statement**: The project SHALL keep feature logic in core modules that have an explicit public interface and can be tested without the delivery mechanism (UI, HTTP server, terminal).

**Terms**: A _core path_ holds feature logic. A _delivery path_ holds the code that delivers it: pages, route handlers, server actions, UI components and CLI entry points. An _adapter path_ holds request-context code that core logic depends on (`application` profile only). The project profile determines which paths are which.

### Requirements (all profiles)

- **I-1** The project SHALL place feature logic under a core path.
- **I-2** Each core module SHALL have tests that run without starting the app, a browser or a CLI.
- **I-3** A core module SHALL NOT import from a delivery path.
- **I-4** The `constitution-enforcer` SHALL NOT report the direct use of a framework or platform SDK in a core module as a violation (consistent with Article VIII).
- **I-5** Each exported function and class of a core module SHALL have a doc comment (`/** … */`) directly above its declaration. _(advisory)_

### Profile `library` and `cli` (packages that are published or shared, and command-line tools)

- **I-L1** WHERE the project profile is `library` or `cli`, each feature SHALL start as a standalone library under a core path (by default `lib/<feature>/` or `packages/<feature>/`, see P-3).
- **I-L2** WHERE the project profile is `library` or `cli`, each library SHALL have its own test suite.
- **I-L3** WHERE the project profile is `library` or `cli`, each library SHALL export a public API.
- **I-L4** WHERE the project profile is `library` or `cli`, each library SHALL be buildable independently.
- **I-L5** WHERE the project profile is `library` or `cli`, each library SHALL be versionable independently.
- **I-L6** WHERE the project profile is `library` or `cli`, a library SHALL NOT depend on application code.
- **I-L7** WHERE the project profile is `library` or `cli`, the `constitution-enforcer` SHALL NOT require a library to be published to a package registry.

### Profile `application` (web apps and services deployed as one unit)

- **I-A1** WHERE the project profile is `application`, each core module SHALL be a folder under a declared core path, for example `src/lib/<domain>/`.
- **I-A2** WHERE the project profile is `application`, the `constitution-enforcer` SHALL NOT require a core module to have its own `package.json`, independent deployment or publication.
- **I-A3** WHERE the project profile is `application`, the delivery layer (route handlers, server actions, pages, components) SHALL limit itself to validating input, authorizing, calling core and shaping the response. _(advisory)_
- **I-A4** WHERE the project profile is `application`, a core path SHALL NOT contain UI-only code (components, React hooks, providers).
- **I-A5** WHERE the project profile is `application`, request-context APIs (e.g. `next/headers`, `next/server`) SHALL be used only in delivery paths or declared adapter paths. _(advisory)_
- **I-A6** WHERE the project profile is `application`, WHEN a core module gains a second consumer (another app, a Functions package, a worker), the project SHALL extract that module into a package.
- **I-A7** WHERE the project profile is `application`, WHILE a core module has a single consumer, the project SHALL keep that module inside the application.

### Rationale

- Keeps the original goals: modularity, isolated testing, low coupling
- In an application the app is the unit of deployment, so packaging each feature adds build and versioning cost with no consumer
- Allowing direct SDK use removes the conflict with Article VIII
- A documented export makes the public interface explicit, as the statement requires

### Validation Checklist

- [ ] Profile declared in `steering/project.yml` (P-1); core and delivery paths declared for `application` (P-4)
- [ ] design.md names the core module for each feature (I-1)
- [ ] Core module has tests that run without the app server (I-2)
- [ ] No imports from delivery paths into core paths (I-3)
- [ ] Exported functions and classes of core modules have doc comments (I-5, advisory)
- [ ] (`library`, `cli`) Feature starts as a library with its own test suite and public API (I-L1–I-L3)
- [ ] (`library`, `cli`) Library builds and versions independently and has no application imports (I-L4–I-L6)
- [ ] (`application`) No UI-only code in core paths (I-A4)
- [ ] (`application`) Route handlers and server actions delegate to core (I-A3)

---

## Article II: Automation Interface Mandate

**Statement**: The project SHALL make its primary functionality reachable through a documented, scriptable interface that does not require the UI.

The project profile determines the form of that interface: a CLI for `library` and `cli`, an HTTP API for `application`.

### Requirements (all profiles)

- **II-1** The project SHALL make each feature's primary operations callable without the UI.
- **II-2** The project SHALL document its automation interface through help text or a schema.
- **II-3** The automation interface SHALL use consistent naming and argument conventions across operations.
- **II-4** IF an operation called through the automation interface fails, THEN the interface SHALL return a machine-readable error (a non-zero exit code, or an HTTP status plus an error code).

### Profile `library` and `cli`

- **II-L1** WHERE the project profile is `library` or `cli`, each library SHALL provide a CLI that exposes its primary functionality.
- **II-L2** WHERE the project profile is `library` or `cli`, the CLI SHALL provide `--help` output with usage examples.
- **II-L3** WHERE the project profile is `library` or `cli`, the CLI SHALL use the same flag for the same option across commands.
- **II-L4** WHERE the project profile is `library` or `cli`, WHEN a CLI command succeeds, the CLI SHALL exit with code 0.
- **II-L5** WHERE the project profile is `library` or `cli`, IF a CLI command fails, THEN the CLI SHALL exit with a non-zero code.
- **II-L6** WHERE the project profile is `library` or `cli`, the `constitution-enforcer` SHALL accept a CLI that delegates to the library API.

Under the `library` profile, Article II defaults to advisory because internal libraries may not need a CLI (see [Project Profiles](#project-profiles)).

### Profile `application`

- **II-A1** WHERE the project profile is `application`, the project SHALL provide its automation interface as an HTTP API (route handlers).
- **II-A2** WHERE the project profile is `application`, the `constitution-enforcer` SHALL accept a core module function as the non-UI entry point for internal callers and tests.
- **II-A3** WHERE the project profile is `application`, the `constitution-enforcer` SHALL NOT require a CLI.
- **II-A4** WHERE the project profile is `application`, WHEN a machine-facing endpoint (webhook, n8n flow, integration) receives a request, the endpoint SHALL validate the input against a schema.
- **II-A5** WHERE the project profile is `application`, each machine-facing endpoint SHALL return the status and error codes documented for it.
- **II-A6** WHERE the project profile is `application`, the project SHALL implement each operational task (seeding, user creation, backfills, restores) as a script in `scripts/` that is registered in `package.json`. _(advisory)_
- **II-A7** WHERE the project profile is `application`, each operational script SHALL provide `--help`. _(advisory)_
- **II-A8** WHERE the project profile is `application`, each operational script SHALL require an explicit target environment. _(advisory)_
- **II-A9** WHERE the project profile is `application` and an operational script writes to production, the script SHALL support a dry run. _(advisory)_
- **II-A10** WHERE the project profile is `application`, each `package.json` script SHALL reference a file that exists.

### Rationale

- Keeps the original goals: scriptability, testing without UI, CI/CD integration
- Machines talk to applications over HTTP, so that is the interface worth keeping stable and documented

### Validation Checklist

- [ ] Primary operations reachable without the UI: CLI command, route handler or core function (II-1)
- [ ] Interface documented: `--help`, schema or API doc (II-2)
- [ ] Machine-readable errors: exit codes, or status plus error code (II-4)
- [ ] (`library`, `cli`) CLI with `--help`, consistent flags and conventional exit codes (II-L1–II-L5)
- [ ] (`application`) Machine-facing endpoints validate input against a schema (II-A4)
- [ ] (`application`) All `package.json` scripts resolve to existing files (II-A10)

---

## Article III: Test-First Imperative

**Statement**: The developer SHALL write tests before the implementation that satisfies them (Red-Green-Blue cycle).

### Requirements

- **III-1** The developer SHALL write each test before the production code that makes it pass.
- **III-2** WHEN the developer starts a new behavior, the developer SHALL first write a test that fails (**Red**).
- **III-3** WHEN a failing test exists, the developer SHALL write the minimal code that makes it pass (**Green**).
- **III-4** WHEN the test passes, the developer SHALL refactor while keeping all tests passing (**Blue**).
- **III-5** The test suite SHALL cover every EARS requirement of the feature.
- **III-6** The test suite SHALL reach the configured coverage threshold (`coverage_threshold` in `steering/rules/constitution-levels.yml`, default 80%).
- **III-7** Integration tests SHALL use real services, as Article IX defines.

### Rationale

- Ensures requirements are testable
- Prevents over-engineering
- Provides executable specifications
- Enables safe refactoring

### Validation Checklist

- [ ] Tests exist before implementation (III-1)
- [ ] All EARS requirements have corresponding tests (III-5)
- [ ] Test coverage ≥ configured threshold, default 80% (III-6)
- [ ] Tests follow Red-Green-Blue evidence in git history (III-2–III-4)
- [ ] No production code without tests (III-1)

---

## Article IV: EARS Requirements Format

**Statement**: Every requirement SHALL use EARS (Easy Approach to Requirements Syntax) format.

### Requirements

- **IV-1** Each requirement SHALL use one of the 5 EARS patterns:
  1. **Event-driven**: `WHEN [event], the [system] SHALL [response]`
  2. **State-driven**: `WHILE [state], the [system] SHALL [response]`
  3. **Unwanted behavior**: `IF [error], THEN the [system] SHALL [response]`
  4. **Optional features**: `WHERE [feature enabled], the [system] SHALL [response]`
  5. **Ubiquitous**: `The [system] SHALL [requirement]`
- **IV-2** Each requirement SHALL have a single interpretation.
- **IV-3** Each requirement SHALL include acceptance criteria.
- **IV-4** Each requirement SHALL be traceable to design and tests (see Article V).

### Rationale

- Eliminates ambiguity
- Improves testability
- Enables traceability
- Standardizes requirements format

### Validation Checklist

- [ ] All requirements use EARS patterns (IV-1)
- [ ] Requirements are unambiguous, with a single interpretation (IV-2)
- [ ] Acceptance criteria defined (IV-3)
- [ ] Requirements mapped to tests, see `traceability-auditor` (IV-4)
- [ ] Requirements reviewed by stakeholders

**Reference**: See `steering/rules/ears-format.md` for complete EARS guide.

---

## Article V: Traceability Mandate

**Statement**: The project SHALL maintain 100% traceability between Requirements ↔ Design ↔ Code ↔ Tests.

### Requirements

- **V-1** Each requirement SHALL map to at least one design decision (architecture, API, database).
- **V-2** Each requirement SHALL map to its implementation (source files, functions).
- **V-3** Each requirement SHALL map to at least one test (test case, scenario).
- **V-4** Each test SHALL reference the ID of the requirement it verifies.
- **V-5** Each design document SHALL include a requirements coverage matrix.
- **V-6** Each task breakdown SHALL map its tasks to requirements.

### Rationale

- Ensures nothing is missed
- Validates completeness
- Enables impact analysis
- Facilitates audits and compliance

### Validation Checklist

- [ ] Requirements have unique IDs (REQ-XXX-NNN)
- [ ] Design documents include requirements matrix (V-1, V-5)
- [ ] Code comments reference requirement IDs (V-2)
- [ ] Tests reference requirement IDs in descriptions (V-3, V-4)
- [ ] Task breakdown maps tasks to requirements (V-6)
- [ ] `traceability-auditor` validation passes

**Enforcement Agent**: Use `traceability-auditor` skill to validate coverage.

---

## Article VI: Project Memory (Steering System)

**Statement**: Each skill SHALL consult project memory (steering files) before making decisions.

### Requirements

- **VI-1** `steering/structure.md` SHALL define the architecture patterns.
- **VI-2** `steering/tech.md` SHALL define the technology stack.
- **VI-3** `steering/product.md` SHALL define the business context.
- **VI-4** WHEN a skill starts executing, the skill SHALL read the steering files first.
- **VI-5** WHEN the architecture, technology stack or business context changes, the project SHALL update the affected steering files.
- **VI-6** WHEN a change to a steering file is proposed, the project SHALL obtain stakeholder approval before applying it.

### Rationale

- Ensures consistency across skills
- Provides project context to AI agents
- Prevents architectural drift
- Enables autonomous decision-making

### Validation Checklist

- [ ] Steering files exist and are current (VI-1–VI-3, VI-5)
- [ ] Skill reads steering files before execution (VI-4)
- [ ] Decisions align with steering context
- [ ] Changes to steering are documented and approved (VI-6)
- [ ] Steering sync performed regularly (VI-5)

**Management Agent**: Use `steering` skill to generate/update project memory.

---

## Article VII: Simplicity Gate (Phase -1 Gate)

**Statement**: The initial architecture SHALL contain at most 3 projects, and the source code SHALL stay within the size limits of VII-4 to VII-6.

**Terms**:

- A _project_ is an independently deployable unit.
- A _source file_ is a JavaScript or TypeScript file (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`, `.mts`, `.cts`) in a core or delivery path. Tests (`*.test.*`, `*.spec.*`), type declarations (`*.d.ts`) and generated, vendored or template files are not source files.
- A _line of code_ is a line that contains something other than whitespace and comments.
- A _function_ is a function declaration or expression, an arrow function with a block body, or a method. Its length is the number of lines of code from the line where it starts to the line of its closing brace, nested functions included.
- An _import_ is a distinct module that a file loads with `import`, `export … from`, `require()` or `import()`.

### Requirements

- **VII-1** The initial architecture SHALL NOT exceed 3 projects.
- **VII-2** IF a design needs more than 3 projects, THEN implementation of the additional projects SHALL NOT begin before Phase -1 Gate approval.
- **VII-3** IF a design needs more than 3 projects, THEN design.md SHALL justify each additional project with business requirements, technical constraints and a team capacity analysis.

### Code-Size Limits

- **VII-4** Each source file SHALL contain at most the configured maximum of lines of code (`code_limits.max_file_lines` in `steering/rules/constitution-levels.yml`, default 500).
- **VII-5** Each function SHALL contain at most the configured maximum of lines of code (`code_limits.max_function_lines`, default 50).
- **VII-6** Each source file other than an `index` file SHALL import at most the configured maximum of distinct modules (`code_limits.max_imports`, default 10).

An `index` file collects a module's public API, so its imports grow with the API and VII-6 does not apply to it.

### Rationale

- Prevents premature complexity
- Reduces coordination overhead
- Enables faster iteration
- Forces prioritization
- The default limits follow established tools: 50 lines per function is ESLint's `max-lines-per-function` default, 10 imports is the `max-dependencies` default of eslint-plugin-import, and 500 lines per file is the upper limit Robert C. Martin reports for the files of significant systems in _Clean Code_

### Validation Checklist

- [ ] Project count ≤ 3 initially (VII-1)
- [ ] Each project has clear purpose
- [ ] Projects are independently deployable
- [ ] Additional projects have Phase -1 Gate approval (VII-2)
- [ ] Complexity justified in design.md (VII-3)
- [ ] Source files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10, or the configured limits (VII-4–VII-6)

**Phase -1 Gate**: Requires `system-architect` + `project-manager` approval before exceeding 3 projects (VII-2). The code-size limits (VII-4–VII-6) are not gated: violations are reported at the article's level (CONST-007).

---

## Article VIII: Anti-Abstraction Gate (Phase -1 Gate)

**Statement**: The project SHALL use framework features directly, without custom abstraction layers.

### Requirements

- **VIII-1** The project SHALL call framework APIs directly.
- **VIII-2** The project SHALL NOT build a custom abstraction layer or wrapper library over a framework without Phase -1 Gate approval, except for a runtime-constraint client (VIII-4).
- **VIII-3** IF a design proposes an abstraction over a framework, THEN its Phase -1 Gate request SHALL include a multi-framework support justification, a team expertise analysis and a migration path.

### Rationale

- Prevents over-engineering
- Reduces maintenance burden
- Leverages framework best practices
- Enables framework updates

### Validation Checklist

- [ ] Framework APIs used directly in application code (VIII-1)
- [ ] No custom wrapper libraries around frameworks without gate approval (VIII-2)
- [ ] Framework-specific features leveraged
- [ ] Abstractions justified with multi-framework need (VIII-3), or runtime constraint documented in design.md (VIII-5)
- [ ] Team has framework expertise

**Phase -1 Gate**: Requires `system-architect` + `software-developer` approval for abstraction layers.

**Example Violations**:

- Creating `MyDatabase` wrapper around Prisma/TypeORM
- Building custom `HttpClient` wrapper around axios/fetch
- Implementing custom `Logger` abstraction over framework logging

**Valid Abstractions**:

- Multi-framework support (e.g., database library supporting Prisma AND TypeORM)
- Domain-specific abstractions (e.g., `PaymentGateway` interface with multiple providers)
- Runtime constraint, as defined by VIII-4 and VIII-5

**Runtime-Constraint Requirements**:

- **VIII-4** IF the vendor SDK cannot run on the target runtime (e.g. `firebase-admin` on Cloudflare Workers), THEN the `constitution-enforcer` SHALL accept a project-owned client for that service as a valid abstraction.
- **VIII-5** WHERE a project-owned client exists because of a runtime constraint, design.md SHALL document that constraint.

---

## Article IX: Integration-First Testing

**Statement**: Integration tests SHALL use real services instead of mocks.

### Requirements

- **IX-1** Integration tests SHALL use real databases, APIs and services.
- **IX-2** Each test database SHALL be isolated (container or test schema).
- **IX-3** Integration tests SHALL call external APIs through their sandbox or test environments.
- **IX-4** Integration tests SHALL NOT mock a service unless the service is unavailable in the test environment, has usage limits or costs, or has no test environment.
- **IX-5** WHERE a test uses a mock, the test documentation SHALL justify that mock.

### Rationale

- Tests real system behavior
- Catches integration issues early
- Validates actual service interactions
- Builds confidence in deployment

### Validation Checklist

- [ ] Integration tests use real databases: Docker, test schema (IX-1, IX-2)
- [ ] External APIs use test/sandbox environments (IX-3)
- [ ] Mocks justified with unavailability/cost reasons (IX-4, IX-5)
- [ ] Test data cleanup automated
- [ ] Tests pass against real services (IX-1)

**Tools**: Docker Compose, Testcontainers, test database schemas

---

## Phase -1 Gates

**Phase -1 Gates** are validation checkpoints that occur BEFORE implementation begins. They enforce constitutional compliance.

### Gate Triggers

Gates are triggered when:

- Project count exceeds 3 (Article VII)
- Custom abstraction layers proposed (Article VIII)
- EARS requirements incomplete (Article IV)
- Traceability gaps detected (Article V)

### Gate Process

1. **Detection**: `constitution-enforcer` skill detects violation
2. **Documentation**: Proposer documents justification
3. **Review**: Required skills review proposal
4. **Approval**: Stakeholders approve/reject
5. **Proceed**: Implementation continues only after approval

### Required Reviewers

| Gate                            | Required Skills                          | Stakeholders                |
| ------------------------------- | ---------------------------------------- | --------------------------- |
| Simplicity (Article VII)        | `system-architect`, `project-manager`    | Tech lead, Product owner    |
| Anti-Abstraction (Article VIII) | `system-architect`, `software-developer` | Tech lead, Senior engineer  |
| EARS Compliance (Article IV)    | `requirements-analyst`                   | Product owner, QA lead      |
| Traceability (Article V)        | `traceability-auditor`                   | QA lead, Compliance officer |

---

## Enforcement

### Validation Agent

The `constitution-enforcer` skill automatically validates compliance:

```bash
# Validate before implementation
@constitution-enforcer validate requirements.md
@constitution-enforcer validate design.md
```

### Validation Stages

| Stage          | Articles Validated   | Trigger           |
| -------------- | -------------------- | ----------------- |
| Requirements   | IV, V                | Before design     |
| Design         | I, II, VI, VII, VIII | Before tasks      |
| Implementation | III, V               | Before commit     |
| Testing        | III, V, IX           | Before deployment |

### Violation Response

1. **Blocker**: Implementation SHALL NOT proceed
2. **Documentation**: Violation documented in design.md
3. **Resolution**: Either fix violation OR trigger Phase -1 Gate
4. **Re-validation**: `constitution-enforcer` re-runs validation

---

## Amendment Process

**Constitutional articles are IMMUTABLE**. Amendments require:

1. Unanimous stakeholder agreement
2. Documentation of rationale
3. Update to this file with version increment
4. Update to `constitution-enforcer` skill validation logic
5. Communication to all team members

**Version History**:

- v1.0 (Initial) - 9 Articles established
- v1.1 - All articles stated in EARS with requirement IDs; Articles I and II become profile-aware (library | cli | application), library rules unchanged; Article VIII accepts runtime-constraint abstractions; Article VII adds code-size limits (VII-4–VII-6) and Article I documented core exports (I-5)

---

## Summary

| Article | Principle            | Enforced By                                     |
| ------- | -------------------- | ----------------------------------------------- |
| I       | Testable Core        | `constitution-enforcer`                         |
| II      | Automation Interface | `constitution-enforcer`                         |
| III     | Test-First           | `constitution-enforcer`, `test-engineer`        |
| IV      | EARS Format          | `constitution-enforcer`, `requirements-analyst` |
| V       | Traceability         | `traceability-auditor`                          |
| VI      | Project Memory       | All skills (steering system)                    |
| VII     | Simplicity Gate      | `constitution-enforcer` (Phase -1)              |
| VIII    | Anti-Abstraction     | `constitution-enforcer` (Phase -1)              |
| IX      | Integration Testing  | `test-engineer`                                 |

---

**Powered by MUSUBI** - Constitutional governance for specification-driven development.
