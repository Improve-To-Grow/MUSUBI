title: MUSUBI v3.0.0 Complete Guide: 27 Specialized AI Agents and Skills

# Chapter 1 Introduction

MUSUBI (Specification Driven Development) v3.0.0 is a specification-driven development framework built on Claude Code. This article explains in detail the role, available tools, and area of expertise of each of the **27 specialized AI agents (Skills)** included in MUSUBI.

**v3.0.0 New Features:**
- 🌐 **Browser Agent**: Automate the browser with natural language
- 📊 **Web GUI Dashboard**: Real-time project dashboard
- 🔄 **Spec Kit compatible**: Two-way conversion with GitHub Copilot Spec Kit

# Chapter 2 Installation and Upgrade

## 2.1 New Installation

```bash
# For Claude Code (default)
musubi-sdd init

# For GitHub Copilot
musubi-sdd init --copilot

# For Cursor IDE
musubi-sdd init --cursor
```

## 2.2 Upgrading an Existing Project

```bash
# Upgrade to v3.0.0
musubi-sdd init

# Skills and commands are updated automatically
```

**Note:** To get the latest version, rerun `npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'` before upgrading a project.

# Chapter 3 Agent (Skill) Overview

In MUSUBI, each specialized AI is defined as a **Skill**. Each Skill is specialized for specific tasks and is invoked automatically in response to trigger words.

## 3.1 Orchestration

### 3.1.1 Orchestrator

**Master coordinator that oversees multiple agents**

| Item | Content |
|------|------|
| **Description** | Oversees the 27 specialized AI agents and decomposes and coordinates complex tasks |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep, TodoWrite |
| **Trigger words** | orchestrate, coordinate, multi-agent, workflow, execution plan, task breakdown, agent selection, project planning, complex task, full lifecycle, end-to-end development |

**Key features:**
- Agent selection: Select the best agent for the user's request
- Workflow coordination: Manage dependencies and execution order between agents
- Task breakdown: Split complex requirements into executable subtasks
- Result integration: Integrate and organize the outputs of multiple agents
- Progress management: Track and report overall progress

---

### 3.1.2 Steering

**Project memory manager**

| Item | Content |
|------|------|
| **Description** | Analyzes the codebase and generates and maintains project memory (steering context) |
| **Tools used** | Read, Write, Bash, Glob, Grep |
| **Trigger words** | steering, project memory, codebase analysis, auto-update context, generate steering, architecture patterns, tech stack analysis, project structure |

**Generated documents:**
- `steering/structure.md` - Architecture patterns, directory structure, naming conventions
- `steering/tech.md` - Technology stack, frameworks, development tools
- `steering/product.md` - Business context, product purpose, users
- `steering/project.yml` - Project settings (machine-readable format)

---

## 3.2 Requirements and Planning

### 3.2.1 Requirements Analyst

**Expert in requirements analysis and user story creation**

| Item | Content |
|------|------|
| **Description** | Analyzes stakeholder needs and defines clear functional and non-functional requirements |
| **Tools used** | Read, Write, Edit, Bash |
| **Trigger words** | requirements, EARS format, user stories, functional requirements, non-functional requirements, SRS, requirement analysis, specification, acceptance criteria |

**Areas of expertise:**
- Requirements definition (functional requirements, non-functional requirements, constraints)
- Stakeholder analysis
- Requirements elicitation (interviews, workshops, prototyping)
- Documenting requirements in EARS format
- Prioritization (MoSCoW method, Kano analysis)

---

### 3.2.2 Project Manager

**Expert in project planning and risk management**

| Item | Content |
|------|------|
| **Description** | Responsible for project planning, schedule management, risk management, and progress tracking |
| **Tools used** | Read, Write, Edit, TodoWrite |
| **Trigger words** | project management, project plan, WBS, Gantt chart, risk management, sprint planning, milestone tracking, project timeline, resource allocation |

**Areas of expertise:**
- Project planning (WBS, Gantt charts, milestones)
- Risk management (risk identification, analysis, countermeasures)
- Agile/Scrum management (sprint planning, backlog management)
- Stakeholder management

---

## 3.3 Architecture and Design

### 3.3.1 System Architect

**Expert in system architecture design**

| Item | Content |
|------|------|
| **Description** | System architecture design, C4 model diagrams, ADR (Architecture Decision Record) creation |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | architecture, system design, C4 model, ADR, architecture decision, component diagram, sequence diagram, system architecture |

**Areas of expertise:**
- C4 model (Context, Container, Component, Code)
- Architecture patterns (microservices, monolith, event-driven)
- Distributed system design
- Security architecture

