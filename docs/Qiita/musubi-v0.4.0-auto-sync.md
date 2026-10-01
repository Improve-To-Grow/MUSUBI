# MUSUBI v0.4.0 - Why Project Memory Alone Wasn't Enough, and the Implementation of Automatic Sync

**Tags**: `AI` `ChatGPT` `GitHub` `npm` `Documentation`

## Introduction

We have released MUSUBI (Ultimate Specification Driven Development Tool) v0.4.0. This version adds an **automatic sync feature for steering documents** (`musubi-sync`).

In this article, we answer the question "Why wasn't project memory alone enough?" while explaining the new features and usage of v0.4.0.

## TL;DR (Summary)

**What was the problem?**
- The project memory for AI agents (v0.2.0) can record "why that technology was chosen," but "which technologies are currently in use" is not updated automatically
- Even when the code changes, the documentation stays outdated → the AI operates on incorrect assumptions

**How did we solve it?**
- The `musubi-sync` command automatically detects codebase changes (versions, dependencies, directories)
- Detected changes are automatically reflected in the steering documents (both English and Japanese)

**What are the benefits?**
- Zero effort for manual updates (10 minutes → 3 seconds, a 95% reduction)
- Prevents drift between documentation and code (always up to date)
- Can also be built into CI/CD pipelines (`--auto-approve` option)

```bash
# Install
npm install -g musubi-sdd

# Analyze an existing project and generate documentation (v0.3.0)
musubi-onboard

# Detect codebase changes and update documentation (v0.4.0)
musubi-sync
```

## Why Wasn't Project Memory Alone Enough?

### Challenges Through v0.2.0

In MUSUBI v0.2.0, we implemented a **project memory system** inspired by the Serena project.

```
steering/
├── memories/
│   ├── architecture_decisions.md  # Design decisions
│   ├── development_workflow.md    # Development workflow
│   ├── domain_knowledge.md        # Domain knowledge
│   ├── lessons_learned.md         # Lessons learned
│   ├── suggested_commands.md      # Recommended commands
│   └── technical_debt.md          # Technical debt
├── structure.md                   # Architecture patterns
├── tech.md                        # Technology stack
└── product.md                     # Product context
```

This allows AI agents to persist knowledge across conversations.

#### The Role of the Memory System

The 6 memory files added in v0.2.0 each record a different kind of knowledge.

1. **architecture_decisions.md** (Design decisions)
   - Records important design decisions in ADR (Architecture Decision Record) format
   - Examples: "Why we chose JWT authentication", "Why we moved to microservices"
   - **AI agents read this to understand the reasons behind past decisions**

2. **development_workflow.md** (Development workflow)
   - Records project-specific development processes
   - Examples: "PR approval rules", "Deployment procedure", "Branching strategy"
   - **AI agents follow this when proposing work**

3. **domain_knowledge.md** (Domain knowledge)
   - Records business logic and industry-specific knowledge
   - Examples: "Point calculation logic", "Definition of the fiscal year", "Industry terminology"
   - **AI agents refer to this when generating code**

4. **lessons_learned.md** (Lessons learned)
   - Records past troubles and improvements
   - Examples: "Performance problems and their solutions", "Failed refactorings"
   - **AI agents avoid repeating the same mistakes**

5. **suggested_commands.md** (Recommended commands)
   - Records commands and scripts commonly used in the project
   - Examples: "How to run tests", "Setting up the local environment", "Debugging procedure"
   - **AI agents suggest appropriate commands**

6. **technical_debt.md** (Technical debt)
   - Records problems to be addressed in the future
   - Examples: "Outdated dependencies", "Refactoring candidates", "TODO comments"
   - **AI agents propose work taking priorities into account**

#### What Project Memory Alone Could Record

The project memory in v0.2.0 was a **mechanism for recording "human judgment and experience."**

- ✅ **What could be recorded**: Why a technology was chosen (Why)
- ✅ **What could be recorded**: What problems occurred in the past (History)
- ✅ **What could be recorded**: What rules govern development (How)
- ❌ **What could not be recorded**: Which technologies are currently in use (What)
- ❌ **What could not be recorded**: What the current version is (Current State)
- ❌ **What could not be recorded**: What directories exist (Structure)

**In other words, while qualitative knowledge (Why/How) could be recorded, quantitative information (What) had to rely on manual updates.**

However, **we found a major problem in operation**.

### Problem 1: Drift from the Codebase

Project memory is "knowledge recorded manually." However, in actual development:

```typescript
// Update package.json
{
  "version": "0.3.0" -> "0.4.0",
  "dependencies": {
    "chalk": "^5.0.0",
    "js-yaml": "^4.1.0"  // Newly added
  }
}

// Create a new directory
bin/
├── musubi-sync.js  // Newly added
```

