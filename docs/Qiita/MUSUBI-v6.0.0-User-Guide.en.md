# [MUSUBI v6.1.0] Complete User Guide - Get Started with Specification-Driven Development on 7 AI Platforms

# Introduction

**MUSUBI SDD v6.1.0** has been released! This version unifies the directory structure and strengthens the requirements definition workflow.

This article is a user guide covering every feature of v6.1.0, for everyone from first-time MUSUBI users to existing users.

# 🆕 What's New in v6.1.0

## Unified Directory Structure

| Item | v6.0.0 | v6.1.0 |
|------|--------|--------|
| Specification location | `storage/features/{feature}/` | `storage/specs/` |
| File naming | `requirements.md` | `{feature}-requirements.md` |

**Article VIII compliance**: Removes unnecessary directory levels and adopts a flat naming convention.

## Enhanced Requirements Definition Workflow

- **Interactive dialogue**: Uncovers the "true purpose" through a one-question-at-a-time format
- **MECE analysis**: Covers requirements comprehensively from 4 perspectives

# 🆕 What's New in v6.0.0 (Previous Version)

## Breaking Change: GitHub Copilot Prompt File Extension

| Item | v5.x | v6.0.0 |
|------|------|--------|
| File extension | `.md` | `.prompt.md` |
| Location | `.github/prompts/` | `.github/prompts/` |
| Command format | `/sdd-*` | `/sdd-*` (unchanged) |

**Compliant with the official VS Code documentation**: Using the `.prompt.md` extension is recommended for GitHub Copilot prompt files.

# Migration Guide

To upgrade an existing project:

```bash
# Rename files in .github/prompts/ (excluding AGENTS.md)
cd .github/prompts/
for f in *.md; do [ "$f" != "AGENTS.md" ] && mv "$f" "${f%.md}.prompt.md"; done
```

---

# 📦 Installation

# Fresh Install

```bash
# Global install with npm (sudo required on Linux/Mac)
sudo npm install -g musubi-sdd

# Or run directly with npx (no install needed; recommended)
npx musubi-sdd@latest --version
# Output: 6.1.0
```

# Upgrade

```bash
# If installed globally (sudo required on Linux/Mac)
sudo npm install -g musubi-sdd@latest

# npx always uses the latest version (recommended)
npx musubi-sdd@latest --version
```

---

# 🚀 Quick Start (Get Going in 5 Minutes)

# Step 1: Initialize the Project

Initialize for the AI coding platform you use:

```bash
# Claude Code (recommended)
npx musubi-sdd init --claude

# GitHub Copilot (VS Code)
npx musubi-sdd init --copilot

# Cursor IDE
npx musubi-sdd init --cursor

# Gemini CLI
npx musubi-sdd init --gemini

# Multiple platforms at once
npx musubi-sdd init --claude --copilot
```

# Step 2: Requirements Definition

```bash
# Generate requirements in EARS format (interactive)
npx musubi-requirements "User authentication feature"
```

**Note**: Requirements definition proceeds interactively. The AI first uncovers the "true purpose" through a one-question-at-a-time dialogue, then uses MECE to define the requirements comprehensively.

Generated file: `storage/specs/user-auth-requirements.md`

# Step 3: Design

```bash
# Generate a design using the C4 model
npx musubi-design user-auth
```

Generated file: `storage/design/user-auth-design.md`

# Step 4: Task Breakdown

```bash
# Generate implementation tasks
npx musubi-tasks user-auth
```

Generated file: `storage/tasks/user-auth-tasks.md`

# Step 5: Validation

```bash
# Validate everything
npx musubi-validate all
```

---

# 🤖 Supported AI Platforms (7)

MUSUBI v6.1.0 supports the following 7 AI coding platforms:

| Platform | Skills API | Command Format | File Format | Install Location |
|-----------------|-----------|-------------|-------------|---------------|
| **Claude Code** | ✅ 27 Skills | `/sdd-*` | Markdown (.md) | `.claude/commands/`, `.claude/skills/` |
| **GitHub Copilot** | ❌ | `/sdd-*` | Prompt (.prompt.md) | `.github/prompts/`, `AGENTS.md` |
| **Cursor IDE** | ❌ | Natural language | Markdown (.md) | `.cursor/rules/` |
| **Gemini CLI** | ❌ | `/sdd-*` | TOML (.toml) | `.gemini/settings/` |
| **Codex CLI** | ❌ | `/sdd-*` | Markdown (.md) | `CODEX.md` |
| **Qwen Code** | ❌ | `/sdd-*` | Markdown (.md) | `QWEN.md` |
| **Windsurf** | ❌ | Natural language | Markdown (.md) | `.windsurf/rules/` |

# Platform-Specific Features

# Claude Code (Most Feature-Rich)
- 27 specialized skills (Skills API)
- 9 orchestration patterns
- MCP (Model Context Protocol) integration