---

### 3.3.2 API Designer

**Expert in API design**

| Item | Content |
|------|------|
| **Description** | Design of REST/GraphQL/gRPC APIs and creation of OpenAPI specifications |
| **Tools used** | Read, Write, Edit, Bash |
| **Trigger words** | API design, REST API, GraphQL, OpenAPI, Swagger, gRPC, API specification, endpoint design, API contract |

**Areas of expertise:**
- RESTful API design (resource design, HTTP methods, status codes)
- GraphQL API design (schemas, resolvers)
- gRPC design (Protocol Buffers, service definitions)
- Creating OpenAPI specifications
- API security (OAuth2, JWT, rate limiting)

---

### 3.3.3 Database Schema Designer

**Expert in database schema design**

| Item | Content |
|------|------|
| **Description** | Database design, ER diagrams, DDL generation |
| **Tools used** | Read, Write, Edit, Bash |
| **Trigger words** | database design, schema design, ER diagram, data model, DDL, database architecture, entity relationship |

**Areas of expertise:**
- Data modeling (conceptual, logical, and physical design)
- Normalization (1NF to BCNF)
- RDBMS (PostgreSQL, MySQL, SQL Server)
- NoSQL (MongoDB, DynamoDB, Redis)

---

### 3.3.4 UI/UX Designer

**Expert in UI/UX design**

| Item | Content |
|------|------|
| **Description** | User interface design, wireframes, prototype creation |
| **Tools used** | Read, Write, Edit |
| **Trigger words** | UI design, UX design, wireframe, mockup, prototype, user interface, user experience, design system, component library, accessibility |

**Areas of expertise:**
- UX design (personas, user journey maps)
- UI design (wireframes, mockups)
- Design systems (component libraries, design tokens)
- Accessibility (WCAG 2.1 compliance)

---

## 3.4 Development and Implementation

### 3.4.1 Software Developer

**Expert in multi-language code implementation**

| Item | Content |
|------|------|
| **Description** | Code implementation in multiple languages, following SOLID principles and design patterns |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | implement, code, development, programming, coding, write code, create function, build feature |

**Supported languages:**
- TypeScript, JavaScript, Python, Java, C#, Go, Swift, Kotlin, Rust, PHP, Ruby

**Supported frameworks:**
- Frontend: React, Vue, Angular, Svelte, Next.js, Nuxt.js
- Backend: Express, NestJS, FastAPI, Django, Spring Boot, ASP.NET

---

### 3.4.2 Test Engineer

**Expert in test strategy and implementation**

| Item | Content |
|------|------|
| **Description** | Design and implementation of unit/integration/E2E tests, mapping to EARS requirements |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | testing, unit tests, integration tests, E2E tests, test automation, test cases, TDD, BDD |

**Areas of expertise:**
- Unit tests (Vitest, Jest, pytest, JUnit)
- Integration tests
- E2E tests (Playwright, Cypress)
- TDD/BDD methods

---

## 3.5 Quality and Review

### 3.5.1 Code Reviewer

**Expert in code review**

| Item | Content |
|------|------|
| **Description** | Code review, SOLID principles, best practice verification |
| **Tools used** | Read, Grep, Glob, Bash (read-only) |
| **Trigger words** | code review, code quality, SOLID principles, best practices, review code, PR review |

**Review perspectives:**
- Code quality (readability, maintainability)
- Compliance with SOLID principles
- Security vulnerabilities
- Performance issues
- Test coverage

---

### 3.5.2 Quality Assurance

**Expert in QA strategy and test planning**

| Item | Content |
|------|------|
| **Description** | Develops a comprehensive QA strategy and test plan to ensure quality |
| **Tools used** | Read, Write, Edit, Bash |
| **Trigger words** | QA, quality assurance, test strategy, QA plan, quality metrics, test planning, quality gates, acceptance testing |

**Areas of expertise:**
- QA strategy development (quality goals, KPIs, acceptance criteria)
- Test planning (test scope, schedule)
- Quality metrics (coverage, defect density)
- Requirements traceability

---

### 3.5.3 Bug Hunter

**Expert in bug investigation and root cause analysis**

| Item | Content |
|------|------|
| **Description** | Bug investigation, identifying reproduction steps, root cause analysis, fix proposals |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | bug fix, debug, troubleshoot, root cause analysis, error investigation, fix bug, resolve issue |

**Areas of expertise:**
- Bug investigation methods (reproduction steps, log analysis)
- Root cause analysis (5 Whys, fishbone diagrams)
- Bug types (logic errors, memory leaks, race conditions)
- Debugging strategies

