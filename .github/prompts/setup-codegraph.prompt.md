# CodeGraph MCP Server セットアップ (CodeGraph MCP Server Setup)

CodeGraph MCP Server をインストール・設定します。
Installs and configures the CodeGraph MCP Server.

## トリガーフレーズ (Trigger Phrases)

以下のいずれかのフレーズで実行できます：
You can run this with any of the following phrases:

- `CodeGraph MCP Server をインストールして` / `Install CodeGraph MCP Server`
- `CodeGraph MCP をインストールして` / `Install CodeGraph MCP`
- `CodeGraph MCP を設定して` / `Configure CodeGraph MCP`
- `CodeGraph をセットアップして` / `Set up CodeGraph`

## 自動実行手順 (Automated Steps)

### 1. Python 環境確認 (Check Python Environment)

```bash
python3 --version
which pipx || which pip3
```

### 2. CodeGraph MCP Server インストール (Install CodeGraph MCP Server)

**pipx がある場合（推奨）:** / **If pipx is available (recommended):**

```bash
pipx install --force codegraph-mcp-server
```

**pipx がない場合（venv 使用）:** / **If pipx is not available (using venv):**

```bash
python3 -m venv ~/.codegraph-mcp
~/.codegraph-mcp/bin/pip install codegraph-mcp-server
```

### 3. プロジェクトのインデックス作成 (Index the Project)

```bash
codegraph-mcp index . --full
```

または venv の場合: / Or, if using venv:

```bash
~/.codegraph-mcp/bin/codegraph-mcp index . --full
```

### 4. VS Code MCP 設定ファイル作成 (Create the VS Code MCP Configuration File)

`.vscode/mcp.json` を作成: / Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "codegraph": {
      "command": "codegraph-mcp",
      "args": ["serve", "--repo", "${workspaceFolder}"]
    }
  }
}
```

**注意**: pipx ではなく venv を使用した場合は、`command` をフルパスに変更:
**Note**: If you used venv instead of pipx, change `command` to the full path:

```json
{
  "servers": {
    "codegraph": {
      "command": "/home/USER/.codegraph-mcp/bin/codegraph-mcp",
      "args": ["serve", "--repo", "${workspaceFolder}"]
    }
  }
}
```

### 5. 完了メッセージ (Completion Message)

設定完了後、以下を報告:
After setup is complete, report the following:

- インデックス結果（Entities, Relations, Files, Communities） / Indexing results (Entities, Relations, Files, Communities)
- 作成した設定ファイル / Configuration files created
- 利用可能な MCP ツール一覧 / List of available MCP tools

## 利用可能な CodeGraph MCP ツール (Available CodeGraph MCP Tools)

| ツール (Tool) | 説明 (Description) |
|--------|------|
| `find_dependencies` | 依存関係分析 / Dependency analysis |
| `find_callers` | 呼び出し元追跡 / Caller tracing |
| `find_callees` | 呼び出し先追跡 / Callee tracing |
| `local_search` | ローカルコンテキスト検索 / Local context search |
| `global_search` | グローバル検索 / Global search |
| `query_codebase` | 自然言語クエリ / Natural language query |
| `analyze_module_structure` | モジュール構造分析 / Module structure analysis |
| `get_code_snippet` | ソースコード取得 / Source code retrieval |
| `stats` | コードベース統計 / Codebase statistics |
| `community` | コミュニティ検出 / Community detection |

## 関連リンク (Related Links)

- [CodeGraph MCP Server GitHub](https://github.com/nahisaho/CodeGraphMCPServer)
- [MUSUBI × CodeGraph 統合ガイド (Integration Guide)](../docs/Qiita/MUSUBI-CodeGraph-MCP-Integration.md)
