# MUSUBI v2.0 × CodeGraph MCP Server - An Innovative Integration That Gives AI Agents Code Comprehension

## Introduction

The biggest challenge for AI coding assistants is "**understanding the entire codebase**." Even if they excel at the file level, grasping the overall project structure, dependencies, and scope of impact has been difficult.

**MUSUBI v2.0** solves this challenge through its integration with **CodeGraph MCP Server**. Leveraging GraphRAG (Graph Retrieval-Augmented Generation) technology, AI agents can now understand the entire codebase as a "graph."

This article introduces the new features of MUSUBI v2.0, how to configure CodeGraph MCP, and practical usage examples.

:::note info
**Related articles**
- MUSUBI details: ["MUSUBI" - The Ultimate Specification-Driven Development Tool Supporting 7 AI Agents with 25 Skills](https://qiita.com/hisaho/items/a245c2ad5adf2ab5a409) (in Japanese)
- CodeGraph MCP Server details: [CodeGraph MCP Server - Giving AI Coding Assistants Code Comprehension](https://qiita.com/hisaho/items/b99ac51d78119ef60b6b) (in Japanese)
:::

## What Is CodeGraph MCP Server?

**CodeGraph MCP Server** is a server that analyzes source code as a graph structure and provides it to AI agents via MCP (Model Context Protocol).

👉 For details, see the [CodeGraph MCP Server introduction article](https://qiita.com/hisaho/items/b99ac51d78119ef60b6b) (in Japanese).

### Key Features

| Feature | Description |
|------|------|
| 🔍 **Code structure analysis** | Visualizes dependencies among functions, classes, and modules |
| 🧠 **GraphRAG search** | Semantic code search (meaning-based) |
| 🏘️ **Community detection** | Module boundary analysis using the Louvain algorithm |
| 📊 **Impact analysis** | Automatically identifies the ripple effects of changes |
| 🌐 **14 languages supported** | Python, JavaScript, TypeScript, Java, C#, Go, Rust, Ruby, PHP, C++, HCL, etc. |

### The 14 MCP Tools Provided

```text
# Code graph operations
init_graph          - Initialize the graph
get_code_snippet    - Retrieve source code
find_callers        - Trace callers
find_callees        - Trace callees
find_dependencies   - Analyze dependencies

# Search features
local_search        - Local context search
global_search       - Global search
query_codebase      - Natural-language query

# Analysis features
analyze_module_structure  - Module structure analysis
suggest_refactoring       - Refactoring suggestions
stats                     - Codebase statistics
community                 - Community detection
```

## 🚀 What the CodeGraph Integration Newly Makes Possible

Conventional AI coding assistants had a fundamental limitation: "**they cannot understand the entire codebase**." The integration with CodeGraph MCP Server breaks through this limitation.

### Before / After Comparison

| Scenario | Before (conventional) | After (with CodeGraph) |
|----------|----------------|------------------------|
| **Investigating a function's impact** | Manual grep searches, risk of oversights | A complete list of callers via `find_callers` |
| **Refactoring planning** | Relies on experience and intuition | Objective analysis via `analyze_module_structure` |
| **Understanding dependencies** | Visually checking import statements | `find_dependencies` detects even deep dependencies |
| **Understanding the codebase** | Reading files one by one | Instantly grasp the overall structure with `stats`, `community` |
| **Finding similar code** | Relies on memory or string search | Semantic search via `local_search` |
| **Ripple effects of changes** | Proceed with "it's probably fine" | Complete analysis with `find_callers` + `find_dependencies` |

### Concrete Examples: Things That Were Impossible Before Are Now Possible

#### 1. A complete answer to "If I change this function, what will be affected?"

**Before**: grep search → visually check the hits → indirect calls get missed

**With CodeGraph**:

```text
User: I want to change the calculatePrice function. Please tell me the scope of impact.

🤖 Change Impact Analyzer:
Running find_callers("calculatePrice")...

[Direct callers] (5)
- OrderService.createOrder() - line 45
- CartController.updateCart() - line 78
- InvoiceGenerator.generate() - line 112
- PriceValidator.validate() - line 23
- BatchProcessor.processAll() - line 89

[Indirect callers] (3) ← This is the part that was previously missed
- APIController.handleRequest() → OrderService → calculatePrice
- ScheduledTask.dailyReport() → BatchProcessor → calculatePrice
- WebhookHandler.onPayment() → InvoiceGenerator → calculatePrice

[Impact on tests]
- tests/unit/price.test.ts (direct test)
- tests/integration/order.test.ts (indirect impact)
```

#### 2. An instant answer to "Tell me about this project's structure"

**Before**: Look at the directory structure → open and read files → spend hours understanding it

**With CodeGraph**:

```text
User: Please explain the structure of this project.

🤖 System Architect:
Running stats + community...

[Codebase statistics]
- Files: 105
- Entities: 1,006 (functions/classes/modules)
- Relations: 5,359 (calls/dependencies/inheritance)
- Communities: 36 (logical module groups)

[Main communities (module boundaries)]
1. Authentication & authorization (AuthService, TokenManager, PermissionChecker)
2. Order processing (OrderService, CartService, PaymentProcessor)
3. Data access (UserRepository, OrderRepository, BaseRepository)
4. API layer (Controllers, Middleware, Routes)
5. Utilities (Logger, Validator, Formatter)

[Architecture patterns]
- Layered architecture (Controller → Service → Repository)
- Uses the dependency injection pattern
- Includes event-driven asynchronous processing
```

#### 3. A comprehensive investigation of "Is there any security-risky code?"

**Before**: grep for known patterns → experience-based visual review → frequent oversights

**With CodeGraph**:

```text
User: Please identify code with security risks.

🤖 Security Auditor:
Running query_codebase("eval, exec, shell execution, SQL injection, XSS")...
Tracing the input paths to each location with find_callers...

[High risk] 🔴
1. src/utils/dynamicLoader.js:23 - uses eval()
   - Input path: API request → validateInput → dynamicLoader
   - Risk: user input can reach eval
   - Recommendation: replace with JSON.parse or vm.runInNewContext

2. src/db/queries.js:89 - SQL built by string concatenation
   - Input path: WebForm → Controller → queries
   - Risk: SQL injection vulnerability
   - Recommendation: switch to parameterized queries

[Medium risk] 🟡
3. src/views/renderer.js:45 - uses innerHTML
   - Input path: API response → sanitize → renderer
   - Risk: XSS (depends on the sanitize function's implementation)
   - Recommendation: use textContent or DOMPurify
```

#### 4. A well-grounded proposal for "Where should I implement the new feature?"

**Before**: Pore over existing code → pick a place somewhat arbitrarily → later regret that "it shouldn't have gone here"

**With CodeGraph**:

```text
User: I want to add an email notification feature. Where should I implement it?

🤖 System Architect:
Running analyze_module_structure + query_codebase("notification, email, send")...

[Existing similar features]
- src/services/NotificationService.ts - push notifications (implemented)
- src/services/SMSService.ts - SMS notifications (implemented)
- src/utils/Mailer.ts - email sending utility (low-level)

[Recommended implementation location]
📁 src/services/EmailNotificationService.ts (new file)

[Reasons]
1. Maintains consistency by following the same pattern as NotificationService and SMSService
2. Can use the existing Mailer.ts internally
3. The call path from Controllers matches the existing pattern

[Proposed implementation structure]
EmailNotificationService
  ├── implements: INotificationService (existing interface)
  ├── uses: Mailer (existing utility)
  ├── uses: TemplateEngine (existing)
  └── uses: UserRepository (to get email addresses)
```

### Why This Matters

Conventional AI assistants could only see "**the file currently open**." That is like walking around an unfamiliar city without a map.

With the CodeGraph integration, the AI now has "**a map of the entire project**":

- 🗺️ **Bird's-eye view**: Instantly know what is where
- 🔗 **Understanding relationships**: Fully trace the connections between pieces of code
- 🎯 **Accurate judgment**: Make evidence-based proposals
- ⚡ **Fast analysis**: Complete in seconds investigations that would take a human hours

## Synergy Between MUSUBI and CodeGraph

By leveraging CodeGraph MCP, MUSUBI's 25 specialized agents can perform more advanced analysis and make better proposals.

### Usage Examples per Agent

| Agent | CodeGraph usage | Effect |
|-------------|---------------|------|
| **Orchestrator** | `global_search`, `stats` | Understand the whole project, choose the optimal agent |
| **System Architect** | `analyze_module_structure`, `community` | Visualize architecture, plan refactoring |
| **Software Developer** | `get_code_snippet`, `local_search` | Quickly find related code |
| **Code Reviewer** | `find_callers`, `suggest_refactoring` | Check scope of impact, suggest improvements |
| **Test Engineer** | `find_dependencies` | Understand the dependencies of the code under test |
| **Security Auditor** | `find_callers`, `query_codebase` | Identify where vulnerable functions are used |
| **Change Impact Analyzer** | `find_dependencies`, `find_callers` | Complete analysis of change impact |
| **Bug Hunter** | `local_search`, `get_code_snippet` | Trace the root cause of bugs |

## Setup

### Option 1: Automatic Setup via the Orchestrator (Recommended)

Simply ask MUSUBI's Orchestrator, and the setup is performed automatically.

```text
User: Set up CodeGraph MCP
```

The Orchestrator automatically performs the following:

1. ✅ Check the Python environment
2. ✅ Install codegraph-mcp-server
3. ✅ Create the project index
4. ✅ Generate configuration files for your environment

### Option 2: Manual Setup

#### Step 1: Installation

```bash
# Install with pipx (recommended)
# --force also updates an existing installation to the latest version
pipx install --force codegraph-mcp-server

# Or the latest version from GitHub
pipx install --force git+https://github.com/nahisaho/CodeGraphMCPServer.git
```

#### Step 2: Index the Project

```bash
codegraph-mcp index /path/to/your/project --full
```

Example output:

```text
Full indexing...
Indexed 105 files
- Entities: 1006
- Relations: 5359
- Communities: 36
```

#### Step 3: Environment-Specific Configuration

**For Claude Code:**

```bash
claude mcp add codegraph -- codegraph-mcp serve --repo /path/to/project
```

**For VS Code (Claude Extension):**

`.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "codegraph": {
      "command": "codegraph-mcp",
      "args": ["serve", "--repo", "${workspaceFolder}"]
    }
  }
}
```

**For Claude Desktop:**

`~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "CodeGraph": {
      "command": "codegraph-mcp",
      "args": ["serve", "--repo", "/absolute/path/to/project"]
    }
  }
}
```

## Practical Usage Scenarios

### Scenario 1: Impact Analysis for a Large-Scale Refactoring

```text
User: I want to refactor the UserService class. Please tell me the scope of impact.
```

**What the Change Impact Analyzer does:**

1. Identify callers with `find_callers("UserService")`
2. Analyze dependencies with `find_dependencies("UserService")`
3. Check module boundaries with `analyze_module_structure`
4. Generate a list of affected files and functions

**Example output:**

```markdown
## Impact Analysis Report: UserService Refactoring

### Direct impact (12 files)
- src/controllers/AuthController.ts (3 locations)
- src/services/OrderService.ts (5 locations)
- src/api/routes/users.ts (2 locations)
...

### Indirect impact (8 files)
- tests/integration/auth.test.ts
- src/middleware/authMiddleware.ts
...

### Recommended actions
1. Update the AuthController mocks
2. Apply the dependency injection pattern to OrderService
3. Update the integration tests
```

### Scenario 2: Investigating the Impact of a Security Vulnerability

```text
User: Identify every place that uses the eval() function and assess the security risk.
```

**What the Security Auditor does:**

1. Search for usages with `query_codebase("eval function usage")`
2. Trace the input path to each location with `find_callers`
3. Analyze whether user input can reach them
4. Generate risk levels and remediation suggestions

### Scenario 3: Deciding Where to Implement a New Feature

```text
User: I want to add a notification feature. Where should I implement it?
```

**What the System Architect does:**

1. Analyze the current architecture with `analyze_module_structure`
2. Check module boundaries with `community`
3. Search for patterns of similar features (email, SMS, etc.)
4. Propose the optimal location

## Integration with the MUSUBI Workflow

CodeGraph MCP is used at every stage of MUSUBI's 8-stage SDD workflow.

```mermaid
graph TD
    A[1. Research & Analysis] -->|CodeGraph: stats, community| B[2. Requirements]
    B -->|query_codebase| C[3. Design]
    C -->|analyze_module_structure| D[4. Task Breakdown]
    D -->|find_dependencies| E[5. Implementation]
    E -->|local_search, get_code_snippet| F[6. Validation]
    F -->|find_callers| G[7. Deployment]
    G --> H[8. Monitoring]
```

### Usage by Workflow Stage

| Workflow stage | Main MCP tools | Purpose |
|-----------------|--------------|----------|
| Research & analysis | `stats`, `community` | Gauge project size, understand module boundaries |
| Requirements | `query_codebase` | Check for overlap with existing features |
| Design | `analyze_module_structure` | Verify architectural fit |
| Task breakdown | `find_dependencies` | Determine implementation order |
| Implementation | `local_search`, `get_code_snippet` | Reference similar code |
| Validation | `find_callers` | Identify what to test |

## Integration with CLI Commands

MUSUBI's CLI commands can also use CodeGraph's analysis results.

```bash
# Traceability analysis (using CodeGraph)
musubi-trace matrix --use-codegraph

# Impact analysis
musubi-trace impact REQ-001 --use-codegraph

# Gap detection
musubi-gaps detect --use-codegraph

# Change management
musubi-change init feature-xyz --analyze-impact
```

## Performance Metrics

Introducing CodeGraph MCP can be expected to deliver the following effects.

| Metric | Before | After | Improvement |
|------|--------|--------|--------|
| Code search time | 5-10 min manually | Instant (<1 sec) | **99% reduction** |
| Impact analysis accuracy | 60-70% | 95% or higher | **+35%** |
| Refactoring planning time | 2-4 hours | 15-30 min | **85% reduction** |
| Bug root-cause identification time | 30 min-2 hours | 5-15 min | **75% reduction** |

## Summary

With the integration of MUSUBI v2.0 and CodeGraph MCP Server, AI agents have evolved from "file-level assistance" to "**assistance that understands the entire project**."

### Key Benefits

1. 🎯 **Higher accuracy**: Precise analysis based on an understanding of dependencies across the whole codebase
2. ⚡ **Efficiency**: Drastically reduces manual investigation work
3. 🔒 **Higher quality**: Automatically detects easily overlooked impact areas
4. 🤝 **Integration**: Works seamlessly with MUSUBI's 25 agents

### Getting Started

```bash
# Install MUSUBI
npm install -g musubi-sdd

# Initialize in your project
musubi init --claude-code

# Ask the Orchestrator
# "Set up CodeGraph MCP"
```

---

## Related Links

### Qiita Articles (in Japanese)

- 📚 [MUSUBI - The Ultimate Specification-Driven Development Tool Supporting 7 AI Agents with 25 Skills](https://qiita.com/hisaho/items/a245c2ad5adf2ab5a409)
- 📊 [CodeGraph MCP Server - Giving AI Coding Assistants Code Comprehension](https://qiita.com/hisaho/items/b99ac51d78119ef60b6b)

### GitHub

- [MUSUBI](https://github.com/nahisaho/MUSUBI)
- [CodeGraph MCP Server](https://github.com/nahisaho/CodeGraphMCPServer)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)

---

**Tags:** `MUSUBI` `MCP` `CodeGraph` `AI` `Coding Assistant` `GraphRAG` `Specification-Driven Development` `SDD`
