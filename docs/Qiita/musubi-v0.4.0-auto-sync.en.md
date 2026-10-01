# MUSUBI v0.4.0 - Why Project Memory Alone Wasn't Enough, and Implementing Auto-Sync

**Tags**: `AI` `ChatGPT` `GitHub` `npm` `Documentation`

## Introduction

We have released MUSUBI (Ultimate Specification Driven Development Tool) v0.4.0. This version adds an **automatic synchronization feature for steering documents** (`musubi-sync`).

In this article, I answer the question "Why wasn't project memory alone enough?" while explaining the new features in v0.4.0 and how to use them.

## TL;DR (Summary)

**What was the problem?**
- Project memory for AI agents (v0.2.0) could record "why a technology was chosen," but "which technologies are in use right now" was not updated automatically
- Even when the code changed, the documentation stayed stale → the AI operated on wrong assumptions

**How was it solved?**
- The `musubi-sync` command automatically detects codebase changes (version, dependencies, directories)
- Detected changes are automatically reflected in the steering documents (both English and Japanese)

**What are the benefits?**
- Zero manual update effort (10 minutes → 3 seconds, a 95% reduction)
- Prevents drift between documentation and code (always up to date)
- Can be integrated into CI/CD pipelines (`--auto-approve` option)

```bash
# Install
npm install -g musubi-sdd

# Analyze an existing project and generate documentation (v0.3.0)
musubi-onboard

# Detect codebase changes and update documentation (v0.4.0)
musubi-sync
```

## Why Wasn't Project Memory Alone Enough?

### Challenges up to v0.2.0

In MUSUBI v0.2.0, inspired by the Serena project, we implemented a **project memory system**.

```
steering/
├── memories/
│   ├── architecture_decisions.md  # Design decisions
│   ├── development_workflow.md    # Development workflow
│   ├── domain_knowledge.md        # Domain knowledge
│   ├── lessons_learned.md         # Lessons learned
│   ├── suggested_commands.md      # Suggested commands
│   └── technical_debt.md          # Technical debt
├── structure.md                   # Architecture patterns
├── tech.md                        # Technology stack
└── product.md                     # Product context
```

This allowed AI agents to persist knowledge across conversations.

#### The Role of the Memory System

Each of the 6 memory files added in v0.2.0 records a different kind of knowledge.

1. **architecture_decisions.md** (design decisions)
   - Records important design decisions in ADR (Architecture Decision Record) format
   - Examples: "Why we chose JWT authentication," "Why we moved to microservices"
   - **AI agents read this to understand the reasoning behind past decisions**

2. **development_workflow.md** (development workflow)
   - Records the project-specific development process
   - Examples: "PR approval rules," "Deployment procedure," "Branching strategy"
   - **AI agents follow this when proposing work**

3. **domain_knowledge.md** (domain knowledge)
   - Records business logic and industry-specific knowledge
   - Examples: "Point calculation logic," "Fiscal year definition," "Industry terminology"
   - **AI agents refer to this when generating code**

4. **lessons_learned.md** (lessons learned)
   - Records past problems and improvements
   - Examples: "Performance problems and their solutions," "Failed refactorings"
   - **AI agents avoid repeating the same mistakes**

5. **suggested_commands.md** (suggested commands)
   - Records commands and scripts frequently used in the project
   - Examples: "How to run tests," "Setting up the local environment," "Debugging steps"
   - **AI agents suggest the appropriate commands**

6. **technical_debt.md** (technical debt)
   - Records issues to be addressed in the future
   - Examples: "Outdated dependencies," "Refactoring candidates," "TODO comments"
   - **AI agents take priorities into account when proposing work**

#### What Project Memory Alone Could Record

The project memory in v0.2.0 was **a mechanism for recording "human judgment and experience."**

- ✅ **Could record**: Why a technology was chosen (Why)
- ✅ **Could record**: What problems occurred in the past (History)
- ✅ **Could record**: What rules govern development (How)
- ❌ **Could not record**: Which technologies are in use now (What)
- ❌ **Could not record**: What the current version is (Current State)
- ❌ **Could not record**: Which directories exist (Structure)

**In other words, qualitative knowledge (Why/How) could be recorded, but quantitative information (What) had to rely on manual updates.**

