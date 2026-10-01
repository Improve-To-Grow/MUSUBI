# MUSUBI Multi-Agent Platform Design

## 🎯 New Approach: Agent-Based Distribution

Distribute the capabilities of the 25 specialized agents following each platform's standard conventions.

### Per-Platform Placement Strategy

#### 1. **GitHub Copilot**
- **Standard**: `.github/copilot-instructions.md` (repository-wide) + `.github/instructions/*.instructions.md` (per path)
- **AGENTS.md support**: ✅ (.github/AGENTS.md or any directory)
- **MUSUBI implementation**:
  ```
  .github/
    copilot-instructions.md         # Main instructions (references steering)
    AGENTS.md                        # 25 agent definitions
    prompts/                         # 9 SDD commands (existing)
      sdd-steering.md
      sdd-requirements.md
      ... (9 commands)
  ```

#### 2. **Cursor IDE**  
- **Standard**: `.cursorrules` (single file) or `.cursor/` directory
- **MUSUBI implementation**:
  ```
  .cursorrules                       # Main instructions
  .cursor/
    AGENTS.md                        # 25 agent definitions
    commands/                        # 9 SDD commands (existing)
      sdd-steering.md
      ... (9 commands)
  ```

#### 3. **Claude Code**
- **Standard**: `.claude/CLAUDE.md` + `.claude/skills/` (Skills API)
- **MUSUBI implementation**: Keep as is
  ```
  .claude/
    CLAUDE.md                        # Main instructions
    skills/                          # 25 skills (dedicated Skills API)
      orchestrator/SKILL.md
      ... (25 skills)
    commands/                        # 9 SDD commands
      sdd-steering.md
      ... (9 commands)
  ```

#### 4. **Gemini CLI**
- **Standard**: `GEMINI.md` root file
- **MUSUBI implementation**:
  ```
  GEMINI.md                          # Main instructions + 25 agent definitions
  .gemini/
    commands/                        # 9 SDD commands (TOML format)
      sdd-steering.toml
      ... (9 commands)
  ```

#### 5. **Windsurf IDE**
- **Standard**: `.windsurf/` directory
- **MUSUBI implementation**:
  ```
  .windsurf/
    AGENTS.md                        # 25 agent definitions
    workflows/                       # 9 SDD commands
      sdd-steering.md
      ... (9 commands)
  ```

#### 6. **Codex CLI**
- **Standard**: Unknown (needs investigation) - presumed similar to GitHub Copilot
- **MUSUBI implementation**:
  ```
  .codex/
    AGENTS.md                        # 25 agent definitions
    prompts/                         # 9 SDD commands
      sdd-steering.md
      ... (9 commands)
  ```

#### 7. **Qwen Code**
- **Standard**: Unknown (needs investigation) - presumed generic Markdown
- **MUSUBI implementation**:
  ```
  .qwen/
    AGENTS.md                        # 25 agent definitions
    commands/                        # 9 SDD commands
      sdd-steering.md
      ... (9 commands)
  ```

## 📝 AGENTS.md Format

Compliant with the OpenAI agents.md specification:

```markdown
# MUSUBI - Specification Driven Development AI Agents

## Available Agents

### @orchestrator
**Role**: Master coordinator for complex multi-agent workflows
**Capabilities**:
- Orchestrates 24 specialized agents
- Manages cross-domain dependencies
- Ensures constitutional compliance

**When to use**:
- Multi-phase projects requiring multiple specialties
- Complex features spanning architecture, security, performance
- Automated end-to-end SDD workflows

**Example**: 
@orchestrator Implement user authentication with database, API, tests, and security audit

---

### @steering
**Role**: Project memory manager
**Capabilities**:
- Analyzes codebase structure
- Generates/maintains steering context
- Updates architecture documentation

**When to use**:
- Initial project setup
- After major architectural changes
- Before starting new features

**Example**:
@steering Analyze this React/Node.js project and create steering context

---

### @requirements-analyst
**Role**: Requirements analysis and EARS specification
**Capabilities**:
- Stakeholder interview simulation
- EARS-format requirements generation
- Acceptance criteria definition
- SRS document creation

**When to use**:
- Starting new features
- Clarifying ambiguous requirements
- Creating formal specifications

**Example**:
@requirements-analyst Create EARS requirements for user registration with email verification

---

(... remaining 22 agents ...)
```

## 🔄 Implementation Steps

### Phase 1: Create the AGENTS.md Template
1. Unified agent definitions in `src/templates/agents/shared/AGENTS.md`
2. Describe the role, capabilities, and usage examples of the 25 agents

### Phase 2: Per-Platform Placement Logic
1. Update `src/agents/registry.js`: add `layout.agentsFile` for each platform
2. Update `src/init.js`: add AGENTS.md copy logic

### Phase 3: Generate AGENTS.md from Existing Skills
1. Parse Claude Code's `skills/*/SKILL.md`
2. Convert to the AGENTS.md format
3. Into a format shareable across all platforms

### Phase 4: Documentation Updates
1. README.md: update how to invoke agents
2. PLATFORM-COMPARISON.md: reflect feature parity
3. product.md: "25 Claude Code skills" → "25 specialized agents (all platforms)"

## ✅ Expected Results

- **25 agents available on all platforms**
- **Compliant with each platform's standard conventions**
- **Claude Code's Skills API continues in its dedicated format**
- **Other platforms invoke agents via AGENTS.md**

## 🎯 Differences in Invocation

| Platform | Example Command | 
|------------------|------------|
| Claude Code | `@orchestrator <task>` (Skills API) |
| GitHub Copilot | `#` + reference "@orchestrator <task>" in chat |
| Cursor | `/` + reference "@orchestrator <task>" in chat |
| Gemini CLI | "@orchestrator <task>" after loading GEMINI.md |
| Windsurf | `/` + "@orchestrator <task>" referencing AGENTS.md |
| Codex | `/prompts:` + reference AGENTS.md |
| Qwen Code | `/` + reference AGENTS.md |

**Note**: The Skills API (`@agent`) is exclusive to Claude Code. Other platforms
reference the AGENTS.md definitions in natural language.
