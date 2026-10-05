## Introduction

**"Better a team of AIs than a single AI"** -- this is the next-generation coding experience.

GitHub Copilot is an excellent "individual contributor", but by combining **MUSUBI** with the **CodeGraph MCP Server**, you can achieve **Swarm coding, where AI collaborates as a team of specialists**.

**3,958 tests, 132 test suites, 12,093 code entities, and 59,222 relations**: MUSUBI v5.9.0 is designed as an enterprise-grade development foundation.

### Limits of GitHub Copilot Alone

GitHub Copilot is a wonderful tool, but **enterprise application development** poses the following challenges.

| Challenge | Example | Enterprise Impact |
|------|--------|------------------------|
| **Fragmented context** | Can only understand code file by file | Misses dependencies in large codebases |
| **No link to specifications** | Does not know "why this code is needed" | Impact scope is unclear when requirements change |
| **Lack of design decisions** | Generates code without considering the architecture | Accumulation of technical debt |
| **No quality standards** | Does not know project-specific rules | Coding standard violations, security holes |
| **No traceability** | Cannot trace requirements → design → implementation → tests | Audit and compliance are difficult |
| **Lack of consistency** | Answers vary from session to session | Confusion in team development |

:::note warn
**What Enterprise Development Needs**
- Consistent implementation based on specifications
- Understanding of the context of the whole project
- Records of architecture decisions (ADR)
- Quality gates and automated validation
- Change impact analysis
- Auditable traceability

**GitHub Copilot + MUSUBI + CodeGraph** delivers all of these.
:::

:::note info
**What Is Swarm Coding?**
A technique in which multiple AI agents collaborate to develop software. Just like human teams, the AIs divide roles and cooperate to autonomously carry out complex tasks.

**Key features:**
- **Multi-agent system**: Rather than a single giant AI, it consists of multiple AI agents each with a specific role (planner, coder, tester, reviewer, etc.)
- **Autonomous collaboration**: Each agent works together autonomously like a swarm of bees, processing tasks toward the overall goal
- **Dynamic task management**: When problems occur or better solutions are found, the AI itself dynamically revises and replans the task plan
- **Integration with real environments**: Integrates with actual development tools such as codebase search, test execution, and version control (Git)
- **Efficiency and productivity gains**: AI agents work in parallel, enabling a significant increase in development speed

This approach is a multi-agent collaboration pattern inspired by the OpenAI Agents SDK and AutoGen, and is drawing attention as a new concept with the potential to revolutionize software development.
:::

## What Is SDD (Specification Driven Development)?

MUSUBI is a framework that realizes **SDD (Specification Driven Development)**.

### Why SDD?

In conventional AI coding, the goal was "generating code". However, enterprise development requires a consistent process of **specification → design → implementation → testing → operations**.

| Challenge | Conventional AI Development | SDD (MUSUBI) |
|------|-------------|---------------|
| **Ambiguous specifications** | Implemented from natural language as-is | Formalized in EARS format |
| **Lack of design** | Generates code right away | Designed with C4 model + ADR |
| **Traceability** | None | Tracks REQ → Design → Code → Test |
| **Quality assurance** | Relies on manual review | Automated validation with Constitution + guardrails |
| **Change management** | Differences are unclear | Changes made explicit with Delta specifications |

### The 8-Stage SDD Workflow

The MUSUBI SDD workflow consists of 8 stages.

| Stage | Name | Content | Deliverables |
|---------|------|------|--------|
| 1 | **Steering** | Initialize/update project memory | `steering/` directory |
| 2 | **Requirements** | Requirements definition in EARS format | `storage/specs/*.ears.md` |
| 3 | **Design** | C4 model + ADR creation | `storage/specs/*.design.md` |
| 4 | **Tasks** | Breakdown into implementation tasks | `storage/specs/*.tasks.md` |
| 5 | **Implement** | Implementation via Swarm Coding | Source code |
| 6 | **Validate** | Validation of Constitution compliance | Validation report |
| 7 | **Review** | Human-in-Loop review | Approval / revision instructions |
| 8 | **Release** | Release preparation, change log | CHANGELOG, tags |

### What Is the EARS Format?

**EARS (Easy Approach to Requirements Syntax)** is a requirements notation format for eliminating the ambiguity of natural language.

| Pattern | Template | Example |
|----------|-------------|-----|
| **Ubiquitous** | The system shall... | The system shall encrypt authentication tokens |
| **Event-Driven** | When [event], the system shall... | When the login button is pressed, the system shall start authentication processing |
| **State-Driven** | While [state], the system shall... | While offline, the system shall use the local cache |
| **Optional** | Where [feature], the system shall... | Where two-factor authentication is enabled, the system shall send an SMS code |
| **Unwanted** | If [condition], the system shall not... | If authentication fails 5 times in a row, the system shall lock the account |

:::note info
**Benefits of SDD**
- **AI consistency**: The AI makes decisions based on specifications, so there is less variation
- **More efficient reviews**: Differences between specification and implementation are clear
- **Automatic document generation**: Generate API documentation and test cases from specifications
- **Change impact analysis**: Automatically detect the affected scope when specifications change
:::

## Why MUSUBI? -- Overwhelming Scale

### v5.9.0 Track Record

