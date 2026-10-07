<div align="center">

# 🎋 MUSUBI

**Ultimate Specification Driven Development Tool**

[![CI](https://github.com/Improve-To-Grow/MUSUBI/actions/workflows/ci.yml/badge.svg?branch=ITG-adjustments)](https://github.com/Improve-To-Grow/MUSUBI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[Documentation](docs/) | [Changelog](CHANGELOG.md) | [Upstream project](https://github.com/nahisaho/MUSUBI)

</div>

> [!IMPORTANT]
> **This is the Improve To Grow (ITG) fork of MUSUBI.** It is installed globally from this repository, never from the npm registry: the `musubi-sdd` package on npm is the upstream version without our changes.
>
> ```bash
> npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
> ```
>
> - Always run the installed commands directly (`musubi-sdd init`, `musubi-validate …`). Never use `npx`: it downloads the upstream package when MUSUBI is not installed.
> - To update, run the same install command again. Do not run `npm update -g`; it cannot update a GitHub install.
> - Check what you have with `npm ls -g @improve-to-grow/musubi-sdd` and `musubi-sdd --version` (fork versions end in `-itg.N`).

---

> 🤖 **7 AI Coding Agents** × 📋 **31 Specialized Skills** × ⚖️ **Constitutional Governance**

MUSUBI (musubi - "connection/binding") is a comprehensive **Specification Driven Development (SDD)** framework that synthesizes the best features from 6 leading frameworks into a production-ready tool for multiple AI coding agents.

<div align="center">

![MUSUBI Demo](docs/assets/demo.svg)

</div>

## ✨ Why MUSUBI?

| Challenge                 | MUSUBI Solution                                |
| ------------------------- | ---------------------------------------------- |
| 🔀 Fragmented AI tools    | **7 agents, 1 unified workflow**               |
| 📝 Ambiguous requirements | **EARS format with 5 patterns**                |
| 🔍 Lost traceability      | **100% Req→Design→Code→Test mapping**          |
| ⚠️ Quality inconsistency  | **9 Constitutional Articles + Phase -1 Gates** |
| 🔄 Brownfield challenges  | **Delta specs + Change management**            |

## 🚀 Quick Start

```bash
# Install (once per machine) and initialize in 30 seconds
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
musubi-sdd init

# For existing projects - auto-analyze and generate steering docs
musubi-sdd onboard

# That's it! Now use your AI agent with SDD commands:
# Claude Code: /sdd-requirements, /sdd-design, /sdd-implement
# GitHub Copilot: #sdd-requirements, #sdd-design, #sdd-implement
```

<details>
<summary>📦 More installation options</summary>

```bash
# Initialize for specific AI agent
musubi init --copilot   # GitHub Copilot
musubi init --cursor    # Cursor IDE
musubi init --gemini    # Gemini CLI
musubi init --codex     # Codex CLI
musubi init --qwen      # Qwen Code
musubi init --windsurf  # Windsurf IDE
```

</details>

---

## 📊 What's New

Release notes are kept in one place: **[CHANGELOG.md](CHANGELOG.md)**. This README links to it instead of repeating it.

- Latest release: [6.3.0 - SDD Document Path Unification](CHANGELOG.md#630---2026-01-02)
- In progress: [Unreleased](CHANGELOG.md#unreleased)

---

## Features

- 🤖 **Multi-Agent Support** - Works with 7 AI coding agents (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf)
- 🧠 **Dynamic Replanning** - AI agents dynamically adjust plans on failure with LLM-powered alternatives (v3.6.0+)
- 🔌 **MCP Server Integration** - CodeGraphMCPServer for advanced code analysis (v2.0.0)
- 📄 **Flexible Command Formats** - Supports Markdown, TOML, and AGENTS.md formats
- 🎯 **27 Specialized Skills (All Platforms)** - 25 platform agents + 5 orchestrator built-in skills (v5.9.0)
  - Claude Code: Skills API (25 skills + 5 built-in)
  - GitHub Copilot & Cursor: AGENTS.md (official support)
  - Other 4 agents: AGENTS.md (compatible format)
- 📋 **Constitutional Governance** - 9 immutable articles + Phase -1 Gates for quality enforcement
- 📝 **EARS Requirements Generator** - Create unambiguous requirements with 5 EARS patterns (v0.8.0)
- 🏗️ **Design Document Generator** - Create C4 models and ADRs with traceability (v0.8.2)
- 🔄 **Change Management System** - Delta specifications for brownfield projects (v0.8.6)
- 🔍 **Gap Detection System** - Identify orphaned requirements and untested code (v0.8.7)
- 🧭 **Auto-Updating Project Memory** - Steering system maintains architecture, tech stack, and product context
- 🚀 **Automatic Onboarding** - `musubi-onboard` analyzes existing projects and generates steering docs (2-5 minutes)
- 🔄 **Auto-Sync** - `musubi-sync` detects codebase changes and keeps steering docs current
- 🔍 **Intelligent Code Analysis** - `musubi-analyze` provides quality metrics, complexity analysis, and technical debt detection
- 🤝 **Team Collaboration** - `musubi-share` enables memory sharing, import/export, and multi-platform sync (v0.6.0)
- ✅ **Constitutional Validation** - `musubi-validate` enforces 9 immutable governance articles with Phase -1 Gates (v0.7.0)
- ✅ **Complete Traceability** - Requirements → Design → Code → Tests mapping

## Supported AI Coding Agents

MUSUBI supports 7 AI coding agents, each with tailored configurations:

| Agent              | Skills API     | 27 Skills      | Command Format   | Command File Format       | Installation Directory                        |
| ------------------ | -------------- | -------------- | ---------------- | ------------------------- | --------------------------------------------- |
| **Claude Code**    | ✅ (27 skills) | ✅             | `/sdd-*`         | Markdown (.md)            | `.claude/skills/`, `.claude/commands/`        |
| **GitHub Copilot** | ❌             | ✅ (AGENTS.md) | `/sdd-*`         | Prompt File (.prompt.md)  | `.github/prompts/`, `.github/AGENTS.md`       |
| **Cursor IDE**     | ❌             | ✅ (AGENTS.md) | `/sdd-*`         | Markdown + AGENTS.md | `.cursor/commands/`, `.cursor/AGENTS.md`      |
| **Gemini CLI**     | ❌             | ✅ (GEMINI.md) | `/sdd-*`         | TOML + GEMINI.md     | `.gemini/commands/`, `GEMINI.md`              |
| **Codex CLI**      | ❌             | ✅ (AGENTS.md) | `/prompts:sdd-*` | Markdown + AGENTS.md | `.codex/prompts/`, `.codex/AGENTS.md`         |
| **Qwen Code**      | ❌             | ✅ (AGENTS.md) | `/sdd-*`         | Markdown + AGENTS.md | `.qwen/commands/`, `.qwen/AGENTS.md`          |
| **Windsurf IDE**   | ❌             | ✅ (AGENTS.md) | `/sdd-*`         | Markdown + AGENTS.md | `.windsurf/workflows/`, `.windsurf/AGENTS.md` |

**Notes**:

- Skills API is exclusive to Claude Code
- **All 7 platforms now support 27 skills** via Skills API (Claude Code) or AGENTS.md (others)
- v5.9.0 added 5 built-in orchestrator skills (release, workflow, package, constitution-level, project-config)
- **GitHub Copilot uses `.prompt.md` extension** per VS Code official documentation
- AGENTS.md: OpenAI specification, officially supported by GitHub Copilot & Cursor
- Gemini CLI uses TOML format + GEMINI.md integration

---

## Constitutional Governance

MUSUBI enforces 9 Constitutional Articles for quality assurance:

```bash
# Validate constitutional compliance
musubi-validate all
musubi-validate constitution
musubi-validate gates
musubi-validate complexity
```

**9 Articles**:

1. **Testable-Core Principle** - Feature logic lives in core modules that are tested without the UI, server or CLI; the project profile (library | cli | application) decides what a core module is
2. **Automation Interface Mandate** - Primary functionality is reachable without the UI: a CLI for library and cli projects, the HTTP API for applications
3. **Test-First Imperative** - Tests written before code (80% coverage required)
4. **EARS Requirements Format** - 5 EARS patterns for unambiguous requirements
5. **Traceability Mandate** - 100% traceability: Requirements ↔ Design ↔ Code ↔ Tests
6. **Project Memory** - Steering system maintains project context
7. **Simplicity Gate** - Maximum 3 sub-projects initially (Phase -1 Gate); files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10 (not gated)
8. **Anti-Abstraction Gate** - Use framework APIs directly (Phase -1 Gate)
9. **Integration-First Testing** - Integration tests use real services (no mocks)

**Project Profiles** (constitution v1.1): Articles I and II apply according to the profile declared as `constitution.profile` in `steering/project.yml`. Without a declared profile, `library` applies, so library projects keep the original rules.

| Profile | Core module (Article I) | Automation interface (Article II) | Default level I / II |
|---------|-------------------------|-----------------------------------|----------------------|
| `library` | Standalone library under a core path (default `lib/<feature>/` or `packages/<feature>/`) | CLI per library | critical / advisory |
| `cli` | Standalone library under a core path (default `lib/<feature>/` or `packages/<feature>/`) | CLI per library | critical / critical |
| `application` | Folder under a declared core path, e.g. `src/lib/<domain>/` | HTTP API (route handlers); no CLI required | advisory / advisory |

`constitution.levels` in `steering/project.yml` overrides the default level per article.

**Phase -1 Gates**: Pre-implementation validation checkpoints for Articles VII & VIII. See:

- [steering/rules/constitution.md](steering/rules/constitution.md) - Full constitutional text
- [steering/rules/phase-gates.md](steering/rules/phase-gates.md) - Approval process and active gates
- All other agents use Markdown format + AGENTS.md

## Quick Start

### Installation

```bash
# Install globally from the ITG fork (once per machine; rerun to update)
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'

# Initialize MUSUBI for your preferred agent

# Claude Code (default) - 27 Skills (25 + 5 built-in)
musubi-sdd init
musubi-sdd init --claude

# GitHub Copilot - 27 skills (AGENTS.md, official support)
musubi-sdd init --copilot

# Cursor IDE - 27 skills (AGENTS.md, official support)
musubi-sdd init --cursor

# Gemini CLI - 27 skills (GEMINI.md integration)
musubi-sdd init --gemini

# Codex CLI - 27 skills (AGENTS.md)
musubi-sdd init --codex

# Qwen Code - 27 skills (AGENTS.md)
musubi-sdd init --qwen

# Windsurf IDE - 27 skills (AGENTS.md)
musubi-sdd init --windsurf

# Short alias
musubi init --claude    # or --copilot, --cursor, etc.

# Onboard existing project (automatic analysis)
musubi-onboard

# Synchronize steering docs with codebase
musubi-sync
musubi-sync --dry-run        # Preview changes
musubi-sync --auto-approve   # Auto-apply (CI/CD)

# Analyze code quality (v0.5.0)
musubi-analyze                      # Full analysis
musubi-analyze --type=quality       # Quality metrics only
musubi-analyze --type=dependencies  # Dependencies only
musubi-analyze --type=security      # Security audit
musubi-analyze --output=report.md   # Save report

# Share project memories with team (v0.6.0)
musubi-share export                 # Export memories to JSON
musubi-share import memories.json   # Import from teammate
musubi-share sync --platform=copilot # Sync to specific platform

# Validate constitutional compliance (v0.7.0)
musubi-validate constitution        # Validate all 9 articles
musubi-validate article 3           # Validate Test-First Imperative
musubi-validate gates               # Validate Phase -1 Gates
musubi-validate complexity          # Check complexity limits
musubi-validate all -v              # Full validation with details

# Generate EARS requirements documents (v0.8.0)
musubi-requirements init "User Authentication"  # Initialize requirements doc
musubi-requirements add                         # Add requirement interactively
musubi-requirements list                        # List all requirements
musubi-requirements validate                    # Validate EARS format
musubi-requirements trace                       # Show traceability matrix

# Generate design documents (v0.8.2)
musubi-design init "User Authentication"        # Initialize design document
musubi-design add-c4 context                    # Add C4 Context diagram
musubi-design add-c4 container --format plantuml # Add Container with PlantUML
musubi-design add-adr "Use JWT for tokens"      # Add Architecture Decision
musubi-design validate                          # Validate design completeness
musubi-design trace                             # Show requirements traceability

# Break down design into tasks (v0.8.4)
musubi-tasks init "User Authentication"         # Initialize task breakdown
musubi-tasks add "Database Schema"              # Add task interactively
musubi-tasks list                               # List all tasks
musubi-tasks list --priority P0                 # List critical tasks
musubi-tasks update 001 "In Progress"           # Update task status
musubi-tasks validate                           # Validate task completeness
musubi-tasks graph                              # Show dependency graph

# End-to-end traceability (v0.8.5)
musubi-trace matrix                             # Generate traceability matrix
musubi-trace matrix --format markdown > trace.md # Export to markdown
musubi-trace coverage                           # Calculate coverage statistics
musubi-trace coverage --min-coverage 100        # Require 100% coverage
musubi-trace gaps                               # Detect orphaned requirements/code
musubi-trace requirement REQ-AUTH-001           # Trace specific requirement
musubi-trace validate                           # Validate 100% traceability (Article V)
musubi-trace bidirectional                      # Bidirectional traceability analysis (v0.9.4)
musubi-trace impact REQ-AUTH-001                # Impact analysis for requirement changes (v0.9.4)
musubi-trace statistics                         # Comprehensive project statistics (v0.9.4)

# Change management for brownfield projects (v0.8.6)
musubi-change init CHANGE-001 --title "Add authentication"  # Create change proposal
musubi-change validate CHANGE-001 --verbose     # Validate delta specification
musubi-change apply CHANGE-001 --dry-run        # Preview changes
musubi-change apply CHANGE-001                  # Apply changes to codebase
musubi-change archive CHANGE-001                # Archive to specs/
musubi-change list --status pending             # List pending changes
musubi-change list --format json                # List in JSON format

# Gap detection and coverage validation (v0.8.7)
musubi-gaps detect                              # Detect all gaps
musubi-gaps detect --verbose                    # Show detailed gap information
musubi-gaps requirements                        # Detect orphaned requirements
musubi-gaps code                                # Detect untested code
musubi-gaps coverage                            # Calculate coverage statistics
musubi-gaps coverage --min-coverage 100         # Require 100% coverage
musubi-gaps detect --format markdown > gaps.md  # Export gap report
```

## Documentation

Comprehensive guides are available in `docs/guides/`:

- **[Brownfield Tutorial](docs/guides/brownfield-tutorial.md)** - Step-by-step guide for managing changes in existing projects
- **[Delta Specification Guide](docs/guides/delta-spec-guide.md)** - Format reference for change tracking
- **[Change Management Workflow](docs/guides/change-management-workflow.md)** - End-to-end workflow documentation
- **[Traceability Matrix Guide](docs/guides/traceability-matrix-guide.md)** - Traceability system usage
- **[Video Tutorial Plan](docs/guides/video-tutorial-plan.md)** - Video content script

### Project Types

During initialization, MUSUBI asks you to select a **Project Type**. This determines the workflow and features available:

#### Greenfield (0→1)

- **What it is**: Starting a new project from scratch
- **Use cases**:
  - New application development
  - Proof-of-concept projects
  - Greenfield microservices
- **Features enabled**:
  - Full 8-stage SDD workflow (Research → Monitoring)
  - `/sdd-steering` - Generate initial project memory
  - `/sdd-requirements` - Create new requirements from scratch
  - `/sdd-design` - Design architecture (C4 model + ADR)
  - `/sdd-tasks` - Break requirements into tasks
  - `/sdd-implement` - Implement features (test-first)
  - `/sdd-validate` - Constitutional compliance checks
- **Benefits**:
  - Clean start with best practices enforced
  - Constitutional governance from day one
  - Complete traceability from requirements to code

#### Brownfield (1→n)

- **What it is**: Working with existing codebases
- **Use cases**:
  - Adding features to existing applications
  - Refactoring legacy code
  - Migrating/modernizing systems
- **Features enabled**:
  - Delta Specifications (ADDED/MODIFIED/REMOVED)
  - `/sdd-change-init` - Create change proposal
  - `/sdd-change-apply` - Apply changes with impact analysis
  - `/sdd-change-archive` - Archive completed changes
  - `change-impact-analyzer` skill (Claude Code) - Automatic impact detection
  - Reverse engineering: `/sdd-steering` analyzes existing code
- **Benefits**:
  - Safe incremental changes with impact analysis
  - Preserves existing architecture while improving incrementally
  - Full audit trail of what changed and why

#### Both

- **What it is**: Hybrid approach for complex scenarios
- **Use cases**:
  - Monolith → Microservices migration (brownfield + greenfield services)
  - Platform modernization (keep some, rebuild others)
  - Multi-component systems with mixed maturity
- **Features enabled**:
  - All Greenfield + Brownfield features
  - Flexibility to choose workflow per component
  - Mixed delta specs and greenfield specs in same project
- **Benefits**:
  - Maximum flexibility for complex transformation projects
  - Unified steering/governance across all components
  - Single tool for entire modernization journey

**Example Selection**:

```text
? Project type:
❯ Greenfield (0→1)    ← New projects
  Brownfield (1→n)    ← Existing codebases
  Both                ← Complex/hybrid scenarios
```

### What Gets Installed

#### Claude Code (Skills API)

```text
your-project/
├── .claude/
│   ├── skills/              # 25 Skills API + 5 built-in (Claude Code exclusive)
│   │   ├── orchestrator/
│   │   ├── steering/
│   │   ├── requirements-analyst/
│   │   └── ... (22 more)
│   ├── commands/            # Slash commands (/sdd-*)
│   └── CLAUDE.md            # Claude Code guide
├── steering/                # Project memory (all agents)
│   ├── project.yml          # Project configuration (v0.2.1+)
│   ├── structure.md         # Architecture patterns
│   ├── tech.md              # Technology stack
│   ├── product.md           # Product context
│   ├── memories/            # Persistent knowledge (v0.2.0+)
│   │   ├── architecture_decisions.md
│   │   ├── development_workflow.md
│   │   ├── domain_knowledge.md
│   │   ├── lessons_learned.md
│   │   ├── suggested_commands.md
│   │   └── technical_debt.md
│   └── rules/
│       ├── constitution.md  # 9 Constitutional Articles
│       ├── workflow.md      # 8-Stage SDD workflow
│       └── ears-format.md   # EARS syntax guide
├── templates/               # Document templates (all agents)
└── storage/                 # Specs, changes, features (all agents)
```

#### Other Agents (GitHub Copilot, Cursor, Gemini, etc.)

```text
your-project/
├── .github/prompts/         # For GitHub Copilot (/sdd-*, .prompt.md)
│   ├── sdd-steering.prompt.md    # Prompt files use .prompt.md extension
│   ├── sdd-requirements.prompt.md
│   ├── ... (9 prompt files)
│   └── AGENTS.md             # 27 skills definition (official support)
│   OR
├── .cursor/commands/        # For Cursor (/sdd-*, Markdown)
│   ├── AGENTS.md             # 27 skills definition (official support)
│   OR
├── .gemini/commands/        # For Gemini CLI (/sdd-*, TOML)
│   │   ├── sdd-steering.toml
│   │   ├── sdd-requirements.toml
│   │   └── ... (6 TOML files)
│   OR
├── .codex/prompts/          # For Codex CLI (/prompts:sdd-*, Markdown)
│   ├── AGENTS.md             # 27 skills definition
│   OR
├── .qwen/commands/          # For Qwen Code (/sdd-*, Markdown)
│   ├── AGENTS.md             # 27 skills definition
│   OR
├── .windsurf/workflows/     # For Windsurf (/sdd-*, Markdown)
│   ├── AGENTS.md             # 27 skills definition
│
├── GEMINI.md (root, for Gemini)  # 27 skills integrated into existing file
├── steering/                # Project memory (same for all)
│   ├── project.yml          # Project configuration (v0.2.1+)
│   ├── memories/            # Persistent knowledge (v0.2.0+)
│   │   ├── architecture_decisions.md
│   │   ├── development_workflow.md
│   │   ├── domain_knowledge.md
│   │   ├── lessons_learned.md
│   │   ├── suggested_commands.md
│   │   └── technical_debt.md
│   └── ... (structure.md, tech.md, product.md, rules/)
├── templates/               # Document templates (same for all)
└── storage/                 # Specs, changes, features (same for all)
```

**Key Differences**:

- **Claude Code**: 27 Skills (25 + 5 built-in) + commands (Markdown)
- **GitHub Copilot**: AGENTS.md (official support) + prompt files (`.prompt.md`)
- **Cursor**: AGENTS.md (official support) + commands (Markdown)
- **Gemini CLI**: GEMINI.md integration (27 skills) + TOML commands (unique)
- **Others**: AGENTS.md (compatible) + Markdown commands
- **All platforms**: Same 27 skills, different implementation formats

## Usage

### CLI Commands

MUSUBI provides several CLI commands for project management:

```bash
# Show version
musubi --version
musubi -v

# Show help
musubi --help

# Show comprehensive info
musubi info

# Check project status
musubi status

# Validate constitutional compliance
musubi validate
musubi validate --verbose    # Detailed output
musubi validate --all        # Validate all features

# Initialize MUSUBI (interactive)
musubi init

# Onboard existing project (v0.3.0+)
musubi-onboard
musubi-onboard --auto-approve  # Skip confirmation
musubi-onboard --skip-memories # Skip memory initialization

# Synchronize steering docs with codebase (v0.4.0+)
musubi-sync                    # Interactive mode
musubi-sync --dry-run          # Preview changes only
musubi-sync --auto-approve     # Auto-apply (CI/CD)

# Analyze code quality (v0.5.0+)
musubi-analyze                 # Full analysis (quality + dependencies + security)
musubi-analyze --type=quality  # Code quality metrics only
musubi-analyze --type=dependencies  # Dependency analysis
musubi-analyze --type=security # Security vulnerabilities
musubi-analyze --output=report.md   # Save report to file
musubi-analyze --json          # JSON output

# Share project memories with team (v0.6.0+)
musubi-share export            # Export memories to JSON/YAML
musubi-share export --output=memories.yaml  # YAML format
musubi-share import memories.json  # Import and merge
musubi-share import memories.json --strategy=theirs  # Auto-accept
musubi-share sync              # Sync across AI platforms
musubi-share sync --platform=cursor  # Sync specific platform
musubi-share status            # Show sharing status
```

#### musubi-onboard

Automatically analyzes existing projects and generates steering documentation:

```text
🚀 MUSUBI Onboarding Wizard

Analyzing your project...

✅ Project structure analyzed
✅ Technology stack detected
   - Node.js, TypeScript, React, Jest
✅ Steering documents generated
   - steering/structure.md
   - steering/tech.md
   - steering/product.md
✅ Memories initialized (6 files)
✅ Project configuration created
   - steering/project.yml

⏱️  Onboarding completed in 2.5 minutes

💡 Next steps:
   - Review generated steering docs
   - Run: musubi-sync to keep docs current
   - Create requirements: /sdd-requirements [feature]
```

**Features**:

- Automatic codebase analysis (package.json, directory structure)
- Technology stack detection (languages, frameworks)
- Steering docs generation (structure, tech, product)
- Memory system initialization (6 memory files)
- Project configuration (project.yml)
- 96% time reduction (2-4 hours → 2-5 minutes)

#### musubi-sync

Detects codebase changes and keeps steering documents synchronized:

```text
🔄 MUSUBI Steering Sync

Detected changes:
  📦 Version: 0.3.0 → 0.4.0
  ➕ New framework: js-yaml@4.1.0
  📁 New directory: bin/

? Apply these changes? (Y/n) Y

✅ Updated steering/project.yml
✅ Updated steering/tech.md
✅ Updated steering/structure.md
✅ Recorded change in memories/architecture_decisions.md

🎉 Steering synchronized successfully!
```

**Features**:

- Change detection (version, languages, frameworks, directories)
- Interactive mode (default): Show changes, ask confirmation
- Auto-approve mode (--auto-approve): CI/CD integration
- Dry-run mode (--dry-run): Preview only
- Memory recording (audit trail)

**Usage**:

```bash
# Interactive (default)
musubi-sync

# Preview changes without applying
musubi-sync --dry-run

# Auto-apply for CI/CD pipelines
musubi-sync --auto-approve
```

#### musubi-share

Share and merge project memories across team members and AI platforms (v0.6.0+):

```text
📤 MUSUBI Memory Export

Export Summary:
  File: team-memories.json
  Format: json
  Size: 1098.28 KB
  Memories: 7 files
  Agents: 1 platforms
```

**Features**:

- **Export**: Share memories as JSON/YAML
- **Import**: Merge memories from teammates
- **Sync**: Synchronize across AI platforms
- **Conflict Resolution**: Interactive, auto-accept, keep-local, or merge with markers
- **Status**: Show installed platforms and memory counts

**Usage**:

```bash
# Export memories
musubi-share export
musubi-share export --output=memories.yaml

# Import and merge
musubi-share import colleague-memories.json
musubi-share import memories.json --strategy=theirs  # Auto-accept
musubi-share import memories.json --strategy=ours    # Keep local
musubi-share import memories.json --strategy=merge   # With markers

# Platform sync
musubi-share sync
musubi-share sync --platform=cursor

# Status check
musubi-share status
```

#### musubi status

Shows the current state of your MUSUBI project:

```text
📊 MUSUBI Project Status

✅ MUSUBI is initialized

📁 Claude Code Skills: 27 installed (25 + 5 built-in)
   Location: .claude/skills/

🧭 Steering Context:
   ✅ structure.md (updated: 2025-11-16)
   ✅ tech.md (updated: 2025-11-16)
   ✅ product.md (updated: 2025-11-16)

✅ Constitutional Governance: Enabled

📄 Specifications: 3 documents
   Latest specs:
   - auth-requirements.md
   - auth-design.md
   - auth-tasks.md

💡 Next steps:
   - Review steering files in steering/
   - Create requirements: /sdd-requirements [feature]
   - Validate compliance: musubi validate
```

#### musubi validate

Performs quick constitutional compliance checks:

- **Project profile**: reads `constitution.profile` from `steering/project.yml` (`library` when none is declared)
- **Article I**: Testable-Core Principle (counts core modules in the core paths: `lib/` and `packages/` by default, the declared `core_paths` otherwise)
- **Article II**: Automation Interface Mandate (`library`/`cli`: a `cli.ts` per library or CLI entry points in `bin/`; `application`: route handlers, no CLI required)
- **Article IV**: EARS Requirements Format (validates EARS patterns)
- **Article VI**: Project Memory (checks steering files)

For comprehensive validation, use your agent's `/sdd-validate` (or equivalent) command, or run `musubi-validate project`. For an `application` project the validator also checks core → delivery imports (I-3), UI code in core paths (I-A4), request-context APIs outside adapter paths (I-A5), schema validation on machine-facing endpoints (II-A4) and `package.json` scripts that point to missing files (II-A10). For every profile it also checks the code-size limits of the source files in core and delivery paths (VII-4–VII-6: at most 500 lines of code per file, 50 per function and 10 imports per file; warnings, configurable through `constitution.overrides.code_limits` in `steering/project.yml`) and doc comments on the exported functions and classes of core modules (I-5, advisory).

### Agent-Specific Commands

#### Claude Code

```bash
# Generate project memory
/sdd-steering

# Create requirements
/sdd-requirements authentication

# Design architecture
/sdd-design authentication

# Break down into tasks
/sdd-tasks authentication

# Implement feature
/sdd-implement authentication

# Validate constitutional compliance
/sdd-validate authentication
```

**Skills (Auto-Invoked)**: Claude Code automatically selects the appropriate skill:

- "Review my code" → `code-reviewer` skill
- "Create requirements for user login" → `requirements-analyst` skill
- "Design API for payment" → `api-designer` skill

#### GitHub Copilot

```bash
# Use # prefix for custom prompts
#sdd-steering
#sdd-requirements authentication
#sdd-design authentication
#sdd-tasks authentication
#sdd-implement authentication
#sdd-validate authentication
```

#### Gemini CLI

```bash
# Use / prefix for commands (TOML format)
/sdd-steering
/sdd-requirements authentication
/sdd-design authentication
/sdd-tasks authentication
/sdd-implement authentication
/sdd-validate authentication
```

**Note**: Gemini CLI commands are defined in TOML format (`.toml` files) instead of Markdown.

#### Cursor IDE, Qwen Code, Windsurf

```bash
# Use / prefix for commands (Markdown format)
/sdd-steering
/sdd-requirements authentication
/sdd-design authentication
/sdd-tasks authentication
/sdd-implement authentication
/sdd-validate authentication
```

#### Codex CLI

```bash
# Use /prompts: prefix
/prompts:sdd-steering
/prompts:sdd-requirements authentication
/prompts:sdd-design authentication
/prompts:sdd-tasks authentication
/prompts:sdd-implement authentication
/prompts:sdd-validate authentication
```

## 27 Skills Overview (All Platforms)

**Available on all 7 platforms** via:

- **Claude Code**: Skills API (automatic invocation) + 5 built-in orchestrator skills
- **GitHub Copilot & Cursor**: AGENTS.md (official support, reference via `@agent-name`)
- **Gemini, Windsurf, Codex, Qwen**: AGENTS.md (compatible format, natural language reference)

### Orchestration & Management (3 + 5 built-in)

- **orchestrator** - Master coordinator for multi-skill workflows
- **steering** - Project memory manager (auto-updating context)
- **constitution-enforcer** - Governance validation (9 Articles + Phase -1 Gates)

#### Built-in Orchestrator Skills (v5.9.0)

- **release-manager** - CHANGELOG generation, version management
- **workflow-mode-manager** - Mode detection (small/medium/large)
- **package-manager** - Monorepo package & dependency analysis
- **constitution-level-manager** - Level-aware validation (critical/advisory/flexible)
- **project-config-manager** - Schema validation & migration

### Requirements & Planning (3)

- **requirements-analyst** - EARS format requirements generation
- **project-manager** - Project planning, scheduling, risk management
- **change-impact-analyzer** - Brownfield change analysis

### Architecture & Design (4)

- **system-architect** - C4 model + ADR architecture design
- **api-designer** - REST/GraphQL/gRPC API design
- **database-schema-designer** - Database design, ER diagrams, DDL
- **ui-ux-designer** - UI/UX design, wireframes, prototypes

### Development (1)

- **software-developer** - Multi-language code implementation

### Quality & Review (5)

- **test-engineer** - Unit, integration, E2E testing with EARS mapping
- **code-reviewer** - Code review, SOLID principles
- **bug-hunter** - Bug investigation, root cause analysis
- **quality-assurance** - QA strategy, test planning
- **traceability-auditor** - Requirements ↔ Code ↔ Test coverage validation

### Security & Performance (2)

- **security-auditor** - OWASP Top 10, vulnerability detection
- **performance-optimizer** - Performance analysis, optimization

### Infrastructure & Operations (5)

- **devops-engineer** - CI/CD pipelines, Docker/Kubernetes
- **cloud-architect** - AWS/Azure/GCP, IaC (Terraform/Bicep)
- **database-administrator** - Database operations, tuning
- **site-reliability-engineer** - Production monitoring, SLO/SLI, incident response
- **release-coordinator** - Multi-component release management

### Documentation & Specialized (2)

- **technical-writer** - Technical documentation, API docs
- **ai-ml-engineer** - ML model development, MLOps

## Governance Articles

MUSUBI enforces 9 immutable constitutional articles:

1. **Testable-Core Principle** - Feature logic lives in core modules that are tested without the UI, server or CLI
2. **Automation Interface Mandate** - Primary functionality is reachable without the UI: a CLI for library and cli projects, the HTTP API for applications
3. **Test-First Imperative** - Tests before code (Red-Green-Blue)
4. **EARS Requirements Format** - Unambiguous requirements
5. **Traceability Mandate** - 100% coverage required
6. **Project Memory** - All skills check steering first
7. **Simplicity Gate** - Maximum 3 projects initially; files ≤ 500 lines of code, functions ≤ 50, imports ≤ 10
8. **Anti-Abstraction Gate** - Use framework features directly
9. **Integration-First Testing** - Real services over mocks

The project profile (`library | cli | application`) in `steering/project.yml` decides how Articles I and II apply (default: `library`).

## SDD Workflow (8 Stages)

```text
1. Research → 2. Requirements → 3. Design → 4. Tasks →
5. Implementation → 6. Testing → 7. Deployment → 8. Monitoring
```

Each stage has:

- Dedicated skills
- Quality gates
- Traceability requirements
- Constitutional validation

## EARS Requirements Format

```markdown
### Requirement: User Login

WHEN user provides valid credentials,
THEN the system SHALL authenticate the user
AND the system SHALL create a session.

#### Scenario: Successful login

- WHEN user enters correct email and password
- THEN system SHALL verify credentials
- AND system SHALL redirect to dashboard
```

## Documentation Language

MUSUBI is English only. All agent-generated documents, reports and CLI output are written in
English, and agents communicate with users in English. There is no documentation-language
setting and no other output language (CHANGE-002).

## Delta Specifications (Brownfield)

```markdown
## ADDED Requirements

### REQ-NEW-001: Two-Factor Authentication

...

## MODIFIED Requirements

### REQ-001: User Authentication

**Previous**: Email + password
**Updated**: Email + password + OTP
...

## REMOVED Requirements

### REQ-OLD-005: Remember Me

**Reason**: Security policy change
```

## Example Usage

### Greenfield Project (0→1)

```bash
# 1. Initialize
musubi-sdd init

# 2. Generate steering
/sdd-steering

# 3. Create requirements
/sdd-requirements user-authentication

# 4. Design architecture
/sdd-design user-authentication

# 5. Break into tasks
/sdd-tasks user-authentication

# 6. Implement
/sdd-implement user-authentication
```

### Brownfield Project (1→n)

```bash
# 1. Initialize with existing codebase
musubi-sdd init

# 2. Generate steering from existing code
/sdd-steering

# 3. Create change proposal
/sdd-change-init add-2fa

# 4. Impact analysis (automatic via change-impact-analyzer skill)

# 5. Implement change
/sdd-change-apply add-2fa

# 6. Archive change
/sdd-change-archive add-2fa
```

## Configuration

### MCP Server Integration

MUSUBI v2.0.0 integrates with **CodeGraphMCPServer** for advanced code analysis.

#### Option 1: Claude Code (Terminal)

```bash
# Install CodeGraph MCP with pipx (--force ensures latest version)
pipx install --force codegraph-mcp-server

# Add to Claude Code
claude mcp add codegraph -- codegraph-mcp serve --repo .

# Verify installation
claude mcp list
```

#### Option 2: VS Code with Claude Extension

1. **Install Prerequisites**:

   ```bash
   # --force ensures latest version even if already installed
   pipx install --force codegraph-mcp-server
   ```

2. **Configure VS Code** (`.vscode/mcp.json`):

   ```json
   {
     "servers": {
       "codegraph": {
         "type": "stdio",
         "command": "codegraph-mcp",
         "args": ["serve", "--repo", "${workspaceFolder}"]
       }
     }
   }
   ```

3. **Or use Claude Desktop config** (`~/.claude/claude_desktop_config.json` on macOS/Linux, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

   ```json
   {
     "mcpServers": {
       "codegraph": {
         "command": "codegraph-mcp",
         "args": ["serve", "--repo", "/path/to/your/project"]
       }
     }
   }
   ```

#### Option 3: npx (No Installation)

```bash
# Add via npx (no global install needed)
claude mcp add codegraph -- npx -y @anthropic/codegraph-mcp --codebase .
```

#### Verify MCP Server is Working

After setup, test in Claude:

```text
Use the init_graph tool to analyze this codebase
```

If successful, you'll see the code graph initialization output.

**Available MCP Tools (14 tools)**:

| Category   | Tools                                                                 | Description                      |
| ---------- | --------------------------------------------------------------------- | -------------------------------- |
| Code Graph | `init_graph`, `get_code_snippet`, `find_callers`, `find_dependencies` | Build and query code graph       |
| Search     | `local_search`, `global_search`, `query_codebase`                     | GraphRAG-powered semantic search |
| Analysis   | `analyze_module_structure`, `suggest_refactoring`                     | Code structure analysis          |
| Navigation | `jump_to_definition`, `find_implementations`                          | Code navigation                  |

**Agent × MCP Tool Mapping**:

| Agent                   | Primary MCP Tools                           | Use Case                         |
| ----------------------- | ------------------------------------------- | -------------------------------- |
| @change-impact-analyzer | `find_dependencies`, `find_callers`         | Impact analysis                  |
| @traceability-auditor   | `query_codebase`, `find_callers`            | Traceability validation          |
| @system-architect       | `analyze_module_structure`, `global_search` | Architecture analysis            |
| @code-reviewer          | `suggest_refactoring`, `get_code_snippet`   | Code quality review              |
| @security-auditor       | `find_callers`, `query_codebase`            | Security vulnerability detection |

Also integrates with other MCP servers:

- **Context7 MCP** - Up-to-date library documentation (Next.js, React, etc.)
- **Azure MCP** - Azure resource management
- **Microsoft Learn MCP** - Microsoft documentation

Skills automatically use available MCP servers when needed.

### Customization

Edit steering files to customize for your project:

```bash
# Architecture patterns
steering/structure.md

# Technology stack
steering/tech.md

# Product context
steering/product.md

# Constitutional rules (if needed)
steering/rules/constitution.md
```

## Development

### Contributing Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests locally: `npm test`
5. Run lint: `npm run lint`
6. Commit with conventional commits: `git commit -m "feat: add new feature"`
7. Push to your fork: `git push origin feature/your-feature`
8. Create a Pull Request
9. Wait for CI checks to pass (all checks must succeed)
10. Request review
11. Merge after approval

### CI/CD Pipeline

- **CI**: Runs on every PR and push to `main`
  - ESLint & Prettier
  - Jest Tests (80% coverage required)
  - Build Verification
  - Security Audit
  - Platform Initialization Tests (7 platforms)
- **Release**: Automated npm publish on version tags (`v*.*.*`)
- **Dependabot**: Weekly dependency updates (Mondays 9:00 JST)

### Local Testing

```bash
# Clone repository
git clone https://github.com/nahisaho/MUSUBI.git
cd musubi

# Install dependencies
npm install

# Run tests
npm test

# Run lint
npm run lint

# Check formatting
npm run format:check

# Link for local development
npm link
musubi init
```

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## ⭐ Support

If you find MUSUBI useful, please consider:

- ⭐ **Star this repository** - It helps others discover MUSUBI
- 🐛 **Report issues** - Help us improve
- 💡 **Suggest features** - We value your ideas
- 📝 **Share your experience** - Write about MUSUBI on your blog

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

MUSUBI synthesizes features from:

- **musuhi** - 20-agent system, steering, EARS format
- **OpenSpec** - Delta specs, brownfield support
- **ag2** (AutoGen) - Multi-agent orchestration
- **ai-dev-tasks** - Simplicity, progressive complexity
- **cc-sdd** - P-label parallelization, validation gates
- **spec-kit** - Constitutional governance, test-first

## 📚 Learn More

- [📖 Documentation](docs/)
- [📝 Changelog](CHANGELOG.md)
- [📋 SRS v3.0.0](docs/requirements/srs/srs-musubi-v3.0.0.md)
- [📅 Project Plan v3.0.0](docs/plans/project-plan-v3.0.0.md)
- [🏗️ Blueprint](Ultimate-SDD-Tool-Blueprint-v3-25-Skills.md)
- [📊 Project Plan](PROJECT-PLAN-MUSUBI.md)

---

<div align="center">

**🎋 MUSUBI** - musubi - Bringing specifications, design, and code together.

[![GitHub stars](https://img.shields.io/github/stars/nahisaho/musubi?style=social)](https://github.com/nahisaho/MUSUBI)

Made with ❤️ for the AI Coding Community

</div>