---

## 3.6 Security and Performance

### 3.6.1 Security Auditor

**Expert in security auditing**

| Item | Content |
|------|------|
| **Description** | Vulnerability detection and security auditing based on the OWASP Top 10 |
| **Tools used** | Read, Grep, Glob, Bash (read-only) |
| **Trigger words** | security audit, vulnerability scan, OWASP, security review, penetration testing, security assessment |

**Areas of expertise:**
- OWASP Top 10 (2021)
- Web security (XSS, CSRF, SQL injection)
- API security (authentication, authorization)
- Infrastructure security

---

### 3.6.2 Performance Optimizer

**Expert in performance analysis and optimization**

| Item | Content |
|------|------|
| **Description** | Performance analysis, bottleneck detection, and optimization strategy proposals |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | performance optimization, performance tuning, profiling, benchmark, bottleneck analysis, scalability, latency optimization |

**Areas of expertise:**
- Frontend optimization (Core Web Vitals, bundle optimization)
- Backend optimization (query optimization, caching)
- Infrastructure optimization (scaling, CDN)

---

## 3.7 Infrastructure and Operations

### 3.7.1 DevOps Engineer

**Expert in CI/CD and infrastructure automation**

| Item | Content |
|------|------|
| **Description** | CI/CD pipeline construction, Docker/Kubernetes, infrastructure automation |
| **Tools used** | Read, Write, Edit, Bash, Glob |
| **Trigger words** | CI/CD, DevOps, Docker, Kubernetes, pipeline, deployment, container, infrastructure automation |

**Areas of expertise:**
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Containerization (Docker, Docker Compose)
- Orchestration (Kubernetes)
- IaC (Terraform, Ansible)

---

### 3.7.2 Cloud Architect

**Expert in cloud architecture**

| Item | Content |
|------|------|
| **Description** | AWS/Azure/GCP design, IaC (Terraform/Bicep) code generation, cost optimization |
| **Tools used** | Read, Write, Edit, Bash |
| **Trigger words** | cloud architecture, AWS, Azure, GCP, Terraform, cloud design, infrastructure as code, cloud migration |

**Areas of expertise:**
- AWS (EC2, Lambda, RDS, S3, EKS)
- Azure (VMs, Functions, SQL, Storage, AKS)
- GCP (Compute, Cloud Run, Cloud SQL)
- IaC (Terraform, Bicep, CloudFormation)

---

### 3.7.3 Database Administrator

**Expert in database operations and tuning**

| Item | Content |
|------|------|
| **Description** | Database operations, performance tuning, backup/recovery |
| **Tools used** | Read, Write, Edit, Bash, Grep |
| **Trigger words** | database administration, DBA, database tuning, performance tuning, backup recovery, high availability |

**Supported databases:**
- RDBMS: PostgreSQL, MySQL/MariaDB, Oracle, SQL Server
- NoSQL: MongoDB, Redis, Cassandra, DynamoDB
- NewSQL: CockroachDB, TiDB

---

### 3.7.4 Site Reliability Engineer

**Expert in SRE, monitoring, and incident response**

| Item | Content |
|------|------|
| **Description** | Production monitoring, observability, SLO/SLI management, incident response |
| **Tools used** | Read, Write, Bash, Glob |
| **Trigger words** | monitoring, observability, SRE, site reliability, alerting, incident response, SLO, SLI, error budget, Prometheus, Grafana |

**Areas of expertise:**
- SLI/SLO definition and tracking
- Monitoring platforms (Prometheus, Grafana, Datadog)
- Alert configuration
- Incident response workflow
- Post-mortems

---

### 3.7.5 Release Coordinator

**Expert in release coordination and deployment strategy**

| Item | Content |
|------|------|
| **Description** | Multi-component release coordination, feature flags, rollback strategy |
| **Tools used** | Read, Write, Bash, Glob, TodoWrite |
| **Trigger words** | release management, release planning, feature flags, canary deployment, progressive rollout, release notes, rollback strategy |

**Areas of expertise:**
- Release planning and coordination
- Feature flag management
- Canary/blue-green deployments
- Rollback procedures

---

## 3.8 Documentation

### 3.8.1 Technical Writer

**Expert in technical writing**

| Item | Content |
|------|------|
| **Description** | Creation of technical documents, API documentation, user guides, and READMEs |
| **Tools used** | Read, Write, Edit, Glob |
| **Trigger words** | documentation, technical writing, API documentation, README, user guide, developer guide, tutorial |

**Supported documents:**
- README (project overview, setup instructions)
- API documentation (OpenAPI, Swagger)
- User guides/developer guides
- Tutorials

