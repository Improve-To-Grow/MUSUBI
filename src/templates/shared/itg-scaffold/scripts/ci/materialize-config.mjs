// Writes the GitHub Environment's Variables and Secrets to where each deployable reads them
// (ITG Software Delivery Playbook §2.1.3, §8.2.1). The class and the readers of every key come from
// the block headers of the committed .env.example (Appendix C.1), so there is no second key list.
//
//   --deploy      .env.production (Public), .app-vars.json / .relay-vars.json (server configuration),
//                 .secrets.json / .relay-secrets.json (credentials)
//   --functions   functions/.env.<FIREBASE_PROJECT_ID> (server configuration), .functions-secrets.json
//   --github-env  every key with a value, CI-only credentials included, to $GITHUB_ENV (CI jobs)
//
// Input: VARS_JSON = toJSON(vars), SECRETS_JSON = toJSON(secrets). CI-only credentials never reach
// a deployable.
import fs from 'node:fs';

const HEADER = /^# ---- (.+?) ----\s+(.*)$/;
const KEY = /^([A-Z][A-Z0-9_]*)=/;

/** Every key of .env.example with its class and readers, read from the block headers */
function parseEnvExample(text) {
  const keys = [];
  let block = null;
  for (const line of text.split('\n')) {
    const header = line.match(HEADER);
    if (header) {
      block = describeBlock(header[1], header[2]);
      continue;
    }
    const key = line.match(KEY);
    if (key && block) keys.push({ key: key[1], ...block });
  }
  return keys;
}

function describeBlock(name, rest) {
  const cls = ['Public', 'Server configuration', 'Credentials'].find(c => rest.startsWith(c));
  if (!cls) throw new Error(`.env.example block "${name}" names no class: ${rest}`);
  const ciOnly = /\bCI only\b/.test(rest);
  const readers = new Set();
  if (!ciOnly) {
    if (rest.includes('workers/log-relay')) readers.add('relay');
    if (/functions\/\.env|Firebase Functions secret/.test(rest) || name.includes('(functions/)'))
      readers.add('functions');
    const appExcluded =
      /never pushed to the application Worker|application Worker has the LOG_QUEUE binding instead/.test(
        rest
      );
    if (!appExcluded && (readers.size === 0 || /application Worker|Worker's/.test(rest)))
      readers.add('app');
  }
  return { cls, ciOnly, readers: [...readers] };
}

function valueOf(entry, vars, secrets) {
  return entry.cls === 'Credentials' ? secrets[entry.key] : vars[entry.key];
}

const dotenvLine = (key, value) => `${key}=${JSON.stringify(String(value))}`;

function pick(entries, vars, secrets, filter) {
  const picked = {};
  for (const entry of entries.filter(filter)) {
    const value = valueOf(entry, vars, secrets);
    if (value !== undefined && value !== '') picked[entry.key] = value;
  }
  return picked;
}

function main() {
  const mode = process.argv[2];
  const vars = JSON.parse(process.env.VARS_JSON || '{}');
  const secrets = JSON.parse(process.env.SECRETS_JSON || '{}');
  const entries = parseEnvExample(fs.readFileSync('.env.example', 'utf8'));
  const deployable = reader => entry => !entry.ciOnly && entry.readers.includes(reader);
  const server = reader => entry =>
    entry.cls === 'Server configuration' && deployable(reader)(entry);
  const credential = reader => entry => entry.cls === 'Credentials' && deployable(reader)(entry);
  const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value), { mode: 0o600 });

  if (mode === '--deploy') {
    const publicValues = pick(entries, vars, secrets, entry => entry.cls === 'Public');
    fs.writeFileSync(
      '.env.production',
      Object.entries(publicValues)
        .map(([k, v]) => dotenvLine(k, v))
        .join('\n') + '\n'
    );
    writeJson('.app-vars.json', pick(entries, vars, secrets, server('app')));
    writeJson('.relay-vars.json', pick(entries, vars, secrets, server('relay')));
    writeJson('.secrets.json', pick(entries, vars, secrets, credential('app')));
    writeJson('.relay-secrets.json', pick(entries, vars, secrets, credential('relay')));
  } else if (mode === '--functions') {
    const projectId = vars.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error('the FIREBASE_PROJECT_ID Variable is not set');
    const config = pick(entries, vars, secrets, server('functions'));
    fs.writeFileSync(
      `functions/.env.${projectId}`,
      Object.entries(config)
        .map(([k, v]) => dotenvLine(k, v))
        .join('\n') + '\n'
    );
    writeJson('.functions-secrets.json', pick(entries, vars, secrets, credential('functions')));
  } else if (mode === '--github-env') {
    const all = pick(entries, vars, secrets, () => true);
    const lines = Object.entries(all).map(([k, v]) => {
      const delimiter = `EOF_${k}_${Date.now()}`;
      return `${k}<<${delimiter}\n${v}\n${delimiter}`;
    });
    fs.appendFileSync(process.env.GITHUB_ENV, lines.join('\n') + '\n');
  } else {
    throw new Error('usage: materialize-config.mjs --deploy | --functions | --github-env');
  }
}

main();