However, **once we put it into practice, we discovered a major problem**.

### Problem 1: Drift from the Codebase

Project memory is "manually recorded knowledge." In real development, however:

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

### Problem 2: Update Effort and Timing

Manual updates come with the following challenges.

1. **Forgetting to update**: When focused on development, it's easy to forget to update the documentation
2. **Unclear update timing**: It's hard to decide when an update is needed
3. **Missed updates**: It's hard to keep track of what changed
4. **Bilingual burden**: Both the English and Japanese versions must be updated

### Problem 3: Synchronization in Team Development

When there are multiple developers:

- Developer A adds a new framework
- Developer B works from outdated documentation
- **Result**: Misunderstandings arise

**In other words, project memory can hold "recorded knowledge," but there was no mechanism to automatically reflect "the current state of the codebase."**

## The v0.4.0 Solution: An Automatic Synchronization System

### Architecture

v0.4.0 achieves automatic synchronization in the following 5 steps.

```
1. Load Config
   └─> Load steering/project.yml
   
2. Analyze Codebase
   └─> Scan package.json and the directory structure
   
3. Detect Changes
   └─> Compare the configuration with the actual state
   
4. Display & Confirm
   └─> Display the changes and ask the user to confirm
   
5. Apply Updates
   └─> Update YAML + Markdown files (English and Japanese)
```

### How Change Detection Works

`musubi-sync` detects changes in the following categories.

| Category | What Is Detected | Updated Files |
|---------|---------|--------|
| **Version** | Version changes in `package.json` | `project.yml` |
| **Languages** | Added/removed languages | `project.yml` |
| **Frameworks** | Added/removed dependencies | `project.yml`, `tech.md` (en/ja) |
| **Directories** | Newly created directories | `project.yml`, `structure.md` (en/ja) |

### Implementation Details

#### 1. YAML Parsing: Avoiding a Hand-Rolled Implementation

Initially, we considered manipulating YAML manually as strings, but decided it was too error-prone. We adopted the **js-yaml library** instead.

```javascript
const yaml = require('js-yaml');

// Load
const config = yaml.load(fs.readFileSync('steering/project.yml', 'utf8'));

// Update
config.version = newVersion;

// Write (preserving structure)
fs.writeFileSync('steering/project.yml', yaml.dump(config, {
  indent: 2,
  lineWidth: 100
}));
```

#### 2. Change Detection: Filtering Out Noise

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

Full automation carries risk. We provide **3 execution modes**:

```bash
# Interactive (default): show changes and ask for confirmation
musubi-sync

# Dry-run: preview only (do not apply)
musubi-sync --dry-run

# Auto-approve: apply automatically (for CI/CD)
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
    
    // Add new frameworks
    changes.newFrameworks.forEach(framework => {
      const isJapanese = file.endsWith('.ja.md');
      const addition = isJapanese
        ? `- **${framework}** - [説明を記載してください]` // Japanese for "[Please add a description]"
        : `- **${framework}** - [Add description]`;
      
      content = appendToSection(content, '## Frameworks', addition);
    });
    
    fs.writeFileSync(file, content);
  });
}
```

#### 5. Audit Trail: Recording Every Sync

Sync events are recorded in `architecture_decisions.md`:

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
  
  // Prepend the latest changes
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

**Output**:

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

Continue developing as usual.

```bash
# Add a new dependency
npm install axios

# Create a new directory
mkdir -p src/api

# Bump the version
npm version patch  # 0.3.0 → 0.3.1
```

### 4. Sync: Detect Changes and Update

#### Interactive Mode (Default)

```bash
musubi-sync
```

**Output**:

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

When you want to review the changes but don't want to apply them yet:

```bash
musubi-sync --dry-run
```

**Output**:

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

#### Auto-approve Mode (For CI/CD)

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

### 5. Ongoing Operation

Build it into your development cycle.

```
Develop → musubi-sync → Review → Commit
  ↑                                   ↓
  └───────────────────────────────────┘
```

**Recommended frequency**:

- **Weekly**: Run `musubi-sync` regularly
- **Before a release**: Always sync to confirm everything is up to date
- **After major changes**: When adding new dependencies or directories

## Real-World Impact

Results from dogfooding on the MUSUBI project itself:

### Before (up to v0.3.0)

