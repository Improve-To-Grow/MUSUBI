# [MUSUBI v6.1.0] Complete User Guide - Get Started with Specification-Driven Development on 7 AI Platforms

# Introduction

**MUSUBI SDD v6.1.0** has been released! This version unifies the directory structure and strengthens the requirements definition workflow.

This article is a user guide covering all features of v6.1.0, for both first-time MUSUBI users and existing users.

# 🆕 Changes in v6.1.0

## Unified Directory Structure

| Item | v6.0.0 | v6.1.0 |
|------|--------|--------|
| Specification location | `storage/features/{feature}/` | `storage/specs/` |
| File naming | `requirements.md` | `{feature}-requirements.md` |

**Article VIII compliance**: Reduced unnecessary directory hierarchy and adopted a flat naming convention.

## Strengthened Requirements Definition Workflow

- **Interactive dialogue**: Probe for the "true purpose" one question at a time
- **MECE analysis**: Cover requirements comprehensively from 4 perspectives

# 🆕 Changes in v6.0.0 (Previous Version)

## Breaking Change: GitHub Copilot Prompt File Extension

| Item | v5.x | v6.0.0 |
|------|------|--------|
| File extension | `.md` | `.prompt.md` |
| Location | `.github/prompts/` | `.github/prompts/` |
| Command format | `/sdd-*` | `/sdd-*` (unchanged) |

**Compliant with the official VS Code documentation**: Using the `.prompt.md` extension is recommended for GitHub Copilot prompt files.

# Migration Guide

When upgrading an existing project:

```bash
# Rename the files in .github/prompts/ (except AGENTS.md)
cd .github/prompts/
for f in *.md; do [ "$f" != "AGENTS.md" ] && mv "$f" "${f%.md}.prompt.md"; done
```

---

# 📦 Installation

# New installation

```bash
# Global install from the ITG fork (sudo may be required on Linux/Mac)
sudo npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'

# Verify
musubi-sdd --version
# Output: 6.1.0
```

# Upgrade

```bash
# Rerun the global install (sudo may be required on Linux/Mac)
sudo npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'

# Verify
musubi-sdd --version
```

---

# 🚀 Quick Start (Get Going in 5 Minutes)

# Step 1: Initialize the Project

Initialize to match your AI coding platform:

```bash
# Claude Code (recommended)
musubi-sdd init --claude

# GitHub Copilot (VS Code)
musubi-sdd init --copilot

# Cursor IDE
musubi-sdd init --cursor

# Gemini CLI
musubi-sdd init --gemini

# Multiple platforms at once
musubi-sdd init --claude --copilot
```

# Step 2: Define Requirements

```bash
# Generate requirements in EARS format (interactive)
musubi-requirements "User authentication feature"
```

**Note**: Requirements definition proceeds interactively. After the AI probes for the "true purpose" one question at a time, it defines the requirements comprehensively using MECE.

Generated file: `storage/specs/user-auth-requirements.md`

# Step 3: Design

```bash
# Generate the design with the C4 model
musubi-design user-auth
```

Generated file: `storage/design/user-auth-design.md`

# Step 4: Task Breakdown

```bash
# Generate implementation tasks
musubi-tasks user-auth
```

Generated file: `storage/tasks/user-auth-tasks.md`

# Step 5: Validation

```bash
# Validate everything
musubi-validate all
```

---

# 🤖 Supported AI Platforms (7 Types)

MUSUBI v6.1.0 supports the following 7 AI coding platforms:

