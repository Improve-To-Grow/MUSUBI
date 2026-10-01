> 🇬🇧 English version: [MUSUBI-v6.0.0-User-Guide.en.md](./MUSUBI-v6.0.0-User-Guide.en.md)

# 【MUSUBI v6.1.0】完全ユーザーガイド - 7つのAIプラットフォームで仕様駆動開発を始めよう

# はじめに

**MUSUBI SDD v6.1.0** がリリースされました！このバージョンでは、ディレクトリ構造の統一と要件定義ワークフローが強化されました。

本記事は MUSUBI を初めて使う方から、既存ユーザーまで、v6.1.0 の全機能を網羅したユーザーガイドです。

# 🆕 v6.1.0 の変更点

## ディレクトリ構造の統一

| 項目 | v6.0.0 | v6.1.0 |
|------|--------|--------|
| 仕様書格納先 | `storage/features/{feature}/` | `storage/specs/` |
| ファイル命名 | `requirements.md` | `{feature}-requirements.md` |

**Article VIII 準拠**: 不要なディレクトリ階層を削減し、フラットな命名規則を採用。

## 要件定義ワークフローの強化

- **対話型ダイアログ**: 1問1答形式で「真の目的」を探り出す
- **MECE分析**: 4つの観点で網羅的に要件をカバー

# 🆕 v6.0.0 の変更点（前バージョン）

## Breaking Change: GitHub Copilot プロンプトファイル拡張子

| 項目 | v5.x | v6.0.0 |
|------|------|--------|
| ファイル拡張子 | `.md` | `.prompt.md` |
| 配置場所 | `.github/prompts/` | `.github/prompts/` |
| コマンド形式 | `/sdd-*` | `/sdd-*`（変更なし） |

**VS Code 公式ドキュメント準拠**: GitHub Copilot のプロンプトファイルは `.prompt.md` 拡張子を使用することが推奨されています。

# マイグレーションガイド

既存プロジェクトをアップグレードする場合：

```bash
# .github/prompts/ 内のファイルをリネーム（AGENTS.mdは除く）
cd .github/prompts/
for f in *.md; do [ "$f" != "AGENTS.md" ] && mv "$f" "${f%.md}.prompt.md"; done
```

---

# 📦 インストール

# 新規インストール

```bash
# npm でグローバルインストール（Linux/Macはsudo必要）
sudo npm install -g musubi-sdd

# または npx で直接実行（インストール不要・推奨）
npx musubi-sdd@latest --version
# 出力: 6.1.0
```

# アップグレード

```bash
# グローバルインストール済みの場合（Linux/Macはsudo必要）
sudo npm install -g musubi-sdd@latest

# npx なら常に最新版を使用（推奨）
npx musubi-sdd@latest --version
```

---

# 🚀 クイックスタート（5分で始める）

# Step 1: プロジェクト初期化

お使いの AI コーディングプラットフォームに合わせて初期化：

```bash
# Claude Code（推奨）
npx musubi-sdd init --claude

# GitHub Copilot（VS Code）
npx musubi-sdd init --copilot

# Cursor IDE
npx musubi-sdd init --cursor

# Gemini CLI
npx musubi-sdd init --gemini

# 複数プラットフォーム同時
npx musubi-sdd init --claude --copilot
```

# Step 2: 要件定義

```bash
# EARS形式で要件を生成（対話型）
npx musubi-requirements "ユーザー認証機能"
```

**注意**: 要件定義は対話型で進みます。AIが1問1答形式で「真の目的」を探り出した後、MECEを使用して網羅的に要件を定義します。

生成されるファイル: `storage/specs/user-auth-requirements.md`

# Step 3: 設計

```bash
# C4モデルで設計を生成
npx musubi-design user-auth
```

生成されるファイル: `storage/design/user-auth-design.md`

# Step 4: タスク分解

```bash
# 実装タスクを生成
npx musubi-tasks user-auth
```

生成されるファイル: `storage/tasks/user-auth-tasks.md`

# Step 5: 検証

