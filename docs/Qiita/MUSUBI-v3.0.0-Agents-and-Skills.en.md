title: MUSUBI v3.0.0 Complete Guide: 27 Specialized AI Agents and Skills

# Chapter 1 Introduction

MUSUBI (Specification Driven Development) v3.0.0 is a specification-driven development framework that leverages Claude Code. This article explains in detail the **27 specialized AI agents (Skills)** included in MUSUBI, covering each one's role, available tools, and area of expertise.

**New in v3.0.0:**
- 🌐 **Browser Agent**: Automate browser operations with natural language
- 📊 **Web GUI Dashboard**: Real-time project dashboard
- 🔄 **Spec Kit compatibility**: Two-way conversion with GitHub Copilot Spec Kit

# Chapter 2 Installation and Upgrade

## 2.1 New Installation

```bash
# For Claude Code (default)
npx musubi-sdd@latest init

# For GitHub Copilot
npx musubi-sdd@latest init --copilot

# For Cursor IDE
npx musubi-sdd@latest init --cursor
```

## 2.2 Upgrading an Existing Project

```bash
# Upgrade to v3.0.0
npx musubi-sdd@latest init

# Skills and commands are updated automatically
```

**Note:** Using `npx` always runs the latest version. A global install is not required.

# Chapter 3 Overview of Agents (Skills)

In MUSUBI, each specialized AI is defined as a **Skill**. Each Skill specializes in a particular task and is invoked automatically based on trigger words.

## 3.1 Orchestration

### 3.1.1 Orchestrator

**Master coordinator that oversees multiple agents**

| Item | Details |
|------|------|
| **Description** | Oversees the 27 specialized AI agents, decomposing and coordinating complex tasks |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep, TodoWrite |
| **Trigger words** | orchestrate, coordinate, multi-agent, workflow, execution plan, task breakdown, agent selection, project planning, complex task, full lifecycle, end-to-end development |

**Main functions:**
- Agent selection: Chooses the best agent for the user's request
- Workflow coordination: Manages dependencies and execution order between agents
- Task decomposition: Splits complex requirements into executable subtasks
- Result integration: Integrates and organizes the outputs of multiple agents
- Progress management: Tracks and reports overall progress

---

### 3.1.2 Steering

**Project memory manager**

| Item | Details |
|------|------|
| **Description** | Analyzes the codebase and generates/maintains project memory (steering context) |
| **Tools** | Read, Write, Bash, Glob, Grep |
| **Trigger words** | steering, project memory, codebase analysis, auto-update context, generate steering, architecture patterns, tech stack analysis, project structure |

**Documents generated:**
- `steering/structure.md` - Architecture patterns, directory structure, naming conventions
- `steering/tech.md` - Technology stack, frameworks, development tools
- `steering/product.md` - Business context, product purpose, users
- `steering/project.yml` - Project configuration (machine-readable format)

---

## 3.2 Requirements & Planning

### 3.2.1 Requirements Analyst

**Expert in requirements analysis and user story creation**

| Item | Details |
|------|------|
| **Description** | Analyzes stakeholder needs and defines clear functional/non-functional requirements |
| **Tools** | Read, Write, Edit, Bash |
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

| Item | Details |
|------|------|
| **Description** | Responsible for project planning, schedule management, risk management, and progress tracking |
| **Tools** | Read, Write, Edit, TodoWrite |
| **Trigger words** | project management, project plan, WBS, Gantt chart, risk management, sprint planning, milestone tracking, project timeline, resource allocation |

**Areas of expertise:**
- Project planning (WBS, Gantt charts, milestones)
- Risk management (risk identification, analysis, mitigation)
- Agile/Scrum management (sprint planning, backlog management)
- Stakeholder management

---

## 3.3 Architecture & Design

### 3.3.1 System Architect

**Expert in system architecture design**

| Item | Details |
|------|------|
| **Description** | System architecture design, C4 model diagrams, ADR (Architecture Decision Record) creation |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | architecture, system design, C4 model, ADR, architecture decision, component diagram, sequence diagram, system architecture |

**Areas of expertise:**
- C4 model (Context, Container, Component, Code)
- Architecture patterns (microservices, monolith, event-driven)
- Distributed system design
- Security architecture

