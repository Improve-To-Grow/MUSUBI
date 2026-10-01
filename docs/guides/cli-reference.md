> 🇬🇧 English version: [cli-reference.en.md](./cli-reference.en.md)

# 📖 MUSUBI CLI コマンドリファレンス

**MUSUBI v3.5.1** | 最終更新: 2025-12-08

> 全20個のCLIコマンドの完全リファレンス

---

## 📋 目次

1. [基本コマンド](#1-基本コマンド)
2. [SDDワークフローコマンド](#2-sddワークフローコマンド)
3. [分析コマンド](#3-分析コマンド)
4. [メモリ・同期コマンド](#4-メモリ同期コマンド)
5. [自動化コマンド](#5-自動化コマンド)
6. [ユーティリティコマンド](#6-ユーティリティコマンド)

---

## 1. 基本コマンド

### `musubi` / `musubi-sdd`

メインエントリーポイント。

```bash
musubi --help           # ヘルプ表示
musubi --version        # バージョン表示
musubi <command>        # サブコマンド実行
```

### `musubi init`

新規プロジェクトの初期化。

```bash
# 基本使用法
musubi init

# プラットフォーム指定
musubi init --copilot      # GitHub Copilot
musubi init --claude-code  # Claude Code (Skills API)
musubi init --cursor       # Cursor IDE
musubi init --gemini       # Gemini CLI
musubi init --codex        # Codex CLI
musubi init --qwen         # Qwen Code
musubi init --windsurf     # Windsurf IDE

# オプション
musubi init --force        # 既存ファイルを上書き
musubi init --minimal      # 最小構成で初期化
musubi init --output ./dir # 出力ディレクトリ指定
```

**生成ファイル:**
- `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `QWEN.md`
- `steering/` ディレクトリ一式
- `storage/` ディレクトリ一式

### `musubi onboard`

既存プロジェクトの自動解析とsteering docs生成。

```bash
# 基本使用法
musubi onboard

# オプション
musubi onboard --analyze-only  # 解析のみ（ファイル生成なし）
musubi onboard --deep          # 詳細解析モード
musubi onboard --include-deps  # 依存関係も解析
```

**自動検出:**
- package.json, requirements.txt, go.mod 等
- ディレクトリ構造
- 使用フレームワーク・ライブラリ

---

## 2. SDDワークフローコマンド

### `musubi requirements`

EARS形式で要件書を生成。

```bash
# 基本使用法
musubi requirements --feature login

# オプション
musubi requirements --feature login --output ./specs/
musubi requirements --feature login --format markdown
musubi requirements --feature login --lang ja  # 日本語出力
musubi requirements --interactive              # 対話モード
```

**EARS 5パターン:**
| パターン | 構文 |
|---------|------|
| Ubiquitous | The system shall [action] |
| Event-Driven | When [trigger], the system shall [action] |
| State-Driven | While [state], the system shall [action] |
| Optional | Where [condition], the system shall [action] |
| Unwanted | If [condition], then the system shall [action] |

### `musubi design`

C4モデルとADR（アーキテクチャ決定記録）を生成。

```bash
# 基本使用法
musubi design --feature login

# オプション
musubi design --feature login --level container  # C4レベル指定
musubi design --feature login --include-adr      # ADR含む
musubi design --feature login --output ./design/
```

**C4レベル:**
1. Context - システム全体像
2. Container - コンテナ図
3. Component - コンポーネント図
4. Code - コード図

### `musubi tasks`

設計からタスクを分解。

```bash
# 基本使用法
musubi tasks --feature login

# オプション
musubi tasks --feature login --granularity fine  # 細粒度
musubi tasks --feature login --estimate          # 工数見積もり含む
musubi tasks --feature login --dependencies      # 依存関係表示
```

### `musubi validate`

実装が要件・設計に準拠しているか検証。

```bash
# 基本使用法
musubi validate

# オプション
musubi validate --feature login      # 特定機能のみ
musubi validate --constitution       # 憲法準拠チェック
musubi validate --traceability       # トレーサビリティチェック
musubi validate score                # スコア算出
musubi validate --strict             # 厳格モード
```

### `musubi workflow`

SDDワークフローの進行管理。

```bash
# 基本使用法
musubi workflow status                # 現在のステージ確認
musubi workflow next                  # 次のステージへ
musubi workflow prev                  # 前のステージへ

# ステージ指定
musubi workflow goto requirements     # 要件ステージへ移動
musubi workflow goto design
musubi workflow goto implement

# メトリクス
musubi workflow metrics               # ワークフローメトリクス表示
musubi workflow history               # 履歴表示
```

---

## 3. 分析コマンド

### `musubi analyze`

コードベースの分析。

```bash
# 基本使用法
musubi analyze

# オプション
musubi analyze --detect-stuck    # スタック検出
musubi analyze --changes         # 変更影響分析
musubi analyze --dependencies    # 依存関係分析
musubi analyze --complexity      # 複雑度分析
musubi analyze --security        # セキュリティ分析
```

### `musubi gaps`

要件・設計・実装間のギャップ検出。

```bash
# 基本使用法
musubi gaps

# オプション
musubi gaps --feature login       # 特定機能のみ
musubi gaps --detailed            # 詳細レポート
musubi gaps --output ./reports/   # レポート出力
```

### `musubi trace`

トレーサビリティマトリクス生成。

```bash
# 基本使用法
musubi trace

# オプション
musubi trace --feature login      # 特定機能のみ
musubi trace --format matrix      # マトリクス形式
musubi trace --format graph       # グラフ形式
musubi trace --output ./trace/    # 出力先指定
```

---

## 4. メモリ・同期コマンド

### `musubi remember`

エージェントメモリの管理。

```bash
# 基本使用法
musubi remember                    # メモリ表示
musubi remember --save             # 現在の学習事項を保存
musubi remember --auto             # 自動更新

# オプション
musubi remember --merge            # メモリマージ
musubi remember --condense         # メモリ圧縮
musubi remember --export ./mem/    # エクスポート
```

### `musubi sync`

steering docsとコードベースの同期。

```bash
# 基本使用法
musubi sync

# オプション
musubi sync --dry-run              # ドライラン（変更なし）
musubi sync --auto                 # 自動同期
musubi sync --force                # 強制同期
```

### `musubi change`

変更管理（Delta Specs）。

```bash
# 基本使用法
musubi change                      # 変更一覧

# オプション
musubi change --create             # 変更リクエスト作成
musubi change --apply CHG-001      # 変更適用
musubi change --rollback CHG-001   # ロールバック
musubi change --history            # 変更履歴
```

---

## 5. 自動化コマンド

### `musubi orchestrate`

マルチスキルワークフローの実行。

```bash
# 基本使用法
musubi orchestrate --workflow sdd-full

# オプション
musubi orchestrate --pattern sequential  # 順次実行
musubi orchestrate --pattern parallel    # 並列実行
musubi orchestrate --pattern swarm       # スウォームパターン
musubi orchestrate --dry-run             # ドライラン
```

**オーケストレーションパターン:**
| パターン | 説明 |
|---------|------|
| Sequential | 順次実行 |
| Parallel | 並列実行 |
| Hierarchical | 階層的実行 |
| GroupChat | グループチャット |
| Swarm | スウォームパターン |
| HumanInLoop | 人間介入あり |

### `musubi resolve`

GitHub Issue の自動解決。

```bash
# 基本使用法
musubi resolve --issue 123

# オプション
musubi resolve --issue 123 --auto-pr     # 自動PR作成
musubi resolve --issue 123 --dry-run     # ドライラン
musubi resolve --issue 123 --branch fix  # ブランチ名指定
```

### `musubi share`

仕様書の共有・エクスポート。

```bash
# 基本使用法
musubi share --feature login

# オプション
musubi share --format markdown           # Markdown出力
musubi share --format html               # HTML出力
musubi share --format pdf                # PDF出力
musubi share --output ./export/          # 出力先指定
```

---

## 6. ユーティリティコマンド

### `musubi browser`

ブラウザ自動化・E2Eテスト。

```bash
# 基本使用法
musubi browser test

# オプション
musubi browser test --url http://localhost:3000
musubi browser test --headless           # ヘッドレスモード
musubi browser test --screenshot         # スクリーンショット取得
musubi browser generate                  # テストコード生成
```

### `musubi gui`

Web GUIダッシュボード。

```bash
# 基本使用法
musubi gui start                         # GUIサーバー起動
musubi gui start --port 8080             # ポート指定

# 機能
# - プロジェクト概要
# - ワークフロー可視化
# - メトリクスダッシュボード
# - トレーサビリティマトリクス
```

### `musubi convert`

フォーマット変換（Spec Kit互換）。

```bash
# 基本使用法
musubi convert --input ./specs/

# オプション
musubi convert --from yaml --to markdown
musubi convert --from markdown --to json
musubi convert --output ./converted/
```

---

## 🔧 グローバルオプション

全コマンドで使用可能なオプション：

| オプション | 説明 |
|-----------|------|
| `--help, -h` | ヘルプ表示 |
| `--version, -v` | バージョン表示 |
| `--verbose` | 詳細ログ出力 |
| `--quiet, -q` | 出力抑制 |
| `--config <path>` | 設定ファイル指定 |
| `--cwd <path>` | 作業ディレクトリ指定 |

---

## 📊 コマンド対応表

| コマンド | SDDステージ | 主な用途 |
|---------|------------|---------|
| `init` | - | 初期化 |
| `onboard` | Research | 既存プロジェクト解析 |
| `requirements` | Requirements | 要件定義 |
| `design` | Design | 設計 |
| `tasks` | Tasks | タスク分解 |
| `validate` | Validate | 検証 |
| `workflow` | All | ワークフロー管理 |
| `analyze` | All | 分析 |
| `gaps` | Validate | ギャップ検出 |
| `trace` | All | トレーサビリティ |
| `remember` | All | メモリ管理 |
| `sync` | All | 同期 |
| `change` | All | 変更管理 |
| `orchestrate` | All | オーケストレーション |
| `resolve` | Implement | Issue解決 |
| `share` | Deploy | 共有 |
| `browser` | Test | E2Eテスト |
| `gui` | All | ダッシュボード |
| `convert` | All | 変換 |

---

*ドキュメント生成: MUSUBI v3.5.1*
