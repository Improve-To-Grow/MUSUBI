> 🇬🇧 English version: [REQ-P0-B-openhands-features-design.en.md](./REQ-P0-B-openhands-features-design.en.md)

# REQ-P0-B: OpenHands由来機能 - 統合設計ドキュメント

| 項目 | 内容 |
|------|------|
| **文書ID** | DESIGN-P0-B-001 |
| **バージョン** | 1.0 |
| **作成日** | 2025-12-07 |
| **関連ADR** | ADR-P0-B001 〜 ADR-P0-B008 |
| **対象バージョン** | MUSUBI v2.2.0 |
| **出典** | OpenHands (https://github.com/OpenHands/OpenHands) |

---

## 1. 概要

### 1.1 目的

本ドキュメントは、OpenHandsから導入する8つのコア機能の技術設計を定義します。これらの機能はMUSUBIのエージェント品質とユーザー体験を大幅に向上させます。

### 1.2 対象要件

| 要件ID | 機能名 | 優先度 |
|--------|--------|--------|
| REQ-P0-B001 | スタック検出システム | 最高 |
| REQ-P0-B002 | キーワードトリガー型スキル | 最高 |
| REQ-P0-B003 | リポジトリ固有スキル | 最高 |
| REQ-P0-B004 | メモリコンデンサー | 高 |
| REQ-P0-B005 | クリティック（評価）システム | 高 |
| REQ-P0-B006 | GitHub Issue自動解決 | 中 |
| REQ-P0-B007 | セキュリティリスクアナライザー | 中 |
| REQ-P0-B008 | エージェントメモリ | 中 |

---

## 2. システムアーキテクチャ

### 2.1 C4 Context図

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MUSUBI SDD System                             │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   User      │  │  AI Agent   │  │   GitHub    │  │  LLM API    │ │
│  │ (Developer) │  │(Claude etc.)│  │    API      │  │ (OpenAI等)  │ │
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

### 2.2 ディレクトリ構造

```
musubi/
├── src/
│   ├── agents/
│   │   └── registry.js           # 既存
│   ├── analyzers/
│   │   ├── stuck-detector.js     # NEW: REQ-P0-B001
│   │   └── security-analyzer.js  # NEW: REQ-P0-B007
│   ├── generators/
│   │   └── ... (既存)
│   ├── managers/
│   │   ├── skills-loader.js      # NEW: REQ-P0-B002, REQ-P0-B003
│   │   ├── memory-condenser.js   # NEW: REQ-P0-B004
│   │   └── agent-memory.js       # NEW: REQ-P0-B008
│   ├── validators/
│   │   ├── critic-system.js      # NEW: REQ-P0-B005
│   │   └── ... (既存)
│   └── resolvers/
│       └── issue-resolver.js     # NEW: REQ-P0-B006
├── steering/
│   └── memories/
│       ├── quality_report.md     # Critic出力
│       ├── session_learnings.md  # AgentMemory出力
│       └── stuck_history.md      # StuckDetector履歴
└── .musubi/
    └── skills/                   # リポジトリ固有スキル
        └── repo.md
```

---

## 3. REQ-P0-B001: スタック検出システム

### 3.1 クラス設計

```javascript
/**
 * スタック検出システム
 * OpenHands: openhands/controller/stuck.py から着想
 */
class StuckDetector {
  constructor(options = {}) {
    this.maxRepeatActions = options.maxRepeatActions || 4;
    this.maxRepeatErrors = options.maxRepeatErrors || 3;
    this.history = [];
    this.stuckAnalysis = null;
  }

  /**
   * イベントを履歴に追加
   * @param {StuckEvent} event 
   */
  addEvent(event) {}

  /**
   * スタック状態を検出
   * @returns {StuckAnalysis|null}
   */
  detect() {}

  /**
   * 代替アプローチを提案
   * @returns {string[]}
   */
  suggestAlternatives() {}
}
```

### 3.2 検出シナリオ

| シナリオ | 検出条件 | 介入アクション |
|----------|----------|---------------|
| 同一アクション繰り返し | 4回連続で同じアクション+結果 | 警告 + 代替提案 |
| エラーループ | 3回連続で同じエラー | 強制中断 + 原因分析 |
| モノローグ | 10ステップ以上の出力なし思考 | 進捗確認プロンプト |
| コンテキスト超過 | トークン制限エラー3回 | メモリ圧縮トリガー |
| ステージ往復 | 同一ステージ間を3回往復 | ステージ固定提案 |

### 3.3 データモデル

```typescript
interface StuckEvent {
  id: string;
  timestamp: Date;
  type: 'action' | 'observation' | 'error';
  stage: 'requirements' | 'design' | 'implement' | 'test';
  content: string;
  hash: string;  // 内容のハッシュ（比較用）
}

interface StuckAnalysis {
  loopType: 'repeating_action' | 'error_loop' | 'monologue' | 'context_overflow' | 'stage_oscillation';
  loopRepeatTimes: number;
  loopStartIndex: number;
  suggestedActions: string[];
  severity: 'warning' | 'critical';
}
```

### 3.4 CLI統合

```bash
# ワークフロー実行時に自動検出
musubi-workflow --detect-stuck

# スタック履歴の確認
musubi-workflow --stuck-history

# スタック時の自動介入設定
musubi-workflow --stuck-action=warn|pause|abort
```

---

## 4. REQ-P0-B002: キーワードトリガー型スキル

### 4.1 スキル定義形式

```yaml
# steering/skills/testing.md のfrontmatter
---
name: testing-skill
type: knowledge
version: 1.0.0
triggers:
  - test
  - unit test
  - テスト
  - 単体テスト
  - /\btest(ing)?\b/i   # 正規表現サポート
agent: all
priority: 10  # 高い値が優先
---

# スキル内容（Markdown）
## テスト作成ガイドライン

- Jest/Vitestを使用
- カバレッジ80%以上を目標
- ...
```

### 4.2 スキルローダー設計

```javascript
/**
 * スキルローダー
 * OpenHands: openhands/microagent/microagent.py から着想
 */
class SkillsLoader {
  constructor(options = {}) {
    this.globalSkillsDir = options.globalDir || path.join(__dirname, '../skills');
    this.repoSkillsDir = options.repoDir || '.musubi/skills';
    this.userSkillsDir = options.userDir || path.join(os.homedir(), '.musubi/skills');
    this.loadedSkills = new Map();
  }

  /**
   * 全スキルをロード
   * 優先順位: リポジトリ > ユーザー > グローバル
   */
  async loadAll() {}

  /**
   * キーワードに基づいてスキルを活性化
   * @param {string} message ユーザーメッセージ
   * @returns {Skill[]} 活性化されたスキル
   */
  activateByKeywords(message) {}

  /**
   * スキルをパース
   * @param {string} filePath 
   * @returns {Skill}
   */
  parseSkill(filePath) {}
}
```

### 4.3 トリガーマッチングアルゴリズム

```javascript
function matchTriggers(message, triggers) {
  const normalizedMessage = message.toLowerCase();
  
  return triggers.filter(trigger => {
    // 正規表現の場合
    if (trigger.startsWith('/') && trigger.endsWith('/')) {
      const regex = new RegExp(trigger.slice(1, -1), 'i');
      return regex.test(message);
    }
    
    // 通常のキーワード
    return normalizedMessage.includes(trigger.toLowerCase());
  });
}
```

---

## 5. REQ-P0-B003: リポジトリ固有スキル

### 5.1 ディレクトリ構造

```
project-root/
├── .musubi/
│   ├── config.yml              # MUSUBI設定
│   └── skills/
│       ├── repo.md             # リポジトリ概要（必須、自動生成）
│       ├── testing.md          # テスト規約
│       ├── deployment.md       # デプロイ手順
│       └── coding-style.md     # コーディング規約
└── steering/
    └── ...
```

### 5.2 repo.md 自動生成

```javascript
/**
 * リポジトリ情報からrepo.mdを自動生成
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

### 5.3 musubi-onboard との統合

```bash
# onboard実行時に.musubi/skills/repo.md を自動生成
musubi-onboard

# 出力:
# ✓ Analyzed project structure
# ✓ Detected: Node.js + TypeScript + Jest
# ✓ Created .musubi/skills/repo.md
# ✓ Updated steering/product.md
```

---

## 6. REQ-P0-B004: メモリコンデンサー

### 6.1 コンデンサー戦略

```javascript
/**
 * メモリコンデンサー
 * OpenHands: openhands/memory/condenser/condenser.py から着想
 */
class MemoryCondenser {
  constructor(options = {}) {
    this.type = options.type || 'llm';  // 'llm' | 'recent' | 'noop'
    this.maxSize = options.maxSize || 100;
    this.keepFirst = options.keepFirst || 2;
    this.summaryModel = options.summaryModel || 'gpt-4o-mini';
  }

  /**
   * イベント履歴を圧縮
   * @param {Event[]} events 
   * @returns {CondensedView}
   */
  async condense(events) {}

  /**
   * LLMを使用して要約を生成
   * @param {Event[]} chunk 
   * @returns {string}
   */
  async summarizeChunk(chunk) {}
}
```

### 6.2 圧縮アルゴリズム

```
1. 最初のN個のイベントは常に保持 (keepFirst)
2. 残りのイベントをユーザーメッセージ間でチャンク化
3. 古いチャンクから順にLLMで要約
4. 要約をSummaryEventとして履歴に挿入
5. maxSize以下になるまで繰り返し
```

### 6.3 設定 (project.yml)

```yaml
condenser:
  type: llm              # llm | recent | noop
  max_size: 100          # 最大イベント数
  keep_first: 2          # 常に保持する最初のイベント数
  summary_model: gpt-4o-mini  # 要約用LLM
  preserve_patterns:     # 常に保持するパターン
    - "DECISION:"
    - "ARCHITECTURE:"
    - "REQ-"
```

---

## 7. REQ-P0-B005: クリティック（評価）システム

### 7.1 クリティック基底クラス

```javascript
/**
 * 評価システム基底クラス
 * OpenHands: openhands/critic/base.py から着想
 */
class BaseCritic {
  /**
   * イベントリストを評価
   * @param {Event[]} events 
   * @param {Object} context 追加コンテキスト
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

### 7.2 ステージ別クリティック

```javascript
// 要件クリティック
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

// 設計クリティック
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

// 実装クリティック
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

### 7.3 CLI統合

```bash
# ステージ完了時に自動評価
musubi-workflow --stage requirements
# Output: ✓ Requirements Stage Complete
#         Score: 0.85 (Grade: A)
#         - EARS Compliance: 95%
#         - Completeness: 80%
#         - Testability: 80%

# 手動評価
musubi-validate score --stage design

# プロジェクト全体スコア
musubi-validate score --all
```

---

## 8. REQ-P0-B006: GitHub Issue自動解決

### 8.1 リゾルバー設計

```javascript
/**
 * Issue自動解決システム
 * OpenHands: openhands/resolver/ から着想
 */
class IssueResolver {
  constructor(options = {}) {
    this.githubToken = options.githubToken || process.env.GITHUB_TOKEN;
    this.llmModel = options.llmModel || 'claude-sonnet-4-20250514';
    this.draftPR = options.draftPR !== false;
  }

  /**
   * Issueを解決
   * @param {string} issueUrl 
   * @returns {ResolverResult}
   */
  async resolve(issueUrl) {
    // 1. Issue分析
    const issue = await this.fetchIssue(issueUrl);
    
    // 2. 要件抽出
    const requirements = await this.extractRequirements(issue);
    
    // 3. 影響範囲分析
    const impactAnalysis = await this.analyzeImpact(requirements);
    
    // 4. 実装生成
    const implementation = await this.generateImplementation(requirements, impactAnalysis);
    
    // 5. テスト追加
    const tests = await this.generateTests(implementation);
    
    // 6. PR作成
    return await this.createPullRequest(issue, implementation, tests);
  }
}
```

### 8.2 GitHub Actionsワークフロー

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
# Issueから解決
musubi-resolve --issue 123
musubi-resolve --issue https://github.com/owner/repo/issues/123

# オプション
musubi-resolve --issue 123 --dry-run        # PRを作成せずにプレビュー
musubi-resolve --issue 123 --branch fix/123 # ブランチ名を指定
musubi-resolve --issue 123 --no-draft       # Draftでない通常のPR
```

---

## 9. REQ-P0-B007: セキュリティリスクアナライザー

### 9.1 アナライザー設計

```javascript
/**
 * セキュリティリスクアナライザー
 * OpenHands: openhands/security/ から着想
 */
class SecurityAnalyzer {
  constructor(options = {}) {
    this.confirmationMode = options.confirmationMode || true;
    this.riskThreshold = options.riskThreshold || 'MEDIUM';
  }

  /**
   * アクションのリスクを評価
   * @param {Action} action 
   * @returns {SecurityRisk}
   */
  analyzeRisk(action) {
    const risks = [];
    
    // パターンマッチング
    risks.push(...this.checkSecretPatterns(action));
    risks.push(...this.checkDangerousCommands(action));
    risks.push(...this.checkVulnerabilityPatterns(action));
    
    return this.aggregateRisks(risks);
  }
}
```

### 9.2 検出パターン

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

### 9.3 リスクレベルと対応

| レベル | 条件 | アクション |
|--------|------|-----------|
| LOW | 軽微なスタイル問題 | ログ記録のみ |
| MEDIUM | 潜在的リスク | 警告表示 + 続行 |
| HIGH | 重大なセキュリティリスク | 確認必須 |
| CRITICAL | 即座に危険 | 自動ブロック |

### 9.4 設定 (project.yml)

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

## 10. REQ-P0-B008: エージェントメモリ

### 10.1 メモリマネージャー設計

```javascript
/**
 * エージェントメモリ管理
 * OpenHands: skills/agent_memory.md から着想
 */
class AgentMemoryManager {
  constructor(options = {}) {
    this.memoriesDir = options.memoriesDir || 'steering/memories';
    this.autoSave = options.autoSave || false;
  }

  /**
   * セッションから学習事項を抽出
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
   * 学習事項を保存
   * @param {LearningItem[]} items 
   * @param {boolean} confirmed ユーザー確認済みか
   */
  async saveLearnings(items, confirmed = false) {
    if (!confirmed && !this.autoSave) {
      return { status: 'pending', items };
    }
    
    // 既存メモリとマージ
    const existing = await this.loadMemories();
    const merged = this.mergeMemories(existing, items);
    
    // ファイルに保存
    await this.writeMemories(merged);
    
    return { status: 'saved', items: merged };
  }
}
```

### 10.2 学習項目カテゴリ

```typescript
interface LearningItem {
  id: string;
  category: 'structure' | 'commands' | 'practices' | 'errors';
  title: string;
  content: string;
  confidence: number;  // 0.0 - 1.0
  source: string;      // どのイベントから抽出されたか
  timestamp: Date;
}

// 例
const learningItems = [
  {
    id: 'learn-001',
    category: 'commands',
    title: 'テスト実行コマンド',
    content: '`npm run test:unit` でユニットテストを実行',
    confidence: 0.95,
    source: 'session-2025-12-07-001',
    timestamp: new Date(),
  },
  {
    id: 'learn-002',
    category: 'practices',
    title: 'コミットメッセージ規約',
    content: 'Conventional Commits形式を使用: feat:, fix:, docs: など',
    confidence: 0.85,
    source: 'session-2025-12-07-001',
    timestamp: new Date(),
  },
];
```

### 10.3 コマンド統合

```bash
# セッションから学習事項を抽出・確認
# Claude Code: /sdd-remember
# GitHub Copilot: #sdd-remember

# CLI
musubi-remember              # 対話的に学習事項を確認・保存
musubi-remember --auto       # 自動保存モード
musubi-remember --list       # 保存済み学習事項を表示
musubi-remember --export     # JSON形式でエクスポート
```

---

## 11. 実装計画

### 11.1 フェーズ1（Week 1-2）

| タスク | ファイル | 担当 |
|--------|----------|------|
| スタック検出システム | `src/analyzers/stuck-detector.js` | - |
| キーワードトリガー | `src/managers/skills-loader.js` | - |
| リポジトリスキル | `src/managers/skills-loader.js` | - |

### 11.2 フェーズ2（Week 3-4）

| タスク | ファイル | 担当 |
|--------|----------|------|
| メモリコンデンサー | `src/managers/memory-condenser.js` | - |
| クリティックシステム | `src/validators/critic-system.js` | - |
| エージェントメモリ | `src/managers/agent-memory.js` | - |

### 11.3 フェーズ3（Week 5-6）

| タスク | ファイル | 担当 |
|--------|----------|------|
| Issue自動解決 | `src/resolvers/issue-resolver.js` | - |
| セキュリティアナライザー | `src/analyzers/security-analyzer.js` | - |
| GitHub Actionsワークフロー | `.github/workflows/musubi-resolver.yml` | - |
| テスト・ドキュメント | `tests/`, `docs/` | - |

---

## 12. テスト計画

### 12.1 単体テスト

| 対象 | テストファイル | カバレッジ目標 |
|------|---------------|---------------|
| StuckDetector | `tests/analyzers/stuck-detector.test.js` | 90% |
| SkillsLoader | `tests/managers/skills-loader.test.js` | 85% |
| MemoryCondenser | `tests/managers/memory-condenser.test.js` | 85% |
| CriticSystem | `tests/validators/critic-system.test.js` | 90% |
| SecurityAnalyzer | `tests/analyzers/security-analyzer.test.js` | 95% |
| IssueResolver | `tests/resolvers/issue-resolver.test.js` | 80% |
| AgentMemory | `tests/managers/agent-memory.test.js` | 85% |

### 12.2 統合テスト

```bash
# 全OpenHands機能の統合テスト
npm run test:integration:openhands

# E2Eテスト（実際のプロジェクトで検証）
npm run test:e2e:openhands
```

---

## 13. トレーサビリティ

| 要件ID | 設計セクション | 実装ファイル | テストID |
|--------|---------------|-------------|----------|
| REQ-P0-B001 | 3. スタック検出 | `stuck-detector.js` | TST-P0-B001 |
| REQ-P0-B002 | 4. キーワードトリガー | `skills-loader.js` | TST-P0-B002 |
| REQ-P0-B003 | 5. リポジトリスキル | `skills-loader.js` | TST-P0-B003 |
| REQ-P0-B004 | 6. メモリコンデンサー | `memory-condenser.js` | TST-P0-B004 |
| REQ-P0-B005 | 7. クリティック | `critic-system.js` | TST-P0-B005 |
| REQ-P0-B006 | 8. Issue解決 | `issue-resolver.js` | TST-P0-B006 |
| REQ-P0-B007 | 9. セキュリティ | `security-analyzer.js` | TST-P0-B007 |
| REQ-P0-B008 | 10. エージェントメモリ | `agent-memory.js` | TST-P0-B008 |

---

## 14. 文書履歴

| バージョン | 日付 | 作成者 | 変更内容 |
|-----------|------|--------|----------|
| 1.0 | 2025-12-07 | MUSUBIチーム | 初版作成 |

---

*― 文書終了 ―*
