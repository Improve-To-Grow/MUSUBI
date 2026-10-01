# MUSUBI - Specification Driven Development AI Agents

This file defines 25 specialized AI agents for Specification Driven Development across all platforms.

**Platform Support**: Claude Code (Skills API), GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf

**Note for Claude Code**: Use Skills API syntax (`@agent-name`). Other platforms reference this file for agent definitions.

---

## MCP Server Integration

### CodeGraphMCPServer

When CodeGraphMCPServer is available, agents can leverage these tools for enhanced code understanding:

| MCP Tool                   | Primary Agents                                             | Usage                  |
| -------------------------- | ---------------------------------------------------------- | ---------------------- |
| `query_codebase`           | @orchestrator, @steering                                   | Search the entire codebase |
| `find_dependencies`        | @change-impact-analyzer, @constitution-enforcer            | Dependency analysis and violation detection |
| `find_callers`             | @change-impact-analyzer, @test-engineer, @security-auditor | Caller tracing         |
| `find_callees`             | @software-developer                                        | Callee tracing         |
| `find_implementations`     | @api-designer, @system-architect                           | Implementation class search         |
| `analyze_module_structure` | @system-architect, @steering                               | Module structure analysis     |
| `get_code_snippet`         | @software-developer, @code-reviewer                        | Source code retrieval       |
| `global_search`            | @orchestrator, @technical-writer                           | GraphRAG global search |
| `local_search`             | @software-developer, @bug-hunter                           | GraphRAG local search   |
| `suggest_refactoring`      | @code-reviewer, @performance-optimizer                     | Refactoring suggestions   |

**Setup**: See `steering/tech.md` for MCP configuration.

---

## Quick Reference

| Category                            | Agents                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Orchestration** (3)               | @orchestrator, @steering, @constitution-enforcer                                                              |
| **Requirements & Planning** (3)     | @requirements-analyst, @project-manager, @change-impact-analyzer                                              |
| **Architecture & Design** (4)       | @system-architect, @api-designer, @database-schema-designer, @ui-ux-designer                                  |
| **Development** (1)                 | @software-developer                                                                                           |
| **Quality & Review** (5)            | @test-engineer, @code-reviewer, @bug-hunter, @quality-assurance, @traceability-auditor                        |
| **Security & Performance** (2)      | @security-auditor, @performance-optimizer                                                                     |
| **Infrastructure** (5)              | @devops-engineer, @cloud-architect, @database-administrator, @site-reliability-engineer, @release-coordinator |
| **Documentation & Specialized** (2) | @technical-writer, @ai-ml-engineer                                                                            |

---

## 1. @ai-ml-engineer

**Role**: AI/ML Engineer AI

**Description**: Copilot agent that assists with machine learning model development, training, evaluation, deployment, and MLOps

**Category**: Documentation

**Example Usage**:

```text
@ai-ml-engineer Implement recommendation system using collaborative filtering
```

**Platform-Specific Usage**:

- **Claude Code**: `@ai-ml-engineer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 2. @api-designer

**Role**: API Designer AI

**Description**: AI agent supporting REST/GraphQL/gRPC API design, OpenAPI specification generation, and API best practices

**Category**: Architecture

**Example Usage**:

```text
@api-designer Design RESTful API for blog platform with OpenAPI 3.0 spec
```

**Platform-Specific Usage**:

- **Claude Code**: `@api-designer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 3. @bug-hunter

**Role**: Bug Hunter AI

**Description**: Copilot agent that assists with bug investigation, root cause analysis, and fix generation for efficient debugging and issue resolution

**Category**: Quality

**MCP Tools** (when CodeGraphMCPServer available):

- `find_callers` - Identify the blast radius of a bug
- `local_search` - Root cause analysis in local context
- `get_code_snippet` - Retrieve the problematic code

**Example Usage**:

```text
@bug-hunter Investigate why users are getting 500 errors on checkout
```

**Platform-Specific Usage**:

- **Claude Code**: `@bug-hunter` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 4. @change-impact-analyzer

**Role**: Change Impact Analyzer

**Description**: Analyzes impact of proposed changes on existing systems (brownfield projects) with delta spec validation.

**Category**: Requirements

**MCP Tools** (when CodeGraphMCPServer available):

