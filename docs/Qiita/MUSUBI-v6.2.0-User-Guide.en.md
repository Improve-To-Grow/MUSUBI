# [MUSUBI v6.2.0] Now with the Review Gate Engine! The Complete SDD Guide to Automatically Safeguarding Quality

## Introduction

**MUSUBI SDD v6.2.0** is a framework that lets you practice Specification Driven Development (SDD) **simply by talking to your AI coding assistant in natural language**.

v6.2.0 introduces the **Review Gate Engine**, which can automatically verify quality at each phase: requirements → design → implementation.

---

## 🆕 What's New in v6.2.0

### 🚪 Review Gate Engine (the headline feature)

**Automated review gates** are placed between each development phase to ensure quality.

```
Requirements → [RequirementsReviewGate] → Design → [DesignReviewGate] → Implementation → [ImplementationReviewGate] → Done
```

#### New Review Prompts

| Prompt | Description |
|-----------|------|
| `#sdd-review-requirements <feature>` | Review requirements documents (EARS format, stakeholders, acceptance criteria) |
| `#sdd-review-design <feature>` | Review design documents (C4 model, ADRs, Constitutional Articles) |
| `#sdd-review-implementation <feature>` | Review the implementation (test coverage, code quality, traceability) |
| `#sdd-review-all <feature>` | Full review cycle across all phases |

### 📊 Workflow Dashboard

Visualize the progress of each feature in real time:

```bash
musubi dash --feature IMP-6.2
```

What it shows:
- Current stage (Requirements / Design / Implementation)
- Completion rate (%)
- List of blockers
- Suggested next actions

### 🔗 Traceability Automation

Automatically extracts requirement IDs from code, tests, and commits:

```typescript
// REQ-AUTH-001: User authentication
// IMP-6.2-001-01: Requirements review gate
```

Gap detection:
- Detects requirements without an implementation
- Detects requirements without tests
- Suggests corrective actions

### 🏛️ Enhanced Constitutional Compliance

Automatically verifies compliance with the 9 Constitutional Articles:

- **Article VII (Simplicity)** violation → automatically triggers the Phase -1 Gate
- **Article VIII (Anti-Abstraction)** violation → automatically triggers the Phase -1 Gate

### 📝 Automatic Documentation Generation

#### Experiment Report Generation

Generated automatically after running tests:

```bash
musubi report --test-results coverage/coverage-summary.json
```

#### Technical Article Templates

Supports four platforms:

| Platform | Command |
|-----------------|---------|
| Qiita | `musubi article --platform qiita` |
| Zenn | `musubi article --platform zenn` |
| Medium | `musubi article --platform medium` |
| Dev.to | `musubi article --platform devto` |

### 🔧 Error Recovery & Rollback

#### Error Recovery

Automatic analysis when a stage fails:
- Identifies the root cause
- Suggests remediation steps
- Records the failure history

#### Rollback

Rollback is possible at four levels of granularity:

| Level | Target | Description |
|--------|------|------|
| File | Individual files | Revert only specific files to a previous version |
| Commit | Git commit | Revert up to a specified commit |
| Stage | Workflow stage | Per Req/Design/Task/Impl unit |
| Sprint | Entire sprint | Return to the state at the start of the sprint |

---

## 🚀 Getting Started with SDD in Natural Language (start in 5 minutes)

### Step 1: Install MUSUBI

```bash
npx musubi-sdd init --copilot
```

### Step 2: Start developing just by talking to the AI

Once initialization is complete, Specification Driven Development begins **just by talking to the AI in natural language**.

---

## 💬 Examples of Working in Natural Language

### 🎯 I want to create requirements

> **"Create the requirements definition for the user authentication feature"**

The AI starts a one-question-at-a-time dialogue and defines comprehensive requirements using MECE analysis.

### 📐 I want to create a design

> **"Create the design for the user authentication feature using the C4 model"**

### 📋 I want to break it down into tasks

> **"Break the user authentication feature down into implementation tasks"**

### ⚙️ I want to proceed with implementation

> **"Start implementing, beginning with the P0 tasks"**

### ✅ I want a review (new in v6.2.0)

> **"Review the requirements for the user authentication feature"**

The AI checks:
- EARS-format syntax validation
- Stakeholder coverage
- Completeness of acceptance criteria

> **"Review the design for the user authentication feature"**

The AI checks:
- Completeness of the C4 model (Context, Container, Component)
- Presence and quality of ADRs
- Compliance with the Constitutional Articles