```bash
npx musubi-sdd init --claude
```

# GitHub Copilot (Improved in v6.0.0)
- `.prompt.md` extension (compliant with official VS Code guidance)
- 27 agent definitions via AGENTS.md
- Full VS Code integration

```bash
npx musubi-sdd init --copilot
```

Generated file structure:
```
.github/
├── prompts/
│   ├── sdd-steering.prompt.md
│   ├── sdd-requirements.prompt.md
│   ├── sdd-design.prompt.md
│   ├── sdd-tasks.prompt.md
│   ├── sdd-implement.prompt.md
│   ├── sdd-validate.prompt.md
│   ├── sdd-change-init.prompt.md
│   ├── sdd-change-apply.prompt.md
│   └── sdd-change-archive.prompt.md
└── AGENTS.md
AGENTS.md                      # Also placed at the root
```

---

# 📋 List of 27 Agents (Skills)

MUSUBI provides 27 specialized AI agents:

> **Note**: The command format differs by platform.
> - Claude Code: `/sdd-*`
> - GitHub Copilot: `/sdd-*`
> - Cursor/Windsurf: State the command name in natural language

# Core Workflow (9)
| Agent | Role | Command (Claude Code) |
|-------------|------|---------|
| Steering | Project memory management | `/sdd-steering` |
| Requirements Analyst | EARS-format requirements definition | `/sdd-requirements` |
| System Architect | C4 model design | `/sdd-design` |
| Project Manager | Task breakdown | `/sdd-tasks` |
| Software Developer | Implementation | `/sdd-implement` |
| Traceability Auditor | Traceability validation | `/sdd-validate` |
| Change Impact Analyzer | Change impact analysis | `/sdd-change-init` |
| Delta Spec Manager | Applying delta specs | `/sdd-change-apply` |
| Archive Manager | Archiving changes | `/sdd-change-archive` |

# Quality Assurance (6)
| Agent | Role |
|-------------|------|
| Test Engineer | Test design and implementation |
| Code Reviewer | Code review |
| Security Auditor | Security auditing |
| Performance Optimizer | Performance optimization |
| Quality Assurance | Quality management |
| Constitution Enforcer | Governance validation |

# Specialized Domains (12)
| Agent | Role |
|-------------|------|
| API Designer | API design |
| Database Schema Designer | DB design |
| Database Administrator | DB operations |
| UI/UX Designer | UI/UX design |
| DevOps Engineer | CI/CD setup |
| Cloud Architect | Cloud design |
| AI/ML Engineer | AI/ML implementation |
| Technical Writer | Documentation |
| Release Coordinator | Release management |
| SRE | Reliability engineering |
| Bug Hunter | Bug investigation |
| Issue Resolver | Issue resolution |

---

# 🏛️ The 9 Constitutional Articles

MUSUBI guarantees quality through governance by a "constitution":

| Article | Principle | Description |
|------|------|------|
| Article I | Library-First | Implement features as libraries first |
| Article II | CLI Interface | Every feature must have a CLI interface |
| Article III | Test-First | Write tests before implementation (Red-Green-Blue) |
| Article IV | EARS Format | Write requirements in EARS format |
| Article V | Traceability | Traceability across requirements ↔ design ↔ code ↔ tests |
| Article VI | Project Memory | Steering files must be consulted |
| Article VII | Simplicity Gate | A maximum of 3 projects |
| Article VIII | Anti-Abstraction | Do not create unnecessary abstraction layers |
| Article IX | Integration-First | Use real services in integration tests |

---

# 📁 Project Structure

Standard structure of a project initialized with MUSUBI:

```
your-project/
├── AGENTS.md                    # AI agent definitions
├── steering/
│   ├── structure.md             # Architecture patterns
│   ├── tech.md                  # Tech stack
│   ├── product.md               # Product context
│   └── rules/
│       ├── constitution.md      # The 9 constitutional articles
│       ├── workflow.md          # Workflow guide
│       └── ears-format.md       # EARS format guide
├── storage/
│   ├── specs/                   # Specifications
│   │   ├── *-requirements.md    # Requirements definitions
│   │   ├── *-design.md          # Design documents
│   │   └── *-tasks.md           # Task breakdowns
│   ├── changes/                 # Change management
│   └── archive/                 # Archive
└── .github/prompts/             # For GitHub Copilot (v6.0.0)
    ├── sdd-steering.prompt.md
    ├── sdd-requirements.prompt.md
    └── ... (other .prompt.md files)
```

---

# 🔧 CLI Command Reference

# Basic Commands

```bash
# Show help
npx musubi-sdd --help

# Check version
npx musubi-sdd --version

# Initialize
npx musubi-sdd init [--claude|--copilot|--cursor|--gemini]
```

# Specification-Driven Development Commands

