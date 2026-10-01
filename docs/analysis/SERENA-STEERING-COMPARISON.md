# Serena vs MUSUBI Steering - Feature Comparison and Applicability Analysis

## Investigation date: 2025-11-22

## 1. Key Features of Serena

### 1.1 Project Management Features

**`.serena/project.yml`**
- Project name
- Supported language list
- Excluded tools settings
- Initial prompt
- Read-only mode
- Encoding settings

### 1.2 Memory System (`.serena/memories/`)

**Persistent project knowledge management:**
- `serena_core_concepts_and_architecture.md` - Architecture concepts
- `serena_repository_structure.md` - Repository structure
- `suggested_commands.md` - Recommended commands
- `adding_new_language_support_guide.md` - Guide to adding languages

**Characteristics:**
- Stored in Markdown format
- Project-specific knowledge
- Loaded on demand by AI agents
- Persisted across conversations

### 1.3 Advanced Toolset

**Language server integration (LSP):**
- Symbol search (`find_symbol`)
- Reference search (`find_referencing_symbols`, `find_referencing_code_snippets`)
- Symbol-based editing (`insert_after_symbol`, `replace_symbol_body`)
- Supports 30+ languages

**Memory tools:**
- `write_memory` - Write memory
- `read_memory` - Read memory
- `list_memories` - List memories
- `delete_memory` - Delete memory

**Project management:**
- `activate_project` - Switch project
- `onboarding` - Analyze project structure
- `initial_instructions` - Get initial instructions

**Metacognitive tools:**
- `think_about_collected_information` - Assess information completeness
- `think_about_task_adherence` - Check task progress
- `think_about_whether_you_are_done` - Determine completion

### 1.4 Context and Mode System

**Dynamic tool switching:**
- Change the toolset depending on context
- Change behavior by switching modes
- Project-specific settings

## 2. Current State of MUSUBI Steering

### 2.1 Current Implementation

**Directory structure:**
```
steering/
├── product.md / product.ja.md     - Business context
├── structure.md / structure.ja.md - Architecture patterns
├── tech.md / tech.ja.md           - Technology stack
├── rules/                         - Constitution and rules
└── templates/                     - Templates
```

**Characteristics:**
- Static Markdown documents
- Both English and Japanese versions required
- Read and referenced by agents
- Mostly manual updates

### 2.2 Challenges

1. **No dynamic updates**: No automatic updates when the codebase changes
2. **No memory management**: No knowledge persistence across conversations
3. **No symbol-level analysis**: Directory/file level only
4. **No project switching support**: Assumes a single project

## 3. Applicability Assessment of Serena Features

### 3.1 High Priority (Immediately applicable)

#### ✅ Memory System

**Implementation proposal:**
```
steering/
├── memories/                      # New
│   ├── architecture_decisions.md # ADR-style records
│   ├── development_workflow.md   # Development workflow
│   ├── domain_knowledge.md       # Domain knowledge
│   └── suggested_commands.md     # Recommended commands
```

**Benefits:**
- Accumulate project-specific knowledge
- Maintain knowledge across conversations
- Shareable between agents
- A mechanism that learns and grows

**Implementation approach:**
1. Create the `steering/memories/` directory
2. Add memory management to the steering agent
3. Implement read_memory and write_memory commands
4. Add memory reference capability for other agents

#### ✅ Project Configuration File

**Implementation proposal:**
```
steering/
├── project.yml                    # New
│   ├── project_name
│   ├── languages: [typescript, python]
│   ├── frameworks: [react, fastapi]
│   ├── excluded_patterns
│   └── custom_rules
```

**Benefits:**
- Make project settings explicit
- Customize agent behavior
- Manage exclusion patterns
- Centralize metadata management

### 3.2 Medium Priority (Incremental adoption)

#### 🔶 Onboarding Feature

**Implementation proposal:**
```
musubi onboard
→ Analyze project structure
→ Detect tech stack
→ Generate initial steering documents
→ Initialize memories
```

**Benefits:**
- Quick application to new projects
- Improved accuracy through automated analysis
- Standardized initial setup

**Implementation steps:**
1. Develop codebase analysis tool
2. Tech stack detection logic
3. Automatic template generation
4. CLI integration (`musubi-init` extension)

#### 🔶 Auto-Update and Drift Detection

**Implementation proposal:**
```
musubi steering-sync
→ Detect codebase changes
→ Analyze differences from steering documents
→ Propose updates
→ (After user approval) Update documents
```

**Benefits:**
- Keep documents fresh
- Reduce the burden of manual updates
- Synchronize code and documents

### 3.3 Low Priority (Future consideration)

#### ⚪ LSP Integration

**Challenges:**
- Complex implementation (30-language support)
- Increased dependencies
- Maintenance cost

**Alternatives:**
- Grep/Glob tools provide sufficient coverage
- Introduce per language incrementally as needed

#### ⚪ Multi-Project Support

**Current state:**
- MUSUBI assumes a single project

**In the future:**
- Consider when supporting monorepos
- Sub-project management

## 4. Recommended Implementation Roadmap

### Phase 1: Introduce the Memory System (v0.2.0)

**Goal:** Persist knowledge across conversations

**Implementation:**
1. `steering/memories/` directory structure
2. Memory management feature in the steering agent
3. Basic memory CRUD operations
4. Memory references from other agents

**Deliverables:**
- Memory management documentation
- Memory templates
- Usage guide

### Phase 2: Project Configuration (v0.2.1)

**Goal:** Standardize project configuration

**Implementation:**
1. `steering/project.yml` schema definition
2. Configuration loading feature
3. Agent behavior customization
4. Validation feature

