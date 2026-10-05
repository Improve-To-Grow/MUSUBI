# Constitutional Governance

The 9 immutable articles that govern all MUSUBI projects.

## Overview

Constitutional Governance ensures consistent quality across all AI-assisted development by enforcing non-negotiable rules at every stage of the workflow.

**Enforcement**: The `constitution-enforcer` skill validates compliance before implementation.

**Notation**: All 9 articles and the Project Profiles state their rules as EARS requirements with IDs (e.g. `I-A3`, `II-L1`, `IX-4`). `WHERE the project profile is …` limits a requirement to that profile; a requirement without a profile clause applies to every profile. A requirement tagged _(advisory)_ produces a warning, never a block.

## Project Profiles

The project profile states what kind of software the project builds. It decides how Articles I and II are met.

| Profile | Use for |
|---------|---------|
| `library` | Packages that are published or shared with other projects |
| `cli` | Command-line tools |
| `application` | Web apps and services deployed as one unit |

Declare the profile and its paths in `steering/project.yml`:

```yaml
constitution:
  profile: application # library | cli | application
  core_paths: [src/lib] # where feature logic lives
  delivery_paths: # pages, routes, UI, CLI entry points
    [src/app, src/components, src/hooks, src/contexts]
  adapter_paths: [] # request-context code, e.g. src/lib/server/authorization
  levels: # optional per-article override
    CONST-001: advisory
  overrides: # optional settings override
    code_limits: # code-size limits of Article VII (VII-4 to VII-6)
      max_function_lines: 80 # default 50; max_file_lines 500, max_imports 10
```

**Requirements**:
- **P-1** The project SHALL declare its profile as `constitution.profile` in `steering/project.yml`, with the value `library`, `cli` or `application`. _(advisory)_
- **P-2** IF `steering/project.yml` declares no profile, THEN the `constitution-enforcer` SHALL apply the `library` profile.
- **P-3** IF a `library` or `cli` project declares no `core_paths`, THEN the `constitution-enforcer` SHALL use `lib/` and `packages/` as core paths.
- **P-4** WHERE the project profile is `application`, `steering/project.yml` SHALL declare `core_paths` and `delivery_paths`.
- **P-5** The `constitution-enforcer` SHALL apply the default article levels of the declared profile (table below).
- **P-6** WHERE `steering/project.yml` declares a level for an article under `constitution.levels`, the `constitution-enforcer` SHALL apply that level instead of the profile default.

**Default levels per profile** (`critical` blocks, `advisory` warns):

| Article | `library` | `cli` | `application` |
|---------|-----------|-------|---------------|
| I (CONST-001) | critical | critical | advisory |
| II (CONST-002) | advisory | critical | advisory |

Articles III–IX keep the levels in `steering/rules/constitution-levels.yml` for every profile. `library` keeps the v1.0 rules and levels, and it applies whenever no profile is declared. `application` starts at advisory so that adopting MUSUBI in an existing app does not block on day one; once the core/delivery boundary check is clean, promote CONST-001 to `critical` through `constitution.levels`.

## The 9 Articles

### Article I: Testable-Core Principle

> The project SHALL keep feature logic in core modules that have an explicit public interface and can be tested without the delivery mechanism (UI, HTTP server, terminal).

