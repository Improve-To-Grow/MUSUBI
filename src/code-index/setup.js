/**
 * Code index setup - configures a JavaScript/TypeScript project for musubi-code
 *
 * Shared by `musubi init`, `musubi-upgrade` and `musubi-code setup`. It writes:
 * - `.scip/` to .gitignore
 * - Claude Code: the `code-references` skill, async hooks in `.claude/settings.json` that keep
 *   the index fresh, and synchronous PreToolUse hooks that point grep searches for indexed
 *   names to `refs` (./hint.js)
 * - every selected agent: a marked "Code Navigation" section in its instruction file
 *   (CLAUDE.md, AGENTS.md, GEMINI.md, QWEN.md)
 *
 * Idempotent: a second run reports every file as unchanged. It never builds the index; the
 * first hook or query does that.
 *
 * @module code-index/setup
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { agentDefinitions } = require('../agents/registry');
const { isJavaScriptProject } = require('./indexer');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'code-index');
const SKILL_NAME = 'code-references';
const DEFAULT_COMMAND = 'musubi-code';
const SECTION_START = '<!-- musubi-code:start -->';
const SECTION_END = '<!-- musubi-code:end -->';
const HOOK_TOOLS = 'Edit|Write|MultiEdit|Bash|PowerShell';
// Shell commands that search files: the hint hook runs only for these (Claude Code `if` filter).
const HINT_SHELL_FILTERS = {
  Bash: ['Bash(grep *)', 'Bash(rg *)', 'Bash(git grep *)'],
  PowerShell: ['PowerShell(Select-String *)'],
};
const HINT_TIMEOUT_SECONDS = 10;
// Hook commands written by this setup, including the earlier `scripts/scip-index.js` form.
const OWN_HOOK_PATTERN = /musubi-code(?:\.js)?\s+(?:index|hint)\s+--hook|scip-index\.js\s+--hook/;

/**
 * Resolve an agent key or alias (`claude`, `--copilot`, ...) to a registry key.
 * @param {string} name
 * @returns {string}
 */
function resolveAgentKey(name) {
  const key = String(name).replace(/^--/, '');
  if (agentDefinitions[key]) return key;
  for (const [agentKey, def] of Object.entries(agentDefinitions)) {
    if ((def.aliasFlags || []).some(flag => flag.replace(/^--/, '') === key)) return agentKey;
  }
  throw new Error(
    `Unknown agent "${name}". Use one of: ${Object.keys(agentDefinitions).join(', ')}`
  );
}

/**
 * Agents that a project is already set up for, judged by their files. Claude Code when none.
 * @param {string} root
 * @returns {string[]}
 */
function detectAgents(root) {
  const exists = rel => Boolean(rel) && fs.existsSync(path.join(root, rel));
  const found = Object.entries(agentDefinitions)
    .filter(([key, def]) => {
      const { skillsDir, commandsDir, agentsFile, agentDir } = def.layout;
      if (exists(skillsDir) || exists(commandsDir) || exists(agentsFile)) return true;
      // .github exists in most repositories, so it does not identify GitHub Copilot.
      if (agentDir !== '.github' && exists(agentDir)) return true;
      return key === 'claude-code' && exists('CLAUDE.md');
    })
    .map(([key]) => key);
  return found.length ? found : ['claude-code'];
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Write `content` (LF line endings) to `file` unless it is already there, keeping the
 * file's existing line-ending style.
 * @returns {'created'|'updated'|'unchanged'}
 */
function writeIfChanged(file, content, dryRun) {
  const existing = readText(file);
  const normalizedExisting = existing === null ? null : existing.replace(/\r\n/g, '\n');
  if (normalizedExisting === content) return 'unchanged';
  if (!dryRun) {
    const eol = existing && existing.includes('\r\n') ? '\r\n' : '\n';
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, eol === '\n' ? content : content.replace(/\n/g, eol));
  }
  return existing === null ? 'created' : 'updated';
}

function gitignoreContent(existing) {
  const text = (existing || '').replace(/\r\n/g, '\n');
  if (text.split('\n').some(line => /^\/?\.scip\/?$/.test(line.trim()))) return text;
  const block = '# MUSUBI code index (musubi-code)\n.scip/\n';
  if (!text) return block;
  return `${text.replace(/\n*$/, '\n')}\n${block}`;
}

