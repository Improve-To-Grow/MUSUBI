> 🇬🇧 English version: [musubi-v0.4.0-auto-sync.en.md](./musubi-v0.4.0-auto-sync.en.md)

# MUSUBI v0.4.0 - プロジェクトメモリだけでは足りなかった理由と自動同期の実装

**タグ**: `AI` `ChatGPT` `GitHub` `npm` `ドキュメント`

## はじめに

MUSUBI (Ultimate Specification Driven Development Tool) v0.4.0 をリリースしました。このバージョンでは、**ステアリングドキュメントの自動同期機能** (`musubi-sync`) を追加しました。

本記事では、「なぜプロジェクトメモリだけでは足りなかったのか？」という疑問に答えつつ、v0.4.0 の新機能と使い方を解説します。

## TL;DR（要約）

**何が問題だったか？**
- AIエージェント用のプロジェクトメモリ（v0.2.0）は「なぜその技術を選んだか」は記録できるが、「今どの技術を使っているか」は自動更新されない
- コードを変更しても、ドキュメントが古いまま → AIが誤った前提で動く

**どう解決したか？**
- `musubi-sync` コマンドで、コードベースの変更（バージョン、依存関係、ディレクトリ）を自動検出
- 検出した変更をステアリングドキュメントに自動反映（英語・日本語の両方）

**何が嬉しいか？**
- 手動更新の手間ゼロ（10分 → 3秒、95%削減）
- ドキュメントとコードの乖離を防止（常に最新状態）
- CI/CDパイプラインにも組み込み可能（`--auto-approve`オプション）

```bash
# インストール
npm install -g musubi-sdd

# 既存プロジェクトを分析してドキュメント生成 (v0.3.0)
musubi-onboard

# コードベースの変更を検出してドキュメント更新 (v0.4.0)
musubi-sync
```

## なぜプロジェクトメモリだけでは足りなかったのか？

### v0.2.0 までの課題

MUSUBI v0.2.0 では、Serena プロジェクトから着想を得て **プロジェクトメモリシステム** を実装しました。

```
steering/
├── memories/
│   ├── architecture_decisions.md  # 設計決定
│   ├── development_workflow.md    # 開発フロー
│   ├── domain_knowledge.md        # ドメイン知識
│   ├── lessons_learned.md         # 学習内容
│   ├── suggested_commands.md      # 推奨コマンド
│   └── technical_debt.md          # 技術的負債
├── structure.md                   # アーキテクチャパターン
├── tech.md                        # 技術スタック
└── product.md                     # プロダクトコンテキスト
```

これにより、AI エージェントが会話間で知識を永続化できるようになりました。

#### メモリシステムの役割

v0.2.0 で追加された 6 つのメモリファイルは、それぞれ異なる種類の知識を記録します。

1. **architecture_decisions.md** (設計決定)
   - ADR (Architecture Decision Record) 形式で重要な設計判断を記録
   - 例: 「なぜ JWT 認証を選んだか」「なぜマイクロサービス化したか」
   - **AI エージェントはこれを読んで、過去の決定理由を理解**

2. **development_workflow.md** (開発フロー)
   - プロジェクト固有の開発プロセスを記録
   - 例: 「PR の承認ルール」「デプロイ手順」「ブランチ戦略」
   - **AI エージェントはこれに従って作業を提案**

3. **domain_knowledge.md** (ドメイン知識)
   - ビジネスロジックや業界特有の知識を記録
   - 例: 「ポイント計算ロジック」「会計年度の定義」「業界用語」
   - **AI エージェントはこれを参照してコードを生成**

4. **lessons_learned.md** (学習内容)
   - 過去のトラブルや改善点を記録
   - 例: 「パフォーマンス問題とその解決策」「失敗したリファクタリング」
   - **AI エージェントは同じ過ちを避ける**

5. **suggested_commands.md** (推奨コマンド)
   - プロジェクトでよく使うコマンドやスクリプトを記録
   - 例: 「テスト実行方法」「ローカル環境構築」「デバッグ手順」
   - **AI エージェントは適切なコマンドを提案**

6. **technical_debt.md** (技術的負債)
   - 将来対処すべき問題を記録
   - 例: 「古い依存関係」「リファクタリング候補」「TODO コメント」
   - **AI エージェントは優先順位を考慮して作業提案**