```bash
# Requirements definition
npx musubi-requirements "<feature description>"

# Design
npx musubi-design <feature-name>

# Task breakdown
npx musubi-tasks <feature-name>

# Validation
npx musubi-validate [all|requirements|design|traceability]

# Traceability
npx musubi-trace <feature-name>

# Gap analysis
npx musubi-gaps <feature-name>
```

# Change Management Commands

```bash
# Create a change proposal
npx musubi-change init <change-name>

# Apply a change
npx musubi-change apply <change-name>

# Archive a change
npx musubi-change archive <change-name>
```

# Advanced Commands

```bash
# Orchestration
npx musubi-orchestrate <pattern> <feature-name>

# Cost tracking
npx musubi-costs

# Release
npx musubi-release [--dry-run]

# Analysis
npx musubi-analyze <path>

# Sync
npx musubi-sync
```

---

# 🌐 Multilingual Support (8 Languages)

MUSUBI can generate templates in 8 languages:

| Language | Code | Example |
|------|--------|-----|
| English | `en` | `--locale en` |
| 日本語 | `ja` | `--locale ja` |
| 中文 | `zh` | `--locale zh` |
| 한국어 | `ko` | `--locale ko` |
| Deutsch | `de` | `--locale de` |
| Français | `fr` | `--locale fr` |
| Español | `es` | `--locale es` |
| Bahasa Indonesia | `id` | `--locale id` |

```bash
# Initialize with Japanese templates
npx musubi-sdd init --claude --locale ja
```

---

# 🔄 Orchestration Patterns (9)

Patterns for coordinating multiple agents:

| Pattern | Purpose | Command |
|----------|------|---------|
| Sequential | Sequential execution | `npx musubi-orchestrate sequential` |
| Triage | Task routing | `npx musubi-orchestrate triage` |
| Handoff | Handoff between agents | `npx musubi-orchestrate handoff` |
| Swarm | Collaborative processing | `npx musubi-orchestrate swarm` |
| Group Chat | Discussion-based | `npx musubi-orchestrate group-chat` |
| Nested | Hierarchical | `npx musubi-orchestrate nested` |
| Human-in-Loop | Human approval | `npx musubi-orchestrate human-in-loop` |
| Auto | Automatic selection | `npx musubi-orchestrate auto` |
| Parallel | Parallel execution | `npx musubi-orchestrate parallel` |

---

# 🏢 Enterprise Features

# Workflow Modes (3)

| Mode | Project Size | Number of Stages |
|--------|----------------|-----------|
| `small` | Small | 3 stages |
| `medium` | Medium | 5 stages |
| `large` | Large | 8 stages |

```bash
# Initialize in large-project mode
npx musubi-sdd init --mode large
```

# Monorepo Support

```javascript
const { PackageManager } = require('musubi-sdd');
const pm = new PackageManager('/path/to/monorepo');

// Generate a dependency graph
const graph = pm.generateDependencyGraph('mermaid');
```

# Constitutional Level Management

| Level | Behavior on Violation |
|--------|------------|
| `critical` | Block (fix required) |
| `advisory` | Warning (fix recommended) |
| `flexible` | Info (optional) |

---

# 🛠️ Troubleshooting

# Common Issues

# Q: `npx musubi-sdd` cannot be found

```bash
# Clear the cache
npx clear-npx-cache

# Run again
npx musubi-sdd@latest --version
```

# Q: GitHub Copilot does not recognize `.prompt.md` files

1. Update VS Code to the latest version
2. Update the GitHub Copilot extension to the latest version
3. Confirm the file extension is exactly `.prompt.md`

# Q: I want to upgrade an existing project

```bash
# Migrate files for v6.0.0
cd .github/prompts/
for f in *.md; do [ "$f" != "AGENTS.md" ] && mv "$f" "${f%.md}.prompt.md"; done
```

---

# 📚 Related Resources

- **GitHub repository**: [nahisaho/musubi](https://github.com/nahisaho/MUSUBI)
- **npm package**: [musubi-sdd](https://www.npmjs.com/package/musubi-sdd)
- **VS Code Copilot documentation**: [Reusable prompt files](https://code.visualstudio.com/docs/copilot/copilot-customization#_reusable-prompt-files)

---

# Summary

MUSUBI v6.1.0 brings the following improvements:

1. ✅ **Unified directory structure**: Flattened into `storage/specs/`
2. ✅ **Interactive requirements definition**: One question at a time + MECE analysis
3. ✅ **Official GitHub Copilot compliance**: `.prompt.md` extension (v6.0.0)
4. ✅ **7 supported platforms**: Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf
5. ✅ **27 agents**: Development support from specialized AIs
6. ✅ **9 constitutional articles**: Quality governance
7. ✅ **8 supported languages**: For global teams

Build higher-quality software with specification-driven development!

---

**Tags**: `MUSUBI` `SDD` `SpecDrivenDevelopment` `AICoding` `GitHubCopilot` `ClaudeCode` `SoftwareDevelopment` `DevTools`
