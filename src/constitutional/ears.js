/**
 * EARS rule (Article IV)
 *
 * Requirements SHALL use one of the five EARS patterns (IV-1) and have a single
 * interpretation (IV-2).
 *
 * Requirement: IV-1, IV-2 (steering/rules/constitution.md)
 */

'use strict';

const { isRequirementsDoc } = require('./paths');

const EARS_START_PATTERN = /^(WHEN|WHILE|WHERE|IF|The)\b/;

const AMBIGUOUS_PATTERN = /\b(should|might|could|may)\b/;

/**
 * Split requirements text into requirement statements (items containing SHALL).
 * A statement starts at a list item, a requirement ID or an EARS keyword at the start of a
 * line; THEN/AND lines continue the previous statement.
 * @param {string} content - Markdown
 * @returns {string[]} Statements
 * @private
 */
function extractRequirementStatements(content) {
  const text = String(content).replace(/```[\s\S]*?```/g, '');
  const items = [];
  let current = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('|') || line.startsWith('>')) {
      current = null;
      continue;
    }
    const body = stripStatementPrefix(line);
    const continues = current !== null && /^(THEN|AND|the|and|then)\b/.test(body);
    const starts =
      /^([-*+]|\d+[.)])\s+/.test(line) ||
      body !== line ||
      EARS_START_PATTERN.test(line) ||
      current === null;

    if (continues || !starts) {
      current.push(body);
    } else {
      current = [body];
      items.push(current);
    }
  }

  return items.map(parts => parts.join(' ')).filter(item => /\bSHALL\b/.test(item));
}

/**
 * Remove list markers, bold labels and requirement IDs from the start of a line
 * @private
 */
function stripStatementPrefix(line) {
  return line
    .replace(/^([-*+]|\d+[.)])\s+/, '')
    .replace(/^\*\*[^*]+\*\*:?\s*/, '')
    .replace(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9.]+)+:?\s*/, '')
    .replace(/^\*\*[^*]+\*\*:?\s*/, '')
    .trim();
}

/**
 * Article IV: requirements SHALL use one of the five EARS patterns (IV-1) and have a single
 * interpretation (IV-2)
 * @param {Object} input - { rel, content, force } (force: check content of unknown type)
 * @returns {Object[]} Findings
 */
function checkEarsFormat({ rel = '', content, force = false }) {
  if (!force && !isRequirementsDoc(rel)) return [];

  const statements = extractRequirementStatements(content);
  if (statements.length === 0) {
    return [
      {
        article: 'IV',
        requirement: 'IV-1',
        message: 'IV-1: No EARS requirement statements (SHALL) found',
        suggestion:
          'Write each requirement as WHEN/WHILE/IF…THEN/WHERE … the <system> SHALL …, or "The <system> SHALL …"',
      },
    ];
  }

  const findings = [];
  const malformed = statements.filter(
    s => !EARS_START_PATTERN.test(s) || (/\bIF\b/.test(s) && !/\bTHEN\b/.test(s))
  );
  if (malformed.length > 0) {
    findings.push({
      article: 'IV',
      requirement: 'IV-1',
      message: `IV-1: ${malformed.length} requirement statement(s) do not follow an EARS pattern, e.g. "${truncate(malformed[0])}"`,
      suggestion:
        'Use WHEN [event], WHILE [state], IF [condition] THEN, WHERE [feature], or "The [system] SHALL"',
    });
  }

  const ambiguous = statements.filter(s => AMBIGUOUS_PATTERN.test(s));
  if (ambiguous.length > 0) {
    findings.push({
      article: 'IV',
      requirement: 'IV-2',
      message: `IV-2: ${ambiguous.length} requirement statement(s) use ambiguous keywords (should, may, might, could), e.g. "${truncate(ambiguous[0])}"`,
      suggestion: 'State one binding behavior with SHALL',
    });
  }
  return findings;
}

/**
 * @private
 */
function truncate(text, max = 80) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

module.exports = { checkEarsFormat, extractRequirementStatements };