---

## 3.9 Specialized

### 3.9.1 AI/ML Engineer

**Expert in machine learning and MLOps**

| Item | Content |
|------|------|
| **Description** | Machine learning model development, training, evaluation, deployment, MLOps |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | machine learning, ML, AI, model training, MLOps, model deployment, feature engineering, neural network, deep learning |

**Areas of expertise:**
- Machine learning model development (supervised/unsupervised learning, deep learning)
- NLP (text classification, NER, text generation)
- Computer vision (image classification, object detection)
- MLOps (model versioning, deployment, monitoring)
- LLM/generative AI (fine-tuning, RAG, agents)

---

### 3.9.2 Change Impact Analyzer

**Expert in change impact analysis**

| Item | Content |
|------|------|
| **Description** | Impact analysis of changes to existing systems, breaking change detection, migration planning |
| **Tools used** | Read, Write, Bash, Glob, Grep |
| **Trigger words** | change impact, impact analysis, brownfield, delta spec, change proposal, breaking changes, dependency analysis |

**Areas of expertise:**
- Identifying affected components
- Detecting breaking changes
- Updating dependency graphs
- Risk assessment and migration planning

---

### 3.9.3 Constitution Enforcer

**Watchdog for Constitution (governance) compliance**

| Item | Content |
|------|------|
| **Description** | Verifies compliance with the 9 Constitutional Articles and Phase -1 Gates |
| **Tools used** | Read, Glob, Grep (read-only) |
| **Trigger words** | constitution, governance, compliance, validation, Phase -1 Gates, simplicity gate, anti-abstraction gate, test-first |

**The 9 Constitutional Articles:**
1. Library-First Principle
2. CLI Interface Mandate
3. Test-First Imperative
4. EARS Requirements Format
5. Traceability Mandate
6. Project Memory
7. Simplicity Gate
8. Anti-Abstraction Gate
9. Integration-First Testing

---

### 3.9.4 Traceability Auditor

**Expert in requirements traceability auditing**

| Item | Content |
|------|------|
| **Description** | Verifies complete traceability from EARS requirements to design to tasks to code to tests |
| **Tools used** | Read, Glob, Grep (read-only) |
| **Trigger words** | traceability, requirements coverage, coverage matrix, traceability matrix, requirement mapping, EARS coverage |

**Verification contents:**
- Requirements-to-design mapping (100% coverage)
- Design-to-task mapping
- Task-to-code mapping
- Code-to-test mapping
- Gap detection (orphaned requirements, untested code)

---

# Chapter 4 New Features in v3.0.0

## 4.1 Browser Automation Agent

**Expert in browser automation testing** 🆕

| Item | Content |
|------|------|
| **Description** | Browser automation with Playwright, E2E testing, Web UI testing |
| **Tools used** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | browser automation, e2e test, playwright, end-to-end, web testing, UI testing, browser test, screenshot, web scraping |

**Areas of expertise:**
- Design and implementation of E2E test scenarios
- Cross-browser testing (Chromium, Firefox, WebKit)
- Visual regression testing (screenshot comparison)
- Web accessibility auditing
- Performance measurement (Core Web Vitals)

**Usage examples:**
```bash
# Generate E2E tests
musubi-workflow --agent browser --task "Create an E2E test for the login flow"

# Visual regression test
musubi-workflow --agent browser --task "Screenshot test for the dashboard"
```

---

## 4.2 Web GUI Dashboard

**Web-based dashboard** 🆕

| Item | Content |
|------|------|
| **Description** | Web dashboard that visualizes the SDD workflow and traceability |
| **Features** | Project overview, workflow status, specification list, traceability matrix, Constitution display |
| **Technology** | Express.js, WebSocket, single-page application |

**Key features:**
- **Project overview**: File statistics, workflow progress
- **Workflow visualization**: Display of the 8-stage SDD workflow status
- **Specification browser**: Search and browse requirements, design, and tasks
- **Traceability matrix**: Visualization of requirements coverage
- **Real-time updates**: File change notifications via WebSocket

**Usage examples:**
```bash
# Start the dashboard
musubi-gui start

# Development mode (hot reload)
musubi-gui dev

# Show only the traceability matrix
musubi-gui matrix

# Specify a custom port
musubi-gui start --port 4000
```

**API endpoints:**
| Endpoint | Description |
|----------------|------|
| `GET /api/project` | Project overview |
| `GET /api/specs` | Specification list (EARS format) |
| `GET /api/traceability` | Traceability matrix |
| `GET /api/workflow` | Workflow status |
| `GET /api/steering` | Steering documents |
| `GET /api/health` | Health check |

