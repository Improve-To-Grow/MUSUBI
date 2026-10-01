# GitHub Actions CI/CD Design Document

## Metadata
- **Document type**: Design document (SDD Stage 3)
- **Created**: 2025-11-17
- **Project**: MUSUBI v0.1.4
- **Related requirements**: [github-actions-requirements.md](./github-actions-requirements.md)
- **Constitutional Compliance**: Article III (Design-First), Article V (Traceability)

---

## 1. Architecture Decision Record (ADR)

### ADR-001: Adopt GitHub Actions as the CI/CD Platform

**Status**: Accepted  
**Date**: 2025-11-17  
**Context**:  
MUSUBI currently runs tests, publishes to npm, and manages versions manually. This carries a high risk of human error and cannot keep quality assurance consistent.

**Decision**:  
Adopt GitHub Actions as the CI/CD platform and automate the following:
- Automatic testing, linting, and build validation on PRs
- Full test execution on pushes to the main branch
- Automatic npm publishing when a version tag is created
- Automatic dependency updates via Dependabot

**Consequences**:
- ✅ Consistent quality checks
- ✅ Fewer human errors
- ✅ Faster release process
- ✅ Native GitHub integration (PR status checks, branch protection)
- ⚠️ GitHub Actions usage limits (free for public repositories)
- ⚠️ YAML-based configuration management is required

---

### ADR-002: Separate CI and Release into Different Workflows

**Status**: Accepted  
**Date**: 2025-11-17  
**Context**:  
CI (continuous integration) and Release (release automation) have different triggers and purposes.

**Decision**:  
Separate them into the following two workflows:
1. **ci.yml**: PR/push triggers, quality checks
2. **release.yml**: Version tag trigger, npm publishing

**Rationale**:
- Separation of Concerns
- Improved reusability
- Easier troubleshooting
- Different permission settings can be applied

**Consequences**:
- ✅ Clear separation of responsibilities
- ✅ Better individual maintainability
- ⚠️ More workflows

---

### ADR-003: Run Multi-Platform Tests with a Matrix Strategy

**Status**: Accepted  
**Date**: 2025-11-17  
**Context**:  
MUSUBI supports 7 platforms (Claude Code, GitHub Copilot, Cursor, Gemini CLI, Windsurf, Codex, Qwen Code), and we must ensure that initialization works correctly on each platform.

**Decision**:  
Use the GitHub Actions matrix strategy to run initialization tests for all 7 platforms in parallel.

```yaml
strategy:
  matrix:
    platform: [claude-code, copilot, cursor, gemini, windsurf, codex, qwen]
```

**Consequences**:
- ✅ Comprehensive validation of all platforms
- ✅ Faster through parallel execution
- ✅ Early detection of platform-specific issues
- ⚠️ Longer workflow execution time (mitigated by parallelization)

---

### ADR-004: Reduce CI Execution Time with a Caching Strategy

**Status**: Accepted  
**Date**: 2025-11-17  
**Context**:  
Running `npm install` every time is slow. REQ-GHA-010 targets an 80% cache hit rate.

**Decision**:  
Use the built-in caching of `actions/setup-node@v4`:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18.x'
    cache: 'npm'
```

**Rationale**:
- Automatic caching keyed on the hash of package-lock.json
- Standard GitHub Actions feature, no extra configuration needed
- Cache sharing across jobs

**Consequences**:
- ✅ Significantly shorter CI execution time (target: < 5 min)
- ✅ Saves the GitHub Actions free tier
- ✅ Better developer experience

---

### ADR-005: Enforce Quality Gates with Branch Protection Rules

**Status**: Accepted  
**Date**: 2025-11-17  
**Context**:  
Direct pushes to the main branch carry a high quality risk. Passing CI checks must be required.

**Decision**:  
Configure the following Branch Protection Rules in GitHub Settings:
- Require status checks to pass before merging
- Required status checks: `lint`, `test`, `build`, `audit`
- Require branches to be up to date before merging
- Require linear history
- Do not allow bypassing the above settings

**Consequences**:
- ✅ Quality assurance for the main branch
- ✅ Enforced code review
- ✅ Mandatory passing of CI checks
- ⚠️ Emergency fix workflow becomes more complex (handled with hotfix branches)

---

## 2. Workflow Design

### 2.1 CI Workflow (ci.yml)

**Triggers**:
- `pull_request`: PRs to any branch
- `push`: Pushes to the main branch

**Job structure**:

```yaml
name: CI

on:
  pull_request:
    branches: ['**']
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: ESLint & Prettier
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    name: Jest Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        if: github.event_name == 'pull_request'
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests

  build:
    name: Build Verification
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - run: npm pack --dry-run

  audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm audit --audit-level=moderate

  platform-tests:
    name: Platform Init Tests
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        platform:
          - claude-code
          - copilot
          - cursor
          - gemini
          - windsurf
          - codex
          - qwen
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - name: Test ${{ matrix.platform }} init
        run: npm test -- tests/init-platforms.test.js -t "${{ matrix.platform }}"
