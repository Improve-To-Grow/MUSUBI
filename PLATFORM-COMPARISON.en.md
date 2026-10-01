# MUSUBI - Cross-Platform Feature Comparison Report

**Survey Date**: 2025-11-17  
**Target Version**: MUSUBI v0.1.2

## 📊 Executive Summary

MUSUBI supports 7 AI coding agents, but there are **features exclusive to Claude Code (Skills API)**.

### Conclusion

**❌ On platforms other than Claude Code, not all of the features available in MUSUBI for Claude Code can be used**

- **✅ Equivalent features**: Commands (9), steering system, constitutional governance
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
2. **`sdd-requirements`** - Create EARS requirements specifications
3. **`sdd-design`** - Generate technical design (C4 diagrams, ADRs, API specifications)
4. **`sdd-tasks`** - Break down implementation tasks
5. **`sdd-implement`** - Test-first implementation
6. **`sdd-validate`** - Validate constitutional compliance

#### Brownfield (existing codebases - 3 commands)
7. **`sdd-change-init`** - Create a change proposal
8. **`sdd-change-apply`** - Implement a change
9. **`sdd-change-archive`** - Archive a change

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
- Article VII: Bilingual Documentation
- Article VIII: Single Source of Truth
- Article IX: Real Services in Tests

### 4. SDD Workflow

The 8-stage workflow is supported on all platforms:
1. Research
2. Requirements
3. Design
4. Tasks
5. Implementation
6. Testing
7. Deployment
8. Monitoring

---

## ❌ Claude Code Exclusive Features

### 25 Specialized Skills (Skills API)

Because **the Skills API is a Claude Code-only feature**, it is not available on other platforms.

#### Skill List (25)

**Orchestration (3 skills)**:
1. `@orchestrator` - Multi-agent integration and coordination
2. `@steering` - Project memory management
3. `@constitution-enforcer` - Constitutional governance enforcement

**Requirements & Planning (3 skills)**:
4. `@requirements-analyst` - Requirements analysis and EARS specifications
5. `@project-manager` - Project planning and scheduling
6. `@change-impact-analyzer` - Change impact analysis

**Architecture & Design (4 skills)**:
7. `@system-architect` - System architecture and C4 diagrams
8. `@api-designer` - REST/GraphQL/gRPC API design
9. `@database-schema-designer` - Database design and ER diagrams
10. `@ui-ux-designer` - UI/UX design and wireframes

**Development (1 skill)**:
11. `@software-developer` - Multi-language code implementation

**Quality & Review (5 skills)**:
12. `@test-engineer` - Unit, integration, and E2E testing
13. `@code-reviewer` - Code review and SOLID principles
14. `@bug-hunter` - Bug investigation and root cause analysis
15. `@quality-assurance` - QA strategy and test planning
16. `@traceability-auditor` - Traceability verification

**Security & Performance (2 skills)**:
17. `@security-auditor` - OWASP Top 10 and vulnerability detection
18. `@performance-optimizer` - Performance analysis and optimization

**Infrastructure (5 skills)**:
19. `@devops-engineer` - CI/CD pipelines and Docker/Kubernetes
20. `@cloud-architect` - AWS/Azure/GCP and IaC (Terraform/Bicep)
21. `@database-administrator` - Database operations and tuning
22. `@site-reliability-engineer` - SRE practices and monitoring
23. `@release-coordinator` - Release coordination and deployment strategy

**Documentation & Specialized (2 skills)**:
24. `@technical-writer` - Technical documentation and API docs
25. `@ai-ml-engineer` - ML model development and MLOps

### Skill Capabilities

Skills are more capable than simple prompts:
- **Context management**: Automatically loads steering files
- **Tool integration**: Integrates file reading/writing, search, and execution
- **Workflow automation**: Executes multiple steps automatically
- **Trigger words**: Activated automatically by specific keywords
- **Quality assurance**: Guarantees output format and traceability

---

## 📋 Detailed Feature Comparison

### Claude Code vs Other Platforms

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
| **Bilingual documentation** | ✅ | ✅ |
| **Multi-agent coordination** | ✅ @orchestrator | ❌ Manual |
| **Change impact analysis** | ✅ @change-impact-analyzer | ⚠️ Commands only |
| **Automatic constitution enforcement** | ✅ @constitution-enforcer | ⚠️ CLI only |
| **Automatic traceability auditing** | ✅ @traceability-auditor | ❌ Manual |
| **Role-specialized AI** | ✅ 25 skills | ❌ General-purpose AI only |

### Differences Between Commands and Skills