- **Manual updates**: Forgot to update `tech.md` after completing Phase 3
- **Bilingual burden**: Both English and Japanese edited manually
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

**Impact**:

- ⏱️ **Time savings**: 10 minutes of manual updates → 3 seconds of auto-sync (95% reduction)
- 🎯 **Improved accuracy**: Zero missed detections
- 🌐 **Bilingual support**: English and Japanese synced automatically
- 📝 **Audit trail**: Every change recorded in `architecture_decisions.md`

## Project Memory vs. Auto-Sync: When to Use Which

| Item | Project Memory (v0.2.0) | Auto-Sync (v0.4.0) |
|------|---------------------------|------------------|
| **Purpose** | Design decisions, lessons learned, domain knowledge | Codebase state (version, tech stack, structure) |
| **Updates** | Manual (AI agent or developer) | Automatic detection + confirmation |
| **Content** | Qualitative knowledge (Why, How) | Quantitative information (What) |
| **Change frequency** | Low (only for important decisions) | High (continuously during development) |
| **Examples** | "Why we adopted JWT authentication", "Insights from performance improvements" | "Current version: 0.4.0", "Frameworks in use: React, Jest" |

**The two are complementary**:

- **Project memory**: Why a technology was chosen (Why)
- **Auto-sync**: Which technologies are in use now (What)

## The Evolution from v0.1.7 to v0.4.0

A look back at how MUSUBI has evolved.

### v0.1.7 (Initial Release)

- 25 agents + constitutional governance
- Support for 7 platforms
- **Challenge**: Steering documents created and updated manually

### v0.2.0 (Phase 1: Memory System)

- Added project memory (`steering/memories/`)
- Persisted design decisions and lessons learned
- **Challenge**: Could not keep up with codebase changes

### v0.2.1 (Phase 2: Project Configuration)

- Added `steering/project.yml`
- Standardized project configuration
- **Challenge**: Applying it to existing projects was laborious

### v0.3.0 (Phase 3: Onboarding Automation)

- Added the `musubi-onboard` command
- Automatically analyzes existing projects and generates documentation
- **Impact**: 96% reduction in setup time (2-4 hours → 2-5 minutes)
- **Challenge**: Only for the initial setup, with no ongoing updates

### v0.4.0 (Phase 4: Auto-Sync) ← **This release**

- Added the `musubi-sync` command
- Change detection + automatic updates
- 3 execution modes (Interactive / Dry-run / Auto-approve)
- **Impact**: Prevents drift between documentation and code

### The Complete Lifecycle

```
musubi-onboard (v0.3.0)
  ↓
Generate initial steering documents
  ↓
Develop and change code
  ↓
musubi-sync (v0.4.0)
  ↓
Update steering documents
  ↓
Repeat...
```

**Phases 1-4 together deliver a complete steering lifecycle.**

## Summary

### Why Project Memory Alone Wasn't Enough

1. **Drift from the codebase**: Manual records can't keep up with code changes
2. **Update effort**: Bilingual maintenance and deciding when to update are burdensome
3. **Synchronization in team development**: Misunderstandings among multiple developers

### The v0.4.0 Solution

- **Automatic detection**: Detects changes to versions, languages, frameworks, and directories
- **3 modes**: Flexible operation with Interactive / Dry-run / Auto-approve
- **Bilingual support**: Updates English and Japanese simultaneously
- **Audit trail**: Records every sync event

### Usage

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

### What's Next

v0.4.0 completes roadmap Phases 1-4. Future possibilities:

- Git hook integration (automatic checks on pre-commit)
- CI/CD validation (verify sync status on PRs)
- Extended detection (architecture patterns, DB schema changes)
- LSP integration (symbol-level analysis, future)

## References

- [MUSUBI GitHub Repository](https://github.com/nahisaho/MUSUBI)
- [npm Package](https://www.npmjs.com/package/musubi-sdd)
- [Phase 1-4 Roadmap Analysis](https://github.com/nahisaho/MUSUBI/blob/main/docs/analysis/SERENA-STEERING-COMPARISON.md)

---

With MUSUBI v0.4.0, a complete steering system combining **project memory (knowledge) + auto-sync (state)** is now in place. Give it a try!

**Happy Specification Driven Development! 🎉**
