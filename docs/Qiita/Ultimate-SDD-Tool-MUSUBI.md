# Ultimate SDD Tool "MUSUBI" - The Ultimate Specification Driven Development Tool with 7 AI Agents Supported and 25 Skills

> **MUSUBI v2.1.1** - A comprehensive SDD framework that connects specifications, design, and code
>
> 🆕 New in v2.0: Gain project-wide code understanding with [CodeGraph MCP integration](https://qiita.com/hisaho/items/719210ccc20fe2514054)!

## Introduction

One of the biggest challenges in software development is **maintaining consistency from requirements through implementation, testing, and deployment**. AI coding assistants have increased development speed, but quality problems occur frequently because of ambiguous specifications and a lack of traceability.

This article introduces **MUSUBI**, the ultimate tool for thoroughly supporting Specification Driven Development. MUSUBI started as spec-copilot (19 agents), went through MUSUHI (20 agents), and has evolved into **its final form: support for 7 AI coding agents and 25 specialized skills**.

**The v2.0 innovation**: Through integration with the CodeGraph MCP Server, AI agents have evolved from "file-level assistance" to "assistance that understands the whole project."

## What Is MUSUBI?

**MUSUBI** (musubi - "connection/binding") is a comprehensive SDD (Specification Driven Development) framework that connects specifications, design, and code.

### Key Features


- 🤖 **Multi-Agent Support**
   - Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf
   - Works with 7 major AI agents
- 🎯 **25 Specialized Agents (All Platforms Supported)**
   - Orchestration, requirements, architecture, development, quality, security, infrastructure
   - Claude Code: Skills API; other 6 agents: AGENTS.md
   - Complete SDD workflow coverage
- 📄 **Flexible Command Formats**
   - Markdown format (6 agents)
   - TOML format (Gemini CLI only)
   - AGENTS.md format (OpenAI specification compliant)
- 📋 **Constitutional Governance**
   - 9 immutable articles
   - Quality assurance through Phase -1 Gates
- 📝 **EARS Requirements Format**
   - Unambiguous, testable requirements
   - Complete traceability
- 🧭 **Auto-Updating Project Memory**
   - The steering system updates automatically
   - Maintains architecture, tech stack, and product context


## Evolution: spec-copilot → MUSUHI → MUSUBI

### Generation 1: spec-copilot (19 agents)

**spec-copilot** (a "copilot that supports specification driven development" - meaning an AI pair programmer that supports specification driven development) was born as a group of 19 specialized AI agents for GitHub Copilot.

**Features**:
- ✅ Specialized agents (19 types)
- ✅ Structured dialogue flow (one question at a time)
- ✅ Practical code examples and best practices
- ✅ File output support
- ❌ **Single-agent support** (GitHub Copilot only)
- ❌ **No project memory**
- ❌ **No standardized requirements format**

### Generation 2: MUSUHI (20 agents)

**MUSUHI** ("musuhi (creative spirit)" - an old Japanese word and Shinto concept meaning **"binding" and "the power to generate"**. It expresses the power to generate implementation from specifications) extended spec-copilot and introduced multi-agent support and a project memory system.

**Added features**:
- ✅ **Multi-platform support** (Claude Code, GitHub Copilot, Cursor, Windsurf, Gemini, Codex, Qwen)
- ✅ **Project memory (Steering system)**
  - `steering/structure.md` - Architecture patterns
  - `steering/tech.md` - Technology stack
  - `steering/product.md` - Business context
- ✅ **EARS requirements format support**
- ✅ **Automatic context awareness** (all agents automatically reference steering)
- ✅ **Bilingual documentation** (English and Japanese)
- ❌ **No Claude Code-specific features**
- ❌ **No constitutional governance**

### Generation 3: MUSUBI (25 Skills + Full SDD Support)

**MUSUBI** ("musubi (binding)" - expressing its essential role of connecting specifications, design, and code) is the ultimate form built on MUSUHI, integrating the features of 6 major SDD frameworks.

**Innovative features**:
- ✅ **25 specialized agents (all 7 platforms supported)**
  - Claude Code: Skills API (25 skills)
  - GitHub Copilot & Cursor: AGENTS.md (official support)
  - Other 4 agents: AGENTS.md (compatible format)
- ✅ **Constitutional governance** (9 immutable articles)
- ✅ **Phase -1 Gates** (pre-checks for quality assurance)
- ✅ **Delta Specs** (brownfield support)
- ✅ **Complete traceability** (requirements → design → code → tests)
- ✅ **8-stage SDD workflow** (from research to monitoring)
- ✅ **Automatic steering updates** (updated automatically after agent work)

## The 6 SDD Frameworks Integrated into MUSUBI

MUSUBI integrates the best features of the following 6 major frameworks.

### 1. **musuhi** - Steering System, EARS Format

- 📌 **Adopted features**: 20-agent system, project memory (Steering), EARS requirements format
- 🎯 **Enhancements in MUSUBI**: Expanded to 25 skills, automatic steering updates

### 2. **OpenSpec** - Delta Specs, Brownfield Support

- 📌 **Adopted features**: Delta Specs (ADDED/MODIFIED/REMOVED), change impact analysis
- 🎯 **Enhancements in MUSUBI**: change-impact-analyzer skill, traceability matrix

### 3. **ag2 (AutoGen)** - Multi-Agent Orchestration

- 📌 **Adopted features**: Multi-agent coordination, task breakdown, dependency management
- 🎯 **Enhancements in MUSUBI**: Orchestrator skill, automatic coordination among the 25 skills

### 4. **ai-dev-tasks** - Simplicity, Incremental Complexity

- 📌 **Adopted features**: Minimum 3-project rule, incremental feature addition
- 🎯 **Enhancements in MUSUBI**: Constitutional Article VII (Simplicity Gate)

### 5. **cc-sdd** - Multi-Agent Support, Validation Gates

- 📌 **Adopted features**: Agent registry, dynamic CLI flag generation, validation framework
- 🎯 **Enhancements in MUSUBI**: 7-agent support, constitutional validation

### 6. **spec-kit** - Constitutional Governance, Test-First

- 📌 **Adopted features**: Constitutional Articles, Phase -1 Gates, Test-First imperative
- 🎯 **Enhancements in MUSUBI**: 9 complete Constitutional Articles, constitution-enforcer skill

## MUSUBI's 9 Constitutional Articles

MUSUBI enforces **9 immutable Constitutional Articles** to guarantee quality.

### Article I: Library-First Principle

```
Every feature starts as a library in the lib/ directory.
Enforces framework-independent core logic.
```

**Validation**:
- ✅ Core implementation exists in `lib/{{feature-name}}/`
- ✅ No framework dependencies (verified with `grep -r "from 'next"`)
- ✅ Clean public API

### Article II: CLI Interface Mandate

```
Every library exposes lib/{{feature}}/cli.ts.
Enforces execution from the command line.
```

**Validation**:
- ✅ `lib/{{feature}}/cli.ts` exists
- ✅ Main functionality can be run via the CLI
- ✅ Help text is complete

### Article III: Test-First Imperative

```
Write tests before code (RED-GREEN-BLUE).
80% or higher coverage required.
```

**Validation**:
- ✅ A test file exists for every module
- ✅ Coverage >= 80%
- ✅ RED-GREEN-BLUE pattern followed (verified in git history)

### Article IV: EARS Requirements Format

```
All requirements use EARS patterns.
Eliminates ambiguity and enforces testable requirements.
```

**EARS patterns**:
```markdown
WHEN the user provides valid credentials,
THEN the system SHALL authenticate the user
AND the system SHALL create a session.
```

**Validation**:
- ✅ All requirements use EARS keywords (WHEN, SHALL, IF, THEN)
- ✅ No ambiguity
- ✅ Each requirement is testable

### Article V: Traceability Mandate

```
100% traceability from requirements → design → code → tests is required.
Every requirement is traceable to its implementation and tests.
```

**Traceability matrix example**:
| Requirement ID | Design | Implementation | Test | Status |
|--------|------|------|--------|-----------|
| REQ-AUTH-001 | Section 7 | AuthService.register() | auth-service.test.ts:L25 | ✅ |
| REQ-AUTH-002 | Section 7 | PasswordValidator.validate() | password-validator.test.ts:L15 | ✅ |

### Article VI: Project Memory

```
Every skill consults steering before making decisions.
Enforces a consistent architecture and tech stack.
```

**Steering files**:
- `steering/structure.md` - Architecture patterns
- `steering/tech.md` - Technology stack
- `steering/product.md` - Business context

### Article VII: Simplicity Gate

```
Start with at most 3 libraries.
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
Enforces minimal mocking.
```

**Validation**:
- ✅ Use a test database (real PostgreSQL)
- ✅ Minimal number of mocks
- ✅ Integration tests exist

## All-Platform Support: 25 Specialized Agents

MUSUBI's biggest feature is **25 specialized agents available on all 7 AI coding agents**.

### Implementation Formats

- **Claude Code**: Skills API (the model invokes them automatically)
- **GitHub Copilot**: `.github/AGENTS.md` (official support)
- **Cursor**: `.cursor/AGENTS.md` (official support)
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

### Documentation and Specialty (2 skills)

24. **technical-writer** - Technical documentation, API documentation
25. **ai-ml-engineer** - ML model development, MLOps

## 8-Stage SDD Workflow

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
- ✅ A dedicated skill
- ✅ Quality gates
- ✅ Traceability requirements
- ✅ Constitutional validation

## Real-World Usage Examples

### What Are Project Types?

MUSUBI supports two different project types.

#### Greenfield Projects (0→1)

This is the scenario of **launching a new project from nothing**.

- **Meaning of 0→1**: Building the first product (1) from zero (nothing)
- **Characteristics**:
  - No existing codebase
  - Freedom in architecture design
  - Free choice of tech stack
  - No legacy code constraints
- **Examples**: MVP development for a new startup, launching a new service, POC (proof of concept) projects

#### Brownfield Projects (1→n)

This is the scenario of **adding new features to, or modifying, an existing project**.

- **Meaning of 1→n**: Evolving from 1 (the existing product) to n (the improved/extended version)
- **Characteristics**:
  - Existing codebase
  - Legacy code must be taken into account
  - Constraints from the existing architecture
  - Change impact analysis is important
  - Incremental migration is required
- **Examples**: Adding new features to an existing service, refactoring, paying down technical debt, security hardening

MUSUBI provides a **complete SDD workflow** in both scenarios. In brownfield projects in particular, **Delta Specs**, adopted from OpenSpec, let you evolve safely while minimizing the impact of changes.

---

### Usage Example for Greenfield Projects (0→1)

```bash
# 1. Initialize (for any agent)
musubi-sdd init --claude      # Claude Code (Skills API)
musubi-sdd init --copilot     # GitHub Copilot (AGENTS.md)
musubi-sdd init --cursor      # Cursor (AGENTS.md)
# Others: --gemini, --windsurf, --codex, --qwen

# 2. Generate project memory
# Claude Code: /sdd-steering
# GitHub Copilot/Cursor: reference with @steering or in natural language

# 3. Create requirements (EARS format)
# Claude Code: /sdd-requirements user-authentication
# Others: reference @requirements-analyst and converse

# 4. Architecture design
# Claude Code: /sdd-design user-authentication
# Others: reference @system-architect and converse

# 5-7. Use the agents in the same way from here on
```

### Brownfield Projects (1→n)

```bash
# 1. Initialize in an existing codebase
musubi-sdd init --claude

# 2. Generate steering from the existing code
/sdd-steering

# 3. Create a change proposal (Delta Specs)
/sdd-change-init add-2fa

# 4. Impact analysis (the change-impact-analyzer skill is invoked automatically)
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
| **Traceability** | Manual | Auto-reference | **Auto-audit** | Manual | Manual | Manual |
| **SDD workflow** | 6 stages | 8 stages | **8 stages (complete)** | 4 stages | 3 stages | 5 stages |
| **Skills API support** | ❌ | ❌ | ✅ (**Claude Code**) | ❌ | ❌ | ❌ |
| **AGENTS.md support** | ❌ | ❌ | ✅ (**6 agents**) | ❌ | ❌ | ❌ |
| **Bilingual** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

### MUSUBI's Advantages

#### 1. **The Most Comprehensive Agent Set (25 Agents x 7 Platforms)**

- ✅ The largest number of agents, surpassing spec-copilot (19) and MUSUHI (20)
- ✅ **25 agents available on all 7 platforms** (an industry first)
- ✅ 100% coverage of all SDD stages (research → monitoring)
- ✅ Hybrid support for the Claude Code Skills API + AGENTS.md (OpenAI specification compliant)

#### 2. **The Only Complete Constitutional Governance**

- ✅ 9 immutable articles (spec-kit has only 3 articles)
- ✅ Automatic validation via the constitution-enforcer skill
- ✅ Phase -1 Gates (quality checks before implementation)

#### 3. **The Strongest Traceability**

- ✅ Independent verification via the traceability-auditor skill
- ✅ 100% tracking of requirements ↔ design ↔ code ↔ tests
- ✅ Integration of OpenSpec's Delta Specs

#### 4. **The Broadest Multi-Platform Support**

- ✅ Supports 7 AI agents (the most)
- ✅ Dedicated TOML format support for Gemini CLI
- ✅ Agent registry pattern (adopted from cc-sdd)

#### 5. **Auto-Updating Project Memory**

- ✅ Extends MUSUHI's steering system
- ✅ Updates automatically after skill execution
- ✅ Always maintains up-to-date project context

#### 6. **Complete Brownfield Support**

- ✅ change-impact-analyzer skill (integrates OpenSpec's functionality)
- ✅ Automatic detection of ADDED/MODIFIED/REMOVED
- ✅ Seamless adoption in existing projects

## 🚀 New in v2.0: CodeGraph MCP Integration

With MUSUBI v2.0, integration with the [CodeGraph MCP Server](https://qiita.com/hisaho/items/b99ac51d78119ef60b6b) lets AI agents understand the "code structure of the entire project."

### Previous Challenges → Solved in v2.0

| Challenge | Before (v1.x) | After (v2.0 + CodeGraph) |
|------|---------------|--------------------------|
| Codebase understanding | File-level | Graph structure of the whole project |
| Function impact investigation | Manual grep (risk of omissions) | Complete list via `find_callers` |
| Refactoring planning | Relies on experience and intuition | Objective analysis via `analyze_module_structure` |
| Understanding dependencies | Eyeballing import statements | Deep dependencies detected via `find_dependencies` |
| Security investigation | Pattern matching only | Complete tracing of input paths |

### Main Features of CodeGraph MCP

```
# Code graph operations
init_graph          - Initialize graph
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
community                 - Community (module boundary) detection
```

### Integration with MUSUBI Agents

| Agent | CodeGraph Usage | Effect |
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
# Install globally from the ITG fork
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
musubi init
```

### Per-Agent Installation

```bash
# Claude Code - 25 Skills API
musubi-sdd init --claude

# GitHub Copilot - 25 agents (AGENTS.md, official support)
musubi-sdd init --copilot

# Cursor IDE - 25 agents (AGENTS.md, official support)
musubi-sdd init --cursor

# Gemini CLI - 25 agents (GEMINI.md integration) + TOML format
musubi-sdd init --gemini

# Windsurf IDE - 25 agents (AGENTS.md)
musubi-sdd init --windsurf

# Codex CLI - 25 agents (AGENTS.md)
musubi-sdd init --codex

# Qwen Code - 25 agents (AGENTS.md)
musubi-sdd init --qwen
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

**MUSUBI** is the **ultimate Specification Driven Development** tool, which evolved from spec-copilot (19 agents) through MUSUHI (20 agents).

### Why Choose MUSUBI

1. ✅ **Most comprehensive**: 25 agents x 7 platforms, 8-stage workflow, 9 Constitutional Articles
2. ✅ **Most flexible**: Supports all 7 AI agents, Skills API + AGENTS.md
3. ✅ **Most robust**: Constitutional governance, complete traceability, automatic validation
4. ✅ **Most practical**: Supports both greenfield and brownfield
5. ✅ **Most advanced**: Claude Code Skills API, OpenAI AGENTS.md specification compliance, automatic steering updates
6. ✅ **Industry first**: Fully equal support for 25 agents on all 7 platforms

### Taking the Best of the 6 Frameworks

- **musuhi** → Steering, EARS format
- **OpenSpec** → Delta Specs, change management
- **ag2** → Orchestration
- **ai-dev-tasks** → Simplicity
- **cc-sdd** → Multi-agent
- **spec-kit** → Constitutional governance

### Get Started Now

```bash
# Choose your AI agent
musubi-sdd init --claude     # Claude Code (Skills API)
musubi-sdd init --copilot    # GitHub Copilot (AGENTS.md)
musubi-sdd init --cursor     # Cursor (AGENTS.md)
# Others: --gemini, --windsurf, --codex, --qwen

# All 25 specialized agents are available with any agent!
# Your ultimate SDD experience begins 🚀
```

## Resources

- 📦 **Source**: [ITG fork](https://github.com/Improve-To-Grow/MUSUBI/tree/ITG-adjustments) (v2.1.1)
- 📚 **GitHub**: [nahisaho/musubi](https://github.com/nahisaho/MUSUBI)
- 🎯 **Blueprint**: [Ultimate-SDD-Tool-Blueprint-v3-25-Skills.md](https://github.com/nahisaho/MUSUBI/blob/main/Ultimate-SDD-Tool-Blueprint-v3-25-Skills.md)
- 📊 **Framework comparison**: See the comparison table in this article

---

**MUSUBI** - musubi - connecting specifications, design, and code.

> 🌟 This project is open source under the MIT license.
> Stars ⭐ and contributions are welcome!

#SDD #SpecificationDrivenDevelopment #AI #ClaudeCode #GitHubCopilot #Cursor #DevTools #SpecDrivenDevelopment
