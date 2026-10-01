# 9 Constitutional Articles

## Overview

The 9 Constitutional Articles define immutable governance rules for MUSUBI SDD. These articles cannot be modified and must be enforced at all stages of development.

---

## Project Profile

Articles I and II depend on the project profile. Read it before validating either article:

- `constitution.profile` in `steering/project.yml`: `library`, `cli` or `application`. IF no profile is declared, THEN apply `library` (P-2).
- `constitution.core_paths`, `delivery_paths` and `adapter_paths`. IF a `library` or `cli` project declares no `core_paths`, THEN use `lib/` and `packages/` (P-3).
- Article levels: Article I is critical for `library` and `cli`, advisory for `application`; Article II is advisory for `library`, critical for `cli`, advisory for `application` (P-5). An entry in `constitution.levels` replaces the default (P-6).

```bash
profile=$(yq '.constitution.profile // "library"' steering/project.yml)
core_paths=$(yq '.constitution.core_paths // [] | .[]' steering/project.yml)
delivery_paths=$(yq '.constitution.delivery_paths // [] | .[]' steering/project.yml)
adapter_paths=$(yq '.constitution.adapter_paths // [] | .[]' steering/project.yml)
if [[ "$profile" =~ ^(library|cli)$ && -z "$core_paths" ]]; then
    core_paths="lib packages"
fi
```

---

## Article I: Testable-Core Principle

> **The project SHALL keep feature logic in core modules that have an explicit public interface and can be tested without the delivery mechanism (UI, HTTP server, terminal).**

### Rationale

- Libraries are reusable across projects (`library`, `cli`)
- Encourages modular design
- Enables testing in isolation
- In an application the app is the unit of deployment, so packaging each feature adds build and versioning cost with no consumer
- Allowing direct SDK use (I-4) removes the conflict with Article VIII

### Compliance Criteria

```
✅ COMPLIANT (all profiles):
- Feature logic under a core path (I-1)
- Core module has tests that run without the app, a browser or a CLI (I-2)
- Core module does not import from a delivery path (I-3)
- Direct framework or platform SDK use in a core module (I-4)
- Each exported function and class of a core module has a /** … */ doc comment
  directly above its declaration (I-5, advisory)

✅ COMPLIANT (library, cli):
- Feature implemented in lib/[feature]/ or packages/[feature]/ (I-L1)
- Library has its own test suite and public API (I-L2, I-L3)
- Library can be built and versioned standalone (I-L4, I-L5)

❌ NON-COMPLIANT (library, cli):
- Feature implemented directly in app/ (I-L1)
- Library depends on application code (I-L6)
- Cannot be extracted from application

✅ COMPLIANT (application):
- Core module is a folder under a core path, e.g. src/lib/[domain]/ (I-A1)
- Core module has no own package.json, deployment or publication (I-A2)
- Route handlers and server actions validate input, authorize, call core and shape the response (I-A3)

❌ NON-COMPLIANT (application):
- Core module imports from src/components/ or src/app/ (I-3)
- Components, React hooks or providers in a core path (I-A4)
- next/headers or next/server used outside delivery or adapter paths (I-A5, advisory)
- Business rules written in a route handler or component (I-A3, advisory)
```

### Enforcement