---

# Chapter 5 OpenHands-Derived Modules (v2.2.0+)

MUSUBI v2.2.0 integrated eight advanced modules inspired by the **OpenHands project**. These modules significantly improve agent autonomy and quality.

## 5.1 StuckDetector

**Automatic detection of stuck agents**

| Item | Content |
|------|------|
| **Description** | Automatically detects when an agent repeats the same operation or makes no progress |
| **Detection patterns** | Repeated execution of the same command, error loops, long waits with no progress |
| **Response** | Automatic recovery suggestions, presentation of alternative approaches |

## 5.2 SkillsLoader

**Dynamic skill loading and management**

| Item | Content |
|------|------|
| **Description** | Dynamically loads skills (agents) as needed |
| **Features** | On-demand loading, memory efficiency, skill dependency management |

```javascript
// Dynamic skill loading
const skill = await skillsLoader.load('code-reviewer');
```

## 5.3 MemoryCondenser

**Efficient compression of long-term memory**

| Item | Content |
|------|------|
| **Description** | Efficiently compresses long-term context while retaining important information |
| **Features** | Context compression, prioritized retention of important information, token optimization |

## 5.4 CriticSystem

**Quality evaluation of agent output**

| Item | Content |
|------|------|
| **Description** | Evaluates agent output and calculates a quality score |
| **Evaluation criteria** | Accuracy, completeness, consistency, best practice compliance |

```javascript
// Quality evaluation
const critique = await criticSystem.evaluate(agentOutput);
// { score: 0.85, feedback: [...], improvements: [...] }
```

## 5.5 IssueResolver

**Automatic analysis and resolution proposals for GitHub Issues**

| Item | Content |
|------|------|
| **Description** | Analyzes GitHub Issues and automatically generates the tasks needed to resolve them |
| **Features** | Issue classification, root cause analysis, automatic task generation, PR proposals |

## 5.6 SecurityAnalyzer

**Automatic detection of security vulnerabilities**

| Item | Content |
|------|------|
| **Description** | Automatically detects security vulnerabilities in code |
| **Detection items** | SQL injection, XSS, CSRF, authentication/authorization issues, dependency vulnerabilities |

```javascript
// Security analysis
const vulnerabilities = await securityAnalyzer.scan(codebase);
// [{ type: 'SQL Injection', severity: 'high', location: '...' }]
```

## 5.7 AgentMemoryManager

**Memory sharing between agents**

| Item | Content |
|------|------|
| **Description** | Shares and synchronizes memory across multiple agents |
| **Features** | Shared context management, inter-agent communication, state persistence |

## 5.8 GitHubClient

**GitHub API integration**

| Item | Content |
|------|------|
| **Description** | Automates Issue/PR operations through integration with the GitHub API |
| **Supported operations** | Create/update/close Issues, create/review/merge PRs, add comments |

---

# Chapter 6 List of Tools Used

The tools each Skill can use are as follows:

| Tool | Description | Permission |
|--------|------|------|
| **Read** | Read files | Read |
| **Write** | Create files | Write |
| **Edit** | Edit files | Write |
| **Bash** | Execute shell commands | Execute |
| **Glob** | File pattern search | Read |
| **Grep** | Content search | Read |
| **TodoWrite** | Task management | Write |

---

# Chapter 7 Agent Permission Matrix

| Skill | Read | Write | Edit | Bash | Glob | Grep | TodoWrite |
|-------|:----:|:-----:|:----:|:----:|:----:|:----:|:---------:|
| Orchestrator | O | O | O | O | O | O | O |
| Steering | O | O | - | O | O | O | - |
| Requirements Analyst | O | O | O | O | - | - | - |
| Project Manager | O | O | O | - | - | - | O |
| System Architect | O | O | O | O | O | O | - |
| API Designer | O | O | O | O | - | - | - |
| Database Schema Designer | O | O | O | O | - | - | - |
| UI/UX Designer | O | O | O | - | - | - | - |
| Software Developer | O | O | O | O | O | O | - |
| Test Engineer | O | O | O | O | O | O | - |
| Code Reviewer | O | - | - | O | O | O | - |
| Quality Assurance | O | O | O | O | - | - | - |
| Bug Hunter | O | O | O | O | O | O | - |
| Security Auditor | O | - | - | O | O | O | - |
| Performance Optimizer | O | O | O | O | O | O | - |
| DevOps Engineer | O | O | O | O | O | - | - |
| Cloud Architect | O | O | O | O | - | - | - |
| Database Administrator | O | O | O | O | - | O | - |
| Site Reliability Engineer | O | O | - | O | O | - | - |
| Release Coordinator | O | O | - | O | O | - | O |
| Technical Writer | O | O | O | - | O | - | - |
| AI/ML Engineer | O | O | O | O | O | O | - |
| Change Impact Analyzer | O | O | - | O | O | O | - |
| Constitution Enforcer | O | - | - | - | O | O | - |
| Traceability Auditor | O | - | - | - | O | O | - |
| Browser Automation Agent | O | O | O | O | O | O | - |

