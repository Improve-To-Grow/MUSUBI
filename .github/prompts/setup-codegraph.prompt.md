# CodeGraph MCP Server Setup

Install and configure the CodeGraph MCP Server.

## Trigger Phrases

You can run this with any of the following phrases:

- `Install CodeGraph MCP Server`
- `Install CodeGraph MCP`
- `Configure CodeGraph MCP`
- `Set up CodeGraph`

## Automatic Execution Steps

### 1. Check Python Environment

```bash
python3 --version
which pipx || which pip3
```

### 2. Install CodeGraph MCP Server

**If pipx is available (recommended):**

```bash
pipx install --force codegraph-mcp-server
```

**If pipx is not available (using venv):**

```bash
python3 -m venv ~/.codegraph-mcp
~/.codegraph-mcp/bin/pip install codegraph-mcp-server
```

### 3. Create the Project Index

```bash
codegraph-mcp index . --full
```

Or, when using venv:

```bash
~/.codegraph-mcp/bin/codegraph-mcp index . --full
```

### 4. Create the VS Code MCP Configuration File

Create `.vscode/mcp.json`:

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

### 5. Completion Message

After setup is complete, report the following:

- Index results (Entities, Relations, Files, Communities)
- Configuration files created
- List of available MCP tools

## Available CodeGraph MCP Tools

| Tool | Description |
|--------|------|
| `find_dependencies` | Dependency analysis |
| `find_callers` | Caller tracing |
| `find_callees` | Callee tracing |
| `local_search` | Local context search |
| `global_search` | Global search |
| `query_codebase` | Natural language query |
| `analyze_module_structure` | Module structure analysis |
| `get_code_snippet` | Source code retrieval |
| `stats` | Codebase statistics |
| `community` | Community detection |

## Related Links

- [CodeGraph MCP Server GitHub](https://github.com/nahisaho/CodeGraphMCPServer)
- [MUSUBI × CodeGraph Integration Guide](../docs/Qiita/MUSUBI-CodeGraph-MCP-Integration.md)