#### プロジェクトメモリだけでは何が記録できたか

v0.2.0 のプロジェクトメモリは、**「人間の判断や経験」を記録する仕組み**でした。

- ✅ **記録できたこと**: なぜその技術を選んだか (Why)
- ✅ **記録できたこと**: 過去にどんな問題があったか (History)
- ✅ **記録できたこと**: どんなルールで開発するか (How)
- ❌ **記録できなかったこと**: 今どの技術を使っているか (What)
- ❌ **記録できなかったこと**: 現在のバージョンは何か (Current State)
- ❌ **記録できなかったこと**: どんなディレクトリがあるか (Structure)

**つまり、質的な知識 (Why/How) は記録できても、量的な情報 (What) は手動更新に頼るしかありませんでした。**

しかし、**運用してみると大きな問題が見つかりました**。

### 問題1: コードベースとの乖離

プロジェクトメモリは「手動で記録する知識」です。しかし、実際の開発では:

```typescript
// package.json を更新
{
  "version": "0.3.0" -> "0.4.0",
  "dependencies": {
    "chalk": "^5.0.0",
    "js-yaml": "^4.1.0"  // 新規追加
  }
}

// 新しいディレクトリを作成
bin/
├── musubi-sync.js  // 新規追加
```

これらの変更は自動的には `steering/tech.md` や `steering/structure.md` に反映されません。

**結果**: ドキュメントが古くなり、AI エージェントが誤った前提で動作する可能性があります。

### 問題2: 更新の手間とタイミング

手動更新には以下の課題があります。

1. **更新を忘れる**: 開発に集中すると、ドキュメント更新を忘れがち
2. **更新タイミングが不明**: いつ更新すべきか判断が難しい
3. **更新内容の抜け漏れ**: 何が変わったか把握しづらい
4. **バイリンガル対応の負担**: 英語・日本語の両方を更新する必要がある

### 問題3: チーム開発での同期

複数の開発者がいる場合:

- 開発者 A が新しいフレームワークを追加
- 開発者 B は古いドキュメントを参照して作業
- **結果**: 認識の齟齬が発生

**つまり、プロジェクトメモリは「記録された知識」を保持できますが、「現在のコードベースの状態」を自動的に反映する仕組みがありませんでした。**

## v0.4.0 の解決策: 自動同期システム

### アーキテクチャ

v0.4.0 では、以下の 5 ステップで自動同期を実現しました。

```
1. Load Config
   └─> steering/project.yml を読み込み
   
2. Analyze Codebase
   └─> package.json, ディレクトリ構造を走査
   
3. Detect Changes
   └─> 設定と実際の状態を比較
   
4. Display & Confirm
   └─> 変更内容を表示、ユーザー確認
   
5. Apply Updates
   └─> YAML + Markdown ファイルを更新 (英語・日本語)
```

### 変更検出の仕組み

`musubi-sync` は以下のカテゴリで変更を検出します。

| カテゴリ | 検出内容 | 更新先 |
|---------|---------|--------|
| **Version** | `package.json` のバージョン変更 | `project.yml` |
| **Languages** | 新規/削除された言語 | `project.yml` |
| **Frameworks** | 新規/削除された依存関係 | `project.yml`, `tech.md` (en/ja) |
| **Directories** | 新規作成されたディレクトリ | `project.yml`, `structure.md` (en/ja) |

### 実装の工夫

#### 1. YAML パーシング: 手動実装を避ける

当初、YAML を手動で文字列操作することを検討しましたが、エラーが起きやすいと判断。**js-yaml ライブラリ**を採用しました。

```javascript
const yaml = require('js-yaml');

// 読み込み
const config = yaml.load(fs.readFileSync('steering/project.yml', 'utf8'));

// 更新
config.version = newVersion;

// 書き込み (構造を保持)
fs.writeFileSync('steering/project.yml', yaml.dump(config, {
  indent: 2,
  lineWidth: 100
}));
```

#### 2. 変更検出: ノイズを除外