A _core path_ holds feature logic. A _delivery path_ holds the code that delivers it: pages, route handlers, server actions, UI components and CLI entry points. An _adapter path_ holds request-context code that core logic depends on (`application` only). The [project profile](#project-profiles) determines which paths are which.

**Requirements (all profiles)**:
- **I-1** The project SHALL place feature logic under a core path.
- **I-2** Each core module SHALL have tests that run without starting the app, a browser or a CLI.
- **I-3** A core module SHALL NOT import from a delivery path.
- **I-4** The `constitution-enforcer` SHALL NOT report the direct use of a framework or platform SDK in a core module as a violation (consistent with Article VIII).
- **I-5** Each exported function and class of a core module SHALL have a doc comment (`/** … */`) directly above its declaration. _(advisory)_

**Profile `library` and `cli`**:
- **I-L1** WHERE the project profile is `library` or `cli`, each feature SHALL start as a standalone library under a core path (by default `lib/<feature>/` or `packages/<feature>/`, see P-3).
- **I-L2** WHERE the project profile is `library` or `cli`, each library SHALL have its own test suite.
- **I-L3** WHERE the project profile is `library` or `cli`, each library SHALL export a public API.
- **I-L4** WHERE the project profile is `library` or `cli`, each library SHALL be buildable independently.
- **I-L5** WHERE the project profile is `library` or `cli`, each library SHALL be versionable independently.
- **I-L6** WHERE the project profile is `library` or `cli`, a library SHALL NOT depend on application code.
- **I-L7** WHERE the project profile is `library` or `cli`, the `constitution-enforcer` SHALL NOT require a library to be published to a package registry.

**Profile `application`**:
- **I-A1** WHERE the project profile is `application`, each core module SHALL be a folder under a declared core path, for example `src/lib/<domain>/`.
- **I-A2** WHERE the project profile is `application`, the `constitution-enforcer` SHALL NOT require a core module to have its own `package.json`, independent deployment or publication.
- **I-A3** WHERE the project profile is `application`, the delivery layer (route handlers, server actions, pages, components) SHALL limit itself to validating input, authorizing, calling core and shaping the response. _(advisory)_
- **I-A4** WHERE the project profile is `application`, a core path SHALL NOT contain UI-only code (components, React hooks, providers).
- **I-A5** WHERE the project profile is `application`, request-context APIs (e.g. `next/headers`, `next/server`) SHALL be used only in delivery paths or declared adapter paths. _(advisory)_
- **I-A6** WHERE the project profile is `application`, WHEN a core module gains a second consumer (another app, a Functions package, a worker), the project SHALL extract that module into a package.
- **I-A7** WHERE the project profile is `application`, WHILE a core module has a single consumer, the project SHALL keep that module inside the application.

**Example** (use the column for the `constitution.profile` in `steering/project.yml`; `library` when absent):

| | `library` / `cli` | `application` (Next.js App Router) |
|---|---|---|
| Core module (Article I) | `lib/auth/` with its own test suite and public API | `src/lib/auth/` with co-located `*.test.ts` |
| Automation interface (Article II) | `lib/auth/cli.ts` with `--help` and exit codes | `src/app/api/auth/login/route.ts`: validates input with a schema (e.g. zod), calls core, returns status + error code; no `cli.ts`; ops tasks as `scripts/*.ts` with `--help` and `--dry-run` |

**Validation**:
```bash
musubi-validate article 1
```

`musubi-validate article 1` reports the profile and the core modules in the core paths. The full validator (`musubi-validate project`) also checks I-2, I-3 and I-5 (advisory), and for `application` I-A4 and I-A5 (advisory).

---

### Article II: Automation Interface Mandate

> The project SHALL make its primary functionality reachable through a documented, scriptable interface that does not require the UI.

The [project profile](#project-profiles) determines the form of that interface: a CLI for `library` and `cli`, an HTTP API for `application`.

**Requirements (all profiles)**:
- **II-1** The project SHALL make each feature's primary operations callable without the UI.
- **II-2** The project SHALL document its automation interface through help text or a schema.
- **II-3** The automation interface SHALL use consistent naming and argument conventions across operations.
- **II-4** IF an operation called through the automation interface fails, THEN the interface SHALL return a machine-readable error (a non-zero exit code, or an HTTP status plus an error code).

**Profile `library` and `cli`**:
- **II-L1** WHERE the project profile is `library` or `cli`, each library SHALL provide a CLI that exposes its primary functionality.
- **II-L2** WHERE the project profile is `library` or `cli`, the CLI SHALL provide `--help` output with usage examples.
- **II-L3** WHERE the project profile is `library` or `cli`, the CLI SHALL use the same flag for the same option across commands.
- **II-L4** WHERE the project profile is `library` or `cli`, WHEN a CLI command succeeds, the CLI SHALL exit with code 0.
- **II-L5** WHERE the project profile is `library` or `cli`, IF a CLI command fails, THEN the CLI SHALL exit with a non-zero code.
- **II-L6** WHERE the project profile is `library` or `cli`, the `constitution-enforcer` SHALL accept a CLI that delegates to the library API.

Under the `library` profile, Article II defaults to advisory because internal libraries may not need a CLI.

**Profile `application`**:
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

**Validation**:
```bash
musubi-validate article 2
```

For `library` and `cli`, the validators look for `bin/` scripts and `package.json` `bin` entries (II-L1). For `application` they look for route handlers instead of a CLI (II-A1, II-A3), and the full validator also checks II-A4, II-A10 and II-A7 (advisory).

---

### Article III: Test-First Imperative

> The developer SHALL write tests before the implementation that satisfies them (Red-Green-Blue cycle).

**Requirements**:
- **III-1** The developer SHALL write each test before the production code that makes it pass.
- **III-2** WHEN the developer starts a new behavior, the developer SHALL first write a test that fails (**Red**).
- **III-3** WHEN a failing test exists, the developer SHALL write the minimal code that makes it pass (**Green**).
- **III-4** WHEN the test passes, the developer SHALL refactor while keeping all tests passing (**Blue**).
- **III-5** The test suite SHALL cover every EARS requirement of the feature.
- **III-6** The test suite SHALL reach the configured coverage threshold (`coverage_threshold` in `steering/rules/constitution-levels.yml`, default 80%).
- **III-7** Integration tests SHALL use real services, as Article IX defines.

**Validation**:
```bash
musubi-validate article 3
```

---

### Article IV: EARS Requirements Format

> Every requirement SHALL use EARS (Easy Approach to Requirements Syntax) format.

**Requirements**:
- **IV-1** Each requirement SHALL use one of the 5 EARS patterns:
  1. **Event-driven**: `WHEN [event], the [system] SHALL [response]`
  2. **State-driven**: `WHILE [state], the [system] SHALL [response]`
  3. **Unwanted behavior**: `IF [error], THEN the [system] SHALL [response]`
  4. **Optional features**: `WHERE [feature enabled], the [system] SHALL [response]`
  5. **Ubiquitous**: `The [system] SHALL [requirement]`
- **IV-2** Each requirement SHALL have a single interpretation.
- **IV-3** Each requirement SHALL include acceptance criteria.
- **IV-4** Each requirement SHALL be traceable to design and tests (see Article V).

**Examples**:

| Pattern | Syntax | Example |
|---------|--------|---------|
| Event-driven | WHEN...SHALL | WHEN user clicks login, System SHALL validate |
| State-driven | WHILE...SHALL | WHILE loading, System SHALL show spinner |
| Unwanted | IF...THEN...SHALL | IF error, THEN System SHALL display message |
| Optional | WHERE...SHALL | WHERE MFA enabled, System SHALL require 2FA |
| Ubiquitous | SHALL | System SHALL encrypt all data |

**Validation**:
```bash
musubi-validate article 4
musubi-requirements validate
```

---

### Article V: Traceability Mandate

> The project SHALL maintain 100% traceability between Requirements ↔ Design ↔ Code ↔ Tests.

**Requirements**:
- **V-1** Each requirement SHALL map to at least one design decision (architecture, API, database).
- **V-2** Each requirement SHALL map to its implementation (source files, functions).
- **V-3** Each requirement SHALL map to at least one test (test case, scenario).
- **V-4** Each test SHALL reference the ID of the requirement it verifies.
- **V-5** Each design document SHALL include a requirements coverage matrix.
- **V-6** Each task breakdown SHALL map its tasks to requirements.

Requirement IDs use the format `REQ-XXX-NNN`.

**Validation**:
```bash
musubi-validate article 5
musubi-trace --verbose
```

---

### Article VI: Project Memory (Steering System)

> Each skill SHALL consult project memory (steering files) before making decisions.

**Requirements**:
- **VI-1** `steering/structure.md` SHALL define the architecture patterns.
- **VI-2** `steering/tech.md` SHALL define the technology stack.
- **VI-3** `steering/product.md` SHALL define the business context.
- **VI-4** WHEN a skill starts executing, the skill SHALL read the steering files first.
- **VI-5** WHEN the architecture, technology stack or business context changes, the project SHALL update the affected steering files.
- **VI-6** WHEN a change to a steering file is proposed, the project SHALL obtain stakeholder approval before applying it.

**Validation**:
```bash
musubi-validate article 6
musubi status
```

---

### Article VII: Simplicity Gate (Phase -1)

> The initial architecture SHALL contain at most 3 projects, and the source code SHALL stay within the size limits of VII-4 to VII-6.

**Terms**:
- A _project_ is an independently deployable unit.
- A _source file_ is a JavaScript or TypeScript file (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`, `.mts`, `.cts`) in a core or delivery path. Tests (`*.test.*`, `*.spec.*`), type declarations (`*.d.ts`) and generated, vendored or template files are not source files.
- A _line of code_ is a line that contains something other than whitespace and comments.
- A _function_ is a function declaration or expression, an arrow function with a block body, or a method. Its length is the number of lines of code from the line where it starts to the line of its closing brace, nested functions included.
- An _import_ is a distinct module that a file loads with `import`, `export … from`, `require()` or `import()`.

**Requirements**:
- **VII-1** The initial architecture SHALL NOT exceed 3 projects.
- **VII-2** IF a design needs more than 3 projects, THEN implementation of the additional projects SHALL NOT begin before Phase -1 Gate approval.
- **VII-3** IF a design needs more than 3 projects, THEN design.md SHALL justify each additional project with business requirements, technical constraints and a team capacity analysis.

**Code-Size Limits**:
- **VII-4** Each source file SHALL contain at most the configured maximum of lines of code (`code_limits.max_file_lines` in `steering/rules/constitution-levels.yml`, default 500).
- **VII-5** Each function SHALL contain at most the configured maximum of lines of code (`code_limits.max_function_lines`, default 50).
- **VII-6** Each source file other than an `index` file SHALL import at most the configured maximum of distinct modules (`code_limits.max_imports`, default 10).

The defaults follow established tools: 50 lines per function is ESLint's `max-lines-per-function` default, 10 imports is the `max-dependencies` default of eslint-plugin-import, and 500 lines per file is the upper limit Robert C. Martin reports in _Clean Code_. A project changes them with `constitution.overrides.code_limits` in `steering/project.yml` (see [Project Profiles](#project-profiles)).

The code-size limits are not Phase -1 Gate items: findings are reported at Article VII's level (CONST-007) and warn unless a project promotes CONST-007.

**Validation**:
```bash
musubi-validate article 7
musubi-validate gates
```

`musubi-validate article 7` counts the projects and reports the code-size findings. The full validator (`musubi-validate project`) and the CI constitutional check also check VII-4 to VII-6 on the source files in core and delivery paths.

---

### Article VIII: Anti-Abstraction Gate (Phase -1)

> The project SHALL use framework features directly, without custom abstraction layers.

**Requirements**:
- **VIII-1** The project SHALL call framework APIs directly.
- **VIII-2** The project SHALL NOT build a custom abstraction layer or wrapper library over a framework without Phase -1 Gate approval, except for a runtime-constraint client (VIII-4).
- **VIII-3** IF a design proposes an abstraction over a framework, THEN its Phase -1 Gate request SHALL include a multi-framework support justification, a team expertise analysis and a migration path.

**Valid Exceptions**:
- Multi-framework support (e.g., Prisma AND TypeORM)
- Domain abstractions (e.g., PaymentGateway interface)
- Runtime constraints (VIII-4, VIII-5)

**Runtime-Constraint Requirements**:
- **VIII-4** IF the vendor SDK cannot run on the target runtime (e.g. `firebase-admin` on Cloudflare Workers), THEN the `constitution-enforcer` SHALL accept a project-owned client for that service as a valid abstraction.
- **VIII-5** WHERE a project-owned client exists because of a runtime constraint, design.md SHALL document that constraint.

**Validation**:
```bash
musubi-validate article 8
musubi-validate gates
```

---

### Article IX: Integration-First Testing

> Integration tests SHALL use real services instead of mocks.

**Requirements**:
- **IX-1** Integration tests SHALL use real databases, APIs and services.
- **IX-2** Each test database SHALL be isolated (container or test schema).
- **IX-3** Integration tests SHALL call external APIs through their sandbox or test environments.
- **IX-4** Integration tests SHALL NOT mock a service unless the service is unavailable in the test environment, has usage limits or costs, or has no test environment.
- **IX-5** WHERE a test uses a mock, the test documentation SHALL justify that mock.

**Validation**:
```bash
musubi-validate article 9
```

## Full Validation

```bash
# Validate all 9 articles
musubi-validate constitution

# Validate with score
musubi-validate score

# Verbose output
musubi-validate all --verbose
```

## Phase -1 Gates

Before exceeding the 3-project limit (VII-2) or building a framework abstraction (VIII-2), submit a gate request (the code-size limits VII-4 to VII-6 need none):

```markdown
# See: steering/templates/phase-minus-one-gate-request.md
```

**Approvers**:
- Article VII: System Architect + Project Manager
- Article VIII: System Architect + Software Developer

## Compliance Report

```bash
musubi-validate score
```

Output:
```
Constitutional Compliance Score

█████████░ 90%

Breakdown:
  Constitution (50%): 100%
  Gates (30%):        80%
  Complexity (20%):   85%

✓ PASSED (threshold: 70%)
```
