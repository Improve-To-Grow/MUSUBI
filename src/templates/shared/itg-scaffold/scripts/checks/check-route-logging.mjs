// Every route emits at least one audit or app event: the wrapper's automatic event, whose route id is
// registered in the event catalogue, or an explicit recordAuditEvent / recordAppEvent call
// (ITG Software Delivery Playbook §9.1, Appendix C.3).
import { exists, finish, printHelp, read, stripComments, walk } from './lib.mjs';

if (process.argv.includes('--help')) printHelp(import.meta.url);

// The playbook does not name the catalogue file; this is the ITG MUSUBI scaffold's convention.
const CATALOGUE = 'src/lib/logs/route-events.ts';

const catalogue = exists(CATALOGUE) ? stripComments(read(CATALOGUE)) : '';
const isCatalogued = id => catalogue.includes(`'${id}'`) || catalogue.includes(`"${id}"`);

const problems = [];
for (const file of walk('src/app/api', /\/route\.(?:ts|tsx|js|mjs)$/)) {
  const source = stripComments(read(file));
  if (/\brecord(?:Audit|App)Event\s*\(/.test(source)) continue;

  const ids = [...source.matchAll(/withApiRoute\(\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
  if (ids.length === 0) {
    problems.push(
      `${file} emits no event: no withApiRoute route id and no recordAuditEvent / recordAppEvent call`
    );
  }
  for (const id of ids.filter(id => !isCatalogued(id))) {
    problems.push(
      `${file} route id ${id} is not in ${CATALOGUE} and the route records no event itself`
    );
  }
}

finish('check-route-logging', problems);