---

# Chapter 8 Slash Command List

MUSUBI provides nine slash commands that can be used in Claude Code. These commands support each stage of the SDD workflow.

## 8.1 Core Commands

| Command | Description | Usage example |
|----------|------|--------|
| `/sdd-steering` | Generate and update project memory (steering context) | `/sdd-steering` |
| `/sdd-requirements` | Create an EARS-format requirements specification | `/sdd-requirements authentication` |
| `/sdd-design` | Generate a technical design document from requirements | `/sdd-design authentication` |
| `/sdd-tasks` | Break the design down into actionable tasks | `/sdd-tasks authentication` |
| `/sdd-implement` | Implement the feature based on tasks | `/sdd-implement authentication` |
| `/sdd-validate` | Validate Constitution compliance and requirements coverage | `/sdd-validate authentication` |

## 8.2 Change Management Commands (for Brownfield)

Commands for managing changes to existing systems:

| Command | Description | Usage example |
|----------|------|--------|
| `/sdd-change-init` | Initialize a change proposal | `/sdd-change-init add-2fa` |
| `/sdd-change-apply` | Apply an approved change proposal | `/sdd-change-apply add-2fa` |
| `/sdd-change-archive` | Archive a completed change proposal | `/sdd-change-archive add-2fa` |

## 8.3 Command Details

### 8.3.1 `/sdd-steering` - Project Memory Generation

Analyzes the project's codebase and generates the steering context.

**Modes:**
- **Bootstrap Mode**: When no steering files exist, analyzes the entire codebase and generates the initial files
- **Sync Mode**: When steering files exist, detects differences from the codebase and updates them

**Generated files:**
```
steering/
├── structure.md    # Architecture patterns
├── tech.md         # Technology stack
├── product.md      # Business context
└── project.yml     # Project settings (machine-readable)
```

---

### 8.3.2 `/sdd-requirements [feature-name]` - Requirements Definition

Creates an EARS-format requirements specification for the specified feature.

**Output:**
```
docs/requirements/[feature-name]/
├── requirements.md       # English version
└── requirements.ja.md    # Japanese version
```

**EARS format patterns:**
- **Event-driven**: `WHEN [event], the [system] SHALL [response]`
- **State-driven**: `WHILE [state], the [system] SHALL [response]`
- **Unwanted behavior**: `IF [error], THEN the [system] SHALL [response]`
- **Optional features**: `WHERE [feature enabled], the [system] SHALL [response]`
- **Ubiquitous**: `The [system] SHALL [requirement]`

---

### 8.3.3 `/sdd-design [feature-name]` - Technical Design

Generates a technical design document from the requirements specification.

**Output:**
```
docs/design/[feature-name]/
├── design.md       # English version
└── design.ja.md    # Japanese version
```

**Contents included:**
- C4 model diagrams (Context, Container, Component)
- ADR (Architecture Decision Record)
- Sequence diagrams
- Data model
- API design

---

### 8.3.4 `/sdd-tasks [feature-name]` - Task Breakdown

Breaks the design document down into actionable implementation tasks.

**Output:**
```
docs/tasks/[feature-name]/
├── tasks.md       # English version
└── tasks.ja.md    # Japanese version
```

**Contents included:**
- Prioritized task list
- Requirements coverage matrix
- Dependency graph
- Estimates (complexity)

---

### 8.3.5 `/sdd-implement [feature-name]` - Implementation

Implements the feature based on the task breakdown.

**Process:**
1. Read the task file
2. Write tests first, following the Test-First principle
3. Implement the code
4. Run and verify the tests

---

### 8.3.6 `/sdd-validate [feature-name]` - Validation

Validates whether the implementation satisfies the Constitutional Articles and requirements coverage.

**Validation items:**
- Compliance with the 9 Constitutional Articles
- 100% requirements traceability
- Code quality standards
- Security standards
- Test coverage

---

### 8.3.7 `/sdd-change-init [change-name]` - Change Proposal Initialization

Creates a change proposal for an existing system (for Brownfield projects).