---

### 3.3.2 API Designer

**Expert in API design**

| Item | Details |
|------|------|
| **Description** | Designing REST/GraphQL/gRPC APIs, creating OpenAPI specifications |
| **Tools** | Read, Write, Edit, Bash |
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

| Item | Details |
|------|------|
| **Description** | Database design, ER diagrams, DDL generation |
| **Tools** | Read, Write, Edit, Bash |
| **Trigger words** | database design, schema design, ER diagram, data model, DDL, database architecture, entity relationship |

**Areas of expertise:**
- Data modeling (conceptual, logical, and physical design)
- Normalization (1NF to BCNF)
- RDBMS (PostgreSQL, MySQL, SQL Server)
- NoSQL (MongoDB, DynamoDB, Redis)

---

### 3.3.4 UI/UX Designer

**Expert in UI/UX design**

| Item | Details |
|------|------|
| **Description** | User interface design, wireframes, prototype creation |
| **Tools** | Read, Write, Edit |
| **Trigger words** | UI design, UX design, wireframe, mockup, prototype, user interface, user experience, design system, component library, accessibility |

**Areas of expertise:**
- UX design (personas, user journey maps)
- UI design (wireframes, mockups)
- Design systems (component libraries, design tokens)
- Accessibility (WCAG 2.1 compliance)

---

## 3.4 Development & Implementation

### 3.4.1 Software Developer

**Expert in multi-language code implementation**

| Item | Details |
|------|------|
| **Description** | Code implementation in multiple languages, following SOLID principles and design patterns |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | implement, code, development, programming, coding, write code, create function, build feature |

**Supported languages:**
- TypeScript, JavaScript, Python, Java, C#, Go, Swift, Kotlin, Rust, PHP, Ruby

**Supported frameworks:**
- Frontend: React, Vue, Angular, Svelte, Next.js, Nuxt.js
- Backend: Express, NestJS, FastAPI, Django, Spring Boot, ASP.NET

---

### 3.4.2 Test Engineer

**Expert in test strategy and implementation**

| Item | Details |
|------|------|
| **Description** | Designing and implementing unit/integration/E2E tests, mapping to EARS requirements |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | testing, unit tests, integration tests, E2E tests, test automation, test cases, TDD, BDD |

**Areas of expertise:**
- Unit testing (Vitest, Jest, pytest, JUnit)
- Integration testing
- E2E testing (Playwright, Cypress)
- TDD/BDD methodologies

---

## 3.5 Quality & Review

### 3.5.1 Code Reviewer

**Expert in code review**

| Item | Details |
|------|------|
| **Description** | Code review, checking SOLID principles and best practices |
| **Tools** | Read, Grep, Glob, Bash (read-only) |
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

| Item | Details |
|------|------|
| **Description** | Develops comprehensive QA strategies and test plans to ensure quality |
| **Tools** | Read, Write, Edit, Bash |
| **Trigger words** | QA, quality assurance, test strategy, QA plan, quality metrics, test planning, quality gates, acceptance testing |

**Areas of expertise:**
- QA strategy development (quality goals, KPIs, acceptance criteria)
- Test planning (test scope, schedule)
- Quality metrics (coverage, defect density)
- Requirements traceability

---

### 3.5.3 Bug Hunter

**Expert in bug investigation and root cause analysis**

| Item | Details |
|------|------|
| **Description** | Bug investigation, identifying reproduction steps, root cause analysis, fix proposals |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | bug fix, debug, troubleshoot, root cause analysis, error investigation, fix bug, resolve issue |

**Areas of expertise:**
- Bug investigation techniques (reproduction steps, log analysis)
- Root cause analysis (5 Whys, fishbone diagrams)
- Bug types (logic errors, memory leaks, race conditions)
- Debugging strategies

---

## 3.6 Security & Performance

### 3.6.1 Security Auditor

**Expert in security auditing**

| Item | Details |
|------|------|
| **Description** | Vulnerability detection and security auditing based on the OWASP Top 10 |
| **Tools** | Read, Grep, Glob, Bash (read-only) |
| **Trigger words** | security audit, vulnerability scan, OWASP, security review, penetration testing, security assessment |

