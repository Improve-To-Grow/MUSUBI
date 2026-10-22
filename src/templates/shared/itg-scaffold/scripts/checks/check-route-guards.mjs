// Every route.ts exports its handlers through withApiRoute(...) with withAuth / withRole /
// withTenant or an explicit `public: true` (ITG Software Delivery Playbook §11.5, Appendix C.3).
import { finish, lineOf, read, stripComments, walk } from './lib.mjs';

const METHODS = 'GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS';
const GUARD = /\bwith(?:Auth|Role|Tenant)\s*\(|\bpublic\s*:\s*true\b/;

const problems = [];
for (const file of walk('src/app/api', /\/route\.(?:ts|tsx|js|mjs)$/)) {
  const source = stripComments(read(file));

  for (const match of source.matchAll(
    new RegExp(`export\\s+(?:async\\s+)?function\\s+(${METHODS})\\b`, 'g')
  )) {
    problems.push(
      `${file}:${lineOf(source, match.index)} ${match[1]} is a plain function, not wrapped in withApiRoute`
    );
  }
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    if (new RegExp(`\\b(${METHODS})\\b`).test(match[1])) {
      problems.push(
        `${file}:${lineOf(source, match.index)} export handlers as \`export const <METHOD> = withApiRoute(...)\``
      );
    }
  }

  for (const match of source.matchAll(
    new RegExp(`export\\s+const\\s+(${METHODS})\\s*=\\s*`, 'g')
  )) {
    const start = match.index + match[0].length;
    const next = source.indexOf('export ', start);
    const segment = source.slice(start, next === -1 ? undefined : next);
    const where = `${file}:${lineOf(source, match.index)} ${match[1]}`;
    if (!segment.startsWith('withApiRoute('))
      problems.push(`${where} is not wrapped in withApiRoute`);
    else if (!GUARD.test(segment))
      problems.push(`${where} has no guard (withAuth, withRole, withTenant or public: true)`);
  }
}

finish('check-route-guards', problems);