| Metric | Value | Meaning |
|-----------|------|------|
| **Tests** | 4,408 | Industry-leading test coverage |
| **Test suites** | 140+ | Comprehensive quality assurance |
| **Code entities** | 12,093 | Analysis targets: functions, classes, variables, etc. |
| **Code relations** | 59,222 | Understanding of dependencies and call relationships |
| **Communities (modules)** | 140 | Automatically detected module boundaries |
| **Supported platforms** | 13+ | Claude, Copilot, Cursor, Windsurf, Gemini, Codex... |
| **Specialist skills** | 27 | Covering everything from specification to deployment |
| **Orchestration patterns** | 9 | Swarm, Handoff, Triage, Human-in-Loop... |

### v5.9.0 New Features: Phase 1-4 Enterprise Features

v5.9.0 adds enterprise features for large-scale projects and monorepo support.

#### Workflow Flexibility (Phase 1)

| Feature | Description | Effect |
|------|------|------|
| **WorkflowModeManager** | 3 modes: small/medium/large | Flexible workflow according to project scale |
| **Auto-detection** | Infers mode from feature name | No manual configuration needed |
| **musubi-release** | Automatic CHANGELOG generation | More efficient release work |

#### Monorepo Support (Phase 2)

| Feature | Description | Effect |
|------|------|------|
| **PackageManager** | Package registry management | Visibility across the whole monorepo |
| **Dependency graph** | Mermaid diagram generation | Better understanding through visualization |
| **Coverage tracking** | Per-package reports | More detailed quality management |

#### Constitution Level Management (Phase 3)

| Feature | Description | Effect |
|------|------|------|
| **ConstitutionLevelManager** | critical/advisory/flexible | Response according to violation severity |
| **Blocking/warning separation** | Behavior by severity | Greater development flow flexibility |
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

### v5.7.0 Features: Performance Optimization

v5.7.0 adds performance optimization modules for enterprises.

| Feature | Description | Effect |
|------|------|------|
| **LazyLoader** | On-demand module loading | Shorter startup time, better memory efficiency |
| **CacheManager** | LRU cache + TTL management | 30%+ improvement in API response time |
| **BatchProcessor** | Parallel execution of bulk processing | More efficient large-volume data processing |
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

### Proven Validation Projects

MUSUBI's enterprise features were developed and validated on real large-scale projects.

#### Linux Kernel (30 Million Lines) -- Efficient Development on an Ultra-Large Codebase

The **Linux kernel** is one of the world's largest open-source projects. We are validating whether MUSUBI can support efficient development even on such an ultra-large codebase.

| Item | Result |
|------|------|
| Number of files | 80,000+ |
| Lines of code | 30,000,000+ |
| Number of subsystems | 100+ |
| Annual commits | 70,000+ |

**Linux Kernel Development Challenges and How MUSUBI Responds**

| Challenge | Conventional Development | MUSUBI + CodeGraph |
|------|-----------|-------------------|
| **Code navigation** | cscope/ctags, manual search | Instantly located with CodeGraph `global_search` |
| **Understanding subsystems** | Documentation + experience | Module boundaries automatically detected with `community` |
| **Change impact analysis** | Relies on maintainers' experience | Ripple scope visualized with `find_dependencies` |
| **Coding standards** | checkpatch.pl | Automated validation with Constitution + guardrails |
| **Driver development** | Copy-paste from templates | Structured generation with SDD + Swarm Coding |

**Validation scenario: developing a new device driver**

1. **Requirements definition**: Describe the new driver's specification in EARS format
2. **Architecture review**: Analyze existing driver patterns with CodeGraph
3. **Swarm Coding**: Multiple skills collaborate to generate the driver code
4. **Quality validation**: Automatically check compliance with the Linux kernel coding standards

:::note info
**Why validate on the Linux kernel?**
The Linux kernel is a world-class project in code volume, complexity, and number of developers. If we can confirm that MUSUBI works efficiently here, it can be said to handle almost any enterprise project.
:::

#### GCC Codebase (10 Million Lines) -- Modifying Highly Correlated Code

Through actual analysis of **GCC (GNU Compiler Collection)**, we validated support for huge codebases when **modifying highly correlated code**.

In compilers like GCC, modules work closely together, and a change in one place ripples widely. MUSUBI's CodeGraph integration visualizes this "strength of correlation" and enables safe modifications.

| Item | Result |
|------|------|
| Number of files | 100,000+ |
| Lines of code | 10,000,000+ |
| Giant functions detected | Multiple functions exceeding 1,000 lines detected |
| Memory efficiency | Processable within 2GB using streaming analysis |

**Modification Support Through Correlation Analysis**

| Analysis Item | MUSUBI Feature | Use with GCC |
|----------|-------------|-------------|
| **Dependency visualization** | CodeGraph `find_dependencies` | Identify the impact scope of a change |
| **Caller tracking** | CodeGraph `find_callers` | Understand ripple targets when changing a function |
| **Community detection** | CodeGraph `community` | Identify tightly coupled modules |
| **Impact analysis** | MUSUBI Impact Analyzer | Assess risk before modification |

**Security Hardening Experiment by Rust Replacement**

We are also running an experiment to improve memory safety by replacing GCC's C/C++ code with Rust. Using MUSUBI's **Rust Migration Generator**, we automatically detect dangerous patterns and support migration to safe Rust code.

| Detection Category | Detections in GCC | Security Risk |
|-------------|--------------|------------------|
| Memory management (malloc/free) | Many | Memory leaks, double free |
| String operations (strcpy/sprintf) | Many | Buffer overflow |
| Pointer arithmetic | Many | Illegal memory access |
| Concurrency (pthread) | Many | Data races |

