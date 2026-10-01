# Ultimate SDD Tool "MUSUBI" - The Ultimate Specification Driven Development Tool with Support for 7 AI Agents and 25 Skills

> **MUSUBI v2.1.1** - A comprehensive SDD framework that ties together specifications, design, and code
>
> 🆕 New in v2.0: Gain project-wide code understanding with [CodeGraph MCP integration](https://qiita.com/hisaho/items/719210ccc20fe2514054)!

## Introduction

One of the biggest challenges in software development is **maintaining consistency from requirements through implementation, testing, and deployment**. AI coding assistants have increased development speed, but ambiguous specifications and a lack of traceability frequently cause quality problems.

In this article, I introduce **MUSUBI**, the ultimate tool for thoroughly supporting Specification Driven Development. MUSUBI started as spec-copilot (19 agents), went through MUSUHI (20 agents), and has evolved into its **final form, supporting 7 AI coding agents and equipped with 25 specialized skills**.

**The v2.0 innovation**: Through integration with CodeGraph MCP Server, AI agents have evolved from "file-level assistance" to "assistance that understands the entire project."

## What Is MUSUBI?

**MUSUBI** (むすび - "結び", meaning "tying together") is a comprehensive SDD (Specification Driven Development) framework that ties together specifications, design, and code.

### Key Features


- 🤖 **Multi-agent support**
   - Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf
   - Works with 7 major AI agents
- 🎯 **25 specialized agents (supported on all platforms)**
   - Orchestration, requirements, architecture, development, quality, security, infrastructure
   - Claude Code: Skills API; the other 6 agents: AGENTS.md
   - Complete SDD workflow coverage
- 📄 **Flexible command formats**
   - Markdown format (6 agents)
   - TOML format (Gemini CLI only)
   - AGENTS.md format (compliant with the OpenAI specification)
- 📋 **Constitutional governance**
   - 9 immutable articles
   - Quality assurance through Phase -1 Gates
- 📝 **EARS requirements format**
   - Unambiguous, testable requirements
   - Complete traceability
- 🧭 **Auto-updating project memory**
   - The steering system updates automatically
   - Maintains architecture, technology stack, and product context


## History of the Evolution: spec-copilot → MUSUHI → MUSUBI

### Generation 1: spec-copilot (19 agents)

**spec-copilot** ("a copilot that supports specification driven development" - meaning an AI pair programmer for specification-driven development) was born as a set of 19 specialized AI agents for GitHub Copilot.

**Features**:
- ✅ Specialized agents (19 types)
- ✅ Structured dialogue flow (one question, one answer)
- ✅ Practical code examples and best practices
- ✅ File output support
- ❌ **Single-agent support** (GitHub Copilot only)
- ❌ **No project memory**
- ❌ **No standardized requirements format**

### Generation 2: MUSUHI (20 agents)

**MUSUHI** ("むすひ (産霊)" - an archaic Japanese word and Shinto concept meaning **"binding" or "the power to create"**, expressing the power to create implementations from specifications) extended spec-copilot and introduced multi-agent support and a project memory system.

**Added features**:
- ✅ **Multi-platform support** (Claude Code, GitHub Copilot, Cursor, Windsurf, Gemini, Codex, Qwen)
- ✅ **Project memory (Steering system)**
  - `steering/structure.md` - Architecture patterns
  - `steering/tech.md` - Technology stack
  - `steering/product.md` - Business context
- ✅ **Support for the EARS requirements format**
- ✅ **Automatic context awareness** (all agents automatically refer to steering)
- ✅ **Bilingual documentation** (English and Japanese)
- ❌ **No Claude Code-specific features**
- ❌ **No constitutional governance**

### Generation 3: MUSUBI (25 skills + full SDD support)

**MUSUBI** ("むすび (結び)" - expressing its essential role of tying together specifications, design, and code) is the ultimate form, built on MUSUHI and integrating features from 6 major SDD frameworks.

**Innovative features**:
- ✅ **25 specialized agents (supported on all 7 platforms)**
  - Claude Code: Skills API (25 skills)
  - GitHub Copilot & Cursor: AGENTS.md (officially supported)
  - The other 4 agents: AGENTS.md (compatible format)
- ✅ **Constitutional governance** (9 immutable articles)
- ✅ **Phase -1 Gates** (pre-checks for quality assurance)
- ✅ **Delta Specs** (brownfield support)
- ✅ **Complete traceability** (requirements → design → code → tests)
- ✅ **8-stage SDD workflow** (from research through monitoring)
- ✅ **Automatic steering updates** (updated automatically after agent work)

## The 6 SDD Frameworks Integrated into MUSUBI

MUSUBI integrates the best features of the following 6 major frameworks.

### 1. **musuhi** - Steering system, EARS format

- 📌 **Adopted features**: 20-agent system, project memory (Steering), EARS requirements format
- 🎯 **Enhancements in MUSUBI**: Expanded to 25 skills, automatic steering updates

### 2. **OpenSpec** - Delta specs, brownfield support

- 📌 **Adopted features**: Delta Specs (ADDED/MODIFIED/REMOVED), change impact analysis
- 🎯 **Enhancements in MUSUBI**: change-impact-analyzer skill, traceability matrix

### 3. **ag2 (AutoGen)** - Multi-agent orchestration

- 📌 **Adopted features**: Multi-agent collaboration, task decomposition, dependency management
- 🎯 **Enhancements in MUSUBI**: Orchestrator skill, automatic collaboration among 25 skills

### 4. **ai-dev-tasks** - Simplicity, incremental complexity

- 📌 **Adopted features**: Maximum-3-projects rule, incremental feature addition
- 🎯 **Enhancements in MUSUBI**: Constitutional Article VII (Simplicity Gate)

### 5. **cc-sdd** - Multi-agent support, validation gates

- 📌 **Adopted features**: Agent registry, dynamic CLI flag generation, validation framework
- 🎯 **Enhancements in MUSUBI**: Support for 7 agents, constitutional validation

### 6. **spec-kit** - Constitutional governance, test-first

- 📌 **Adopted features**: Constitutional articles, Phase -1 Gates, Test-First Imperative
- 🎯 **Enhancements in MUSUBI**: 9 complete constitutional articles, constitution-enforcer skill

## MUSUBI's 9 Constitutional Articles

MUSUBI enforces **9 immutable constitutional articles** to guarantee quality.

### Article I: Library-First Principle

```
Every feature starts as a library in the lib/ directory.
Enforces framework-independent core logic.
```

**Validation**:
- ✅ The core implementation exists in `lib/{{feature-name}}/`
- ✅ No framework dependencies (verified with `grep -r "from 'next"`)
- ✅ A clean public API

### Article II: CLI Interface Mandate

```
Every library exposes lib/{{feature}}/cli.ts.
Enforces execution from the command line.
```

**Validation**:
- ✅ `lib/{{feature}}/cli.ts` exists
- ✅ Main features can be run via the CLI
- ✅ Help text is complete

### Article III: Test-First Imperative

```
Write tests before code (RED-GREEN-BLUE).
80% or higher coverage is required.
```

**Validation**:
- ✅ Every module has a test file
- ✅ Coverage >= 80%
- ✅ RED-GREEN-BLUE pattern followed (verified via git history)

### Article IV: EARS Requirements Format

```
All requirements use EARS patterns.
Eliminates ambiguity and enforces testable requirements.
```

**EARS pattern**:
```markdown
WHEN the user provides valid credentials,
THEN the system SHALL authenticate the user
AND the system SHALL create a session.
```

**Validation**:
- ✅ All requirements use EARS keywords (WHEN, SHALL, IF, THEN)
- ✅ No ambiguity
- ✅ Every requirement is testable

### Article V: Traceability Mandate

```
100% traceability from requirements → design → code → tests is required.
Every requirement can be traced to its implementation and tests.
```

**Traceability matrix example**:
| Requirement ID | Design | Implementation | Test | Status |
|--------|------|------|--------|-----------|
| REQ-AUTH-001 | Section 7 | AuthService.register() | auth-service.test.ts:L25 | ✅ |
| REQ-AUTH-002 | Section 7 | PasswordValidator.validate() | password-validator.test.ts:L15 | ✅ |

### Article VI: Project Memory

```
Every skill consults steering before making decisions.
Enforces a consistent architecture and technology stack.
```

**Steering files**:
- `steering/structure.md` - Architecture patterns
- `steering/tech.md` - Technology stack
- `steering/product.md` - Business context

### Article VII: Simplicity Gate

```
Initially, a maximum of 3 libraries.
Enforces incremental addition of complexity.
```

### Article VIII: Anti-Abstraction Gate

```
Use framework features directly.
Prohibits unnecessary wrappers and adapters.
```

**Prohibited examples**:
- ❌ Custom ORM wrapper (use Prisma directly)
- ❌ Custom React wrapper
- ❌ Custom Next.js wrapper

### Article IX: Integration-First Testing

```
Test with real services.
Enforces minimal use of mocks.
```

**Validation**:
- ✅ Uses a test database (real PostgreSQL)
- ✅ Minimal number of mocks
- ✅ Integration tests exist

## Supported on All Platforms: 25 Specialized Agents

MUSUBI's greatest feature is its **25 specialized agents, available on all 7 AI coding agents**.

### Implementation Formats

- **Claude Code**: Skills API (invoked automatically by the model)
- **GitHub Copilot**: `.github/AGENTS.md` (officially supported)
- **Cursor**: `.cursor/AGENTS.md` (officially supported)
- **Gemini CLI**: `GEMINI.md` (integrated into the existing file)
- **Windsurf**: `.windsurf/AGENTS.md`
- **Codex**: `.codex/AGENTS.md`
- **Qwen Code**: `.qwen/AGENTS.md`

### List of 25 Agents

### Orchestration and Management (3 skills)

1. **orchestrator** - Master coordinator across the 25 skills
2. **steering** - Project memory manager (auto-updating)
3. **constitution-enforcer** - Constitutional governance validation (9 articles + Phase -1 Gates)

### Requirements and Planning (3 skills)

4. **requirements-analyst** - EARS-format requirements generation
5. **project-manager** - Project planning, scheduling, risk management
6. **change-impact-analyzer** - Brownfield change analysis (Delta Specs)

### Architecture and Design (4 skills)

7. **system-architect** - C4 model + ADR architecture design
8. **api-designer** - REST/GraphQL/gRPC API design
9. **database-schema-designer** - Database design, ER diagrams, DDL
10. **ui-ux-designer** - UI/UX design, wireframes, prototypes

### Development (1 skill)

11. **software-developer** - Multi-language code implementation (TypeScript, Python, Go, etc.)

### Quality and Review (5 skills)

12. **test-engineer** - Unit, integration, and E2E tests with EARS mapping
13. **code-reviewer** - Code review, SOLID principles
14. **bug-hunter** - Bug investigation, root cause analysis
15. **quality-assurance** - QA strategy, test planning
16. **traceability-auditor** - Requirements ↔ code ↔ test coverage validation

### Security and Performance (2 skills)

17. **security-auditor** - OWASP Top 10, vulnerability detection
18. **performance-optimizer** - Performance analysis, optimization

### Infrastructure and Operations (5 skills)

19. **devops-engineer** - CI/CD pipelines, Docker/Kubernetes
20. **cloud-architect** - AWS/Azure/GCP, IaC (Terraform/Bicep)
21. **database-administrator** - Database operations, tuning
22. **site-reliability-engineer** - Production monitoring, SLO/SLI, incident response
23. **release-coordinator** - Multi-component release management

### Documentation and Specialized (2 skills)

24. **technical-writer** - Technical documentation, API documentation
25. **ai-ml-engineer** - ML model development, MLOps

## The 8-Stage SDD Workflow

MUSUBI supports a complete 8-stage workflow.

```
1. Research
   ↓
2. Requirements - EARS format
   ↓
3. Design - C4 model + ADR
   ↓
4. Tasks - Requirements coverage matrix
   ↓
5. Implementation - RED-GREEN-BLUE
   ↓
6. Testing - Integration tests first
   ↓
7. Deployment - CI/CD automation
   ↓
8. Monitoring - SLO/SLI, observability
```

Each stage has:
- ✅ Dedicated skills
- ✅ Quality gates
- ✅ Traceability requirements
- ✅ Constitutional validation

## Real-World Usage Examples

### What Are Project Types?

MUSUBI supports two different project types.

#### Greenfield Projects (0→1)

A scenario where you **launch a new project from scratch**.

- **Meaning of 0→1**: Creating 1 (the first product) from zero (nothing)
- **Characteristics**:
  - No existing codebase
  - Freedom to design the architecture
  - Free choice of technology stack
  - No constraints from legacy code
- **Examples**: MVP development for a new startup, launching a new service, POC (proof of concept) projects

#### Brownfield Projects (1→n)

A scenario where you **add new features to or modify an existing project**.

- **Meaning of 1→n**: Evolving from 1 (an existing product) to n (an improved, extended version)
- **Characteristics**:
  - An existing codebase
  - Legacy code must be taken into account
  - Constraints from the existing architecture
  - Change impact analysis is important
  - Incremental migration is required
- **Examples**: Adding new features to an existing service, refactoring, paying down technical debt, strengthening security

MUSUBI provides a **complete SDD workflow** for both scenarios. For brownfield projects in particular, **Delta Specs**, adopted from OpenSpec, allow you to evolve the system safely while minimizing the impact of changes.

---

### Greenfield Project (0→1) Example

```bash
# 1. Initialize (for any agent)
npx musubi-sdd init --claude      # Claude Code (Skills API)
npx musubi-sdd init --copilot     # GitHub Copilot (AGENTS.md)
npx musubi-sdd init --cursor      # Cursor (AGENTS.md)
# Others: --gemini, --windsurf, --codex, --qwen

# 2. Generate project memory
# Claude Code: /sdd-steering
# GitHub Copilot/Cursor: @steering or refer to it in natural language

# 3. Create requirements (EARS format)
# Claude Code: /sdd-requirements user-authentication
# Others: interact by referring to @requirements-analyst

# 4. Architecture design
# Claude Code: /sdd-design user-authentication
# Others: interact by referring to @system-architect

# 5-7. Use the agents in the same way for the remaining steps
```

### Brownfield Project (1→n)

```bash
# 1. Initialize in the existing codebase
npx musubi-sdd init --claude

# 2. Generate steering from existing code
/sdd-steering

# 3. Create a change proposal (Delta Specs)
/sdd-change-init add-2fa

# 4. Impact analysis (change-impact-analyzer skill starts automatically)
# → Automatically detects ADDED/MODIFIED/REMOVED requirements

# 5. Implement the change
/sdd-change-apply add-2fa

# 6. Archive the change
/sdd-change-archive add-2fa
```

## Comparison with Other SDD Tools

### Feature Comparison Table

| Feature | spec-copilot | MUSUHI | MUSUBI | cc-sdd | OpenSpec | spec-kit |
|------|--------------|--------|--------|--------|----------|----------|
| **Number of agents** | 19 | 20 | **25 agents** | 10 | 5 | 8 |
| **Multi-platform** | ❌ (Copilot only) | ✅ (7 agents) | ✅ (**7 agents**) | ✅ (5 agents) | ❌ | ❌ |
| **All 25 agents supported** | ❌ | ❌ | ✅ (**all 7 platforms**) | ❌ | ❌ | ❌ |
| **Project memory** | ❌ | ✅ | ✅ (**auto-updating**) | ❌ | ❌ | ❌ |
| **EARS requirements format** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Constitutional governance** | ❌ | ❌ | ✅ (**9 articles**) | ❌ | ❌ | ✅ (basic) |
| **Delta Specs** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **Traceability** | Manual | Automatic reference | **Automatic audit** | Manual | Manual | Manual |
| **SDD workflow** | 6 stages | 8 stages | **8 stages (complete)** | 4 stages | 3 stages | 5 stages |
| **Skills API support** | ❌ | ❌ | ✅ (**Claude Code**) | ❌ | ❌ | ❌ |
| **AGENTS.md support** | ❌ | ❌ | ✅ (**6 agents**) | ❌ | ❌ | ❌ |
| **Bilingual** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### MUSUBI's Advantages

#### 1. **The Most Comprehensive Agent Set (25 agents × 7 platforms)**

- ✅ The largest number of agents, surpassing spec-copilot (19) and MUSUHI (20)
- ✅ **All 25 agents available on all 7 platforms** (an industry first)
- ✅ 100% coverage of all SDD stages (research → monitoring)
- ✅ Hybrid support for Claude Code Skills API + AGENTS.md (compliant with the OpenAI specification)

#### 2. **The Only Complete Constitutional Governance**

- ✅ 9 immutable articles (spec-kit has only 3)
- ✅ Automatic validation via the constitution-enforcer skill
- ✅ Phase -1 Gates (quality checks before implementation)

#### 3. **The Most Powerful Traceability**

- ✅ Independent validation via the traceability-auditor skill
- ✅ 100% tracing of requirements ↔ design ↔ code ↔ tests
- ✅ Integration of OpenSpec's Delta Specs

#### 4. **The Broadest Multi-Platform Support**

- ✅ Support for 7 AI agents (the most)
- ✅ Support for Gemini CLI-specific TOML format
- ✅ Agent registry pattern (adopted from cc-sdd)

#### 5. **Auto-Updating Project Memory**

- ✅ Extends MUSUHI's steering system
- ✅ Updated automatically after skill execution
- ✅ Always maintains up-to-date project context

#### 6. **Full Brownfield Support**

- ✅ change-impact-analyzer skill (integrating OpenSpec's features)
- ✅ Automatic ADDED/MODIFIED/REMOVED detection
- ✅ Seamless adoption into existing projects

## 🚀 New in v2.0: CodeGraph MCP Integration

In MUSUBI v2.0, integration with [CodeGraph MCP Server](https://qiita.com/hisaho/items/b99ac51d78119ef60b6b) enables AI agents to understand "the code structure of the entire project."

### Previous Challenges → Solved in v2.0

| Challenge | Before (v1.x) | After (v2.0 + CodeGraph) |
|------|---------------|--------------------------|
| Codebase understanding | Per file | Graph structure of the entire project |
| Investigating a function's impact | Manual grep (risk of oversight) | Complete list with `find_callers` |
| Refactoring planning | Relies on experience and intuition | Objective analysis with `analyze_module_structure` |
| Understanding dependencies | Visually inspecting import statements | Detects deep dependencies with `find_dependencies` |
| Security investigation | Pattern matching only | Complete tracing of input paths |

### Main Features of CodeGraph MCP

```
# Code graph operations
init_graph          - Initialize the graph
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
community                 - Community (module boundary) detection
```

### Integration with MUSUBI Agents

| Agent | CodeGraph Usage | Benefit |
|-------------|---------------|------|
| Orchestrator | `global_search`, `stats` | Understanding the whole project |
| System Architect | `analyze_module_structure` | Architecture visualization |
| Change Impact Analyzer | `find_callers`, `find_dependencies` | Complete impact analysis |
| Security Auditor | `query_codebase`, `find_callers` | Tracing input paths of vulnerabilities |
| Code Reviewer | `suggest_refactoring` | Objective improvement suggestions |

### Setup

```bash
# Just ask the Orchestrator
@orchestrator Please set up CodeGraph MCP
```

For details, see the [MUSUBI × CodeGraph MCP Server Integration Guide](https://qiita.com/hisaho/items/719210ccc20fe2514054).

## Installation and Getting Started

### Installation

```bash
# Via npx (recommended)
npx musubi-sdd init

# Or a global install
npm install -g musubi-sdd
musubi init
```

### Installation by Agent

```bash
# Claude Code - 25 Skills API
npx musubi-sdd init --claude

# GitHub Copilot - 25 agents (AGENTS.md, officially supported)
npx musubi-sdd init --copilot

# Cursor IDE - 25 agents (AGENTS.md, officially supported)
npx musubi-sdd init --cursor

# Gemini CLI - 25 agents (integrated into GEMINI.md) + TOML format
npx musubi-sdd init --gemini

# Windsurf IDE - 25 agents (AGENTS.md)
npx musubi-sdd init --windsurf

# Codex CLI - 25 agents (AGENTS.md)
npx musubi-sdd init --codex

# Qwen Code - 25 agents (AGENTS.md)
npx musubi-sdd init --qwen
```

### CLI Commands

```bash
# Check project status
musubi status

# Validate constitutional compliance
musubi validate

# Show detailed information
musubi info
```

## Summary

**MUSUBI** is the **ultimate Specification Driven Development** tool, evolved from spec-copilot (19 agents) through MUSUHI (20 agents).

### Why You Should Choose MUSUBI

1. ✅ **The most comprehensive**: 25 agents × 7 platforms, an 8-stage workflow, 9 constitutional articles
2. ✅ **The most flexible**: Supports all 7 AI agents, Skills API + AGENTS.md
3. ✅ **The most robust**: Constitutional governance, complete traceability, automatic validation
4. ✅ **The most practical**: Supports both greenfield and brownfield projects
5. ✅ **The most advanced**: Claude Code Skills API, compliant with the OpenAI AGENTS.md specification, automatic steering updates
6. ✅ **An industry first**: Fully equal support for 25 agents on all 7 platforms

### The Best of 6 Frameworks

- **musuhi** → Steering, EARS format
- **OpenSpec** → Delta Specs, change management
- **ag2** → Orchestration
- **ai-dev-tasks** → Simplicity
- **cc-sdd** → Multi-agent
- **spec-kit** → Constitutional governance

### Get Started Now

```bash
# Choose your AI agent
npx musubi-sdd init --claude     # Claude Code (Skills API)
npx musubi-sdd init --copilot    # GitHub Copilot (AGENTS.md)
npx musubi-sdd init --cursor     # Cursor (AGENTS.md)
# Others: --gemini, --windsurf, --codex, --qwen

# 25 specialized agents are available with any agent!
# Your ultimate SDD experience begins 🚀
```

## Resources

- 📦 **npm**: [musubi-sdd](https://www.npmjs.com/package/musubi-sdd) (v2.1.1)
- 📚 **GitHub**: [nahisaho/musubi](https://github.com/nahisaho/MUSUBI)
- 🎯 **Blueprint**: [Ultimate-SDD-Tool-Blueprint-v3-25-Skills.md](https://github.com/nahisaho/MUSUBI/blob/main/Ultimate-SDD-Tool-Blueprint-v3-25-Skills.md)
- 📊 **Framework comparison**: See the comparison table in this article

---

**MUSUBI** - むすび (musubi) - Tying together specifications, design, and code.

> 🌟 This project is open source under the MIT License.
> Stars ⭐ and contributions are welcome!

#SDD #SpecificationDrivenDevelopment #AI #ClaudeCode #GitHubCopilot #Cursor #DevTools #SpecDrivenDevelopment
