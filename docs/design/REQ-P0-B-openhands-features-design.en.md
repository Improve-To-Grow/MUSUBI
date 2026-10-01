# REQ-P0-B: OpenHands-Derived Features - Integrated Design Document

> 🇯🇵 日本語版 (Japanese version): [REQ-P0-B-openhands-features-design.md](./REQ-P0-B-openhands-features-design.md)

| Item | Details |
|------|------|
| **Document ID** | DESIGN-P0-B-001 |
| **Version** | 1.0 |
| **Created** | 2025-12-07 |
| **Related ADRs** | ADR-P0-B001 to ADR-P0-B008 |
| **Target version** | MUSUBI v2.2.0 |
| **Source** | OpenHands (https://github.com/OpenHands/OpenHands) |

---

## 1. Overview

### 1.1 Purpose

This document defines the technical design of eight core features adopted from OpenHands. These features significantly improve MUSUBI's agent quality and user experience.

### 1.2 Target Requirements

| Requirement ID | Feature | Priority |
|--------|--------|--------|
| REQ-P0-B001 | Stuck detection system | Highest |
| REQ-P0-B002 | Keyword-triggered skills | Highest |
| REQ-P0-B003 | Repository-specific skills | Highest |
| REQ-P0-B004 | Memory condenser | High |
| REQ-P0-B005 | Critic (evaluation) system | High |
| REQ-P0-B006 | Automatic GitHub issue resolution | Medium |
| REQ-P0-B007 | Security risk analyzer | Medium |
| REQ-P0-B008 | Agent memory | Medium |

---

## 2. System Architecture

### 2.1 C4 Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MUSUBI SDD System                             │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   User      │  │  AI Agent   │  │   GitHub    │  │  LLM API    │ │
│  │ (Developer) │  │(Claude etc.)│  │    API      │  │ (OpenAI etc)│ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│         ▼                ▼                ▼                ▼        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    MUSUBI Core Engine                           ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       ││
│  │  │  Stuck    │ │  Skills   │ │  Memory   │ │ Security  │       ││
│  │  │ Detector  │ │  Loader   │ │ Condenser │ │ Analyzer  │       ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       ││
│  │  │  Critic   │ │  Issue    │ │  Agent    │ │  Event    │       ││
│  │  │  System   │ │ Resolver  │ │  Memory   │ │  Stream   │       ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    steering/ (Project Memory)                   ││
│  │  memories/ │ rules/ │ templates/ │ product.md │ structure.md   ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Directory Structure

```
musubi/
├── src/
│   ├── agents/
│   │   └── registry.js           # Existing
│   ├── analyzers/
│   │   ├── stuck-detector.js     # NEW: REQ-P0-B001
│   │   └── security-analyzer.js  # NEW: REQ-P0-B007
│   ├── generators/
│   │   └── ... (existing)
│   ├── managers/
│   │   ├── skills-loader.js      # NEW: REQ-P0-B002, REQ-P0-B003
│   │   ├── memory-condenser.js   # NEW: REQ-P0-B004
│   │   └── agent-memory.js       # NEW: REQ-P0-B008
│   ├── validators/
│   │   ├── critic-system.js      # NEW: REQ-P0-B005
│   │   └── ... (existing)
│   └── resolvers/
│       └── issue-resolver.js     # NEW: REQ-P0-B006
├── steering/
│   └── memories/
│       ├── quality_report.md     # Critic output
│       ├── session_learnings.md  # AgentMemory output
│       └── stuck_history.md      # StuckDetector history
└── .musubi/
    └── skills/                   # Repository-specific skills
        └── repo.md
```

---

## 3. REQ-P0-B001: Stuck Detection System

### 3.1 Class Design

```javascript
/**
 * Stuck detection system
 * Inspired by OpenHands: openhands/controller/stuck.py
 */
class StuckDetector {
  constructor(options = {}) {
    this.maxRepeatActions = options.maxRepeatActions || 4;
    this.maxRepeatErrors = options.maxRepeatErrors || 3;
    this.history = [];
    this.stuckAnalysis = null;
  }

  /**
   * Add an event to the history
   * @param {StuckEvent} event 
   */
  addEvent(event) {}

  /**
   * Detect a stuck state
   * @returns {StuckAnalysis|null}
   */
  detect() {}

  /**
   * Suggest alternative approaches
   * @returns {string[]}
   */
  suggestAlternatives() {}
}
```

### 3.2 Detection Scenarios

| Scenario | Detection Condition | Intervention |
|----------|----------|---------------|
| Repeated identical action | Same action + result 4 times in a row | Warning + alternative suggestions |
| Error loop | Same error 3 times in a row | Forced stop + root cause analysis |
| Monologue | 10+ steps of thinking with no output | Progress check prompt |
| Context overflow | 3 token-limit errors | Trigger memory condensation |
| Stage oscillation | Bouncing between the same stages 3 times | Suggest pinning the stage |

### 3.3 Data Model

```typescript
interface StuckEvent {
  id: string;
  timestamp: Date;
  type: 'action' | 'observation' | 'error';
  stage: 'requirements' | 'design' | 'implement' | 'test';
  content: string;
  hash: string;  // Hash of the content (for comparison)
}

interface StuckAnalysis {
  loopType: 'repeating_action' | 'error_loop' | 'monologue' | 'context_overflow' | 'stage_oscillation';
  loopRepeatTimes: number;
  loopStartIndex: number;
  suggestedActions: string[];
  severity: 'warning' | 'critical';
}
```

### 3.4 CLI Integration

```bash
# Automatic detection during workflow execution
musubi-workflow --detect-stuck

# Check stuck history
musubi-workflow --stuck-history

# Configure automatic intervention when stuck
musubi-workflow --stuck-action=warn|pause|abort
```

---

## 4. REQ-P0-B002: Keyword-Triggered Skills

### 4.1 Skill Definition Format

```yaml
# Frontmatter of steering/skills/testing.md
---
name: testing-skill
type: knowledge
version: 1.0.0
triggers:
  - test
  - unit test
  - テスト        # Japanese trigger keyword ("test")
  - 単体テスト    # Japanese trigger keyword ("unit test")
  - /\btest(ing)?\b/i   # Regular expression support
agent: all
priority: 10  # Higher value takes precedence
---

# Skill content (Markdown)
## Test Writing Guidelines

- Use Jest/Vitest
- Aim for 80%+ coverage
- ...
```

### 4.2 Skills Loader Design

```javascript
/**
 * Skills loader
 * Inspired by OpenHands: openhands/microagent/microagent.py
 */
class SkillsLoader {
  constructor(options = {}) {
    this.globalSkillsDir = options.globalDir || path.join(__dirname, '../skills');
    this.repoSkillsDir = options.repoDir || '.musubi/skills';
    this.userSkillsDir = options.userDir || path.join(os.homedir(), '.musubi/skills');
    this.loadedSkills = new Map();
  }

  /**
   * Load all skills
   * Priority: repository > user > global
   */
  async loadAll() {}

  /**
   * Activate skills based on keywords
   * @param {string} message User message
   * @returns {Skill[]} Activated skills
   */
  activateByKeywords(message) {}

  /**
   * Parse a skill
   * @param {string} filePath 
   * @returns {Skill}
   */
  parseSkill(filePath) {}
}
```

### 4.3 Trigger Matching Algorithm

```javascript
function matchTriggers(message, triggers) {
  const normalizedMessage = message.toLowerCase();
  
  return triggers.filter(trigger => {
    // Regular expression case
    if (trigger.startsWith('/') && trigger.endsWith('/')) {
      const regex = new RegExp(trigger.slice(1, -1), 'i');
      return regex.test(message);
    }
    
    // Plain keyword
    return normalizedMessage.includes(trigger.toLowerCase());
  });
}
```

---

## 5. REQ-P0-B003: Repository-Specific Skills

### 5.1 Directory Structure

```
project-root/
├── .musubi/
│   ├── config.yml              # MUSUBI configuration
│   └── skills/
│       ├── repo.md             # Repository overview (required, auto-generated)
│       ├── testing.md          # Testing conventions
│       ├── deployment.md       # Deployment procedure
│       └── coding-style.md     # Coding conventions
└── steering/
    └── ...
```

### 5.2 Automatic repo.md Generation

```javascript
/**
 * Automatically generate repo.md from repository information
 */
async function generateRepoMd(projectRoot) {
  const analysis = await analyzeProject(projectRoot);
  
  return `---
name: repo
type: repo
agent: all
---

# ${analysis.name}

${analysis.description}

## General Setup

${analysis.setupCommands.map(cmd => `- \`${cmd}\``).join('\n')}

## Repository Structure

${analysis.structure}

## Common Commands

| Command | Description |
|---------|-------------|
${analysis.commands.map(c => `| \`${c.cmd}\` | ${c.desc} |`).join('\n')}

## Testing

${analysis.testingInfo}

## CI/CD Workflows

${analysis.cicdInfo}
`;
}
```

### 5.3 Integration with musubi-onboard

```bash
# Automatically generate .musubi/skills/repo.md when running onboard
musubi-onboard

# Output:
# ✓ Analyzed project structure
# ✓ Detected: Node.js + TypeScript + Jest
# ✓ Created .musubi/skills/repo.md
# ✓ Updated steering/product.md
```

---

## 6. REQ-P0-B004: Memory Condenser

### 6.1 Condenser Strategy

```javascript
/**
 * Memory condenser
 * Inspired by OpenHands: openhands/memory/condenser/condenser.py
 */
class MemoryCondenser {
  constructor(options = {}) {
    this.type = options.type || 'llm';  // 'llm' | 'recent' | 'noop'
    this.maxSize = options.maxSize || 100;
    this.keepFirst = options.keepFirst || 2;
    this.summaryModel = options.summaryModel || 'gpt-4o-mini';
  }

  /**
   * Condense the event history
   * @param {Event[]} events 
   * @returns {CondensedView}
   */
  async condense(events) {}

  /**
   * Generate a summary using an LLM
   * @param {Event[]} chunk 
   * @returns {string}
   */
  async summarizeChunk(chunk) {}
}
```

### 6.2 Condensation Algorithm

```
1. Always keep the first N events (keepFirst)
2. Chunk the remaining events between user messages
3. Summarize chunks with the LLM, oldest first
4. Insert the summary into the history as a SummaryEvent
5. Repeat until the size is at or below maxSize
```

### 6.3 Configuration (project.yml)

```yaml
condenser:
  type: llm              # llm | recent | noop
  max_size: 100          # Maximum number of events
  keep_first: 2          # Number of initial events always kept
  summary_model: gpt-4o-mini  # LLM used for summaries
  preserve_patterns:     # Patterns that are always kept
    - "DECISION:"
    - "ARCHITECTURE:"
    - "REQ-"
```

---

## 7. REQ-P0-B005: Critic (Evaluation) System

### 7.1 Critic Base Class

```javascript
/**
 * Evaluation system base class
 * Inspired by OpenHands: openhands/critic/base.py
 */
class BaseCritic {
  /**
   * Evaluate a list of events
   * @param {Event[]} events 
   * @param {Object} context Additional context
   * @returns {CriticResult}
   */
  evaluate(events, context = {}) {
    throw new Error('Must implement evaluate()');
  }
}

class CriticResult {
  constructor(score, message, details = {}) {
    this.score = score;      // 0.0 - 1.0
    this.message = message;
    this.details = details;
    this.timestamp = new Date();
  }

  get success() {
    return this.score >= 0.5;
  }

  get grade() {
    if (this.score >= 0.8) return 'A';
    if (this.score >= 0.5) return 'B';
    if (this.score >= 0.3) return 'C';
    return 'F';
  }
}
```

### 7.2 Stage-Specific Critics

```javascript
// Requirements critic
class RequirementsCritic extends BaseCritic {
  evaluate(events, context) {
    const score = this.calculateScore({
      earsCompliance: this.checkEarsFormat(context.requirements),
      completeness: this.checkCompleteness(context.requirements),
      testability: this.checkTestability(context.requirements),
      traceability: this.checkTraceability(context.requirements),
    });
    return new CriticResult(score, this.generateMessage(score));
  }
}

// Design critic
class DesignCritic extends BaseCritic {
  evaluate(events, context) {
    const score = this.calculateScore({
      c4Compliance: this.checkC4Format(context.design),
      adrPresence: this.checkAdrPresence(context.design),
      reqCoverage: this.checkRequirementCoverage(context.design),
    });
    return new CriticResult(score, this.generateMessage(score));
  }
}

// Implementation critic
class ImplementationCritic extends BaseCritic {
  evaluate(events, context) {
    const score = this.calculateScore({
      constitutionCompliance: this.checkConstitution(context.code),
      testCoverage: this.checkTestCoverage(context.code),
      codeQuality: this.checkCodeQuality(context.code),
    });
    return new CriticResult(score, this.generateMessage(score));
  }
}
```

### 7.3 CLI Integration

```bash
# Automatic evaluation on stage completion
musubi-workflow --stage requirements
# Output: ✓ Requirements Stage Complete
#         Score: 0.85 (Grade: A)
#         - EARS Compliance: 95%
#         - Completeness: 80%
#         - Testability: 80%

# Manual evaluation
musubi-validate score --stage design

# Whole-project score
musubi-validate score --all
```

---

## 8. REQ-P0-B006: Automatic GitHub Issue Resolution

### 8.1 Resolver Design

```javascript
/**
 * Automatic issue resolution system
 * Inspired by OpenHands: openhands/resolver/
 */
class IssueResolver {
  constructor(options = {}) {
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN;
    this.llmModel = options.llmModel || 'claude-sonnet-4-20250514';
    this.draftPR = options.draftPR !== false;
  }

  /**
   * Resolve an issue
   * @param {string} issueUrl 
   * @returns {ResolverResult}
   */
  async resolve(issueUrl) {
    // 1. Analyze the issue
    const issue = await this.fetchIssue(issueUrl);
    
    // 2. Extract requirements
    const requirements = await this.extractRequirements(issue);
    
    // 3. Analyze impact
    const impactAnalysis = await this.analyzeImpact(requirements);
    
    // 4. Generate implementation
    const implementation = await this.generateImplementation(requirements, impactAnalysis);
    
    // 5. Add tests
    const tests = await this.generateTests(implementation);
    
    // 6. Create PR
    return await this.createPullRequest(issue, implementation, tests);
  }
}
```

### 8.2 GitHub Actions Workflow

```yaml
# .github/workflows/musubi-resolver.yml
name: MUSUBI Issue Resolver

on:
  issues:
    types: [labeled]
  issue_comment:
    types: [created]

jobs:
  resolve:
    if: |
      github.event.label.name == 'sdd-fix' ||
      contains(github.event.comment.body, '@musubi-agent')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install MUSUBI
        run: npm install -g musubi-sdd
      
      - name: Resolve Issue
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: |
          musubi-resolve --issue ${{ github.event.issue.number }}
      
      - name: Comment on Issue
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🤖 MUSUBI has created a draft PR to address this issue.'
            })
```

### 8.3 CLI

```bash
# Resolve from an issue
musubi-resolve --issue 123
musubi-resolve --issue https://github.com/owner/repo/issues/123

# Options
musubi-resolve --issue 123 --dry-run        # Preview without creating a PR
musubi-resolve --issue 123 --branch fix/123 # Specify the branch name
musubi-resolve --issue 123 --no-draft       # Regular (non-draft) PR
```

---

## 9. REQ-P0-B007: Security Risk Analyzer

### 9.1 Analyzer Design

```javascript
/**
 * Security risk analyzer
 * Inspired by OpenHands: openhands/security/
 */
class SecurityAnalyzer {
  constructor(options = {}) {
    this.confirmationMode = options.confirmationMode || true;
    this.riskThreshold = options.riskThreshold || 'MEDIUM';
  }

  /**
   * Evaluate the risk of an action
   * @param {Action} action 
   * @returns {SecurityRisk}
   */
  analyzeRisk(action) {
    const risks = [];
    
    // Pattern matching
    risks.push(...this.checkSecretPatterns(action));
    risks.push(...this.checkDangerousCommands(action));
    risks.push(...this.checkVulnerabilityPatterns(action));
    
    return this.aggregateRisks(risks);
  }
}
```

### 9.2 Detection Patterns

```javascript
const SECURITY_PATTERNS = {
  secrets: [
    /(?:api[_-]?key|apikey)\s*[:=]\s*["']?[\w-]{20,}/i,
    /(?:password|passwd|pwd)\s*[:=]\s*["']?[^\s"']{8,}/i,
    /(?:secret|token)\s*[:=]\s*["']?[\w-]{20,}/i,
    /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/,
    /ghp_[a-zA-Z0-9]{36}/,  // GitHub Personal Access Token
    /sk-[a-zA-Z0-9]{48}/,   // OpenAI API Key
  ],
  dangerousCommands: [
    /rm\s+(-rf?|--recursive)\s+[\/~]/,
    /sudo\s+/,
    /chmod\s+777/,
    />\s*\/dev\/sd[a-z]/,
    /mkfs\./,
    /dd\s+if=/,
  ],
  vulnerabilities: [
    /eval\s*\(/,
    /exec\s*\(/,
    /\$\{.*\}/,  // Template injection
    /innerHTML\s*=/,
    /document\.write\(/,
  ],
};
```

### 9.3 Risk Levels and Responses

| Level | Condition | Action |
|--------|------|-----------|
| LOW | Minor style issue | Log only |
| MEDIUM | Potential risk | Show warning + continue |
| HIGH | Serious security risk | Confirmation required |
| CRITICAL | Immediately dangerous | Automatically blocked |

### 9.4 Configuration (project.yml)

```yaml
security:
  confirmation_mode: true
  risk_threshold: MEDIUM
  allowed_commands:
    - npm install
    - npm run test
  blocked_patterns:
    - "rm -rf /"
  ignore_paths:
    - "test/"
    - "*.test.js"
```

---

## 10. REQ-P0-B008: Agent Memory

### 10.1 Memory Manager Design

```javascript
/**
 * Agent memory management
 * Inspired by OpenHands: skills/agent_memory.md
 */
class AgentMemoryManager {
  constructor(options = {}) {
    this.memoriesDir = options.memoriesDir || 'steering/memories';
    this.autoSave = options.autoSave || false;
  }

  /**
   * Extract learnings from a session
   * @param {Event[]} sessionEvents 
   * @returns {LearningItem[]}
   */
  extractLearnings(sessionEvents) {
    return [
      ...this.extractStructureKnowledge(sessionEvents),
      ...this.extractCommandPatterns(sessionEvents),
      ...this.extractBestPractices(sessionEvents),
      ...this.extractErrorSolutions(sessionEvents),
    ];
  }

  /**
   * Save learnings
   * @param {LearningItem[]} items 
   * @param {boolean} confirmed Whether the user has confirmed
   */
  async saveLearnings(items, confirmed = false) {
    if (!confirmed && !this.autoSave) {
      return { status: 'pending', items };
    }
    
    // Merge with existing memories
    const existing = await this.loadMemories();
    const merged = this.mergeMemories(existing, items);
    
    // Save to file
    await this.writeMemories(merged);
    
    return { status: 'saved', items: merged };
  }
}
```

### 10.2 Learning Item Categories

```typescript
interface LearningItem {
  id: string;
  category: 'structure' | 'commands' | 'practices' | 'errors';
  title: string;
  content: string;
  confidence: number;  // 0.0 - 1.0
  source: string;      // Which event it was extracted from
  timestamp: Date;
}

// Example
const learningItems = [
  {
    id: 'learn-001',
    category: 'commands',
    title: 'Test run command',
    content: 'Run unit tests with `npm run test:unit`',
    confidence: 0.95,
    source: 'session-2025-12-07-001',
    timestamp: new Date(),
  },
  {
    id: 'learn-002',
    category: 'practices',
    title: 'Commit message convention',
    content: 'Use the Conventional Commits format: feat:, fix:, docs:, etc.',
    confidence: 0.85,
    source: 'session-2025-12-07-001',
    timestamp: new Date(),
  },
];
```

### 10.3 Command Integration

```bash
# Extract and review learnings from a session
# Claude Code: /sdd-remember
# GitHub Copilot: #sdd-remember

# CLI
musubi-remember              # Review and save learnings interactively
musubi-remember --auto       # Auto-save mode
musubi-remember --list       # Show saved learnings
musubi-remember --export     # Export as JSON
```

---

## 11. Implementation Plan

### 11.1 Phase 1 (Week 1-2)

| Task | File | Owner |
|--------|----------|------|
| Stuck detection system | `src/analyzers/stuck-detector.js` | - |
| Keyword triggers | `src/managers/skills-loader.js` | - |
| Repository skills | `src/managers/skills-loader.js` | - |

### 11.2 Phase 2 (Week 3-4)

| Task | File | Owner |
|--------|----------|------|
| Memory condenser | `src/managers/memory-condenser.js` | - |
| Critic system | `src/validators/critic-system.js` | - |
| Agent memory | `src/managers/agent-memory.js` | - |

### 11.3 Phase 3 (Week 5-6)

| Task | File | Owner |
|--------|----------|------|
| Automatic issue resolution | `src/resolvers/issue-resolver.js` | - |
| Security analyzer | `src/analyzers/security-analyzer.js` | - |
| GitHub Actions workflow | `.github/workflows/musubi-resolver.yml` | - |
| Tests & documentation | `tests/`, `docs/` | - |

---

## 12. Test Plan

### 12.1 Unit Tests

| Target | Test File | Coverage Target |
|------|---------------|---------------|
| StuckDetector | `tests/analyzers/stuck-detector.test.js` | 90% |
| SkillsLoader | `tests/managers/skills-loader.test.js` | 85% |
| MemoryCondenser | `tests/managers/memory-condenser.test.js` | 85% |
| CriticSystem | `tests/validators/critic-system.test.js` | 90% |
| SecurityAnalyzer | `tests/analyzers/security-analyzer.test.js` | 95% |
| IssueResolver | `tests/resolvers/issue-resolver.test.js` | 80% |
| AgentMemory | `tests/managers/agent-memory.test.js` | 85% |

### 12.2 Integration Tests

```bash
# Integration tests for all OpenHands features
npm run test:integration:openhands

# E2E tests (verified against a real project)
npm run test:e2e:openhands
```

---

## 13. Traceability

| Requirement ID | Design Section | Implementation File | Test ID |
|--------|---------------|-------------|----------|
| REQ-P0-B001 | 3. Stuck detection | `stuck-detector.js` | TST-P0-B001 |
| REQ-P0-B002 | 4. Keyword triggers | `skills-loader.js` | TST-P0-B002 |
| REQ-P0-B003 | 5. Repository skills | `skills-loader.js` | TST-P0-B003 |
| REQ-P0-B004 | 6. Memory condenser | `memory-condenser.js` | TST-P0-B004 |
| REQ-P0-B005 | 7. Critic | `critic-system.js` | TST-P0-B005 |
| REQ-P0-B006 | 8. Issue resolution | `issue-resolver.js` | TST-P0-B006 |
| REQ-P0-B007 | 9. Security | `security-analyzer.js` | TST-P0-B007 |
| REQ-P0-B008 | 10. Agent memory | `agent-memory.js` | TST-P0-B008 |

---

## 14. Document History

| Version | Date | Author | Changes |
|-----------|------|--------|----------|
| 1.0 | 2025-12-07 | MUSUBI team | Initial version |

---

*— End of Document —*