| Comparison Item | Commands | Skills (Claude Code only) |
|----------|----------|--------------------------|
| **Available platforms** | All 7 platforms | Claude Code only |
| **Implementation** | Markdown prompts | Skills API |
| **Automation level** | Semi-automatic | Fully automatic |
| **Context management** | Manual loading | Automatic loading |
| **Tool integration** | Explicit invocation | Implicit integration |
| **Complex workflows** | User coordination required | Automatic AI coordination |
| **Specialization** | General-purpose | Role-specialized (25 types) |
| **Trigger** | Explicit command | Automatic keyword activation |

---

## 🔍 Platform-Specific Characteristics

### 1. Claude Code (Default)
- **Directory**: `.claude/skills/`, `.claude/commands/`
- **Documentation**: `CLAUDE.md`
- **Prefix**: `/` (slash)
- **Characteristics**: **Skills API supported - 25 skills available**
- **Recommended models**: Claude Sonnet 4.5 or later

### 2. GitHub Copilot
- **Directory**: `.github/prompts/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `#` (hash)
- **Characteristics**: Commands only (no skills)
- **Recommended models**: Claude Sonnet 4.5 or later, GPT-4

### 3. Cursor IDE
- **Directory**: `.cursor/commands/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `/` (slash)
- **Characteristics**: Commands only (no skills)
- **Recommended models**: Claude Sonnet 4.5 or later, GPT-4

### 4. Gemini CLI
- **Directory**: `.gemini/commands/`
- **Documentation**: `GEMINI.md`
- **Prefix**: `/` (slash)
- **Format**: **TOML** (others use Markdown)
- **Characteristics**: Gemini-specific TOML format
- **Recommended models**: Gemini 2.0 Flash or later

### 5. Codex CLI
- **Directory**: `.codex/prompts/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `/prompts:`
- **Characteristics**: Commands only (no skills)
- **Recommended models**: GPT-4 or later

### 6. Qwen Code
- **Directory**: `.qwen/commands/`
- **Documentation**: `QWEN.md`
- **Prefix**: `/` (slash)
- **Characteristics**: Commands only (no skills)
- **Recommended models**: Qwen 2.5 Coder or later

### 7. Windsurf IDE
- **Directory**: `.windsurf/workflows/`
- **Documentation**: `AGENTS.md`
- **Prefix**: `/` (slash)
- **Characteristics**: Workflow format, commands only (no skills)
- **Recommended models**: Claude Sonnet 4.5 or later, GPT-4

---

## 💡 Recommended Platform Selection

### When to Choose Claude Code

- **Complex projects**: Multiple specialized domains (API design, DB design, security, etc.)
- **Multi-agent coordination needed**: Automatic coordination via @orchestrator
- **Advanced quality assurance**: Automatic auditing via @constitution-enforcer and @traceability-auditor
- **Leveraging specialized skills**: 25 role-specialized AIs
- **Full automation**: Automatic context loading, automatic workflow execution

### When Other Platforms Are Sufficient

- **Simple projects**: Single domain, small to medium scale
- **Basic SDD**: Requirements → Design → Implementation → Validation flow
- **Manual coordination is acceptable**: The user runs commands explicitly
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
│       └── constitution.md  # 9 constitutional articles
├── templates/             # Document templates
└── storage/               # Generated specifications
    ├── specs/             # Requirements & design
    ├── changes/           # Change history
    └── features/          # Feature records
```

---

## 🎯 Conclusions and Recommendations

### Key Findings

1. **Feature inequality**: The 25 Claude Code-only skills (Skills API) are not available on other platforms
2. **Equality of basic features**: The 9 commands, steering system, and constitutional governance are available on all platforms
3. **Difference in automation level**: Claude Code is fully automated; the others are semi-automatic (manual coordination required)

### Recommendations for Users

#### Claude Code Users
- **Make the most of it**: 25 skills, @orchestrator, automated workflows
- **Advanced features**: Multi-agent coordination, automatic constitution enforcement, traceability auditing

#### Users of Other Platforms
- **Basic SDD workflow available**: Requirements → Design → Implementation → Validation
- **Manual coordination required**: Running commands, managing context
- **Future extensibility**: If a platform adds Skills API support, skills become available automatically

### Implications for the Development Team

- **Consider porting the Skills API**: Consider Skills API support for GitHub Copilot, Cursor, etc.
- **Alternative implementation possibilities**: E.g., integration via MCP (Model Context Protocol)
- **Improve documentation**: Provide examples of manual workflows on other platforms

---

**Report Date**: 2025-11-17  
**MUSUBI Version**: v0.1.2  
**Scope**: All 7 supported platforms