```bash
# All profiles (I-3): no imports from delivery paths into core paths
for core in $core_paths; do
    for delivery in $delivery_paths; do
        if grep -rqE "from ['\"].*${delivery#src/}/" "$core"; then
            VIOLATION "Article I (I-3): ${core} imports from ${delivery}"
        fi
    done
done

# All profiles (I-5, advisory): doc comment above each exported function and class of a core module
for file in $(find $core_paths -name "*.[jt]s" ! -name "*.test.*" ! -name "*.spec.*"); do
    if has_undocumented_export "$file"; then
        WARNING "Article I (I-5): ${file} exports a function or class without a /** … */ comment"
    fi
done

case "$profile" in
library|cli)
    # I-L1: check implementation location
    if [[ "$feature_path" =~ ^(src/app/|web/) ]]; then
        if [[ ! -d "lib/${feature_name}" && ! -d "packages/${feature_name}" ]]; then
            VIOLATION "Article I (I-L1): Feature not in library first"
        fi
    fi
    ;;
application)
    # I-A4: no UI-only code (components, React hooks, providers) in core paths
    for core in $core_paths; do
        if grep -rqE "from ['\"]react['\"]|['\"]use client['\"]" "$core"; then
            VIOLATION "Article I (I-A4): UI-only code in ${core}"
        fi
    done
    # I-A5 (advisory): request-context APIs only in delivery or adapter paths
    for file in $(grep -rlE "from ['\"]next/(headers|server)['\"]" $core_paths); do
        if ! is_under "$file" $adapter_paths; then
            WARNING "Article I (I-A5): ${file} uses a request-context API"
        fi
    done
    ;;
esac
```

---

## Article II: Automation Interface Mandate

> **The project SHALL make its primary functionality reachable through a documented, scriptable interface that does not require the UI.**

The project profile determines the form of that interface: a CLI for `library` and `cli`, an HTTP API for `application`.

### Rationale

- Enables testing without UI
- Supports automation and scripting
- Provides consistent interface across platforms
- Enables quick validation and debugging
- Machines talk to applications over HTTP, so that is the interface to keep stable and documented

### Compliance Criteria

```
✅ COMPLIANT (all profiles):
- Primary operations callable without the UI (II-1)
- Interface documented through help text or a schema (II-2)
- Failures return a machine-readable error: non-zero exit code, or HTTP status plus error code (II-4)

✅ COMPLIANT (library, cli):
- lib/auth/cli.ts or lib/auth/__main__.py exists (II-L1)
- CLI exposes core functionality (II-L1)
- CLI has --help documentation (II-L2)
- CLI exits with 0 on success and non-zero on failure (II-L4, II-L5)

❌ NON-COMPLIANT (library, cli):
- Library has no CLI entry point (II-L1)
- CLI only available through framework
- Core functions not accessible via CLI

✅ COMPLIANT (application):
- Route handlers form the HTTP API (II-A1); core functions serve internal callers and tests (II-A2)
- No CLI (II-A3)
- Machine-facing endpoints validate input with a schema, e.g. zod (II-A4), and return documented status and error codes (II-A5)
- Ops tasks are scripts/*.ts registered in package.json, with --help, an explicit target environment and --dry-run (II-A6–II-A9)

❌ NON-COMPLIANT (application):
- Webhook or integration endpoint without input schema validation (II-A4)
- package.json script references a file that does not exist (II-A10)
- Ops script without --help or dry run (II-A7, II-A9, advisory)
```

### Enforcement

```bash
case "$profile" in
library|cli)
    # II-L1: check for CLI entry point in each library under a core path
    cli_files=("cli.ts" "cli.js" "__main__.py" "main.go")
    for core in $core_paths; do
        for lib_dir in "${core}"/*/; do
            has_cli=false
            for cli_file in "${cli_files[@]}"; do
                if [ -f "${lib_dir}${cli_file}" ]; then
                    has_cli=true
                    break
                fi
            done
            if [ "$has_cli" = false ]; then
                VIOLATION "Article II (II-L1): ${lib_dir} missing CLI interface"
            fi
        done
    done
    ;;
application)
    # II-A3: no CLI required
    # II-A4: machine-facing endpoints (webhooks, n8n flows, integrations) validate input against a schema
    for route in $(find src/app/api -path "*webhook*" -name "route.ts"); do
        if ! grep -qE "\.(safeParse|parse)\(" "$route"; then
            VIOLATION "Article II (II-A4): ${route} does not validate input against a schema"
        fi
    done
    # II-A10: every package.json script references a file that exists
    for file in $(jq -r '.scripts[]' package.json | grep -oE "[A-Za-z0-9_./-]+\.(js|mjs|cjs|ts|sh)"); do
        if [ ! -f "$file" ]; then
            VIOLATION "Article II (II-A10): package.json script references missing ${file}"
        fi
    done
    ;;
esac
```

