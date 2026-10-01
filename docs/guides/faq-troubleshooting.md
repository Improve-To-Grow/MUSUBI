# FAQ & Troubleshooting Guide

FAQ and Troubleshooting Guide

---

## 📋 Table of Contents

1. [Frequently Asked Questions](#frequently-asked-questions)
2. [Installation Issues](#installation-issues)
3. [Validation Errors](#validation-errors)
4. [Orchestration Problems](#orchestration-problems)
5. [Platform-Specific Issues](#platform-specific-issues)
6. [CI/CD Issues](#cicd-issues)
7. [Performance Optimization](#performance-optimization)
8. [Migration Guide](#migration-guide)

---

## Frequently Asked Questions

### General

#### Q: What is MUSUBI?

**A:** MUSUBI (musubi, "connection/binding") is a Specification Driven Development (SDD) framework. It defines specifications before code is written, then automatically generates and manages design, implementation, and tests from those specifications.

#### Q: Can I use it with an existing project?

**A:** Yes. Use `musubi init --mode brownfield` to adopt it incrementally with Delta specifications.

```bash
# Adopting in an existing project
cd existing-project
npx musubi-sdd init --mode brownfield
```

#### Q: Which AI coding assistants are compatible?

**A:** 13+ platforms are supported:

| Platform | Support Status |
|---------------|------------|
| Claude Code | ✅ Primary |
| GitHub Copilot | ✅ Full |
| Cursor | ✅ Full |
| Windsurf | ✅ Full |
| Gemini CLI | ✅ Full |
| Codex CLI | ✅ Full |
| Aider | ✅ Basic |
| Continue | ✅ Basic |
| Others | ✅ Universal via AGENTS.md |

#### Q: Is it free?

**A:** Yes. MUSUBI is completely free and open source under the MIT license.

---

### Concepts

#### Q: What is the EARS format?

**A:** EARS (Easy Approach to Requirements Syntax) is a way to write requirements using standard patterns:

| Type | Pattern | Example |
|-------|---------|-----|
| Ubiquitous | The system shall... | The system shall encrypt passwords |
| Event-Driven | When X, the system shall... | When login fails, the system shall log |
| State-Driven | While X, the system shall... | While offline, the system shall queue |
| Optional | Where X, the system shall... | Where enabled, the system shall show |

#### Q: What are the 9 Articles?

**A:** The 9 immutable rules of the MUSUBI Constitution:

1. Specification First
2. Constitution Supremacy
3. EARS Compliance
4. Traceability
5. Change Tracking
6. Quality Gates
7. Documentation
8. Testing
9. Continuous Improvement

#### Q: What is a P-Label?

**A:** A label that indicates task priority:

- **P0**: Critical (blocks everything)
- **P1**: High priority (execute immediately)
- **P2**: Medium priority (normal)
- **P3**: Low priority (background/optional)

---

## Installation Issues

### Issue: npm install fails

**Symptoms:**
```
npm ERR! code EACCES
npm ERR! syscall mkdir
```

**Solution:**
```bash
# Option 1: Use npx
npx musubi-sdd init

# Option 2: Install in the user directory
npm install -g musubi-sdd --prefix ~/.npm-global

# Option 3: Use sudo (not recommended)
sudo npm install -g musubi-sdd
```

### Issue: Node.js version error

**Symptoms:**
```
Error: musubi-sdd requires Node.js >= 18.0.0
```

**Solution:**
```bash
# Manage versions with nvm
nvm install 20
nvm use 20

# Or install directly
# Download the LTS version from https://nodejs.org/
```

### Issue: Command not found

**Symptoms:**
```bash
$ musubi-sdd
bash: musubi-sdd: command not found
```

**Solution:**
```bash
# Check PATH
echo $PATH

# Add the npm global bin directory
export PATH="$PATH:$(npm config get prefix)/bin"

# Or use npx
npx musubi-sdd --help
```

---

## Validation Errors

### Issue: EARS validation failed

**Symptoms:**
```
EARS Validation Error: Requirement does not match EARS pattern
Line 15: "Users can login with email"
```

**Solution:**

```markdown
# ❌ Incorrect format
Users can login with email

# ✅ Correct format (Event-Driven)
When a user submits login credentials, the system shall authenticate using email and password.
```

**Valid EARS patterns:**
- `The system shall...`
- `When <trigger>, the system shall...`
- `While <state>, the system shall...`
- `Where <condition>, the system shall...`

### Issue: Constitution violation

**Symptoms:**
```
Constitutional Violation: Article 4 - Missing traceability
Files without requirement links: src/auth.js, src/user.js
```

**Solution:**
```javascript
// ❌ No link
function authenticate(user, password) {
  // ...
}

// ✅ With requirement link
/**
 * Authenticates user credentials
 * @requirement REQ-AUTH-001
 */
function authenticate(user, password) {
  // REQ-AUTH-001: User authentication
  // ...
}
```

### Issue: Traceability gap

**Symptoms:**
```
Traceability Gap: 5 requirements without implementation
- REQ-AUTH-003
- REQ-USER-001
- REQ-USER-002
```

**Solution:**
```bash
# Check details
npx musubi-gaps --verbose

# Example output:
# REQ-AUTH-003: Not implemented
#   Expected in: src/auth/mfa.js
#   Action: Implement MFA functionality

# Re-validate after implementation
npx musubi-trace
```

### Issue: Delta spec validation failed

**Symptoms:**
```
Delta Specification Error: Missing impact analysis
Change: auth-v2.md
```

**Solution:**
```markdown
# storage/changes/auth-v2.md

## Change Request

### Summary
Add OAuth2 support

### Impact Analysis  <!-- Required section -->
- Affected Files: src/auth/*, tests/auth/*
- Risk Level: Medium
- Dependencies: oauth2-client library

### Requirements Changed
- REQ-AUTH-001: Modified
- REQ-AUTH-010: New

### Rollback Plan  <!-- Recommended -->
Revert commit abc123
```

---

## Orchestration Problems

### Issue: Skill not found

**Symptoms:**
```
Error: Skill 'my-custom-skill' not found in registry
```

**Solution:**
```javascript
const { SkillRegistry } = require('musubi-sdd');

// Register the skill
const registry = new SkillRegistry();
registry.registerSkill({
  id: 'my-custom-skill',
  name: 'My Custom Skill',
  category: 'custom',
  handler: async (input) => {
    return { success: true, result: 'done' };
  }
});

// Check registered skills
console.log(registry.listSkills());
```

### Issue: Parallel execution timeout

**Symptoms:**
```
Error: Parallel execution timed out after 30000ms
```

**Solution:**
```javascript
// Extend the timeout
const engine = new OrchestrationEngine({
  timeout: 120000, // 2 minutes
  retryAttempts: 3
});

// Or set individually
await engine.executePattern('parallel', {
  skills: ['skill-a', 'skill-b'],
  options: {
    timeout: 60000,
    failFast: false
  }
});
```

### Issue: Handoff context lost

**Symptoms:**
```
Warning: Handoff context incomplete
Missing: previous_analysis, requirements
```

**Solution:**
```javascript
// Pass context explicitly on handoff
await engine.executePattern('handoff', {
  from: 'requirements-analyst',
  to: 'system-architect',
  context: {
    previous_analysis: analysisResult,
    requirements: reqList,
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'requirements-phase'
    }
  }
});
```

---

## Platform-Specific Issues

### Claude Code

#### Issue: /sdd commands not recognized

**Symptoms:**
```
Unknown command: /sdd-requirements
```

**Solution:**
1. Verify that `CLAUDE.md` exists
2. Restart the session
3. Use the appropriate prefix:
```
# Claude Code uses slash commands
/sdd-requirements feature-name
```

### GitHub Copilot

#### Issue: #sdd prompts not working

**Symptoms:**
Agent doesn't recognize #sdd commands

**Solution:**
1. Verify that `AGENTS.md` exists in the root
2. Use Copilot Chat (not code completion)
3. Correct syntax:
```
#sdd-requirements Create user authentication
```

### Cursor

#### Issue: Rules not applied

**Symptoms:**
Cursor ignores MUSUBI rules

**Solution:**
1. Check the `.cursor/rules` directory
2. Check the rule file format:
```markdown
# .cursor/rules/musubi.md

## MUSUBI Rules

Always follow EARS format for requirements.
Check constitution compliance before code changes.
```

### Windsurf

#### Issue: Custom rules not loaded

**Solution:**
```bash
# Regenerate Windsurf settings
npx musubi-sdd init --platform windsurf --force
```

---

## CI/CD Issues

### GitHub Actions

#### Issue: Action fails with "No specs found"

**Symptoms:**
```
Error: No specification files found in storage/specs/
```

**Solution:**
```yaml
# .github/workflows/musubi.yml
jobs:
  validate:
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch full history
      
      - name: Check specs exist
        run: |
          if [ ! -d "storage/specs" ]; then
            mkdir -p storage/specs
            echo "# Placeholder" > storage/specs/.gitkeep
          fi
```

#### Issue: Traceability report not generated

**Solution:**
```yaml
- name: Generate Traceability
  run: npx musubi-trace --output reports/traceability.md
  
- name: Upload Report
  uses: actions/upload-artifact@v4
  with:
    name: traceability-report
    path: reports/traceability.md
```

### GitLab CI

#### Issue: Cache not working

**Solution:**
```yaml
# .gitlab-ci.yml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - node_modules/
    - .npm/
  policy: pull-push
```

---

## Performance Optimization

### Issue: Validation is slow

**Symptoms:**
```
Validation took 45s (expected < 10s)
```

**Solution:**
```bash
# Validate specific files only
npx musubi-validate ears --file storage/specs/auth.md

# Enable parallel validation
npx musubi-validate all --parallel

# Use cache
npx musubi-validate all --cache
```

### Issue: Large project performance

**Settings for large projects:**
```javascript
// musubi.config.js
module.exports = {
  validation: {
    parallel: true,
    workers: 4,
    cache: {
      enabled: true,
      ttl: 3600 // 1 hour
    }
  },
  traceability: {
    incremental: true,
    excludePatterns: [
      'node_modules/**',
      'dist/**',
      'coverage/**'
    ]
  }
};
```

---

## Migration Guide

### From v2.x to v3.x

**Breaking Changes:**
1. `register()` → `registerSkill()`
2. `stopHealthCheck()` → `stopHealthMonitoring()`
3. Config file format changed

**Migration Script:**
```bash
# Automatic migration
npx musubi-sdd migrate --from 2 --to 3

# Manual check
npx musubi-validate all --verbose
```

### From other SDD tools

```bash
# Import existing specifications
npx musubi-convert import --format openapi --file api-spec.yaml
npx musubi-convert import --format gherkin --dir features/
```

---

## Getting More Help

### Resources

- **Documentation**: https://nahisaho.github.io/musubi
- **GitHub Issues**: https://github.com/nahisaho/MUSUBI/issues
- **Discussions**: https://github.com/nahisaho/MUSUBI/discussions

### Debug Mode

```bash
# Enable verbose logging
DEBUG=musubi:* npx musubi-validate all

# Specific modules only
DEBUG=musubi:validator npx musubi-validate ears
```

### Bug Reports

```bash
# Collect diagnostic information
npx musubi-sdd diagnose > musubi-diagnostic.txt

# Create a GitHub Issue
# https://github.com/nahisaho/MUSUBI/issues/new
# Attach diagnostic.txt
```

---

**MUSUBI v3.12.0** - Specification Driven Development

[Documentation](../USER-GUIDE.md) | [GitHub](https://github.com/nahisaho/MUSUBI) | [npm](https://www.npmjs.com/package/musubi-sdd)
