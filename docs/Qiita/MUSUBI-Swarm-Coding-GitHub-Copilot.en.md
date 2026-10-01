## Introduction

**"AI that works as a team, rather than a single AI"** ── this is the next-generation coding experience.

GitHub Copilot is an excellent "individual player", but by combining it with **MUSUBI** and **CodeGraph MCP Server**, you can achieve **Swarm coding, where AI collaborates as a team of specialists**.

With **3,958 tests, 132 test suites, 12,093 code entities, and 59,222 relations**, MUSUBI v5.9.0 is designed as an enterprise-grade development foundation.

### Limitations of GitHub Copilot on Its Own

GitHub Copilot is a wonderful tool, but it has the following challenges for **enterprise application development**.

| Challenge | Concrete example | Impact in the enterprise |
|------|--------|------------------------|
| **Fragmented context** | Can only understand code on a per-file basis | Dependencies are overlooked in large codebases |
| **No link to specifications** | Doesn't know "why this code is needed" | Scope of impact is unclear when requirements change |
| **Lack of design decisions** | Generates code without considering the architecture | Accumulation of technical debt |
| **No quality standards** | Doesn't know project-specific rules | Coding standard violations, security holes |
| **No traceability** | Cannot trace requirements → design → implementation → tests | Audit and compliance are difficult |
| **Lack of consistency** | Answers vary from session to session | Confusion in team development |

:::note warn
**What enterprise development needs**
- Consistent implementation based on specifications
- Understanding of the context of the whole project
- Recording of architecture decisions (ADR)
- Quality gates and automated validation
- Impact analysis of changes
- Auditable traceability

**GitHub Copilot + MUSUBI + CodeGraph** delivers all of these.
:::

:::note info
**What is Swarm Coding?**
It is an approach in which multiple AI agents collaborate to develop software. Just as humans develop as a team, the AIs divide up roles and cooperate to autonomously carry out complex tasks.

**Key characteristics:**
- **Multi-agent system**: Instead of a single giant AI, it consists of multiple AI agents with specific roles (planner, coder, tester, reviewer, etc.)
- **Autonomous collaboration**: Each agent cooperates autonomously like a swarm of bees, processing tasks toward the overall goal
- **Dynamic task management**: When problems occur or better solutions are found, the AI itself dynamically revises and re-plans the task plan (replanning)
- **Integration with the real environment**: Integrates with actual development tools such as codebase search, test execution, and version control (Git)
- **Efficiency and productivity gains**: Because AI agents work concurrently, development speed can be greatly improved

This approach is a multi-agent collaboration pattern inspired by the OpenAI Agents SDK and AutoGen, and it is attracting attention as a new concept with the potential to revolutionize software development.
:::

## What Is SDD (Specification Driven Development)?

MUSUBI is a framework that implements **SDD (Specification Driven Development)**.

### Why SDD?

In conventional AI coding, the goal was "generating code". Enterprise development, however, requires a consistent process of **specification → design → implementation → testing → operations**.

| Challenge | Conventional AI development | SDD (MUSUBI) |
|------|-------------|---------------|
| **Ambiguous specifications** | Implemented straight from natural language | Formalized in EARS format |
| **Lack of design** | Jumps straight to code generation | Designed with the C4 model + ADRs |
| **Traceability** | None | Tracks REQ → Design → Code → Test |
| **Quality assurance** | Relies on manual review | Automated validation via the constitution + guardrails |
| **Change management** | Differences are unclear | Changes made explicit with Delta specs |

### The 8-Stage SDD Workflow

MUSUBI's SDD workflow consists of 8 stages.

| Stage | Name | Content | Deliverable |
|---------|------|------|--------|
| 1 | **Steering** | Initialize/update project memory | `steering/` directory |
| 2 | **Requirements** | Requirements definition in EARS format | `storage/specs/*.ears.md` |
| 3 | **Design** | Create C4 model + ADRs | `storage/specs/*.design.md` |
| 4 | **Tasks** | Break down into implementation tasks | `storage/specs/*.tasks.md` |
| 5 | **Implement** | Implementation via Swarm Coding | Source code |
| 6 | **Validate** | Validate constitutional compliance | Validation report |
| 7 | **Review** | Human-in-Loop review | Approval / revision instructions |
| 8 | **Release** | Release preparation, changelog | CHANGELOG, tags |

### What Is the EARS Format?

**EARS (Easy Approach to Requirements Syntax)** is a requirements-writing format for eliminating the ambiguity of natural language.

| Pattern | Template | Example |
|----------|-------------|-----|
| **Ubiquitous** | The system shall... | The system shall encrypt authentication tokens |
| **Event-Driven** | When [event], the system shall... | When the login button is pressed, the system shall start the authentication process |
| **State-Driven** | While [state], the system shall... | While offline, the system shall use the local cache |
| **Optional** | Where [feature], the system shall... | Where two-factor authentication is enabled, the system shall send an SMS code |
| **Unwanted** | If [condition], the system shall not... | If login fails 5 times in a row, the system shall lock the account |

:::note info
**Benefits of SDD**
- **AI consistency**: The AI makes decisions based on specifications, so there is less variation
- **More efficient reviews**: Differences between specification and implementation are clear
- **Automatic documentation generation**: Generate API documentation and test cases from specifications
- **Change impact analysis**: Automatically detect the scope of impact when specifications change
:::

## Why MUSUBI? ── Overwhelming Scale

### v5.9.0 Track Record

| Metric | Value | Meaning |
|-----------|------|------|
| **Tests** | 4,408 | Industry-leading test coverage |
| **Test suites** | 140+ | Comprehensive quality assurance |
| **Code entities** | 12,093 | Functions, classes, variables, etc. analyzed |
| **Code relations** | 59,222 | Dependencies and call relationships captured |
| **Communities (modules)** | 140 | Automatically detected module boundaries |
| **Supported platforms** | 13+ | Claude, Copilot, Cursor, Windsurf, Gemini, Codex... |
| **Specialist skills** | 27 | Covering everything from specification to deployment |
| **Orchestration patterns** | 9 | Swarm, Handoff, Triage, Human-in-Loop... |

### New in v5.9.0: Phase 1-4 Enterprise Features

v5.9.0 adds enterprise features for large-scale projects and monorepos.

#### Workflow Flexibility (Phase 1)

| Feature | Description | Effect |
|------|------|------|
| **WorkflowModeManager** | 3 modes: small/medium/large | Flexible workflow according to project size |
| **Automatic detection** | Infers the mode from the feature name | No manual configuration needed |
| **musubi-release** | Automatic CHANGELOG generation | More efficient release work |