These changes are not automatically reflected in `steering/tech.md` or `steering/structure.md`.

**Result**: The documentation becomes outdated, and AI agents may operate on incorrect assumptions.

### Problem 2: The Effort and Timing of Updates

Manual updates have the following challenges.

1. **Forgetting to update**: When focused on development, it is easy to forget to update the documentation
2. **Unclear update timing**: It is hard to decide when to update
3. **Missed content in updates**: It is hard to tell what has changed
4. **Burden of bilingual support**: Both English and Japanese must be updated

### Problem 3: Synchronization in Team Development

When there are multiple developers:

- Developer A adds a new framework
- Developer B works from the outdated documentation
- **Result**: A mismatch in understanding occurs

**In other words, project memory can hold "recorded knowledge," but it had no mechanism to automatically reflect "the current state of the codebase."**

## v0.4.0 Solution: The Automatic Sync System

### Architecture

In v0.4.0, we achieved automatic synchronization in the following 5 steps.

```
1. Load Config
   └─> Read steering/project.yml
   
2. Analyze Codebase
   └─> Scan package.json and the directory structure
   
3. Detect Changes
   └─> Compare the configuration with the actual state
   
4. Display & Confirm
   └─> Show the changes and ask the user for confirmation
   
5. Apply Updates
   └─> Update the YAML + Markdown files (English and Japanese)
```

### How Change Detection Works

`musubi-sync` detects changes in the following categories.

| Category | What Is Detected | Updated Target |
|---------|---------|--------|
| **Version** | Version change in `package.json` | `project.yml` |
| **Languages** | Added/removed languages | `project.yml` |
| **Frameworks** | Added/removed dependencies | `project.yml`, `tech.md` (en/ja) |
| **Directories** | Newly created directories | `project.yml`, `structure.md` (en/ja) |

### Implementation Details

#### 1. YAML Parsing: Avoid Manual Implementation

At first, we considered manipulating YAML as strings by hand, but judged it to be error-prone. We adopted the **js-yaml library**.

```javascript
const yaml = require('js-yaml');

// Read
const config = yaml.load(fs.readFileSync('steering/project.yml', 'utf8'));

// Update
config.version = newVersion;

// Write (preserving the structure)
fs.writeFileSync('steering/project.yml', yaml.dump(config, {
  indent: 2,
  lineWidth: 100
}));
```

#### 2. Change Detection: Exclude Noise

Detecting every change would include noise such as `node_modules` and `dist/`. We implemented **focused detection logic**:

```javascript
function detectChanges(config, actual) {
  const changes = {
    version: null,
    newLanguages: [],
    removedLanguages: [],
    newFrameworks: [],
    removedFrameworks: [],
    newDirectories: []
  };

  // Version check
  if (config.version !== actual.version) {
    changes.version = { old: config.version, new: actual.version };
  }

  // Frameworks (exclude node_modules)
  const configFrameworks = new Set(config.frameworks || []);
  actual.frameworks
    .filter(fw => !fw.startsWith('node_modules'))
    .forEach(fw => {
      if (!configFrameworks.has(fw)) {
        changes.newFrameworks.push(fw);
      }
    });

  // Directories (apply exclusion patterns)
  const excludePatterns = ['node_modules', 'dist', '.git'];
  actual.directories
    .filter(dir => !excludePatterns.some(pattern => dir.includes(pattern)))
    .forEach(dir => {
      if (!config.directories?.includes(dir)) {
        changes.newDirectories.push(dir);
      }
    });

  return changes;
}
```

#### 3. User Confirmation: Balancing Automation and Control

Full automation is risky. We provide **3 execution modes**:

```bash
# Interactive (default): Show changes and ask for confirmation
musubi-sync

# Dry-run: Preview only (do not apply)
musubi-sync --dry-run

# Auto-approve: Apply automatically (for CI/CD)
musubi-sync --auto-approve
```

#### 4. Bilingual Updates: Maintaining Consistency

Update both English and Japanese at the same time:

```javascript
function updateTechMd(changes, actualState) {
  const files = [
    'steering/tech.md',
    'steering/tech.ja.md'
  ];

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add a new framework
    changes.newFrameworks.forEach(framework => {
      const isJapanese = file.endsWith('.ja.md');
      const addition = isJapanese
        ? `- **${framework}** - [Add a description]`
        : `- **${framework}** - [Add description]`;
      
      content = appendToSection(content, '## Frameworks', addition);
    });
    
    fs.writeFileSync(file, content);
  });
}
```

#### 5. Audit Trail: Record Every Sync

Record sync events in `architecture_decisions.md`:

