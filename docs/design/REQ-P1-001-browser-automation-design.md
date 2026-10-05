# REQ-P1-001: Browser Automation Agent Design Document

## Overview

The browser automation agent is a MUSUBI skill that provides browser operation via natural language commands, screenshot capture and comparison, and E2E test code generation.

### Purpose

1. **Browser operation in natural language**: Execute instructions such as "Go to the login page and enter the email"
2. **Screenshot verification**: Compare the expected screen with the actual screen using AI
3. **Test code generation**: Automatically generate Playwright test code from the action history
4. **Traceability with specifications**: Generate browser tests from MUSUBI specifications

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Automation Agent                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐ │
│  │ NL Command   │────▶│ Action       │────▶│ Playwright       │ │
│  │ Parser       │     │ Executor     │     │ Driver           │ │
│  └──────────────┘     └──────────────┘     └──────────────────┘ │
│         │                    │                      │            │
│         ▼                    ▼                      ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐ │
│  │ Action       │     │ Context      │     │ Browser          │ │
│  │ Schema       │     │ Manager      │     │ Instance         │ │
│  └──────────────┘     └──────────────┘     └──────────────────┘ │
│                              │                      │            │
│                              ▼                      ▼            │
│                       ┌──────────────┐     ┌──────────────────┐ │
│                       │ Session      │     │ Screenshot       │ │
│                       │ Storage      │     │ Capture          │ │
│                       └──────────────┘     └──────────────────┘ │
│                                                     │            │
│                                                     ▼            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐ │
│  │ Test Code    │◀────│ Action       │◀────│ AI Comparator    │ │
│  │ Generator    │     │ Recorder     │     │ (Vision)         │ │
│  └──────────────┘     └──────────────┘     └──────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. NL Command Parser (`src/agents/browser/nl-parser.js`)

Converts natural language commands into structured actions.

```javascript
// Input example
"Go to the login page https://example.com/login and enter test@example.com in the email field"

// Output example
{
  actions: [
    { type: 'navigate', url: 'https://example.com/login' },
    { type: 'fill', selector: 'input[type="email"]', value: 'test@example.com' }
  ]
}
```

#### Supported Actions

| Action | Syntax Pattern | Example |
|-----------|-------------|-----|
| navigate | "go to ...", "open ..." | "Open https://example.com" |
| click | "click ...", "press ..." | "Click the login button" |
| fill | "enter ... in ...", "type ..." | "Enter test@example.com in the email field" |
| select | "select ..." | "Select Japan from the country dropdown" |
| wait | "wait ... seconds", "wait for ..." | "Wait 3 seconds", "Wait until the loading indicator disappears" |
| screenshot | "screenshot", "save the screen" | "Take a screenshot of the current screen" |
| assert | "... is displayed", "there is ..." | "\"Login successful\" is displayed" |

### 2. Action Executor (`src/agents/browser/action-executor.js`)

Converts parsed actions into Playwright API calls and executes them.

```javascript
class ActionExecutor {
  async execute(action, context) {
    switch (action.type) {
      case 'navigate':
        await context.page.goto(action.url);
        break;
      case 'click':
        await context.page.click(action.selector);
        break;
      case 'fill':
        await context.page.fill(action.selector, action.value);
        break;
      // ...
    }
  }
}
```

### 3. Context Manager (`src/agents/browser/context-manager.js`)

Manages browser sessions, pages, and state.

```javascript
class ContextManager {
  constructor() {
    this.browser = null;
    this.contexts = new Map(); // named contexts
    this.pages = new Map();    // active pages
    this.history = [];         // action history
  }
  
  async createContext(name, options = {}) {
    // Create a new browser context
  }
  
  async getOrCreatePage(contextName = 'default') {
    // Get or create a page
  }
}
```

### 4. Screenshot Capture (`src/agents/browser/screenshot.js`)

Handles screenshot capture and management.

