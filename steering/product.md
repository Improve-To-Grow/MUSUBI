# Product Context

## Description

Ultimate Specification Driven Development Tool with 31 Agents for 7 AI Coding Platforms + MCP Integration (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Windsurf, Codex, Qwen Code)

## Purpose

MUSUBI is a tool that improves the quality and consistency of AI coding agents through Specification Driven Development (SDD).

### Core Value Proposition

- **Constitutional Governance**: Consistent development guidance through 9 Constitutional Articles
- **Review Gate Engine**: Quality validation at the Requirements, Design, and Implementation gates
- **Multi-Agent Orchestration**: Multi-agent coordination through Swarm, Triage, and Handoff patterns
- **7 Platform Support**: Claude Code, GitHub Copilot, Cursor, Gemini CLI, Windsurf, Codex, Qwen Code
- **MCP Integration**: Advanced code analysis through CodeGraph MCP
- **Traceability**: Complete traceability from requirements to tests

## v6.3.0 Features (New)

### SDD Document Path Unification

| Document Type | Storage Path | Purpose |
|---------------|--------------|---------|
| Requirements | `storage/specs/` | EARS format requirements |
| Design | `storage/design/` | C4 + ADR design documents |
| Tasks | `storage/tasks/` | Task breakdown documents |
| Validation | `storage/validation/` | Validation reports |

### Review Gate Engine (v6.2.0)

| Feature | Description |
|---------|-------------|
| **Requirements Gate** | Validates EARS format, priority, and acceptance criteria |
| **Design Gate** | Validates C4 model, ADRs, and component design |
| **Implementation Gate** | Validates code quality, test coverage, and naming conventions |
| **Review Prompts** | `#sdd-review-requirements`, `#sdd-review-design`, etc. |

### Workflow Dashboard

| Feature | Description |
|---------|-------------|
| **Progress Visualization** | Real-time display of progress across the 5 stages |
| **Blocker Management** | Add, resolve, and track blockers |
| **Transition Recording** | Recording and analysis of stage transitions |
| **Sprint Planning** | Task priority and velocity management |

### Traceability System

| Feature | Description |
|---------|-------------|
| **Auto-Extraction** | Automatic ID extraction from code, tests, and commits |
| **Gap Detection** | Detects missing design, implementation, and tests |
| **Matrix Storage** | YAML-based traceability matrix |

### Enterprise Features

| Feature | Description |
|---------|-------------|
| **Error Recovery** | Error analysis and automatic generation of recovery steps |
| **Rollback Manager** | Rollback at the file, commit, stage, or sprint level |
| **CI Reporter** | Result reporting to GitHub Actions |
| **Tech Article Generator** | Article generation for Qiita, Zenn, Medium, and Dev.to |

### CLI Commands (24+)

- `musubi init` - Initialize a project
- `musubi requirements` - Generate requirements
- `musubi design` - Generate design documents
- `musubi tasks` - Task breakdown
- `musubi validate` - Validate Constitution compliance
- `musubi orchestrate` - Run multi-agent execution
- `musubi release` - Release management
- `musubi config` - Configuration management
- `musubi dashboard` - Workflow dashboard (new in v6.2.0)

## Target Users

### Primary Users

- **Development teams**: Development teams that use AI coding agents
- **Architects**: Architects who want to establish consistent development practices
- **Enterprises**: Organizations that need quality control on large-scale projects
- **QA teams**: Quality assurance teams that use traceability and quality gates

### Use Cases

1. **New projects**: Start a project with the SDD workflow
2. **Existing projects**: Introduce SDD practices incrementally
3. **Monorepos**: Integrated management of multiple packages
4. **Enterprise**: Customizable Constitution levels
5. **Quality gates**: Step-by-step quality validation with the Review Gate Engine
6. **Traceability**: Complete tracking from requirements to tests

---

*Updated: 2026-01-02 - MUSUBI v6.3.0*
