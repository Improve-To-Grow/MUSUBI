# MUSUBI Multi-Agent Support Design

## Overview

Expand MUSUBI from Claude Code-only to support 7 AI coding agents:

1. **Claude Code** (current) - Claude Code CLI with Skills API
2. **GitHub Copilot** - GitHub Copilot with custom prompts
3. **Cursor IDE** - Cursor with custom commands
4. **Gemini CLI** - Google Gemini CLI
5. **Codex CLI** - OpenAI Codex CLI
6. **Qwen Code** - Alibaba Qwen Code
7. **Windsurf IDE** - Windsurf with workflows

## Architecture (Inspired by cc-sdd)

### 1. Agent Registry

Create `src/agents/registry.js` with agent definitions:

```javascript
const agentDefinitions = {
  'claude-code': {
    label: 'Claude Code',
    description: 'Installs MUSUBI skills in `.claude/skills/`, commands in `.claude/commands/`, steering in `steering/`',
    aliasFlags: ['--claude-code', '--claude'],
    layout: {
      skillsDir: '.claude/skills',      // MUSUBI-specific: 25 skills
      commandsDir: '.claude/commands',
      agentDir: '.claude',
      docFile: 'CLAUDE.md',
    },
    commands: {
      init: '/sdd-steering',
      requirements: '/sdd-requirements <feature>',
      design: '/sdd-design <feature>',
      tasks: '/sdd-tasks <feature>',
      implement: '/sdd-implement <feature>',
      validate: '/sdd-validate <feature>',
    },
    manifestId: 'claude-code',
  },
  'github-copilot': {
    label: 'GitHub Copilot',
    description: 'Installs MUSUBI prompts in `.github/prompts/`, steering in `steering/`',
    aliasFlags: ['--copilot', '--github-copilot'],
    layout: {
      commandsDir: '.github/prompts',
      agentDir: '.github',
      docFile: 'AGENTS.md',
    },
    commands: {
      init: '#sdd-steering',
      requirements: '#sdd-requirements <feature>',
      design: '#sdd-design <feature>',
      tasks: '#sdd-tasks <feature>',
      implement: '#sdd-implement <feature>',
      validate: '#sdd-validate <feature>',
    },
    manifestId: 'github-copilot',
  },
  'cursor': {
    label: 'Cursor IDE',
    description: 'Installs MUSUBI commands in `.cursor/commands/`, steering in `steering/`',
    aliasFlags: ['--cursor'],
    layout: {
      commandsDir: '.cursor/commands',
      agentDir: '.cursor',
      docFile: 'AGENTS.md',
    },
    commands: {
      init: '/sdd-steering',
      requirements: '/sdd-requirements <feature>',
      design: '/sdd-design <feature>',
      tasks: '/sdd-tasks <feature>',
      implement: '/sdd-implement <feature>',
      validate: '/sdd-validate <feature>',
    },
    manifestId: 'cursor',
  },
  'gemini-cli': {
    label: 'Gemini CLI',
    description: 'Installs MUSUBI commands in `.gemini/commands/`, steering in `steering/`',
    aliasFlags: ['--gemini-cli', '--gemini'],
    layout: {
      commandsDir: '.gemini/commands',
      agentDir: '.gemini',
      docFile: 'GEMINI.md',
    },
    commands: {
      init: '/sdd-steering',
      requirements: '/sdd-requirements <feature>',
      design: '/sdd-design <feature>',
      tasks: '/sdd-tasks <feature>',
      implement: '/sdd-implement <feature>',
      validate: '/sdd-validate <feature>',
    },
    manifestId: 'gemini-cli',
  },
  'codex': {
    label: 'Codex CLI',
    description: 'Installs MUSUBI prompts in `.codex/prompts/`, steering in `steering/`',
    aliasFlags: ['--codex', '--codex-cli'],
    layout: {
      commandsDir: '.codex/prompts',
      agentDir: '.codex',
      docFile: 'AGENTS.md',
    },
    commands: {
      init: '/prompts:sdd-steering',
      requirements: '/prompts:sdd-requirements <feature>',
      design: '/prompts:sdd-design <feature>',
      tasks: '/prompts:sdd-tasks <feature>',
      implement: '/prompts:sdd-implement <feature>',
      validate: '/prompts:sdd-validate <feature>',
    },
    manifestId: 'codex',
  },
  'qwen-code': {
    label: 'Qwen Code',
    description: 'Installs MUSUBI commands in `.qwen/commands/`, steering in `steering/`',
    aliasFlags: ['--qwen-code', '--qwen'],
    layout: {
      commandsDir: '.qwen/commands',
      agentDir: '.qwen',
      docFile: 'QWEN.md',
    },
    commands: {
      init: '/sdd-steering',
      requirements: '/sdd-requirements <feature>',
      design: '/sdd-design <feature>',
      tasks: '/sdd-tasks <feature>',
      implement: '/sdd-implement <feature>',
      validate: '/sdd-validate <feature>',
    },
    manifestId: 'qwen-code',
  },
  'windsurf': {
    label: 'Windsurf IDE',
    description: 'Installs MUSUBI workflows in `.windsurf/workflows/`, steering in `steering/`',
    aliasFlags: ['--windsurf'],
    layout: {
      commandsDir: '.windsurf/workflows',
      agentDir: '.windsurf',
      docFile: 'AGENTS.md',
    },
    commands: {
      init: '/sdd-steering',
      requirements: '/sdd-requirements <feature>',
      design: '/sdd-design <feature>',
      tasks: '/sdd-tasks <feature>',
      implement: '/sdd-implement <feature>',
      validate: '/sdd-validate <feature>',
    },
    manifestId: 'windsurf',
  },
};
```