```javascript
class ScreenshotCapture {
  constructor(outputDir) {
    this.outputDir = outputDir;
    this.screenshots = [];
  }
  
  async capture(page, options = {}) {
    const filename = `${Date.now()}-${options.name || 'screenshot'}.png`;
    const path = join(this.outputDir, filename);
    await page.screenshot({ path, fullPage: options.fullPage });
    this.screenshots.push({ path, timestamp: Date.now(), ...options });
    return path;
  }
}
```

### 5. AI Comparator (`src/agents/browser/ai-comparator.js`)

Compares screenshots using AI (GPT-4V or Claude Vision).

```javascript
class AIComparator {
  constructor(options = {}) {
    this.model = options.model || 'gpt-4-vision-preview';
    this.threshold = options.threshold || 0.95;
  }
  
  async compare(expected, actual, description) {
    const prompt = `
      These are screenshots of two web pages.
      
      Expected screen: [image1]
      Actual screen: [image2]
      
      Verification: ${description}
      
      Please evaluate the following:
      1. Visual similarity (0-100%)
      2. Layout differences
      3. Content differences
      4. Whether there are critical differences
      
      Respond in JSON format.
    `;
    
    // Vision API call
    const result = await this.callVisionAPI(prompt, expected, actual);
    return {
      similarity: result.similarity,
      passed: result.similarity >= this.threshold * 100,
      differences: result.differences,
      details: result.details,
    };
  }
}
```

### 6. Test Code Generator (`src/agents/browser/test-generator.js`)

Generates Playwright test code from the action history.

```javascript
class TestCodeGenerator {
  generateTest(actions, options = {}) {
    const lines = [
      `import { test, expect } from '@playwright/test';`,
      ``,
      `test('${options.name || 'generated test'}', async ({ page }) => {`,
    ];
    
    for (const action of actions) {
      lines.push(`  ${this.actionToCode(action)}`);
    }
    
    lines.push(`});`);
    return lines.join('\n');
  }
  
  actionToCode(action) {
    switch (action.type) {
      case 'navigate':
        return `await page.goto('${action.url}');`;
      case 'click':
        return `await page.click('${action.selector}');`;
      case 'fill':
        return `await page.fill('${action.selector}', '${action.value}');`;
      case 'screenshot':
        return `await page.screenshot({ path: '${action.path}' });`;
      case 'assert':
        return `await expect(page.locator('${action.selector}')).toBeVisible();`;
      default:
        return `// Unknown action: ${action.type}`;
    }
  }
}
```

## Claude Code Skill Definition

### browser-agent Skill

```markdown
---
name: browser-agent
description: Browser automation agent - operate the browser in natural language, capture and compare screenshots, and generate E2E tests
version: 1.0.0
---

## Features

1. **Browser operation**: Operate the browser in natural language
2. **Screenshots**: Automatically capture the screen
3. **AI comparison**: Compare the expected screen with the actual screen
4. **Test generation**: Generate Playwright tests from the action history

## Usage

### Basic Operations

```
browser-agent: Open https://example.com and click the login button
```

### Capturing Screenshots

```
browser-agent: Take a screenshot of the current screen and save it as "login-page"
```

### Screen Comparison

```
browser-agent: Compare the current screen with expected/login.png and verify the similarity is 95% or higher
```

### Test Generation

```
browser-agent: Generate Playwright test code from the action history so far
```

## Execution

```bash
musubi browser-agent "Open https://example.com and test the login"
```
```

## CLI Interface

### `musubi-browser` Command

```bash
# Interactive mode
musubi browser

# Run a single command
musubi browser --command "Open https://example.com"

# Run a script
musubi browser --script ./browser-script.txt

# Screenshot comparison
musubi browser --compare expected.png actual.png --threshold 0.95

