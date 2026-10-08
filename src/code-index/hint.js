/**
 * Code index hint - a Claude Code PreToolUse hook that points grep searches for indexed names
 * to musubi-code
 *
 * Before the Grep tool, or a shell command that runs grep, rg, git grep or Select-String, the
 * hook checks the search pattern. When it consists only of names that the index defines, the
 * hook adds context listing those definitions and the `refs` command for each. It never blocks
 * or approves the call. It stays silent for text searches, for searches limited to paths or
 * file types outside the index, and when `.scip/names.json` (written by ./indexer.js) is
 * missing. It reads only that list, never the index, so it answers in milliseconds.
 *
 * CLI: bin/musubi-code.js (`musubi-code hint --hook`).
 *
 * @module code-index/hint
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  NAMES_VERSION,
  SOURCE_EXTENSIONS,
  loadConfig,
  isIndexedPath,
  coversDirectory,
  resolveHookRoot,
} = require('./indexer');

const DEFAULT_COMMAND = 'musubi-code';
const MAX_DEFINITIONS = 5;
const IDENTIFIER = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?$/;
// ripgrep and Grep tool `type` values that select indexed source files.
const SOURCE_TYPES = new Set(['js', 'ts', 'javascript', 'typescript', 'jsx', 'tsx']);
const REDIRECTION = /^(?:\d*|&)(?:>>?|<)/;
const BARE_REDIRECTION = /^(?:\d*|&)(?:>>?|<)$/;
const LEADING_KEYWORDS =
  /^(?:(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:class|function\*?|const|let|var|new|extends)\s+|(?:module\.)?exports\.)/;

// Options that take a value, per tool. Short options are single letters.
const OPTIONS = {
  grep: {
    short: 'efmABCdD',
    long: [
      'regexp',
      'file',
      'max-count',
      'after-context',
      'before-context',
      'context',
      'include',
      'exclude',
      'exclude-dir',
      'exclude-from',
      'label',
      'directories',
      'devices',
      'binary-files',
      'group-separator',
    ],
  },
  rg: {
    short: 'efgtTABCmMjrEd',
    long: [
      'regexp',
      'file',
      'glob',
      'iglob',
      'type',
      'type-not',
      'type-add',
      'type-clear',
      'after-context',
      'before-context',
      'context',
      'max-count',
      'max-columns',
      'threads',
      'replace',
      'encoding',
      'max-depth',
      'max-filesize',
      'sort',
      'sortr',
      'color',
      'colors',
      'path-separator',
      'pre',
      'pre-glob',
      'context-separator',
      'engine',
      'ignore-file',
    ],
  },
  'git grep': {
    short: 'efABCm',
    long: [
      'regexp',
      'file',
      'max-depth',
      'max-count',
      'threads',
      'after-context',
      'before-context',
      'context',
    ],
  },
};

/**
 * Split a command line into simple commands. Quotes are removed; with `backslashEscapes`
 * (POSIX shells) a backslash escapes the next character, otherwise (PowerShell) it is kept.
 * @param {string} command
 * @param {{backslashEscapes: boolean}} opts
 * @returns {Array<{words: string[], fromPipe: boolean}>}
 */
function splitCommands(command, { backslashEscapes }) {
  const commands = [];
  let words = [];
  let word = null;
  let fromPipe = false;
  const endWord = () => {
    if (word !== null) words.push(word);
    word = null;
  };
  const endCommand = nextFromPipe => {
    endWord();
    if (words.length) commands.push({ words, fromPipe });
    words = [];
    fromPipe = nextFromPipe;
  };
  const text = String(command || '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "'") {
      const end = text.indexOf("'", i + 1);
      const stop = end < 0 ? text.length : end;
      word = (word || '') + text.slice(i + 1, stop);
      i = stop;
    } else if (c === '"') {
      let j = i + 1;
      let quoted = '';
      while (j < text.length && text[j] !== '"') {
        if (backslashEscapes && text[j] === '\\' && '"\\$`'.includes(text[j + 1])) j += 1;
        quoted += text[j];
        j += 1;
      }
      word = (word || '') + quoted;
      i = j;
    } else if (backslashEscapes && c === '\\' && i + 1 < text.length) {
      word = (word || '') + text[i + 1];
      i += 1;
    } else if (c === ' ' || c === '\t' || c === '\r') {
      endWord();
    } else if (c === '\n' || c === ';' || c === '(' || c === ')') {
      endCommand(false);
    } else if (c === '&' && (text[i - 1] === '>' || text[i + 1] === '>')) {
      word = (word || '') + c; // redirection such as 2>&1
    } else if (c === '&') {
      if (text[i + 1] === '&') i += 1;
      endCommand(false);
    } else if (c === '|') {
      if (text[i + 1] === '|') {
        i += 1;
        endCommand(false);
      } else {
        endCommand(true);
      }
    } else {
      word = (word || '') + c;
    }
  }
  endCommand(false);
  return commands;
}

