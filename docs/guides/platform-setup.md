# 🔧 Platform-Specific Setup Guide

**MUSUBI v3.5.1** | Last updated: 2025-12-08

> Detailed setup instructions for each of the 7 AI coding agents

---

## 📋 Table of Contents

1. [Claude Code (Skills API)](#1-claude-code-skills-api)
2. [GitHub Copilot](#2-github-copilot)
3. [Cursor](#3-cursor)
4. [Gemini CLI](#4-gemini-cli)
5. [Codex CLI](#5-codex-cli)
6. [Qwen Code](#6-qwen-code)
7. [Windsurf](#7-windsurf)
8. [Platform Comparison](#8-platform-comparison)

---

## 1. Claude Code (Skills API)

### Overview

| Item | Content |
|------|------|
| **Format** | Skills API (.mdc files) |
| **Command Format** | `/command` |
| **Skills** | 25 skills + 11 commands |
| **Recommendation** | ⭐⭐⭐⭐⭐ Best |

### Setup

```bash
# Initialize
musubi-sdd init --claude-code
```

### Generated File Structure

```
project/
├── CLAUDE.md                    # Main entry point
├── .claude/
│   ├── commands/                # 11 SDD commands
│   │   ├── sdd-requirements.md
│   │   ├── sdd-design.md
│   │   ├── sdd-tasks.md
│   │   ├── sdd-implement.md
│   │   ├── sdd-validate.md
│   │   └── ...
│   └── skills/                  # 25 specialized skills
│       ├── orchestrator/
│       ├── requirements-analyst/
│       ├── system-architect/
│       ├── frontend-developer/
│       └── ...
└── steering/
    └── ...
```

### Usage

```
# Run a command
/sdd-requirements login feature

# Specify a skill
@requirements-analyst Analyze the requirements for this feature

# Via the orchestrator
@orchestrator Take charge of the new feature from design through implementation
```

### List of 25 Skills

| Category | Skills |
|---------|--------|
| **Core** | orchestrator, steering, constitution-enforcer |
| **Requirements** | requirements-analyst, change-impact-analyzer |
| **Architecture** | system-architect, api-designer |
| **Development** | frontend-developer, backend-developer, database-administrator |
| **Quality** | test-engineer, quality-assurance, code-reviewer |
| **Infrastructure** | devops-engineer, site-reliability-engineer |
| **Security** | security-engineer |
| **Documentation** | technical-writer |
| **Project** | project-manager, scrum-master |
| **Specialized** | ai-ml-engineer, ui-ux-designer, mobile-developer, data-engineer, issue-resolver, agent-assistant |

---

## 2. GitHub Copilot

### Overview

| Item | Content |
|------|------|
| **Format** | AGENTS.md (officially supported) |
| **Command Format** | `#command` |
| **Recommendation** | ⭐⭐⭐⭐⭐ Best |

### Setup

```bash
# Initialize
musubi-sdd init --copilot
```

### Generated File Structure

```
project/
├── AGENTS.md                    # Main entry point
├── .github/
│   └── copilot-instructions.md  # Copilot settings
└── steering/
    └── ...
```

### Usage

```
# Run a command
#sdd-requirements login feature
#sdd-design login feature
#sdd-implement REQ-LOGIN-001

# Workflow
#sdd-steering Check the current project status
```

### VS Code Settings (Recommended)

`.vscode/settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true
  },
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "file": "AGENTS.md"
    },
    {
      "file": "steering/rules/constitution.md"
    }
  ]
}
```

---

## 3. Cursor

### Overview

| Item | Content |
|------|------|
| **Format** | AGENTS.md + .cursorrules |
| **Command Format** | `@command` |
| **Recommendation** | ⭐⭐⭐⭐ High |

### Setup

```bash
# Initialize
musubi-sdd init --cursor
```

### Generated File Structure

```
project/
├── AGENTS.md                    # Main entry point
├── .cursorrules                 # Cursor rule settings
└── steering/
    └── ...
```

### .cursorrules Settings

```yaml
# .cursorrules
rules:
  - Follow AGENTS.md for project context
  - Use steering/ for architecture decisions
  - Apply constitution.md quality gates
  - Generate EARS-format requirements
  - Maintain traceability matrix
```

### Usage

```
# In Cursor chat
@sdd-requirements Define the login feature
@sdd-design Design it using the C4 model
@sdd-implement Implement this requirement
```

---

## 4. Gemini CLI

### Overview

| Item | Content |
|------|------|
| **Format** | GEMINI.md |
| **Command Format** | Text prompt |
| **Recommendation** | ⭐⭐⭐⭐ High |

### Setup

```bash
# Install Gemini CLI (if not yet installed)
npm install -g @anthropic-ai/gemini-cli

# Initialize MUSUBI
musubi-sdd init --gemini
```

### Generated File Structure

```
project/
├── GEMINI.md                    # Main entry point
└── steering/
    └── ...
```

### Usage

```bash
# Run with Gemini CLI
gemini "Refer to GEMINI.md and define the requirements for the login feature"

# With file references
gemini -f GEMINI.md -f steering/tech.md "Design the new feature"
```

### Context Settings

```bash
# Set context via environment variables
export GEMINI_CONTEXT="$(cat GEMINI.md steering/product.md)"
```

---

## 5. Codex CLI

### Overview

| Item | Content |
|------|------|
| **Format** | AGENTS.md |
| **Command Format** | Text prompt |
| **Recommendation** | ⭐⭐⭐ Medium |

### Setup

```bash
# Install Codex CLI (if not yet installed)
npm install -g @openai/codex-cli

# Initialize MUSUBI
musubi-sdd init --codex
```

### Generated File Structure

```
project/
├── AGENTS.md                    # Main entry point
└── steering/
    └── ...
```

### Usage

```bash
# Run with Codex CLI
codex "Following the SDD methodology in AGENTS.md, implement the login feature"

# Interactive mode
codex -i
> sdd-requirements login feature
```

---

## 6. Qwen Code

### Overview

| Item | Content |
|------|------|
| **Format** | QWEN.md + commands/ |
| **Command Format** | Text prompt |
| **Recommendation** | ⭐⭐⭐ Medium |

### Setup

```bash
# Initialize MUSUBI
musubi-sdd init --qwen
```

### Generated File Structure

```
project/
├── QWEN.md                      # Main entry point
├── .qwen/
│   └── commands/                # SDD commands
│       ├── sdd-requirements.md
│       ├── sdd-design.md
│       └── ...
└── steering/
    └── ...
```

### Usage

```
# Run with Qwen Code
Refer to QWEN.md and define the login feature using sdd-requirements

# Reference the command file
Write the requirements following .qwen/commands/sdd-requirements.md
```

---

## 7. Windsurf

### Overview

| Item | Content |
|------|------|
| **Format** | AGENTS.md |
| **Command Format** | Chat format |
| **Recommendation** | ⭐⭐⭐ Medium |

### Setup

```bash
# Initialize MUSUBI
musubi-sdd init --windsurf
```

### Generated File Structure

```
project/
├── AGENTS.md                    # Main entry point
└── steering/
    └── ...
```

### Windsurf Settings

In the Windsurf settings panel:

1. **Project Context** → add `AGENTS.md`
2. **Custom Instructions** → set the following:

```
Follow the SDD methodology defined in AGENTS.md.
Always check steering/rules/constitution.md before changes.
Generate EARS-format requirements.
Maintain full traceability.
```

### Usage

```
# In Windsurf chat
Following AGENTS.md, define the login feature using sdd-requirements

# Steering reference
Design based on the tech stack in steering/tech.md
```

---

## 8. Platform Comparison

### Feature Comparison Table

| Feature | Claude Code | GitHub Copilot | Cursor | Gemini CLI | Codex CLI | Qwen Code | Windsurf |
|------|:-----------:|:--------------:|:------:|:----------:|:---------:|:---------:|:--------:|
| **Skills API** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AGENTS.md** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Command Format** | `/cmd` | `#cmd` | `@cmd` | Text | Text | Text | Text |
| **25 Skills** | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **IDE Integration** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **CLI Usage** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

⚠️ = Limited support via AGENTS.md

### Recommended Platforms

| Use Case | Recommendation |
|-------------|------|
| **Full-featured SDD** | Claude Code |
| **Everyday development** | GitHub Copilot, Cursor |
| **CLI-based development** | Gemini CLI, Codex CLI |
| **Chinese-language environment** | Qwen Code |
| **Cascade workflow** | Windsurf |

### CLI Commands (Common to All Platforms)

The following CLI commands are available on all platforms:

```bash
# Initialize
musubi-sdd init

# SDD workflow
musubi-sdd requirements --feature <name>
musubi-sdd design --feature <name>
musubi-sdd tasks --feature <name>
musubi-sdd validate

# Analysis
musubi-sdd analyze
musubi-sdd gaps
musubi-sdd trace

# Memory management
musubi-sdd remember
musubi-sdd sync

# Automation
musubi-sdd orchestrate
musubi-sdd resolve --issue <number>

# Utilities
musubi-sdd browser
musubi-sdd gui start
musubi-sdd convert
```

---

## 🔗 Related Documents

- [5-Minute Quick Start](./quick-start-5min.md)
- [Complete CLI Reference](./cli-reference.md)
- [Hands-On Tutorial](./tutorial-todo-app.md)
- [Troubleshooting](./troubleshooting.md)

---

*Documentation generated by MUSUBI v3.5.1*