**Areas of expertise:**
- OWASP Top 10 (2021)
- Web security (XSS, CSRF, SQL injection)
- API security (authentication, authorization)
- Infrastructure security

---

### 3.6.2 Performance Optimizer

**Expert in performance analysis and optimization**

| Item | Details |
|------|------|
| **Description** | Performance analysis, bottleneck detection, proposing optimization strategies |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | performance optimization, performance tuning, profiling, benchmark, bottleneck analysis, scalability, latency optimization |

**Areas of expertise:**
- Frontend optimization (Core Web Vitals, bundle optimization)
- Backend optimization (query optimization, caching)
- Infrastructure optimization (scaling, CDN)

---

## 3.7 Infrastructure & Operations

### 3.7.1 DevOps Engineer

**Expert in CI/CD and infrastructure automation**

| Item | Details |
|------|------|
| **Description** | Building CI/CD pipelines, Docker/Kubernetes, infrastructure automation |
| **Tools** | Read, Write, Edit, Bash, Glob |
| **Trigger words** | CI/CD, DevOps, Docker, Kubernetes, pipeline, deployment, container, infrastructure automation |

**Areas of expertise:**
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Containerization (Docker, Docker Compose)
- Orchestration (Kubernetes)
- IaC (Terraform, Ansible)

---

### 3.7.2 Cloud Architect

**Expert in cloud architecture**

| Item | Details |
|------|------|
| **Description** | AWS/Azure/GCP design, IaC (Terraform/Bicep) code generation, cost optimization |
| **Tools** | Read, Write, Edit, Bash |
| **Trigger words** | cloud architecture, AWS, Azure, GCP, Terraform, cloud design, infrastructure as code, cloud migration |

**Areas of expertise:**
- AWS (EC2, Lambda, RDS, S3, EKS)
- Azure (VMs, Functions, SQL, Storage, AKS)
- GCP (Compute, Cloud Run, Cloud SQL)
- IaC (Terraform, Bicep, CloudFormation)

---

### 3.7.3 Database Administrator

**Expert in database operations and tuning**

| Item | Details |
|------|------|
| **Description** | Database operations, performance tuning, backup/recovery |
| **Tools** | Read, Write, Edit, Bash, Grep |
| **Trigger words** | database administration, DBA, database tuning, performance tuning, backup recovery, high availability |

**Supported databases:**
- RDBMS: PostgreSQL, MySQL/MariaDB, Oracle, SQL Server
- NoSQL: MongoDB, Redis, Cassandra, DynamoDB
- NewSQL: CockroachDB, TiDB

---

### 3.7.4 Site Reliability Engineer

**Expert in SRE, monitoring, and incident response**

| Item | Details |
|------|------|
| **Description** | Production monitoring, observability, SLO/SLI management, incident response |
| **Tools** | Read, Write, Bash, Glob |
| **Trigger words** | monitoring, observability, SRE, site reliability, alerting, incident response, SLO, SLI, error budget, Prometheus, Grafana |

**Areas of expertise:**
- SLI/SLO definition and tracking
- Monitoring platforms (Prometheus, Grafana, Datadog)
- Alert configuration
- Incident response workflows
- Postmortems

---

### 3.7.5 Release Coordinator

**Expert in release coordination and deployment strategy**

| Item | Details |
|------|------|
| **Description** | Multi-component release coordination, feature flags, rollback strategies |
| **Tools** | Read, Write, Bash, Glob, TodoWrite |
| **Trigger words** | release management, release planning, feature flags, canary deployment, progressive rollout, release notes, rollback strategy |

**Areas of expertise:**
- Release planning and coordination
- Feature flag management
- Canary/blue-green deployments
- Rollback procedures

---

## 3.8 Documentation

### 3.8.1 Technical Writer

**Expert in technical documentation**

| Item | Details |
|------|------|
| **Description** | Creating technical documents, API documentation, user guides, and READMEs |
| **Tools** | Read, Write, Edit, Glob |
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

| Item | Details |
|------|------|
| **Description** | Machine learning model development, training, evaluation, deployment, MLOps |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | machine learning, ML, AI, model training, MLOps, model deployment, feature engineering, neural network, deep learning |