```bash
# 全体を検証
npx musubi-validate all
```

---

# 🤖 対応AIプラットフォーム（7種類）

MUSUBI v6.1.0 は以下の7つのAIコーディングプラットフォームに対応しています：

| プラットフォーム | Skills API | コマンド形式 | ファイル形式 | インストール先 |
|-----------------|-----------|-------------|-------------|---------------|
| **Claude Code** | ✅ 27 Skills | `/sdd-*` | Markdown (.md) | `.claude/commands/`, `.claude/skills/` |
| **GitHub Copilot** | ❌ | `/sdd-*` | Prompt (.prompt.md) | `.github/prompts/`, `AGENTS.md` |
| **Cursor IDE** | ❌ | 自然言語 | Markdown (.md) | `.cursor/rules/` |
| **Gemini CLI** | ❌ | `/sdd-*` | TOML (.toml) | `.gemini/settings/` |
| **Codex CLI** | ❌ | `/sdd-*` | Markdown (.md) | `CODEX.md` |
| **Qwen Code** | ❌ | `/sdd-*` | Markdown (.md) | `QWEN.md` |
| **Windsurf** | ❌ | 自然言語 | Markdown (.md) | `.windsurf/rules/` |

# プラットフォーム別の特徴

# Claude Code（最も機能が充実）
- 27個の専門スキル（Skills API）
- 9つのオーケストレーションパターン
- MCP（Model Context Protocol）統合

```bash
npx musubi-sdd init --claude
```

# GitHub Copilot（v6.0.0で改善）
- `.prompt.md` 拡張子（VS Code公式準拠）
- AGENTS.md による 27 エージェント定義
- VS Code 完全統合

```bash
npx musubi-sdd init --copilot
```

生成されるファイル構造：
```
.github/
├── prompts/
│   ├── sdd-steering.prompt.md
│   ├── sdd-requirements.prompt.md
│   ├── sdd-design.prompt.md
│   ├── sdd-tasks.prompt.md
│   ├── sdd-implement.prompt.md
│   ├── sdd-validate.prompt.md
│   ├── sdd-change-init.prompt.md
│   ├── sdd-change-apply.prompt.md
│   └── sdd-change-archive.prompt.md
└── AGENTS.md
AGENTS.md                      # ルートにも配置
```

---

# 📋 27エージェント（スキル）一覧

MUSUBI は27個の専門AIエージェントを提供します：

> **Note**: コマンド形式はプラットフォームにより異なります。
> - Claude Code: `/sdd-*`
> - GitHub Copilot: `/sdd-*`
> - Cursor/Windsurf: 自然言語でコマンド名を伝える

# コアワークフロー（9個）
| エージェント | 役割 | コマンド（Claude Code） |
|-------------|------|---------|
| Steering | プロジェクトメモリ管理 | `/sdd-steering` |
| Requirements Analyst | EARS形式要件定義 | `/sdd-requirements` |
| System Architect | C4モデル設計 | `/sdd-design` |
| Project Manager | タスク分解 | `/sdd-tasks` |
| Software Developer | 実装 | `/sdd-implement` |
| Traceability Auditor | トレーサビリティ検証 | `/sdd-validate` |
| Change Impact Analyzer | 変更影響分析 | `/sdd-change-init` |
| Delta Spec Manager | 差分仕様適用 | `/sdd-change-apply` |
| Archive Manager | 変更アーカイブ | `/sdd-change-archive` |

# 品質保証（6個）
| エージェント | 役割 |
|-------------|------|
| Test Engineer | テスト設計・実装 |
| Code Reviewer | コードレビュー |
| Security Auditor | セキュリティ監査 |
| Performance Optimizer | パフォーマンス最適化 |
| Quality Assurance | 品質管理 |
| Constitution Enforcer | ガバナンス検証 |

