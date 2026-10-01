# FAQ & Troubleshooting Guide

よくある質問とトラブルシューティングガイド

Frequently asked questions and troubleshooting guide

---

## 📋 Table of Contents

1. [Frequently Asked Questions](#frequently-asked-questions)
2. [Installation Issues](#installation-issues)
3. [Validation Errors](#validation-errors)
4. [Orchestration Problems](#orchestration-problems)
5. [Platform-Specific Issues](#platform-specific-issues)
6. [CI/CD Issues](#cicd-issues)
7. [Performance Optimization](#performance-optimization)
8. [Migration Guide](#migration-guide)

---

## Frequently Asked Questions

### General

#### Q: MUSUBIとは何ですか？ (What is MUSUBI?)

**A:** MUSUBI (結び) は、仕様駆動開発 (SDD) フレームワークです。コードを書く前に仕様を定義し、その仕様から設計、実装、テストを自動生成・管理します。

*EN:* MUSUBI (結び, "connection") is a Specification Driven Development (SDD) framework. You define specifications before writing code, and design, implementation, and tests are generated and managed from those specifications.

#### Q: 既存プロジェクトでも使えますか？ (Can I use it with existing projects?)

**A:** はい。`musubi init --mode brownfield` でDelta仕様を使用し、段階的に導入できます。

*EN:* Yes. With `musubi init --mode brownfield` you can use Delta specs and adopt MUSUBI incrementally.

```bash
# 既存プロジェクトへの導入 / Adopting in an existing project
cd existing-project
npx musubi-sdd init --mode brownfield
```

#### Q: どのAIコーディングアシスタントと互換性がありますか？ (Which AI coding assistants is it compatible with?)

**A:** 13以上のプラットフォームに対応しています： (Supports 13+ platforms:)

| プラットフォーム (Platform) | サポート状況 (Support status) |
|---------------|------------|
| Claude Code | ✅ Primary |
| GitHub Copilot | ✅ Full |
| Cursor | ✅ Full |
| Windsurf | ✅ Full |
| Gemini CLI | ✅ Full |
| Codex CLI | ✅ Full |
| Aider | ✅ Basic |
| Continue | ✅ Basic |
| その他 (Others) | ✅ Universal via AGENTS.md |

#### Q: 無料で使えますか？ (Is it free to use?)

**A:** はい。MUSUBIはMITライセンスで完全無料・オープンソースです。

*EN:* Yes. MUSUBI is completely free and open source under the MIT License.

---

### Concepts

#### Q: EARS形式とは何ですか？ (What is the EARS format?)

**A:** EARS (Easy Approach to Requirements Syntax) は、要件を標準的なパターンで記述する方法です：

*EN:* EARS (Easy Approach to Requirements Syntax) is a method for writing requirements using standard patterns:

| タイプ (Type) | パターン (Pattern) | 例 (Example) |
|-------|---------|-----|
| Ubiquitous | The system shall... | The system shall encrypt passwords |
| Event-Driven | When X, the system shall... | When login fails, the system shall log |
| State-Driven | While X, the system shall... | While offline, the system shall queue |
| Optional | Where X, the system shall... | Where enabled, the system shall show |

#### Q: 9条とは何ですか？ (What are the 9 Articles?)

**A:** MUSUBI Constitutionの9つの不変ルールです： (The 9 immutable rules of the MUSUBI Constitution:)

1. 仕様優先 / Specification first
2. 憲法優位 / Constitutional supremacy
3. EARS準拠 / EARS compliance
4. トレーサビリティ / Traceability
5. 変更追跡 / Change tracking
6. 品質ゲート / Quality gates
7. ドキュメント / Documentation
8. テスト / Testing
9. 継続的改善 / Continuous improvement

#### Q: P-Labelとは何ですか？ (What is a P-Label?)

**A:** タスクの優先度を示すラベルです： (A label indicating task priority:)

- **P0**: クリティカル（すべてをブロック） / Critical (blocks everything)
- **P1**: 高優先度（すぐに実行） / High priority (execute immediately)
- **P2**: 中優先度（通常） / Medium priority (normal)
- **P3**: 低優先度（バックグラウンド/オプション） / Low priority (background/optional)

---

## Installation Issues

### Issue: npm install fails

**症状 (Symptom):**
```
npm ERR! code EACCES
npm ERR! syscall mkdir
```

**解決策 (Solution):**
```bash
# 方法1: npxを使用 / Option 1: Use npx
npx musubi-sdd init

# 方法2: ユーザーディレクトリにインストール / Option 2: Install into a user directory
npm install -g musubi-sdd --prefix ~/.npm-global

# 方法3: sudoを使用（推奨しない） / Option 3: Use sudo (not recommended)
sudo npm install -g musubi-sdd
```

### Issue: Node.js version error

**症状 (Symptom):**
```
Error: musubi-sdd requires Node.js >= 18.0.0
```

**解決策 (Solution):**
```bash
# nvmでバージョン管理 / Manage versions with nvm
nvm install 20
nvm use 20

# または直接インストール / Or install directly
# https://nodejs.org/ から LTS をダウンロード / Download the LTS from https://nodejs.org/
```

### Issue: Command not found

**症状 (Symptom):**
```bash
$ musubi-sdd
bash: musubi-sdd: command not found
```

**解決策 (Solution):**
```bash
# PATHを確認 / Check PATH
echo $PATH

# npm global binディレクトリを追加 / Add the npm global bin directory
export PATH="$PATH:$(npm config get prefix)/bin"

# または npx を使用 / Or use npx
npx musubi-sdd --help
```

---

## Validation Errors

### Issue: EARS validation failed

**症状 (Symptom):**
```
EARS Validation Error: Requirement does not match EARS pattern
Line 15: "Users can login with email"
```

**解決策 (Solution):**

```markdown
# ❌ 間違った形式 (Incorrect format)
Users can login with email

# ✅ 正しい形式（Event-Driven） (Correct format, Event-Driven)
When a user submits login credentials, the system shall authenticate using email and password.
```

**有効なEARSパターン (Valid EARS patterns):**
- `The system shall...`
- `When <trigger>, the system shall...`
- `While <state>, the system shall...`
- `Where <condition>, the system shall...`

### Issue: Constitution violation

**症状 (Symptom):**
```
Constitutional Violation: Article 4 - Missing traceability
Files without requirement links: src/auth.js, src/user.js
```

**解決策 (Solution):**
```javascript
// ❌ リンクなし / No link
function authenticate(user, password) {
  // ...
}

// ✅ 要件リンクあり / With requirement link
/**
 * Authenticates user credentials
 * @requirement REQ-AUTH-001
 */
function authenticate(user, password) {
  // REQ-AUTH-001: User authentication
  // ...
}
```

### Issue: Traceability gap

**症状 (Symptom):**
```
Traceability Gap: 5 requirements without implementation
- REQ-AUTH-003
- REQ-USER-001
- REQ-USER-002
```

**解決策 (Solution):**
```bash
# 詳細を確認 / Check details
npx musubi-gaps --verbose

# 出力例: / Example output:
# REQ-AUTH-003: Not implemented
#   Expected in: src/auth/mfa.js
#   Action: Implement MFA functionality

# 実装後に再検証 / Re-validate after implementation
npx musubi-trace
```

### Issue: Delta spec validation failed

**症状 (Symptom):**
```
Delta Specification Error: Missing impact analysis
Change: auth-v2.md
```

**解決策 (Solution):**
```markdown
# storage/changes/auth-v2.md

## Change Request

### Summary
Add OAuth2 support

### Impact Analysis  <!-- 必須セクション / Required section -->
- Affected Files: src/auth/*, tests/auth/*
- Risk Level: Medium
- Dependencies: oauth2-client library

### Requirements Changed
- REQ-AUTH-001: Modified
- REQ-AUTH-010: New

### Rollback Plan  <!-- 推奨 / Recommended -->
Revert commit abc123
```

---

## Orchestration Problems

### Issue: Skill not found

**症状 (Symptom):**
```
Error: Skill 'my-custom-skill' not found in registry
```

**解決策 (Solution):**
```javascript
const { SkillRegistry } = require('musubi-sdd');

// スキルを登録 / Register the skill
const registry = new SkillRegistry();
registry.registerSkill({
  id: 'my-custom-skill',
  name: 'My Custom Skill',
  category: 'custom',
  handler: async (input) => {
    return { success: true, result: 'done' };
  }
});

// 登録済みスキルを確認 / List registered skills
console.log(registry.listSkills());
```

### Issue: Parallel execution timeout

**症状 (Symptom):**
```
Error: Parallel execution timed out after 30000ms
```

**解決策 (Solution):**
```javascript
// タイムアウトを延長 / Extend the timeout
const engine = new OrchestrationEngine({
  timeout: 120000, // 2分 / 2 minutes
  retryAttempts: 3
});

// または個別に設定 / Or configure individually
await engine.executePattern('parallel', {
  skills: ['skill-a', 'skill-b'],
  options: {
    timeout: 60000,
    failFast: false
  }
});
```

### Issue: Handoff context lost

**症状 (Symptom):**
```
Warning: Handoff context incomplete
Missing: previous_analysis, requirements
```

**解決策 (Solution):**
```javascript
// ハンドオフ時にコンテキストを明示的に渡す / Explicitly pass context during handoff
await engine.executePattern('handoff', {
  from: 'requirements-analyst',
  to: 'system-architect',
  context: {
    previous_analysis: analysisResult,
    requirements: reqList,
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'requirements-phase'
    }
  }
});
```

---

## Platform-Specific Issues

### Claude Code

#### Issue: /sdd commands not recognized

**症状 (Symptom):**
```
Unknown command: /sdd-requirements
```

**解決策 (Solution):**
1. `CLAUDE.md` が存在することを確認 / Verify that `CLAUDE.md` exists
2. セッションを再起動 / Restart the session
3. 適切な接頭辞を使用: / Use the correct prefix:
```
# Claude Code uses slash commands
/sdd-requirements feature-name
```

### GitHub Copilot

#### Issue: #sdd prompts not working

**症状 (Symptom):**
Agent doesn't recognize #sdd commands

**解決策 (Solution):**
1. `AGENTS.md` がルートに存在することを確認 / Verify that `AGENTS.md` exists at the repository root
2. Copilot Chat を使用（コード補完ではなく） / Use Copilot Chat (not code completion)
3. 正しい構文: / Correct syntax:
```
#sdd-requirements Create user authentication
```

### Cursor

#### Issue: Rules not applied

**症状 (Symptom):**
Cursor ignores MUSUBI rules

**解決策 (Solution):**
1. `.cursor/rules` ディレクトリを確認 / Check the `.cursor/rules` directory
2. ルールファイルの形式を確認: / Check the rule file format:
```markdown
# .cursor/rules/musubi.md

## MUSUBI Rules

Always follow EARS format for requirements.
Check constitution compliance before code changes.
```

### Windsurf

#### Issue: Custom rules not loaded

**解決策 (Solution):**
```bash
# Windsurf設定を再生成 / Regenerate Windsurf configuration
npx musubi-sdd init --platform windsurf --force
```

---

## CI/CD Issues

### GitHub Actions

#### Issue: Action fails with "No specs found"

**症状 (Symptom):**
```
Error: No specification files found in storage/specs/
```

**解決策 (Solution):**
```yaml
# .github/workflows/musubi.yml
jobs:
  validate:
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 全履歴を取得 / Fetch full history
      
      - name: Check specs exist
        run: |
          if [ ! -d "storage/specs" ]; then
            mkdir -p storage/specs
            echo "# Placeholder" > storage/specs/.gitkeep
          fi
```

#### Issue: Traceability report not generated

**解決策 (Solution):**
```yaml
- name: Generate Traceability
  run: npx musubi-trace --output reports/traceability.md
  
- name: Upload Report
  uses: actions/upload-artifact@v4
  with:
    name: traceability-report
    path: reports/traceability.md
```

### GitLab CI

#### Issue: Cache not working

**解決策 (Solution):**
```yaml
# .gitlab-ci.yml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/
  policy: pull-push
```

---

## Performance Optimization

### Issue: Validation is slow

**症状 (Symptom):**
```
Validation took 45s (expected < 10s)
```

**解決策 (Solution):**
```bash
# 特定のファイルのみ検証 / Validate specific files only
npx musubi-validate ears --file storage/specs/auth.md

# 並列検証を有効化 / Enable parallel validation
npx musubi-validate all --parallel

# キャッシュを使用 / Use the cache
npx musubi-validate all --cache
```

### Issue: Large project performance

**大規模プロジェクト向け設定 (Configuration for large projects):**
```javascript
// musubi.config.js
module.exports = {
  validation: {
    parallel: true,
    workers: 4,
    cache: {
      enabled: true,
      ttl: 3600 // 1時間 / 1 hour
    }
  },
  traceability: {
    incremental: true,
    excludePatterns: [
      'node_modules/**',
      'dist/**',
      'coverage/**'
    ]
  }
};
```

---

## Migration Guide

### From v2.x to v3.x

**Breaking Changes:**
1. `register()` → `registerSkill()`
2. `stopHealthCheck()` → `stopHealthMonitoring()`
3. Config file format changed

**Migration Script:**
```bash
# 自動マイグレーション / Automatic migration
npx musubi-sdd migrate --from 2 --to 3

# 手動確認 / Manual verification
npx musubi-validate all --verbose
```

### From other SDD tools

```bash
# 既存の仕様をインポート / Import existing specifications
npx musubi-convert import --format openapi --file api-spec.yaml
npx musubi-convert import --format gherkin --dir features/
```

---

## Getting More Help

### リソース (Resources)

- **Documentation**: https://nahisaho.github.io/musubi
- **GitHub Issues**: https://github.com/nahisaho/MUSUBI/issues
- **Discussions**: https://github.com/nahisaho/MUSUBI/discussions

### デバッグモード (Debug Mode)

```bash
# 詳細ログを有効化 / Enable verbose logging
DEBUG=musubi:* npx musubi-validate all

# 特定のモジュールのみ / Specific modules only
DEBUG=musubi:validator npx musubi-validate ears
```

### バグ報告 (Bug Reports)

```bash
# 診断情報を収集 / Collect diagnostic information
npx musubi-sdd diagnose > musubi-diagnostic.txt

# GitHub Issueを作成 / Create a GitHub Issue
# https://github.com/nahisaho/MUSUBI/issues/new
# diagnostic.txtを添付 / Attach diagnostic.txt
```

---

**MUSUBI v3.12.0** - Specification Driven Development

[ドキュメント (Documentation)](../USER-GUIDE.md) | [GitHub](https://github.com/nahisaho/MUSUBI) | [npm](https://www.npmjs.com/package/musubi-sdd)