#### Monorepo Support (Phase 2)

| Feature | Description | Effect |
|------|------|------|
| **PackageManager** | Package registry management | Overview of the whole monorepo |
| **Dependency graph** | Mermaid diagram generation | Better understanding through visualization |
| **Coverage tracking** | Per-package reports | More detailed quality management |

#### Constitution Level Management (Phase 3)

| Feature | Description | Effect |
|------|------|------|
| **ConstitutionLevelManager** | critical/advisory/flexible | Response according to violation severity |
| **Blocking/warning separation** | Behavior by severity | More flexible development flow |
| **Per-project overrides** | Custom settings | Adapts to project characteristics |

#### Project Configuration (Phase 4)

| Feature | Description | Effect |
|------|------|------|
| **ProjectValidator** | Schema validation | Early detection of configuration mistakes |
| **v1.0→v2.0 migration** | Automatic upgrade | Smooth migration |
| **musubi-config** | Configuration management CLI | Unified interface |

#### 5 Built-in Skills

| Skill | Category | Purpose |
|--------|----------|------|
| `release-manager` | release | CHANGELOG generation |
| `workflow-mode-manager` | workflow | Mode management |
| `package-manager` | configuration | Package management |
| `constitution-level-manager` | validation | Level validation |
| `project-config-manager` | configuration | Configuration management |

```javascript
// Workflow mode usage example
const { workflowModeSkill } = require('musubi-sdd/src/orchestration');

const result = await workflowModeSkill.execute({
  action: 'detect',
  featureName: 'fix: minor bug'
});
console.log(result.detectedMode); // 'small'
```

### v5.7.0 Feature: Performance Optimization

v5.7.0 adds performance optimization modules for the enterprise.

| Feature | Description | Effect |
|------|------|------|
| **LazyLoader** | On-demand module loading | Shorter startup time, better memory efficiency |
| **CacheManager** | LRU cache + TTL management | 30%+ improvement in API response time |
| **BatchProcessor** | Parallel execution of bulk processing | Efficient processing of large data volumes |
| **ConnectionPool** | Connection pooling | Optimized resource management |
| **PerformanceMonitor** | Metrics with percentile calculation | Bottleneck identification |

```javascript
// LazyLoader usage example
const { defaultLoader } = require('musubi-sdd/src/performance');
const analyzer = await defaultLoader.load('complexity-analyzer');

// CacheManager usage example  
const { defaultCacheManager } = require('musubi-sdd/src/performance');
await defaultCacheManager.set('api-response', 'key', data, { ttl: 300000 });
```

### Validation Projects

MUSUBI's enterprise features were developed and validated on real large-scale projects.

#### Linux Kernel (30 Million Lines) ── Efficient Development on an Ultra-Large Codebase

The **Linux kernel** is one of the world's largest open-source projects. We are validating whether MUSUBI can efficiently support development even on such an ultra-large codebase.

| Item | Result |
|------|------|
| Number of files | 80,000+ |
| Lines of code | 30,000,000+ |
| Number of subsystems | 100+ |
| Commits per year | 70,000+ |

**Challenges of Linux kernel development and how MUSUBI addresses them**

| Challenge | Conventional development | MUSUBI + CodeGraph |
|------|-----------|-------------------|
| **Code navigation** | cscope/ctags, manual search | Pinpointed instantly with CodeGraph `global_search` |
| **Understanding subsystems** | Documentation + experience | Module boundaries detected automatically with `community` |
| **Change impact analysis** | Relies on maintainers' experience | Ripple effects visualized with `find_dependencies` |
| **Coding standards** | checkpatch.pl | Automated validation via the constitution + guardrails |
| **Driver development** | Copy-paste from templates | Structured generation with SDD + Swarm Coding |

**Validation scenario: developing a new device driver**

1. **Requirements definition**: Write the specification of the new driver in EARS format
2. **Architecture review**: Analyze patterns of existing drivers with CodeGraph
3. **Swarm Coding**: Multiple skills collaborate to generate the driver code
4. **Quality validation**: Automatically check compliance with Linux kernel coding standards

:::note info
**Why validate on the Linux kernel?**
The Linux kernel is a world-class project in terms of code volume, complexity, and number of developers. If we can confirm that MUSUBI works efficiently here, we can say it can handle virtually any enterprise project.
:::

#### GCC Codebase (10 Million Lines) ── Modifying Strongly Correlated Code

Through actual analysis of **GCC (GNU Compiler Collection)**, we validated support for huge codebases when **modifying strongly correlated code**.

In a compiler like GCC, modules are tightly interconnected, and a change in one place ripples widely. MUSUBI's CodeGraph integration visualizes this "strength of correlation" and enables safe modifications.

| Item | Result |
|------|------|
| Number of files | 100,000+ |
| Lines of code | 10,000,000+ |
| Huge functions detected | Multiple functions over 1,000 lines detected |
| Memory efficiency | Processable within 2GB using streaming analysis |

**Modification support through correlation analysis**

| Analysis item | MUSUBI feature | Use in GCC |
|----------|-------------|-------------|
| **Dependency visualization** | CodeGraph `find_dependencies` | Identify the scope of impact of changes |
| **Caller tracing** | CodeGraph `find_callers` | Understand ripple targets when changing functions |
| **Community detection** | CodeGraph `community` | Identify tightly coupled modules |
| **Impact analysis** | MUSUBI Impact Analyzer | Risk assessment before modification |

**Security hardening experiment via Rust replacement**

We are also experimenting with improving memory safety by replacing GCC's C/C++ code with Rust. Using MUSUBI's **Rust Migration Generator**, we automatically detect dangerous patterns and support migration to safe Rust code.

| Detection category | Detections in GCC | Security risk |
|-------------|--------------|------------------|
| Memory management (malloc/free) | Many | Memory leaks, double free |
| String operations (strcpy/sprintf) | Many | Buffer overflow |
| Pointer arithmetic | Many | Invalid memory access |
| Concurrency (pthread) | Many | Data races |

Through this experiment, we have confirmed that MUSUBI's CodeGraph and Rust Migration Generator can **support safe modification even on huge, strongly correlated codebases**.

#### Ouranos Ecosystem Dataspaces (IPA / METI)