# 専門領域（12個）
| エージェント | 役割 |
|-------------|------|
| API Designer | API設計 |
| Database Schema Designer | DB設計 |
| Database Administrator | DB運用 |
| UI/UX Designer | UI/UX設計 |
| DevOps Engineer | CI/CD構築 |
| Cloud Architect | クラウド設計 |
| AI/ML Engineer | AI/ML実装 |
| Technical Writer | ドキュメント作成 |
| Release Coordinator | リリース管理 |
| SRE | 信頼性エンジニアリング |
| Bug Hunter | バグ調査 |
| Issue Resolver | 課題解決 |

---

# 🏛️ 9つの憲法条項（Constitutional Articles）

MUSUBI は「憲法」によるガバナンスで品質を保証します：

| 条項 | 原則 | 内容 |
|------|------|------|
| Article I | Library-First | 機能はまずライブラリとして実装 |
| Article II | CLI Interface | 全機能にCLIインターフェース必須 |
| Article III | Test-First | テストを実装前に書く（Red-Green-Blue） |
| Article IV | EARS Format | 要件はEARS形式で記述 |
| Article V | Traceability | 要件↔設計↔コード↔テストの追跡性 |
| Article VI | Project Memory | Steeringファイルの参照必須 |
| Article VII | Simplicity Gate | プロジェクト数は最大3つまで |
| Article VIII | Anti-Abstraction | 不要な抽象化層を作らない |
| Article IX | Integration-First | 統合テストで実サービスを使用 |

---

# 📁 プロジェクト構造

MUSUBI で初期化されたプロジェクトの標準構造：

```
your-project/
├── AGENTS.md                    # AIエージェント定義
├── steering/
│   ├── structure.md             # アーキテクチャパターン
│   ├── tech.md                  # 技術スタック
│   ├── product.md               # プロダクトコンテキスト
│   └── rules/
│       ├── constitution.md      # 9つの憲法条項
│       ├── workflow.md          # ワークフローガイド
│       └── ears-format.md       # EARS形式ガイド
├── storage/
│   ├── specs/                   # 仕様書
│   │   ├── *-requirements.md    # 要件定義
│   │   ├── *-design.md          # 設計書
│   │   └── *-tasks.md           # タスク分解
│   ├── changes/                 # 変更管理
│   └── archive/                 # アーカイブ
└── .github/prompts/             # GitHub Copilot用（v6.0.0）
    ├── sdd-steering.prompt.md
    ├── sdd-requirements.prompt.md
    └── ... (他の.prompt.mdファイル)
```

---

# 🔧 CLIコマンドリファレンス

# 基本コマンド

```bash
# ヘルプ表示
npx musubi-sdd --help

# バージョン確認
npx musubi-sdd --version

# 初期化
npx musubi-sdd init [--claude|--copilot|--cursor|--gemini]
```

# 仕様駆動開発コマンド

```bash
# 要件定義
npx musubi-requirements "<機能説明>"

# 設計
npx musubi-design <feature-name>

# タスク分解
npx musubi-tasks <feature-name>

# 検証
npx musubi-validate [all|requirements|design|traceability]

# トレーサビリティ
npx musubi-trace <feature-name>

# ギャップ分析
npx musubi-gaps <feature-name>
```

# 変更管理コマンド

```bash
# 変更提案作成
npx musubi-change init <change-name>

# 変更適用
npx musubi-change apply <change-name>

# 変更アーカイブ
npx musubi-change archive <change-name>
```

# 高度なコマンド

```bash
# オーケストレーション
npx musubi-orchestrate <pattern> <feature-name>

# コスト追跡
npx musubi-costs

# リリース
npx musubi-release [--dry-run]

# 解析
npx musubi-analyze <path>

# 同期
npx musubi-sync
```

---

# 🌐 多言語対応（8言語）

MUSUBI は8言語でテンプレートを生成できます：

| 言語 | コード | 例 |
|------|--------|-----|
| English | `en` | `--locale en` |
| 日本語 | `ja` | `--locale ja` |
| 中文 | `zh` | `--locale zh` |
| 한국어 | `ko` | `--locale ko` |
| Deutsch | `de` | `--locale de` |
| Français | `fr` | `--locale fr` |
| Español | `es` | `--locale es` |
| Bahasa Indonesia | `id` | `--locale id` |