### Phase 3: Onboarding Automation (v0.3.0)

**Goal:** Rapid application to new projects

**Implementation:**
1. Codebase analysis tool
2. Tech stack detection
3. Automatic document generation
4. `musubi onboard` CLI command

### Phase 4: Auto-Update and Sync (v0.4.0)

**Goal:** Keep documents fresh

**Implementation:**
1. Change detection mechanism
2. Diff analysis logic
3. Update proposal generation
4. `musubi steering-sync` CLI

## 5. Concrete Implementation Examples

### 5.1 Memory System

**File structure:**
```
steering/
├── memories/
│   ├── README.md                      # Memory system description
│   ├── architecture_decisions.md     # ADR
│   ├── development_workflow.md       # Development workflow
│   ├── domain_knowledge.md           # Domain knowledge
│   ├── suggested_commands.md         # Recommended commands
│   └── lessons_learned.md            # Lessons learned
```

**Steering agent extension:**
```markdown
## Memory Management Commands

### Write Memory
📝 Record new knowledge in memory:
- Architecture Decision: Important design decisions
- Development Workflow: Development process
- Domain Knowledge: Business logic
- Lessons Learned: Past lessons

### Read Memory
📖 Refer to existing memories to check past decisions and knowledge

### List Memories
📋 List all available memories

### Update Memory
✏️ Update and revise existing memories
```

**Usage examples:**
```
User: What authentication method does this project use?

Agent: Checking memory...
[read_memory: domain_knowledge.md]

This project uses authentication with JWT + Refresh Token.
Details are recorded in steering/memories/domain_knowledge.md.
```

### 5.2 project.yml Schema

```yaml
# steering/project.yml
project_name: "musubi-sdd"

# Project metadata
description: "Ultimate Specification Driven Development Tool"
version: "0.1.7"

# Supported languages
languages:
  - typescript
  - javascript
  - python
  - markdown

# Frameworks and libraries
frameworks:
  - name: "Node.js"
    version: ">=18.0.0"
  - name: "Jest"
    purpose: "testing"

# Project structure conventions
conventions:
  architecture_pattern: "CLI Tool with Agent System"
  directory_structure: "src/agents, src/templates"
  naming_convention: "kebab-case for files, camelCase for code"

# Steering configuration
steering:
  auto_update: false          # Enable auto-update
  update_frequency: "weekly"  # Update frequency
  
  # Exclusion patterns
  excluded_paths:
    - "node_modules/**"
    - "dist/**"
    - ".git/**"
    - "References/**"
  
  # Memory settings
  memories:
    max_size_kb: 100          # Maximum memory file size
    retention_days: 90        # Retention period for old memories

# Agent configuration
agents:
  default_language: "ja"      # Default language
  bilingual_output: true      # Generate both English and Japanese
  
# Custom rules
custom_rules:
  - "All agents must implement gradual output pattern"
  - "Files >300 lines must be split into parts"
  - "Always generate both English and Japanese versions"
```

### 5.3 Onboarding Feature

**CLI command:**
```bash
musubi onboard [directory]

Options:
  --auto-approve    Auto-approve mode
  --skip-memories   Skip memory initialization
  --language <lang> Document language (en/ja/both)
```

**Execution flow:**
```
1. Analyze project structure
   → Traverse directory tree
   → Detect package.json / pyproject.toml
   
2. Tech stack detection
   → Analyze dependencies
   → Identify framework
   
3. Generate steering documents
   → structure.md / structure.ja.md
   → tech.md / tech.ja.md
   → product.md / product.ja.md
   
4. Generate project.yml
   → Configure based on detected information
   
5. Initialize memories
   → Create initial memory files
   → Place templates
   
6. Completion report
   → List of generated files
   → Next steps guidance
```

## 6. Rationale for Implementation Priorities

### Why the Memory System Is the Top Priority

1. **Delivers value immediately**
   - No additional dependencies required
   - Markdown format is compatible with existing tools
   - Relatively simple to implement

2. **Improves agent capabilities**
   - Maintains knowledge across conversations
   - Records project-specific decisions
   - A mechanism that learns and grows

3. **Foundation for other features**
   - Storage destination for onboarding results
   - Reference source for auto-update
   - Key to inter-agent collaboration

### Why LSP Integration Is Low Priority

1. **Implementation cost vs. benefit**
   - Supporting 30 languages is a large investment
   - Current Grep/Glob can cover 80%
   - Heavy maintenance burden

2. **Nature of MUSUBI**
   - A specification-driven development tool
   - Emphasizes design and planning over code editing
   - Symbol-level operations are low priority

3. **Can be introduced incrementally**
   - Start with the languages that are needed
   - Reduce burden by making it a plugin
   - Consider after v1.0

## 7. Conclusion

### Features to Adopt (Phase 1-2)

✅ **Memory system** - Top-priority implementation
✅ **Project configuration (project.yml)** - Early implementation

### Incremental Adoption (Phase 3-4)

🔶 **Onboarding feature** - Targeted for v0.3.0
🔶 **Auto-update and sync** - Targeted for v0.4.0

### Deferred / Long-term Consideration

⚪ **LSP integration** - After v1.0, as needed
⚪ **Multi-project** - When supporting monorepos

### Next Actions

1. **Create the memory system design document**
2. **Define the steering/memories/ directory structure**
3. **Add memory management to the steering agent**
4. **Define the project.yml schema**
5. **Create the implementation PR (v0.2.0)**

---

**Investigation completed**: 2025-11-22
**Investigator**: GitHub Copilot (Claude Sonnet 4.5)
**Reference**: References/serena project analysis
