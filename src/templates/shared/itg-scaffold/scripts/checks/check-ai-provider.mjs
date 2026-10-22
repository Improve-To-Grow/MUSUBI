// The AI properties of ITG Software Delivery Playbook §11.8 (Appendix C.3): no public Gemini API
// endpoint, no Gemini client package, no `global` Vertex AI location, no Gemini API key variable.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { exists, finish, lineOf, printHelp, read, ROOT, walk } from './lib.mjs';

if (process.argv.includes('--help')) printHelp(import.meta.url);

const SOURCE_DIRS = ['src', 'functions', 'workers'];
const PACKAGES = ['@google/genai', '@google/generative-ai', '@ai-sdk/google'];
const PUBLIC_ENDPOINT = 'generativelanguage.googleapis.com';
const GLOBAL_LOCATION = /VERTEX_AI_LOCATION['"]?\s*[=:]\s*['"]?global\b|locations\/global\b/g;
const KEY_NAMES =
  /\b(GEMINI_API_KEY|GOOGLE_API_KEY|GOOGLE_GENAI_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY)\b/g;
const PACKAGE_IMPORT = new RegExp(
  `(?:from\\s+|require\\(\\s*|import\\(\\s*)['"](${PACKAGES.map(p => p.replace(/[/@]/g, '\\$&')).join('|')})(?:/[^'"]*)?['"]`,
  'g'
);

const sourceFiles = SOURCE_DIRS.flatMap(dir =>
  walk(dir, /\.(?:[cm]?[jt]sx?|json|jsonc|ya?ml|toml|env)$/)
);

function committedEnvFiles() {
  try {
    return execFileSync('git', ['ls-files', '.env*'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .filter(Boolean);
  } catch {
    // Not a git checkout: every root .env* file that is not a local file
    return fs.readdirSync(ROOT).filter(name => name.startsWith('.env') && !name.endsWith('.local'));
  }
}

const configFiles = [
  ...['wrangler.jsonc', 'wrangler.json', 'wrangler.toml'].filter(exists),
  ...committedEnvFiles(),
  ...walk('.github/workflows', /\.ya?ml$/),
];

const problems = [];
const scan = (file, pattern, message) => {
  const text = read(file);
  for (const match of text.matchAll(pattern))
    problems.push(`${file}:${lineOf(text, match.index)} ${message(match)}`);
};

for (const file of sourceFiles) {
  scan(
    file,
    new RegExp(PUBLIC_ENDPOINT.replace(/\./g, '\\.'), 'g'),
    () => 'public Gemini API endpoint; call Vertex AI'
  );
  scan(file, PACKAGE_IMPORT, match => `${match[1]} imported; call Vertex AI through REST`);
}
for (const file of [...sourceFiles, ...configFiles]) {
  scan(file, GLOBAL_LOCATION, () => 'global Vertex AI location; use the EU region (europe-west4)');
  scan(
    file,
    KEY_NAMES,
    match => `${match[1]}: no Gemini API key; Vertex AI uses a service account`
  );
}

const manifests = [
  'package.json',
  ...SOURCE_DIRS.flatMap(dir => walk(dir, /(^|\/)package\.json$/)),
];
for (const file of manifests.filter(exists)) {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  const declared = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ].flatMap(field => Object.keys(manifest[field] || {}));
  for (const name of declared.filter(name => PACKAGES.includes(name))) {
    problems.push(`${file} depends on ${name}; no Gemini client package is allowed`);
  }
}

finish('check-ai-provider', [...new Set(problems)]);