/** Drop redirections (`> file`, `2>/dev/null`, `2>&1`, `&> file`) from a word list. */
function withoutRedirections(words) {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    if (!REDIRECTION.test(words[i])) out.push(words[i]);
    // A bare operator takes the next word as its target.
    else if (BARE_REDIRECTION.test(words[i])) i += 1;
  }
  return out;
}

/**
 * Patterns, paths and file filters of one grep, rg or git grep invocation.
 * @param {string} tool - 'grep', 'rg' or 'git grep'
 * @param {string[]} args - arguments after the command name
 */
function parseGrepArgs(tool, args) {
  const spec = OPTIONS[tool];
  const patterns = [];
  const positionals = [];
  const globs = [];
  const types = [];
  let patternFile = false;
  const take = (name, value) => {
    if (value === undefined) return;
    if (name === 'e' || name === 'regexp') patterns.push(value);
    else if (name === 'f' || name === 'file') patternFile = true;
    else if (tool === 'grep' && name === 'include') globs.push(value);
    else if (tool === 'rg' && (name === 'g' || name === 'glob' || name === 'iglob')) {
      globs.push(value);
    } else if (tool === 'rg' && (name === 't' || name === 'type')) types.push(value);
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }
    if (arg.startsWith('--')) {
      const [name, value] = arg.slice(2).split(/=(.*)/s);
      if (value !== undefined) take(name, value);
      else if (spec.long.includes(name)) take(name, args[++i]);
    } else if (arg.startsWith('-') && arg.length > 1) {
      for (let k = 1; k < arg.length; k++) {
        if (!spec.short.includes(arg[k])) continue;
        const rest = arg.slice(k + 1);
        take(arg[k], rest || args[++i]);
        break;
      }
    } else {
      positionals.push(arg);
    }
  }
  if (!patterns.length && !patternFile && positionals.length) patterns.push(positionals.shift());
  return { patterns, paths: positionals, globs, types };
}

/**
 * Pattern, paths and include filters of one Select-String invocation.
 * @param {string[]} args
 */
function parseSelectStringArgs(args) {
  const valued = ['pattern', 'path', 'literalpath', 'include', 'exclude', 'encoding', 'context'];
  const named = {};
  const positionals = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('-') && args[i].length > 1) {
      const name = args[i].slice(1).split(':')[0].toLowerCase();
      const matches = valued.filter(v => v.startsWith(name));
      if (matches.length === 1) named[matches[0]] = args[++i];
    } else {
      positionals.push(args[i]);
    }
  }
  const pattern = named.pattern !== undefined ? named.pattern : positionals.shift();
  const filePath = named.path || named.literalpath || positionals.shift();
  return {
    patterns: pattern === undefined ? [] : [pattern],
    paths: filePath === undefined ? [] : [filePath],
    globs: named.include === undefined ? [] : [named.include],
    types: [],
  };
}

