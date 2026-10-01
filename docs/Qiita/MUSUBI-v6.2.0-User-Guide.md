# [MUSUBI v6.2.0] Featuring the Review Gate Engine! The Complete SDD Guide That Automatically Protects Quality

## Introduction

**MUSUBI SDD v6.2.0** is a framework that enables Specification Driven Development (SDD) by **simply talking to your AI coding assistant in natural language**.

With v6.2.0, the **Review Gate Engine** is now included, so quality can be validated automatically at each phase from requirements to design to implementation.

---

## 🆕 New Features in v6.2.0

### 🚪 Review Gate Engine (The Highlight)

**Automatic review gates** are placed between development phases to ensure quality.

```
Requirements → [RequirementsReviewGate] → Design → [DesignReviewGate] → Implementation → [ImplementationReviewGate] → Complete
```

#### New Review Prompts

| Prompt | Description |
|-----------|------|
| `#sdd-review-requirements <feature>` | Review the requirements document (EARS format, stakeholders, acceptance criteria) |
| `#sdd-review-design <feature>` | Review the design document (C4 model, ADR, Constitutional Articles) |
| `#sdd-review-implementation <feature>` | Review the implementation (test coverage, code quality, traceability) |
| `#sdd-review-all <feature>` | Complete review cycle for all phases |

### 📊 Workflow Dashboard

Visualize the progress of each feature in real time:

```bash
musubi dash --feature IMP-6.2
```

Displayed content:
- Current stage (Requirements / Design / Implementation)
- Completion rate (%)
- List of blockers
- Suggested next actions

### 🔗 Traceability Automation

Automatically extract requirement IDs from code, tests, and commits:

```typescript
// REQ-AUTH-001: User authentication
// IMP-6.2-001-01: Requirements review gate
```

Gap detection features:
- Detect requirements without implementation
- Detect requirements without tests
- Suggest corrective actions

### 🏛️ Enhanced Constitutional Compliance

Automatically validate compliance with the 9 Constitutional Articles:

- **Article VII (Simplicity)** violation → Phase -1 Gate triggered automatically
- **Article VIII (Anti-Abstraction)** violation → Phase -1 Gate triggered automatically

### 📝 Automatic Document Generation

#### Experiment Report Generation

Generated automatically after test runs:

```bash
musubi report --test-results coverage/coverage-summary.json
```

#### Technical Article Templates

Supports 4 platforms:

| Platform | Command |
|-----------------|---------|
| Qiita | `musubi article --platform qiita` |
| Zenn | `musubi article --platform zenn` |
| Medium | `musubi article --platform medium` |
| Dev.to | `musubi article --platform devto` |

### 🔧 Error Recovery and Rollback

#### Error Recovery

Automatic analysis when a stage fails:
- Identify the root cause
- Suggest fix steps
- Record failure history

#### Rollback Feature

Rollback is possible at 4 levels of granularity:

| Level | Target | Description |
|--------|------|------|
| File | Individual file | Revert only a specific file to its previous version |
| Commit | Git commit | Revert up to the specified commit |
| Stage | Workflow stage | Per Req/Design/Task/Impl unit |
| Sprint | Entire sprint | Return to the start of the sprint |

---

## 🚀 Getting Started with SDD in Natural Language (Start in 5 Minutes)

### Step 1: Install MUSUBI

```bash
npx musubi-sdd init --copilot
```

### Step 2: Start Developing by Just Talking to the AI

Once initialization is complete, Specification Driven Development begins when you **simply talk to the AI in natural language**.

---

## 💬 Examples of Working in Natural Language

### 🎯 Want to Create Requirements

> **"Create requirements for the user authentication feature"**

The AI starts a dialogue, asking one question at a time, and defines comprehensive requirements using MECE analysis.

### 📐 Want to Create a Design

> **"Create a design for the user authentication feature using the C4 model"**

### 📋 Want to Break Down into Tasks

> **"Break down the user authentication feature into implementation tasks"**

### ⚙️ Want to Proceed with Implementation

> **"Start implementing from the P0 tasks"**

### ✅ Want to Review (New in v6.2.0)

> **"Review the requirements for the user authentication feature"**

The AI checks the following:
- EARS format syntax validation
- Stakeholder coverage
- Completeness of acceptance criteria

> **"Review the design for the user authentication feature"**

The AI checks the following:
- Completeness of the C4 model (Context, Container, Component)
- Existence and quality of ADRs
- Constitutional Articles compliance

> **"Review the implementation of the user authentication feature"**

The AI checks the following:
- Test coverage (configurable, default 80%)
- Code quality (lint, type check)
- Traceability (requirements → design → code → tests)

> **"Do a full review of the user authentication feature"**

Reviews all phases in order.

### 📊 Want to Check Progress (New in v6.2.0)

> **"Show the progress of IMP-6.2"**

### 🔙 Want to Roll Back (New in v6.2.0)

> **"Roll back to the design stage"**

---

## 🤖 Supported AI Platforms (7 Types)

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

