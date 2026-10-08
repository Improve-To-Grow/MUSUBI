# MUSUBI SDD Quickstart Guide

## 🚀 Get Started with MUSUBI SDD in 5 Minutes

This guide explains how to run your first specification-driven development workflow with MUSUBI SDD.

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (or another LLM provider)

## Step 1: Installation

```bash
# Global installation (for the CLI)
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'

# Or install locally in your project
npm install -g 'github:Improve-To-Grow/MUSUBI#ITG-adjustments'
```

## Step 2: Initialize the Project

```bash
# Initialize in a new project
musubi init

# Or add to an existing project
musubi init --existing
```

This creates the following files:
- `steering/` - Project memory
- `steering/rules/constitution.md` - 9-Article Constitution
- `steering/project.yml` - Configuration file

## Step 3: Set Environment Variables

```bash
# Create a .env file
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Or set as environment variables
export OPENAI_API_KEY=your-api-key-here
```

## Step 4: Develop Your First Feature

### 4.1 Generate Requirements

```bash
musubi requirements "User authentication feature"
```

Generated content (EARS format):
```
REQ-001: When a user provides valid credentials, the system shall authenticate the user within 2 seconds.
REQ-002: If authentication fails 3 times, the system shall lock the account for 15 minutes.
```

### 4.2 Generate Design

```bash
musubi design "User authentication feature"
```

Generated content:
- C4 context diagram
- Container diagram
- Component diagram
- ADR (Architecture Decision Record)

### 4.3 Task Breakdown

```bash
musubi tasks "User authentication feature"
```

Generated content:
```
TASK-001: Create AuthController [2h]
TASK-002: Implement AuthService [4h]
TASK-003: Generate JWT tokens [2h]
TASK-004: Write unit tests [3h]
```

### 4.4 Constitutional Validation

```bash
musubi validate "User authentication feature"
```

Example output:
```
✅ Article 1: Traceability - PASSED
✅ Article 2: EARS Requirements - PASSED
✅ Article 3: C4 Model Design - PASSED
⚠️ Article 7: Test Coverage - WARNING (75% < 80%)
```

### 4.5 Review Gates (New in v6.2.0)

Quality review at each stage:

```bash
# Requirements review
musubi review requirements "User authentication feature"

# Design review
musubi review design "User authentication feature"

# Implementation review
musubi review implementation "User authentication feature"

# Review all gates
musubi review all "User authentication feature"
```

### 4.6 Workflow Dashboard (New in v6.2.0)

Visualize progress:

```bash
# Show the dashboard
musubi dashboard show "User authentication feature"

# Start a new workflow
musubi dashboard start "User authentication feature"

# Add a blocker
musubi dashboard blocker "User authentication feature" --add "Waiting for API design review"
```

## Step 5: Full Orchestration

Run all steps at once:

```bash
musubi orchestrate "User authentication feature"
```

## 📊 Cost Tracking

Check token usage and cost:

```bash
musubi costs --report
```

Example output:
```
📊 Cost Report
─────────────────────────────
Total Tokens:     45,230
Total Cost:       $0.1358
─────────────────────────────
By Operation:
  Requirements:   $0.0234
  Design:         $0.0456
  Tasks:          $0.0234
  Validation:     $0.0434
```

## 🔧 Programmatic Usage

### Use from Node.js

```javascript
const { OrchestrationEngine } = require('@improve-to-grow/musubi-sdd');

const engine = new OrchestrationEngine({
  llmProvider: 'openai',
  model: 'gpt-4o'
});

const result = await engine.execute({
  workflow: 'full-sdd',
  feature: 'User Authentication'
});

console.log(result.summary);
```

### VSCode Extension

1. Search for "MUSUBI SDD" in the VSCode Marketplace
2. Install
3. Run `MUSUBI: Orchestrate` from the Command Palette (Ctrl+Shift+P)

## 📁 Project Structure

Structure after initialization:

```
your-project/
├── steering/
│   ├── product.md          # Product context
│   ├── structure.md        # Architecture patterns
│   ├── tech.md             # Technology stack
│   ├── project.yml         # MUSUBI configuration
│   ├── rules/
│   │   ├── constitution.md # 9-Article Constitution
│   │   └── workflow.md     # Workflow definition
│   ├── memories/           # Per-feature memory
│   └── templates/          # Custom templates
├── storage/
│   ├── specs/              # Requirements specifications (v6.3.0)
│   ├── design/             # Design documents (v6.3.0)
│   ├── tasks/              # Tasks (v6.3.0)
│   ├── validation/         # Validation reports
│   └── changes/            # Change specifications
└── src/                    # Source code
```

## 🎯 Best Practices

### 1. Keep Features Small

❌ `musubi orchestrate "Entire e-commerce site"`

✅ `musubi orchestrate "Product search feature"`

### 2. Leverage Existing Code

```bash
# Analyze existing code before generating requirements
musubi analyze ./src
musubi requirements "New feature" --context-from-analysis
```

### 3. Improve Iteratively

```bash
# First pass
musubi requirements "Feature X"

# Refine after feedback
musubi requirements "Feature X" --refine
```

### 4. Be Cost-Conscious

```bash
# Estimate only (do not execute)
musubi orchestrate "Feature X" --dry-run --estimate-cost
```

## 🔗 Next Steps

- [API Reference](./API-REFERENCE.md)
- [User Guide](./USER-GUIDE.md)
- [Configuration Options](./guides/configuration.md)
- [VSCode Extension Guide](./guides/vscode-extension.md)
- [Enterprise Features](./guides/enterprise.md)

## 🆘 Troubleshooting

### Error: Invalid API Key

```bash
# Check the API key
echo $OPENAI_API_KEY

# Reset the configuration
musubi init --reset-config
```

### Error: Constitutional Validation Failed

```bash
# View the detailed report
musubi validate "Feature X" --verbose

# Validate specific articles only
musubi validate "Feature X" --articles 1,2,3
```

### Cost Is Too High

```bash
# Use a smaller model
musubi orchestrate "Feature X" --model gpt-4o-mini

# Enable chunked processing
musubi orchestrate "Feature X" --chunk-size 4000
```

## 📞 Support

- GitHub Issues: https://github.com/nahisaho/MUSUBI/issues
- Documentation: https://musubi.dev/docs
- Discord: https://discord.gg/musubi