---

## Article III: Test-First Imperative

> **The developer SHALL write tests before the implementation that satisfies them (Red-Green-Blue cycle).**

### Requirements

- **III-1** The developer SHALL write each test before the production code that makes it pass.
- **III-2** WHEN the developer starts a new behavior, the developer SHALL first write a test that fails (**Red**).
- **III-3** WHEN a failing test exists, the developer SHALL write the minimal code that makes it pass (**Green**).
- **III-4** WHEN the test passes, the developer SHALL refactor while keeping all tests passing (**Blue**).
- **III-5** The test suite SHALL cover every EARS requirement of the feature.
- **III-6** The test suite SHALL reach the configured coverage threshold (`coverage_threshold` in `steering/rules/constitution-levels.yml`, default 80%).
- **III-7** Integration tests SHALL use real services, as Article IX defines.

### Rationale

- Tests define expected behavior
- Prevents untested code from entering codebase
- Enforces Red-Green-Refactor discipline
- Creates living documentation

### Compliance Criteria

```
✅ COMPLIANT:
- Test file committed before source file (III-1)
- Failing test first, minimal code to pass, refactor with tests passing (III-2–III-4)
- Every EARS requirement covered by a test (III-5)
- Coverage at or above coverage_threshold, default 80% (III-6)
- Integration tests use real services (III-7, Article IX)

❌ NON-COMPLIANT:
- Source code committed before tests (III-1)
- Tests written after implementation (III-1)
- EARS requirement without a test (III-5)
- Coverage below the configured threshold (III-6)
- Untested code merged to main (III-1)
```

### Enforcement

```bash
# III-1: check git history for test-first
for commit in $(git log --oneline feature-branch..HEAD); do
    files=$(git show --name-only $commit)

    # Check if source files added before tests
    if echo "$files" | grep -q "src/" && ! echo "$files" | grep -q "test"; then
        # Check previous commits for tests
        prev_tests=$(git log --oneline --all -- "tests/")
        if [ -z "$prev_tests" ]; then
            VIOLATION "Article III (III-1): Code committed before tests"
        fi
    fi
done

# III-6: coverage threshold from steering/rules/constitution-levels.yml (default 80)
threshold=$(yq '.configurable.coverage_threshold.default // 80' steering/rules/constitution-levels.yml)
if (( coverage < threshold )); then
    VIOLATION "Article III (III-6): Coverage ${coverage}% < ${threshold}%"
fi
```

---

## Article IV: EARS Requirements Format

> **Every requirement SHALL use EARS (Easy Approach to Requirements Syntax) format.**

### Requirements

- **IV-1** Each requirement SHALL use one of the 5 EARS patterns (see EARS Patterns below).
- **IV-2** Each requirement SHALL have a single interpretation.
- **IV-3** Each requirement SHALL include acceptance criteria.
- **IV-4** Each requirement SHALL be traceable to design and tests (see Article V).

### Rationale

- Unambiguous requirement language
- Testable specifications
- Industry-standard format
- Reduces misinterpretation

### EARS Patterns

| Pattern      | Template                                      | Use Case           |
| ------------ | --------------------------------------------- | ------------------ |
| Ubiquitous   | The system SHALL [action]                     | Always applicable  |
| Event-driven | WHEN [event] the system SHALL [action]        | Triggered by event |
| State-driven | WHILE [state] the system SHALL [action]       | During condition   |
| Optional     | WHERE [feature] the system SHALL [action]     | Optional features  |
| Unwanted     | IF [condition] THEN the system SHALL [action] | Error handling     |

### Compliance Criteria

```
✅ COMPLIANT:
"WHEN user clicks login, the system SHALL validate credentials" (IV-1)
"The system SHALL encrypt all passwords using bcrypt" (IV-1)
Each requirement has acceptance criteria (IV-3)

❌ NON-COMPLIANT:
"User should be able to log in" (ambiguous 'should', IV-2)
"The system may support SSO" (ambiguous 'may', IV-2)
"Login functionality" (not a complete requirement, IV-1)
Requirement without acceptance criteria (IV-3)
```

