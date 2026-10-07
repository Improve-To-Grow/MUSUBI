# MUSUBI CI/CD Integration Guide

MUSUBI provides ready-to-use CI/CD templates for automated validation, testing, and deployment.

## 📋 Supported Platforms

| Platform | Template | Status |
|----------|----------|--------|
| GitHub Actions | `.github/workflows/` | ✅ Built-in |
| GitLab CI | `templates/ci-cd/gitlab-ci.yml` | ✅ Available |
| Jenkins | `templates/ci-cd/Jenkinsfile` | ✅ Available |
| Azure DevOps | Coming Soon | 🔜 Planned |
| CircleCI | Coming Soon | 🔜 Planned |

## 🚀 Quick Setup

### GitHub Actions (Recommended)

```bash
# Initialize MUSUBI with GitHub Actions
musubi-sdd init --platform github-actions

# Or copy existing workflows
cp -r node_modules/musubi-sdd/.github/workflows .github/
```

Generated workflows:
- `ci.yml` - Basic CI with tests
- `constitutional-governance.yml` - Constitutional compliance
- `traceability-check.yml` - Traceability matrix

### GitLab CI

```bash
# Copy template
cp node_modules/musubi-sdd/templates/ci-cd/gitlab-ci.yml .gitlab-ci.yml

# Or initialize
musubi-sdd init --platform gitlab
```

### Jenkins

```bash
# Copy Jenkinsfile
cp node_modules/musubi-sdd/templates/ci-cd/Jenkinsfile Jenkinsfile
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MUSUBI_STRICT` | Fail on any validation error | `false` |
| `MUSUBI_SKIP_CONSTITUTION` | Skip constitutional checks | `false` |
| `MUSUBI_OUTPUT_DIR` | Report output directory | `reports/` |

### Example: GitHub Actions with Custom Config

```yaml
name: MUSUBI Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    env:
      MUSUBI_STRICT: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: musubi-validate all
```

## 📊 Validation Jobs

### 1. EARS Requirement Validation

```yaml
# GitHub Actions
- run: musubi-validate ears
```

```yaml
# GitLab CI
validate:ears:
  script: musubi-validate ears
```

Validates all requirements follow EARS format:
- Ubiquitous: `The system shall...`
- Event-Driven: `When X, the system shall...`
- State-Driven: `While X, the system shall...`

### 2. Constitutional Compliance

```yaml
- run: musubi-validate constitution
```

Checks all 9 Constitutional Articles:
- Article 1: Specification-First Development
- Article 2: Constitutional Supremacy
- Article 3-9: Various governance rules

### 3. Traceability Matrix

```yaml
- run: musubi-trace --output reports/traceability.md
```

Generates requirement ↔ code ↔ test mapping.

### 4. Gap Analysis

```yaml
- run: musubi-gaps --output reports/gaps.md
```

Identifies:
- Requirements without tests
- Code without specifications
- Missing implementations

## 🔗 Pre-commit Hooks

```bash
# Install pre-commit hooks
npm install --save-dev husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "storage/specs/**/*.md": [
      "musubi-validate ears"
    ],
    "storage/changes/**/*.md": [
      "musubi-validate delta"
    ]
  }
}
```

## 📈 Best Practices

### 1. Fail Fast

Run validation early in the pipeline:

```yaml
stages:
  - validate  # ← First
  - test
  - build
  - deploy
```

### 2. Cache Dependencies

```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 3. Parallel Validation

```yaml
jobs:
  ears:
    runs-on: ubuntu-latest
    steps:
      - run: musubi-validate ears
  
  constitution:
    runs-on: ubuntu-latest
    steps:
      - run: musubi-validate constitution
  
  traceability:
    runs-on: ubuntu-latest
    steps:
      - run: musubi-trace
```

### 4. Artifact Storage

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: musubi-reports
    path: reports/
```

## 🔔 Notifications

### Slack Integration

```yaml
- name: Notify Slack
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    text: 'MUSUBI validation failed!'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### GitHub PR Comments

```yaml
- name: Comment on PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      const fs = require('fs');
      const report = fs.readFileSync('reports/traceability.md', 'utf8');
      github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: '## Traceability Report\n\n' + report
      });
```

## 📚 Related Documentation

- [Orchestration Patterns](./orchestration-patterns.md)
- [Constitutional Governance](../steering/rules/constitution.md)
- [Traceability Matrix Guide](./traceability-matrix-guide.md)
