# MUSUBI - Cross-Platform Feature Comparison Report

**Survey date**: 2025-11-17  
**Target version**: MUSUBI v0.1.2

## 📊 Executive Summary

MUSUBI supports 7 AI coding agents, but has **Claude Code-exclusive features (Skills API)**.

### Conclusion

**❌ On platforms other than Claude Code, not all of the same features as MUSUBI for Claude Code are available**

- **✅ Equivalent features**: Commands (9), steering system, Constitutional governance
- **❌ Claude Code only**: 25 specialized skills (Skills API)

---

## 🎯 Supported Platforms (7)

| Platform | Commands | Skills | Format | Prefix |
|------------------|----------|--------|--------------|----------------|
| **Claude Code** | ✅ 9 | ✅ 25 | Markdown | `/` |
| GitHub Copilot | ✅ 9 | ❌ 0 | Markdown | `#` |
| Cursor IDE | ✅ 9 | ❌ 0 | Markdown | `/` |
| Gemini CLI | ✅ 9 | ❌ 0 | **TOML** | `/` |
| Codex CLI | ✅ 9 | ❌ 0 | Markdown | `/prompts:` |
| Qwen Code | ✅ 9 | ❌ 0 | Markdown | `/` |
| Windsurf IDE | ✅ 9 | ❌ 0 | Markdown | `/` |

---

## ✅ Features Common to All Platforms

### 1. Commands (9)

The following 9 commands are available on all platforms:

#### Greenfield (new projects - 6 commands)
1. **`sdd-steering`** - Generate project memory (structure.md, tech.md, product.md)
2. **`sdd-requirements`** - Create EARS requirements specification
3. **`sdd-design`** - Generate technical design (C4 diagrams, ADRs, API specs)
4. **`sdd-tasks`** - Implementation task breakdown
5. **`sdd-implement`** - Test-first implementation
6. **`sdd-validate`** - Constitutional compliance validation

#### Brownfield (existing codebases - 3 commands)
7. **`sdd-change-init`** - Create change proposal
8. **`sdd-change-apply`** - Implement changes
9. **`sdd-change-archive`** - Archive changes

### 2. Steering System (Project Memory)

The following are automatically generated and maintained on all platforms:
- `steering/structure.md` - Architecture patterns
- `steering/tech.md` - Technology stack
- `steering/product.md` - Business context

### 3. Constitutional Governance (9 Articles)

The following are enforced on all platforms:
- Article I: Library-First Principle
- Article II: CLI Interface Mandate
- Article III: Test-First Imperative
- Article IV: EARS Requirements Format
- Article V: Traceability Mandate
- Article VI: Project Memory
- Article VII: Simplicity Gate
- Article VIII: Anti-Abstraction Gate
- Article IX: Real Services in Tests

### 4. SDD Workflow

All platforms support the 8-stage workflow:
1. Research
2. Requirements
3. Design
4. Tasks
5. Implementation
6. Testing
7. Deployment
8. Monitoring

---

## ❌ Claude Code-Exclusive Features

### 25 Specialized Skills (Skills API)

The **Skills API is exclusive to Claude Code**, so it is unavailable on other platforms.

#### Skill List (25)

**Orchestration (3 skills)**:
1. `@orchestrator` - Multi-agent coordination
2. `@steering` - Project memory management
3. `@constitution-enforcer` - Constitutional governance enforcement

**Requirements & Planning (3 skills)**:
4. `@requirements-analyst` - Requirements analysis, EARS specifications
5. `@project-manager` - Project planning and scheduling
6. `@change-impact-analyzer` - Change impact analysis

**Architecture & Design (4 skills)**:
7. `@system-architect` - System architecture, C4 diagrams
8. `@api-designer` - REST/GraphQL/gRPC API design
9. `@database-schema-designer` - Database design, ER diagrams
10. `@ui-ux-designer` - UI/UX design, wireframes

