// A PR that changes src/ also changes CHANGELOG.md (ITG Software Delivery Playbook §4.3, Appendix C.3).
// Run with BASE_REF set to the PR's base, e.g. BASE_REF=origin/staging.
import { changedFiles, finish, printHelp } from './lib.mjs';

if (process.argv.includes('--help')) printHelp(import.meta.url);

const files = changedFiles();
const problems =
  files.some(file => file.startsWith('src/')) && !files.includes('CHANGELOG.md')
    ? ['src/ changed but CHANGELOG.md did not: add an entry under Unreleased']
    : [];

finish('check-changelog', problems);