**Output:**
```
changes/[change-name]/
├── proposal.md     # Change proposal
└── specs/          # Delta specs (ADDED/MODIFIED/REMOVED/RENAMED)
```

---

### 8.3.8 `/sdd-change-apply [change-name]` - Apply Change

Applies an approved change proposal to the codebase.

---

### 8.3.9 `/sdd-change-archive [change-name]` - Archive Change

Archives a completed change proposal and updates the documentation.

---

# Chapter 9 Project Memory (Steering System)

All Skills refer to the following steering files before starting a task:

```
steering/
├── structure.md  # Architecture patterns, directory structure
├── tech.md       # Technology stack, frameworks
└── product.md    # Business context, product purpose
```

This allows all agents to share a consistent project context.

---

# Chapter 10 SDD 8-Stage Workflow

MUSUBI follows the following 8-stage workflow:

```
Research → Requirements → Design → Tasks → Implementation → Testing → Deployment → Monitoring
```

1. **Research**: Technical research, options analysis
2. **Requirements**: Requirements definition in EARS format
3. **Design**: C4 model, ADR, technical design
4. **Tasks**: Breakdown into implementation tasks
5. **Implementation**: Code implementation
6. **Testing**: Unit/integration/E2E tests
7. **Deployment**: CI/CD, infrastructure deployment
8. **Monitoring**: Production monitoring, SLO tracking

---

# Chapter 11 CLI Command List

MUSUBI also provides CLI commands that can be used directly from the terminal.

## 11.1 Main Commands

```bash
# Initialize the project
musubi init                    # Initialize for Claude Code (default)
musubi init --cursor           # Initialize for Cursor IDE
musubi init --copilot          # Initialize for GitHub Copilot
musubi init --gemini           # Initialize for Gemini CLI
musubi init --codex            # Initialize for Codex CLI
musubi init --qwen             # Initialize for Qwen Code
musubi init --windsurf         # Initialize for Windsurf IDE

# Project management
musubi status                  # Show project status
musubi validate                # Quick validation of Constitution compliance
musubi validate --verbose      # Show detailed validation results
musubi sync                    # Sync steering documents with the codebase
musubi sync --dry-run          # Preview changes (not applied)
musubi info                    # Show version and environment information
```

## 11.2 Standalone CLI Commands

Dedicated CLI commands for more advanced operations:

| Command | Description |
|----------|------|
| `musubi-requirements` | EARS-format requirements generator |
| `musubi-design` | Technical design generator (C4, ADR) |
| `musubi-tasks` | Task breakdown generator |
| `musubi-trace` | Traceability matrix analysis |
| `musubi-analyze` | Gap detection and analysis |
| `musubi-onboard` | Team onboarding assistant |
| `musubi-share` | Knowledge sharing tool |
| `musubi-change` | Change impact analysis |
| `musubi-gaps` | Requirements gap detection |
| `musubi-remember` | Project memory management |
| `musubi-resolve` | Problem resolution assistant |
| `musubi-workflow` | Workflow management |

**Usage examples:**
```bash
# Generate requirements
musubi-requirements --feature authentication --output docs/specs/

# Traceability analysis
musubi-trace --requirements docs/specs/requirements.md --tests tests/

# Gap detection
musubi-gaps --specs docs/specs/ --code src/
```

---

# Chapter 12 Supported AI Platforms (7 Types)

MUSUBI supports the following 7 AI coding agents:

| Platform | Flag | Description |
|------------------|--------|------|
| **Claude Code** | `--claude`, `--claude-code` | Default. Full Skills API support |
| **GitHub Copilot** | `--copilot`, `--github-copilot` | Command/prompt approach |
| **Cursor IDE** | `--cursor` | Command/prompt approach |
| **Gemini CLI** | `--gemini`, `--gemini-cli` | Command/prompt approach |
| **Codex CLI** | `--codex`, `--codex-cli` | Command/prompt approach |
| **Qwen Code** | `--qwen`, `--qwen-code` | Command/prompt approach |
| **Windsurf IDE** | `--windsurf` | Command/prompt approach |

**Note:** The Skills API (`@skill-name` format) is exclusive to Claude Code. Other platforms use the command/prompt approach.

---

# Chapter 13 CodeGraph MCP Server Integration

By integrating with the **CodeGraph MCP Server**, MUSUBI enables AI agents to understand the entire codebase as a "graph".

## 13.1 What Is the CodeGraph MCP Server?

The CodeGraph MCP Server is a server that analyzes source code as a graph structure and provides it to AI agents via MCP (Model Context Protocol).