> **"Review the implementation of the user authentication feature"**

The AI checks:
- Test coverage (configurable, default 80%)
- Code quality (lint, type check)
- Traceability (requirements → design → code → tests)

> **"Do a full review of the user authentication feature"**

Reviews all phases in order.

### 📊 I want to check progress (new in v6.2.0)

> **"Show the progress of IMP-6.2"**

### 🔙 I want to roll back (new in v6.2.0)

> **"Roll back to the design stage"**

---

## 🤖 Supported AI Platforms (7)

| Platform | Setup |
|-----------------|-------------|
| **Claude Code** | `npx musubi-sdd init --claude` |
| **GitHub Copilot** | `npx musubi-sdd init --copilot` |
| **Cursor IDE** | `npx musubi-sdd init --cursor` |
| **Gemini CLI** | `npx musubi-sdd init --gemini` |
| **Codex CLI** | `npx musubi-sdd init --codex` |
| **Qwen Code** | `npx musubi-sdd init --qwen` |
| **Windsurf** | `npx musubi-sdd init --windsurf` |

---

## 📋 27+4 Specialized AI Agents

v6.2.0 adds four new agents.

### 🆕 New Agents (v6.2.0)

| Agent | What it does | Example request |
|-------------|-----------|-----------|
| **Review Gate Agent** | Runs review gates | "Review the XX feature" |
| **Dashboard Agent** | Progress visualization | "Show the progress" |
| **Traceability Agent** | Traceability analysis | "Detect gaps in the requirements" |
| **Recovery Agent** | Error recovery | "Roll back" |

### Core Workflow (9)

| What it does | Example request |
|-----------|-----------|
| Project setup | "Set up the project architecture" |
| Requirements definition | "Define the requirements for the XX feature" |
| System design | "Create the design for the XX feature using the C4 model" |
| Task breakdown | "Break the XX feature down into implementation tasks" |
| Implementation | "Implement the P0 tasks" |
| Validation | "Validate consistency between requirements and implementation" |
| Change analysis | "Analyze the impact of adding XX" |
| Change application | "Apply the change proposal" |
| Archiving | "Archive the completed changes" |

### Quality Assurance (6)

| What it does | Example request |
|-----------|-----------|
| Test design | "Design tests for the XX feature" |
| Code review | "Review this code" |
| Security audit | "Check for security vulnerabilities" |
| Performance optimization | "Optimize this process" |
| Quality management | "Check the quality metrics" |
| Governance validation | "Verify compliance with the constitutional articles" |

### Specialized Domains (12)

| What it does | Example request |
|-----------|-----------|
| API design | "Design a REST API" |
| Database design | "Design the schema for the users table" |
| Database operations | "Optimize the query" |
| UI/UX design | "Design the UI for the login screen" |
| DevOps | "Build a CI/CD pipeline" |
| Cloud design | "Design an AWS architecture" |
| AI/ML implementation | "Implement a recommendation system" |
| Documentation | "Write the API documentation" |
| Release management | "Write the release notes" |
| SRE | "Configure the alert settings" |
| Bug investigation | "Investigate the cause of this error" |
| Issue resolution | "Resolve this issue" |

---

## 🏛️ The 9 Constitutional Articles That Safeguard Quality

MUSUBI guarantees quality through a "constitution". **Automated verification has been strengthened in v6.2.0.**

| Article | Principle | Enhancement in v6.2.0 |
|------|------|----------------|
| I | Library-First | Verified by DesignReviewGate |
| II | CLI Interface | Verified by DesignReviewGate |
| III | Test-First | Verified by ImplementationReviewGate |
| IV | EARS Format | Verified by RequirementsReviewGate |
| V | Traceability | Automatically extracted by the Traceability Agent |
| VI | Project Memory | Automatically synced by SteeringSyncer |
| VII | Simplicity Gate | **Automatically triggers the Phase -1 Gate** |
| VIII | Anti-Abstraction | **Automatically triggers the Phase -1 Gate** |
| IX | Integration-First | Verified by ImplementationReviewGate |

### What is the Phase -1 Gate?

It is a special review process that is triggered when a change violating Article VII (Simplicity) or Article VIII (Anti-Abstraction) is detected.

- Mandatory review by the system architect
- Optional review by the project manager
- Final approval by a human

---

## 📁 Project Structure

A project initialized with MUSUBI:

```
your-project/
├── AGENTS.md                    # AI agent definitions (including review prompts)
├── steering/
│   ├── structure.md             # Architecture
│   ├── tech.md                  # Technology stack
│   ├── product.md               # Product information
│   └── rules/
│       └── constitution.md      # The 9 constitutional articles
├── storage/
│   ├── specs/                   # Requirements & design documents
│   ├── features/                # Per-feature files
│   ├── reviews/                 # Review results (v6.2.0)
│   ├── dashboard/               # Dashboard data (v6.2.0)
│   ├── transitions/             # Stage transition records (v6.2.0)
│   └── traceability/            # Traceability matrix (v6.2.0)
└── lib/
    └── musubi-review-gate/      # Review Gate Engine (v6.2.0)
```

---

## 🔧 Configuration Options

### Review Gate Settings

```yaml
# steering/project.yml
reviewGate:
  requirements:
    earsCheck: true
    stakeholderCoverage: true
    acceptanceCriteriaRequired: true
  design:
    c4Required: ['context', 'container', 'component']
    adrRequired: true
    constitutionalArticles: [1, 2, 7, 8]
  implementation:
    minCoverage: 80        # Test coverage threshold
    coverageType: 'line'   # line / branch / function
    lintStrict: true       # Block on lint errors
```

### Traceability Settings

```yaml
# steering/project.yml
traceability:
  patterns:
    - 'REQ-[A-Z0-9]+-\\d{3}'
    - 'IMP-\\d+\\.\\d+-\\d{3}(?:-\\d{2})?'
  extractFrom:
    - 'src/**/*.{ts,js}'
    - 'tests/**/*.test.{ts,js}'
  outputPath: 'storage/traceability/matrix.yml'
```

---

## 📈 Test Results

v6.2.0 ensures coverage with **4,827 tests**.

| Category | Number of tests |
|---------|---------|
| Review Gate Engine | 105 |
| Dashboard & Traceability | 141 |
| Constitutional Compliance | 144 |
| Enterprise Features | 100 |
| Existing features | 4,337 |
| **Total** | **4,827** |

---

## 🎯 Use Cases

### Use Case 1: New Feature Development

```
1. "Define the requirements for the user authentication feature"
2. "Review the requirements" ← new in v6.2.0
3. "Create the design using the C4 model"
4. "Review the design" ← new in v6.2.0
5. "Break it down into tasks"
6. "Implement it"
7. "Review the implementation" ← new in v6.2.0
8. "Do a full review" ← new in v6.2.0
```

### Use Case 2: Early Detection of Quality Issues

```
1. "Detect traceability gaps"
   → Detects requirements without implementation and requirements without tests

2. "Check Constitutional compliance"
   → Detects Article violations and triggers the Phase -1 Gate
```

### Use Case 3: Progress Management

```
1. "Show the progress of IMP-6.2"
   → Visualized on the dashboard

2. "Show the stage transition history"
   → Check who approved what and when
```

---

## 🔄 How to Upgrade

Upgrade an existing project to v6.2.0:

```bash
# Upgrade with the latest version (recommended)
npx musubi-sdd@latest upgrade

# Specify a particular version
npx musubi-sdd@latest upgrade --to 6.2.0

# Preview the changes (without applying them)
npx musubi-sdd upgrade --dry-run
```

For a local installation:

```bash
npm install musubi-sdd@latest
npx musubi-sdd upgrade
```

---

## 📚 Related Documents

- [MUSUBI SDD Official Documentation](https://github.com/nahisaho/MUSUBI)
- [Constitutional Governance](steering/rules/constitution.md)
- [Review Gate Engine API Reference](docs/API-REFERENCE.md)
- [CHANGELOG v6.2.0](CHANGELOG.md)

---

## Summary

In MUSUBI v6.2.0, the **Review Gate Engine** significantly strengthens quality management.

✅ **Automated reviews at each phase: requirements, design, and implementation**
✅ **Automatic traceability extraction and gap detection**
✅ **Automated verification of compliance with the Constitutional Articles**
✅ **Prevention of excessive complexity via the Phase -1 Gate**
✅ **Progress visualization with the workflow dashboard**
✅ **Error recovery and rollback capabilities**

Just by talking to the AI in natural language, you can achieve high-quality software development.

---

**MUSUBI Version**: 6.2.0
**Release Date**: 2025-12-31
**Test Coverage**: 4,827 tests passing

---

## Tags

`#MUSUBI` `#SDD` `#SpecificationDrivenDevelopment` `#AIDevelopment` `#GitHub Copilot` `#Claude` `#QualityManagement` `#Review Gate` `#Traceability`