function renderSkill(command) {
  const template = fs.readFileSync(path.join(TEMPLATE_DIR, 'SKILL.md'), 'utf8');
  return template.replace(/\r\n/g, '\n').split('{{CODE_CMD}}').join(command);
}

/**
 * Hook groups for `.claude/settings.json`, per event.
 * @param {string} command
 */
function hookGroups(command) {
  const index = () => ({ type: 'command', command: `${command} index --hook`, async: true });
  const hintCommand =
    command === DEFAULT_COMMAND
      ? `${command} hint --hook`
      : `${command} hint --hook --command ${JSON.stringify(command)}`;
  // Synchronous: Claude Code discards the output of async hooks, and the hint is that output.
  const hint = condition => ({
    type: 'command',
    command: hintCommand,
    ...(condition ? { if: condition } : {}),
    timeout: HINT_TIMEOUT_SECONDS,
  });
  return {
    SessionStart: [{ matcher: 'startup|resume', hooks: [index()] }],
    PostToolUse: [{ matcher: HOOK_TOOLS, hooks: [index()] }],
    PreToolUse: [
      { matcher: 'Grep', hooks: [hint()] },
      ...Object.entries(HINT_SHELL_FILTERS).map(([tool, filters]) => ({
        matcher: tool,
        hooks: filters.map(hint),
      })),
    ],
  };
}

/**
 * Merge the code index hooks into Claude Code settings, replacing earlier versions of them
 * and keeping every other setting and hook.
 * @param {object} settings - parsed settings.json (may be empty)
 * @param {string} command
 * @returns {object} new settings object
 */
function mergeHookSettings(settings, command) {
  const next = JSON.parse(JSON.stringify(settings || {}));
  if (!next.hooks || typeof next.hooks !== 'object' || Array.isArray(next.hooks)) next.hooks = {};
  for (const [event, ownGroups] of Object.entries(hookGroups(command))) {
    const groups = Array.isArray(next.hooks[event]) ? next.hooks[event] : [];
    const kept = [];
    for (const existing of groups) {
      if (!existing || !Array.isArray(existing.hooks)) {
        kept.push(existing);
        continue;
      }
      const hooks = existing.hooks.filter(
        h => !(h && typeof h.command === 'string' && OWN_HOOK_PATTERN.test(h.command))
      );
      if (hooks.length) kept.push({ ...existing, hooks });
    }
    next.hooks[event] = [...kept, ...ownGroups];
  }
  return next;
}

/** A Markdown table with padded columns. */
function markdownTable(header, rows) {
  const widths = header.map((cell, i) => Math.max(cell.length, ...rows.map(row => row[i].length)));
  const line = cells => `| ${cells.map((cell, i) => cell.padEnd(widths[i])).join(' | ')} |`;
  return [line(header), line(widths.map(w => '-'.repeat(w))), ...rows.map(line)];
}

/**
 * The marked instruction-file section: symbol questions go to the index before grep.
 * @param {string} command
 * @param {boolean} forClaude - mention the skill and hooks
 */
function instructionSection(command, forClaude) {
  const code = text => `\`${command} ${text}\``;
  const lines = [
    SECTION_START,
    '## Code Navigation',
    '',
    `Answer symbol questions with \`${command}\` before grep. A symbol question is about a class,`,
    'function, method, constant or module in the indexed code: does it exist, where is it defined,',
    'what does a file export, who uses it, what depends on a file.',
    '',
    ...markdownTable(
      ['Question', 'Command'],
      [
        [
          'Does `X` exist? Where is it defined?',
          `${code('refs X')}: each result starts with kind and file:line; "No definition named" means absent`,
        ],
        ['What does a file define or export?', code('symbols <file>')],
        ['Who references, calls or instantiates `X`?', `${code('refs X')}, ${code('callers X')}`],
        [
          'What does a file load, and what loads it?',
          `${code('deps <file>')}, ${code('dependents <file>')}`,
        ],
      ]
    ),
    '',
    'This also applies where an SDD command, prompt or skill says to grep for code. Use grep for',
    'text the index does not cover: Markdown, templates, configuration, comments, string-keyed registries',
    'and dynamic `require()` paths, and once for the name as a string before a rename or deletion.',
    `${code('status')} lists the indexed directories. The index is compiler-accurate (scip-typescript,`,
    '`.scip/`) and is rebuilt first when source files changed.',
  ];
  if (forClaude) {
    lines.push(
      '',
      'The `code-references` skill lists all options. Hooks in `.claude/settings.json` keep the index',
      'fresh and add a note when a grep searches for an indexed name.'
    );
  }
  lines.push(SECTION_END);
  return lines.join('\n');
}