function shellSearches(command, { powershell }) {
  const searches = [];
  for (const { words, fromPipe } of splitCommands(command, { backslashEscapes: !powershell })) {
    let rest = withoutRedirections(words);
    while (rest.length && /^[A-Za-z_]\w*=/.test(rest[0])) rest = rest.slice(1);
    if (!rest.length) continue;
    const name = path
      .basename(rest[0].replace(/\\/g, '/'))
      .toLowerCase()
      .replace(/\.exe$/, '');
    let parsed = null;
    if (powershell && (name === 'select-string' || name === 'sls')) {
      parsed = parseSelectStringArgs(rest.slice(1));
    } else if (!powershell && ['grep', 'egrep', 'fgrep'].includes(name)) {
      parsed = parseGrepArgs('grep', rest.slice(1));
    } else if (!powershell && name === 'rg') {
      parsed = parseGrepArgs('rg', rest.slice(1));
    } else if (!powershell && name === 'git' && rest[1] === 'grep') {
      parsed = parseGrepArgs('git grep', rest.slice(2));
    }
    // A search without paths at the end of a pipe filters the output of another command.
    if (!parsed || (fromPipe && !parsed.paths.length)) continue;
    for (const pattern of parsed.patterns) {
      searches.push({ pattern, paths: parsed.paths, globs: parsed.globs, types: parsed.types });
    }
  }
  return searches;
}

/**
 * The searches a tool call is about to run.
 * @param {object} input - PreToolUse hook input
 * @returns {Array<{pattern: string, paths: string[], globs: string[], types: string[]}>}
 */
function parseSearches(input) {
  const toolInput = (input && input.tool_input) || {};
  const tool = input && input.tool_name;
  if (tool === 'Grep') {
    if (typeof toolInput.pattern !== 'string') return [];
    const list = value => (typeof value === 'string' && value ? [value] : []);
    return [
      {
        pattern: toolInput.pattern,
        paths: list(toolInput.path),
        globs: list(toolInput.glob),
        types: list(toolInput.type),
      },
    ];
  }
  if (tool === 'Bash') return shellSearches(toolInput.command, { powershell: false });
  if (tool === 'PowerShell') return shellSearches(toolInput.command, { powershell: true });
  return [];
}

/**
 * The names a search pattern looks for, or null when it is a text search. Word boundaries,
 * anchors, a leading `class`, `function`, `const`, `new`, `exports.` (and similar) and a
 * trailing `(` are ignored; alternatives separated by `|` are allowed.
 * @param {string} pattern
 * @returns {string[]|null}
 */
