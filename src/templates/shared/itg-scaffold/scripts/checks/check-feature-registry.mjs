// Every folder under src/features/ is declared in src/lib/features/registry.ts, and the registry names
// no folder that does not exist, so every feature can be switched off
// (ITG Software Delivery Playbook §11.11, Appendix C.3).
import { exists, finish, printHelp, read, stripComments, subdirectories } from './lib.mjs';

if (process.argv.includes('--help')) printHelp(import.meta.url);

const REGISTRY = 'src/lib/features/registry.ts';

const folders = subdirectories('src/features');
const registered = exists(REGISTRY)
  ? [...stripComments(read(REGISTRY)).matchAll(/\bname\s*:\s*['"]([^'"]+)['"]/g)].map(
      match => match[1]
    )
  : [];

const problems = [];
if (folders.length > 0 && !exists(REGISTRY)) problems.push(`${REGISTRY} is missing`);
for (const folder of folders.filter(folder => !registered.includes(folder))) {
  problems.push(`src/features/${folder} is not declared in ${REGISTRY}`);
}
for (const name of registered.filter(name => !folders.includes(name))) {
  problems.push(`${REGISTRY} declares ${name}, but src/features/${name} does not exist`);
}

finish('check-feature-registry', problems);
