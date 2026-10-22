// Firebase Functions export Firebase triggers and schedules only: any onRequest or onCall under
// functions/src/ fails (ITG Software Delivery Playbook §2.2.2, Appendix C.3).
import { finish, lineOf, printHelp, read, stripComments, walk } from './lib.mjs';

if (process.argv.includes('--help')) printHelp(import.meta.url);

const problems = [];
for (const file of walk('functions/src', /\.(?:ts|js|mjs|cjs)$/)) {
  const source = stripComments(read(file));
  for (const match of source.matchAll(/\b(onRequest|onCall)\b/g)) {
    problems.push(
      `${file}:${lineOf(source, match.index)} ${match[1]}: HTTP Functions are not used; put the endpoint in a route handler`
    );
  }
}

finish('check-function-triggers', problems);
