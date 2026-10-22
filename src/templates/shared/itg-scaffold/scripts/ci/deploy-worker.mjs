// Deploys a Worker with its server configuration as `--var KEY:VALUE` arguments
// (ITG Software Delivery Playbook §8.2.1). Each argument is passed on its own, so values with spaces
// (EMAIL_SENDER_NAME) arrive intact, which a single wrangler-action command string does not do.
//
//   node scripts/ci/deploy-worker.mjs app <environment>     reads .app-vars.json
//   node scripts/ci/deploy-worker.mjs relay <environment>   reads .relay-vars.json, workers/log-relay/
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { printHelp } from '../checks/lib.mjs';

if (process.argv.includes('--help')) printHelp(import.meta.url);

const TARGETS = {
  app: { vars: '.app-vars.json', config: [] },
  relay: { vars: '.relay-vars.json', config: ['--config', 'workers/log-relay/wrangler.jsonc'] },
};

const [target, environment] = process.argv.slice(2);
if (!TARGETS[target] || !environment) {
  console.error('usage: deploy-worker.mjs app|relay <environment>');
  process.exit(1);
}

const vars = JSON.parse(fs.readFileSync(TARGETS[target].vars, 'utf8'));
const args = ['wrangler', 'deploy', '--env', environment, ...TARGETS[target].config];
for (const [key, value] of Object.entries(vars)) args.push('--var', `${key}:${value}`);

const result = spawnSync('npx', args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