function symbolNames(pattern) {
  if (typeof pattern !== 'string') return null;
  let text = pattern
    .replace(/\\[b<>]/g, '')
    .replace(/\\s[+*]?/g, ' ')
    .replace(/\\\./g, '.')
    .replace(/\\\(/g, '(')
    .trim()
    .replace(/^\^/, '')
    .replace(/\$$/, '')
    .trim()
    .replace(LEADING_KEYWORDS, '')
    .replace(/\s*\($/, '')
    .trim();
  if (/^\([^()]*\)$/.test(text)) text = text.slice(1, -1);
  const parts = text.split('|').map(part => part.trim());
  if (!parts.length || !parts.every(part => IDENTIFIER.test(part))) return null;
  return [...new Set(parts)];
}

/** Does a glob select source files the index can cover? Negated globs do not restrict. */
function globCoversSource(glob) {
  const text = String(glob).trim();
  if (text.startsWith('!')) return true;
  const match = /\.(\{[^}]*\}|[A-Za-z0-9]+)$/.exec(text);
  if (!match) return true;
  const extensions = match[1].startsWith('{') ? match[1].slice(1, -1).split(',') : [match[1]];
  return extensions.some(ext => SOURCE_EXTENSIONS.has(`.${ext.trim().toLowerCase()}`));
}

function pathCoversIndex(cfg, base, rawPath) {
  let text = String(rawPath).replace(/\\/g, '/');
  // Git Bash paths such as /d/Code/project on Windows.
  if (process.platform === 'win32') text = text.replace(/^\/([A-Za-z])(?=\/|$)/, '$1:');
  const wildcard = text.search(/[*?[]/);
  if (wildcard >= 0) {
    const dir = text.slice(0, text.lastIndexOf('/', wildcard) + 1);
    if (!globCoversSource(text.slice(dir.length))) return false;
    text = dir || '.';
  }
  const full = path.resolve(base, text);
  let stat = null;
  try {
    stat = fs.statSync(full);
  } catch {
    // Missing path: decide by its name.
  }
  const isFile = stat ? stat.isFile() : Boolean(path.extname(full));
  return isFile ? isIndexedPath(cfg, full) : coversDirectory(cfg, full);
}

/**
 * Can a search reach files that the index covers?
 * @param {object} cfg - from indexer.loadConfig
 * @param {string} base - directory that relative paths start from
 * @param {{paths: string[], globs: string[], types: string[]}} search
 */
function coversIndex(cfg, base, search) {
  if (search.types.length && !search.types.some(t => SOURCE_TYPES.has(t.toLowerCase()))) {
    return false;
  }
  if (search.globs.length && !search.globs.some(globCoversSource)) return false;
  if (!search.paths.length) return coversDirectory(cfg, base);
  return search.paths.some(p => pathCoversIndex(cfg, base, p));
}

/**
 * The definition-name list written by the indexer, or null when missing or unreadable.
 * @param {object} cfg
 */
function readNames(cfg) {
  try {
    const data = JSON.parse(fs.readFileSync(cfg.namesPath, 'utf8'));
    if (!data || data.version !== NAMES_VERSION) return null;
    if (!data.names || typeof data.names !== 'object') return null;
    return data.names;
  } catch {
    return null;
  }
}

function listNames(names) {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * The context text for a tool call, or null when there is nothing to point out.
 * @param {object} cfg
 * @param {object} input - PreToolUse hook input
 * @param {{command: string}} opts
 */
function hintText(cfg, input, { command }) {
  const names = readNames(cfg);
  if (!names) return null;
  const base = typeof input.cwd === 'string' && input.cwd ? input.cwd : cfg.root;
  const wanted = [];
  for (const search of parseSearches(input)) {
    const parts = symbolNames(search.pattern);
    if (!parts || !coversIndex(cfg, base, search)) continue;
    for (const part of parts) if (!wanted.includes(part)) wanted.push(part);
  }
  const found = [];
  for (const query of wanted) {
    const key = query.slice(query.lastIndexOf('.') + 1);
    if (!Object.prototype.hasOwnProperty.call(names, key) || !Array.isArray(names[key])) continue;
    const entries = names[key].filter(
      e => query === key || e.name === query || String(e.name).endsWith(`.${query}`)
    );
    if (entries.length) found.push({ query, entries });
  }
  if (!found.length) return null;

  const lines = [
    `${command}: ${listNames(found.map(f => f.query))} ${found.length === 1 ? 'is' : 'are'} defined in the code index:`,
  ];
  const all = found.flatMap(f => f.entries);
  for (const e of all.slice(0, MAX_DEFINITIONS)) {
    lines.push(`  ${e.name} (${e.kind}) ${e.file}:${e.line}  ->  \`${command} refs ${e.name}\``);
  }
  if (all.length > MAX_DEFINITIONS) {
    const refs = found.map(f => `\`${command} refs ${f.query}\``).join(', ');
    lines.push(`  ... and ${all.length - MAX_DEFINITIONS} more: ${refs} lists them all`);
  }
  lines.push(
    `\`${command} refs\` gives the definition, exports and every reference, compiler-resolved.`,
    'Keep grep for text: Markdown, templates, comments and string-keyed lookups.'
  );
  return lines.join('\n');
}

/**
 * Claude Code PreToolUse hook entry point. Never throws.
 * @param {string} rawInput - hook JSON from stdin
 * @param {object} [opts]
 * @param {string} [opts.root] - project root (default: resolved from the hook input)
 * @param {string} [opts.command] - command named in the hint
 * @returns {string} hook output JSON, or '' to add nothing
 */
function runHint(rawInput, { root, command = DEFAULT_COMMAND } = {}) {
  try {
    const input = rawInput ? JSON.parse(rawInput) : null;
    if (!input || typeof input !== 'object') return '';
    const cfg = loadConfig(root || resolveHookRoot(input));
    const text = hintText(cfg, input, { command });
    if (!text) return '';
    return JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: text },
    });
  } catch {
    return '';
  }
}

module.exports = {
  parseSearches,
  symbolNames,
  readNames,
  runHint,
};
