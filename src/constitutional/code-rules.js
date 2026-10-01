/**
 * Code rules (Articles I and VII)
 *
 * Code-size limits for lines of code per file (VII-4), per function (VII-5) and imports per
 * file (VII-6), and doc comments on the exports of core modules (I-5).
 *
 * Requirement: I-5, VII-4, VII-5, VII-6 (steering/rules/constitution.md)
 */

'use strict';

const { lex, measureCode } = require('./code-metrics');
const {
  isCodeFile,
  isTestFile,
  isCoreFile,
  isSourceFile,
  isImportLimitExempt,
} = require('./paths');

// Defaults of VII-4 to VII-6, as in constitution-levels.yml (configurable.code_limits)
const DEFAULT_LIMITS = { maxFileLines: 500, maxFunctionLines: 50, maxImports: 10 };

/**
 * Article VII: code-size limits for lines of code per file (VII-4), per function (VII-5) and
 * distinct imports per file (VII-6; index files exempt)
 * @param {Object} input - { rel, content, limits, profile }
 * @returns {Object[]} Findings
 */
function checkCodeSize({ rel, content, limits = DEFAULT_LIMITS, profile }) {
  if (!isSourceFile(rel, profile)) return [];

  const { linesOfCode, functions, imports } = measureCode(content);
  const findings = [];

  if (linesOfCode > limits.maxFileLines) {
    findings.push({
      article: 'VII',
      requirement: 'VII-4',
      message: `VII-4: File has ${linesOfCode} lines of code (limit ${limits.maxFileLines})`,
      suggestion: 'Split the file into modules with one responsibility each',
      definite: true,
    });
  }

  const longFunctions = functions.filter(fn => fn.linesOfCode > limits.maxFunctionLines);
  if (longFunctions.length > 0) {
    const list = longFunctions.map(
      fn =>
        `${fn.name} (line ${fn.startLine}, ${fn.linesOfCode} lines of code, limit ${limits.maxFunctionLines})`
    );
    findings.push({
      article: 'VII',
      requirement: 'VII-5',
      message: `VII-5: ${longFunctions.length} function(s) over the limit: ${summarize(list)}`,
      suggestion: 'Extract steps into named functions',
      definite: true,
    });
  }

  if (imports.size > limits.maxImports && !isImportLimitExempt(rel)) {
    findings.push({
      article: 'VII',
      requirement: 'VII-6',
      message: `VII-6: File imports ${imports.size} modules (limit ${limits.maxImports})`,
      suggestion: 'Split the file, or move the coordination into a smaller module',
      definite: true,
    });
  }
  return findings;
}

/**
 * Article I: each exported function and class of a core module SHALL have a doc comment
 * directly above its declaration (I-5, advisory)
 * @param {Object} input - { rel, content, profile }
 * @returns {Object[]} Findings
 */
function checkPublicInterfaceDocs({ rel, content, profile }) {
  if (!isCodeFile(rel) || isTestFile(rel) || !isCoreFile(rel, profile)) return [];

  const source = String(content);
  const { code, comments } = lex(source);
  const undocumented = exportedDeclarations(code)
    .filter(decl => !hasDocComment(source, decl.index, comments))
    .map(decl => decl.name);
  if (undocumented.length === 0) return [];

  return [
    {
      article: 'I',
      requirement: 'I-5',
      message: `I-5: Exported functions or classes without a doc comment: ${summarize([...new Set(undocumented)])}`,
      suggestion: 'Add a /** … */ comment above each exported function and class',
      definite: true,
      advisory: true,
      names: [...new Set(undocumented)],
    },
  ];
}

/**
 * Exported function and class declarations (ESM and CommonJS), with the index where each
 * declaration starts
 * @private
 */
function exportedDeclarations(code) {
  const declarations = [];
  const valueIsFunction =
    '(?:async\\s*)?(?:function\\b|\\([^)]*\\)\\s*(?::[^=;]+)?=>|[A-Za-z_$][\\w$]*\\s*=>|class\\b)';

  // ESM: export [default] [async] function name / export class Name
  for (const m of code.matchAll(
    /\bexport\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\s*\*?|class)\s*([A-Za-z_$][\w$]*)?/g
  )) {
    declarations.push({ name: m[1] || 'default', index: m.index });
  }
  // ESM: export const name = () => {} / function / class
  for (const m of code.matchAll(
    new RegExp(
      `\\bexport\\s+(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*(?::[^=]+)?=\\s*${valueIsFunction}`,
      'g'
    )
  )) {
    declarations.push({ name: m[1], index: m.index });
  }

  // CommonJS: module.exports = { a, b: c } / module.exports = name
  const names = new Set();
  const objectExport = code.match(/module\.exports\s*=\s*\{/);
  if (objectExport) {
    const open = objectExport.index + objectExport[0].length - 1;
    const close = matchBrace(code, open);
    for (const entry of code.slice(open + 1, close).split(',')) {
      const value = entry.includes(':') ? entry.split(':').pop() : entry;
      const name = value.trim().match(/^[A-Za-z_$][\w$]*$/);
      if (name) names.add(name[0]);
    }
  }
  const singleExport = code.match(/module\.exports\s*=\s*([A-Za-z_$][\w$]*)\s*;?\s*$/m);
  if (singleExport) names.add(singleExport[1]);

  for (const name of names) {
    const declaration = code.match(
      new RegExp(
        `(^|\\n)[ \\t]*((?:async\\s+)?function\\s*\\*?\\s*${name}\\s*\\(|class\\s+${name}\\b|(?:const|let|var)\\s+${name}\\s*=\\s*${valueIsFunction})`
      )
    );
    if (declaration) {
      declarations.push({
        name,
        index: declaration.index + declaration[0].indexOf(declaration[2]),
      });
    }
  }

  // CommonJS: exports.name = function / module.exports.name = () => {}
  for (const m of code.matchAll(
    new RegExp(`(?:module\\.)?exports\\.([A-Za-z_$][\\w$]*)\\s*=\\s*${valueIsFunction}`, 'g')
  )) {
    declarations.push({ name: m[1], index: m.index });
  }

  return declarations.sort((a, b) => a.index - b.index);
}

/**
 * Whether a doc comment (`/** … *\/`) ends directly above the declaration at `index`
 * (decorator lines in between are allowed)
 * @private
 */
function hasDocComment(source, index, comments) {
  let end = index;
  for (;;) {
    const before = source.slice(0, end).replace(/\s+$/, '');
    const decorator = before.match(/(^|\n)[ \t]*@[^\n]*$/);
    end = decorator ? before.length - decorator[0].length : before.length;
    if (!decorator) break;
  }
  const comment = comments.find(c => c.end === end);
  return Boolean(comment && comment.doc);
}

/**
 * @private
 */
function matchBrace(code, open) {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}' && --depth === 0) return i;
  }
  return code.length;
}

/**
 * @private
 */
function summarize(items, max = 5) {
  const shown = items.slice(0, max).join(', ');
  return items.length > max ? `${shown} (+${items.length - max} more)` : shown;
}

module.exports = { DEFAULT_LIMITS, checkCodeSize, checkPublicInterfaceDocs };