| Platform | Skills API | Command format | File format | Install location |
|-----------------|-----------|-------------|-------------|---------------|
| **Claude Code** | ✅ 27 Skills | `/sdd-*` | Markdown (.md) | `.claude/commands/`, `.claude/skills/` |
| **GitHub Copilot** | ❌ | `/sdd-*` | Prompt (.prompt.md) | `.github/prompts/`, `AGENTS.md` |
| **Cursor IDE** | ❌ | Natural language | Markdown (.md) | `.cursor/rules/` |
| **Gemini CLI** | ❌ | `/sdd-*` | TOML (.toml) | `.gemini/settings/` |
| **Codex CLI** | ❌ | `/sdd-*` | Markdown (.md) | `CODEX.md` |
| **Qwen Code** | ❌ | `/sdd-*` | Markdown (.md) | `QWEN.md` |
| **Windsurf** | ❌ | Natural language | Markdown (.md) | `.windsurf/rules/` |

# Platform-Specific Characteristics

# Claude Code (Most Full-Featured)
- 27 specialized skills (Skills API)
- 9 orchestration patterns
- MCP (Model Context Protocol) integration

```bash
musubi-sdd init --claude
```

# GitHub Copilot (Improved in v6.0.0)
- `.prompt.md` extension (compliant with official VS Code)
- 27 agent definitions via AGENTS.md
- Full VS Code integration

```bash
musubi-sdd init --copilot
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

> **Note**: The command format varies by platform.
> - Claude Code: `/sdd-*`
> - GitHub Copilot: `/sdd-*`
> - Cursor/Windsurf: Tell it the command name in natural language

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
| Delta Spec Manager | Delta spec application | `/sdd-change-apply` |
| Archive Manager | Change archiving | `/sdd-change-archive` |

# Quality Assurance (6)
| Agent | Role |
|-------------|------|
| Test Engineer | Test design and implementation |
| Code Reviewer | Code review |
| Security Auditor | Security auditing |
| Performance Optimizer | Performance optimization |
| Quality Assurance | Quality management |
| Constitution Enforcer | Governance validation |

# Specialized Areas (12)
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

MUSUBI ensures quality through governance by the "Constitution":

| Article | Principle | Content |
|------|------|------|
| Article I | Library-First | Implement features as libraries first |
| Article II | CLI Interface | A CLI interface is required for every feature |
| Article III | Test-First | Write tests before implementation (Red-Green-Blue) |
| Article IV | EARS Format | Write requirements in EARS format |
| Article V | Traceability | Traceability of requirements <-> design <-> code <-> tests |
| Article VI | Project Memory | Referencing Steering files is required |
| Article VII | Simplicity Gate | Maximum of 3 projects |
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
│   ├── tech.md                  # Technology stack
│   ├── product.md               # Product context
│   └── rules/
│       ├── constitution.md      # The 9 Constitutional Articles
│       ├── workflow.md          # Workflow guide
│       └── ears-format.md       # EARS format guide
├── storage/
│   ├── specs/                   # Specifications
│   │   ├── *-requirements.md    # Requirements definition
│   │   ├── *-design.md          # Design document
│   │   └── *-tasks.md           # Task breakdown
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
musubi-sdd --help

# Check version
musubi-sdd --version

# Initialize
musubi-sdd init [--claude|--copilot|--cursor|--gemini]
```

# Specification-Driven Development Commands

```bash
# Requirements definition
musubi-requirements "<feature description>"

# Design
musubi-design <feature-name>

# Task breakdown
musubi-tasks <feature-name>

# Validation
musubi-validate [all|requirements|design|traceability]

# Traceability
musubi-trace <feature-name>

# Gap analysis
musubi-gaps <feature-name>
```

# Change Management Commands

```bash
# Create a change proposal
musubi-change init <change-name>

# Apply changes
musubi-change apply <change-name>

# Archive changes
musubi-change archive <change-name>
```

# Advanced Commands

```bash
# Orchestration
musubi-orchestrate <pattern> <feature-name>

# Cost tracking
musubi-costs

# Release
musubi-release [--dry-run]

# Analysis
musubi-analyze <path>

# Sync
musubi-sync
```

---

# 🌐 Multilingual Support (8 Languages)

MUSUBI can generate templates in 8 languages:

| Language | Code | Example |
|------|--------|-----|
| English | `en` | `--locale en` |
| Japanese | `ja` | `--locale ja` |
| Chinese | `zh` | `--locale zh` |
| Korean | `ko` | `--locale ko` |
| Deutsch | `de` | `--locale de` |
| Français | `fr` | `--locale fr` |
| Español | `es` | `--locale es` |
| Bahasa Indonesia | `id` | `--locale id` |

```bash
# Initialize with Japanese templates
musubi-sdd init --claude --locale ja
```

---

# 🔄 Orchestration Patterns (9 Types)

Patterns for coordinating multiple agents:

| Pattern | Use | Command |
|----------|------|---------|
| Sequential | Sequential execution | `musubi-orchestrate sequential` |
| Triage | Task routing | `musubi-orchestrate triage` |
| Handoff | Handoff between agents | `musubi-orchestrate handoff` |
| Swarm | Cooperative processing | `musubi-orchestrate swarm` |
| Group Chat | Discussion-style | `musubi-orchestrate group-chat` |
| Nested | Hierarchical | `musubi-orchestrate nested` |
| Human-in-Loop | Human approval | `musubi-orchestrate human-in-loop` |
| Auto | Automatic selection | `musubi-orchestrate auto` |
| Parallel | Parallel execution | `musubi-orchestrate parallel` |

---

# 🏢 Enterprise Features

# Workflow Modes (3 Types)

| Mode | Project size | Number of stages |
|--------|----------------|-----------|
| `small` | Small | 3 stages |
| `medium` | Medium | 5 stages |
| `large` | Large | 8 stages |

```bash
# Initialize in large-project mode
musubi-sdd init --mode large
```

# Monorepo Support

```javascript
const { PackageManager } = require('musubi-sdd');
const pm = new PackageManager('/path/to/monorepo');

// Generate the dependency graph
const graph = pm.generateDependencyGraph('mermaid');
```

# Constitution Level Management

| Level | Behavior on violation |
|--------|------------|
| `critical` | Block (mandatory fix) |
| `advisory` | Warning (recommended fix) |
| `flexible` | Info (optional) |

---

# 🛠️ Troubleshooting

# Common Issues

# Q: `musubi-sdd` is not found

```bash
# Reinstall globally
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'

# Re-run
musubi-sdd --version
```

# Q: GitHub Copilot does not recognize `.prompt.md`

1. Update VS Code to the latest version
2. Update the GitHub Copilot extension to the latest version
3. Confirm the file extension is correctly `.prompt.md`

# Q: I want to upgrade an existing project

```bash
# Migrate files for v6.0.0
cd .github/prompts/
for f in *.md; do [ "$f" != "AGENTS.md" ] && mv "$f" "${f%.md}.prompt.md"; done
```

---

# 📚 Related Resources

- **GitHub repository**: [nahisaho/musubi](https://github.com/nahisaho/MUSUBI)
- **Source**: [ITG fork](https://github.com/Improve-To-Grow/MUSUBI/tree/ITG-adjustments)
- **VS Code Copilot documentation**: [Reusable prompt files](https://code.visualstudio.com/docs/copilot/copilot-customization#_reusable-prompt-files)

---

# Summary

MUSUBI v6.1.0 improves the following:

1. ✅ **Unified directory structure**: Flattened to `storage/specs/`
2. ✅ **Interactive requirements definition**: One question at a time + MECE analysis
3. ✅ **Official GitHub Copilot compliance**: `.prompt.md` extension (v6.0.0)
4. ✅ **7-platform support**: Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf
5. ✅ **27 agents**: Development support from specialized AI
6. ✅ **9 Constitutional Articles**: Quality governance
7. ✅ **8-language support**: For global teams

Build higher-quality software with specification-driven development!

---

**Tags**: `MUSUBI` `SDD` `SpecDrivenDevelopment` `AICoding` `GitHubCopilot` `ClaudeCode` `SoftwareDevelopment` `DevTools`
