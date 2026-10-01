# Product Context

## Description

Ultimate Specification Driven Development Tool with 31 Agents for 7 AI Coding Platforms + MCP Integration (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Windsurf, Codex, Qwen Code)

## Purpose

MUSUBI は、仕様駆動開発 (SDD) を通じて AI コーディングエージェントの品質と一貫性を向上させるツールです。

MUSUBI is a tool that improves the quality and consistency of AI coding agents through Specification Driven Development (SDD).

### Core Value Proposition

- **Constitutional Governance**: 9つの憲法条項による一貫した開発ガイダンス / Consistent development guidance through 9 constitutional articles
- **Review Gate Engine**: Requirements, Design, Implementation の各ゲートでの品質検証 / Quality verification at each of the Requirements, Design, and Implementation gates
- **Multi-Agent Orchestration**: Swarm, Triage, Handoff パターンによる複数エージェント協調 / Multi-agent coordination via Swarm, Triage, and Handoff patterns
- **7 Platform Support**: Claude Code, GitHub Copilot, Cursor, Gemini CLI, Windsurf, Codex, Qwen Code
- **MCP Integration**: CodeGraph MCP による高度なコード分析 / Advanced code analysis via CodeGraph MCP
- **Traceability**: 要件からテストまでの完全な追跡可能性 / Full traceability from requirements to tests

## v6.3.0 Features (New)

### SDD Document Path Unification

| Document Type | Storage Path | Purpose |
|---------------|--------------|---------|
| Requirements | `storage/specs/` | EARS format requirements |
| Design | `storage/design/` | C4 + ADR design documents |
| Tasks | `storage/tasks/` | Task breakdown documents |
| Validation | `storage/validation/` | Validation reports |

### Review Gate Engine (v6.2.0)

| Feature | Description |
|---------|-------------|
| **Requirements Gate** | EARS形式、優先度、受入基準の検証 / Validation of EARS format, priority, and acceptance criteria |
| **Design Gate** | C4モデル、ADR、コンポーネント設計の検証 / Validation of C4 model, ADRs, and component design |
| **Implementation Gate** | コード品質、テストカバレッジ、命名規則の検証 / Validation of code quality, test coverage, and naming conventions |
| **Review Prompts** | `#sdd-review-requirements`, `#sdd-review-design`, etc. |

### Workflow Dashboard

| Feature | Description |
|---------|-------------|
| **Progress Visualization** | 5ステージの進捗状況をリアルタイム表示 / Real-time display of progress across 5 stages |
| **Blocker Management** | ブロッカーの追加・解決・追跡 / Add, resolve, and track blockers |
| **Transition Recording** | ステージ間遷移の記録と分析 / Record and analyze transitions between stages |
| **Sprint Planning** | タスク優先度とベロシティ管理 / Task priority and velocity management |

### Traceability System

| Feature | Description |
|---------|-------------|
| **Auto-Extraction** | コード・テスト・コミットからID自動抽出 / Automatic ID extraction from code, tests, and commits |
| **Gap Detection** | 設計・実装・テストの欠落を検出 / Detect gaps in design, implementation, and tests |
| **Matrix Storage** | YAMLベースのトレーサビリティマトリックス / YAML-based traceability matrix |

### Enterprise Features

| Feature | Description |
|---------|-------------|
| **Error Recovery** | エラー分析と修復手順の自動生成 / Error analysis and automatic generation of remediation steps |
| **Rollback Manager** | ファイル/コミット/ステージ/スプリント単位のロールバック / Rollback at file, commit, stage, or sprint level |
| **CI Reporter** | GitHub Actions への結果レポート / Result reporting to GitHub Actions |
| **Tech Article Generator** | Qiita, Zenn, Medium, Dev.to 向け記事生成 / Article generation for Qiita, Zenn, Medium, and Dev.to |

### CLI Commands (24+)

- `musubi init` - プロジェクト初期化 / Project initialization
- `musubi requirements` - 要件生成 / Requirements generation
- `musubi design` - 設計文書生成 / Design document generation
- `musubi tasks` - タスク分解 / Task breakdown
- `musubi validate` - 憲法準拠検証 / Constitutional compliance validation
- `musubi orchestrate` - マルチエージェント実行 / Multi-agent execution
- `musubi release` - リリース管理 / Release management
- `musubi config` - 設定管理 / Configuration management
- `musubi dashboard` - ワークフローダッシュボード (v6.2.0 新規) / Workflow dashboard (new in v6.2.0)

## Target Users

### Primary Users

- **開発チーム**: AI コーディングエージェントを活用する開発チーム / Development teams: teams that leverage AI coding agents
- **アーキテクト**: 一貫した開発プラクティスを確立したいアーキテクト / Architects: architects who want to establish consistent development practices
- **エンタープライズ**: 大規模プロジェクトでの品質管理が必要な組織 / Enterprises: organizations that need quality control in large-scale projects
- **QA チーム**: トレーサビリティと品質ゲートを活用する品質保証チーム / QA teams: quality assurance teams that leverage traceability and quality gates

### Use Cases

1. **新規プロジェクト**: SDD ワークフローでプロジェクトを開始 / New projects: start a project with the SDD workflow
2. **既存プロジェクト**: 段階的に SDD プラクティスを導入 / Existing projects: adopt SDD practices incrementally
3. **モノレポ**: 複数パッケージの統合管理 / Monorepos: integrated management of multiple packages
4. **エンタープライズ**: カスタマイズ可能な Constitution レベル / Enterprise: customizable Constitution levels
5. **品質ゲート**: Review Gate Engine による段階的品質検証 / Quality gates: staged quality verification with the Review Gate Engine
6. **トレーサビリティ**: 要件からテストまでの完全な追跡 / Traceability: full tracking from requirements to tests

---

*Updated: 2026-01-02 - MUSUBI v6.3.0*