```javascript
function recordChangeInMemory(changes) {
  const timestamp = new Date().toISOString().split('T')[0];
  const entry = `
## [${timestamp}] Steering Sync - Automatic Update

### Changes Applied

${changes.version ? `- Version: ${changes.version.old} → ${changes.version.new}` : ''}
${changes.newFrameworks.length > 0 ? `- New frameworks: ${changes.newFrameworks.join(', ')}` : ''}
${changes.newDirectories.length > 0 ? `- New directories: ${changes.newDirectories.join(', ')}` : ''}

### Context

Automatic synchronization triggered by codebase changes.

---
`;

  const filePath = 'steering/memories/architecture_decisions.md';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Add the latest change at the top
  const updated = content.replace(
    /^(# Architecture Decisions\n\n)/,
    `$1${entry}`
  );
  
  fs.writeFileSync(filePath, updated);
}
```

## How to Use v0.4.0

### 1. Installation

```bash
npm install -g musubi-sdd
```

### 2. Onboarding an Existing Project (v0.3.0 Feature)

First, analyze the existing project and generate steering documents:

```bash
cd your-project
musubi-onboard
```

**Result**:

```
🚀 MUSUBI Onboarding Wizard

Analyzing your project...

✅ Project structure analyzed
✅ Technology stack detected
   - Node.js 20.x, TypeScript 5.x, React 18.x, Jest 29.x
✅ Steering documents generated
   - steering/structure.md (en + ja)
   - steering/tech.md (en + ja)
   - steering/product.md (en + ja)
✅ Memories initialized (6 files)
✅ Project configuration created
   - steering/project.yml

⏱️  Onboarding completed in 2.5 minutes

💡 Next steps:
   - Review generated steering docs
   - Run: musubi-sync to keep docs current
   - Create requirements: /sdd-requirements [feature]
```

### 3. Development: Change the Codebase

Proceed with development as usual.

```bash
# Add a new dependency
npm install axios

# Create a new directory
mkdir -p src/api

# Update the version
npm version patch  # 0.3.0 → 0.3.1
```

### 4. Sync: Detect Changes and Update

#### Interactive Mode (Default)

```bash
musubi-sync
```

**Result**:

```
🔄 MUSUBI Steering Sync

Analyzing codebase...

Detected changes:
  📦 Version: 0.3.0 → 0.3.1
  ➕ New framework: axios@1.6.0
  📁 New directory: src/api/

? Apply these changes? (Y/n) Y

Updating steering documents...

✅ Updated steering/project.yml
✅ Updated steering/tech.md (en + ja)
✅ Updated steering/structure.md (en + ja)
✅ Recorded change in memories/architecture_decisions.md

🎉 Steering synchronized successfully!

💡 Next steps:
   - Review updated docs in steering/
   - Commit changes: git add steering/ && git commit
```

#### Dry-run Mode (Preview Only)

When you want to review the changes but do not want to apply them yet:

```bash
musubi-sync --dry-run
```

**Result**:

```
🔄 MUSUBI Steering Sync (Dry Run)

Detected changes:
  📦 Version: 0.3.0 → 0.3.1
  ➕ New framework: axios@1.6.0
  📁 New directory: src/api/

ℹ️  Dry run mode: No files will be modified

Would update:
  - steering/project.yml (version, frameworks, directories)
  - steering/tech.md (en + ja)
  - steering/structure.md (en + ja)
  - steering/memories/architecture_decisions.md
```

#### Auto-approve Mode (for CI/CD)

When running automatically in a CI/CD pipeline:

```bash
musubi-sync --auto-approve
```

**GitHub Actions example**:

```yaml
name: Sync Steering Docs

on:
  push:
    branches: [main]
    paths:
      - 'package.json'
      - 'src/**'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install MUSUBI
        run: npm install -g musubi-sdd
      
      - name: Sync steering docs
        run: musubi-sync --auto-approve
      
      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add steering/
          git commit -m "chore: sync steering docs [skip ci]" || exit 0
          git push
```

### 5. Continuous Operation

Build it into your development cycle.

```
Develop → musubi-sync → Review → Commit
  ↑                                   ↓
  └───────────────────────────────────┘
```

**Recommended frequency**:

- **Weekly**: Run `musubi-sync` regularly
- **Before a release**: Always sync and confirm the latest state
- **After large changes**: When adding new dependencies or directories

## Actual Results

Results of dogfooding on the MUSUBI project itself:

### Before (Through v0.3.0)

- **Manual updates**: Forgot to update `tech.md` after Phase 3 was complete
- **Bilingual burden**: Manually edited both English and Japanese
- **Missed updates**: New dependencies (`glob`, `inquirer`) were not documented

