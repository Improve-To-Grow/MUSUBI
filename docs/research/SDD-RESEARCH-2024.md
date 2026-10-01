# Specification Driven Development (SDD) Research Report

**Research date:** December 9, 2024  
**Research purpose:** Survey recent articles and practices related to SDD, and summarize best practices, tool comparisons, and key features/concepts

---

## 1. Latest SDD Best Practices

### 1.1 Context-First Design

In modern SDD, providing **clear context** to AI coding agents is considered the most important factor.

| Practice | Description |
|------------|------|
| **Define project rules** | Define project-specific rules in files such as `.cursorrules`, `CLAUDE.md`, and `steering/` |
| **Document coding conventions** | Document style guides, naming conventions, and architecture patterns |
| **Make dependencies explicit** | Clearly specify the libraries, frameworks, and versions used |
| **Explain directory structure** | Clearly describe the project structure and the role of each directory |

### 1.2 Incremental Specification Writing

```
High-level specification → Detailed specification → Implementation instructions → Validation criteria
```

1. **Vision/Goals**: What you want to achieve
2. **Functional requirements**: List of required features
3. **Technical specification**: Concrete implementation approach
4. **Acceptance criteria**: Completion conditions and tests

### 1.3 Iterative Improvement Cycle

- A cycle of **Write spec → Generate code → Review → Update spec**
- Validate AI output and continuously improve the specification
- Accumulate learned patterns in `memories/` and `rules/`

---

## 2. SDD Tool and Framework Comparison

### 2.1 Overview of Major Tools

| Tool | Category | Features | Stars |
|--------|----------|------|--------|
| **Cursor** | AI IDE | Rules for AI, codebase understanding, Agent feature | N/A |
| **Claude Code** | Terminal agent | MCP support, Unix philosophy, direct file editing | N/A |
| **Windsurf (Codeium)** | AI IDE | Cascade, flow state maintenance, deep context awareness | N/A |
| **GPT Engineer** | Code generation platform | Natural language to code, evolved into Lovable.dev | 55.1k |
| **Aider** | Terminal pair programming | Git integration, coding convention support, multi-LLM | Very popular |
| **Codegen** | Code agent OS | Automatic PR generation, ticket integration, MCP support | N/A |
| **Bolt.new** | Web Builder | Chat-based development, deployment integration | N/A |

### 2.2 Detailed Comparison

#### Cursor

**Key features:**
- Customize AI behavior via `.cursorrules` files
- Codebase embedding model (whole-codebase understanding)
- Agent mode (autonomous coding)
- Rules and memory features
- MCP (Model Context Protocol) support

**Strengths:**
- VS Code compatible
- Intuitive UI
- Community rules (awesome-cursorrules: 36k stars)

#### Claude Code

**Key features:**
- Terminal-native
- Direct file editing and command execution
- MCP integration (Google Drive, Jira, Slack, etc.)
- Scriptable (pipeline support)
- Enterprise ready

**Strengths:**
- Faithful to the Unix philosophy
- Easy to integrate into existing workflows
- CI/CD integration

#### Windsurf (Cascade)

**Key features:**
- Cascade: deep codebase understanding
- Flow state maintenance design
- Supercomplete (next action prediction)
- Tab to Jump (cursor position prediction)
- MCP support

**Strengths:**
- 94% of code is AI-generated
- Used by 59% of Fortune 500 companies
- Automatic linter fixes

#### Aider

**Key features:**
- Git integration (automatic commits)
- Multi-LLM support
- Configuration via `.aider.conf.yml`
- `/architect` command
- Coding convention specification

**Strengths:**
- Open source
- Flexible model selection
- Detailed documentation

#### GPT Engineer → Lovable.dev

**Key features:**
- Describe software specifications in natural language
- Instructions via `prompt` file
- AI identity configuration via `preprompts`
- Vision support (image input)
- Benchmark feature

**Evolution:**
- Lovable.dev: Build apps via chat
- Bolt.new: Web builder provided by StackBlitz

---

## 3. Features and Concepts Valued in SDD

### 3.1 Context Management

```
┌─────────────────────────────────────────────────────────┐
│                   Context Hierarchy                      │
├─────────────────────────────────────────────────────────┤
│  Global Rules     │ Organization-wide coding conventions │
│  Project Rules    │ Project-specific settings            │
│  File Rules       │ Instructions by file type            │
│  Task Context     │ Information about the current task   │
│  Conversation     │ Dialogue history                     │
└─────────────────────────────────────────────────────────┘
```

### 3.2 List of Key Concepts

| Concept | Description | Implementation Example |
|------|------|--------|
| **Rules/Specifications** | Settings that define AI behavior | `.cursorrules`, `CLAUDE.md`, `steering/` |
| **Memory** | Persistence of learned information | `memories/`, project knowledge |
| **Context Window** | Available context size | Model-dependent (128K-200K tokens) |
| **Repository Map** | Structural map of the codebase | Aider repomap |
| **Codebase Embedding** | Vector representation of code | Cursor, Windsurf |
| **Agent Mode** | Autonomous task execution | Cursor Agent, Claude Code |
| **MCP (Model Context Protocol)** | Protocol for external tool integration | Supported by all major tools |
| **Pre-prompts** | AI identity configuration | GPT Engineer |
| **Checkpoints** | Saving and restoring working state | musubi checkpoint |