### 2. Directory Structure

```
musubi/
├── src/
│   ├── agents/
│   │   └── registry.js         # Agent definitions
│   └── templates/
│       ├── agents/
│       │   ├── claude-code/    # Current templates
│       │   │   ├── skills/     # 25 skills (Claude-only)
│       │   │   ├── commands/   # 6 slash commands
│       │   │   └── CLAUDE.md
│       │   ├── github-copilot/
│       │   │   ├── prompts/    # 6 prompts (no skills)
│       │   │   └── AGENTS.md
│       │   ├── cursor/
│       │   │   ├── commands/   # 6 commands
│       │   │   └── AGENTS.md
│       │   ├── gemini-cli/
│       │   │   ├── commands/   # 6 commands
│       │   │   └── GEMINI.md
│       │   ├── codex/
│       │   │   ├── prompts/    # 6 prompts
│       │   │   └── AGENTS.md
│       │   ├── qwen-code/
│       │   │   ├── commands/   # 6 commands
│       │   │   └── QWEN.md
│       │   └── windsurf/
│       │       ├── workflows/  # 6 workflows
│       │       └── AGENTS.md
│       └── shared/
│           ├── steering/       # Shared steering templates
│           ├── constitution/   # Shared governance
│           └── documents/      # Shared document templates
```

### 3. CLI Updates

Update `bin/musubi.js` to support agent selection:

```javascript
program
  .command('init')
  .description('Initialize MUSUBI in current project')
  .option('--claude', 'Install for Claude Code (default)')
  .option('--claude-code', 'Install for Claude Code (alias)')
  .option('--copilot', 'Install for GitHub Copilot')
  .option('--github-copilot', 'Install for GitHub Copilot (alias)')
  .option('--cursor', 'Install for Cursor IDE')
  .option('--gemini', 'Install for Gemini CLI')
  .option('--gemini-cli', 'Install for Gemini CLI (alias)')
  .option('--codex', 'Install for Codex CLI')
  .option('--codex-cli', 'Install for Codex CLI (alias)')
  .option('--qwen', 'Install for Qwen Code')
  .option('--qwen-code', 'Install for Qwen Code (alias)')
  .option('--windsurf', 'Install for Windsurf IDE')
  .action((options) => {
    // Detect agent from flags
    const agent = detectAgent(options);
    console.log(chalk.blue(`Initializing MUSUBI for ${agent.label}...`));
    require('./musubi-init.js')(agent);
  });
```

### 4. Installation Flow

```
musubi-sdd init --claude       # Claude Code (default)
musubi-sdd init --copilot      # GitHub Copilot
musubi-sdd init --cursor       # Cursor IDE
musubi-sdd init --gemini       # Gemini CLI
musubi-sdd init --codex        # Codex CLI
musubi-sdd init --qwen         # Qwen Code
musubi-sdd init --windsurf     # Windsurf IDE
```