すべての変更を検出すると `node_modules` や `dist/` などのノイズが含まれます。**フォーカスした検出ロジック**を実装:

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

  // Frameworks (node_modules を除外)
  const configFrameworks = new Set(config.frameworks || []);
  actual.frameworks
    .filter(fw => !fw.startsWith('node_modules'))
    .forEach(fw => {
      if (!configFrameworks.has(fw)) {
        changes.newFrameworks.push(fw);
      }
    });

  // Directories (除外パターン適用)
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

#### 3. ユーザー確認: 自動化と制御のバランス

完全自動化はリスクがあります。**3 つの実行モード**を用意:

```bash
# Interactive (デフォルト): 変更を表示して確認
musubi-sync

# Dry-run: プレビューのみ (適用しない)
musubi-sync --dry-run

# Auto-approve: 自動適用 (CI/CD 向け)
musubi-sync --auto-approve
```

#### 4. バイリンガル更新: 一貫性の維持

英語・日本語の両方を同時に更新:

```javascript
function updateTechMd(changes, actualState) {
  const files = [
    'steering/tech.md',
    'steering/tech.ja.md'
  ];

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // 新しいフレームワークを追加
    changes.newFrameworks.forEach(framework => {
      const isJapanese = file.endsWith('.ja.md');
      const addition = isJapanese
        ? `- **${framework}** - [説明を記載してください]`
        : `- **${framework}** - [Add description]`;
      
      content = appendToSection(content, '## Frameworks', addition);
    });
    
    fs.writeFileSync(file, content);
  });
}
```

#### 5. 監査証跡: すべての同期を記録

同期イベントを `architecture_decisions.md` に記録:

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
  
  // 最新の変更を先頭に追加
  const updated = content.replace(
    /^(# Architecture Decisions\n\n)/,
    `$1${entry}`
  );
  
  fs.writeFileSync(filePath, updated);
}
```

## v0.4.0 の使い方

### 1. インストール

```bash
npm install -g musubi-sdd
```

### 2. 既存プロジェクトのオンボーディング (v0.3.0 機能)

まず、既存プロジェクトを分析してステアリングドキュメントを生成:

```bash
cd your-project
musubi-onboard
```

**実行結果**:

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

### 3. 開発: コードベースを変更

通常通り開発を進めます。

```bash
# 新しい依存関係を追加
npm install axios

# 新しいディレクトリを作成
mkdir -p src/api

# バージョンを更新
npm version patch  # 0.3.0 → 0.3.1
```

### 4. 同期: 変更を検出して更新

#### Interactive モード (デフォルト)

```bash
musubi-sync
```

**実行結果**:

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

#### Dry-run モード (プレビューのみ)

変更内容を確認したいが、まだ適用したくない場合:

```bash
musubi-sync --dry-run
```

**実行結果**:

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

#### Auto-approve モード (CI/CD 向け)

CI/CD パイプラインで自動実行する場合:

```bash
musubi-sync --auto-approve
```

**GitHub Actions の例**:

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

### 5. 継続的な運用

開発サイクルに組み込みます。

```
開発 → musubi-sync → レビュー → コミット
  ↑                                   ↓
  └───────────────────────────────────┘