**Areas of expertise:**
- Machine learning model development (supervised/unsupervised learning, deep learning)
- NLP (text classification, NER, text generation)
- Computer vision (image classification, object detection)
- MLOps (model versioning, deployment, monitoring)
- LLMs/generative AI (fine-tuning, RAG, agents)

---

### 3.9.2 Change Impact Analyzer

**Expert in change impact analysis**

| Item | Details |
|------|------|
| **Description** | Analyzing the impact of changes on existing systems, detecting breaking changes, migration planning |
| **Tools** | Read, Write, Bash, Glob, Grep |
| **Trigger words** | change impact, impact analysis, brownfield, delta spec, change proposal, breaking changes, dependency analysis |

**Areas of expertise:**
- Identifying affected components
- Detecting breaking changes
- Updating dependency graphs
- Risk assessment and migration planning

---

### 3.9.3 Constitution Enforcer

**Monitor of constitutional (governance) compliance**

| Item | Details |
|------|------|
| **Description** | Verifies compliance with the 9 constitutional articles and Phase -1 Gates |
| **Tools** | Read, Glob, Grep (read-only) |
| **Trigger words** | constitution, governance, compliance, validation, Phase -1 Gates, simplicity gate, anti-abstraction gate, test-first |

**The 9 constitutional articles:**
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

| Item | Details |
|------|------|
| **Description** | Verifies complete traceability from EARS requirements → design → tasks → code → tests |
| **Tools** | Read, Glob, Grep (read-only) |
| **Trigger words** | traceability, requirements coverage, coverage matrix, traceability matrix, requirement mapping, EARS coverage |

**What is verified:**
- Requirements → design mapping (100% coverage)
- Design → tasks mapping
- Tasks → code mapping
- Code → tests mapping
- Gap detection (orphaned requirements, untested code)

---

# Chapter 4 New Features in v3.0.0

## 4.1 Browser Automation Agent

**Expert in browser automation testing** 🆕

| Item | Details |
|------|------|
| **Description** | Browser automation, E2E testing, and web UI testing using Playwright |
| **Tools** | Read, Write, Edit, Bash, Glob, Grep |
| **Trigger words** | browser automation, e2e test, playwright, end-to-end, web testing, UI testing, browser test, screenshot, web scraping |

**Areas of expertise:**
- Designing and implementing E2E test scenarios
- Cross-browser testing (Chromium, Firefox, WebKit)
- Visual regression testing (screenshot comparison)
- Web accessibility auditing
- Performance measurement (Core Web Vitals)

**Usage examples:**
```bash
# Generate E2E tests
npx musubi-workflow --agent browser --task "Create E2E tests for the login flow"

# Visual regression testing
npx musubi-workflow --agent browser --task "Screenshot tests for the dashboard"
```

---

## 4.2 Web GUI Dashboard

**Web-based dashboard** 🆕

| Item | Details |
|------|------|
| **Description** | A web dashboard that visualizes the SDD workflow and traceability |
| **Features** | Project overview, workflow status, specification list, traceability matrix, constitution display |
| **Technology** | Express.js, WebSocket, single-page application |

**Main features:**
- **Project overview**: File statistics, workflow progress
- **Workflow visualization**: Status display for the 8-stage SDD workflow
- **Specification browser**: Search and browse requirements, designs, and tasks
- **Traceability matrix**: Visualization of requirements coverage
- **Real-time updates**: File change notifications via WebSocket