## Key Differences from cc-sdd

### MUSUBI-Specific Features

1. **25 Claude Code Skills** - Only for Claude Code agent
   - Other agents get equivalent commands/prompts but NOT skills
   - Skills API is Claude Code exclusive feature

2. **Constitutional Governance** - Shared across all agents
   - Same 9 Constitutional Articles
   - Same Phase -1 Gates
   - Same validation checklist

3. **Documentation Language** - All agents generate English documents and communicate in English; MUSUBI is English only

4. **Library-First Pattern** - All agents enforce Article I
   - Features in `lib/` directory
   - CLI interfaces required (Article II)
   - Test-First mandate (Article III)

### Shared Components

All agents share:
- `steering/` directory (project memory)
- `storage/specs/` directory (specifications)
- `templates/` directory (document templates)
- Constitutional governance rules
- EARS requirements format
- 8-stage SDD workflow

### Agent-Specific Installations

**Claude Code**:
```
.claude/
├── skills/           # 25 specialized skills (MUSUBI-specific)
│   ├── orchestrator/
│   ├── steering/
│   ├── requirements-analyst/
│   └── ... (22 more)
├── commands/         # 6 slash commands
│   ├── sdd-steering.md
│   ├── sdd-requirements.md
│   └── ... (4 more)
└── CLAUDE.md
```

**GitHub Copilot**:
```
.github/
├── prompts/          # 6 prompts (no skills - Copilot doesn't support skills)
│   ├── sdd-steering.prompt.md
│   ├── sdd-requirements.prompt.md
│   └── ... (4 more)
└── AGENTS.md
```

**Cursor IDE**:
```
.cursor/
├── commands/         # 6 commands
│   ├── sdd-steering.md
│   ├── sdd-requirements.md
│   └── ... (4 more)
└── AGENTS.md
```

**Gemini CLI**:
```
.gemini/
├── commands/         # 6 commands
│   ├── sdd-steering.md
│   ├── sdd-requirements.md
│   └── ... (4 more)
└── GEMINI.md
```

**Codex CLI**:
```
.codex/
├── prompts/          # 6 prompts
│   ├── sdd-steering.md
│   ├── sdd-requirements.md
│   └── ... (4 more)
└── AGENTS.md
```

**Qwen Code**:
```
.qwen/
├── commands/         # 6 commands
│   ├── sdd-steering.md
│   ├── sdd-requirements.md
│   └── ... (4 more)
└── QWEN.md
```

**Windsurf IDE**:
```
.windsurf/
├── workflows/        # 6 workflows
│   ├── sdd-steering.md
│   ├── sdd-requirements.md
│   └── ... (4 more)
└── AGENTS.md
```

## Implementation Plan

### Phase 1: Foundation (Completed)
- ✅ Claude Code implementation (25 skills + 6 commands)
- ✅ Constitutional governance

### Phase 2: Multi-Agent Support (Current)
1. ✅ Analyze cc-sdd architecture
2. 🔄 Create agent registry
3. ⬜ Update CLI with agent selection
4. ⬜ Create agent-specific templates
5. ⬜ Update README with multi-agent docs
6. ⬜ Test each agent installation

### Phase 3: Testing & Documentation
1. Test installation for each agent
2. Create quickstart guides per agent
3. Document agent-specific differences
4. Create migration guides

## Compatibility Matrix

| Feature | Claude Code | Copilot | Cursor | Gemini | Codex | Qwen | Windsurf |
|---------|-------------|---------|--------|--------|-------|------|----------|
| Skills API | ✅ (25 skills) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Slash Commands | ✅ (6 cmds) | ✅ (6 prompts) | ✅ (6 cmds) | ✅ (6 cmds) | ✅ (6 prompts) | ✅ (6 cmds) | ✅ (6 workflows) |
| Steering | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Constitution | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| EARS Format | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Library-First | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Benefits

1. **Broader Adoption**: Reach users on all major AI coding platforms
2. **Team Flexibility**: Teams can use different agents with same methodology
3. **Vendor Independence**: Not locked to Claude Code
4. **Consistent Workflow**: Same SDD process across all agents
5. **Shared Governance**: Constitutional compliance across platforms

---

**Status**: Design Complete, Ready for Implementation
**Next**: Create agent registry and update CLI