**Development (1 skill)**:
11. `@software-developer` - Multi-language code implementation

**Quality & Review (5 skills)**:
12. `@test-engineer` - Unit, integration, and E2E testing
13. `@code-reviewer` - Code review, SOLID principles
14. `@bug-hunter` - Bug investigation, root cause analysis
15. `@quality-assurance` - QA strategy, test planning
16. `@traceability-auditor` - Traceability verification

**Security & Performance (2 skills)**:
17. `@security-auditor` - OWASP Top 10, vulnerability detection
18. `@performance-optimizer` - Performance analysis and optimization

**Infrastructure (5 skills)**:
19. `@devops-engineer` - CI/CD pipelines, Docker/Kubernetes
20. `@cloud-architect` - AWS/Azure/GCP, IaC (Terraform/Bicep)
21. `@database-administrator` - Database operations, tuning
22. `@site-reliability-engineer` - SRE practices, monitoring
23. `@release-coordinator` - Release coordination, deployment strategy

**Documentation & Specialized (2 skills)**:
24. `@technical-writer` - Technical documentation, API docs
25. `@ai-ml-engineer` - ML model development, MLOps

### Skill Capabilities

Skills are more capable than plain prompts:
- **Context management**: Automatically loads steering files
- **Tool integration**: Integrates file read/write, search, and execution
- **Workflow automation**: Automatically executes multiple steps
- **Trigger words**: Launch automatically on specific keywords
- **Quality assurance**: Guarantees output format and traceability

---

## 📋 Detailed Feature Comparison

### Claude Code vs. Other Platforms

| Feature Category | Claude Code | Other 6 Platforms |
|--------------|-------------|---------------------|
| **Number of commands** | 9 | 9 |
| **Number of skills** | 25 | 0 (Skills API not supported) |
| **Steering system** | ✅ | ✅ |
| **Constitutional governance** | ✅ | ✅ |
| **EARS requirements** | ✅ | ✅ |
| **C4 diagram generation** | ✅ | ✅ |
| **ADR generation** | ✅ | ✅ |
| **Test-first** | ✅ | ✅ |
| **Traceability** | ✅ | ✅ |
| **Bilingual documentation** (optional, [BILINGUAL-IMPLEMENTATION.md](BILINGUAL-IMPLEMENTATION.md)) | ✅ | ✅ |
| **Multi-agent coordination** | ✅ @orchestrator | ❌ Manual |
| **Change impact analysis** | ✅ @change-impact-analyzer | ⚠️ Commands only |
| **Automatic Constitution enforcement** | ✅ @constitution-enforcer | ⚠️ CLI only |
| **Automatic traceability audit** | ✅ @traceability-auditor | ❌ Manual |
| **Role-specialized AI** | ✅ 25 skills | ❌ General-purpose AI only |

### Differences Between Commands and Skills

| Comparison | Commands | Skills (Claude Code only) |
|----------|----------|--------------------------|
| **Available platforms** | All 7 platforms | Claude Code only |
| **Implementation** | Markdown prompts | Skills API |
| **Automation level** | Semi-automatic | Fully automatic |
| **Context management** | Manual loading | Automatic loading |
| **Tool integration** | Explicit invocation | Implicit integration |
| **Complex workflows** | Requires user coordination | AI coordinates automatically |
| **Specialization** | General-purpose | Role-specific (25 types) |
| **Trigger** | Explicit command | Automatic launch by keyword |

---

## 🔍 Platform-Specific Characteristics

### 1. Claude Code (Default)
- **Directories**: `.claude/skills/`, `.claude/commands/`
- **Documentation**: `CLAUDE.md`
- **Prefix**: `/` (slash)
- **Features**: **Skills API supported - 25 skills available**
- **Recommended model**: Claude Sonnet 4.5 or later

### 2. GitHub Copilot
- **Directory**: `.github/prompts/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `#` (hash)
- **Features**: Commands only (no skills)
- **Recommended model**: Claude Sonnet 4.5 or later, GPT-4

