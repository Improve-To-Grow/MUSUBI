# 🔧 Troubleshooting Guide

**MUSUBI v3.5.1** | Last updated: 2025-12-08

> Common problems and how to solve them

---

## 📋 Table of Contents

1. [Installation](#1-installation)
2. [Initialization](#2-initialization)
3. [AI Agents](#3-ai-agents)
4. [CLI](#4-cli)
5. [Workflow](#5-workflow)
6. [Performance](#6-performance)
7. [Other](#7-other)

---

## 1. Installation

### ❌ Error: `npm ERR! code EACCES`

**Symptoms:**
```bash
npm install -g musubi-sdd
npm ERR! code EACCES
npm ERR! permission denied
```

**Solution:**

```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g musubi-sdd

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g musubi-sdd

# Option 3: Use npx (no installation required)
npx musubi-sdd init
```

---

### ❌ Error: `Node.js version not supported`

**Symptoms:**
```bash
Error: musubi-sdd requires Node.js >= 18.0.0
Current version: 16.x.x
```

**Solution:**

```bash
# Using nvm
nvm install 18
nvm use 18

# Verify
node --version  # v18.x.x or later

# Reinstall
npm install -g musubi-sdd
```

---

### ❌ Error: `Cannot find module 'musubi-sdd'`

**Symptoms:**
```bash
Error: Cannot find module 'musubi-sdd'
```

**Solution:**

```bash
# Check the global installation
npm list -g musubi-sdd

# If not found, reinstall
npm install -g musubi-sdd

# Or use npx
npx musubi-sdd --version
```

---

## 2. Initialization

### ❌ Error: `AGENTS.md already exists`

**Symptoms:**
```bash
musubi init
Error: AGENTS.md already exists. Use --force to overwrite.
```

**Solution:**

```bash
# Allow overwriting
musubi init --force

# Or initialize in a different directory
mkdir new-project && cd new-project
musubi init
```

---

### ❌ Error: `steering/ directory not created`

**Symptoms:**
The `steering/` directory cannot be found after initialization

**Solution:**

```bash
# 1. Check the current directory
pwd
ls -la

# 2. Check permissions
ls -la .

# 3. Create manually
mkdir -p steering/rules steering/memories steering/templates
musubi init --force
```

---

### ❌ Problem: I want to initialize an existing project

**Solution:**

```bash
# Use the onboard command (for existing projects)
musubi onboard

# Automatically detected content:
# - package.json → tech.md
# - Directory structure → structure.md
# - README.md → product.md
```

---

## 3. AI Agents

### ❌ Problem: GitHub Copilot does not recognize commands

**Symptoms:**
Typing `#sdd-requirements` is treated as plain text

**Solution:**

1. **Check AGENTS.md:**
```bash
cat AGENTS.md | head -20
```

2. **Check VS Code settings:**
`.vscode/settings.json`:
```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    { "file": "AGENTS.md" }
  ]
}
```

3. **Restart Copilot:**
- Restart VS Code
- Or `Ctrl+Shift+P` → `GitHub Copilot: Restart`

4. **Prompt directly:**
```
Following the sdd-requirements section of AGENTS.md, define the requirements for the login feature
```

---

### ❌ Problem: Claude Code cannot find skills

**Symptoms:**
```
/sdd-requirements → Unknown command
```

**Solution:**

```bash
# 1. Check the file layout
ls -la .claude/commands/
ls -la .claude/skills/

# 2. Reinitialize
musubi init --claude-code --force

# 3. Restart Claude Code
# Restart VS Code

# 4. Check the paths (in CLAUDE.md)
cat CLAUDE.md | grep "commands"
```

---

### ❌ Problem: Cursor does not load the context

**Solution:**

1. **Check .cursorrules:**
```bash
cat .cursorrules
```

2. **Place AGENTS.md in the project root:**
```bash
ls AGENTS.md
```

3. **Cursor settings:**
- Settings → AI → Context Files → add `AGENTS.md`

4. **Reference the file explicitly:**
```
@AGENTS.md Write the requirements following this methodology
```

---

## 4. CLI

### ❌ Error: `musubi: command not found`

**Symptoms:**
```bash
musubi --version
bash: musubi: command not found
```

**Solution:**

```bash
# 1. Check the installation
npm list -g musubi-sdd

# 2. Check the global bin directory
npm bin -g

# 3. Add it to PATH
export PATH="$(npm bin -g):$PATH"

# 4. Or use npx
npx musubi-sdd --version
```

---

### ❌ Error: `Error: ENOENT: no such file or directory`

**Symptoms:**
```bash
musubi requirements --feature login
Error: ENOENT: no such file or directory, open 'steering/project.yml'
```

**Solution:**

```bash
# 1. Check that the project has been initialized
ls steering/

# 2. If it has not been initialized
musubi init

# 3. If files are missing
musubi onboard --force
```

---

### ❌ Error: `SyntaxError in project.yml`

**Symptoms:**
```bash
SyntaxError: Invalid YAML in steering/project.yml
```

**Solution:**

```bash
# 1. Validate the YAML
npx yaml steering/project.yml

# 2. Common problems:
# - Indentation uses tabs instead of spaces
# - Missing space after a colon
# - Special characters not escaped

# 3. Example fix:
# NG: key:value
# OK: key: value

# 4. Regenerate
musubi sync --force
```

---

## 5. Workflow

### ❌ Problem: Requirements are not generated

**Symptoms:**
`musubi requirements` returns an empty result

**Solution:**

```bash
# 1. Specify the feature name
musubi requirements --feature login

# 2. Use interactive mode
musubi requirements --interactive

# 3. Check the output location
musubi requirements --feature login --output ./storage/specs/
ls storage/specs/
```

---

### ❌ Problem: Traceability is incomplete

**Symptoms:**
Some requirements are not linked in `musubi trace`

**Solution:**

```bash
# 1. Gap analysis
musubi gaps --detailed

# 2. Check the requirement ID format
# Correct format: REQ-LOGIN-001
# Incorrect: REQ_LOGIN_001, LOGIN-001

# 3. Add comments in the code
# // REQ-LOGIN-001: Implements login validation

# 4. Add comments in the tests
# // Tests: REQ-LOGIN-001

# 5. Rescan
musubi trace --rebuild
```

---

### ❌ Problem: Validation fails

**Symptoms:**
```bash
musubi validate
❌ Constitution violation: Article 3
```

**Solution:**

```bash
# 1. Check the details
musubi validate --verbose

# 2. Check the constitution articles
cat steering/rules/constitution.md

# 3. Common violations:
# - Article 3: Requirement has no ID
# - Article 5: Insufficient test coverage
# - Article 7: Insufficient documentation

# 4. Re-validate after fixing
musubi validate
```

---

## 6. Performance

### ❌ Problem: Initialization is slow

**Solution:**

```bash
# 1. Initialize with a minimal configuration
musubi init --minimal

# 2. Clear the cache
npm cache clean --force

# 3. Check the network
ping registry.npmjs.org
```

---

### ❌ Problem: Analysis is slow on large projects

**Solution:**

```bash
# 1. Analyze only a specific feature
musubi analyze --feature login

# 2. Configure exclude patterns
# Add to steering/project.yml:
# exclude:
#   - node_modules/**
#   - dist/**
#   - coverage/**

# 3. Incremental analysis
musubi analyze --incremental
```

---

### ❌ Problem: The GUI does not start

**Symptoms:**
```bash
musubi gui start
Error: EADDRINUSE: address already in use
```

**Solution:**

```bash
# 1. Check for an existing process
lsof -i :3000

# 2. Kill the process
kill -9 <PID>

# 3. Use a different port
musubi gui start --port 8080

# 4. Open in the browser
open http://localhost:8080
```

---

## 7. Other

### ❌ Problem: Git integration does not work

**Solution:**

```bash
# 1. Check that Git is initialized
git status

# 2. If it has not been initialized
git init

# 3. Check GitHub CLI (required for resolving Issues)
gh auth status

# 4. If not authenticated
gh auth login
```

---

### ❌ Problem: Japanese text appears garbled

**Solution:**

```bash
# 1. Set environment variables
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8

# 2. Editor settings
# VS Code: settings.json
# "files.encoding": "utf8"

# 3. Terminal settings
# Use a UTF-8 capable terminal
```

---

### ❌ Problem: Things stop working after an upgrade

**Solution:**

```bash
# 1. Clear the cache
npm cache clean --force

# 2. Reinstall
npm uninstall -g musubi-sdd
npm install -g musubi-sdd

# 3. Sync the project
musubi sync --force

# 4. Check the version
musubi --version
```

---

## 🆘 Support

### Collecting Logs

When reporting a problem, please include the following information:

```bash
# Environment information
node --version
npm --version
musubi --version

# Error log
musubi <command> --verbose 2>&1 | tee musubi-error.log
```

### Contact

| Method | Link |
|------|--------|
| **GitHub Issues** | https://github.com/nahisaho/MUSUBI/issues |
| **Discussions** | https://github.com/nahisaho/MUSUBI/discussions |
| **Documentation** | https://nahisaho.github.io/musubi/ |

### 🔍 Debug Mode

Get detailed debug information:

```bash
# Enable debug mode
DEBUG=musubi:* musubi <command>

# Specific modules only
DEBUG=musubi:cli musubi init
DEBUG=musubi:analyze musubi analyze
```

---

## 📚 Related Documents

- [5-Minute Quick Start](./quick-start-5min.md)
- [Complete CLI Reference](./cli-reference.md)
- [Platform-Specific Setup](./platform-setup.md)
- [Hands-On Tutorial](./tutorial-todo-app.md)

---

*Documentation generated by: MUSUBI v3.5.1*