### Enforcement

```python
invalid_keywords = ["should", "may", "could", "might", "would"]
required_keywords = ["SHALL", "MUST"]

for line in requirements:
    if any(kw in line.lower() for kw in invalid_keywords):
        VIOLATION(f"Article IV (IV-2): Ambiguous keyword in '{line}'")

    if "REQ-" in line and not any(kw in line for kw in required_keywords):
        WARNING(f"Article IV (IV-1): Missing SHALL/MUST in '{line}'")

for req in parse_requirements():
    if not req.acceptance_criteria:
        VIOLATION(f"Article IV (IV-3): {req.id} has no acceptance criteria")
```

---

## Article V: Traceability Mandate

> **The project SHALL maintain 100% traceability between Requirements ↔ Design ↔ Code ↔ Tests.**

### Requirements

- **V-1** Each requirement SHALL map to at least one design decision (architecture, API, database).
- **V-2** Each requirement SHALL map to its implementation (source files, functions).
- **V-3** Each requirement SHALL map to at least one test (test case, scenario).
- **V-4** Each test SHALL reference the ID of the requirement it verifies.
- **V-5** Each design document SHALL include a requirements coverage matrix.
- **V-6** Each task breakdown SHALL map its tasks to requirements.

### Rationale

- Ensures every requirement is implemented
- Prevents orphaned code
- Enables impact analysis
- Supports audit and compliance

### Traceability Chain

```
REQ-001 (Requirement)
    ↓ (referenced in)
AUTH-SERVICE (Design Component)
    ↓ (broken down to)
P1-001 (Task)
    ↓ (implemented in)
src/auth/service.ts (Code)
    ↓ (tested by)
T-001 (Test)
```

### Compliance Criteria

```
✅ COMPLIANT:
- 100% requirements have design mappings (V-1)
- 100% requirements have implementations (V-2)
- 100% requirements have tests (V-3)
- Each test references the ID of the requirement it verifies (V-4)
- design.md includes a requirements coverage matrix (V-5)
- tasks.md maps each task to requirements (V-6)

❌ NON-COMPLIANT:
- Orphaned requirements (no implementation, V-2)
- Orphaned tests (no requirement, V-4)
- Untested requirements (V-3)
- Incomplete traceability matrix (V-5)
```

### Enforcement

```python
def check_traceability():
    requirements = parse_requirements()
    design = parse_design()
    tasks = parse_tasks()
    tests = parse_tests()

    for req in requirements:
        if req.id not in design.references:
            VIOLATION(f"Article V (V-1): {req.id} not in design")
        if req.id not in tasks.references:
            VIOLATION(f"Article V (V-6): {req.id} not in tasks")
        if req.id not in tests.references:
            VIOLATION(f"Article V (V-3): {req.id} not tested")

    if not design.coverage_matrix:
        VIOLATION("Article V (V-5): design.md has no requirements coverage matrix")

    coverage = len(traced_requirements) / len(requirements) * 100
    if coverage < 100:
        VIOLATION(f"Article V: Traceability {coverage}% < 100%")
```

---

## Article VI: Project Memory

> **Each skill SHALL consult project memory (steering files) before making decisions.**

### Requirements

- **VI-1** `steering/structure.md` SHALL define the architecture patterns.
- **VI-2** `steering/tech.md` SHALL define the technology stack.
- **VI-3** `steering/product.md` SHALL define the business context.
- **VI-4** WHEN a skill starts executing, the skill SHALL read the steering files first.
- **VI-5** WHEN the architecture, technology stack or business context changes, the project SHALL update the affected steering files.
- **VI-6** WHEN a change to a steering file is proposed, the project SHALL obtain stakeholder approval before applying it.

### Rationale

- Consistent architectural decisions
- Technology stack awareness
- Business context understanding
- Prevents conflicting approaches

### Required Steering Files

