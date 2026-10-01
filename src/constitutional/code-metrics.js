/**
 * Code Metrics
 *
 * Measures JavaScript and TypeScript source for the code-size limits of Article VII
 * (VII-4 to VII-6) and the doc-comment rule of Article I (I-5), as the constitution defines
 * them: lines of code (lines with something other than whitespace and comments), function
 * length (lines of code from the function's first line to its closing brace) and distinct
 * imports.
 *
 * A small lexer blanks comments, strings, template literals and regular expressions, so
 * braces and comment markers inside them do not count.
 *
 * Requirement: VII-4, VII-5, VII-6, I-5 (steering/rules/constitution.md)
 */

'use strict';

const CODE = 0;
const LINE_COMMENT = 1;
const BLOCK_COMMENT = 2;
const SINGLE_QUOTE = 3;
const DOUBLE_QUOTE = 4;
const TEMPLATE = 5;
const REGEX = 6;

// A `/` after these characters or keywords starts a regular expression, not a division
const REGEX_PRECEDERS = new Set('(,=:[!&|?{};+-*%<>~^'.split(''));
const REGEX_KEYWORDS = new Set([
  'return',
  'typeof',
  'case',
  'do',
  'else',
  'in',
  'of',
  'new',
  'delete',
  'void',
  'throw',
  'yield',
  'await',
  'instanceof',
]);
// Identifiers followed by `(…) {` that are statements, not methods
const NON_METHOD_KEYWORDS = new Set([
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'with',
  'function',
  'return',
  'typeof',
  'new',
  'await',
  'yield',
  'super',
  'import',
  'async',
]);
// Modifiers that can precede a method name
const MEMBER_MODIFIER_PATTERN =
  /(?:\b(?:static|async|get|set|public|private|protected|readonly|override|abstract)|\*)$/;
// `import x from 'y'`, `import 'y'`, `export { a } from 'y'`, `require('y')`, `import('y')`
const IMPORT_PATTERN =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const isWordChar = ch => /[\w$]/.test(ch);

/**
 * Lexer for JavaScript and TypeScript source: one method per state
 * @private
 */
class Lexer {
  /**
   * @param {string} content - Source
   */
  constructor(content) {
    this.src = String(content);
    this.code = new Array(this.src.length);
    this.kept = new Array(this.src.length);
    this.lineHasCode = [false, false];
    this.line = 1;
    this.state = CODE;
    this.braceDepth = 0;
    this.templateStack = [];
    this.prev = '';
    this.word = '';
    this.lastWord = '';
    this.inClass = false;
    this.comments = [];
    this.commentStart = -1;
  }

  /**
   * Lex the whole source
   * @returns {{code: string, withoutComments: string, lineHasCode: boolean[]}}
   */
  run() {
    const handlers = {
      [CODE]: i => this.inCode(i),
      [LINE_COMMENT]: i => this.inLineComment(i),
      [BLOCK_COMMENT]: i => this.inBlockComment(i),
      [SINGLE_QUOTE]: i => this.inQuote(i, "'"),
      [DOUBLE_QUOTE]: i => this.inQuote(i, '"'),
      [TEMPLATE]: i => this.inTemplate(i),
      [REGEX]: i => this.inRegex(i),
    };
    for (let i = 0; i < this.src.length; i++) {
      i = handlers[this.state](i);
    }
    return {
      code: this.code.join(''),
      withoutComments: this.kept.join(''),
      lineHasCode: this.lineHasCode,
      comments: this.comments,
    };
  }

  /**
   * Write character `i` to the outputs: as itself where `inCode`/`inKept`, else blank
   */
  emit(i, inCode, inKept) {
    const ch = this.src[i];
    const blank = ch === '\n' ? '\n' : ' ';
    this.code[i] = inCode ? ch : blank;
    this.kept[i] = inKept ? ch : blank;
    if (ch === '\n') {
      this.line++;
      this.lineHasCode[this.line] = false;
    } else if (!/\s/.test(ch) && this.state !== LINE_COMMENT && this.state !== BLOCK_COMMENT) {
      this.lineHasCode[this.line] = true;
    }
  }