```

**Performance targets**:
- Total execution time: < 5 min
- Parallel execution: lint, test, build, audit, platform-tests (7 variants)

---

### 2.2 Release Workflow (release.yml)

**Triggers**:
- `push`: tags matching `v*.*.*` (e.g., v0.1.5, v1.0.0)

**Job structure**:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: write
  id-token: write

jobs:
  verify:
    name: Pre-release Verification
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm audit --audit-level=moderate

  publish-npm:
    name: Publish to npm
    runs-on: ubuntu-latest
    needs: verify
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'
      - run: npm ci
      - run: npm publish --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

  create-github-release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: publish-npm
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Generate Release Notes
        id: release-notes
        run: |
          TAG_NAME=${GITHUB_REF#refs/tags/}
          PREV_TAG=$(git describe --abbrev=0 --tags ${TAG_NAME}^ 2>/dev/null || echo "")
          
          if [ -n "$PREV_TAG" ]; then
            CHANGELOG=$(git log ${PREV_TAG}..${TAG_NAME} --pretty=format:"- %s (%h)" --reverse)
          else
            CHANGELOG=$(git log ${TAG_NAME} --pretty=format:"- %s (%h)" --reverse)
          fi
          
          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref_name }}
          release_name: Release ${{ github.ref_name }}
          body: |
            ## Changes
            ${{ steps.release-notes.outputs.changelog }}
            
            ## Installation
            ```bash
            npm install musubi-sdd@${{ github.ref_name }}
            ```
          draft: false
          prerelease: false
```

**Performance targets**:
- Total execution time: < 3 min
- npm publish success rate: > 99.9%

---

### 2.3 Dependabot Configuration

**File**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
      time: '09:00'
      timezone: 'Asia/Tokyo'
    open-pull-requests-limit: 5
    reviewers:
      - 'nahisaho'
    labels:
      - 'dependencies'
      - 'automated'
    commit-message:
      prefix: 'chore(deps)'
      include: 'scope'
    allow:
      - dependency-type: 'all'
    ignore:
      - dependency-name: '*'
        update-types: ['version-update:semver-major']
```

---

## 3. Security Design

### 3.1 Secrets Management

**Required Secrets**:

| Secret Name | Purpose | Scope | Where to Configure |
|-----------|------|---------|---------|
| `NPM_TOKEN` | npm publish authentication | Automation token | GitHub Repository Secrets |
| `GITHUB_TOKEN` | GitHub API access | Auto-generated | GitHub Actions standard |

**Setup steps**:
1. Log in to npm → Account Settings → Access Tokens
2. "Generate New Token" → Select Automation token
3. GitHub → Settings → Secrets and variables → Actions
4. "New repository secret" → Add `NPM_TOKEN`

### 3.2 Permission Model

**CI Workflow**:
```yaml
permissions:
  contents: read        # Read code
  pull-requests: write  # Post PR comments (coverage report)
```

**Release Workflow**:
```yaml
permissions:
  contents: write    # Create GitHub Release
  id-token: write    # npm provenance signing
```

---

## 4. Test Strategy

### 4.1 Platform Initialization Tests

**New test file**: `tests/init-platforms.test.js`

```javascript
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const PLATFORMS = [
  'claude-code',
  'copilot',
  'cursor',
  'gemini',
  'windsurf',
  'codex',
  'qwen'
];

