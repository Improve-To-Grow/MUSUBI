/**
 * Tests for src/code-index/setup.js: project configuration for musubi-code
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  SECTION_START,
  SECTION_END,
  resolveAgentKey,
  detectAgents,
  mergeHookSettings,
  setupCodeIndex,
  hasChanges,
} = require('../../src/code-index/setup');

function makeTempProject(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-code-setup-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

const read = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const statuses = result => Object.fromEntries(result.changes.map(c => [c.file, c.status]));

describe('code-index setup', () => {
  let root;

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true });
    root = null;
  });

  test('resolves agent keys and aliases', () => {
    expect(resolveAgentKey('claude-code')).toBe('claude-code');
    expect(resolveAgentKey('--claude')).toBe('claude-code');
    expect(resolveAgentKey('copilot')).toBe('github-copilot');
    expect(() => resolveAgentKey('notepad')).toThrow(/Unknown agent/);
  });

  test('detects agents from their files and falls back to Claude Code', () => {
    root = makeTempProject({
      'package.json': '{}',
      '.github/workflows/ci.yml': '',
      '.cursor/commands/x.md': '',
    });
    expect(detectAgents(root)).toEqual(['cursor']);
    fs.mkdirSync(path.join(root, '.github', 'prompts'));
    expect(detectAgents(root).sort()).toEqual(['cursor', 'github-copilot']);
    const bare = makeTempProject({ 'package.json': '{}', '.github/workflows/ci.yml': '' });
    expect(detectAgents(bare)).toEqual(['claude-code']);
    fs.rmSync(bare, { recursive: true, force: true });
  });

  test('configures a Claude Code project and is idempotent', () => {
    root = makeTempProject({
      'package.json': '{}',
      '.gitignore': 'node_modules/\r\n',
      'CLAUDE.md': '# Project\r\n\r\nExisting text.\r\n',
      '.claude/settings.json': JSON.stringify({
        permissions: { allow: ['Bash(npm test)'] },
        hooks: {
          PreToolUse: [
            { matcher: 'Bash', hooks: [{ type: 'command', command: 'node guard.js' }] },
            {
              matcher: 'Grep',
              hooks: [{ type: 'command', command: 'node bin/musubi-code.js hint --hook' }],
            },
          ],
          PostToolUse: [
            { matcher: 'Write', hooks: [{ type: 'command', command: 'npx prettier --write' }] },
            {
              matcher: 'Edit|Write',
              hooks: [
                { type: 'command', command: 'node scripts/scip-index.js --hook', async: true },
              ],
            },
          ],
        },
      }),
    });

    const first = setupCodeIndex(root, { agents: ['claude-code'] });
    expect(first.skippedReason).toBeNull();
    expect(statuses(first)).toEqual({
      '.gitignore': 'updated',
      '.claude/skills/code-references/SKILL.md': 'created',
      '.claude/settings.json': 'updated',
      'CLAUDE.md': 'updated',
    });

    expect(read(root, '.gitignore')).toBe(
      'node_modules/\r\n\r\n# MUSUBI code index (musubi-code)\r\n.scip/\r\n'
    );
    const skill = read(root, '.claude/skills/code-references/SKILL.md');
    expect(skill).toContain("'Bash(musubi-code *)'");
    expect(skill).toContain('`musubi-code refs UserService`');
    expect(skill).not.toContain('{{CODE_CMD}}');

    const settings = JSON.parse(read(root, '.claude/settings.json'));
    expect(settings.permissions).toEqual({ allow: ['Bash(npm test)'] });
    const commands = event => settings.hooks[event].flatMap(g => g.hooks.map(h => h.command));
    expect(commands('PostToolUse')).toEqual(['npx prettier --write', 'musubi-code index --hook']);
    expect(commands('SessionStart')).toEqual(['musubi-code index --hook']);
    expect(settings.hooks.PostToolUse[1]).toMatchObject({
      matcher: 'Edit|Write|MultiEdit|Bash|PowerShell',
    });
    expect(settings.hooks.PostToolUse[1].hooks[0].async).toBe(true);

    // REQ-NAV-005: synchronous reminder before Grep and grep-like shell commands; the earlier
    // hint entry is replaced, a foreign PreToolUse hook is kept.
    expect(settings.hooks.PreToolUse.map(g => g.matcher)).toEqual([
      'Bash',
      'Grep',
      'Bash',
      'PowerShell',
    ]);
    expect(settings.hooks.PreToolUse[0].hooks).toEqual([
      { type: 'command', command: 'node guard.js' },
    ]);
    const hintHooks = settings.hooks.PreToolUse.slice(1).flatMap(g => g.hooks);
    expect(new Set(hintHooks.map(h => h.command))).toEqual(new Set(['musubi-code hint --hook']));
    expect(hintHooks.every(h => h.async === undefined && h.timeout === 10)).toBe(true);
    expect(hintHooks.map(h => h.if)).toEqual([
      undefined,
      'Bash(grep *)',
      'Bash(rg *)',
      'Bash(git grep *)',
      'PowerShell(Select-String *)',
    ]);

    const claudeMd = read(root, 'CLAUDE.md');
    expect(
      claudeMd.startsWith('# Project\r\n\r\nExisting text.\r\n\r\n<!-- musubi-code:start -->')
    ).toBe(true);
    expect(claudeMd).toContain('`code-references` skill');

    const second = setupCodeIndex(root, { agents: ['claude-code'] });
    expect(new Set(Object.values(statuses(second)))).toEqual(new Set(['unchanged']));
    expect(hasChanges(second)).toBe(false);
  });

  test('replaces the managed section and hooks when the command changes', () => {
    root = makeTempProject({ 'package.json': '{}' });
    setupCodeIndex(root, { agents: ['claude-code'] });
    const result = setupCodeIndex(root, {
      agents: ['claude-code'],
      command: 'node bin/musubi-code.js',
    });
    expect(statuses(result)['CLAUDE.md']).toBe('updated');
    const claudeMd = read(root, 'CLAUDE.md');
    expect(claudeMd.split(SECTION_START)).toHaveLength(2);
    expect(claudeMd.split(SECTION_END)).toHaveLength(2);
    expect(claudeMd).toContain('`node bin/musubi-code.js refs X`');
    const settings = JSON.parse(read(root, '.claude/settings.json'));
    expect(settings.hooks.SessionStart).toHaveLength(1);
    expect(settings.hooks.SessionStart[0].hooks[0].command).toBe(
      'node bin/musubi-code.js index --hook'
    );
    const hint = settings.hooks.PreToolUse.flatMap(g => g.hooks.map(h => h.command));
    expect(hint).toHaveLength(5);
    expect(new Set(hint)).toEqual(
      new Set(['node bin/musubi-code.js hint --hook --command "node bin/musubi-code.js"'])
    );
  });

  test('the managed section maps symbol questions to commands (REQ-NAV-001, REQ-NAV-002)', () => {
    root = makeTempProject({ 'package.json': '{}' });
    setupCodeIndex(root, { agents: ['claude-code', 'copilot'] });
    for (const file of ['CLAUDE.md', 'AGENTS.md']) {
      const section = read(root, file);
      expect(section).toContain('Answer symbol questions with `musubi-code` before grep');
      expect(section).toMatch(/Does `X` exist\? Where is it defined\?\s*\|\s*`musubi-code refs X`/);
      expect(section).toMatch(
        /What does a file define or export\?\s*\|\s*`musubi-code symbols <file>`/
      );
      expect(section).toMatch(
        /calls or instantiates `X`\?\s*\|\s*`musubi-code refs X`, `musubi-code callers X`/
      );
      expect(section).toContain('`musubi-code deps <file>`, `musubi-code dependents <file>`');
      expect(section).toContain('No definition named');
      expect(section).toContain('where an SDD command, prompt or skill says to grep for code');
      expect(section).toContain(
        'Markdown, templates, configuration, comments, string-keyed registries'
      );
    }
    expect(read(root, 'CLAUDE.md')).toContain('when a grep searches for an indexed name');
    expect(read(root, 'AGENTS.md')).not.toContain('.claude/settings.json');
  });

  test('the skill description covers definition questions within the listing cap (REQ-NAV-003)', () => {
    root = makeTempProject({ 'package.json': '{}' });
    setupCodeIndex(root, { agents: ['claude-code'] });
    const skill = read(root, '.claude/skills/code-references/SKILL.md').replace(/\r\n/g, '\n');
    const description = skill
      .match(/\ndescription: \|\n([\s\S]*?)\n[a-z-]+:/)[1]
      .replace(/^ {2}/gm, '');
    for (const term of ['where is X defined', 'does X exist', 'is X exported', 'find definition']) {
      expect(description).toContain(term);
    }
    expect(description.length).toBeLessThanOrEqual(1536);
    expect(skill).toContain('`musubi-code symbols user.js`');
  });

  test('writes one section per instruction file for other agents, without Claude files', () => {
    root = makeTempProject({ 'package.json': '{}', 'GEMINI.md': '# Gemini\n' });
    const result = setupCodeIndex(root, { agents: ['copilot', 'cursor', 'gemini'] });
    expect(statuses(result)).toEqual({
      '.gitignore': 'created',
      'AGENTS.md': 'created',
      'GEMINI.md': 'updated',
    });
    expect(read(root, 'AGENTS.md')).not.toContain('code-references');
    expect(fs.existsSync(path.join(root, '.claude'))).toBe(false);
  });

  test('skips non-JavaScript projects unless forced, and dry runs write nothing', () => {
    root = makeTempProject({ 'pyproject.toml': '' });
    expect(setupCodeIndex(root).skippedReason).toMatch(/package\.json/);
    const dry = setupCodeIndex(root, { force: true, dryRun: true });
    expect(hasChanges(dry)).toBe(true);
    expect(fs.readdirSync(root)).toEqual(['pyproject.toml']);
  });

  test('leaves invalid settings.json untouched and warns', () => {
    root = makeTempProject({ 'package.json': '{}', '.claude/settings.json': '{ broken' });
    const result = setupCodeIndex(root, { agents: ['claude-code'] });
    expect(statuses(result)['.claude/settings.json']).toBe('skipped');
    expect(result.warnings[0]).toMatch(/not valid JSON/);
    expect(read(root, '.claude/settings.json')).toBe('{ broken');
  });

  test('mergeHookSettings keeps unrelated hook groups and non-array values', () => {
    const merged = mergeHookSettings(
      {
        hooks: { Stop: [{ hooks: [{ type: 'command', command: 'echo done' }] }], PostToolUse: 'x' },
      },
      'musubi-code'
    );
    expect(merged.hooks.Stop).toHaveLength(1);
    expect(merged.hooks.PostToolUse).toHaveLength(1);
  });
});
