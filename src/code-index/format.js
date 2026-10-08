/**
 * Code index output - plain-text rendering of query results for the musubi-code CLI
 *
 * @module code-index/format
 */

'use strict';

const DEFAULT_LIMIT = 100;

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function countTags(references) {
  const counts = new Map();
  for (const ref of references) counts.set(ref.tag, (counts.get(ref.tag) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, n]) => `${n} ${tag}`)
    .join(', ');
}

/**
 * @param {Array} results - from query.refsQuery
 * @param {number} [limit] - references shown per definition, 0 for all
 * @returns {string}
 */
function formatRefs(results, limit = DEFAULT_LIMIT) {
  const lines = [];
  for (const result of results) {
    const files = new Set(result.references.map(r => r.file));
    lines.push(`${result.name} (${result.kind}) ${result.file}:${result.line}`);
    lines.push(
      `  ${plural(result.references.length, 'reference')} in ${plural(files.size, 'file')}` +
        (result.references.length ? `: ${countTags(result.references)}` : '')
    );
    const shown = limit > 0 ? result.references.slice(0, limit) : result.references;
    let currentFile = null;
    for (const ref of shown) {
      if (ref.file !== currentFile) {
        lines.push(`  ${ref.file}`);
        currentFile = ref.file;
      }
      const caller = ref.caller ? `in ${ref.caller}` : 'top level';
      lines.push(
        `    ${String(ref.line).padStart(5)}  ${ref.tag.padEnd(7)}  ${truncate(caller, 32).padEnd(32)}  ${truncate(ref.text, 90)}`
      );
    }
    if (shown.length < result.references.length) {
      lines.push(
        `  ... ${result.references.length - shown.length} more (use --limit 0 to show all)`
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * @param {Array} results - from query.callersQuery
 * @returns {string}
 */
function formatCallers(results) {
  const lines = [];
  for (const result of results) {
    lines.push(`${result.name} (${result.kind}) ${result.file}:${result.line}`);
    if (result.callers.length === 0) lines.push('  no callers');
    for (const c of result.callers) {
      lines.push(`  ${c.file}  ${c.caller}  [${c.tags.join(', ')}] lines ${c.lines.join(', ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * @param {object} result - from query.depsQuery
 * @returns {string}
 */
function formatDeps(result) {
  const lines = [`${result.file} depends on ${plural(result.files.length, 'file')}:`];
  for (const f of result.files) {
    const required = f.required ? '  (require/import)' : '';
    const symbols = f.symbols ? `  ${plural(f.symbols, 'symbol')}` : '';
    lines.push(`  ${f.file}${required}${symbols}`);
  }
  if (result.packages.length)
    lines.push(`packages: ${result.packages.map(p => p.name).join(', ')}`);
  return lines.join('\n');
}

/**
 * @param {object} result - from query.dependentsQuery
 * @returns {string}
 */
function formatDependents(result) {
  const count = result.dependents.length;
  const lines = [`${plural(count, 'file')} depend${count === 1 ? 's' : ''} on ${result.file}:`];
  for (const d of result.dependents) {
    const symbols = d.symbols.length ? `  uses ${truncate(d.symbols.join(', '), 100)}` : '';
    lines.push(`  ${d.file}${d.required ? '  (require/import)' : ''}${symbols}`);
  }
  return lines.join('\n');
}

/**
 * @param {object} result - from query.symbolsQuery
 * @returns {string}
 */
function formatSymbols(result) {
  const lines = [`${result.file}:`];
  for (const s of result.symbols) {
    lines.push(`  ${String(s.line).padStart(5)}  ${s.kind.padEnd(11)}  ${s.name}`);
  }
  return lines.join('\n');
}

/**
 * @param {object} report - from indexer.statusReport
 * @returns {string}
 */
function formatStatus(report) {
  const excluded = report.exclude.length ? ` (excluding ${report.exclude.join(', ')})` : '';
  const lines = [
    `index:   ${report.index} (${report.state})`,
    `roots:   ${report.roots.join(', ')}${excluded}`,
    `files:   ${report.files} source files now`,
  ];
  if (report.meta) {
    lines.push(
      `built:   ${report.meta.builtAt} in ${report.meta.durationMs} ms, ${report.meta.files} files`
    );
    lines.push(`indexer: scip-typescript ${report.meta.indexer}, ${report.meta.tsconfig}`);
  }
  if (report.building) lines.push('build:   running');
  return lines.join('\n');
}

/**
 * @param {object} result - from setup.setupCodeIndex
 * @returns {string}
 */
function formatSetup(result) {
  if (result.skippedReason) return `Code navigation not set up: ${result.skippedReason}`;
  const verb = result.dryRun ? 'would be' : '';
  const lines = [`Code navigation for ${result.agents.join(', ')} (command: ${result.command})`];
  for (const change of result.changes) {
    const status =
      verb && change.status !== 'unchanged' ? `${verb} ${change.status}` : change.status;
    lines.push(`  ${status.padEnd(18)} ${change.file}`);
  }
  for (const warning of result.warnings) lines.push(`  warning: ${warning}`);
  return lines.join('\n');
}

module.exports = {
  DEFAULT_LIMIT,
  plural,
  truncate,
  formatRefs,
  formatCallers,
  formatDeps,
  formatDependents,
  formatSymbols,
  formatStatus,
  formatSetup,
};