### After (v0.4.0)

```bash
$ musubi-sync

Detected changes:
  📦 Version: 0.3.0 → 0.4.0
  ➕ New framework: js-yaml@4.1.0
  📁 New directory: bin/

? Apply these changes? Y

✅ All steering docs updated in 3 seconds
```

**Effects**:

- ⏱️ **Time savings**: Manual update 10 minutes → automatic sync 3 seconds (95% reduction)
- 🎯 **Improved accuracy**: Zero missed detections
- 🌐 **Bilingual support**: English and Japanese are synced automatically
- 📝 **Audit trail**: All changes are recorded in `architecture_decisions.md`

## Project Memory vs Automatic Sync: When to Use Which

| Item | Project Memory (v0.2.0) | Automatic Sync (v0.4.0) |
|------|---------------------------|------------------|
| **Purpose** | Design decisions, lessons learned, domain knowledge | Codebase state (version, tech stack, structure) |
| **Updates** | Manual (AI agent or developer) | Automatic detection + confirmation |
| **Content** | Qualitative knowledge (Why, How) | Quantitative information (What) |
| **Change frequency** | Low (only for important decisions) | High (anytime during development) |
| **Examples** | "Reason for adopting JWT authentication", "Insights from performance improvements" | "Current version: 0.4.0", "Frameworks in use: React, Jest" |

**The two are complementary**:

- **Project memory**: Why a technology was chosen (Why)
- **Automatic sync**: Which technologies are currently in use (What)

## Evolution from v0.1.7 to v0.4.0

Let's look back at MUSUBI's evolution.

### v0.1.7 (Initial Release)

- 25 agents + constitutional governance
- 7 platforms supported
- **Challenge**: Steering documents were created and updated manually

### v0.2.0 (Phase 1: Memory System)

- Added project memory (`steering/memories/`)
- Persists design decisions and lessons learned
- **Challenge**: Could not keep up with codebase changes

### v0.2.1 (Phase 2: Project Configuration)

- Added `steering/project.yml`
- Standardized project configuration
- **Challenge**: Applying it to existing projects was laborious

### v0.3.0 (Phase 3: Onboarding Automation)

- Added the `musubi-onboard` command
- Automatically analyzes existing projects and generates documentation
- **Effect**: 96% reduction in setup time (2-4 hours → 2-5 minutes)
- **Challenge**: One-time only, with no continuous updates

### v0.4.0 (Phase 4: Automatic Sync) ← **This Release**

- Added the `musubi-sync` command
- Change detection + automatic updates
- 3 execution modes (Interactive / Dry-run / Auto-approve)
- **Effect**: Prevents drift between documentation and code

### The Complete Lifecycle

```
musubi-onboard (v0.3.0)
  ↓
Generate initial steering documents
  ↓
Development and code changes
  ↓
musubi-sync (v0.4.0)
  ↓
Update steering documents
  ↓
Repeat...
```

**Phases 1-4 deliver a complete steering lifecycle.**

## Summary

### Why Project Memory Alone Wasn't Enough

1. **Drift from the codebase**: Manual recording cannot keep up with code changes
2. **Effort of updates**: Bilingual support and deciding when to update are burdens
3. **Synchronization in team development**: Mismatched understanding among multiple developers

### The v0.4.0 Solution

- **Automatic detection**: Detects changes in versions, languages, frameworks, and directories
- **3 modes**: Flexible operation with Interactive / Dry-run / Auto-approve
- **Bilingual support**: Updates English and Japanese at the same time
- **Audit trail**: Records every sync event

### How to Use

```bash
# Install
npm install -g musubi-sdd

# Analyze an existing project (first time)
musubi-onboard

# Detect changes and update (ongoing)
musubi-sync
musubi-sync --dry-run        # Preview
musubi-sync --auto-approve   # CI/CD
```

### Future Plans

With v0.4.0, Phases 1-4 of the roadmap are complete. Future possibilities:

- Git hook integration (automatic checks in pre-commit)
- CI/CD validation (verify sync state in PRs)
- Extended detection (architecture patterns, DB schema changes)
- LSP integration (symbol-level analysis, in the future)

## References

- [MUSUBI GitHub Repository](https://github.com/nahisaho/MUSUBI)
- [npm Package](https://www.npmjs.com/package/musubi-sdd)
- [Phase 1-4 Roadmap Analysis](https://github.com/nahisaho/MUSUBI/blob/main/docs/analysis/SERENA-STEERING-COMPARISON.md)

---

With MUSUBI v0.4.0, a complete steering system built on **project memory (knowledge) + automatic sync (state)** is now in place. Please give it a try!

**Happy Specification Driven Development! 🎉**