```

**推奨頻度**:

- **週次**: 定期的に `musubi-sync` を実行
- **リリース前**: 必ず同期して最新状態を確認
- **大きな変更後**: 新しい依存関係やディレクトリ追加時

## 実際の効果

MUSUBI プロジェクト自身で dogfooding した結果:

### Before (v0.3.0 まで)

- **手動更新**: Phase 3 完了後、`tech.md` の更新を忘れる
- **バイリンガル負担**: 英語・日本語の両方を手動で編集
- **更新漏れ**: 新しい依存関係 (`glob`, `inquirer`) の記載漏れ

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

**効果**:

- ⏱️ **時間削減**: 手動更新 10 分 → 自動同期 3 秒 (95% 削減)
- 🎯 **精度向上**: 検出漏れゼロ
- 🌐 **バイリンガル対応**: 英語・日本語が自動で同期
- 📝 **監査証跡**: すべての変更が `architecture_decisions.md` に記録

## プロジェクトメモリ vs 自動同期: 使い分け

| 項目 | プロジェクトメモリ (v0.2.0) | 自動同期 (v0.4.0) |
|------|---------------------------|------------------|
| **用途** | 設計決定、学習内容、ドメイン知識 | コードベースの状態 (バージョン、技術スタック、構造) |
| **更新** | 手動 (AI エージェントまたは開発者) | 自動検出 + 確認 |
| **内容** | 質的な知識 (Why, How) | 量的な情報 (What) |
| **変更頻度** | 低 (重要な決定時のみ) | 高 (開発中随時) |
| **例** | "JWT 認証を採用した理由", "パフォーマンス改善の知見" | "現在のバージョン: 0.4.0", "使用フレームワーク: React, Jest" |

**両者は補完関係**:

- **プロジェクトメモリ**: なぜその技術を選んだか (Why)
- **自動同期**: 今どの技術を使っているか (What)

## v0.1.7 → v0.4.0 の進化

MUSUBI の進化を振り返ります。

### v0.1.7 (初期リリース)

- 25 エージェント + 憲法ガバナンス
- 7 プラットフォーム対応
- **課題**: 手動でステアリングドキュメントを作成・更新

### v0.2.0 (Phase 1: メモリシステム)

- プロジェクトメモリ追加 (`steering/memories/`)
- 設計決定・学習内容を永続化
- **課題**: コードベースの変化に追従できない

### v0.2.1 (Phase 2: プロジェクト設定)

- `steering/project.yml` 追加
- プロジェクト設定の標準化
- **課題**: 既存プロジェクトへの適用が手間

### v0.3.0 (Phase 3: オンボーディング自動化)

- `musubi-onboard` コマンド追加
- 既存プロジェクトを自動分析してドキュメント生成
- **効果**: セットアップ時間 96% 削減 (2-4 時間 → 2-5 分)
- **課題**: 初回だけで、継続的な更新なし

### v0.4.0 (Phase 4: 自動同期) ← **今回のリリース**

- `musubi-sync` コマンド追加
- 変更検出 + 自動更新
- 3 つの実行モード (Interactive / Dry-run / Auto-approve)
- **効果**: ドキュメントとコードの乖離を防止

### 完全なライフサイクル

```
musubi-onboard (v0.3.0)
  ↓
初期ステアリングドキュメント生成
  ↓
開発・コード変更
  ↓
musubi-sync (v0.4.0)
  ↓
ステアリングドキュメント更新
  ↓
繰り返し...
```

**Phase 1-4 で完全なステアリングライフサイクルを実現しました。**

## まとめ

### プロジェクトメモリだけでは足りなかった理由

1. **コードベースとの乖離**: 手動記録ではコード変更に追従できない
2. **更新の手間**: バイリンガル対応、更新タイミング判断が負担
3. **チーム開発での同期**: 複数開発者間での認識齟齬

### v0.4.0 の解決策

- **自動検出**: バージョン、言語、フレームワーク、ディレクトリの変更を検出
- **3 つのモード**: Interactive / Dry-run / Auto-approve で柔軟な運用
- **バイリンガル対応**: 英語・日本語を同時更新
- **監査証跡**: すべての同期イベントを記録

### 使い方

```bash
# インストール
npm install -g musubi-sdd

# 既存プロジェクトを分析 (初回)
musubi-onboard

# 変更を検出して更新 (継続的)
musubi-sync
musubi-sync --dry-run        # プレビュー
musubi-sync --auto-approve   # CI/CD
```

### 今後の展開

v0.4.0 でロードマップ Phase 1-4 が完了しました。今後の可能性:

- Git フック統合 (pre-commit で自動チェック)
- CI/CD バリデーション (PR で同期状態を検証)
- 拡張検出 (アーキテクチャパターン、DB スキーマ変更)
- LSP 統合 (シンボルレベル分析、将来)

## 参考リンク

- [MUSUBI GitHub リポジトリ](https://github.com/nahisaho/MUSUBI)
- [npm パッケージ](https://www.npmjs.com/package/musubi-sdd)
- [Phase 1-4 ロードマップ分析](https://github.com/nahisaho/MUSUBI/blob/main/docs/analysis/SERENA-STEERING-COMPARISON.md)

---

MUSUBI v0.4.0 で、**プロジェクトメモリ (知識) + 自動同期 (状態)** による完全なステアリングシステムが完成しました。ぜひお試しください！

**Happy Specification Driven Development! 🎉**