This experiment confirms that MUSUBI's CodeGraph and Rust Migration Generator can **support safe modification even of huge, highly correlated codebases**.

#### Ouranos Ecosystem Dataspaces (IPA/METI)

**[Ouranos Ecosystem Dataspaces Reference Architecture Model (ODS-RAM)](https://www.ipa.go.jp/digital/architecture/reports/ouranos-ecosystem-dataspaces-ram-white-paper.html)**: we refer to this white paper and are validating **whether a model that actually works can be generated**.

| Item | Content |
|------|------|
| **Provider** | IPA (Information-technology Promotion Agency) / Ministry of Economy, Trade and Industry (METI) |
| **Purpose** | Industrial data collaboration across companies, industries, and national borders |
| **Architecture** | 4 layers x 4 perspectives |
| **Problem areas** | 13 structural challenges in data collaboration and utilization |
| **Validation with MUSUBI** | Generate a working model from the white paper |

**Validation approach:**

1. **White paper analysis**: Analyze the ODS-RAM white paper with MUSUBI and extract architecture requirements
2. **SDD conversion**: Convert the extracted requirements into EARS-format specifications
3. **Code generation**: Automatically generate a reference implementation with Swarm Coding
4. **Operational validation**: Confirm that the generated model actually works

:::note info
**What Is ODS-RAM?**
A technical reference document for building service-driven dataspaces in the Ouranos Ecosystem. It provides an architecture model for realizing a distributed/federated hybrid service ecosystem while ensuring data sovereignty.

MUSUBI takes this white paper as input, automates the whole process of **specification → design → implementation → validation**, and we are validating that it can generate a working reference implementation.
:::

## How Swarm Coding Works

### Conventional AI Coding vs Swarm Coding

Conventional AI coding relied on a "single all-purpose AI". However, it has limits in complex projects. In Swarm Coding, just like human team development, **multiple specialized AI agents collaborate** to move the work forward.

| Conventional | Swarm Coding (MUSUBI) |
|------|----------------------|
| Leave everything to one AI | A team of specialists collaborates |
| Insufficient context | Grasp the whole picture with CodeGraph |
| One-shot attempt | Routed appropriately with Handoff/Triage |
| Quality is left to chance | Governance with the 9 Constitutional Articles |
| No traceability | Full tracking of REQ → Design → Code → Test |

### The 9 Orchestration Patterns

MUSUBI uses **9 collaboration patterns** depending on the nature of the task and the situation. These are inspired by the multi-agent patterns of the OpenAI Agents SDK and AutoGen, and cover everything from simple sequential processing to complex swarm intelligence.

| # | Pattern | Description | Use Case |
|---|----------|------|-------------|
| 1 | **Sequential** | Sequential execution | Specification → design → implementation → testing |
| 2 | **Parallel** | Parallel execution | Simultaneous frontend/backend development |
| 3 | **Swarm** | Swarm-intelligence collaboration | Everyone solves the problem together |
| 4 | **Handoff** | Delegation | Pass the baton to a specialist |
| 5 | **Triage** | Sorting | Route to the appropriate agent |
| 6 | **Human-in-Loop** | Human approval | Humans decide important matters |
| 7 | **Nested** | Nesting | Complex workflows |
| 8 | **Group Chat** | Group chat | Discussion among multiple agents |
| 9 | **Auto** | Automatic selection | Optimal pattern depending on the situation |

## What Is the CodeGraph MCP Server?

The **CodeGraph MCP Server** is a server that analyzes source code as a graph structure and provides it to AI agents via MCP (Model Context Protocol).

### Why Is CodeGraph Needed?

Conventional AI coding assistants can only understand code "file by file". CodeGraph grasps the entire project as a **graph structure**, enabling the following.

| Challenge | Conventional AI | With CodeGraph |
|------|----------|---------------|
| Callers of a function | grep search, with omissions | Complete list with `find_callers` |
| Dependencies | Eyeballing import statements | Deep dependencies also detected with `find_dependencies` |
| Impact scope of changes | "Probably fine" | Full ripple scope grasped through impact analysis |
| Understanding code structure | One file at a time | Instant overview with `stats` + `community` |

### 14 MCP Tools Provided by CodeGraph

```
Code graph operations
├── init_graph          - Initialize graph
├── get_code_snippet    - Retrieve source code
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

MUSUBI has a `musubi-analyze` command, which provides analysis features separate from the CodeGraph MCP Server. Use them according to your purpose.

| Item | `musubi-analyze` | `codegraph` (MCP Server) |
|------|------------------|--------------------------|
| **Provider** | Built into MUSUBI | External MCP server |
| **Main purpose** | Project statistics, complexity analysis, giant function detection | Code graph construction, dependency tracking, impact analysis |
| **Output destination** | Console / report | `steering/memories/codegraph.md` |
| **Integration with AI** | Provides analysis results to the AI | Real-time integration via the MCP protocol |
| **Installation** | `npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'` | `uvx codegraph-mcp` |

**Guidelines for choosing:**

| What you want to do | Command to use |
|-------------|-------------|
| View project statistics | `musubi-analyze` |
| Find high-complexity functions | `musubi-analyze --complexity` |
| Detect giant functions | `musubi-analyze --giant-functions` |
| Trace callers of a function | CodeGraph (`find_callers`) |
| Know the impact scope of a change | CodeGraph (`find_dependencies`) |
| Let the AI grasp the whole picture | `musubi-analyze --codegraph-full` |

:::note info
**Best Practices**
We recommend using both together. Running `musubi-analyze --codegraph-full` generates both MUSUBI's analysis results and the CodeGraph index, so the AI agent can make maximum use of the information.
:::

### Index Operations in Natural Language

With MUSUBI, you can also create and update the CodeGraph index in natural language.

```
Just talk to GitHub Copilot:

"Create the CodeGraph MCP Index"
"Update the CodeGraph MCP Index"
"Rebuild the code graph"

→ MUSUBI automatically does the following:
   1. Scan the entire repository
   2. Extract entities (functions, classes, variables)
   3. Analyze relations (calls, dependencies, inheritance)
   4. Detect communities (module boundaries)
   5. Save the index to steering/memories/codegraph.md
```

## Setup (1 Minute)

:::note warn
**On Windows: install on WSL (Windows Subsystem for Linux)**

We recommend running MUSUBI and the CodeGraph MCP Server on **Ubuntu on WSL**.

**Packages to install in advance on WSL (Ubuntu):**

```bash
# Node.js (v18 or later)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3, pip, pipx (required for the CodeGraph MCP Server)
sudo apt-get update
sudo apt-get install -y python3 python3-pip pipx
pipx ensurepath

# Git (required)
sudo apt-get install -y git
```

**Connect to WSL from VSCode:**
1. In VSCode, `Ctrl+Shift+P` → `WSL: Connect to WSL`
2. Open the project on WSL
3. Run `musubi-sdd init --copilot` in the terminal on WSL

**Why is WSL needed?**
- The CodeGraph MCP Server requires a Python environment
- Better file system performance
- Linux-native CLI tools work as-is
:::

### 1. Initialize the Project for GitHub Copilot

**CLI:**
```bash
musubi-sdd init --copilot
```

#### Options During Initialization

Running `musubi-sdd init --copilot` starts an interactive project configuration.

```
🎯 MUSUBI - Ultimate Specification Driven Development


Initializing for: GitHub Copilot
```

| Question | Options | Description |
|------|--------|------|
| **Project name** | (input) | Project name. Defaults to the current directory name |
| **Project description** | (input) | Project description text |
| **Documentation language** | English / Japanese / Chinese / Korean / Spanish / Deutsch / Français | Documentation language. Steering files are generated in this language |
| **Project structure** | Single package / Workspace / Microservices | Project structure |
| **Project type** | Greenfield (0→1) / Brownfield (1→n) / Both | New development or existing project |
| **Technology stack approach** | Single language / Multiple languages / Undecided / Help me decide | How to choose the technology stack |
| **Generate initial steering context?** | Yes / No | Whether to auto-generate steering files |
| **Create constitutional governance?** | Yes / No | Whether to create the Constitution (9 Articles) |

**Project structure details:**

| Option | Description | Suitable Projects |
|--------|------|----------------------|
| **Single package** | Single-package configuration | Small to medium-sized applications |
| **Workspace / Monorepo** | Single repository with multiple packages | Large projects with shared libraries |
| **Microservices** | Microservices configuration | Distributed systems, service groups requiring independent deployment |

**Project type details:**

| Option | Description | Steering Initialization |
|--------|------|-----------------|
| **Greenfield (0→1)** | New development from scratch | Generate empty Steering from templates |
| **Brownfield (1→n)** | Introduce to an existing project | Analyze existing code to infer Steering |
| **Both** | Supports both | Initialize with generic settings |

:::note info
**Greenfield (0→1): Start from requirements definition**

For new development, you can start development **from requirements definition** just by talking to GitHub Copilot in natural language.

**Natural language instruction examples:**
```
I'm developing an e-commerce site, so start with requirements definition
```

```
I want to develop a new task management app. Please start with requirements definition
```

```
I want to build an internal chatbot. Design it from scratch
```

MUSUBI receives this instruction and automatically executes the following SDD workflow.

1. **Requirements definition**: Write specifications in EARS format → `storage/specs/xxx.ears.md`
2. **Design**: C4 model + ADR → `storage/specs/xxx.design.md`
3. **Task breakdown**: Break down into implementation tasks → `storage/specs/xxx.tasks.md`
4. **Implementation**: Automatic implementation with Swarm Coding → Source code
5. **Validation**: Verify Constitution compliance → Validation report

**Greenfield development flow example: building an e-commerce site**

| Stage | Natural Language Instruction | Deliverables |
|---------|-----------------|--------|
| Requirements definition | `Define the requirements for the e-commerce site` | `storage/specs/ecommerce.ears.md` |
| Design | `Design the e-commerce site` | `storage/specs/ecommerce.design.md` |
| Task breakdown | `Identify the tasks for the e-commerce site` | `storage/specs/ecommerce.tasks.md` |
| Implementation | `Implement the e-commerce site` | Complete source code |
| Validation | `Validate the e-commerce site` | Validation report |

In this way, **starting from not a single line of code, you can proceed consistently with Swarm Coding from specification → design → implementation → validation**.
:::

:::note warn
**Tips: When you don't know what to do next**

If you get stuck during development, ask the orchestrator.

| What you want to do | Natural Language Instruction |
|-------------|-----------------|
| Execute the next task | `@orchestrator Execute the next task` |
| Check remaining tasks | `@orchestrator Check the remaining tasks` |
| Check progress | `@orchestrator Tell me the progress status` |
| Check the overall plan | `@orchestrator Show me the current plan` |
| Change task priority | `@orchestrator Execute the P0 tasks first` |
| Replan if there are problems | `@orchestrator Replan` |

The orchestrator understands the state of the project and proposes the best next action.
:::

**Technology stack approach details:**

| Option | Description | Next Step |
|--------|------|-------------|
| **Single language** | Single language | Choose a language (JS/TS, Python, Rust, Go, Java, C#, C++, Swift, Ruby, PHP) |
| **Multiple languages** | Multiple languages | Select multiple languages to use |
| **Undecided** | Not yet decided | Can be decided later |
| **Help me decide** | Want a recommendation | Enter requirements and the best language is suggested |

#### Output After Initialization

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
- `steering/` - Project Constitution and architecture definitions
- `storage/` - Specifications, design, and change management

### What Is Steering (Project Memory)?

**Steering** is MUSUBI's core "long-term memory of the project". It provides the foundation for AI agents to make consistent decisions.

#### Zero Start vs Existing Project

| Scenario | How Steering Is Initialized | Characteristics |
|----------|---------------------|------|
| **Zero start** | `musubi-sdd init --copilot` | Generated from templates at installation. Edit to fit your project |
| **Existing project** | `Generate Steering` | Analyzes existing code and automatically infers structure and technology stack |

**For a zero start:**
- Empty templates are generated
- Write `structure.md`, `tech.md`, and `product.md` manually
- The Constitution (`constitution.md`) is set to default values

**For an existing project:**
- MUSUBI analyzes the codebase
- Automatically detects languages, frameworks, and directory structure
- Extracts dependencies from `package.json`, `requirements.txt`, etc.
- Infers existing design patterns and generates `structure.md`

```
steering/
├── structure.md      # Architecture patterns (layer structure, design principles)
├── tech.md           # Technology stack (languages, frameworks, tools)
├── product.md        # Product context (domain knowledge, glossary)
├── project.yml       # Project settings (metadata, dependencies)
├── rules/
│   └── constitution.md   # The 9 Constitutional Articles (immutable rules)
└── memories/
    ├── codegraph.md      # CodeGraph index
    ├── architecture_decisions.md  # Architecture decision history
    ├── lessons_learned.md         # Lessons learned
    └── domain_knowledge.md        # Domain knowledge
```

| File | Role | When Updated |
|----------|------|----------------|
| `structure.md` | Layer structure, dependency direction, design patterns | When architecture changes |
| `tech.md` | Language versions, frameworks, libraries | When technology is selected/updated |
| `product.md` | Business domain, ubiquitous language, context | When requirements change |
| `constitution.md` | Quality standards, governance rules | **Do not change** (immutable) |
| `memories/` | Dynamically accumulated knowledge | Updated automatically |

:::note info
**Automatic Steering Synchronization**
MUSUBI detects project changes and automatically synchronizes the Steering documents.

**Synchronization is also possible in natural language:**
```
Update Steering
```
That's all it takes to bring project memory up to date.

```bash
musubi-sync  # Manual sync via CLI
```
:::

### 2. Configure the CodeGraph MCP Server

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
musubi-analyze --codegraph-full
```

**Natural language (talk to GitHub Copilot):**
```
Create the CodeGraph MCP Index
Build the code graph
Analyze the project
```

**Output example:**
```
CodeGraph Analysis Complete
   Entities: 12,093
   Relations: 59,222
   Communities: 140
   Index saved to: steering/memories/codegraph.md
```

## Practical Example: Feature Development with Swarm Coding

### Scenario: Adding User Authentication

When you run `#sdd-implement auth` in GitHub Copilot, MUSUBI automatically assembles the following Swarm.

```
🐝 Swarm Assembly for "auth" feature:

Phase 1: Requirements (Sequential)
├── Requirements Analyst → Requirements definition in EARS format
└── Constitution Enforcer → Verify the requirements comply with the Constitution

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
├── Quality Assurance → E2E testing
└── Human Approval → Final confirmation
```

### Impact Analysis with CodeGraph

When adding the authentication feature, CodeGraph automatically identifies the impact scope:

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

### Analysis and Design Phase
| Skill | Role | Main Features |
|--------|------|----------|
| Requirements Analyst | Requirements analysis | EARS-format requirements definition, stakeholder analysis |
| System Architect | System design | C4 model, ADR creation, architecture decisions |
| API Designer | API design | OpenAPI, REST/GraphQL design |
| Database Schema Designer | DB design | ER diagrams, migration design |

### Implementation Phase
| Skill | Role | Main Features |
|--------|------|----------|
| Software Developer | Code implementation | SOLID principles, clean code |
| Frontend Developer | Frontend implementation | React/Vue/Angular, accessibility |
| Backend Developer | Backend implementation | API implementation, database integration |
| DevOps Engineer | Infrastructure | CI/CD, Docker, Kubernetes |

### Quality Assurance Phase
| Skill | Role | Main Features |
|--------|------|----------|
| Test Engineer | Test design | Unit/integration/E2E, EARS→test conversion |
| Code Reviewer | Code review | Best practices, security |
| Security Auditor | Security audit | OWASP Top 10, vulnerability detection |
| Quality Assurance | Quality assurance | Test strategy, quality metrics |

### Operations and Management Phase
| Skill | Role | Main Features |
|--------|------|----------|
| Project Manager | Project management | Sprint planning, risk management |
| Technical Writer | Documentation | API documents, user guides |
| Release Coordinator | Release management | Version management, change log |
| Site Reliability Engineer | SRE | Observability, incident response |

## Enterprise Features (v5.5.0+)

### Large Project Analyzer

**What it does:** Analyzes huge projects of 100,000 files with efficient memory use.

It automatically selects the optimal analysis strategy according to project size.

| Project Size | Strategy | Description |
|-------------------|------|------|
| ≤100 files | Batch | Batch analysis (fastest) |
| ≤1,000 files | Optimized Batch | Optimized batch |
| ≤10,000 files | Chunked | Chunk splitting (saves memory) |
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
| **Cyclomatic complexity** | Number of conditional branches (if/switch/loop, etc.) | 10 or less is ideal |
| **Cognitive complexity** | Mental load required for a human to understand | 15 or less is ideal |

**Example detection results:**
| Severity | Status | Recommended Action |
|--------|------|----------------|
| 🟢 OK | Complexity ≤10 | Keep as is |
| 🟡 Warning | Complexity 11-20 | Consider refactoring |
| 🔴 Critical | Complexity >20 | Splitting the function is strongly recommended |

**Usage in natural language:**
```
Analyze code complexity
Find functions that need refactoring
```

### Rust Migration Generator

**What it does:** When migrating C/C++ code to Rust, automatically detects dangerous patterns and supports safe migration.

| Detected Pattern | Risk | Rust Alternative |
|-------------|--------|--------------|
| `malloc/free/realloc` | Memory leaks, double free | Ownership system |
| `strcpy/strcat/sprintf` | Buffer overflow | `String`, `format!` |
| Pointer arithmetic | Illegal memory access | Slices, iterators |
| `pthread/volatile` | Data races | `Arc<Mutex<T>>`, `Atomic` |

**Usage in natural language:**
```
Detect dangerous patterns in C code
Prepare for Rust migration
```

## Guardrail System

MUSUBI automatically ensures quality with 3 layers of guardrails. Even if developers are not paying attention, it prevents dangerous code and data from leaking into the production environment.

### 1. Input Guardrail (Input Validation)

**What it does:** Validates user input and prompts to the AI, and blocks dangerous data.

| Detection Target | Description | Example |
|----------|------|------|
| **PII (personal information)** | Names, addresses, phone numbers, email addresses, etc. | `John Smith 090-1234-5678` |
| **SQL injection** | Malicious code that attacks the database | `'; DROP TABLE users;--` |
| **XSS attack** | Scripts that tamper with web pages | `<script>alert('hack')</script>` |
| **Confidential information** | API keys, passwords, tokens | `sk-xxxxx`, `password123` |

**Usage in natural language:**
```
Validate the input
Run a security check
```

### 2. Output Guardrail (Output Validation)

**What it does:** Automatically masks (hides) confidential information from code and output generated by the AI.

| Masked Target | Before | After |
|-----------|--------|--------|
| API key | `OPENAI_API_KEY=sk-abc123...` | `OPENAI_API_KEY=***REDACTED***` |
| Password | `password: "secret123"` | `password: "***REDACTED***"` |
| Connection string | `mongodb://user:pass@host` | `mongodb://***REDACTED***` |
| Personal information | `email: "taro@example.com"` | `email: "***REDACTED***"` |

This prevents confidential information from leaking into logs and documents.

### 3. Constitutional Guardrail (Constitution Compliance)

**What it does:** Automatically validates whether generated code violates the project's "Constitution" (9 quality rules).

| Article | Content | Validation Method |
|------|------|----------|
| Article 1 | Specification first | Check `[SPEC:xxx]` references |
| Article 2 | Traceability | Check `[TRACE:xxx]` links |
| Article 3 | EARS compliance | Validate requirements format |
| Article 4 | Change tracking | Check existence of Delta specifications |
| Article 5 | Quality gate | Check test coverage |
| Article 6 | Documentation | Check JSDoc/README |
| Article 7 | Simplicity | Detect over-abstraction |
| Article 8 | Governance | Check approval process |
| Article 9 | Continuous improvement | Check feedback loop |

## P-Label Priority System

Prioritize tasks with P-labels:

```
P0 (Critical)  → Blocks everything, immediate response
P1 (High)      → Execute next, important tasks
P2 (Medium)    → Normal priority
P3 (Low)       → Background, if time permits
```

**Parallel execution example:**

**CLI:**
```bash
# P0 runs immediately, P1-P3 run in parallel in priority order
musubi-orchestrate parallel \
  --skills "frontend-developer,backend-developer,test-engineer" \
  --strategy "priority"
```

**Natural language (talk to GitHub Copilot):**
```
Run the frontend, backend, and tests in parallel
Process tasks in priority order
```

## Real-Time Replanning

When an unexpected problem occurs, MUSUBI automatically replans:

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
musubi-gui start --port 3000
```

**Natural language (talk to GitHub Copilot):**
```
Show the quality dashboard
Check the project quality
Validate Constitution compliance
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
    CodeGraph     Specialist collaboration   Constitution compliance
    (whole picture)   (optimal placement)         (quality assurance)
```

### Reasons to Choose It

| Reason | Details |
|------|------|
| **Overwhelming test quality** | 3,850 tests, 129 suites |
| **Enterprise-ready** | Proven on 100,000 files and 10 million lines |
| **Specialist team** | Division of labor across 25 skills |
| **9 collaboration patterns** | Optimal composition depending on the situation |
| **Complete tracking** | REQ→Design→Code→Test |
| **Quality assurance** | 3-layer guardrails + 9 Constitutional Articles |
| **Multi-platform** | Supports 13+ AI assistants |

## Links

- **GitHub**: https://github.com/nahisaho/MUSUBI
- **Source (ITG fork)**: https://github.com/Improve-To-Grow/MUSUBI/tree/ITG-adjustments
- **CodeGraph MCP Server**: https://github.com/alohays/codegraph-mcp
- **Documentation**: https://nahisaho.github.io/musubi

---

**Get started right now:**

```bash
musubi-sdd init --copilot
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

MUSUBI provides 21 CLI commands, all available after a global installation.

:::note info
**How to Run Commands**

Install the ITG fork globally once, then run the commands directly (never via `npx`).

```bash
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
musubi-gui start --port 3000
musubi-analyze --codegraph-full
```
:::

### Initialization and Setup

| Command | Description |
|---------|------|
| `musubi-sdd init` | Initialize project |
| `musubi-onboard` | Analyze existing project and generate Steering |
| `musubi-sync` | Synchronize Steering documents |

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
| `musubi-requirements` | Requirements definition in EARS format |
| `musubi-design` | C4 model + ADR design |
| `musubi-tasks` | Task breakdown (P0-P3 priorities) |
| `musubi-workflow` | Workflow management |

**musubi-requirements subcommands:**
- `init <feature>` - Initialize the requirements document for a feature
- `add` - Add a requirement in EARS format (interactive)
- `list` - List all requirements
- `validate` - Validate compliance with the EARS format
- `metrics` - Calculate requirements quality metrics
- `trace` - Display the traceability matrix

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
- `status` - Display the current workflow state
- `next [stage]` - Transition to the next stage
- `feedback <from> <to>` - Record a feedback loop
- `complete` - Complete the workflow
- `history` - Display workflow history
- `metrics` - Display workflow metrics

### Analysis and Validation

| Command | Description |
|---------|------|
| `musubi-analyze` | Code quality analysis |
| `musubi-validate` | Validate compliance with the 9 Constitutional Articles |
| `musubi-trace` | Requirements→code→test traceability |
| `musubi-gaps` | Detect gaps between specification and implementation |

**musubi-analyze options:**
- `-t, --type <type>` - Analysis type (quality/dependencies/security/stuck/codegraph/all)
- `--codegraph` - Update the CodeGraph MCP index
- `--codegraph-full` - Full CodeGraph index (non-incremental)
- `--detect-stuck` - Detect stuck patterns (repeated errors, circular edits)
- `--threshold <level>` - Quality threshold (low/medium/high)

**musubi-validate subcommands:**
- `constitution` - Validate all 9 Articles
- `article <number>` - Validate a specific Article (1-9)
- `gates` - Validate Phase -1 Gates (Simplicity, Anti-Abstraction)
- `complexity` - Validate complexity limits (module ≤1500 lines, function ≤50 lines)
- `guardrails [content]` - Validate input/output guardrails
- `guardrails-chain [content]` - Run the guardrail chain
- `score` - Calculate the Constitution compliance score (0-100)
- `all` - Run all validations

**musubi-trace subcommands:**
- `matrix` - Generate the full traceability matrix
- `coverage` - Calculate requirements coverage statistics
- `gaps` - Detect orphaned requirements, designs, tasks, and untested code
- `requirement <id>` - Trace a specific requirement to its design, tasks, code, and tests
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
| `musubi-orchestrate` | Multi-skill orchestration |

**musubi-orchestrate subcommands:**
- `run <pattern>` - Run an orchestration pattern
- `auto <task>` - Automatically select and run the best skills for a task
- `sequential` - Run skills sequentially
- `list-patterns` - List available patterns
- `list-skills` - List available skills
- `goal <action>` - Goal management for goal-driven replanning
- `replan` - Trigger replanning analysis
- `modify-goal` - Adapt goals based on constraints
- `optimize-path` - Analyze and optimize the execution path
- `status` - Display the orchestration engine status
- `handoff` - Run the handoff pattern (delegate to another agent)
- `triage` - Run the triage pattern (classify and route requests)
- `triage-categories` - List triage categories

### Change Management

| Command | Description |
|---------|------|
| `musubi-change` | Manage change proposals (Delta specifications) |
| `musubi-checkpoint` | Manage development state checkpoints |

**musubi-change subcommands:**
- `init <change-id>` - Create a new change proposal (with Delta specification)
- `apply <change-id>` - Apply a change proposal to the codebase
- `archive <change-id>` - Archive a completed change to specs/
- `list` - List all change proposals
- `validate <change-id>` - Validate the Delta specification format
- `show <change-id>` - Display detailed information about a change
- `impact <change-id>` - Display detailed impact analysis of a change
- `approve <change-id>` - Approve a change proposal
- `reject <change-id>` - Reject a change proposal
- `create` - Interactively create a Delta specification
- `diff <change-id>` - Display the Before/After diff
- `status` - Status summary of all changes

**musubi-checkpoint subcommands:**
- `create` / `save` - Create a new checkpoint
- `list` / `ls` - List all checkpoints
- `show <id>` - Display checkpoint details
- `restore <id>` - Restore a checkpoint
- `delete` / `rm <id>` - Delete a checkpoint
- `archive <id>` - Archive a checkpoint
- `compare` / `diff <id1> <id2>` - Compare two checkpoints
- `tag <id> <tags...>` - Add tags
- `current` - Display the current checkpoint

### Memory and Sharing

| Command | Description |
|---------|------|
| `musubi-remember` | Agent memory management |
| `musubi-share` | Memory sharing between teams |

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
- `status` - Display sharing status

### Utilities

| Command | Description |
|---------|------|
| `musubi-gui` | Web dashboard |
| `musubi-browser` | Browser automation (natural language) |
| `musubi-resolve` | Automatic GitHub Issue resolution |
| `musubi-convert` | Conversion to and from Spec Kit format |
| `musubi-costs` | LLM API cost tracking |

**musubi-gui subcommands:**
- `start` - Start the web server (specify the port with `--port <port>`)
- `build` - Build the frontend for production
- `dev` - Start in development mode (hot reload)
- `status` - Display the project status summary
- `matrix` - Display the traceability matrix

**musubi-browser subcommands:**
- `interactive` / `i` - Start an interactive browser automation session
- `run <command>` - Run a single natural language command
- `script <file>` - Run commands from a script file
- `compare <expected> <actual>` - Compare screenshots with AI
- `generate-test` - Generate a Playwright test from the action history

**musubi-resolve options:**
- `<issue-number>` - GitHub Issue number to resolve
- `-u, --url <url>` - GitHub Issue URL
- `--dry-run` - Preview the resolution without creating a PR
- `--branch <name>` - Custom branch name
- `list` - List the repository's recent open Issues

**musubi-convert subcommands:**
- `from-speckit <path>` - Convert a Spec Kit project to MUSUBI format
- `to-speckit` - Convert the current MUSUBI project to Spec Kit format
- `validate <format> [path]` - Validate the project format (speckit/musubi)
- `from-openapi <specPath>` - Convert an OpenAPI/Swagger specification to MUSUBI requirements
- `roundtrip <path>` - Round-trip conversion test (A → B → A')

**musubi-costs subcommands:**
- `summary` / `show` - Display current session and period costs
- `report` - Generate a detailed cost report (specify the period with `--period`)
- `budget set <$>` - Set the budget limit
- `budget status` - Display budget usage
- `budget clear` - Remove the budget limit
- `pricing [model]` - Display model pricing
- `history [n]` - Display the latest n session histories
- `export` - Export data as JSON

---

## Appendix B: Natural Language Command List

With MUSUBI, you don't need to memorize CLI commands; you can operate it just by talking to GitHub Copilot in natural language.

### Setup and Initialization

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Initialize project | `Initialize MUSUBI` | `musubi-sdd init --copilot` |
| | `Set up the project` | |
| | `Start SDD` | |

### CodeGraph Operations

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Create index | `Create the CodeGraph MCP Index` | `musubi-analyze --codegraph-full` |
| | `Build the code graph` | |
| | `Analyze the project` | |
| Update index | `Update the CodeGraph MCP Index` | - |
| | `Rebuild the code graph` | |

### Steering (Project Memory)

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Sync memory | `Update Steering` | `musubi-sync` |
| | `Sync the project memory` | |
| Check memory | `Check Steering` | - |
| | `Show me the project settings` | |

### Requirements and Design

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Define requirements | `Define the requirements for the authentication feature` | `musubi-requirements auth` |
| | `#sdd-requirements auth` | |
| Create design | `Design the authentication feature` | `musubi-design auth` |
| | `#sdd-design auth` | |
| Task breakdown | `List out the tasks for the authentication feature` | `musubi-tasks auth` |
| | `#sdd-tasks auth` | |

### Implementation and Development

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Implement feature | `Implement the authentication feature` | `musubi-workflow implement auth` |
| | `#sdd-implement auth` | |
| Parallel execution | `Develop the frontend and backend at the same time` | `musubi-orchestrate parallel` |
| | `Implement in parallel` | |

### Analysis and Validation

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Code analysis | `Analyze the whole project` | `musubi-analyze` |
| | `Show codebase statistics` | |
| Complexity analysis | `Analyze code complexity` | - |
| | `Find functions that need refactoring` | |
| Giant function detection | `Detect giant functions` | - |
| | `Look for functions that are too long` | |

### Quality and Validation

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Quality check | `Show the quality dashboard` | `musubi-gui start --port 3000` |
| | `Check the project quality` | |
| Constitution validation | `Validate Constitution compliance` | `musubi-validate` |
| | `Check whether there are any rule violations` | |
| Trace check | `Check traceability` | `musubi-trace` |
| | `Show the trace from requirements to implementation` | |

### Security

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Input validation | `Validate the input` | - |
| | `Run a security check` | |
| Dangerous pattern detection | `Detect dangerous patterns in C code` | - |
| | `Prepare for the Rust migration` | |

### Other

| What you want to do | Natural-language command | Corresponding CLI command |
|-------------|-----------------|----------------|
| Gap analysis | `Find gaps between the spec and the implementation` | `musubi-gaps` |
| Change management | `Show the change history` | `musubi-change` |
| Onboarding | `Tell me about the project overview` | `musubi-onboard` |

---

:::note warn
**Tip: Tricks for natural-language commands**
- Include a specific feature name (e.g., "the authentication feature...", "the login screen...")
- End with a verb (e.g., "do ...", "create ...", "check ...")
- When in doubt, "help me with ..." or "tell me about ..." works fine
:::