- `find_dependencies` - Analyze dependencies of the change target
- `find_callers` - Identify the change impact scope (caller tracing)
- `query_codebase` - Search related code

**Example Usage**:

```text
@change-impact-analyzer Analyze impact of changing authentication library to OAuth 2.0
```

**Platform-Specific Usage**:

- **Claude Code**: `@change-impact-analyzer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 5. @cloud-architect

**Role**: Cloud Architect AI

**Description**: Copilot agent for cloud architecture design, AWS/Azure/GCP configuration, IaC code generation (Terraform/Bicep), and cost optimization

**Category**: Infrastructure

**Example Usage**:

```text
@cloud-architect Design AWS infrastructure with Terraform for high-availability web app
```

**Platform-Specific Usage**:

- **Claude Code**: `@cloud-architect` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 6. @code-reviewer

**Role**: Code Reviewer AI

**Description**: Copilot agent that assists with comprehensive code review focusing on code quality, SOLID principles, security, performance, and best practices

**Category**: Quality

**MCP Tools** (when CodeGraphMCPServer available):

- `suggest_refactoring` - Refactoring suggestions
- `find_dependencies` - Complexity analysis of dependencies
- `get_code_snippet` - Retrieve source code

**Example Usage**:

```text
@code-reviewer Review this pull request for security issues and best practices
```

**Platform-Specific Usage**:

- **Claude Code**: `@code-reviewer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 7. @constitution-enforcer

**Role**: Constitution Enforcer

**Description**: Validates compliance with 9 Constitutional Articles and Phase -1 Gates before implementation.

**Category**: Orchestration

**MCP Tools** (when CodeGraphMCPServer available):

- `find_dependencies` - Detect core → delivery import violations (Article I, I-3)
- `analyze_module_structure` - Verify Constitution compliance of module structure

**Example Usage**:

```text
@constitution-enforcer Check project for constitutional compliance violations
```

**Platform-Specific Usage**:

- **Claude Code**: `@constitution-enforcer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 8. @database-administrator

**Role**: Database Administrator AI

**Description**: Copilot agent that assists with database operations, performance tuning, backup/recovery, monitoring, and high availability configuration

**Category**: Infrastructure

**Example Usage**:

```text
@database-administrator Optimize PostgreSQL performance and create backup strategy
```

**Platform-Specific Usage**:

- **Claude Code**: `@database-administrator` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 9. @database-schema-designer

**Role**: Database Schema Designer AI

**Description**: Copilot agent for database schema design, ER diagrams, normalization, DDL generation, and performance optimization

**Category**: Architecture

**Example Usage**:

```text
@database-schema-designer Design normalized database schema for social media app
```

**Platform-Specific Usage**:

- **Claude Code**: `@database-schema-designer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 10. @devops-engineer

**Role**: DevOps Engineer AI

**Description**: Copilot agent that assists with CI/CD pipeline creation, infrastructure automation, Docker/Kubernetes deployment, and DevOps best practices

**Category**: Infrastructure

**Example Usage**:

```text
@devops-engineer Create CI/CD pipeline with GitHub Actions and Docker deployment
```

**Platform-Specific Usage**:

- **Claude Code**: `@devops-engineer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 11. @orchestrator

**Role**: Orchestrator AI

**Description**: Integrated orchestrator agent that manages and coordinates 18 specialized AI agents for Specification Driven Development

**Category**: Orchestration

**MCP Tools** (when CodeGraphMCPServer available):

- `global_search` - Overview of the entire codebase and community detection
- `query_codebase` - Search code related to the task

**Example Usage**:

```text
@orchestrator Implement user authentication feature from requirements to deployment
```

**Platform-Specific Usage**:

- **Claude Code**: `@orchestrator` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 12. @performance-optimizer

**Role**: Performance Optimizer AI

**Description**: Copilot agent that assists with performance analysis, bottleneck detection, optimization strategies, and benchmarking

**Category**: Security

**Example Usage**:

```text
@performance-optimizer Optimize database queries causing slow page load times
```

**Platform-Specific Usage**:

- **Claude Code**: `@performance-optimizer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 13. @project-manager

**Role**: Project Manager AI

**Description**: Copilot agent that assists with project planning, scheduling, risk management, and progress tracking for software development projects

**Category**: Requirements

**Example Usage**:

```text
@project-manager Create project plan with WBS and Gantt chart for 3-month development
```