### 3.3 Quality Assurance Features

- **Linter integration**: Automatic error detection and fixing
- **Test generation**: Automatic test generation from specifications
- **Code review**: AI-based review (Bugbot, etc.)
- **Refactoring**: Automatic refactoring suggestions

---

## 4. Integration Patterns with AI Coding Agents

### 4.1 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   IDE   │  │ Terminal│  │   Web   │  │  Slack  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Context Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Rules     │  │   Memory    │  │  Codebase   │          │
│  │   Engine    │  │   Store     │  │  Index      │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Agent Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Planner   │  │   Executor  │  │   Reviewer  │          │
│  │             │◄─┤             │◄─┤             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   LLM Layer                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Claude  │  │  GPT    │  │ Gemini  │  │ Custom  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 List of Integration Patterns

#### Pattern 1: IDE Integration
```
Developer ←→ AI IDE (Cursor/Windsurf) ←→ LLM
                    ↓
              Codebase Context
```
- **Use case**: Everyday coding
- **Examples**: Cursor, Windsurf, GitHub Copilot

#### Pattern 2: Terminal Integration
```
Developer ←→ Terminal Agent (Claude Code/Aider) ←→ LLM
                    ↓
              Git Repository
```
- **Use case**: Command-line preference, script integration
- **Examples**: Claude Code, Aider

#### Pattern 3: Ticket/PR Integration
```
Issue Tracker ←→ Code Agent (Codegen) ←→ LLM
                    ↓
              Pull Request
```
- **Use case**: Automated task processing
- **Examples**: Codegen, Sweep

#### Pattern 4: MCP Integration
```
                 ┌─── Figma
Developer ←→ MCP Server ←→ LLM
                 ├─── Slack
                 ├─── Jira
                 └─── Custom Tools
```
- **Use case**: Multi-tool integration
- **Examples**: All major platforms support MCP

### 4.3 Integration with musubi-sdd

The musubi project implements the following SDD features:

| Feature | Corresponding Command | Description |
|------|-------------|------|
| Specification management | `musubi-requirements` | Requirements definition management |
| Design management | `musubi-design` | Design document generation |
| Code analysis | `musubi-analyze` | Codebase analysis |
| Gap analysis | `musubi-gaps` | Detect differences between specification and implementation |
| Change tracking | `musubi-change` | Change history management |
| Checkpoints | `musubi-checkpoint` | Save and restore state |
| Memory | `musubi-remember` | Persist learned information |
| Steering | `steering/` | Control of AI behavior |

---

## 5. Current Trends and New Approaches

### 5.1 Trends for 2024-2025

1. **Agentic Coding (autonomous coding)**
   - From simple completion to autonomous task execution
   - Plan -> execute -> verify loop

2. **Spread of MCP (Model Context Protocol)**
   - Standardization led by Anthropic
   - Unified interface for external tool integration

3. **Expansion of context windows**
   - 128K → 200K tokens
   - Understand more of the codebase at once

4. **Multimodal support**
   - Code generation from images (UI designs)
   - Voice input support

5. **Enterprise readiness**
   - SOC 2 compliance
   - On-premises deployment
   - SSO integration

### 5.2 New Approaches

#### Flow State Maintenance Design (Windsurf)
```
Developer's thought flow
    ↓
AI anticipates and predicts ahead
    ↓
Seamless completions and suggestions
    ↓
Development continues without interruption
```

#### Specification-Driven Workflow (musubi SDD)
```
Steering files
    ↓
Automatic specification generation
    ↓
Gap analysis
    ↓
Code generation
    ↓
Validation and feedback
```

#### Team Knowledge Integration
- Accumulate project-specific knowledge
- Knowledge sharing across teams
- Learning from code reviews

---

## 6. Recommendations (Proposals for the musubi Project)

### 6.1 Short-Term Improvements

1. **Strengthen MCP support**
   - Integration with major tools (Figma, Jira, Slack)
   - Provide templates for custom MCP servers

2. **Standardize rule formats**
   - Compatibility with `.cursorrules`
   - Support for the `CLAUDE.md` format

3. **Improve context management**
   - More efficient codebase indexing
   - Selective context provision

### 6.2 Medium- to Long-Term Direction

1. **Strengthen Agentic features**
   - Automate plan -> execute -> verify
   - Multi-agent collaboration

2. **Expand learning features**
   - Automatic learning from projects
   - Accumulation of best practices

3. **Enterprise features**
   - Rule sharing across teams
   - Audit logs
   - Compliance support

---

## 7. Reference Resources

### Official Documentation
- [Claude Code Docs](https://code.claude.com/docs/en/overview)
- [Cursor Features](https://cursor.com/features)
- [Aider Documentation](https://aider.chat/docs/)
- [Windsurf](https://windsurf.com/)

### Community Resources
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) - 36k stars
- [GPT Engineer](https://github.com/AntonOsika/gpt-engineer) - 55.1k stars

### Articles and Blogs
- [Claude's Character - Anthropic Research](https://www.anthropic.com/research/claude-character)
- [Lovable.dev Blog](https://lovable.dev/blog)
- [Codegen Blog](https://codegen.com/blog)

---

*This report is based on information as of December 2024. The AI development tools field is evolving rapidly, so please refer to each official site for the latest information.*