v6.2.0 adds 4 new agents.

### 🆕 New Agents (v6.2.0)

| Agent | What It Can Do | Example Phrasing |
|-------------|-----------|-----------|
| **Review Gate Agent** | Run review gates | "Review the XX feature" |
| **Dashboard Agent** | Visualize progress | "Show the progress status" |
| **Traceability Agent** | Traceability analysis | "Detect requirement gaps" |
| **Recovery Agent** | Error recovery | "Roll back" |

### Core Workflow (9)

| What You Can Do | Example Phrasing |
|-----------|-----------|
| Project setup | "Set up the project architecture" |
| Requirements definition | "Define requirements for the XX feature" |
| System design | "Create a design for the XX feature using the C4 model" |
| Task breakdown | "Break down the XX feature into implementation tasks" |
| Implementation | "Implement the P0 tasks" |
| Validation | "Validate the consistency between requirements and implementation" |
| Change analysis | "Analyze the impact of adding XX" |
| Change application | "Apply the change proposal" |
| Archive | "Archive the completed changes" |

### Quality Assurance (6)

| What You Can Do | Example Phrasing |
|-----------|-----------|
| Test design | "Design tests for the XX feature" |
| Code review | "Review this code" |
| Security audit | "Check for security vulnerabilities" |
| Performance optimization | "Optimize this process" |
| Quality management | "Check the quality metrics" |
| Governance validation | "Check compliance with the Constitutional Articles" |

### Specialized Areas (12)

| What You Can Do | Example Phrasing |
|-----------|-----------|
| API design | "Design a REST API" |
| Database design | "Design the schema for the users table" |
| Database operations | "Optimize the query" |
| UI/UX design | "Design the UI for the login screen" |
| DevOps | "Build a CI/CD pipeline" |
| Cloud design | "Design an AWS architecture" |
| AI/ML implementation | "Implement a recommendation system" |
| Documentation | "Create API documentation" |
| Release management | "Create release notes" |
| SRE | "Configure alert settings" |
| Bug investigation | "Investigate the cause of this error" |
| Issue resolution | "Resolve this Issue" |

---

## 🏛️ Nine Constitutional Articles That Protect Quality

MUSUBI guarantees quality through a "Constitution". **v6.2.0 strengthens automatic validation.**

| Article | Principle | Enhancement in v6.2.0 |
|------|------|----------------|
| I | Library-First | Validated by DesignReviewGate |
| II | CLI Interface | Validated by DesignReviewGate |
| III | Test-First | Validated by ImplementationReviewGate |
| IV | EARS Format | Validated by RequirementsReviewGate |
| V | Traceability | Automatically extracted by the Traceability Agent |
| VI | Project Memory | Automatically synchronized by SteeringSyncer |
| VII | Simplicity Gate | **Phase -1 Gate automatic trigger** |
| VIII | Anti-Abstraction | **Phase -1 Gate automatic trigger** |
| IX | Integration-First | Validated by ImplementationReviewGate |

### What Is the Phase -1 Gate?

A special review process triggered when a change that violates Article VII (Simplicity) or Article VIII (Anti-Abstraction) is detected.

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
│       └── constitution.md      # The 9 Constitutional Articles
├── storage/
│   ├── specs/                   # Requirements and design documents
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

### Review Gate Configuration

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

### Traceability Configuration

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

v6.2.0 is backed by **4,827 tests** of coverage.

| Category | Number of Tests |
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
1. "Define requirements for the user authentication feature"
2. "Review the requirements" ← New in v6.2.0
3. "Create a design using the C4 model"
4. "Review the design" ← New in v6.2.0
5. "Break it down into tasks"
6. "Implement it"
7. "Review the implementation" ← New in v6.2.0
8. "Do a full review" ← New in v6.2.0
```

### Use Case 2: Early Detection of Quality Issues

```
1. "Detect traceability gaps"
   → Detect requirements without implementation and requirements without tests

2. "Check Constitutional compliance"
   → Detect Article violations and trigger the Phase -1 Gate
```

### Use Case 3: Progress Management

```
1. "Show the progress of IMP-6.2"
   → Visualize on the dashboard

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

# Preview changes (without applying)
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

With MUSUBI v6.2.0, quality management has been significantly strengthened by the **Review Gate Engine**.

✅ **Automatic review at each phase of requirements, design, and implementation**
✅ **Automatic extraction of traceability and gap detection**
✅ **Automatic validation of Constitutional Articles compliance**
✅ **Prevention of excessive complexity via the Phase -1 Gate**
✅ **Progress visualization with the workflow dashboard**
✅ **Error recovery and rollback features**

Just talk to the AI in natural language to achieve high-quality software development.

---

**MUSUBI Version**: 6.2.0
**Release Date**: 2025-12-31
**Test Coverage**: 4,827 tests passing

---

## Tags

`#MUSUBI` `#SDD` `#Specification Driven Development` `#AI Development` `#GitHub Copilot` `#Claude` `#Quality Management` `#Review Gate` `#Traceability`