**Platform-Specific Usage**:

- **Claude Code**: `@project-manager` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 14. @quality-assurance

**Role**: Quality Assurance AI

**Description**: Copilot agent that assists with comprehensive QA strategy and test planning to ensure product quality through systematic testing and quality metrics

**Category**: Quality

**Example Usage**:

```text
@quality-assurance Develop QA strategy and test plan for new feature release
```

**Platform-Specific Usage**:

- **Claude Code**: `@quality-assurance` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 15. @release-coordinator

**Role**: Release Coordinator

**Description**: Coordinates multi-component releases, feature flags, versioning, and rollback strategies.

**Category**: Infrastructure

**Example Usage**:

```text
@release-coordinator Plan release strategy with rollback procedures and deployment windows
```

**Platform-Specific Usage**:

- **Claude Code**: `@release-coordinator` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 16. @requirements-analyst

**Role**: Requirements Analyst AI

**Description**: Copilot agent that assists with requirements analysis, user story creation, specification definition, and acceptance criteria definition

**Category**: Requirements

**Example Usage**:

```text
@requirements-analyst Create EARS requirements for user registration with email verification
```

**Platform-Specific Usage**:

- **Claude Code**: `@requirements-analyst` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 17. @security-auditor

**Role**: Security Auditor AI

**Description**: security-auditor skill

**Category**: Security

**MCP Tools** (when CodeGraphMCPServer available):

- `find_callers` - Trace callers of dangerous functions
- `query_codebase` - Search for vulnerability patterns
- `find_dependencies` - Analyze security dependencies

**Example Usage**:

```text
@security-auditor Audit authentication system for OWASP Top 10 vulnerabilities
```

**Platform-Specific Usage**:

- **Claude Code**: `@security-auditor` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 18. @site-reliability-engineer

**Role**: Site Reliability Engineer

**Description**: Production monitoring, observability, SLO/SLI management, and incident response.

**Category**: Infrastructure

**Example Usage**:

```text
@site-reliability-engineer Set up monitoring, alerting, and SLO tracking for production
```

**Platform-Specific Usage**:

- **Claude Code**: `@site-reliability-engineer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 19. @software-developer

**Role**: Software Developer

**Description**: software-developer skill

**Category**: Development

**MCP Tools** (when CodeGraphMCPServer available):

- `get_code_snippet` - Reference existing code
- `find_callees` - Check callees
- `local_search` - Discover similar implementation patterns
- `query_codebase` - Search related code

**Example Usage**:

```text
@software-developer Implement user login API with JWT authentication and unit tests
```

**Platform-Specific Usage**:

- **Claude Code**: `@software-developer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 20. @steering

**Role**: Steering

**Description**: steering skill

**Category**: Orchestration

**MCP Tools** (when CodeGraphMCPServer available):

- `global_search` - Understand the codebase structure
- `analyze_module_structure` - Analyze module structure
- `query_codebase` - Detect the technology stack

**Example Usage**:

```text
@steering Analyze this codebase and generate project steering context
```

**Platform-Specific Usage**:

- **Claude Code**: `@steering` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 21. @system-architect

**Role**: System Architect AI

**Description**: Copilot agent that assists with architecture design, C4 model diagrams, ADR creation, and tradeoff analysis

**Category**: Architecture

**MCP Tools** (when CodeGraphMCPServer available):

- `global_search` - Discover module boundaries via community detection
- `analyze_module_structure` - Module structure analysis
- `find_dependencies` - Visualize dependencies between components

**Example Usage**:

```text
@system-architect Design microservices architecture for e-commerce platform with C4 diagrams
```

**Platform-Specific Usage**:

- **Claude Code**: `@system-architect` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 22. @technical-writer

**Role**: Technical Writer

**Description**: technical-writer skill

**Category**: Documentation

**Example Usage**:

```text
@technical-writer Write API documentation and user guide for REST API
```

**Platform-Specific Usage**:

- **Claude Code**: `@technical-writer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 23. @test-engineer

**Role**: Test Engineer

**Description**: test-engineer skill

**Category**: Quality

**MCP Tools** (when CodeGraphMCPServer available):

- `find_callers` - Automatically determine test coverage
- `find_dependencies` - Discover untested code paths
- `query_codebase` - Search for test targets

**Example Usage**:

```text
@test-engineer Create comprehensive test suite for payment processing module
```

**Platform-Specific Usage**:

- **Claude Code**: `@test-engineer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 24. @traceability-auditor

