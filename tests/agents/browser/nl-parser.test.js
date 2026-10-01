/**
 * @fileoverview Tests for NL Parser
 * @module tests/agents/browser/nl-parser.test.js
 */

const NLParser = require('../../../src/agents/browser/nl-parser');

describe('NLParser', () => {
  let parser;

  beforeEach(() => {
    parser = new NLParser();
  });

  describe('parse', () => {
    test('should parse navigate command with "open"', () => {
      const result = parser.parse('open https://example.com');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('navigate');
      expect(result.actions[0].url).toBe('https://example.com');
    });

    test('should parse navigate command', () => {
      const result = parser.parse('go to https://example.com');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('navigate');
      expect(result.actions[0].url).toBe('https://example.com');
    });

    test('should resolve known element in click command', () => {
      const result = parser.parse('click the login button');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('click');
      expect(result.actions[0].selector).toContain('login');
    });

    test('should parse click command', () => {
      const result = parser.parse('click login button');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('click');
    });

    test('should parse fill command with known element', () => {
      const result = parser.parse('enter "test@example.com" in the email field');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('fill');
      expect(result.actions[0].selector).toContain('email');
      expect(result.actions[0].value).toBe('test@example.com');
    });

    test('should parse fill command', () => {
      const result = parser.parse('type "hello world" in email field');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('fill');
      expect(result.actions[0].value).toBe('hello world');
    });

    test('should parse wait command in milliseconds', () => {
      const result = parser.parse('wait 500 ms');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('wait');
      expect(result.actions[0].delay).toBe(500);
    });

    test('should parse wait command in seconds', () => {
      const result = parser.parse('wait 5 seconds');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('wait');
      expect(result.actions[0].delay).toBe(5000);
    });

    test('should parse screenshot command', () => {
      const result = parser.parse('take a screenshot');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('screenshot');
    });

    test('should parse screenshot with name', () => {
      const result = parser.parse('save screenshot as login-page');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('screenshot');
      expect(result.actions[0].name).toBe('login-page');
    });

    test('should parse assert command', () => {
      const result = parser.parse('verify "Login successful" is visible');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('assert');
      expect(result.actions[0].expectedText).toBe('Login successful');
    });

    test('should parse multiple commands separated by comma', () => {
      const result = parser.parse('open https://example.com, click the login button');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(2);
      expect(result.actions[0].type).toBe('navigate');
      expect(result.actions[1].type).toBe('click');
    });

    test('should parse multiple commands with "and"', () => {
      const result = parser.parse('go to https://example.com and click login button');

      expect(result.success).toBe(true);
      expect(result.actions).toHaveLength(2);
    });

    test('should return error for unrecognized command', () => {
      const result = parser.parse('do something unknown');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('normalizeCommand', () => {
    test('should trim whitespace', () => {
      const result = parser.normalizeCommand('  hello world  ');
      expect(result).toBe('hello world');
    });

    test('should collapse internal whitespace', () => {
      const result = parser.normalizeCommand('hello    world');
      expect(result).toBe('hello world');
    });
  });

  describe('extractSelector', () => {
    test('should match known element patterns (button)', () => {
      const selector = parser.extractSelector('login button');
      expect(selector).toContain('login');
    });

    test('should match known element patterns (field)', () => {
      const selector = parser.extractSelector('email field');
      expect(selector).toContain('email');
    });

    test('should extract CSS selectors', () => {
      const selector = parser.extractSelector('#myId element');
      expect(selector).toBe('#myId');
    });

    test('should extract data-testid', () => {
      const selector = parser.extractSelector('data-testid="submit-btn"');
      expect(selector).toBe('[data-testid="submit-btn"]');
    });
  });

  describe('addElementPattern', () => {
    test('should add custom element pattern', () => {
      parser.addElementPattern('custom button', '#custom-button');
      const selector = parser.extractSelector('custom button');
      expect(selector).toBe('#custom-button');
    });
  });

  describe('getSupportedActions', () => {
    test('should return all action types', () => {
      const actions = parser.getSupportedActions();
      expect(actions).toContain('navigate');
      expect(actions).toContain('click');
      expect(actions).toContain('fill');
      expect(actions).toContain('wait');
      expect(actions).toContain('screenshot');
      expect(actions).toContain('assert');
    });
  });
});