### 3. Cursor IDE
- **Directory**: `.cursor/commands/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `/` (slash)
- **Features**: Commands only (no skills)
- **Recommended model**: Claude Sonnet 4.5 or later, GPT-4

### 4. Gemini CLI
- **Directory**: `.gemini/commands/`
- **Documentation**: `GEMINI.md`
- **Prefix**: `/` (slash)
- **Format**: **TOML** (others use Markdown)
- **Features**: Gemini-specific TOML format
- **Recommended model**: Gemini 2.0 Flash or later

### 5. Codex CLI
- **Directory**: `.codex/prompts/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `/prompts:`
- **Features**: Commands only (no skills)
- **Recommended model**: GPT-4 or later

### 6. Qwen Code
- **Directory**: `.qwen/commands/`
- **Documentation**: `QWEN.md`
- **Prefix**: `/` (slash)
- **Features**: Commands only (no skills)
- **Recommended model**: Qwen 2.5 Coder or later

### 7. Windsurf IDE
- **Directory**: `.windsurf/workflows/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `/` (slash)
- **Features**: Workflow format, commands only (no skills)
- **Recommended model**: Claude Sonnet 4.5 or later, GPT-4

---

## 💡 Recommended Platform Selection

### When to Choose Claude Code

- **Complex projects**: Multiple specialized domains (API design, DB design, security, etc.)
- **Multi-agent coordination needed**: Automatic coordination with @orchestrator
- **Advanced quality assurance**: Automatic auditing with @constitution-enforcer and @traceability-auditor
- **Leveraging specialized skills**: 25 role-specific AIs
- **Full automation**: Automatic context loading, automatic workflow execution

### When Other Platforms Are Sufficient

- **Simple projects**: Single domain, small to medium scale
- **Basic SDD**: Requirements → Design → Implementation → Validation flow
- **Manual coordination is acceptable**: Users explicitly run commands
- **Platform constraints**: Use of GitHub Copilot, Cursor, etc. is mandatory

---

## 📚 Documentation Structure

The following directory structure is generated on all platforms:

```
project/
├── .{agent}/              # Per-agent directory
│   ├── skills/            # Claude Code only (25 skills)
│   └── commands/          # All agents (9 commands)
├── steering/              # Shared by all agents
│   ├── structure.md       # Architecture
│   ├── tech.md            # Technology stack
│   ├── product.md         # Business context
│   └── rules/
│       └── constitution.md  # 9 Constitutional Articles
├── templates/             # Document templates
└── storage/               # Generated specifications
    ├── specs/             # Requirements and design
    ├── changes/           # Change history
    └── features/          # Feature records
```

---

## 🎯 Conclusions and Recommendations

### Key Findings

1. **Feature inequality**: Claude Code's 25 exclusive skills (Skills API) are unavailable on other platforms
2. **Basic feature parity**: The 9 commands, steering system, and Constitutional governance are available on all platforms
3. **Automation level gap**: Claude Code is fully automated, others are semi-automated (manual coordination required)

### Recommendations for Users

#### Claude Code Users
- **Maximum utilization**: 25 skills, @orchestrator, automated workflows
- **Advanced features**: Multi-agent coordination, automatic Constitutional enforcement, traceability auditing

#### Other Platform Users
- **Basic SDD workflow available**: Requirements → Design → Implementation → Validation
- **Manual coordination required**: Running commands, managing context
- **Future extensibility**: Will become available automatically if the platform adds Skills API support

### Implications for the Development Team

- **Consider porting the Skills API**: Evaluate Skills API support for GitHub Copilot, Cursor, etc.
- **Possible alternative implementations**: Integration via MCP (Model Context Protocol), etc.
- **Expand documentation**: Provide manual workflow examples for other platforms

---

**Report date**: 2025-11-17  
**MUSUBI version**: v0.1.2  
**Survey scope**: All 7 supported platforms