```
steering/
├── structure.md   # Architecture patterns
├── tech.md        # Technology stack
├── product.md     # Business context
└── rules/
    └── constitution.md  # These articles
```

### Compliance Criteria

```
✅ COMPLIANT:
- structure.md, tech.md and product.md define architecture, stack and business context (VI-1–VI-3)
- Steering files read at skill start (VI-4)
- Decisions align with steering
- Steering updated when architecture, stack or business context changes (VI-5)
- Steering changes approved by stakeholders before they are applied (VI-6)

❌ NON-COMPLIANT:
- Steering files not consulted (VI-4)
- Conflicting technology choices (VI-2)
- Patterns that violate structure.md (VI-1)
- Steering change applied without stakeholder approval (VI-6)
```

### Enforcement

```python
def check_steering_compliance():
    if not exists("steering/structure.md"):
        VIOLATION("Article VI (VI-1): Missing steering/structure.md")
    if not exists("steering/tech.md"):
        VIOLATION("Article VI (VI-2): Missing steering/tech.md")
    if not exists("steering/product.md"):
        VIOLATION("Article VI (VI-3): Missing steering/product.md")
```

---

## Article VII: Simplicity Gate

> **The initial architecture SHALL contain at most 3 projects, and the source code SHALL stay within the size limits of VII-4 to VII-6.**

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

An `index` file collects a module's public API, so VII-6 does not apply to it. A project overrides the limits with `constitution.overrides.code_limits` in `steering/project.yml` (e.g. `max_function_lines: 80`).

The code-size limits are not Phase -1 Gate items. Only VII-2 needs a gate. Code-size findings are reported at Article VII's level (CONST-007, flexible): they warn and do not block unless the project promotes CONST-007.

### Rationale

- Prevents premature complexity
- Reduces coordination overhead
- Enables faster iteration
- Forces prioritization
- The default limits follow established tools: 50 lines per function is ESLint's `max-lines-per-function` default, 10 imports is the `max-dependencies` default of eslint-plugin-import, and 500 lines per file is the upper limit Robert C. Martin reports for the files of significant systems in _Clean Code_

### Counting Projects

```
Count each independently deployable unit, e.g. a web app, an API service, a background worker.
Folders inside one deployable unit, such as core modules under src/lib/, are not separate projects.
```

### Compliance Criteria

```
✅ COMPLIANT:
- Initial architecture has at most 3 projects (VII-1)
- Additional projects implemented only after Phase -1 Gate approval (VII-2)
- design.md justifies each additional project with business requirements,
  technical constraints and a team capacity analysis (VII-3)
- Each source file has at most 500 lines of code, or code_limits.max_file_lines (VII-4)
- Each function has at most 50 lines of code, or code_limits.max_function_lines (VII-5)
- Each source file other than an index file imports at most 10 modules,
  or code_limits.max_imports (VII-6)

❌ NON-COMPLIANT:
- More than 3 projects without Phase -1 Gate approval (VII-1, VII-2)
- Implementation of an additional project started before gate approval (VII-2)
- Additional project without justification in design.md (VII-3)
- Source file over the lines-of-code limit (VII-4, warning at CONST-007's level)
- Function over the lines-of-code limit (VII-5, warning at CONST-007's level)
- Non-index source file over the import limit (VII-6, warning at CONST-007's level)
```

### Enforcement

