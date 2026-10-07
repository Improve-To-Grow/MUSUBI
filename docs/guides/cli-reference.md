# 📖 MUSUBI CLI Command Reference

**MUSUBI v3.5.1** | Last updated: 2025-12-08

> Complete reference for all 20 CLI commands

---

## 📋 Table of Contents

1. [Basic Commands](#1-basic-commands)
2. [SDD Workflow Commands](#2-sdd-workflow-commands)
3. [Analysis Commands](#3-analysis-commands)
4. [Memory and Sync Commands](#4-memory-and-sync-commands)
5. [Automation Commands](#5-automation-commands)
6. [Utility Commands](#6-utility-commands)

---

## 1. Basic Commands

### `musubi` / `musubi-sdd`

Main entry point.

```bash
musubi --help           # Show help
musubi --version        # Show version
musubi <command>        # Run a subcommand
```

### `musubi init`

Initialize a new project.

```bash
# Basic usage
musubi init

# Specify platform
musubi init --copilot      # GitHub Copilot
musubi init --claude-code  # Claude Code (Skills API)
musubi init --cursor       # Cursor IDE
musubi init --gemini       # Gemini CLI
musubi init --codex        # Codex CLI
musubi init --qwen         # Qwen Code
musubi init --windsurf     # Windsurf IDE

# Options
musubi init --force        # Overwrite existing files
musubi init --minimal      # Initialize with minimal configuration
musubi init --output ./dir # Specify output directory
```

**Generated files:**
- `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `QWEN.md`
- Full set of `steering/` directories
- Full set of `storage/` directories

### `musubi onboard`

Automatically analyze an existing project and generate steering docs.

```bash
# Basic usage
musubi onboard

# Options
musubi onboard --analyze-only  # Analyze only (no file generation)
musubi onboard --deep          # Deep analysis mode
musubi onboard --include-deps  # Also analyze dependencies
```

**Auto-detection:**
- package.json, requirements.txt, go.mod, etc.
- Directory structure
- Frameworks and libraries in use

---

## 2. SDD Workflow Commands

### `musubi requirements`

Generate a requirements document in EARS format.

```bash
# Basic usage
musubi requirements --feature login

# Options
musubi requirements --feature login --output ./specs/
musubi requirements --feature login --format markdown
musubi requirements --interactive              # Interactive mode
```

> Documents are generated in English only.

**5 EARS Patterns:**
| Pattern | Syntax |
|---------|------|
| Ubiquitous | The system shall [action] |
| Event-Driven | When [trigger], the system shall [action] |
| State-Driven | While [state], the system shall [action] |
| Optional | Where [condition], the system shall [action] |
| Unwanted | If [condition], then the system shall [action] |

### `musubi design`

Generate C4 models and ADRs (Architecture Decision Records).

```bash
# Basic usage
musubi design --feature login

# Options
musubi design --feature login --level container  # Specify C4 level
musubi design --feature login --include-adr      # Include ADRs
musubi design --feature login --output ./design/
```

**C4 Levels:**
1. Context - Overall system view
2. Container - Container diagram
3. Component - Component diagram
4. Code - Code diagram

### `musubi tasks`

Break down the design into tasks.

```bash
# Basic usage
musubi tasks --feature login

# Options
musubi tasks --feature login --granularity fine  # Fine granularity
musubi tasks --feature login --estimate          # Include effort estimates
musubi tasks --feature login --dependencies      # Show dependencies
```

### `musubi validate`

Verify that the implementation complies with requirements and design.

```bash
# Basic usage
musubi validate

# Options
musubi validate --feature login      # Specific feature only
musubi validate --constitution       # Constitution compliance check
musubi validate --traceability       # Traceability check
musubi validate score                # Calculate score
musubi validate --strict             # Strict mode
```

### `musubi workflow`

Manage SDD workflow progress.

```bash
# Basic usage
musubi workflow status                # Check current stage
musubi workflow next                  # Go to the next stage
musubi workflow prev                  # Go to the previous stage

# Specify a stage
musubi workflow goto requirements     # Move to the requirements stage
musubi workflow goto design
musubi workflow goto implement

# Metrics
musubi workflow metrics               # Show workflow metrics
musubi workflow history               # Show history
```

---

## 3. Analysis Commands

### `musubi analyze`

Analyze the codebase.

```bash
# Basic usage
musubi analyze

# Options
musubi analyze --detect-stuck    # Stuck detection
musubi analyze --changes         # Change impact analysis
musubi analyze --dependencies    # Dependency analysis
musubi analyze --complexity      # Complexity analysis
musubi analyze --security        # Security analysis
```

### `musubi gaps`

Detect gaps between requirements, design, and implementation.

```bash
# Basic usage
musubi gaps

# Options
musubi gaps --feature login       # Specific feature only
musubi gaps --detailed            # Detailed report
musubi gaps --output ./reports/   # Report output
```

### `musubi trace`

Generate a traceability matrix.

```bash
# Basic usage
musubi trace

# Options
musubi trace --feature login      # Specific feature only
musubi trace --format matrix      # Matrix format
musubi trace --format graph       # Graph format
musubi trace --output ./trace/    # Specify output destination
```

---

## 4. Memory and Sync Commands

### `musubi remember`

Manage agent memory.

```bash
# Basic usage
musubi remember                    # Show memory
musubi remember --save             # Save current learnings
musubi remember --auto             # Auto-update

# Options
musubi remember --merge            # Merge memory
musubi remember --condense         # Condense memory
musubi remember --export ./mem/    # Export
```

### `musubi sync`

Synchronize steering docs with the codebase.

```bash
# Basic usage
musubi sync

# Options
musubi sync --dry-run              # Dry run (no changes)
musubi sync --auto                 # Automatic sync
musubi sync --force                # Forced sync
```

### `musubi change`

Change management (Delta Specs).

```bash
# Basic usage
musubi change                      # List changes

# Options
musubi change --create             # Create a change request
musubi change --apply CHG-001      # Apply a change
musubi change --rollback CHG-001   # Roll back
musubi change --history            # Change history
```

---

## 5. Automation Commands

### `musubi orchestrate`

Run multi-skill workflows.

```bash
# Basic usage
musubi orchestrate --workflow sdd-full

# Options
musubi orchestrate --pattern sequential  # Sequential execution
musubi orchestrate --pattern parallel    # Parallel execution
musubi orchestrate --pattern swarm       # Swarm pattern
musubi orchestrate --dry-run             # Dry run
```

**Orchestration Patterns:**
| Pattern | Description |
|---------|------|
| Sequential | Sequential execution |
| Parallel | Parallel execution |
| Hierarchical | Hierarchical execution |
| GroupChat | Group chat |
| Swarm | Swarm pattern |
| HumanInLoop | With human intervention |

### `musubi resolve`

Automatically resolve GitHub Issues.

```bash
# Basic usage
musubi resolve --issue 123

# Options
musubi resolve --issue 123 --auto-pr     # Auto-create PR
musubi resolve --issue 123 --dry-run     # Dry run
musubi resolve --issue 123 --branch fix  # Specify branch name
```

### `musubi share`

Share and export specifications.

```bash
# Basic usage
musubi share --feature login

# Options
musubi share --format markdown           # Markdown output
musubi share --format html               # HTML output
musubi share --format pdf                # PDF output
musubi share --output ./export/          # Specify output destination
```

---

## 6. Utility Commands

### `musubi browser`

Browser automation and E2E testing.

```bash
# Basic usage
musubi browser test

# Options
musubi browser test --url http://localhost:3000
musubi browser test --headless           # Headless mode
musubi browser test --screenshot         # Capture screenshots
musubi browser generate                  # Generate test code
```

### `musubi gui`

Web GUI dashboard.

```bash
# Basic usage
musubi gui start                         # Start the GUI server
musubi gui start --port 8080             # Specify port

# Features
# - Project overview
# - Workflow visualization
# - Metrics dashboard
# - Traceability matrix
```

### `musubi convert`

Format conversion (Spec Kit compatible).

```bash
# Basic usage
musubi convert --input ./specs/

# Options
musubi convert --from yaml --to markdown
musubi convert --from markdown --to json
musubi convert --output ./converted/
```

---

## 🔧 Global Options

Options available for all commands:

| Option | Description |
|-----------|------|
| `--help, -h` | Show help |
| `--version, -v` | Show version |
| `--verbose` | Verbose log output |
| `--quiet, -q` | Suppress output |
| `--config <path>` | Specify config file |
| `--cwd <path>` | Specify working directory |

---

## 📊 Command Reference Table

| Command | SDD Stage | Main Use |
|---------|------------|---------|
| `init` | - | Initialization |
| `onboard` | Research | Existing project analysis |
| `requirements` | Requirements | Requirements definition |
| `design` | Design | Design |
| `tasks` | Tasks | Task breakdown |
| `validate` | Validate | Validation |
| `workflow` | All | Workflow management |
| `analyze` | All | Analysis |
| `gaps` | Validate | Gap detection |
| `trace` | All | Traceability |
| `remember` | All | Memory management |
| `sync` | All | Sync |
| `change` | All | Change management |
| `orchestrate` | All | Orchestration |
| `resolve` | Implement | Issue resolution |
| `share` | Deploy | Sharing |
| `browser` | Test | E2E testing |
| `gui` | All | Dashboard |
| `convert` | All | Conversion |

---

*Documentation generated by MUSUBI v3.5.1*