Referring to the white paper **[Ouranos Ecosystem Dataspaces Reference Architecture Model (ODS-RAM)](https://www.ipa.go.jp/digital/architecture/reports/ouranos-ecosystem-dataspaces-ram-white-paper.html)**, we are validating **whether a model that actually works can be generated**.

| Item | Content |
|------|------|
| **Provider** | IPA (Information-technology Promotion Agency, Japan) / Ministry of Economy, Trade and Industry (METI) |
| **Purpose** | Industrial data collaboration across companies, industries, and national borders |
| **Architecture** | 4 layers × 4 perspectives |
| **Problem domain** | 13 structural challenges in data collaboration and utilization |
| **Validation with MUSUBI** | Generate a working model from the white paper |

**Validation approach:**

1. **White paper analysis**: Analyze the ODS-RAM white paper with MUSUBI and extract architecture requirements
2. **SDD conversion**: Convert the extracted requirements into specifications in EARS format
3. **Code generation**: Automatically generate a reference implementation via Swarm Coding
4. **Operational validation**: Confirm that the generated model actually works

:::note info
**What is ODS-RAM?**
It is a technical reference document for building service-driven data spaces in the Ouranos Ecosystem. It provides an architecture model for realizing a distributed, federated, hybrid service ecosystem while ensuring data sovereignty.

Taking this white paper as input, we are validating that MUSUBI can automate the whole process of **specification → design → implementation → validation** and generate a reference implementation that actually works.
:::

## How Swarm Coding Works

### Conventional AI Coding vs Swarm Coding

Conventional AI coding relied on a "single all-purpose AI". However, this has limits on complex projects. In Swarm Coding, just as in human team development, **multiple AI agents with specialized expertise collaborate** to carry out the work.

| Conventional | Swarm Coding (MUSUBI) |
|------|----------------------|
| Leave everything to one AI | A team of specialists collaborates |
| Insufficient context | Grasp the big picture with CodeGraph |
| One-shot attempt | Proper routing with Handoff/Triage |
| Quality depends on luck | Governance through 9 constitutional articles |
| No traceability | Full REQ → Design → Code → Test tracing |

### 9 Orchestration Patterns

MUSUBI uses **9 collaboration patterns** depending on the nature of the task and the situation. These are inspired by the multi-agent patterns of the OpenAI Agents SDK and AutoGen, and cover everything from simple sequential processing to complex swarm intelligence.

| # | Pattern | Description | Use case |
|---|----------|------|-------------|
| 1 | **Sequential** | Sequential execution | Specification → design → implementation → testing |
| 2 | **Parallel** | Parallel execution | Simultaneous front-end/back-end development |
| 3 | **Swarm** | Swarm-intelligence collaboration | Everyone solves the problem together |
| 4 | **Handoff** | Delegation | Hand the baton to a specialist |
| 5 | **Triage** | Routing | Route to the appropriate agent |
| 6 | **Human-in-Loop** | Human approval | Humans make important decisions |
| 7 | **Nested** | Nesting | Complex workflows |
| 8 | **Group Chat** | Group chat | Multi-agent discussion |
| 9 | **Auto** | Automatic selection | Optimal pattern for the situation |

## What Is CodeGraph MCP Server?

**CodeGraph MCP Server** is a server that analyzes source code as a graph structure and provides it to AI agents via MCP (Model Context Protocol).

### Why Is CodeGraph Needed?

Conventional AI coding assistants can only understand code "per file". CodeGraph grasps the entire project as a **graph structure**, enabling the following.

| Challenge | Conventional AI | With CodeGraph |
|------|----------|---------------|
| Callers of a function | grep search, things get missed | Complete list with `find_callers` |
| Dependencies | Visually inspecting import statements | Detects deep dependencies with `find_dependencies` |
| Scope of change impact | "Probably fine" | Fully understand ripple effects with impact analysis |
| Understanding code structure | One file at a time | Instant big picture with `stats` + `community` |

### The 14 MCP Tools Provided by CodeGraph

```
Code graph operations
├── init_graph          - Initialize graph
├── get_code_snippet    - Get source code
├── find_callers        - Trace callers
├── find_callees        - Trace callees
└── find_dependencies   - Dependency analysis

Search features
├── local_search        - Local context search
├── global_search       - Global search
└── query_codebase      - Natural language query

Analysis features
├── analyze_module_structure  - Module structure analysis
├── suggest_refactoring       - Refactoring suggestions
├── stats                     - Codebase statistics
└── community                 - Community detection
```

### Supported Languages (14 Languages)

Python, JavaScript, TypeScript, Java, C#, Go, Rust, Ruby, PHP, C++, Swift, Kotlin, Scala, HCL (Terraform)

### musubi-analyze vs codegraph: Which Should You Use?

MUSUBI has a `musubi-analyze` command that provides analysis features separate from CodeGraph MCP Server. Use each according to your purpose.

| Item | `musubi-analyze` | `codegraph` (MCP Server) |
|------|------------------|--------------------------|
| **Provided by** | Built into MUSUBI | External MCP server |
| **Main purpose** | Project statistics, complexity analysis, giant function detection | Code graph construction, dependency tracking, impact analysis |
| **Output** | Console / report | `steering/memories/codegraph.md` |
| **AI integration** | Provides analysis results to the AI | Real-time integration via the MCP protocol |
| **Installation** | `npm install -g musubi-sdd` | `uvx codegraph-mcp` |

**Guidelines for choosing:**

| What you want to do | Command to use |
|-------------|-------------|
| See project statistics | `npx musubi-analyze` |
| Find highly complex functions | `npx musubi-analyze --complexity` |
| Detect giant functions | `npx musubi-analyze --giant-functions` |
| Trace the callers of a function | CodeGraph (`find_callers`) |
| Know the scope of impact of a change | CodeGraph (`find_dependencies`) |
| Let the AI grasp the big picture | `npx musubi-analyze --codegraph-full` |

:::note info
**Best practice**
Using both together is recommended. Running `musubi-analyze --codegraph-full` generates both MUSUBI's analysis results and the CodeGraph index, allowing AI agents to make the most of the available information.
:::

### Index Operations in Natural Language

In MUSUBI, you can also create and update the CodeGraph index using natural language.

```
Just talk to GitHub Copilot:

"Create the CodeGraph MCP Index"
"Update the CodeGraph MCP Index"
"Rebuild the code graph"

→ MUSUBI automatically performs the following:
   1. Scan the entire repository
   2. Extract entities (functions, classes, variables)
   3. Analyze relations (calls, dependencies, inheritance)
   4. Detect communities (module boundaries)
   5. Save the index to steering/memories/codegraph.md
```

## Setup (1 Minute)

:::note warn
**On Windows: install on WSL (Windows Subsystem for Linux)**

We recommend running MUSUBI and CodeGraph MCP Server on **Ubuntu on WSL**.

**Packages to install beforehand on WSL (Ubuntu):**

```bash
# Node.js (v18 or later)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3, pip, pipx (required for CodeGraph MCP Server)
sudo apt-get update
sudo apt-get install -y python3 python3-pip pipx
pipx ensurepath

# Git (required)
sudo apt-get install -y git
```

**Connect to WSL from VSCode:**
1. In VSCode, `Ctrl+Shift+P` → `WSL: Connect to WSL`
2. Open the project on WSL
3. Run `npx musubi-sdd init --copilot` in a terminal on WSL

**Why is WSL needed?**
- CodeGraph MCP Server requires a Python environment
- Better file system performance
- Linux-native CLI tools work as-is
:::

### 1. Initialize the Project for GitHub Copilot

**CLI:**
```bash
npx musubi-sdd init --copilot
```

#### Options During Initialization

When you run `npx musubi-sdd init --copilot`, you configure the project interactively.

```
🎯 MUSUBI - Ultimate Specification Driven Development


Initializing for: GitHub Copilot
```

| Question | Choices | Description |
|------|--------|------|
| **Project name** | (input) | Project name. Defaults to the current directory name |
| **Project description** | (input) | Project description |
| **Documentation language** | English / 日本語 / 中文 / 한국어 / Español / Deutsch / Français | Documentation language. Steering files are generated in this language |
| **Project structure** | Single package / Workspace / Microservices | Project structure |
| **Project type** | Greenfield (0→1) / Brownfield (1→n) / Both | New development or existing project |
| **Technology stack approach** | Single language / Multiple languages / Undecided / Help me decide | How to choose the tech stack |
| **Generate initial steering context?** | Yes / No | Whether to automatically generate Steering files |
| **Create constitutional governance?** | Yes / No | Whether to create the constitution (9 articles) |

**Project structure details:**

| Choice | Description | Suitable projects |
|--------|------|----------------------|
| **Single package** | Single-package layout | Small to medium-sized applications |
| **Workspace / Monorepo** | Multiple packages in a single repository | Large projects with shared libraries |
| **Microservices** | Microservice layout | Distributed systems, groups of services that need independent deployment |

**Project type details:**

| Choice | Description | Steering initialization |
|--------|------|-----------------|
| **Greenfield (0→1)** | New development from scratch | Generates empty Steering from templates |
| **Brownfield (1→n)** | Introduce into an existing project | Analyzes existing code to infer Steering |
| **Both** | Supports both | Initializes with general-purpose settings |

:::note info
**For Greenfield (0→1): start from requirements definition**

For new development, you can start **from requirements definition** simply by talking to GitHub Copilot in natural language.

**Example natural-language instructions:**
```
I'm developing an e-commerce site, so start from requirements definition
```

```
I want to build a new task management app. Please start from requirements definition
```

```
I want to make an internal chatbot. Design it from scratch
```

On receiving these instructions, MUSUBI automatically runs the following SDD workflow.

1. **Requirements definition**: Write specifications in EARS format → `storage/specs/xxx.ears.md`
2. **Design**: C4 model + ADRs → `storage/specs/xxx.design.md`
3. **Task breakdown**: Break down into implementation tasks → `storage/specs/xxx.tasks.md`
4. **Implementation**: Automatic implementation via Swarm Coding → source code
5. **Validation**: Check constitutional compliance → validation report

**Example Greenfield development flow: building an e-commerce site**

| Stage | Natural-language instruction | Deliverable |
|---------|-----------------|--------|
| Requirements definition | `Define the requirements for the e-commerce site` | `storage/specs/ecommerce.ears.md` |
| Design | `Design the e-commerce site` | `storage/specs/ecommerce.design.md` |
| Task breakdown | `Identify the tasks for the e-commerce site` | `storage/specs/ecommerce.tasks.md` |
| Implementation | `Implement the e-commerce site` | Full set of source code |
| Validation | `Validate the e-commerce site` | Validation report |

In this way, you can proceed consistently with Swarm Coding **from a state where not a single line of code has been written, through specification → design → implementation → validation**.
:::

:::note warn
**Tip: when you don't know what to do next**

If you get stuck during development, ask the orchestrator.

| What you want to do | Natural-language instruction |
|-------------|-----------------|
| Run the next task | `@orchestrator run the next task` |
| Check remaining tasks | `@orchestrator check the remaining tasks` |
| Check progress | `@orchestrator tell me the progress` |
| Check the overall plan | `@orchestrator show me the current plan` |
| Change task priorities | `@orchestrator run the P0 tasks first` |
| Re-plan if there are problems | `@orchestrator re-plan` |

The orchestrator understands the state of the project and proposes the best next action.
:::

**Technology stack approach details:**

| Choice | Description | Next step |
|--------|------|-------------|
| **Single language** | Single language | Choose a language (JS/TS, Python, Rust, Go, Java, C#, C++, Swift, Ruby, PHP) |
| **Multiple languages** | Multiple languages | Select multiple languages to use |
| **Undecided** | Undecided | Can be decided later |
| **Help me decide** | Want a recommendation | Enter requirements and get the optimal language suggested |

#### Output After Initialization Completes

```
✨ Initializing MUSUBI...

  Created .github/
  Created .github/prompts/
  Created steering/
  Created steering/rules/
  Created templates/
  Created storage/specs/
  Created storage/changes/
  Created storage/specs/
  Installed prompts
  Installed 25 agent definitions (AGENTS.md)
  Generated steering context
  Created constitutional governance
  Created AGENTS.md guide

✅ MUSUBI initialization complete for GitHub Copilot!

Next steps:
  1. Review steering/ context files
  2. Review steering/rules/constitution.md
  3. Start using GitHub Copilot with MUSUBI skills
  4. Try commands: #sdd-requirements authentication
```

This generates the following.
- `AGENTS.md` - Entry point for GitHub Copilot
- `steering/` - Project constitution and architecture definitions
- `storage/` - Specifications, design, and change management

### What Is Steering (Project Memory)?

**Steering** is MUSUBI's core "long-term memory of the project". It provides the foundation for AI agents to make consistent decisions.

#### Starting From Zero vs Existing Projects

| Scenario | How Steering is initialized | Characteristics |
|----------|---------------------|------|
| **Starting from zero** | `npx musubi-sdd init --copilot` | Generated from templates at install time. Edit to fit the project |
| **Existing project** | `Generate Steering` | Analyzes existing code and automatically infers structure and tech stack |

**When starting from zero:**
- Empty templates are generated
- Write `structure.md`, `tech.md`, and `product.md` manually
- The constitution (`constitution.md`) is set with default values

**For an existing project:**
- MUSUBI analyzes the codebase
- Automatically detects the languages, frameworks, and directory structure used
- Extracts dependencies from `package.json`, `requirements.txt`, etc.
- Infers existing design patterns and generates `structure.md`

```
steering/
├── structure.md      # Architecture patterns (layer structure, design principles)
├── tech.md           # Tech stack (languages, frameworks, tools)
├── product.md        # Product context (domain knowledge, glossary)
├── project.yml       # Project settings (metadata, dependencies)
├── rules/
│   └── constitution.md   # 9 constitutional articles (immutable rules)
└── memories/
    ├── codegraph.md      # CodeGraph index
    ├── architecture_decisions.md  # Architecture decision history
    ├── lessons_learned.md         # Lessons learned
    └── domain_knowledge.md        # Domain knowledge
```

| File | Role | When updated |
|----------|------|----------------|
| `structure.md` | Layer structure, dependency direction, design patterns | When the architecture changes |
| `tech.md` | Language versions, frameworks, libraries | When technology is selected/updated |
| `product.md` | Business domain, ubiquitous language, context | When requirements change |
| `constitution.md` | Quality standards, governance rules | **Changes prohibited** (immutable) |
| `memories/` | Dynamically accumulated knowledge | Updated automatically |

:::note info
**Automatic Steering synchronization**
MUSUBI detects changes to the project and automatically synchronizes the Steering documents.

**You can also sync using natural language:**
```
Update Steering
```
That alone brings the project memory up to date.

```bash
npx musubi-sync  # Manual sync via CLI
```
:::

### 2. Configure CodeGraph MCP Server

```bash
# Copilot MCP configuration file
cat > ~/.config/github-copilot/mcp.json << 'EOF'
{
  "servers": {
    "codegraph": {
      "command": "uvx",
      "args": ["codegraph-mcp"],
      "env": {
        "CODEGRAPH_REPO_PATH": "/path/to/your/project"
      }
    }
  }
}
EOF
```

### 3. Build the Code Graph

**CLI:**
```bash
# Use MUSUBI's CodeGraph integration
npx musubi-analyze --codegraph-full
```

**Natural language (talk to GitHub Copilot):**
```
Create the CodeGraph MCP Index
Build the code graph
Analyze the project
```

**Example output:**
```
CodeGraph Analysis Complete
   Entities: 12,093
   Relations: 59,222
   Communities: 140
   Index saved to: steering/memories/codegraph.md
```

## Practical Example: Feature Development With Swarm Coding

### Scenario: Adding a User Authentication Feature

When you run `#sdd-implement auth` in GitHub Copilot, MUSUBI automatically assembles the following Swarm.

```
🐝 Swarm Assembly for "auth" feature:

Phase 1: Requirements (Sequential)
├── Requirements Analyst → Define requirements in EARS format
└── Constitution Enforcer → Check requirements for constitutional compliance

Phase 2: Design (Parallel)
├── System Architect → Architecture design with the C4 model
├── Security Auditor → Security design for authentication
└── Database Schema Designer → User table design

Phase 3: Implementation (Swarm)
├── Backend Developer → API implementation
├── Frontend Developer → Login UI implementation
└── Test Engineer → Test implementation

Phase 4: Validation (Human-in-Loop)
├── Code Reviewer → Code review
├── Quality Assurance → E2E tests
└── Human Approval → Final check
```

### Impact Analysis With CodeGraph

When adding the authentication feature, CodeGraph automatically identifies the scope of impact:

```
Impact Analysis for auth feature:

Affected Files (Direct):
├── src/routes/index.js (API routes need auth middleware)
├── src/middleware/index.js (new auth middleware)
└── src/models/user.js (new model)

Affected Files (Indirect):
├── src/controllers/profile.js (requires authenticated user)
├── src/services/notification.js (user context needed)
└── tests/integration/api.test.js (needs auth setup)

Recommended Test Updates:
├── tests/unit/auth.test.js (new)
├── tests/integration/auth.test.js (new)
└── tests/e2e/login.test.js (new)
```

## 25 Specialist Skills

MUSUBI comes with 25 specialist skills.

### Analysis & Design Phase
| Skill | Role | Main functions |
|--------|------|----------|
| Requirements Analyst | Requirements analysis | EARS-format requirements definition, stakeholder analysis |
| System Architect | System design | C4 model, ADR creation, architecture decisions |
| API Designer | API design | OpenAPI, REST/GraphQL design |
| Database Schema Designer | DB design | ER diagrams, migration design |

### Implementation Phase
| Skill | Role | Main functions |
|--------|------|----------|
| Software Developer | Code implementation | SOLID principles, clean code |
| Frontend Developer | Front-end implementation | React/Vue/Angular, accessibility |
| Backend Developer | Back-end implementation | API implementation, database integration |
| DevOps Engineer | Infrastructure | CI/CD, Docker, Kubernetes |

### Quality Assurance Phase
| Skill | Role | Main functions |
|--------|------|----------|
| Test Engineer | Test design | Unit/integration/E2E, EARS→test conversion |
| Code Reviewer | Code review | Best practices, security |
| Security Auditor | Security audit | OWASP Top 10, vulnerability detection |
| Quality Assurance | Quality assurance | Test strategy, quality metrics |

### Operations & Management Phase
| Skill | Role | Main functions |
|--------|------|----------|
| Project Manager | Project management | Sprint planning, risk management |
| Technical Writer | Documentation | API docs, user guides |
| Release Coordinator | Release management | Version management, changelog |
| Site Reliability Engineer | SRE | Observability, incident response |

## Enterprise Features (v5.5.0+)

### Large Project Analyzer

**What it does:** Analyzes even huge projects with 100,000 files memory-efficiently.

It automatically selects the optimal analysis strategy based on project size.

| Project size | Strategy | Description |
|-------------------|------|------|
| ≤100 files | Batch | Bulk analysis (fastest) |
| ≤1,000 files | Optimized Batch | Optimized batch |
| ≤10,000 files | Chunked | Chunked (saves memory) |
| >10,000 files | Streaming | Streaming (processed within 2GB) |

**Usage in natural language:**
```
Analyze the entire project
Detect giant functions
Show codebase statistics
```

### Complexity Analyzer

**What it does:** Quantifies code complexity and identifies places that need refactoring.

| Metric | Description | Threshold |
|------|------|--------|
| **Cyclomatic complexity** | Number of conditional branches (if/switch/loop, etc.) | Ideally 10 or less |
| **Cognitive complexity** | The burden for a human to understand | Ideally 15 or less |

**Example detection results:**
| Severity | State | Recommended action |
|--------|------|----------------|
| 🟢 OK | Complexity ≤10 | Keep as is |
| 🟡 Warning | Complexity 11-20 | Consider refactoring |
| 🔴 Critical | Complexity >20 | Splitting the function strongly recommended |

**Usage in natural language:**
```
Analyze the complexity of the code
Find functions that need refactoring
```

### Rust Migration Generator

**What it does:** When migrating C/C++ code to Rust, it automatically detects dangerous patterns and supports a safe migration.

| Detected pattern | Risk | Rust alternative |
|-------------|--------|--------------|
| `malloc/free/realloc` | Memory leaks, double free | Ownership system |
| `strcpy/strcat/sprintf` | Buffer overflow | `String`, `format!` |
| Pointer arithmetic | Invalid memory access | Slices, iterators |
| `pthread/volatile` | Data races | `Arc<Mutex<T>>`, `Atomic` |

**Usage in natural language:**
```
Detect dangerous patterns in the C code
Prepare for the Rust migration
```

## Guardrail System

MUSUBI automatically guarantees quality with 3 layers of guardrails. Even without developers being aware of it, they prevent dangerous code and data from leaking into production.

### 1. Input Guardrail (Input Validation)

**What it does:** Validates user input and prompts to the AI, and blocks dangerous data.

| Detection target | Description | Example |
|----------|------|------|
| **PII (personal information)** | Name, address, phone number, email address, etc. | `Taro Tanaka 090-1234-5678` |
| **SQL injection** | Malicious code that attacks the database | `'; DROP TABLE users;--` |
| **XSS attacks** | Scripts that tamper with web pages | `<script>alert('hack')</script>` |
| **Sensitive information** | API keys, passwords, tokens | `sk-xxxxx`, `password123` |

**Usage in natural language:**
```
Validate the input
Run a security check
```

### 2. Output Guardrail (Output Validation)

**What it does:** Automatically masks (hides) sensitive information in code and output generated by the AI.

| Mask target | Before | After |
|-----------|--------|--------|
| API key | `OPENAI_API_KEY=sk-abc123...` | `OPENAI_API_KEY=***REDACTED***` |
| Password | `password: "secret123"` | `password: "***REDACTED***"` |
| Connection string | `mongodb://user:pass@host` | `mongodb://***REDACTED***` |
| Personal information | `email: "taro@example.com"` | `email: "***REDACTED***"` |

This prevents sensitive information from leaking into logs and documentation.

### 3. Constitutional Guardrail (Constitutional Compliance)

**What it does:** Automatically verifies that generated code does not violate the project's "constitution" (9 quality rules).

| Article | Content | Verification method |
|------|------|----------|
| Article 1 | Specification first | Check `[SPEC:xxx]` references |
| Article 2 | Traceability | Check `[TRACE:xxx]` links |
| Article 3 | EARS compliance | Validate requirement format |
| Article 4 | Change tracking | Check that Delta specs exist |
| Article 5 | Quality gates | Check test coverage |
| Article 6 | Documentation | Check JSDoc/README |
| Article 7 | Simplicity | Detect over-abstraction |
| Article 8 | Governance | Check approval process |
| Article 9 | Continuous improvement | Check feedback loops |

## P-Label Priority System

Prioritize tasks with P-labels:

```
P0 (Critical)  → Blocks everything, immediate response
P1 (High)      → Run next, important tasks
P2 (Medium)    → Normal priority
P3 (Low)       → Background, if there is time
```

**Parallel execution example:**

**CLI:**
```bash
# P0 runs immediately, P1-P3 run in parallel in priority order
npx musubi-orchestrate parallel \
  --skills "frontend-developer,backend-developer,test-engineer" \
  --strategy "priority"
```

**Natural language (talk to GitHub Copilot):**
```
Run the front end, back end, and tests in parallel
Process the tasks in priority order
```

## Real-Time Replanning

When an unexpected problem occurs, MUSUBI automatically re-plans:

```
Replanning triggered:

Original Plan:
1. ✅ Requirements Analysis
2. ✅ System Design
3. ❌ Implementation (blocked: external API not available)

Detected Issue:
- External payment API is under maintenance

Alternative Path Generated:
3a. Mock payment API implementation
3b. Continue with other features
3c. Retry payment integration after 2 hours

Human Approval Required: Yes/No?
```

## Quality Dashboard

Visualize quality with A-F grades:

**CLI:**
```bash
npx -p musubi-gui start --port 3000
```

**Natural language (talk to GitHub Copilot):**
```
Show the quality dashboard
Check the quality of the project
Validate constitutional compliance
```

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/78535/7815702a-83c9-41a5-a7de-9293b0b8d62a.png)


## Summary: Why MUSUBI + CodeGraph + GitHub Copilot?

### Conventional Development
```
Developer → (thinks) → AI → (generates code) → Developer → (reviews) → Done?
                    ↓
              Insufficient context
              Inconsistent quality
              No traceability
```

### MUSUBI Swarm Coding
```
Developer → MUSUBI → [Swarm of 25 skills] → Guardrails → Quality-assured code
           ↓           ↓                  ↓
    CodeGraph     Expert collaboration  Constitutional compliance
    (big picture)  (optimal assignment)  (quality assurance)
```

### Why It Gets Chosen

| Reason | Details |
|------|------|
| **Outstanding test quality** | 3,850 tests, 129 suites |
| **Enterprise-ready** | Proven on 100,000 files and 10 million lines |
| **Team of specialists** | Division of labor across 25 skills |
| **9 collaboration patterns** | Optimal formation for each situation |
| **Complete tracing** | REQ→Design→Code→Test |
| **Quality assurance** | 3-layer guardrails + 9 constitutional articles |
| **Multi-platform** | Supports 13+ AI assistants |

## Links

- **GitHub**: https://github.com/nahisaho/MUSUBI
- **npm**: https://www.npmjs.com/package/musubi-sdd
- **CodeGraph MCP Server**: https://github.com/alohays/codegraph-mcp
- **Documentation**: https://nahisaho.github.io/musubi

---

**Get started now:**

```bash
npx musubi-sdd init --copilot
```

**Natural language (after installation, talk to GitHub Copilot):**
```
Initialize MUSUBI
Create the CodeGraph MCP Index
Update Steering
```

**From a single AI to AI that works as a team.**

Experience Swarm Coding with **MUSUBI v5.7.0**.

---

## Appendix A: CLI Command List

MUSUBI provides 21 CLI commands. All of them can be run with `npx`.

:::note info
**How to run the commands**

MUSUBI's commands are included in the `musubi-sdd` package.

```bash
# Method 1: Specify the package with the -p option (recommended)
npx -p musubi-sdd musubi-gui start --port 3000
npx -p musubi-sdd musubi-analyze --codegraph-full

# Method 2: Run directly after a global install
npm install -g musubi-sdd
musubi-gui start --port 3000
```

The command examples below are written as `npx musubi-xxx` for brevity,
but actually run them as `npx -p musubi-sdd musubi-xxx`, or as `musubi-xxx` after a global install.
:::

### Initialization & Setup

| Command | Description |
|---------|------|
| `npx musubi-sdd init` | Initialize a project |
| `npx musubi-onboard` | Analyze an existing project and generate Steering |
| `npx musubi-sync` | Synchronize Steering documents |

**musubi-sdd init options:**
- `--copilot` / `--github-copilot` - For GitHub Copilot
- `--claude` / `--claude-code` - For Claude Code (default)
- `--cursor` - For Cursor IDE
- `--gemini` / `--gemini-cli` - For Gemini CLI
- `--codex` / `--codex-cli` - For Codex CLI
- `--qwen` / `--qwen-code` - For Qwen Code
- `--windsurf` - For Windsurf IDE

### SDD Workflow

| Command | Description |
|---------|------|
| `npx musubi-requirements` | Requirements definition in EARS format |
| `npx musubi-design` | C4 model + ADR design |
| `npx musubi-tasks` | Task breakdown (P0-P3 priorities) |
| `npx musubi-workflow` | Workflow management |

**musubi-requirements subcommands:**
- `init <feature>` - Initialize the requirements document for a feature
- `add` - Add a requirement in EARS format (interactive)
- `list` - List all requirements
- `validate` - Validate compliance with the EARS format
- `metrics` - Calculate requirement quality metrics
- `trace` - Show the traceability matrix

**musubi-design subcommands:**
- `init <feature>` - Initialize the design document
- `add-c4 <level>` - Add a C4 model (context/container/component/code)
- `add-adr <decision>` - Add an ADR (Architecture Decision Record)
- `validate` - Validate the completeness of the design document
- `trace` - Trace from requirements to design

**musubi-tasks subcommands:**
- `init <feature>` - Generate a task breakdown document from the design
- `add <title>` - Add a new task (interactive)
- `list` - List all tasks
- `update <id> <status>` - Update task status
- `validate` - Validate the completeness of the task breakdown
- `graph` - Generate a task dependency graph

**musubi-workflow subcommands:**
- `init <feature>` - Initialize the workflow for a new feature
- `status` - Show the current workflow state
- `next [stage]` - Transition to the next stage
- `feedback <from> <to>` - Record a feedback loop
- `complete` - Complete the workflow
- `history` - Show workflow history
- `metrics` - Show workflow metrics

### Analysis & Validation

| Command | Description |
|---------|------|
| `npx musubi-analyze` | Code quality analysis |
| `npx musubi-validate` | Validate compliance with the 9 constitutional articles |
| `npx musubi-trace` | Requirements → code → test traceability |
| `npx musubi-gaps` | Detect gaps between specification and implementation |

**musubi-analyze options:**
- `-t, --type <type>` - Analysis type (quality/dependencies/security/stuck/codegraph/all)
- `--codegraph` - Update the CodeGraph MCP index
- `--codegraph-full` - Full CodeGraph index (non-incremental)
- `--detect-stuck` - Detect stuck patterns (repeated errors, circular edits)
- `--threshold <level>` - Quality threshold (low/medium/high)

**musubi-validate subcommands:**
- `constitution` - Validate all 9 articles
- `article <number>` - Validate a specific article (1-9)
- `gates` - Validate Phase -1 Gates (simplicity, anti-abstraction)
- `complexity` - Validate complexity limits (module ≤1500 lines, function ≤50 lines)
- `guardrails [content]` - Validate input/output guardrails
- `guardrails-chain [content]` - Run the guardrail chain
- `score` - Calculate the constitutional compliance score (0-100)
- `all` - Run all validations

**musubi-trace subcommands:**
- `matrix` - Generate the full traceability matrix
- `coverage` - Calculate requirements coverage statistics
- `gaps` - Detect orphaned requirements/designs/tasks and untested code
- `requirement <id>` - Trace a specific requirement to design, tasks, code, and tests
- `validate` - Validate 100% traceability coverage (Constitution Article 5)
- `bidirectional` - Bidirectional traceability analysis
- `impact <requirementId>` - Impact analysis of a requirement change
- `ci-check` - Validation for CI/CD pipelines (returns an exit code)
- `html-report` - Generate an interactive HTML report

**musubi-gaps subcommands:**
- `detect` - Detect all gaps (requirements, code, tests)
- `requirements` - Detect orphaned requirements (no design or code)
- `code` - Detect untested code
- `coverage` - Calculate coverage statistics

### Orchestration

| Command | Description |
|---------|------|
| `npx musubi-orchestrate` | Multi-skill orchestration |

**musubi-orchestrate subcommands:**
- `run <pattern>` - Run an orchestration pattern
- `auto <task>` - Automatically select and run the best skill for a task
- `sequential` - Run skills sequentially
- `list-patterns` - List available patterns
- `list-skills` - List available skills
- `goal <action>` - Goal management for goal-driven replanning
- `replan` - Trigger replanning analysis
- `modify-goal` - Adaptively modify goals based on constraints
- `optimize-path` - Analyze and optimize the execution path
- `status` - Show the orchestration engine state
- `handoff` - Run the handoff pattern (delegate to another agent)
- `triage` - Run the triage pattern (classify and route requests)
- `triage-categories` - List triage categories

### Change Management

| Command | Description |
|---------|------|
| `npx musubi-change` | Manage change proposals (Delta specs) |
| `npx musubi-checkpoint` | Manage checkpoints of development state |

**musubi-change subcommands:**
- `init <change-id>` - Create a new change proposal (with a Delta spec)
- `apply <change-id>` - Apply a change proposal to the codebase
- `archive <change-id>` - Archive a completed change into specs/
- `list` - List all change proposals
- `validate <change-id>` - Validate Delta spec format
- `show <change-id>` - Show change details
- `impact <change-id>` - Show detailed impact analysis of a change
- `approve <change-id>` - Approve a change proposal
- `reject <change-id>` - Reject a change proposal
- `create` - Create a Delta spec interactively
- `diff <change-id>` - Show Before/After differences
- `status` - Status summary of all changes

**musubi-checkpoint subcommands:**
- `create` / `save` - Create a new checkpoint
- `list` / `ls` - List all checkpoints
- `show <id>` - Show checkpoint details
- `restore <id>` - Restore a checkpoint
- `delete` / `rm <id>` - Delete a checkpoint
- `archive <id>` - Archive a checkpoint
- `compare` / `diff <id1> <id2>` - Compare two checkpoints
- `tag <id> <tags...>` - Add tags
- `current` - Show the current checkpoint

### Memory & Sharing

| Command | Description |
|---------|------|
| `npx musubi-remember` | Agent memory management |
| `npx musubi-share` | Memory sharing across teams |

**musubi-remember subcommands:**
- `add <memory>` - Add a new memory entry
- `list` - List all memories
- `condense` - Condense and summarize the memory bank
- `search <query>` - Search memories by keyword
- `clear` - Clear all memories

**musubi-share subcommands:**
- `export` - Export project memory in a shareable format
- `import <file>` - Import and merge memory from a file
- `sync` - Synchronize memory across AI platforms
- `status` - Show sharing status

### Utilities

| Command | Description |
|---------|------|
| `npx musubi-gui` | Web dashboard |
| `npx musubi-browser` | Browser automation (natural language) |
| `npx musubi-resolve` | Automatic GitHub Issue resolution |
| `npx musubi-convert` | Conversion to/from Spec Kit format |
| `npx musubi-costs` | LLM API cost tracking |

**musubi-gui subcommands:**
- `start` - Start the web server (specify the port with `--port <port>`)
- `build` - Build the front end for production
- `dev` - Start in development mode (hot reload)
- `status` - Show a project status summary
- `matrix` - Show the traceability matrix

**musubi-browser subcommands:**
- `interactive` / `i` - Start an interactive browser automation session
- `run <command>` - Run a single natural-language command
- `script <file>` - Run commands from a script file
- `compare <expected> <actual>` - Compare screenshots with AI
- `generate-test` - Generate Playwright tests from the action history

**musubi-resolve options:**
- `<issue-number>` - GitHub Issue number to resolve
- `-u, --url <url>` - GitHub Issue URL
- `--dry-run` - Preview the resolution without creating a PR
- `--branch <name>` - Custom branch name
- `list` - List recent open issues in the repository

**musubi-convert subcommands:**
- `from-speckit <path>` - Convert a Spec Kit project to MUSUBI format
- `to-speckit` - Convert the current MUSUBI project to Spec Kit format
- `validate <format> [path]` - Validate project format (speckit/musubi)
- `from-openapi <specPath>` - Convert an OpenAPI/Swagger spec to MUSUBI requirements
- `roundtrip <path>` - Round-trip conversion test (A → B → A')

**musubi-costs subcommands:**
- `summary` / `show` - Show current session/period costs
- `report` - Generate a detailed cost report (specify the period with `--period`)
- `budget set <$>` - Set a budget limit
- `budget status` - Show budget usage
- `budget clear` - Remove the budget limit
- `pricing [model]` - Show model pricing
- `history [n]` - Show the last n sessions
- `export` - Output the data as JSON

---

## Appendix B: Natural Language Command List

With MUSUBI, you can operate everything just by talking to GitHub Copilot in natural language, without memorizing CLI commands.

### Setup & Initialization

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Initialize a project | `Initialize MUSUBI` | `npx musubi-sdd init --copilot` |
| | `Set up the project` | |
| | `Start SDD` | |

### CodeGraph Operations

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Create the index | `Create the CodeGraph MCP Index` | `npx musubi-analyze --codegraph-full` |
| | `Build the code graph` | |
| | `Analyze the project` | |
| Update the index | `Update the CodeGraph MCP Index` | - |
| | `Rebuild the code graph` | |

### Steering (Project Memory)

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Sync memory | `Update Steering` | `npx musubi-sync` |
| | `Sync the project memory` | |
| Check memory | `Check Steering` | - |
| | `Show me the project settings` | |

### Requirements & Design

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Define requirements | `Define the requirements for the authentication feature` | `npx musubi-requirements auth` |
| | `#sdd-requirements auth` | |
| Create a design | `Design the authentication feature` | `npx musubi-design auth` |
| | `#sdd-design auth` | |
| Break down tasks | `Identify the tasks for the authentication feature` | `npx musubi-tasks auth` |
| | `#sdd-tasks auth` | |

### Implementation & Development

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Implement a feature | `Implement the authentication feature` | `npx musubi-workflow implement auth` |
| | `#sdd-implement auth` | |
| Parallel execution | `Develop the front end and back end at the same time` | `npx musubi-orchestrate parallel` |
| | `Implement in parallel` | |

### Analysis & Validation

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Code analysis | `Analyze the entire project` | `npx musubi-analyze` |
| | `Show codebase statistics` | |
| Complexity analysis | `Analyze the complexity of the code` | - |
| | `Find functions that need refactoring` | |
| Giant function detection | `Detect giant functions` | - |
| | `Find functions that are too long` | |

### Quality & Validation

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Check quality | `Show the quality dashboard` | `npx musubi-gui start --port 3000` |
| | `Check the quality of the project` | |
| Constitution validation | `Validate constitutional compliance` | `npx musubi-validate` |
| | `Check for rule violations` | |
| Check traceability | `Check traceability` | `npx musubi-trace` |
| | `Show the trace from requirements to implementation` | |

### Security

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Input validation | `Validate the input` | - |
| | `Run a security check` | |
| Dangerous pattern detection | `Detect dangerous patterns in the C code` | - |
| | `Prepare for the Rust migration` | |

### Other

| What you want to do | Natural-language instruction | Corresponding CLI command |
|-------------|-----------------|----------------|
| Gap analysis | `Find gaps between the specification and the implementation` | `npx musubi-gaps` |
| Change management | `Show me the change history` | `npx musubi-change` |
| Onboarding | `Give me an overview of the project` | `npx musubi-onboard` |

---

:::note warn
**Hint: tips for natural-language commands**
- Include a specific feature name (e.g. "the authentication feature...", "the login screen...")
- Phrase it as an action (e.g. "Do ...", "Create ...", "Check ...")
- If in doubt, "Help me with ..." or "Tell me about ..." is fine
:::