```python
def simplicity_check(design):
    # A project is an independently deployable unit
    projects = find_deployable_units(design)
    if len(projects) <= 3:
        return

    if not design.phase_minus_one_gate_approved:
        VIOLATION("Article VII (VII-2): More than 3 projects without Phase -1 Gate approval")

    for topic in ["business requirements", "technical constraints", "team capacity"]:
        if not design.justifies_additional_projects(topic):
            VIOLATION(f"Article VII (VII-3): design.md does not justify additional projects ({topic})")


def code_size_check(project):
    # VII-4 to VII-6: reported at Article VII's level (CONST-007), not a Phase -1 Gate item.
    # Implemented by `npx musubi-validate project` (project-wide) and the CI
    # constitutional check (changed files).
    limits = load_code_limits()  # constitution-levels.yml, then constitution.overrides.code_limits
    for file in source_files(project.core_paths + project.delivery_paths):
        metrics = measure_code(file)  # lines of code, functions, distinct imports
        if metrics.lines_of_code > limits.max_file_lines:  # default 500
            WARNING(f"Article VII (VII-4): {file} has {metrics.lines_of_code} lines of code")
        for fn in metrics.functions:
            if fn.lines_of_code > limits.max_function_lines:  # default 50
                WARNING(f"Article VII (VII-5): {file}: {fn.name} has {fn.lines_of_code} lines of code")
        if not is_index_file(file) and len(metrics.imports) > limits.max_imports:  # default 10
            WARNING(f"Article VII (VII-6): {file} imports {len(metrics.imports)} modules")
```

---

## Article VIII: Anti-Abstraction Gate

> **The project SHALL use framework features directly, without custom abstraction layers.**

### Requirements

- **VIII-1** The project SHALL call framework APIs directly.
- **VIII-2** The project SHALL NOT build a custom abstraction layer or wrapper library over a framework without Phase -1 Gate approval, except for a runtime-constraint client (VIII-4).
- **VIII-3** IF a design proposes an abstraction over a framework, THEN its Phase -1 Gate request SHALL include a multi-framework support justification, a team expertise analysis and a migration path.
- **VIII-4** IF the vendor SDK cannot run on the target runtime (e.g. `firebase-admin` on Cloudflare Workers), THEN the `constitution-enforcer` SHALL accept a project-owned client for that service as a valid abstraction.
- **VIII-5** WHERE a project-owned client exists because of a runtime constraint, design.md SHALL document that constraint.

### Rationale

- Prevents over-engineering
- Reduces maintenance burden
- Leverages framework best practices
- Enables framework updates

### Valid Abstractions

```
- Multi-framework support (e.g. database library supporting Prisma AND TypeORM), with Phase -1 Gate approval (VIII-2, VIII-3)
- Domain-specific abstractions (e.g. PaymentGateway interface with multiple providers)
- Runtime constraint: project-owned client because the vendor SDK cannot run on the target runtime (VIII-4, VIII-5)
```

### Compliance Criteria

```
✅ COMPLIANT:
- Framework APIs called directly, e.g. Prisma client used as is (VIII-1)
- Abstraction over a framework with Phase -1 Gate approval (VIII-2), whose request includes
  a multi-framework support justification, a team expertise analysis and a migration path (VIII-3)
- Project-owned client because the vendor SDK cannot run on the target runtime,
  e.g. firebase-admin on Cloudflare Workers (VIII-4), constraint documented in design.md (VIII-5)

❌ NON-COMPLIANT:
- MyDatabase wrapper around Prisma/TypeORM without gate approval (VIII-2)
- Custom HttpClient wrapper around axios/fetch without gate approval (VIII-2)
- Custom Logger abstraction over framework logging without gate approval (VIII-2)
- Gate request without multi-framework justification, team expertise analysis or migration path (VIII-3)
- Runtime-constraint client without the constraint documented in design.md (VIII-5)
```

### Enforcement

```python
def anti_abstraction_check(design):
    for wrapper in find_framework_wrappers():  # e.g. DatabaseWrapper, HttpClientWrapper
        if wrapper.vendor_sdk_cannot_run_on_target_runtime:
            # Runtime constraint: valid abstraction (VIII-4)
            if not design.documents_runtime_constraint(wrapper):
                VIOLATION(f"Article VIII (VIII-5): {wrapper} runtime constraint not documented in design.md")
        elif not wrapper.phase_minus_one_gate_approved:
            VIOLATION(f"Article VIII (VIII-2): {wrapper} wraps a framework without Phase -1 Gate approval")
        elif not wrapper.gate_request.has_multi_framework_expertise_and_migration_analysis():
            VIOLATION(f"Article VIII (VIII-3): {wrapper} gate request incomplete")
```