function upsertSection(existing, section) {
  const text = (existing || '').replace(/\r\n/g, '\n');
  const start = text.indexOf(SECTION_START);
  const end = text.indexOf(SECTION_END);
  if (start >= 0 && end > start) {
    return text.slice(0, start) + section + text.slice(end + SECTION_END.length);
  }
  if (!text) return `${section}\n`;
  return `${text.replace(/\n*$/, '\n')}\n${section}\n`;
}

/**
 * Configure a project for musubi-code.
 * @param {string} root - project root
 * @param {object} [opts]
 * @param {string[]} [opts.agents] - agent keys or aliases (default: detected from the project)
 * @param {string} [opts.command] - command the hooks, skill and instructions call
 * @param {boolean} [opts.dryRun] - report what would change without writing
 * @param {boolean} [opts.force] - also set up a directory without package.json/tsconfig.json
 * @returns {{root: string, agents: string[], command: string, dryRun: boolean,
 *   skippedReason: string|null, changes: Array<{file: string, status: string}>, warnings: string[]}}
 */
function setupCodeIndex(
  root,
  { agents, command = DEFAULT_COMMAND, dryRun = false, force = false } = {}
) {
  const projectRoot = path.resolve(root);
  const agentKeys = [
    ...new Set((agents && agents.length ? agents : detectAgents(projectRoot)).map(resolveAgentKey)),
  ];
  const result = {
    root: projectRoot,
    agents: agentKeys,
    command,
    dryRun,
    skippedReason: null,
    changes: [],
    warnings: [],
  };

  if (!force && !isJavaScriptProject(projectRoot)) {
    result.skippedReason =
      'no package.json, tsconfig.json or jsconfig.json (use --force to set up anyway)';
    return result;
  }
  const record = (rel, status) => result.changes.push({ file: rel, status });

  const gitignorePath = path.join(projectRoot, '.gitignore');
  record(
    '.gitignore',
    writeIfChanged(gitignorePath, gitignoreContent(readText(gitignorePath)), dryRun)
  );

  if (agentKeys.includes('claude-code')) {
    const skillsDir = agentDefinitions['claude-code'].layout.skillsDir;
    const skillRel = `${skillsDir}/${SKILL_NAME}/SKILL.md`;
    record(
      skillRel,
      writeIfChanged(path.join(projectRoot, skillRel), renderSkill(command), dryRun)
    );

    const settingsRel = '.claude/settings.json';
    const settingsPath = path.join(projectRoot, settingsRel);
    const raw = readText(settingsPath);
    let settings = {};
    let parsed = true;
    if (raw !== null && raw.trim()) {
      try {
        settings = JSON.parse(raw);
      } catch (error) {
        parsed = false;
        result.warnings.push(
          `${settingsRel} is not valid JSON (${error.message}); hooks not added`
        );
        record(settingsRel, 'skipped');
      }
    }
    if (parsed) {
      const merged = `${JSON.stringify(mergeHookSettings(settings, command), null, 2)}\n`;
      const unchanged =
        raw !== null &&
        raw.trim() &&
        JSON.stringify(settings) === JSON.stringify(JSON.parse(merged));
      record(settingsRel, unchanged ? 'unchanged' : writeIfChanged(settingsPath, merged, dryRun));
    }
  }

  const docFiles = [
    ...new Set(agentKeys.map(key => agentDefinitions[key].layout.docFile).filter(Boolean)),
  ];
  for (const docFile of docFiles) {
    const docPath = path.join(projectRoot, docFile);
    const section = instructionSection(command, docFile === 'CLAUDE.md');
    record(docFile, writeIfChanged(docPath, upsertSection(readText(docPath), section), dryRun));
  }
  return result;
}

/**
 * Has setup changed (or would it change) anything?
 * @param {object} result - from setupCodeIndex
 */
function hasChanges(result) {
  return result.changes.some(c => c.status === 'created' || c.status === 'updated');
}

module.exports = {
  DEFAULT_COMMAND,
  SECTION_START,
  SECTION_END,
  resolveAgentKey,
  detectAgents,
  mergeHookSettings,
  instructionSection,
  upsertSection,
  setupCodeIndex,
  hasChanges,
};
