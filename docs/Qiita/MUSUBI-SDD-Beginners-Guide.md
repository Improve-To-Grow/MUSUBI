> 🇬🇧 English version: [MUSUBI-SDD-Beginners-Guide.en.md](./MUSUBI-SDD-Beginners-Guide.en.md)

# MUSUBI ではじめる仕様駆動開発入門 - Vibe CodingからSDD（Specification Driven Development）へ

> **MUSUBI v2.1.1** - 7つのAIエージェント対応、25スキル搭載の究極仕様駆動開発ツール
> 
> 🆕 v2.0新機能: CodeGraph MCP統合によりプロジェクト全体のコード理解力を獲得！

## はじめに

「GitHub CopilotやClaude Codeを使えば、もう設計書なんていらないよね？」

そう思っているあなた、ちょっと待ってください。確かにAIコーディングアシスタントの登場で、コーディング速度は飛躍的に向上しました。しかし、**速く書けること**と**正しく作れること**は別問題です。

この記事では、AIコーディング時代に真に必要な「仕様駆動開発（SDD）」と、それを実現する究極のツール「**MUSUBI**」の使い方を、実践を交えながらステップバイステップで解説します。

**初心者の方へ**: MUSUBIには25の専門エージェントがありますが、最初は **`@orchestrator`（オーケストレーター）だけ覚えればOK** です。orchestratorがあなたの代わりに適切な専門エージェントを呼び出してくれます。