**Usage examples:**
```bash
# Start the dashboard
npx musubi-gui start

# Development mode (hot reload)
npx musubi-gui dev

# Show only the traceability matrix
npx musubi-gui matrix

# Specify a custom port
npx musubi-gui start --port 4000
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

# Chapter 5 Modules Derived from OpenHands (v2.2.0+)

MUSUBI v2.2.0 integrated 8 advanced modules inspired by the **OpenHands project**. These modules significantly improve agent autonomy and quality.

## 5.1 StuckDetector

**Automatic detection of stuck agents**

| Item | Details |
|------|------|
| **Description** | Automatically detects when an agent repeats the same operation or makes no progress |
| **Detection patterns** | Repeated execution of the same command, error loops, long waits with no progress |
| **Response** | Automatic recovery suggestions, presenting alternative approaches |

## 5.2 SkillsLoader

**Dynamic loading and management of skills**

| Item | Details |
|------|------|
| **Description** | Dynamically loads skills (agents) as needed |
| **Features** | On-demand loading, memory efficiency, skill dependency management |

```javascript
// Dynamic skill loading
const skill = await skillsLoader.load('code-reviewer');
```

## 5.3 MemoryCondenser

**Efficient compression of long-term memory**

| Item | Details |
|------|------|
| **Description** | Efficiently compresses long-term context while retaining important information |
| **Features** | Context compression, prioritized retention of important information, token optimization |

## 5.4 CriticSystem

**Quality evaluation of agent output**

| Item | Details |
|------|------|
| **Description** | Evaluates agent output and calculates a quality score |
| **Evaluation criteria** | Accuracy, completeness, consistency, adherence to best practices |

```javascript
// Quality evaluation
const critique = await criticSystem.evaluate(agentOutput);
// { score: 0.85, feedback: [...], improvements: [...] }
```

## 5.5 IssueResolver

**Automatic analysis of GitHub Issues and resolution proposals**

| Item | Details |
|------|------|
| **Description** | Analyzes GitHub Issues and automatically generates the tasks needed to resolve them |
| **Features** | Issue classification, root cause analysis, automatic task generation, PR proposals |

## 5.6 SecurityAnalyzer

**Automatic detection of security vulnerabilities**

| Item | Details |
|------|------|
| **Description** | Automatically detects security vulnerabilities in code |
| **Detected items** | SQL injection, XSS, CSRF, authentication/authorization issues, dependency vulnerabilities |

```javascript
// Security analysis
const vulnerabilities = await securityAnalyzer.scan(codebase);
// [{ type: 'SQL Injection', severity: 'high', location: '...' }]
```

## 5.7 AgentMemoryManager

**Memory sharing between agents**

| Item | Details |
|------|------|
| **Description** | Shares and synchronizes memory among multiple agents |
| **Features** | Shared context management, inter-agent communication, state persistence |

## 5.8 GitHubClient

**GitHub API integration**

| Item | Details |
|------|------|
| **Description** | Automates Issue/PR operations through integration with the GitHub API |
| **Supported operations** | Create/update/close Issues, create/review/merge PRs, add comments |

---

# Chapter 6 List of Tools

The tools available to each Skill are as follows:

| Tool | Description | Permission |
|--------|------|------|
| **Read** | Read files | Read |
| **Write** | Create files | Write |
| **Edit** | Edit files | Write |
| **Bash** | Run shell commands | Execute |
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

# Chapter 8 List of Slash Commands

MUSUBI provides 9 slash commands that can be used in Claude Code. These commands support each stage of the SDD workflow.

## 8.1 Core Commands

| Command | Description | Example |
|----------|------|--------|
| `/sdd-steering` | Generate/update project memory (steering context) | `/sdd-steering` |
| `/sdd-requirements` | Create an EARS-format requirements specification | `/sdd-requirements authentication` |
| `/sdd-design` | Generate a technical design document from requirements | `/sdd-design authentication` |
| `/sdd-tasks` | Break the design down into actionable tasks | `/sdd-tasks authentication` |
| `/sdd-implement` | Implement features based on tasks | `/sdd-implement authentication` |
| `/sdd-validate` | Validate constitutional compliance and requirements coverage | `/sdd-validate authentication` |

## 8.2 Change Management Commands (for Brownfield)

Commands for managing changes to existing systems:

| Command | Description | Example |
|----------|------|--------|
| `/sdd-change-init` | Initialize a change proposal | `/sdd-change-init add-2fa` |
| `/sdd-change-apply` | Apply an approved change proposal | `/sdd-change-apply add-2fa` |
| `/sdd-change-archive` | Archive a completed change proposal | `/sdd-change-archive add-2fa` |

## 8.3 Command Details

### 8.3.1 `/sdd-steering` - Generate Project Memory

Analyzes the project's codebase and generates the steering context.

**Modes:**
- **Bootstrap Mode**: If no steering files exist, analyzes the entire codebase and generates the initial files
- **Sync Mode**: If steering files exist, detects differences from the codebase and updates them

**Generated files:**
```
steering/
├── structure.md    # Architecture patterns
├── tech.md         # Technology stack
├── product.md      # Business context
└── project.yml     # Project configuration (machine-readable)
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