---

## Article IX: Integration-First Testing

> **Integration tests SHALL use real services instead of mocks.**

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

### When a Mock Is Allowed

```
Integration tests mock a service only when the service (IX-4):
- is unavailable in the test environment
- has usage limits or costs (e.g. LLM providers, payment APIs)
- has no test environment

Each mock is justified in the test documentation (IX-5).
Tools for real services: Docker Compose, Testcontainers, test database schemas.
```

### Compliance Criteria

```
✅ COMPLIANT:
- Integration tests use a real database, e.g. PostgreSQL via Testcontainers (IX-1)
- Each test database isolated in a container or test schema (IX-2)
- External APIs called through their sandbox or test environment (IX-3)
- LLM provider mocked because of usage costs, justified in the test documentation (IX-4, IX-5)

❌ NON-COMPLIANT:
- Integration tests use an in-memory mock database (IX-1, IX-4)
- Integration tests share one database without isolation (IX-2)
- Integration tests call a production external API (IX-3)
- Mock for a service that is available in the test environment (IX-4)
- Mock without a documented justification (IX-5)
```

### Enforcement

```python
def real_services_check(feature):
    for test in find_tests(feature, type="integration"):
        for mock in find_mocks(test):  # e.g. jest.mock, mock_database, stub_service
            service = mock.service
            allowed = (
                service.unavailable_in_test_env
                or service.has_usage_limits_or_costs
                or not service.has_test_env
            )
            if not allowed:
                VIOLATION(f"Article IX (IX-4): {test} mocks {service}, which is available for tests")
            elif not mock.justified_in_test_docs:
                VIOLATION(f"Article IX (IX-5): {test} mocks {service} without a documented justification")

        if test.database and not test.database.isolated:  # container or test schema
            VIOLATION(f"Article IX (IX-2): {test} uses a shared test database")
```

---

## Constitutional Compliance Summary

### Quick Reference

| Article | Title                | Key Rule                                                                                                    |
| ------- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| I       | Testable Core        | Feature logic in tested core modules                                                                        |
| II      | Automation Interface | Reachable without the UI (CLI or HTTP API)                                                                  |
| III     | Test-First           | Tests before code, Red-Green-Blue (III-1–III-4)                                                             |
| IV      | EARS Format          | Every requirement in an EARS pattern (IV-1)                                                                 |
| V       | Traceability         | 100% coverage (V-1–V-3)                                                                                     |
| VI      | Project Memory       | Read steering first (VI-4)                                                                                  |
| VII     | Simplicity           | At most 3 projects initially (VII-1); files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10 (VII-4–VII-6) |
| VIII    | Anti-Abstraction     | Framework APIs directly; wrappers need gate approval (VIII-2)                                               |
| IX      | Integration-First    | Real services instead of mocks (IX-1, IX-4)                                                                 |

### Enforcement Priority

Levels come from `steering/rules/constitution-levels.yml`. Articles I and II follow the project profile (P-5), and `constitution.levels` in `steering/project.yml` overrides any article (P-6).

**Critical (blocking)**:

- Article I: Testable Core (`library`, `cli`)
- Article II: Automation Interface (`cli`)
- Article III: Test-First
- Article V: Traceability

**Advisory (warning)**:

- Article I: Testable Core (`application`)
- Article II: Automation Interface (`library`, `application`)
- Article IV: EARS Format (EARS is still required in the medium and large workflow modes, `ears_required`)
- Article VI: Project Memory
- Article IX: Integration-First (mocks only where IX-4 allows them, each justified, IX-5)

**Flexible (Phase -1 Gates, with justification)**:

- Article VII: Simplicity Gate (more than 3 projects with Phase -1 Gate approval and justification in design.md, VII-2, VII-3; the code-size limits VII-4–VII-6 are not gated and warn at this level)
- Article VIII: Anti-Abstraction Gate (framework abstraction with Phase -1 Gate approval, VIII-2, VIII-3; runtime-constraint client, VIII-4, VIII-5)
