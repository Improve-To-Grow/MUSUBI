---
name: browser-agent
description: Browser automation agent - operates the browser with natural language, captures and compares screenshots, and generates E2E tests
version: 1.0.0
category: testing
platform: claude-code
---

# Browser Agent Skill

An agent that operates the browser with natural-language commands, captures and compares screenshots, and generates E2E test code.

## Features

1. **Browser operation**: Operate the browser with natural language in Japanese or English
2. **Screenshots**: Automatically capture and save the screen
3. **AI comparison**: Compare the expected screen with the actual screen using Vision AI
4. **Test generation**: Automatically generate Playwright test code from the action history
5. **MUSUBI integration**: Generate browser tests from EARS specifications

## Usage

### Interactive Mode

```bash
npx musubi browser
```

Launches the browser and accepts natural-language commands.

### Single Command Execution

```bash
npx musubi browser run "open https://example.com and click the login button"
```

### Script Execution

```bash
npx musubi browser script ./test-script.txt
```

### Screenshot Comparison

```bash
npx musubi browser compare expected.png actual.png --threshold 0.95
```

### Test Generation

```bash
npx musubi browser generate-test --history actions.json --output tests/e2e/login.spec.ts
```

## Supported Commands

Japanese examples are kept as-is (they are valid input); the English meaning is shown in parentheses.

### Navigation

- `https://example.com を開く` (open https://example.com)
- `go to https://example.com`
- `ログインページにアクセス` (access the login page)

### Click

- `ログインボタンをクリック` (click the login button)
- `click login button`
- `送信ボタンを押す` (press the submit button)

### Input

- `メール欄に「test@example.com」と入力` (enter "test@example.com" in the email field)
- `type "hello" in email field`
- `パスワードに "secret" を入力` (enter "secret" in the password field)

### Wait

- `3秒待つ` (wait 3 seconds)
- `wait 5 seconds`
- `ローディングが消えるまで待つ` (wait until the loading indicator disappears)

### Screenshot

- `スクリーンショットを取る` (take a screenshot)
- `画面を「login-page」として保存` (save the screen as "login-page")
- `take screenshot`

### Verification

- `「ログイン成功」が表示される` ("Login successful" is displayed)
- `verify "Welcome" is visible`
- `ダッシュボードが表示されること` (the dashboard should be displayed)

## Session Commands (Interactive Mode)

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `history`             | Show the action history                  |
| `clear`               | Clear the history                        |
| `save-test <file>`    | Save a Playwright test from the history  |
| `exit` / `quit` / `q` | Close the browser and exit               |
| `help` / `?`          | Show help                                |

## Options

| Option          | Description                  | Default         |
| --------------- | ---------------------------- | --------------- |
| `--headless`    | Run in headless mode         | `true`          |
| `--no-headless` | Show the browser             | -               |
| `-b, --browser` | Browser type                 | `chromium`      |
| `-o, --output`  | Screenshot output directory  | `./screenshots` |
| `-t, --timeout` | Timeout (ms)                 | `30000`         |
| `--threshold`   | Similarity threshold         | `0.95`          |

## MUSUBI Specification Integration

Browser tests can be generated from EARS-format specifications:

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
const BrowserAgent = require('musubi-sdd/src/agents/browser');

const agent = new BrowserAgent({
  headless: true,
  browser: 'chromium',
  outputDir: './screenshots',
});

await agent.launch();
await agent.execute('go to https://example.com');
await agent.execute('click login button');

const testCode = await agent.generateTest({
  name: 'Login Test',
  output: 'tests/login.spec.ts',
});

await agent.close();
```

## Requirements

- Node.js 18+
- Playwright (installed automatically)

## Related

- [Playwright Documentation](https://playwright.dev/)
- [MUSUBI SDD](https://github.com/nahisaho/MUSUBI)