**Contents:**
- C4 model diagrams (Context, Container, Component)
- ADRs (Architecture Decision Records)
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

**Contents:**
- Prioritized task list
- Requirements coverage matrix
- Dependency graph
- Estimates (complexity)

---

### 8.3.5 `/sdd-implement [feature-name]` - Implementation

Implements the feature based on the task breakdown.

**Process:**
1. Load the task file
2. Write tests first, following the Test-First principle
3. Implement the code
4. Run and verify the tests

---

### 8.3.6 `/sdd-validate [feature-name]` - Validation

Validates whether the implementation satisfies the constitutional articles and requirements coverage.

**Validation items:**
- Compliance with the 9 constitutional articles
- 100% requirements traceability
- Code quality standards
- Security standards
- Test coverage

---

### 8.3.7 `/sdd-change-init [change-name]` - Initialize a Change Proposal

Creates a change proposal for an existing system (for brownfield projects).

**Output:**
```
changes/[change-name]/
├── proposal.md     # Change proposal
└── specs/          # Delta specs (ADDED/MODIFIED/REMOVED/RENAMED)
```

---

### 8.3.8 `/sdd-change-apply [change-name]` - Apply a Change

Applies an approved change proposal to the codebase.

---

### 8.3.9 `/sdd-change-archive [change-name]` - Archive a Change

Archives a completed change proposal and updates the documentation.

---

# Chapter 9 Project Memory (Steering System)

Every Skill refers to the following steering files before starting a task:

```
steering/
├── structure.md  # Architecture patterns, directory structure
├── tech.md       # Technology stack, frameworks
└── product.md    # Business context, product purpose
```

This allows all agents to share a consistent project context.

---

# Chapter 10 The 8-Stage SDD Workflow

MUSUBI follows the 8-stage workflow below:

```
Research → Requirements → Design → Tasks → Implementation → Testing → Deployment → Monitoring
```

1. **Research**: Technical research, option analysis
2. **Requirements**: Requirements definition in EARS format
3. **Design**: C4 model, ADRs, technical design
4. **Tasks**: Breakdown into implementation tasks
5. **Implementation**: Code implementation
6. **Testing**: Unit/integration/E2E testing
7. **Deployment**: CI/CD, infrastructure deployment
8. **Monitoring**: Production monitoring, SLO tracking

---

# Chapter 11 List of CLI Commands

MUSUBI also provides CLI commands that can be used directly from the terminal.

## 11.1 Main Commands

```bash
# Initialize a project
musubi init                    # Initialize for Claude Code (default)
musubi init --cursor           # Initialize for Cursor IDE
musubi init --copilot          # Initialize for GitHub Copilot
musubi init --gemini           # Initialize for Gemini CLI
musubi init --codex            # Initialize for Codex CLI
musubi init --qwen             # Initialize for Qwen Code
musubi init --windsurf         # Initialize for Windsurf IDE

# Project management
musubi status                  # Show project status
musubi validate                # Quick check of constitutional compliance
musubi validate --verbose      # Show detailed validation results
musubi sync                    # Sync steering documents with the codebase
musubi sync --dry-run          # Preview changes (without applying)
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
| `musubi-resolve` | Problem-solving assistant |
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

# Chapter 12 Supported AI Platforms (7)

MUSUBI supports the following 7 AI coding agents:

| Platform | Flag | Description |
|------------------|--------|------|
| **Claude Code** | `--claude`, `--claude-code` | Default. Full Skills API support |
| **GitHub Copilot** | `--copilot`, `--github-copilot` | Command/prompt-based |
| **Cursor IDE** | `--cursor` | Command/prompt-based |
| **Gemini CLI** | `--gemini`, `--gemini-cli` | Command/prompt-based |
| **Codex CLI** | `--codex`, `--codex-cli` | Command/prompt-based |
| **Qwen Code** | `--qwen`, `--qwen-code` | Command/prompt-based |
| **Windsurf IDE** | `--windsurf` | Command/prompt-based |

**Note:** The Skills API (`@skill-name` format) is exclusive to Claude Code. Other platforms use the command/prompt-based approach.

---

# Chapter 13 CodeGraph MCP Server Integration

By integrating with **CodeGraph MCP Server**, MUSUBI enables AI agents to understand the entire codebase as a "graph."

## 13.1 What Is CodeGraph MCP Server?

CodeGraph MCP Server is a server that analyzes source code as a graph structure and provides it to AI agents via MCP (Model Context Protocol).

| Feature | Description |
|------|------|
| **Code structure analysis** | Visualizes dependencies between functions, classes, and modules |
| **GraphRAG search** | Semantic (meaning-based) code search |
| **Community detection** | Module boundary analysis using the Louvain algorithm |
| **Impact analysis** | Automatically identifies the ripple effects of changes |
| **Supports 14 languages** | Python, JavaScript, TypeScript, Java, C#, Go, Rust, Ruby, PHP, C++, HCL, and more |

## 13.2 Provided MCP Tools (14)

```
# Code graph operations
init_graph          - Initialize the graph
get_code_snippet    - Retrieve source code
find_callers        - Trace callers
find_callees        - Trace callees
find_dependencies   - Analyze dependencies

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