  /**
   * Enter `state` at character `i`
   */
  enter(state, i, inKept) {
    this.state = state;
    if (state === LINE_COMMENT || state === BLOCK_COMMENT) this.commentStart = i;
    this.emit(i, false, inKept);
    return i;
  }

  /**
   * Leave a string, template or regex: what follows is a value, so `/` is a division
   */
  leaveLiteral() {
    this.state = CODE;
    this.prev = '"';
    this.word = '';
  }

  /**
   * Code state: detect comments, strings, templates and regexes; track words for `/`
   */
  inCode(i) {
    const ch = this.src[i];
    const next = this.src[i + 1];
    if (ch === '/' && next === '/') return this.enter(LINE_COMMENT, i, false);
    if (ch === '/' && next === '*') return this.enter(BLOCK_COMMENT, i, false);
    if (ch === '/' && startsRegex(this.prev, this.word || this.lastWord)) {
      this.inClass = false;
      return this.enter(REGEX, i, true);
    }
    if (ch === "'") return this.enter(SINGLE_QUOTE, i, true);
    if (ch === '"') return this.enter(DOUBLE_QUOTE, i, true);
    if (ch === '`') return this.enter(TEMPLATE, i, true);
    if (ch === '}' && this.braceDepth === 0 && this.templateStack.length > 0) {
      // End of a template substitution `${…}`
      this.braceDepth = this.templateStack.pop();
      return this.enter(TEMPLATE, i, true);
    }
    this.trackCode(ch);
    this.emit(i, true, true);
    return i;
  }

  /**
   * Track braces and the last word and significant character of code
   */
  trackCode(ch) {
    if (ch === '{') this.braceDepth++;
    if (ch === '}') this.braceDepth--;
    if (isWordChar(ch)) {
      this.word += ch;
      this.prev = ch;
      return;
    }
    if (this.word) this.lastWord = this.word;
    this.word = '';
    if (!/\s/.test(ch)) {
      this.prev = ch;
      this.lastWord = '';
    }
  }

  /**
   * Line comment: ends at the newline
   */
  inLineComment(i) {
    const newline = this.src[i] === '\n';
    if (newline) {
      this.state = CODE;
      this.comments.push({ start: this.commentStart, end: i, doc: false });
    }
    this.emit(i, newline, newline);
    return i;
  }

  /**
   * Block comment: ends after `*` + `/`
   */
  inBlockComment(i) {
    this.emit(i, false, false);
    if (this.src[i] === '*' && this.src[i + 1] === '/') {
      this.emit(++i, false, false);
      this.state = CODE;
      const start = this.commentStart;
      this.comments.push({ start, end: i + 1, doc: this.src.startsWith('/**', start) });
    }
    return i;
  }

  /**
   * Quoted string: ends at the closing quote (or, unterminated, at the newline)
   */
  inQuote(i, quote) {
    const ch = this.src[i];
    this.emit(i, false, true);
    if (ch === '\\') return this.skipEscaped(i);
    if (ch === quote || ch === '\n') this.leaveLiteral();
    return i;
  }

  /**
   * Template literal: ends at the backtick; `${` enters a code substitution
   */
  inTemplate(i) {
    const ch = this.src[i];
    this.emit(i, false, true);
    if (ch === '\\') return this.skipEscaped(i);
    if (ch === '`') {
      this.leaveLiteral();
    } else if (ch === '$' && this.src[i + 1] === '{') {
      this.emit(++i, false, true);
      this.templateStack.push(this.braceDepth);
      this.braceDepth = 0;
      this.state = CODE;
      this.prev = '{';
      this.word = '';
    }
    return i;
  }