describe('Platform Initialization Tests', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-test-'));
  });

  afterEach(() => {
    fs.removeSync(tempDir);
  });

  PLATFORMS.forEach(platform => {
    test(`should initialize ${platform} successfully`, () => {
      const binPath = path.join(__dirname, '..', 'bin', 'musubi.js');
      const cmd = `node ${binPath} init --${platform}`;
      
      expect(() => {
        execSync(cmd, { cwd: tempDir, stdio: 'pipe' });
      }).not.toThrow();

      // Verify core files
      expect(fs.existsSync(path.join(tempDir, '.github', 'AGENTS.md'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'steering', 'structure.md'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'steering', 'tech.md'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'steering', 'product.md'))).toBe(true);

      // Verify platform-specific files
      if (platform === 'claude-code') {
        expect(fs.existsSync(path.join(tempDir, '.github', 'prompts'))).toBe(true);
      } else {
        expect(fs.existsSync(path.join(tempDir, '.github', 'prompts', 'README.md'))).toBe(true);
      }
    });
  });
});
```

**Test strategy**:
- Run 7 platforms in parallel with a matrix strategy
- Verify generation of required files on each platform
- Conditional validation of Skills API (Claude Code only)

---

## 5. Branch Protection Configuration

**GitHub Settings → Branches → Branch protection rules**

**Rule name**: `main`

**Settings**:
- ✅ Require a pull request before merging
  - ✅ Require approvals: 0 (small team, solo development)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - **Required status checks**:
    - `lint / ESLint & Prettier`
    - `test / Jest Tests`
    - `build / Build Verification`
    - `audit / Security Audit`
    - `platform-tests / Platform Init Tests (claude-code)`
    - `platform-tests / Platform Init Tests (copilot)`
    - `platform-tests / Platform Init Tests (cursor)`
    - `platform-tests / Platform Init Tests (gemini)`
    - `platform-tests / Platform Init Tests (windsurf)`
    - `platform-tests / Platform Init Tests (codex)`
    - `platform-tests / Platform Init Tests (qwen)`
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ❌ Do not allow bypassing the above settings

---

## 6. Monitoring & Observability

### 6.1 Workflow Metrics

**Monitoring items**:
- CI execution time (target: < 5 min)
- Release execution time (target: < 3 min)
- Cache hit rate (target: > 80%)
- Test success rate (target: 100%)
- npm publish success rate (target: > 99.9%)

**Monitoring methods**:
- The "Insights" tab in GitHub Actions
- Periodic review of workflow run history

### 6.2 Notification Strategy

**On success**:
- Green check in GitHub Status Check
- Automatic comment on the PR (coverage report)

**On failure**:
- Red X in GitHub Status Check
- Automatic comment on the PR (error details)
- Email notification (configured in GitHub Settings)

---

## 7. Rollout Plan

### Phase 1: CI Workflow (Week 1)
1. Create and commit `ci.yml`
2. Validate behavior with a test PR
3. Configure Branch Protection Rules
4. Notify the team and update documentation

### Phase 2: Platform Tests (Week 1)
1. Implement `tests/init-platforms.test.js`
2. Verify behavior locally
3. Integrate into the CI Workflow
4. Validate all 7 platforms

### Phase 3: Release Workflow (Week 2)
1. Create and commit `release.yml`
2. Validate behavior with a test tag (e.g., v0.1.5-test)
3. Configure the npm token
4. Production release (v0.1.5)

### Phase 4: Dependabot (Week 2)
1. Create and commit `.github/dependabot.yml`
2. Review the first dependency update PR
3. Establish the merge process

---

## 8. Risk Management

### Risk 1: Development Blocked by CI Failure

**Mitigation**:
- Use `fail-fast: false` to run all tests
- Clear error messages and log output
- Recommend pre-testing locally

### Risk 2: npm Publish Failure

**Mitigation**:
- Pre-validate with the Pre-release verification job
- Manage npm token expiration
- Document the manual rollback procedure

### Risk 3: GitHub Actions Usage Limits

**Mitigation**:
- Shorten execution time with the caching strategy
- Remove unnecessary workflows
- Use the free tier for public repositories

---

## 9. Traceability Matrix

| Design Decision | Related Requirements | Implementation |
|-----------------|---------------------|----------------|
| ADR-001: Adopt GitHub Actions | REQ-GHA-001, REQ-GHA-002, REQ-GHA-003 | ci.yml, release.yml |
| ADR-002: Separate workflows | REQ-GHA-001, REQ-GHA-003 | ci.yml, release.yml |
| ADR-003: Matrix Strategy | REQ-GHA-006 | ci.yml (platform-tests job) |
| ADR-004: Caching | REQ-GHA-010 | actions/setup-node@v4 with cache |
| ADR-005: Branch Protection | REQ-GHA-007 | GitHub Settings |
| CI Workflow | REQ-GHA-001, REQ-GHA-002, REQ-GHA-004, REQ-GHA-005 | ci.yml |
| Release Workflow | REQ-GHA-003, REQ-GHA-008 | release.yml |
| Dependabot | REQ-GHA-009 | dependabot.yml |
| Platform Tests | REQ-GHA-006 | tests/init-platforms.test.js |
| Security Model | REQ-GHA-004 (npm audit) | ci.yml (audit job), release.yml (verify job) |

---

## 10. Next Steps

1. ✅ Design document reviewed and approved
2. ⏳ Task breakdown (decide implementation priorities)
3. ⏳ Implement CI Workflow
4. ⏳ Implement Platform Tests
5. ⏳ Implement Release Workflow
6. ⏳ Configure Branch Protection
7. ⏳ Enable Dependabot
8. ⏳ Update documentation (README.md, CONTRIBUTING.md)

---

## Appendix A: Workflow Diagrams

### CI Workflow Flow

```
PR/Push → Trigger CI
    ↓
  ┌─────────────────────────────────────┐
  │ Parallel Jobs                       │
  ├─────────────────────────────────────┤
  │ lint (ESLint, Prettier)             │
  │ test (Jest, Coverage)               │
  │ build (npm pack --dry-run)          │
  │ audit (npm audit)                   │
  │ platform-tests (7 variants)         │
  └─────────────────────────────────────┘
    ↓
  All Pass → ✅ Green Check
  Any Fail → ❌ Red X (Block Merge)
```

### Release Workflow Flow

```
Git Tag (v*.*.*)
    ↓
  verify (Full Test Suite)
    ↓
  publish-npm (npm publish --provenance)
    ↓
  create-github-release (Generate Notes, Create Release)
    ↓
  ✅ Release Complete
```

---

**Constitutional Compliance**:
- ✅ Article III: Design-First approach followed
- ✅ Article V: Traceability matrix established
- ✅ Article VII: Risk management addressed
- ✅ Article VIII: Performance targets defined (< 5min CI, < 3min Release)