| Agent | CodeGraph Usage | Benefit |
|-------------|---------------|------|
| **Orchestrator** | `global_search`, `stats` | Understanding the whole project, selecting the best agent |
| **System Architect** | `analyze_module_structure`, `community` | Architecture visualization, refactoring planning |
| **Software Developer** | `get_code_snippet`, `local_search` | Quickly finding related code |
| **Code Reviewer** | `find_callers`, `suggest_refactoring` | Checking the scope of impact, improvement suggestions |
| **Test Engineer** | `find_dependencies` | Understanding the dependencies of code under test |
| **Security Auditor** | `find_callers`, `query_codebase` | Locating where vulnerable functions are used |
| **Change Impact Analyzer** | `find_dependencies`, `find_callers` | Complete analysis of change impact |
| **Bug Hunter** | `local_search`, `get_code_snippet` | Tracing the root cause of bugs |

## 13.4 Setup

### 13.4.1 Option 1: Automatic Setup via the Orchestrator (Recommended)

```
User: Set up CodeGraph MCP
```

The Orchestrator automatically:
1. Checks the Python environment
2. Installs codegraph-mcp-server
3. Indexes the project
4. Generates configuration files for your environment

### 13.4.2 Option 2: Manual Setup

```bash
# Install
pipx install --force codegraph-mcp-server

# Index the project (full index)
codegraph-mcp index . --full

# Example indexing output:
# Indexed 105 files
# - Entities: 1006
# - Relations: 5359
# - Communities: 36

# Add to Claude Code
claude mcp add codegraph -- codegraph-mcp serve --repo /path/to/project
```

## 13.5 Indexing Options

| Option | Description |
|----------|------|
| `--full` | Create a full index (recommended) |
| `--incremental` | Update only changed files |
| `--exclude <pattern>` | Specify exclusion patterns (e.g. `node_modules`) |

**Best practices:**
- Always create the initial index with the `--full` option
- Run `--full` again after major changes to the codebase
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

## 13.6 Impact of Adoption

| Metric | Before | After | Improvement |
|------|--------|--------|--------|
| Code search time | 5-10 min manually | Instant (<1 s) | **99% reduction** |
| Impact analysis accuracy | 60-70% | 95%+ | **+35%** |
| Refactoring planning time | 2-4 hours | 15-30 min | **85% reduction** |
| Time to identify bug causes | 30 min - 2 hours | 5-15 min | **75% reduction** |

---

# Chapter 14 Summary

MUSUBI v3.0.0 is a powerful specification-driven development framework that integrates 27 specialized AI agents (Skills). v3.0.0 adds the Browser Automation Agent and the Web GUI Dashboard, significantly strengthening E2E testing and project visualization. Each Skill specializes in a particular task and is coordinated automatically by the Orchestrator.

With project memory (the Steering System), all agents share a consistent context, ensuring traceability from EARS-format requirements through implementation, testing, and deployment.

---

# Chapter 15 References

- [MUSUBI GitHub Repository](https://github.com/nahisaho/MUSUBI)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [EARS Requirements Syntax](https://en.wikipedia.org/wiki/EARS_(Requirements_Engineering))

---

**Powered by MUSUBI** - Specification Driven Development for AI-assisted coding
