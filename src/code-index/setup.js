/**
 * Code index setup - configures a JavaScript/TypeScript project for musubi-code
 *
 * Shared by `musubi init`, `musubi-upgrade` and `musubi-code setup`. It writes:
 * - `.scip/` to .gitignore
 * - Claude Code: the `code-references` skill and async hooks in `.claude/settings.json`
 *   that keep the index fresh
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
// Hook commands written by this setup, including the earlier `scripts/scip-index.js` form.
const OWN_HOOK_PATTERN = /musubi-code(?:\.js)?\s+index\s+--hook|scip-index\.js\s+--hook/;

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
 * Hook entries for `.claude/settings.json`.
 * @param {string} command
 */
function hookGroups(command) {
  const hook = () => ({ type: 'command', command: `${command} index --hook`, async: true });
  return {
    SessionStart: { matcher: 'startup|resume', hooks: [hook()] },
    PostToolUse: { matcher: HOOK_TOOLS, hooks: [hook()] },
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
  for (const [event, group] of Object.entries(hookGroups(command))) {
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
    kept.push(group);
    next.hooks[event] = kept;
  }
  return next;
}

/**
 * The marked instruction-file section.
 * @param {string} command
 * @param {boolean} forClaude - mention the skill and hooks
 */
function instructionSection(command, forClaude) {
  const lines = [
    SECTION_START,
    '## Code Navigation',
    '',
    'Use these commands instead of grep for questions such as "who calls, uses, instantiates or',
    'requires X" and "what depends on this file":',
    '',
    `- \`${command} refs <Name>\` - every reference (new, call, require, extends, ...) with the enclosing function`,
    `- \`${command} callers <Name>\` - functions that call or instantiate it`,
    `- \`${command} deps <file>\` and \`${command} dependents <file>\` - file dependencies in both directions`,
    `- \`${command} symbols <file>\` - definitions in a file`,
    '',
    'They read a compiler-accurate scip-typescript index in `.scip/` and rebuild it first when',
    'source files changed. Use grep only for names that appear as strings, such as dynamic',
    '`require()` paths, registries and templates.',
  ];
  if (forClaude) {
    lines.push(
      '',
      'The `code-references` skill lists all options; hooks in `.claude/settings.json` keep the',
      'index fresh in the background.'
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