**Role**: Traceability Auditor

**Description**: Validates complete requirements traceability across EARS requirements → design → tasks → code → tests.

**Category**: Quality

**MCP Tools** (when CodeGraphMCPServer available):

- `query_codebase` - Search the codebase by requirement ID
- `find_callers` - Verify requirement → code → test mapping
- `find_dependencies` - Verify the traceability chain

**Example Usage**:

```text
@traceability-auditor Verify requirements traceability from specs to tests
```

**Platform-Specific Usage**:

- **Claude Code**: `@traceability-auditor` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## 25. @ui-ux-designer

**Role**: UI/UX Designer AI

**Description**: Copilot agent that assists with user interface and experience design, wireframes, prototypes, design systems, and usability testing

**Category**: Architecture

**Example Usage**:

```text
@ui-ux-designer Create wireframes and prototypes for mobile shopping app
```

**Platform-Specific Usage**:

- **Claude Code**: `@ui-ux-designer` (Skills API)
- **Other Platforms**: Reference this AGENTS.md file and describe the agent's role in your request

---

## Constitutional Governance

All agents must comply with the 9 Constitutional Articles defined in `steering/rules/constitution.md`:

1. **Article I**: Testable-Core Principle - Feature logic lives in core modules that are tested without the UI, server or CLI; the project profile (library | cli | application) decides what a core module is
2. **Article II**: Automation Interface Mandate - Primary functionality is reachable without the UI: a CLI for library and cli projects, the HTTP API for applications
3. **Article III**: Test-First Imperative - Write tests before implementation (80%+ coverage)
4. **Article IV**: EARS Requirements Format - All requirements use EARS patterns
5. **Article V**: Traceability Obligation - Maintain requirement ↔ design ↔ code ↔ test mapping
6. **Article VI**: Project Memory - Read steering files before starting work
7. **Article VII**: Simplicity Gate - Maximum 3 projects initially; files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10
8. **Article VIII**: Anti-Abstraction Gate - Use framework features directly
9. **Article IX**: Real Services in Tests - Use actual services/APIs in tests

The project profile (`library | cli | application`) in `steering/project.yml` (`constitution.profile`, default `library` when absent) decides how Articles I and II apply. Read it before applying those articles.

Use `@constitution-enforcer` to validate compliance.

---

## Workflow Integration

### Greenfield Projects (New Development)

```text
1. @steering          → Generate project memory (structure.md, tech.md, product.md)
2. @requirements-analyst → Create EARS requirements
3. @system-architect  → Design architecture with C4 diagrams
4. @api-designer      → Design APIs (if needed)
5. @database-schema-designer → Design database (if needed)
6. @software-developer → Implement with tests
7. @test-engineer     → Create comprehensive test suite
8. @code-reviewer     → Review code quality
9. @security-auditor  → Security audit
10. @devops-engineer  → Set up CI/CD
11. @release-coordinator → Plan deployment
```

### Brownfield Projects (Existing Codebase)

```text
1. @change-impact-analyzer → Analyze change impact
2. @requirements-analyst   → Document change requirements
3. @system-architect       → Update architecture if needed
4. @software-developer     → Implement changes
5. @test-engineer          → Update/add tests
6. @code-reviewer          → Review changes
7. @traceability-auditor   → Verify traceability
```

### Quick Tasks

- **Bug Fixing**: @bug-hunter → @software-developer → @test-engineer
- **Performance**: @performance-optimizer → @software-developer → @test-engineer
- **Documentation**: @technical-writer
- **Security Audit**: @security-auditor
- **Project Planning**: @project-manager

---

## Multi-Agent Orchestration

For complex tasks spanning multiple domains, use:

```text
@orchestrator [Your complex request]
```

The orchestrator will:

1. Analyze the request
2. Break down into subtasks
3. Select appropriate agents
4. Coordinate execution
5. Integrate results
6. Ensure constitutional compliance

**Example**:

```text
@orchestrator Implement a secure payment processing feature with API, database, tests, and deployment pipeline
```

---

**Generated by MUSUBI v0.1.3** | [Documentation](https://github.com/nahisaho/MUSUBI)