# Test generation
musubi browser --generate-test --output tests/e2e/login.spec.ts
```

### Options

| Option | Description | Default |
|-----------|------|-----------|
| `--headless` | Run in headless mode | `true` |
| `--browser` | Browser type (chromium/firefox/webkit) | `chromium` |
| `--timeout` | Timeout (milliseconds) | `30000` |
| `--output-dir` | Screenshot output directory | `./screenshots` |
| `--vision-model` | Vision AI model | `gpt-4-vision-preview` |
| `--threshold` | Similarity threshold | `0.95` |

## File Structure

```
src/
├── agents/
│   └── browser/
│       ├── index.js              # entry point
│       ├── nl-parser.js          # natural language parser
│       ├── action-executor.js    # action execution
│       ├── context-manager.js    # context management
│       ├── screenshot.js         # screenshots
│       ├── ai-comparator.js      # AI comparison
│       ├── test-generator.js     # test generation
│       └── actions/              # action definitions
│           ├── navigate.js
│           ├── click.js
│           ├── fill.js
│           ├── select.js
│           ├── wait.js
│           └── assert.js
├── bin/
│   └── musubi-browser.js         # CLI
└── skills/
    └── browser-agent.md          # Claude Code skill
```

## API

### BrowserAgent Class

```javascript
import { BrowserAgent } from 'musubi/agents/browser';

const agent = new BrowserAgent({
  headless: true,
  browser: 'chromium',
  outputDir: './screenshots',
  visionModel: 'gpt-4-vision-preview',
});

// Launch the browser
await agent.launch();

// Execute natural language commands
await agent.execute('Open https://example.com');
await agent.execute('Click the login button');
await agent.execute('Take a screenshot');

// Screenshot comparison
const result = await agent.compare('expected.png', 'actual.png', {
  threshold: 0.95,
  description: 'The login page is displayed correctly',
});

// Test code generation
const testCode = await agent.generateTest({
  name: 'Login Flow Test',
  output: 'tests/e2e/login.spec.ts',
});

// Shutdown
await agent.close();
```

## Specification Integration

### Generating Tests from MUSUBI Specifications

```javascript
// Generate browser tests from the requirements in spec.md
const spec = await parseSpecification('storage/specs/auth/spec.md');

for (const req of spec.requirements) {
  if (req.pattern === 'event-driven') {
    // WHEN ... the system SHALL ...
    const testCase = await agent.specToTest(req);
    console.log(testCase);
  }
}
```

### Example: Test Generation from REQ-001

```markdown
## Requirements
WHEN the user clicks the login button with valid credentials,
the system SHALL display the dashboard page.
```

↓ Generated test

```javascript
test('REQ-001: Dashboard is displayed on successful login', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
});
```

## Security Considerations

1. **Credentials**: Retrieved from environment variables, never logged
2. **URL restrictions**: Access control via an allowlist
3. **File access**: Sandbox only
4. **Vision API**: Mask sensitive information

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Playwright integration foundation
- [ ] Basic actions (navigate, click, fill)
- [ ] Context manager

### Phase 2: Advanced Features (Week 2)
- [ ] Complete NL parser
- [ ] Implement all action types
- [ ] Session management

### Phase 3: AI Integration (Week 3)
- [ ] Screenshot capture
- [ ] AI comparison engine
- [ ] Comparison report generation

### Phase 4: Integration (Week 4)
- [ ] Test code generation
- [ ] Claude Code skill registration
- [ ] MUSUBI specification integration
- [ ] Documentation

## Success Criteria

| Criterion | Target |
|------|------|
| Basic operation success rate | 99%+ |
| NL parsing accuracy | 95%+ |
| Screenshot comparison accuracy | 95%+ |
| Test generation success rate | 90%+ |
| E2E test coverage | 80%+ |

## Dependencies

```json
{
  "dependencies": {
    "playwright": "^1.40.0"
  },
  "optionalDependencies": {
    "openai": "^4.0.0"
  }
}
```

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [GPT-4V Documentation](https://platform.openai.com/docs/guides/vision)
- [Claude Vision](https://docs.anthropic.com/claude/docs/vision)