| Feature | Description |
|------|------|
| **Code structure analysis** | Visualize dependencies among functions, classes, and modules |
| **GraphRAG search** | Semantic code search (meaning-based) |
| **Community detection** | Module boundary analysis using the Louvain algorithm |
| **Impact analysis** | Automatically identify the ripple range of changes |
| **14-language support** | Python, JavaScript, TypeScript, Java, C#, Go, Rust, Ruby, PHP, C++, HCL, and more |

## 13.2 Provided MCP Tools (14 Types)

```
# Code graph operations
init_graph          - Initialize graph
get_code_snippet    - Retrieve source code
find_callers        - Trace callers
find_callees        - Trace callees
find_dependencies   - Dependency analysis

# Search features
local_search        - Local context search
global_search       - Global search
query_codebase      - Natural language query

# Analysis features
analyze_module_structure  - Module structure analysis
suggest_refactoring       - Refactoring suggestions
stats                     - Codebase statistics
community                 - Community detection
```

## 13.3 Usage Examples by Agent

| Agent | CodeGraph Usage | Effect |
|-------------|---------------|------|
| **Orchestrator** | `global_search`, `stats` | Grasp the whole project, select the optimal agent |
| **System Architect** | `analyze_module_structure`, `community` | Architecture visualization, refactoring planning |
| **Software Developer** | `get_code_snippet`, `local_search` | Quickly find related code |
| **Code Reviewer** | `find_callers`, `suggest_refactoring` | Check impact scope, suggest improvements |
| **Test Engineer** | `find_dependencies` | Understand dependencies of test targets |
| **Security Auditor** | `find_callers`, `query_codebase` | Identify usage locations of vulnerable functions |
| **Change Impact Analyzer** | `find_dependencies`, `find_callers` | Complete analysis of change impact |
| **Bug Hunter** | `local_search`, `get_code_snippet` | Trace the root cause of bugs |

## 13.4 Setup Methods

### 13.4.1 Method 1: Automatic Setup by the Orchestrator (Recommended)

```
User: Set up CodeGraph MCP
```

The Orchestrator runs automatically:
1. Check the Python environment
2. Install codegraph-mcp-server
3. Create the project index
4. Generate configuration files appropriate to the environment in use

### 13.4.2 Method 2: Manual Setup

```bash
# Install
pipx install --force codegraph-mcp-server

# Create the project index (full index)
codegraph-mcp index . --full

# Example index output:
# Indexed 105 files
# - Entities: 1006
# - Relations: 5359
# - Communities: 36

# Add to Claude Code
claude mcp add codegraph -- codegraph-mcp serve --repo /path/to/project
```

## 13.5 Index Options

| Option | Description |
|----------|------|
| `--full` | Create a full index (recommended) |
| `--incremental` | Update only changed files |
| `--exclude <pattern>` | Specify exclusion patterns (e.g., `node_modules`) |

**Best practices:**
- Always create the index with the `--full` option the first time
- Run `--full` again when there are major changes to the codebase
- Use `--incremental` for efficient day-to-day updates

**For VS Code (Claude Extension):**

`.vscode/settings.json`:
```json
{
  "mcp.servers": {
    "codegraph": {
      "command": "codegraph-mcp",
      "args": ["serve", "--repo", "${workspaceFolder}"]
    }
  }
}
```

## 13.6 Benefits of Adoption

| Metric | Before | After | Improvement |
|------|--------|--------|--------|
| Code search time | 5-10 min manually | Instant (<1 sec) | **99% reduction** |
| Impact analysis accuracy | 60-70% | 95% or higher | **+35%** |
| Refactoring planning time | 2-4 hours | 15-30 min | **85% reduction** |
| Bug cause identification time | 30 min-2 hours | 5-15 min | **75% reduction** |

---

# Chapter 14 Summary

MUSUBI v3.0.0 is a powerful specification-driven development framework that integrates 27 specialized AI agents (Skills). v3.0.0 adds the Browser Automation Agent and the Web GUI Dashboard, greatly strengthening E2E testing and project visualization. Each Skill is specialized for specific tasks and is coordinated automatically by the Orchestrator.

The project memory (Steering System) lets all agents share a consistent context, ensuring traceability from EARS-format requirements through implementation, testing, and deployment.

---

# Chapter 15 Reference Links

- [MUSUBI GitHub Repository](https://github.com/nahisaho/MUSUBI)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [EARS Requirements Syntax](https://en.wikipedia.org/wiki/EARS_(Requirements_Engineering))

---

**Powered by MUSUBI** - Specification Driven Development for AI-assisted coding