  /**
   * Regular expression literal: ends at `/` outside a character class, then its flags
   */
  inRegex(i) {
    const ch = this.src[i];
    this.emit(i, false, true);
    if (ch === '\\') return this.skipEscaped(i);
    if (ch === '[') this.inClass = true;
    else if (ch === ']') this.inClass = false;
    else if (ch === '\n') this.state = CODE;
    else if (ch === '/' && !this.inClass) {
      while (i + 1 < this.src.length && /[a-z]/i.test(this.src[i + 1])) this.emit(++i, false, true);
      this.leaveLiteral();
    }
    return i;
  }

  /**
   * Keep the character after a backslash inside a literal
   */
  skipEscaped(i) {
    if (i + 1 < this.src.length) this.emit(++i, false, true);
    return i;
  }
}

/**
 * Lex source code
 * @param {string} content - JavaScript or TypeScript source
 * @returns {{code: string, withoutComments: string, lineHasCode: boolean[], comments: Array}}
 *   code: comments, strings, templates and regexes replaced by spaces (newlines kept);
 *   withoutComments: only comments replaced; lineHasCode: per 1-based line;
 *   comments: { start, end, doc } of each comment (doc: a `/**` block comment)
 */
function lex(content) {
  return new Lexer(content).run();
}

/**
 * Whether a `/` in code starts a regular expression
 * @private
 */
function startsRegex(prev, word) {
  if (prev === '') return true;
  if (isWordChar(prev)) return REGEX_KEYWORDS.has(word);
  return REGEX_PRECEDERS.has(prev);
}

/**
 * Index of the bracket that closes the one at `open`, or -1
 * @private
 */
function matchForward(code, open) {
  const pairs = { '{': '}', '(': ')', '[': ']' };
  const opener = code[open];
  const closer = pairs[opener];
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === opener) depth++;
    else if (code[i] === closer && --depth === 0) return i;
  }
  return -1;
}

/**
 * Index of the `(` that opens the `)` at `close`, or -1
 * @private
 */
function matchBackward(code, close) {
  let depth = 0;
  for (let i = close; i >= 0; i--) {
    if (code[i] === ')') depth++;
    else if (code[i] === '(' && --depth === 0) return i;
  }
  return -1;
}

const skipSpaces = (code, i) => {
  while (i < code.length && /\s/.test(code[i])) i++;
  return i;
};

/**
 * Skip a TypeScript return type (`: Promise<{ a: string }>`) after a parameter list.
 * Returns the index of the next significant character.
 * @private
 */
function skipReturnType(code, i) {
  i = skipSpaces(code, i);
  if (code[i] !== ':') return i;
  i++;
  let depth = 0;
  let last = ':';
  while (i < code.length) {
    const ch = code[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '=' && code[i + 1] === '>') {
      i += 2;
      last = '=';
      continue;
    }
    if (depth === 0 && (ch === ';' || (ch === '{' && !':|&,<([='.includes(last)))) return i;
    if ('<([{'.includes(ch)) depth++;
    else if ('>)]}'.includes(ch)) depth--;
    last = ch;
    i++;
  }
  return i;
}

/**
 * Name a function from the code before it: `const name =`, `name:`, `name =`
 * @private
 */
function inferName(code, start) {
  const before = code.slice(Math.max(0, start - 120), start);
  const match = before.match(/([A-Za-z_$][\w$]*)\s*[:=]\s*(?:async\s*)?$/);
  return match ? match[1] : '(anonymous)';
}

/**
 * Find functions with block bodies
 * @private
 */