**v2.0の進化**: MUSUBI v2.0では[CodeGraph MCP Server](https://qiita.com/hisaho/items/b99ac51d78119ef60b6b)との統合により、AIエージェントが「ファイル単位」から「プロジェクト全体」を理解できるようになりました。

## Vibe Coding vs SDD（Specification Driven Development）

### Vibe Codingとは？

**Vibe Coding**とは、詳細な設計や仕様書なしに、「なんとなく（Vibe）」でコードを書き進める開発スタイルです。

```
開発者「ユーザー認証機能を作って」
↓
AI「はい、こんな感じでコード書きました！」
↓
開発者「いいね！次はパスワードリセット機能も」
↓
AI「できました！」
↓
繰り返し...
```

#### Vibe Codingの問題点

1. **仕様の曖昧性**: 「認証機能」と言っても、何をどこまで実装するか不明確
2. **トレーサビリティ欠如**: なぜこのコードが必要なのか、後から追跡不可能
3. **テストの不完全性**: 仕様がないので、何をテストすべきか不明
4. **変更の困難性**: 既存コードへの影響範囲が不明
5. **品質の不安定性**: AIの出力に依存、一貫性なし

実際の現場では：

```
❌ Vibe Codingの末路:
- 「あれ、このコード何のためにあるんだっけ？」
- 「テストケース足りてる？何をテストすればいい？」
- 「この変更、他に影響ないよね？...たぶん」
- 「リリース直前にバグ発覚、原因不明」
```

### SDD（Specification Driven Development）とは？

**仕様駆動開発（SDD）** は、**明確な仕様を起点** として開発を進めるアプローチです。

```
要件定義（EARS形式）
  ↓
設計（C4モデル + ADR）
  ↓
タスク分解（要件カバレッジマトリックス）
  ↓
実装（テストファースト）
  ↓
テスト（要件に対するトレーサビリティ）
  ↓
デプロイ
  ↓
モニタリング
```

#### SDDの利点

1. **明確な仕様**: 曖昧さのない要件（EARS形式）
2. **完全なトレーサビリティ**: 要件 → 設計 → コード → テスト の追跡可能性
3. **包括的なテスト**: すべての要件に対するテストケース
4. **安全な変更**: 影響範囲の可視化（Delta Specs）
5. **一貫した品質**: 憲法ガバナンスによる品質保証

## GitHub Copilot / Claude Code との違い

### 従来のAIコーディングアシスタント

| ツール | 得意なこと | 苦手なこと |
|--------|-----------|-----------|
| **GitHub Copilot** | コード補完、関数生成 | 要件定義、アーキテクチャ設計、トレーサビリティ |
| **Claude Code** | 対話的コーディング、リファクタリング | 仕様管理、品質ゲート、変更影響分析 |
| **Cursor** | マルチファイル編集、コンテキスト理解 | 要件追跡、テスト戦略、憲法ガバナンス |

これらは **「コーディング支援ツール」** であり、**「開発プロセス全体」** はカバーしていません。

### MUSUBIの違い - 開発プロセス全体をカバー

MUSUBIは、**7つのAIコーディングエージェント**と統合し、**25の専門エージェント**で**SDDワークフロー全体**を支援します。

#### MUSUBI = AIコーディングアシスタント + SDD完全フレームワーク

| カテゴリ | 従来のツール（Copilot/Claude Code/Cursor） | MUSUBI |
|---------|------------------------------------------|--------|
| **対応範囲** | コード補完・生成のみ | 開発プロセス全体（要件→モニタリング） |
| **1. 要件定義** | ❌ 対応なし | ✅ EARS形式 + @requirements-analyst |
| **2. 設計** | ❌ 対応なし | ✅ C4モデル + ADR + @system-architect |
| **3. タスク分解** | ❌ 対応なし | ✅ 要件カバレッジマトリックス + @project-manager |
| **4. 実装** | ✅ コード生成 | ✅ テストファースト + @software-developer |
| **5. テスト** | △ 部分的 | ✅ 要件トレーサビリティ + @test-engineer |
| **6. レビュー** | △ 部分的 | ✅ SOLID原則チェック + @code-reviewer |
| **7. セキュリティ** | ❌ 対応なし | ✅ OWASP Top 10 + @security-auditor |
| **8. デプロイ** | ❌ 対応なし | ✅ CI/CD自動化 + @devops-engineer |
| **9. モニタリング** | ❌ 対応なし | ✅ SLO/SLI + @site-reliability-engineer |
| **品質保証** | なし | ✅ 憲法ガバナンス（9条項） |
| **トレーサビリティ** | なし | ✅ 要件→設計→コード→テスト 100%追跡 |
| **プロジェクト記憶** | なし | ✅ Steering（構造・技術・製品コンテキスト） |

### 具体例: ユーザー認証機能の開発

#### ❌ Vibe Coding（GitHub Copilot単体）

```bash
開発者: 「ユーザー認証機能を作って」
Copilot: [コード生成]

# 問題:
- どんな認証方式？（JWT? Session? OAuth?）
- パスワードポリシーは？
- エラーハンドリングは？
- テストケースは？
- 既存コードへの影響は？
```

#### ✅ SDD with MUSUBI

```bash
1. 要件定義（@requirements-analyst）
   WHEN ユーザーが有効な認証情報を提供する場合、
   THEN システムSHALLユーザーを認証する
   AND システムSHALLセッショントークンを発行する

2. 設計（@system-architect）
   - JWT認証方式
   - BCrypt パスワードハッシュ
   - Redis セッション管理
   - ADR-001: なぜJWTを選択したか記録

3. タスク分解（@project-manager）
   - Task 1: User modelの作成（REQ-AUTH-001に対応）
   - Task 2: JWT生成ロジック（REQ-AUTH-002に対応）
   - Task 3: 認証ミドルウェア（REQ-AUTH-003に対応）

4. 実装（@software-developer）
   [要件に基づくコード生成]

5. テスト（@test-engineer）
   - REQ-AUTH-001: 有効な認証情報でトークン発行確認
   - REQ-AUTH-002: 無効な認証情報でエラー確認
   - REQ-AUTH-003: セッション有効期限確認

6. トレーサビリティ確認（@traceability-auditor）
   ✅ REQ-AUTH-001 → Design Section 7 → AuthService.login() → test/auth.test.ts:L25
```

**結果**: すべてが追跡可能、テスト完全、品質保証、変更影響明確

## MUSUBIの基本概念

### 1. EARS形式要件

**EARS（Easy Approach to Requirements Syntax）** は、曖昧さを排除した要件記述形式です。

```markdown
❌ 曖昧な要件:
「ユーザーはログインできるようにする」

✅ EARS形式:
WHEN ユーザーが有効なメールアドレスとパスワードを入力する場合、
THEN システムSHALLユーザー認証を実行する
AND システムSHALL JWTトークンを発行する
AND システムSHALLユーザーをダッシュボードにリダイレクトする

IF パスワードが3回連続で間違っている場合、
THEN システムSHALLアカウントを15分間ロックする
AND システムSHALLユーザーにメール通知を送信する
```

#### EARS 5パターン

1. **Event-driven（イベント駆動）**: `WHEN [event], the system SHALL [response]`
2. **State-driven（状態駆動）**: `WHILE [state], the system SHALL [response]`
3. **Unwanted behavior（望まない動作）**: `IF [error], THEN the system SHALL [response]`
4. **Optional features（オプション機能）**: `WHERE [feature enabled], the system SHALL [response]`
5. **Ubiquitous（普遍的）**: `The system SHALL [requirement]`

### 2. プロジェクトメモリ（Steering）

**Steering**は、プロジェクトの「記憶」です。すべての専門エージェントがこれを参照することで、一貫性のある開発を実現します。

```
steering/
├── product.md      # ビジネスコンテキスト、ユーザー、目的
├── structure.md    # アーキテクチャパターン、ディレクトリ構造
└── tech.md         # 技術スタック、ライブラリ、開発ツール
```

### 3. 憲法ガバナンス（9条項）

MUSUBIは**9つの不変憲法条項**で品質を保証します。

```
Article I:   ライブラリファースト（lib/から始める）
Article II:  CLIインターフェース義務（すべてCLI実行可能）
Article III: テストファースト（RED-GREEN-BLUE）
Article IV:  EARS要件形式（曖昧性排除）
Article V:   トレーサビリティ義務（100%追跡可能）
Article VI:  プロジェクトメモリ参照（Steering優先）
Article VII: シンプリシティゲート（最大3ライブラリから）
Article VIII:アンチアブストラクション（不要なラッパー禁止）
Article IX:  インテグレーションファーストテスト（実サービス使用）
```

### 4. 25の専門エージェント

MUSUBIは25の専門エージェントを提供し、**全7プラットフォーム**で利用可能です。

#### 🌟 オーケストレーション（3エージェント）- **初心者はここから！**

- **`@orchestrator`** - **複雑なタスクの自動調整（初心者推奨！）**
  - 他の24エージェントを自動的に呼び出し
  - タスクを分析して最適なワークフローを実行
  - **「タスクコメント機能を作って」だけで、要件定義→設計→実装→テストまで自動実行**
- `@steering` - プロジェクトメモリ管理
- `@constitution-enforcer` - 品質ゲート検証

#### 要件・計画（3エージェント）
- `@requirements-analyst` - EARS形式要件作成
- `@project-manager` - タスク管理、スケジューリング
- `@change-impact-analyzer` - 変更影響分析

#### 設計（4エージェント）
- `@system-architect` - システム設計、ADR
- `@api-designer` - API設計
- `@database-schema-designer` - DB設計
- `@ui-ux-designer` - UI/UX設計

#### 開発・品質（6エージェント）
- `@software-developer` - コード実装
- `@test-engineer` - テスト作成
- `@code-reviewer` - コードレビュー
- `@bug-hunter` - バグ調査
- `@quality-assurance` - QA戦略
- `@traceability-auditor` - トレーサビリティ監査

#### セキュリティ・パフォーマンス（2エージェント）
- `@security-auditor` - セキュリティ監査
- `@performance-optimizer` - パフォーマンス最適化

#### インフラ・運用（5エージェント）
- `@devops-engineer` - CI/CD
- `@cloud-architect` - クラウド設計
- `@database-administrator` - DB運用
- `@site-reliability-engineer` - 本番監視
- `@release-coordinator` - リリース管理

#### ドキュメント・専門（2エージェント）
- `@technical-writer` - 技術文書作成
- `@ai-ml-engineer` - ML開発

## 実践！MUSUBIで始めるSDD

それでは、実際にMUSUBIを使ってプロジェクトを進めてみましょう。

### 前提条件

- Node.js 18以上
- 任意のAIコーディングエージェント（Claude Code、GitHub Copilot、Cursor など）

### ステップ1: MUSUBIのインストール

```bash
# npx経由（推奨）
npx musubi-sdd init --claude      # Claude Code使用の場合
npx musubi-sdd init --copilot     # GitHub Copilot使用の場合
npx musubi-sdd init --cursor      # Cursor使用の場合

# またはグローバルインストール
npm install -g musubi-sdd
musubi init --claude
```

実行すると、以下のファイル・ディレクトリが作成されます。

```
your-project/
├── .claude/           # Claude Code Skills（Claude Code使用の場合）
│   └── skills/        # 25個のスキル定義
├── .github/           # GitHub Copilot Agents（Copilot使用の場合）
│   └── agents/        # 25個のエージェント定義
├── steering/          # プロジェクトメモリ（全エージェント共通）
│   ├── product.md
│   ├── structure.md
│   └── tech.md
└── steering/
    ├── rules/
    │   ├── workflow.md           # 8段階SDDワークフロー
    │   ├── ears-format.md        # EARS要件記述ガイド
    │   └── agent-validation-checklist.md
    └── templates/
        ├── requirements.md
        ├── design.md
        ├── tasks.md
        └── research.md
```

### ステップ2: プロジェクトメモリの生成

MUSUBIの最初のステップは、プロジェクトの「記憶」を作ることです。

#### 🎯 初心者向け（orchestrator使用）

**Claude Code の場合**:
```
あなた: @orchestrator このプロジェクトの初期設定をお願いします。タスク管理SaaSを開発予定です。
```

**GitHub Copilot / Cursor の場合**:
```
あなた: @orchestrator このプロジェクトの初期設定をお願いします。タスク管理SaaSを開発予定です。
```

Orchestratorが自動的に:
1. `@steering` を呼び出してプロジェクトメモリを生成
2. 技術スタックの推奨を提示
3. ディレクトリ構造の提案

#### 💡 上級者向け（直接呼び出し）

```
あなた: @steering このプロジェクトのコンテキストを分析して、ステアリングファイルを生成してください
```

Steeringエージェントが既存コード（あれば）を分析し、以下を自動生成します。

```markdown
# steering/product.md
## プロジェクト概要
タスク管理SaaS「TaskMaster」の開発

## ユーザー
- 小規模チーム（5-20人）
- リモートワーク中心
- 非エンジニア含む

## 主要機能
1. タスク作成・編集
2. チーム間共有
3. 進捗可視化
4. Slack統合
```

```markdown
# steering/tech.md
## 技術スタック
- Frontend: Next.js 14 (App Router)
- Backend: Next.js API Routes
- Database: PostgreSQL (Supabase)
- Auth: NextAuth.js
- Deployment: Vercel
```

```markdown
# steering/structure.md
## アーキテクチャパターン
Clean Architecture + Repository Pattern

## ディレクトリ構造
lib/               # ビジネスロジック（フレームワーク非依存）
  ├── tasks/       # タスク管理ドメイン
  ├── users/       # ユーザー管理ドメイン
  └── shared/      # 共通ユーティリティ

app/               # Next.js App Router
  ├── tasks/       # タスクページ
  └── api/         # API Routes

test/              # テストコード
```

**重要**: これ以降、すべてのエージェントが自動的にこのSteeringを参照します。

### ステップ3: 機能開発（orchestratorに全部任せる）

新機能「タスクへのコメント機能」を追加するとしましょう。

#### 🎯 初心者向け（orchestrator使用）- **推奨！**

**たった1つのコマンドで全工程を自動実行**:

```
あなた: @orchestrator タスクにコメント機能を追加したいです。ユーザーがコメントを投稿・編集・削除できるようにしてください。
```

Orchestratorが自動的に:

1. **要件分析**: `@requirements-analyst` を呼び出してEARS形式要件を作成
2. **設計**: `@system-architect` を呼び出してC4モデル + ADR設計
3. **タスク分解**: `@project-manager` を呼び出して実装タスクリスト作成
4. **実装計画**: `@software-developer` にテストファーストの実装手順を指示
5. **品質確認**: `@constitution-enforcer` で憲法準拠チェック
6. **進捗報告**: 各ステップの完了を報告

**あなたがやること**: orchestratorの質問に答えるだけ！

```
Orchestrator: コメント機能について確認します。以下の要件でよろしいですか？

1. コメント投稿（ユーザー情報・タイムスタンプ自動記録）
2. コメント一覧表示（新しい順）
3. コメント編集（投稿者のみ、編集履歴記録）
4. コメント削除（ソフトデリート）
5. エラーハンドリング（ネットワークエラー時リトライ）

あなた: はい、それで大丈夫です。

Orchestrator: 了解しました。要件定義から順番に進めます...
[Requirements Analyst を起動]
[System Architect を起動]
[Project Manager を起動]
...
```

#### 💡 上級者向け（個別エージェント呼び出し）

各ステップを個別にコントロールしたい場合:

```
あなた: @requirements-analyst タスクへのコメント機能の要件を作成してください
```

Requirements Analystエージェントが対話的に要件を作成します。

```markdown
# docs/requirements/task-comments.md

## REQ-COMMENT-001: コメント投稿
WHEN ユーザーがタスク詳細画面でコメントを入力してSubmitボタンを押す場合、
THEN システムSHALLコメントをデータベースに保存する
AND システムSHALL投稿日時とユーザー情報を記録する
AND システムSHALLコメント一覧に即座に表示する
AND システムSHALLタスクの更新通知をチームメンバーに送信する

## REQ-COMMENT-002: コメント表示
WHEN ユーザーがタスク詳細画面を開く場合、
THEN システムSHALLすべてのコメントを新しい順に表示する
AND システムSHALL各コメントに投稿者名とアバターを表示する
AND システムSHALL投稿日時を相対時間（"2時間前"）で表示する

## REQ-COMMENT-003: コメント編集
WHEN コメント投稿者が自分のコメントの編集アイコンをクリックする場合、
THEN システムSHALLコメント編集フォームを表示する
AND システムSHALL現在のコメント内容をフォームにプリフィルする

WHEN 編集後にSaveボタンを押す場合、
THEN システムSHALLコメントを更新する
AND システムSHALL編集履歴に記録する（"edited 1 hour ago"）

## REQ-COMMENT-004: コメント削除
WHEN コメント投稿者が自分のコメントの削除アイコンをクリックする場合、
THEN システムSHALL確認ダイアログを表示する

WHEN ユーザーが削除を確認する場合、
THEN システムSHALLコメントをソフトデリートする
AND システムSHALLコメント一覧から削除されたコメントを非表示にする

## REQ-COMMENT-005: エラーハンドリング
IF ネットワークエラーでコメント投稿が失敗する場合、
THEN システムSHALLエラーメッセージを表示する
AND システムSHALLユーザーの入力内容を保持する
AND システムSHALLリトライボタンを表示する

## 受け入れ基準
- [ ] すべての要件がEARS形式
- [ ] 各要件がテスト可能
- [ ] エラーケースを網羅
- [ ] ステアリング（技術スタック）に準拠
```

#### Orchestratorの実行結果

Orchestratorが自動的に各専門エージェントを呼び出し、以下のドキュメントを生成します:

**1. 要件定義** (`docs/requirements/task-comments.md`):

Requirements Analystエージェントが生成した要件ドキュメント（上記参照）

**2. 設計** (`docs/design/task-comments.md`):

Orchestratorが `@system-architect` を自動起動し、設計ドキュメントを作成:

```markdown
# docs/design/task-comments.md

## アーキテクチャ概要（C4 Context）

┌──────────────────────────────────────────┐
│ TaskMaster System                        │
│                                          │
│  ┌────────────────┐  ┌────────────────┐  │
│  │ Task Comments  │→ │ Notification   │  │
│  │ Feature        │  │ Service        │  │
│  └────────────────┘  └────────────────┘  │
│         ↓                                │
│  ┌────────────────┐                      │
│  │ PostgreSQL     │                      │
│  └────────────────┘                      │
└──────────────────────────────────────────┘
         ↓
    [Slack API]

## コンポーネント設計（C4 Component）

### Frontend Components
- `CommentList` - コメント一覧表示（REQ-COMMENT-002）
- `CommentForm` - コメント投稿フォーム（REQ-COMMENT-001）
- `CommentItem` - 個別コメント表示・編集・削除（REQ-COMMENT-003, 004）

### Backend API
- `POST /api/tasks/:taskId/comments` - コメント投稿（REQ-COMMENT-001）
- `GET /api/tasks/:taskId/comments` - コメント取得（REQ-COMMENT-002）
- `PATCH /api/comments/:commentId` - コメント編集（REQ-COMMENT-003）
- `DELETE /api/comments/:commentId` - コメント削除（REQ-COMMENT-004）

### Database Schema
\`\`\`sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,  -- ソフトデリート
  edit_history JSONB        -- 編集履歴
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
\`\`\`

## ADR（Architecture Decision Record）

### ADR-001: ソフトデリート方式の採用

**Status**: Accepted

**Context**:
コメント削除時、物理削除（DELETE）かソフトデリート（deleted_atフラグ）か選択が必要。

**Decision**:
ソフトデリート方式を採用する。

**Rationale**:
1. 監査要件: 削除履歴の追跡が必要
2. 復元可能性: 誤削除からの復旧が可能
3. 関連データ保護: 削除コメントへの返信などを保持

**Consequences**:
- Positive: データ復元可能、監査対応
- Negative: クエリに`WHERE deleted_at IS NULL`が必要

## 要件トレーサビリティマトリックス

| 要件ID | 設計コンポーネント | 実装ファイル（予定） |
|--------|------------------|-------------------|
| REQ-COMMENT-001 | POST /api/tasks/:taskId/comments | lib/comments/repository.ts |
| REQ-COMMENT-002 | GET /api/tasks/:taskId/comments | lib/comments/repository.ts |
| REQ-COMMENT-003 | PATCH /api/comments/:commentId | lib/comments/repository.ts |
| REQ-COMMENT-004 | DELETE /api/comments/:commentId | lib/comments/repository.ts |
| REQ-COMMENT-005 | Error boundary in CommentForm | app/components/CommentForm.tsx |
```

### ステップ5: タスク分解

設計ができたら、実装タスクに分解します。

#### Claude Code の場合

```
あなた: /sdd-tasks task-comments
```

#### GitHub Copilot / Cursor の場合

```
あなた: @project-manager design/task-comments.md に基づいてタスクを作成してください
```

Project Managerエージェントがタスクリストを作成します。

``````markdown
# docs/tasks/task-comments.md

## タスク一覧

### Phase 1: Database & API（2-3日）

#### Task 1.1: Database Migration
- [ ] comments テーブル作成（REQ-COMMENT-001, 002, 003, 004）
- [ ] インデックス追加
- [ ] マイグレーションファイル作成
- **担当**: Backend Developer
- **期限**: Day 1
- **依存**: なし

#### Task 1.2: Comment Repository
- [ ] `lib/comments/repository.ts` 作成（Article I: Library First）
- [ ] `createComment()` 実装（REQ-COMMENT-001）
- [ ] `getCommentsByTaskId()` 実装（REQ-COMMENT-002）
- [ ] `updateComment()` 実装（REQ-COMMENT-003）
- [ ] `softDeleteComment()` 実装（REQ-COMMENT-004）
- [ ] CLI インターフェース作成（Article II）
- **担当**: Backend Developer
- **期限**: Day 1-2
- **依存**: Task 1.1

#### Task 1.3: Comment Repository Tests
- [ ] テストファイル `lib/comments/repository.test.ts` 作成
- [ ] REQ-COMMENT-001 のテスト（コメント投稿）
- [ ] REQ-COMMENT-002 のテスト（コメント取得）
- [ ] REQ-COMMENT-003 のテスト（コメント編集）
- [ ] REQ-COMMENT-004 のテスト（コメント削除）
- [ ] カバレッジ80%以上確認（Article III）
- **担当**: Backend Developer
- **期限**: Day 2
- **依存**: Task 1.2

#### Task 1.4: API Routes
- [ ] `app/api/tasks/[taskId]/comments/route.ts` 作成
- [ ] POST handler（REQ-COMMENT-001）
- [ ] GET handler（REQ-COMMENT-002）
- [ ] `app/api/comments/[commentId]/route.ts` 作成
- [ ] PATCH handler（REQ-COMMENT-003）
- [ ] DELETE handler（REQ-COMMENT-004）
- [ ] エラーハンドリング（REQ-COMMENT-005）
- **担当**: Backend Developer
- **期限**: Day 2-3
- **依存**: Task 1.2

### Phase 2: Frontend Components（3-4日）

#### Task 2.1: CommentForm Component
- [ ] `app/components/CommentForm.tsx` 作成
- [ ] フォーム UI（REQ-COMMENT-001）
- [ ] バリデーション
- [ ] エラー表示（REQ-COMMENT-005）
- [ ] リトライロジック
- **担当**: Frontend Developer
- **期限**: Day 3-4
- **依存**: Task 1.4

#### Task 2.2: CommentList Component
- [ ] `app/components/CommentList.tsx` 作成
- [ ] コメント一覧表示（REQ-COMMENT-002）
- [ ] 新しい順ソート
- [ ] ローディング状態
- **担当**: Frontend Developer
- **期限**: Day 4
- **依存**: Task 1.4

#### Task 2.3: CommentItem Component
- [ ] `app/components/CommentItem.tsx` 作成
- [ ] コメント表示（投稿者、時間）
- [ ] 編集ボタン（REQ-COMMENT-003）
- [ ] 削除ボタン（REQ-COMMENT-004）
- [ ] 編集フォーム切り替え
- [ ] 削除確認ダイアログ
- **担当**: Frontend Developer
- **期限**: Day 5
- **依存**: Task 2.2

#### Task 2.4: Frontend Tests
- [ ] `app/components/CommentForm.test.tsx`
- [ ] `app/components/CommentList.test.tsx`
- [ ] `app/components/CommentItem.test.tsx`
- [ ] カバレッジ80%以上確認
- **担当**: Frontend Developer
- **期限**: Day 6
- **依存**: Task 2.1, 2.2, 2.3

### Phase 3: Integration & Testing（1-2日）

#### Task 3.1: Integration Tests
- [ ] E2E テスト作成
- [ ] 全要件のテストケース実行
- [ ] トレーサビリティマトリックス更新
- **担当**: QA Engineer
- **期限**: Day 7
- **依存**: Task 2.4

#### Task 3.2: Documentation
- [ ] API ドキュメント作成
- [ ] ユーザーガイド更新
- **担当**: Technical Writer
- **期限**: Day 7
- **依存**: Task 3.1

## 要件カバレッジマトリックス

| 要件ID | フェーズ | タスク | 実装ファイル | テストファイル | ステータス |
|--------|---------|--------|-------------|--------------|-----------|
| REQ-COMMENT-001 | Phase 1 | Task 1.2, 1.4 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-002 | Phase 1 | Task 1.2, 1.4 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-003 | Phase 1, 2 | Task 1.2, 1.4, 2.3 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-004 | Phase 1, 2 | Task 1.2, 1.4, 2.3 | lib/comments/repository.ts | lib/comments/repository.test.ts | ⏳ |
| REQ-COMMENT-005 | Phase 2 | Task 2.1 | app/components/CommentForm.tsx | app/components/CommentForm.test.tsx | ⏳ |

## スケジュール

```
Day 1-2:  Backend（DB + Repository）
Day 3-6:  Frontend Components
Day 7:    Integration & Docs
Total:    7日（1週間）
```
``````

### ステップ4: 実装（orchestratorが続けてサポート）

Orchestrator がタスクリストを確認し、自動的に実装を開始します:

```
Orchestrator: タスクリストを確認しました。Phase 1から実装を開始します。
テストファーストで進めます（Article III準拠）。

[Task 1.2 実装中]
✓ @test-engineer がテストを設計中...
✓ @software-developer がRED-GREEN-REFACTOR実装中...
✓ @code-reviewer がコードレビュー中...
✓ @constitution-enforcer が憲法チェック中...

Task 1.2 完了。次のタスクに進みます。
```

**💡 上級者向けTips**: 個別タスクを指定することもできます。  
例: `@software-developer Task 2.1のみ実装してください`

生成されたテストコード例:

```typescript
// lib/comments/repository.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { createComment, getCommentsByTaskId, updateComment, softDeleteComment } from './repository';
import { testDb } from '@/test/helpers/db';

describe('Comment Repository', () => {
  beforeEach(async () => {
    await testDb.clean(); // テスト用DBクリーンアップ
  });

  // REQ-COMMENT-001: コメント投稿
  describe('createComment', () => {
    it('should create a new comment with user info and timestamp', async () => {
      // GIVEN
      const taskId = 'task-123';
      const userId = 'user-456';
      const content = 'これは素晴らしいタスクです！';

      // WHEN
      const comment = await createComment({ taskId, userId, content });

      // THEN
      expect(comment).toMatchObject({
        id: expect.any(String),
        taskId,
        userId,
        content,
        createdAt: expect.any(Date),
        updatedAt: null,
        deletedAt: null,
      });
    });

    it('should throw error when content is empty', async () => {
      await expect(
        createComment({ taskId: 'task-123', userId: 'user-456', content: '' })
      ).rejects.toThrow('Content cannot be empty');
    });
  });

  // REQ-COMMENT-002: コメント取得
  describe('getCommentsByTaskId', () => {
    it('should return comments in descending order by created_at', async () => {
      // GIVEN
      const taskId = 'task-123';
      await createComment({ taskId, userId: 'user-1', content: 'First comment' });
      await createComment({ taskId, userId: 'user-2', content: 'Second comment' });
      await createComment({ taskId, userId: 'user-3', content: 'Third comment' });

      // WHEN
      const comments = await getCommentsByTaskId(taskId);

      // THEN
      expect(comments).toHaveLength(3);
      expect(comments[0].content).toBe('Third comment'); // 新しい順
      expect(comments[2].content).toBe('First comment');
    });

    it('should not return soft-deleted comments', async () => {
      // GIVEN
      const taskId = 'task-123';
      const comment = await createComment({ taskId, userId: 'user-1', content: 'Will be deleted' });
      await softDeleteComment(comment.id);

      // WHEN
      const comments = await getCommentsByTaskId(taskId);

      // THEN
      expect(comments).toHaveLength(0);
    });
  });

  // REQ-COMMENT-003: コメント編集
  describe('updateComment', () => {
    it('should update comment content and set updated_at', async () => {
      // GIVEN
      const comment = await createComment({
        taskId: 'task-123',
        userId: 'user-1',
        content: 'Original content',
      });

      // WHEN
      const updated = await updateComment(comment.id, { content: 'Updated content' });

      // THEN
      expect(updated.content).toBe('Updated content');
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect(updated.editHistory).toContainEqual({
        content: 'Original content',
        editedAt: expect.any(Date),
      });
    });
  });

  // REQ-COMMENT-004: コメント削除
  describe('softDeleteComment', () => {
    it('should set deleted_at timestamp', async () => {
      // GIVEN
      const comment = await createComment({
        taskId: 'task-123',
        userId: 'user-1',
        content: 'Will be deleted',
      });

      // WHEN
      const deleted = await softDeleteComment(comment.id);

      // THEN
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });
  });
});
```

#### Task 1.2: Repository Implementation（RED → GREEN）

まずテストを実行（RED）：

```bash
npm test lib/comments/repository.test.ts
# ❌ すべて失敗（まだ実装してないので当然）
```

次に実装（GREEN）：

```typescript
// lib/comments/repository.ts

import { db } from '@/lib/database/client';
import type { Comment, CreateCommentInput, UpdateCommentInput } from './types';

/**
 * Article I: Library First
 * フレームワーク非依存のビジネスロジック
 */

// REQ-COMMENT-001: コメント投稿
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  if (!input.content.trim()) {
    throw new Error('Content cannot be empty');
  }

  const [comment] = await db
    .insert('comments')
    .values({
      taskId: input.taskId,
      userId: input.userId,
      content: input.content,
      createdAt: new Date(),
    })
    .returning('*');

  return comment;
}

// REQ-COMMENT-002: コメント取得
export async function getCommentsByTaskId(taskId: string): Promise<Comment[]> {
  return db
    .select('*')
    .from('comments')
    .where('taskId', taskId)
    .whereNull('deletedAt') // ソフトデリート済みを除外
    .orderBy('createdAt', 'desc'); // 新しい順
}

// REQ-COMMENT-003: コメント編集
export async function updateComment(
  commentId: string,
  input: UpdateCommentInput
): Promise<Comment> {
  const [existing] = await db.select('*').from('comments').where('id', commentId);

  const editHistory = existing.editHistory || [];
  editHistory.push({
    content: existing.content,
    editedAt: new Date(),
  });

  const [updated] = await db
    .update('comments')
    .set({
      content: input.content,
      updatedAt: new Date(),
      editHistory,
    })
    .where('id', commentId)
    .returning('*');

  return updated;
}

// REQ-COMMENT-004: コメント削除（ソフトデリート）
export async function softDeleteComment(commentId: string): Promise<Comment> {
  const [deleted] = await db
    .update('comments')
    .set({ deletedAt: new Date() })
    .where('id', commentId)
    .returning('*');

  return deleted;
}
```

Article IIに従い、CLIインターフェースも作成：

```typescript
// lib/comments/cli.ts

import { createComment, getCommentsByTaskId } from './repository';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      const taskId = process.argv[3];
      const userId = process.argv[4];
      const content = process.argv[5];
      const comment = await createComment({ taskId, userId, content });
      console.log('Created:', comment);
      break;

    case 'list':
      const task = process.argv[3];
      const comments = await getCommentsByTaskId(task);
      console.log('Comments:', comments);
      break;

    default:
      console.log('Usage: node cli.ts [create|list] <args>');
  }
}

main();
```

再度テスト実行（GREEN）：

```bash
npm test lib/comments/repository.test.ts
# ✅ All tests passed! (14/14)
# Coverage: 85%
```

#### 憲法検証

実装後、constitution-enforcerで憲法準拠を確認：

```
あなた: @constitution-enforcer lib/comments/ を検証してください
```

```
✅ Article I (Library First): lib/comments/repository.ts - フレームワーク依存なし
✅ Article II (CLI Interface): lib/comments/cli.ts - CLI実行可能
✅ Article III (Test First): lib/comments/repository.test.ts - カバレッジ85%
✅ Article V (Traceability): 全要件がテストに対応
✅ Article VI (Project Memory): steering/tech.md の技術スタックに準拠
```

### ステップ7: フロントエンド実装

同様にフロントエンドもテストファーストで実装します。

```typescript
// app/components/CommentForm.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from './CommentForm';
import { createComment } from '@/lib/comments/repository';

jest.mock('@/lib/comments/repository');

describe('CommentForm', () => {
  // REQ-COMMENT-001: コメント投稿
  it('should submit comment when form is valid', async () => {
    render(<CommentForm taskId="task-123" />);

    const textarea = screen.getByPlaceholderText('コメントを入力...');
    const submitButton = screen.getByRole('button', { name: '投稿' });

    fireEvent.change(textarea, { target: { value: '素晴らしいタスクです！' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith({
        taskId: 'task-123',
        userId: expect.any(String),
        content: '素晴らしいタスクです！',
      });
    });
  });

  // REQ-COMMENT-005: エラーハンドリング
  it('should show error message and retry button when submission fails', async () => {
    (createComment as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<CommentForm taskId="task-123" />);

    const textarea = screen.getByPlaceholderText('コメントを入力...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(screen.getByRole('button', { name: '投稿' }));

    await waitFor(() => {
      expect(screen.getByText('コメントの投稿に失敗しました')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'リトライ' })).toBeInTheDocument();
      expect(textarea).toHaveValue('Test comment'); // 入力内容保持
    });
  });
});
```

実装：

```tsx
// app/components/CommentForm.tsx

'use client';

import { useState } from 'react';
import { createComment } from '@/lib/comments/repository';

export function CommentForm({ taskId }: { taskId: string }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createComment({
        taskId,
        userId: 'current-user-id', // 実際は認証から取得
        content,
      });
      setContent(''); // 成功時のみクリア
    } catch (err) {
      setError('コメントの投稿に失敗しました'); // REQ-COMMENT-005
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="コメントを入力..."
        className="w-full p-3 border rounded-lg"
        rows={3}
      />

      {error && (
        <div className="text-red-600 text-sm">
          {error}
          <button
            type="button"
            onClick={handleSubmit}
            className="ml-2 underline"
          >
            リトライ
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? '投稿中...' : '投稿'}
      </button>
    </form>
  );
}
```

#### Orchestratorによる品質確認

Orchestrator は実装完了を検知し、自動的に品質チェックを開始します:

```
Orchestrator: task-comments機能の実装を検出しました。品質チェックを開始します。

[自動実行中]
✓ @traceability-auditor によるトレーサビリティ監査...
✓ @code-reviewer によるコードレビュー...
✓ @security-auditor によるセキュリティチェック...
✓ @constitution-enforcer による憲法準拠確認...

すべてのチェックが完了しました。結果を以下に示します。
```

**💡 上級者向けTips**: 個別エージェントを直接呼び出すこともできます。  
例: `@traceability-auditor task-commentsの要件カバレッジを確認してください`

生成されたトレーサビリティ監査レポート:

```markdown
# トレーサビリティ監査レポート: task-comments

## 要件カバレッジ: 100% ✅

| 要件ID | 要件概要 | 設計 | 実装 | テスト | ステータス |
|--------|---------|------|------|--------|-----------|
| REQ-COMMENT-001 | コメント投稿 | Design Section 3.2 | lib/comments/repository.ts:L15 | repository.test.ts:L12 | ✅ |
| REQ-COMMENT-002 | コメント表示 | Design Section 3.2 | lib/comments/repository.ts:L32 | repository.test.ts:L35 | ✅ |
| REQ-COMMENT-003 | コメント編集 | Design Section 3.2 | lib/comments/repository.ts:L45 | repository.test.ts:L58 | ✅ |
| REQ-COMMENT-004 | コメント削除 | Design Section 3.2 | lib/comments/repository.ts:L68 | repository.test.ts:L78 | ✅ |
| REQ-COMMENT-005 | エラーハンドリング | Design Section 3.3 | app/components/CommentForm.tsx:L25 | CommentForm.test.tsx:L45 | ✅ |

## テストカバレッジ: 87% ✅

- Backend: 92%
- Frontend: 81%
- Overall: 87% (目標80%以上達成)

## 憲法準拠: 9/9 ✅

- Article I (Library First): ✅
- Article II (CLI Interface): ✅
- Article III (Test First): ✅
- Article IV (EARS Format): ✅
- Article V (Traceability): ✅
- Article VI (Project Memory): ✅
- Article VII (Simplicity): ✅
- Article VIII (Anti-Abstraction): ✅
- Article IX (Integration First): ✅

## 推奨事項

すべての品質ゲートをパスしています。デプロイ可能です。
```

### ステップ6: デプロイ準備（orchestratorが完結）

#### Orchestratorによるデプロイ準備

Orchestrator は品質チェック完了後、自動的にデプロイ準備を開始します:

```
Orchestrator: 品質チェックをすべてクリアしました。デプロイ準備を開始します。

[自動実行中]
✓ @devops-engineer によるCI/CDパイプライン作成...
✓ @technical-writer によるデプロイメントドキュメント作成...
✓ @site-reliability-engineer による本番監視設定...

デプロイ準備が完了しました。以下のファイルが生成されています。
```

**💡 上級者向けTips**: 個別エージェントで詳細設定も可能です。  
例: `@devops-engineer カスタムCI/CD設定を作成してください`

生成されたCI/CDパイプライン:

```
あなた: @devops-engineer task-comments機能のCI/CDパイプラインを設定してください
```

```yaml
# .github/workflows/task-comments.yml

name: Task Comments CI/CD

on:
  pull_request:
    paths:
      - 'lib/comments/**'
      - 'app/components/Comment*'
      - 'app/api/tasks/*/comments/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- lib/comments app/components/Comment
      
      - name: Check coverage
        run: npm run test:coverage -- --threshold=80
      
      - name: Constitutional validation
        run: npx musubi validate

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Vibe Coding vs SDD の結果比較

同じ「タスクコメント機能」を2つのアプローチで開発した結果：

### ❌ Vibe Coding（GitHub Copilot単体）

```
開発時間: 3日
コード行数: 500行
テストカバレッジ: 45%
バグ（本番）: 8件
  - コメント削除でタスクごと消える
  - 編集履歴が記録されない
  - エラー時にフォーム内容が消える
  - パフォーマンス問題（N+1クエリ）

ドキュメント: なし
トレーサビリティ: 0%
リファクタリング難易度: 高（なぜこうなったか不明）
```

### ✅ SDD with MUSUBI

```
開発時間: 7日（設計・テスト含む）
コード行数: 800行（テスト含む）
テストカバレッジ: 87%
バグ（本番）: 0件
  - すべての要件がテスト済み
  - エッジケース網羅
  - エラーハンドリング完璧

ドキュメント: 完璧（要件、設計、ADR、トレーサビリティマトリックス）
トレーサビリティ: 100%
リファクタリング難易度: 低（すべてが追跡可能）
```

**結論**: 初期投資（+4日）で、長期的な品質・保守性が圧倒的に向上

## ブラウンフィールドプロジェクト（既存コードへの機能追加）

既存プロジェクトにMUSUBIを導入する場合は、Delta Specs（差分仕様）を使用します。

### ステップ1: 既存コードでMUSUBI初期化

```bash
cd existing-project
npx musubi-sdd init --claude
```

### ステップ2: 既存コード分析

```
あなた: @steering 既存のコードベースを分析して、ステアリングファイルを生成してください
```

Steeringエージェントが既存コードを分析し、現在のアーキテクチャ、技術スタック、構造を自動抽出します。

### ステップ3: 変更影響分析

新機能「二要素認証（2FA）」を追加するとします。

```
あなた: @change-impact-analyzer 二要素認証機能の追加による影響を分析してください
```

Change Impact Analyzerが分析レポートを生成：

```markdown
# 変更影響分析: 二要素認証（2FA）

## ADDED（新規追加）

### 要件
- REQ-2FA-001: TOTP生成・検証
- REQ-2FA-002: QRコード表示
- REQ-2FA-003: バックアップコード生成

### ファイル
- lib/auth/totp.ts（新規）
- lib/auth/backup-codes.ts（新規）
- app/settings/security/page.tsx（新規）

## MODIFIED（変更）

### 要件
- REQ-AUTH-001: ログイン処理に2FA検証ステップ追加

### ファイル
- lib/auth/login.ts（2FA検証追加）
- app/login/page.tsx（2FA入力フォーム追加）
- database/schema.sql（usersテーブルに2fa_secret列追加）

## REMOVED（削除）

なし

## 影響範囲

### 高リスク
- 既存ログインフロー変更（全ユーザーに影響）

### 中リスク
- データベーススキーマ変更（マイグレーション必要）

### 低リスク
- 新規画面追加（既存機能に影響なし）

## 推奨事項

1. 段階的ロールアウト（Feature Flag使用）
2. 既存ユーザーは2FA任意、新規ユーザーは必須
3. バックアップコード必須生成
```

### ステップ4: Delta Specs作成

```
あなた: @requirements-analyst 2FA機能の差分仕様を作成してください
```

```markdown
# Delta Specs: 二要素認証（2FA）

## ADDED Requirements

### REQ-2FA-001: TOTP有効化
WHEN ユーザーがセキュリティ設定で「2FA有効化」ボタンをクリックする場合、
THEN システムSHALL TOTPシークレットを生成する
AND システムSHALL QRコードを表示する
AND システムSHALL 6桁のバックアップコードを10個生成する

### REQ-2FA-002: TOTP検証
WHEN 2FA有効化済みユーザーがログインする場合、
THEN システムSHALLパスワード検証後に2FAコード入力を要求する
AND システムSHALLユーザー入力の6桁コードを検証する
AND システムSHALL検証成功時のみログインを許可する

## MODIFIED Requirements

### REQ-AUTH-001: ログイン処理（変更）
**Before**:
WHEN ユーザーが有効なメールアドレスとパスワードを入力する場合、
THEN システムSHALLユーザー認証を実行する

**After**:
WHEN ユーザーが有効なメールアドレスとパスワードを入力する場合、
THEN システムSHALLパスワード検証を実行する
AND IF ユーザーが2FA有効化済みの場合、THEN システムSHALL 2FA検証画面を表示する
AND IF ユーザーが2FA未有効化の場合、THEN システムSHALLログインを完了する
```

この差分仕様により、既存機能への影響を最小限に抑えながら、安全に新機能を追加できます。

## 🚀 MUSUBI v2.0: CodeGraph MCP統合でコード理解力を強化

MUSUBI v2.0では、**CodeGraph MCP Server**との統合により、AIエージェントがプロジェクト全体のコード構造を理解できるようになりました。

### 従来の課題

従来のAIコーディングアシスタントには「ファイル単位の視野」という限界がありました：

- 「この関数はどこから呼ばれている？」→ 回答不可
- 「変更の影響範囲は？」→ 推測に頼る
- 「プロジェクト全体の構造は？」→ 時間のかかる手動調査

### CodeGraph MCPで解決

CodeGraph MCP Serverは、コードベースをグラフ構造として解析し、AIエージェントに「プロジェクト全体の地図」を提供します。

#### 主な機能

| 機能 | 説明 |
|------|------|
| 🔍 **コード構造分析** | 関数、クラス、モジュールの依存関係を可視化 |
| 🧠 **GraphRAG検索** | セマンティックなコード検索（意味ベース） |
| 📊 **影響分析** | 変更の波及範囲を自動特定 |
| 🏘️ **コミュニティ検出** | モジュール境界を自動分析 |
| 🌐 **14言語対応** | Python, JS, TS, Java, Go, Rust, etc. |

### Before / After 比較

| タスク | Before (v1.x) | After (v2.0 + CodeGraph) |
|--------|---------------|--------------------------|
| 関数の影響調査 | 手動grep（見落としリスク）| `find_callers`で完全リスト |
| リファクタリング計画 | 経験と勘に依存 | `analyze_module_structure`で客観的分析 |
| 依存関係の把握 | import文を目視確認 | `find_dependencies`で深い依存も検出 |
| コードベースの理解 | ファイルを1つずつ読む | `stats`, `community`で全体把握 |

### 実践例: 影響分析の強化

```
ユーザー: @change-impact-analyzer calculatePrice関数を変更したいです。影響範囲を教えてください。

🤖 Change Impact Analyzer (CodeGraph活用):

find_callers("calculatePrice") を実行...

【直接呼び出し元】(5件)
- OrderService.createOrder() - line 45
- CartController.updateCart() - line 78
- InvoiceGenerator.generate() - line 112
- PriceValidator.validate() - line 23
- BatchProcessor.processAll() - line 89

【間接呼び出し元】(3件) ← これが今まで見落としていた部分！
- APIController.handleRequest() → OrderService → calculatePrice
- ScheduledTask.dailyReport() → BatchProcessor → calculatePrice
- WebhookHandler.onPayment() → InvoiceGenerator → calculatePrice

【テストへの影響】
- tests/unit/price.test.ts (直接テスト)
- tests/integration/order.test.ts (間接影響)
```

### セットアップ方法

```bash
# Orchestratorに依頼するだけ
@orchestrator CodeGraph MCP を設定してください
```

Orchestratorが自動的に：
1. ✅ Python環境確認
2. ✅ CodeGraph MCP Serverインストール
3. ✅ プロジェクトのインデックス作成
4. ✅ 設定ファイル生成

詳細は [MUSUBI × CodeGraph MCP Server 統合ガイド](https://qiita.com/hisaho/items/719210ccc20fe2514054) をご覧ください。

## まとめ

### Vibe Coding vs SDD with MUSUBI

| 項目 | Vibe Coding | SDD with MUSUBI |
|------|------------|-----------------|
| **開発速度（短期）** | 速い（3日） | やや遅い（7日、設計含む） |
| **品質** | 不安定 | 安定（憲法保証） |
| **テストカバレッジ** | 低い（~50%） | 高い（80%以上） |
| **バグ発生率** | 高い | 低い |
| **ドキュメント** | なし | 完璧 |
| **トレーサビリティ** | なし | 100% |
| **保守性** | 低い | 高い |
| **変更容易性** | 困難 | 容易（影響分析あり） |
| **長期コスト** | 高い（技術的負債） | 低い |

### MUSUBIを使うべきケース

✅ **強く推奨**:
- プロダクション環境で動くシステム
- チーム開発（トレーサビリティ必須）
- 長期運用予定のプロジェクト
- 規制対応が必要（監査、セキュリティ）
- 変更頻度が高いプロジェクト

△ **任意**:
- 個人的な実験・学習プロジェクト
- 使い捨てプロトタイプ
- 極端に短期間のPoC

### Orchestratorを使うメリット

🎯 **初心者でも安心**:
- **1つのコマンドだけ覚えればOK**: `@orchestrator [やりたいこと]`
- **25エージェントを覚える必要なし**: Orchestratorが自動選択
- **質問形式で進む**: 必要なことだけ聞いてくれる
- **失敗しにくい**: ベストプラクティスを自動適用

🚀 **効率的な開発**:
- **並行実行**: 複数エージェントを同時起動
- **自動依存解決**: 必要なエージェントを自動判断
- **進捗管理**: 全体の流れを可視化
- **エラーハンドリング**: 問題を自動検知・修正提案

📚 **学習にも最適**:
- **SDDの流れを体験**: 要件→設計→実装を実際に見る
- **専門家の判断を学ぶ**: なぜそのエージェントが必要か理解できる
- **段階的に深く**: 最初はお任せ、慣れたら個別操作へ

### 次のステップ

#### 🎯 初心者の方へ

1. **MUSUBIをインストール**
   ```bash
   npx musubi-sdd init --claude  # あなたのエージェントを選択
   ```

2. **まずは @orchestrator だけ覚える**
   ```
   @orchestrator [やりたいこと]を実装してください
   ```
   - 他の24エージェントは覚えなくてOK
   - Orchestratorが自動的に適切なエージェントを呼び出します

3. **小さな機能から始める**
   - 既存プロジェクトなら、次の小さな機能追加でMUSUBIを試す
   - 新規プロジェクトなら、コア機能1つから始める
   - **例**: `@orchestrator ログイン機能を作ってください`

4. **orchestratorの質問に答える**
   - Orchestratorが要件を確認してくれます
   - Yes/Noや簡単な説明を返すだけでOK

#### 💡 慣れてきたら

5. **個別エージェントを使ってみる**
   - 要件だけ先に作りたい → `@requirements-analyst`
   - 設計だけレビューしてほしい → `@system-architect`
   - セキュリティだけチェック → `@security-auditor`

6. **SDDワークフローに慣れる**
   - 要件 → 設計 → 実装 → テスト の流れを体験
   - 最初は時間がかかるが、2-3回で慣れる

7. **チーム展開**
   - 個人で成功したら、チームに共有
   - Steeringでプロジェクト知識を共有

## リソース

- **MUSUBI npm**: https://www.npmjs.com/package/musubi-sdd
- **GitHub Repository**: https://github.com/nahisaho/MUSUBI
- **Current Version**: v2.1.1（2025年6月現在）

---

**仕様駆動開発で、AIコーディングの可能性を最大限に引き出しましょう！** 🚀

---

> この記事で紹介したMUSUBIはMITライセンスのオープンソースプロジェクトです。
> コントリビューションやスター ⭐ をお待ちしています！

#SDD #SpecificationDrivenDevelopment #MUSUBI #AI #ClaudeCode #GitHubCopilot #Cursor #開発プロセス #品質保証