```bash
# 日本語テンプレートで初期化
npx musubi-sdd init --claude --locale ja
```

---

# 🔄 オーケストレーションパターン（9種類）

複数エージェントを連携させるパターン：

| パターン | 用途 | コマンド |
|----------|------|---------|
| Sequential | 順次実行 | `npx musubi-orchestrate sequential` |
| Triage | タスク振り分け | `npx musubi-orchestrate triage` |
| Handoff | エージェント間引継ぎ | `npx musubi-orchestrate handoff` |
| Swarm | 協調処理 | `npx musubi-orchestrate swarm` |
| Group Chat | 議論型 | `npx musubi-orchestrate group-chat` |
| Nested | 階層型 | `npx musubi-orchestrate nested` |
| Human-in-Loop | 人間承認 | `npx musubi-orchestrate human-in-loop` |
| Auto | 自動選択 | `npx musubi-orchestrate auto` |
| Parallel | 並列実行 | `npx musubi-orchestrate parallel` |

---

# 🏢 エンタープライズ機能

# ワークフローモード（3種類）

| モード | プロジェクト規模 | ステージ数 |
|--------|----------------|-----------|
| `small` | 小規模 | 3ステージ |
| `medium` | 中規模 | 5ステージ |
| `large` | 大規模 | 8ステージ |

```bash
# 大規模プロジェクトモードで初期化
npx musubi-sdd init --mode large
```

# モノレポサポート

```javascript
const { PackageManager } = require('musubi-sdd');
const pm = new PackageManager('/path/to/monorepo');

// 依存関係グラフを生成
const graph = pm.generateDependencyGraph('mermaid');
```

# 憲法レベル管理

| レベル | 違反時の動作 |
|--------|------------|
| `critical` | ブロック（必須修正） |
| `advisory` | 警告（推奨修正） |
| `flexible` | 情報（任意） |

---

# 🛠️ トラブルシューティング

# よくある問題

# Q: `npx musubi-sdd` が見つからない

```bash
# キャッシュクリア
npx clear-npx-cache

# 再実行
npx musubi-sdd@latest --version
```

# Q: GitHub Copilot で `.prompt.md` が認識されない

1. VS Code を最新版にアップデート
2. GitHub Copilot 拡張機能を最新版に
3. ファイル拡張子が正しく `.prompt.md` であることを確認

# Q: 既存プロジェクトをアップグレードしたい

```bash
# v6.0.0 用にファイルをマイグレーション
cd .github/prompts/
for f in *.md; do [ "$f" != "AGENTS.md" ] && mv "$f" "${f%.md}.prompt.md"; done
```

---

# 📚 関連リソース

- **GitHub リポジトリ**: [nahisaho/musubi](https://github.com/nahisaho/MUSUBI)
- **npm パッケージ**: [musubi-sdd](https://www.npmjs.com/package/musubi-sdd)
- **VS Code Copilot ドキュメント**: [Reusable prompt files](https://code.visualstudio.com/docs/copilot/copilot-customization#_reusable-prompt-files)

---

# まとめ

MUSUBI v6.1.0 では以下が改善されました：

1. ✅ **ディレクトリ構造の統一**: `storage/specs/` にフラット化
2. ✅ **対話型要件定義**: 1問1答 + MECE分析
3. ✅ **GitHub Copilot 公式準拠**: `.prompt.md` 拡張子（v6.0.0）
4. ✅ **7プラットフォーム対応**: Claude Code, GitHub Copilot, Cursor, Gemini CLI, Codex CLI, Qwen Code, Windsurf
5. ✅ **27エージェント**: 専門AIによる開発支援
6. ✅ **9つの憲法条項**: 品質ガバナンス
7. ✅ **8言語対応**: グローバルチーム向け

仕様駆動開発で、より品質の高いソフトウェアを構築しましょう！

---

**Tags**: `MUSUBI` `SDD` `仕様駆動開発` `AIコーディング` `GitHubCopilot` `ClaudeCode` `ソフトウェア開発` `開発ツール`