function findFunctions(code) {
  const byBody = new Map();
  const add = (bodyOpen, start, name) => {
    if (bodyOpen < 0 || code[bodyOpen] !== '{' || byBody.has(bodyOpen)) return;
    const bodyClose = matchForward(code, bodyOpen);
    if (bodyClose > bodyOpen) byBody.set(bodyOpen, { start, end: bodyClose, name });
  };

  // function declarations and expressions
  for (const m of code.matchAll(
    /\b(async\s+)?function\b\s*\*?\s*([A-Za-z_$][\w$]*)?\s*(?:<[^>()]*>)?\s*\(/g
  )) {
    const open = m.index + m[0].length - 1;
    const close = matchForward(code, open);
    if (close < 0) continue;
    add(skipReturnType(code, close + 1), m.index, m[2] || inferName(code, m.index));
  }

  // arrow functions with block bodies
  for (const m of code.matchAll(/=>\s*\{/g)) {
    let start = m.index;
    const before = code.slice(0, m.index).trimEnd();
    if (before.endsWith(')')) {
      const open = matchBackward(code, before.length - 1);
      if (open >= 0) start = open;
    } else {
      const param = before.match(/[A-Za-z_$][\w$]*$/);
      if (param) start = before.length - param[0].length;
    }
    add(m.index + m[0].length - 1, start, inferName(code, start));
  }

  // methods: `name(…) {` where a class member or object property starts
  for (const m of code.matchAll(/([A-Za-z_$#][\w$]*)\s*(?:<[^>()]*>)?\s*\(/g)) {
    if (NON_METHOD_KEYWORDS.has(m[1]) || !startsMember(code, m.index)) continue;
    const open = m.index + m[0].length - 1;
    const close = matchForward(code, open);
    if (close < 0) continue;
    add(skipReturnType(code, close + 1), m.index, m[1]);
  }

  return [...byBody.values()].sort((a, b) => a.start - b.start);
}

/**
 * Whether a class member or object property can start at `index`: after `{`, `}`, `;` or `,`,
 * optionally behind modifiers (`static`, `async`, `get`, `*`, …) and decorators (`@Get(…)`).
 * Rules out calls such as `list.join(…)`.
 * @private
 */
function startsMember(code, index) {
  let end = index;
  for (;;) {
    while (end > 0 && /\s/.test(code[end - 1])) end--;
    const before = code.slice(Math.max(0, end - 40), end);
    const modifier = before.match(MEMBER_MODIFIER_PATTERN);
    if (modifier) {
      end -= modifier[0].length;
      continue;
    }
    // Decorator: `@name` or `@name(…)`
    let decoratorEnd = end;
    if (code[end - 1] === ')') {
      const open = matchBackward(code, end - 1);
      if (open < 0) return false;
      decoratorEnd = open;
    }
    const decorator = code.slice(Math.max(0, decoratorEnd - 80), decoratorEnd).match(/@[\w$.]+$/);
    if (decorator) {
      end = decoratorEnd - decorator[0].length;
      continue;
    }
    return end === 0 || '{};,'.includes(code[end - 1]);
  }
}

/**
 * Measure source code
 * @param {string} content - JavaScript or TypeScript source
 * @returns {{linesOfCode: number, functions: Array<{name: string, startLine: number,
 *   endLine: number, linesOfCode: number}>, imports: Set<string>}}
 */
function measureCode(content) {
  const { code, withoutComments, lineHasCode } = lex(content);
  const lineStarts = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') lineStarts.push(i + 1);
  const lineOf = index => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
  const countCode = (from, to) => {
    let n = 0;
    for (let l = from; l <= to; l++) if (lineHasCode[l]) n++;
    return n;
  };

  const functions = findFunctions(code).map(fn => {
    const startLine = lineOf(fn.start);
    const endLine = lineOf(fn.end);
    return { name: fn.name, startLine, endLine, linesOfCode: countCode(startLine, endLine) };
  });

  // Imports in code only: `code` has strings blanked, so a match inside a string or
  // template literal starts with a blank there
  const imports = new Set();
  for (const match of withoutComments.matchAll(IMPORT_PATTERN)) {
    if (code[match.index] === ' ') continue;
    imports.add(match[1] || match[2] || match[3]);
  }

  return { linesOfCode: countCode(1, lineStarts.length), functions, imports };
}

module.exports = { lex, measureCode };
