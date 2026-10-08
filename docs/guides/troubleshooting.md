# 🔧 Troubleshooting Guide

**MUSUBI v3.5.1** | Last updated: 2025-12-08

> Common problems and solutions

---

## 📋 Table of Contents

1. [Installation Issues](#1-installation-issues)
2. [Initialization Issues](#2-initialization-issues)
3. [AI Agent Issues](#3-ai-agent-issues)
4. [CLI Issues](#4-cli-issues)
5. [Workflow Issues](#5-workflow-issues)
6. [Performance Issues](#6-performance-issues)
7. [Other](#7-other)

---

## 1. Installation Issues

### ❌ Error: `npm ERR! code EACCES`

**Symptoms:**
```bash
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
npm ERR! code EACCES
npm ERR! permission denied
```

**Solution:**

```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
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
# Use nvm
nvm install 18
nvm use 18

# Verify
node --version  # v18.x.x or later

# Reinstall
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
```

---

### ❌ Error: `Cannot find module '@improve-to-grow/musubi-sdd'`

**Symptoms:**
```bash
Error: Cannot find module '@improve-to-grow/musubi-sdd'
```

**Cause:** Node resolves `require()` from the project's `node_modules`. The global install
provides the CLI only. Code written for upstream MUSUBI loads the upstream name `musubi-sdd` and
fails the same way.

**Solution:**

```bash
# Install the package into the project
npm install --save-dev 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
```

Then load it as `@improve-to-grow/musubi-sdd`.

---

## 2. Initialization Issues

### ❌ Error: `AGENTS.md already exists`

**Symptoms:**
```bash
musubi init
Error: AGENTS.md already exists. Use --force to overwrite.
```

**Solution:**

```bash
# Allow overwrite
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

### ❌ Problem: I want to initialize in an existing project

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

## 3. AI Agent Issues

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

4. **Direct prompt:**
```
Following the sdd-requirements section in AGENTS.md, define the requirements for the login feature
```

---

### ❌ Problem: Claude Code cannot find skills

**Symptoms:**
```
/sdd-requirements → Unknown command
```

**Solution:**

```bash
# 1. Check the file structure
ls -la .claude/commands/
ls -la .claude/skills/

# 2. Reinitialize
musubi init --claude-code --force

# 3. Restart Claude Code
# Restart VS Code

# 4. Check paths (in CLAUDE.md)
cat CLAUDE.md | grep "commands"
```

---

### ❌ Problem: Cursor does not load context

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

## 4. CLI Issues

### ❌ Error: `musubi: command not found`

**Symptoms:**
```bash
musubi --version
bash: musubi: command not found
```

**Solution:**

```bash
# 1. Verify installation
npm ls -g @improve-to-grow/musubi-sdd

# 2. Check the global bin
npm bin -g

# 3. Add to PATH
export PATH="$(npm bin -g):$PATH"
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
# 1. Verify the project is initialized
ls steering/

# 2. If not initialized
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
# - Tabs used for indentation instead of spaces
# - Missing space after the colon
# - Unescaped special characters

# 3. Example fix:
# NG: key:value
# OK: key: value

# 4. Regenerate
musubi sync --force
```

---

## 5. Workflow Issues

### ❌ Problem: Requirements are not generated

**Symptoms:**
`musubi requirements` returns an empty result

**Solution:**

```bash
# 1. Specify the feature name
musubi requirements --feature login

# 2. Use interactive mode
musubi requirements --interactive

# 3. Check the output destination
musubi requirements --feature login --output ./storage/specs/
ls storage/specs/
```

---

### ❌ Problem: Traceability is incomplete

**Symptoms:**
`musubi trace` shows some requirements are not linked

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
# 1. Check details
musubi validate --verbose

# 2. Check Constitutional Articles
cat steering/rules/constitution.md

# 3. Common violations:
# - Article 3: Requirements have no ID
# - Article 5: Insufficient test coverage
# - Article 7: Insufficient documentation

# 4. Re-validate after fixing
musubi validate
```

---

## 6. Performance Issues

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
# 1. Analyze specific features only
musubi analyze --feature login

# 2. Set exclusion patterns
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
# 1. Check existing processes
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
# 1. Verify Git is initialized
git status

# 2. If not initialized
git init

# 3. Check GitHub CLI (required for resolving Issues)
gh auth status

# 4. If not authenticated
gh auth login
```

---

### ❌ Problem: Things stop working after an upgrade

**Solution:**

```bash
# 1. Clear the cache
npm cache clean --force

# 2. Reinstall
npm uninstall -g @improve-to-grow/musubi-sdd
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'

# 3. Sync the project
musubi sync --force

# 4. Verify the version
musubi --version
```

---

## 🆘 Support

### Log Collection

When reporting a problem, include the following information:

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

*Documentation generated by MUSUBI v3.5.1*
