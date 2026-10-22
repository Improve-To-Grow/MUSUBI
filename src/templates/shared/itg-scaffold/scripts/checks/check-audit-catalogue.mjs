// The action table of documentation/AUDIT_LOGGING.md is generated from src/lib/logs/allowlist.ts.
// Without arguments the check fails when the committed table differs; `--write` (npm run
// audit:catalogue) writes it (ITG Software Delivery Playbook §9.4, §9.6, Appendix C.3).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, exists, finish, read, stripComments } from './lib.mjs';

const ALLOWLIST = 'src/lib/logs/allowlist.ts';
const CATALOGUE = 'documentation/AUDIT_LOGGING.md';
const START = '<!-- audit-catalogue:start -->';
const END = '<!-- audit-catalogue:end -->';

function generatedTable() {
  const source = stripComments(read(ALLOWLIST));
  const rows = [
    ...source.matchAll(/registerMetadataAllowlist\(\s*['"]([^'"]+)['"]\s*,\s*\[([^\]]*)\]/g),
  ]
    .map(([, action, list]) => {
      const keys = [...list.matchAll(/['"]([^'"]+)['"]/g)].map(match => `\`${match[1]}\``);
      return `| \`${action}\` | ${keys.join(', ') || '—'} |`;
    })
    .sort();
  return ['| Action | Metadata keys |', '| --- | --- |', ...rows].join('\n');
}

const problems = [];
if (!exists(ALLOWLIST)) problems.push(`${ALLOWLIST} is missing`);
if (!exists(CATALOGUE)) problems.push(`${CATALOGUE} is missing`);

if (problems.length === 0) {
  const document = read(CATALOGUE);
  const start = document.indexOf(START);
  const end = document.indexOf(END);
  if (start === -1 || end < start) {
    problems.push(`${CATALOGUE} has no ${START} … ${END} markers around the action table`);
  } else {
    const committed = document.slice(start + START.length, end).trim();
    const table = generatedTable();
    if (process.argv.includes('--write')) {
      const updated = `${document.slice(0, start + START.length)}\n${table}\n${document.slice(end)}`;
      fs.writeFileSync(path.join(ROOT, CATALOGUE), updated);
      console.log(`check-audit-catalogue: wrote the action table of ${CATALOGUE}`);
    } else if (committed !== table) {
      problems.push(`${CATALOGUE} is stale: run npm run audit:catalogue and commit the table`);
    }
  }
}

finish('check-audit-catalogue', problems);
