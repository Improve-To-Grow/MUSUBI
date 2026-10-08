---
name: browser-agent
description: Browser automation agent - operate the browser in natural language, capture and compare screenshots, and generate E2E tests
version: 1.0.0
category: testing
platform: claude-code
---

# Browser Agent Skill

An agent that operates the browser with natural language commands, captures and compares screenshots, and generates E2E test code.

## Features

1. **Browser operation**: Operate the browser with natural-language commands in English
2. **Screenshots**: Automatically capture and save screens
3. **AI comparison**: Compare the expected screen with the actual screen using Vision AI
4. **Test generation**: Auto-generate Playwright test code from the action history
5. **MUSUBI integration**: Generate browser tests from EARS specifications

## Usage

### Interactive Mode

```bash
musubi browser
```

Launches the browser and accepts natural language commands.

### Single Command Execution

```bash
musubi browser run "Open https://example.com and click the login button"
```

### Script Execution

```bash
musubi browser script ./test-script.txt
```

### Screenshot Comparison

```bash
musubi browser compare expected.png actual.png --threshold 0.95
```

### Test Generation

```bash
musubi browser generate-test --history actions.json --output tests/e2e/login.spec.ts
```

## Supported Commands

### Navigation

- `Open https://example.com`
- `go to https://example.com`
- `Go to the login page`

### Click

- `Click the login button`
- `click login button`
- `Press the submit button`

### Input

- `Enter "test@example.com" in the email field`
- `type "hello" in email field`
- `Enter "secret" in the password field`

### Wait

- `Wait 3 seconds`
- `wait 5 seconds`
- `Wait until loading disappears`

### Screenshot

- `Take a screenshot`
- `Save the screen as "login-page"`
- `take screenshot`

### Verification

- `"Login successful" is displayed`
- `verify "Welcome" is visible`
- `The dashboard should be displayed`

## Session Commands (Interactive Mode)

| Command              | Description                             |
| --------------------- | -------------------------------- |
| `history`             | Show action history             |
| `clear`               | Clear history                     |
| `save-test <file>`    | Save a Playwright test from history |
| `exit` / `quit` / `q` | Close the browser and exit             |
| `help` / `?`          | Show help                     |

## Options

| Option      | Description                     | Default      |
| --------------- | ------------------------ | --------------- |
| `--headless`    | Run in headless mode   | `true`          |
| `--no-headless` | Show the browser           | -               |
| `-b, --browser` | Browser type             | `chromium`      |
| `-o, --output`  | Screenshot output location | `./screenshots` |
| `-t, --timeout` | Timeout (ms)       | `30000`         |
| `--threshold`   | Similarity threshold               | `0.95`          |

## MUSUBI Specification Integration

Browser tests can be generated from specifications in EARS format:

```markdown
## Requirements

### REQ-001: User Login

WHEN the user clicks the login button with valid credentials,
the system SHALL display the dashboard page.
```

↓ Generated test

```javascript
test('REQ-001: User Login', async ({ page }) => {
  // Pattern: event-driven
  // Trigger: the user clicks the login button with valid credentials
  // Action: display the dashboard page
  // TODO: Implement test based on requirement
});
```

## API

```javascript
const BrowserAgent = require('@improve-to-grow/musubi-sdd/src/agents/browser');

const agent = new BrowserAgent({
  headless: true,
  browser: 'chromium',
  outputDir: './screenshots',
});

await agent.launch();
await agent.execute('Open https://example.com');
await agent.execute('Click the login button');

const testCode = await agent.generateTest({
  name: 'Login Test',
  output: 'tests/login.spec.ts',
});

await agent.close();
```

## Requirements

- Node.js 18+
- Playwright (auto-install)

## Related

- [Playwright Documentation](https://playwright.dev/)
- [MUSUBI SDD](https://github.com/nahisaho/MUSUBI)
