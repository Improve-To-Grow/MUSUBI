/**
 * ITG project scaffold (CHANGE-008, REQ-ITG-008 to REQ-ITG-010): init writes the files of the
 * playbook's Appendix C, and the check and CI scripts behave as Appendix C.3 and §2.1.3 describe.
 * The scripts run in real temporary projects with plain Node, as CI runs them.
 */
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { version } = require('../../package.json');
const { targetPath, writeItgScaffold } = require('../../src/cli/init-scaffold');

let root;

beforeEach(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-itg-scaffold-'));
  await writeItgScaffold(root);
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

function write(rel, content) {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), content);
}

function run(script, args = [], env = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { status: result.status, output: result.stdout + result.stderr };
}

const check = (name, env) => run(`scripts/checks/${name}.mjs`, [], env);

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

function gitRepo() {
  git('init', '-q', '-b', 'staging');
  git('config', 'user.email', 'ci@example.com');
  git('config', 'user.name', 'CI');
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  git('checkout', '-q', '-b', 'feature/x');
}

function commitAll() {
  git('add', '-A');
  git('commit', '-q', '-m', 'change');
}

describe('writeItgScaffold (REQ-ITG-008)', () => {
  it('writes the dotted targets and fills the MUSUBI tag', () => {
    for (const rel of [
      '.env.example',
      '.github/pull_request_template.md',
      '.github/workflows/ci.yml',
      '.github/workflows/deploy.yml',
      '.github/workflows/ci-cleanup.yml',
      'scripts/checks/check-rules.mjs',
      'scripts/ci/materialize-config.mjs',
    ]) {
      expect(fs.existsSync(path.join(root, rel))).toBe(true);
    }
    const ci = fs.readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8');
    expect(ci).toContain(`MUSUBI#v${version}`);
    expect(ci).not.toContain('{{MUSUBI_TAG}}');
    // The constitution job runs the checks that fail on findings, not the musubi validate checklist
    expect(ci).toContain('- run: musubi-validate project');
    expect(ci).toContain('- run: musubi-trace ci-check');
    expect(ci).not.toMatch(/run: musubi validate\b/);
  });

  it('keeps files that exist', async () => {
    write('.env.example', 'MINE=1\n');
    const { written, skipped } = await writeItgScaffold(root);
    expect(written).toEqual([]);
    expect(skipped).toContain('.env.example');
    expect(fs.readFileSync(path.join(root, '.env.example'), 'utf8')).toBe('MINE=1\n');
  });

  it('maps template names to targets', () => {
    expect(targetPath('env.example')).toBe('.env.example');
    expect(targetPath('github/workflows/ci.yml')).toBe('.github/workflows/ci.yml');
    expect(targetPath('scripts/ci/migrate.mjs')).toBe('scripts/ci/migrate.mjs');
  });

  it('ships .env.example as Appendix C.1 of the playbook copy', () => {
    const playbook = fs.readFileSync(
      path.join(__dirname, '..', '..', 'docs', 'itg', 'ITG_Software_Delivery_Playbook.md'),
      'utf8'
    );
    const c1 = playbook
      .slice(playbook.indexOf('## C.1 `.env.example`'))
      .split('```bash\n')[1]
      .split('```')[0];
    expect(fs.readFileSync(path.join(root, '.env.example'), 'utf8')).toBe(c1);
  });

  it('passes every check in an empty project (REQ-ITG-009)', () => {
    for (const name of [
      'check-route-guards',
      'check-route-logging',
      'check-function-triggers',
      'check-feature-registry',
      'check-ai-provider',
    ]) {
      expect(check(name)).toMatchObject({ status: 0 });
    }
  });
});

describe('musubi-onboard (REQ-ITG-011)', () => {
  it('writes the scaffold into an existing project and keeps its files', () => {
    const existing = fs.mkdtempSync(path.join(os.tmpdir(), 'musubi-itg-onboard-'));
    try {
      fs.writeFileSync(path.join(existing, 'package.json'), JSON.stringify({ name: 'legacy-app' }));
      fs.writeFileSync(path.join(existing, '.env.example'), 'LEGACY=1\n');
      const onboard = path.join(__dirname, '..', '..', 'bin', 'musubi-onboard.js');
      const result = spawnSync(
        process.execPath,
        [onboard, existing, '--auto-approve', '--skip-memories'],
        {
          encoding: 'utf8',
        }
      );
      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Kept existing files: .env.example');
      expect(fs.readFileSync(path.join(existing, '.env.example'), 'utf8')).toBe('LEGACY=1\n');
      expect(fs.readFileSync(path.join(existing, 'steering/project.yml'), 'utf8')).toMatch(
        /constitution:\n {2}profile: application/
      );
      for (const rel of [
        '.github/workflows/deploy.yml',
        'scripts/checks/check-route-guards.mjs',
        'steering/rules/itg/README.md',
      ]) {
        expect(fs.existsSync(path.join(existing, rel))).toBe(true);
      }
    } finally {
      fs.rmSync(existing, { recursive: true, force: true });
    }
  });
});

describe('check-route-guards', () => {
  it('accepts a wrapped, guarded route and a public one', () => {
    write(
      'src/app/api/users/route.ts',
      "export const POST = withApiRoute('api-users-create', withRole('admin', h), { rateLimit: 'write' });\n"
    );
    write(
      'src/app/api/health/route.ts',
      "export const GET = withApiRoute('api-health-get', h, { public: true });\n"
    );
    expect(check('check-route-guards')).toMatchObject({ status: 0 });
  });

  it('names unwrapped and unguarded handlers with their line', () => {
    write('src/app/api/a/route.ts', '// comment\nexport async function GET() {}\n');
    write(
      'src/app/api/b/route.ts',
      "export const POST = withApiRoute('api-b-create', h, { rateLimit: 'write' });\n"
    );
    const result = check('check-route-guards');
    expect(result.status).toBe(1);
    expect(result.output).toContain('src/app/api/a/route.ts:2 GET is a plain function');
    expect(result.output).toContain('src/app/api/b/route.ts:1 POST has no guard');
  });
});

describe('check-route-logging', () => {
  it('accepts a catalogued route id or an explicit event call', () => {
    write('src/app/api/a/route.ts', "export const GET = withApiRoute('api-a-get', withAuth(h));\n");
    write(
      'src/lib/logs/route-events.ts',
      "export const ROUTE_EVENTS = { 'api-a-get': 'a.item.read' };\n"
    );
    write(
      'src/app/api/b/route.ts',
      "export const GET = withApiRoute('api-b-get', withAuth(async () => { recordAppEvent('b.item.read'); }));\n"
    );
    expect(check('check-route-logging')).toMatchObject({ status: 0 });
  });

  it('fails a route that emits no event', () => {
    write('src/app/api/c/route.ts', "export const GET = withApiRoute('api-c-get', withAuth(h));\n");
    const result = check('check-route-logging');
    expect(result.status).toBe(1);
    expect(result.output).toContain('route id api-c-get is not in src/lib/logs/route-events.ts');
  });
});

describe('check-function-triggers', () => {
  it('accepts triggers and schedules and fails onRequest / onCall', () => {
    write(
      'functions/src/index.ts',
      "import { onSchedule } from 'firebase-functions/v2/scheduler';\nexport const backup = onSchedule('0 2 * * *', run);\n"
    );
    expect(check('check-function-triggers')).toMatchObject({ status: 0 });
    write('functions/src/http.ts', "import { onRequest } from 'firebase-functions/v2/https';\n");
    const result = check('check-function-triggers');
    expect(result.status).toBe(1);
    expect(result.output).toContain('functions/src/http.ts:1 onRequest');
  });
});

describe('check-feature-registry', () => {
  it('fails missing and extra registry entries', () => {
    fs.mkdirSync(path.join(root, 'src/features/leads'), { recursive: true });
    fs.mkdirSync(path.join(root, 'src/features/users'), { recursive: true });
    write(
      'src/lib/features/registry.ts',
      "export const FEATURES = [{ name: 'leads', pages: [] }, { name: 'reports', pages: [] }];\n"
    );
    const result = check('check-feature-registry');
    expect(result.status).toBe(1);
    expect(result.output).toContain('src/features/users is not declared');
    expect(result.output).toContain('declares reports, but src/features/reports does not exist');
  });
});

describe('check-audit-catalogue', () => {
  beforeEach(() => {
    write(
      'src/lib/logs/allowlist.ts',
      "registerMetadataAllowlist('integration.email.sent', ['messageId', 'templateName']);\nregisterMetadataAllowlist('admin.claim.set', ['role']);\n"
    );
    write(
      'documentation/AUDIT_LOGGING.md',
      '# Audit logging\n\n<!-- audit-catalogue:start -->\n<!-- audit-catalogue:end -->\n\nProse.\n'
    );
  });

  it('fails a stale table, writes it with --write, then passes', () => {
    expect(check('check-audit-catalogue').status).toBe(1);
    expect(run('scripts/checks/check-audit-catalogue.mjs', ['--write']).status).toBe(0);
    const doc = fs.readFileSync(path.join(root, 'documentation/AUDIT_LOGGING.md'), 'utf8');
    expect(doc).toContain(
      '| `admin.claim.set` | `role` |\n| `integration.email.sent` | `messageId`, `templateName` |'
    );
    expect(doc).toContain('Prose.');
    expect(check('check-audit-catalogue')).toMatchObject({ status: 0 });
  });
});

describe('check-ai-provider', () => {
  it('fails each forbidden AI property', () => {
    write('package.json', JSON.stringify({ dependencies: { '@google/genai': '1.0.0' } }));
    write(
      'src/lib/ai.ts',
      "import { GoogleGenAI } from '@google/genai';\nconst url = 'https://generativelanguage.googleapis.com/v1';\n"
    );
    write('wrangler.jsonc', '{ "vars": { "VERTEX_AI_LOCATION": "global" } }\n');
    write('.env.local.example', 'GEMINI_API_KEY=\n');
    const result = check('check-ai-provider');
    expect(result.status).toBe(1);
    expect(result.output).toContain('package.json depends on @google/genai');
    expect(result.output).toContain('src/lib/ai.ts:1 @google/genai imported');
    expect(result.output).toContain('src/lib/ai.ts:2 public Gemini API endpoint');
    expect(result.output).toContain('wrangler.jsonc:1 global Vertex AI location');
    expect(result.output).toContain('.env.local.example:1 GEMINI_API_KEY');
  });

  it('accepts the scaffolded .env.example with the EU region', () => {
    expect(check('check-ai-provider')).toMatchObject({ status: 0 });
  });
});

describe('git-based checks', () => {
  it('report a BASE_REF that git cannot resolve without a stack trace', () => {
    gitRepo();
    for (const name of ['check-changelog', 'check-rules']) {
      const result = check(name, { BASE_REF: 'origin/missing' });
      expect(result.status).toBe(1);
      expect(result.output).toContain('cannot diff BASE_REF=origin/missing against HEAD');
      expect(result.output).not.toMatch(/\n\s+at /);
    }
  });

  it('check-changelog fails src/ changes without CHANGELOG.md', () => {
    gitRepo();
    write('src/app/page.tsx', 'export default function Page() {}\n');
    commitAll();
    const failing = check('check-changelog', { BASE_REF: 'staging' });
    expect(failing.status).toBe(1);
    expect(failing.output).toContain('CHANGELOG.md did not');
    write('CHANGELOG.md', '## Unreleased\n- page\n');
    commitAll();
    expect(check('check-changelog', { BASE_REF: 'staging' })).toMatchObject({ status: 0 });
  });

  it('check-rules skips when no rules file changed and needs configuration when one did', () => {
    gitRepo();
    expect(check('check-rules', { BASE_REF: 'staging' }).output).toContain(
      'no rules file changed, skipped'
    );
    write('firestore.rules', "rules_version = '2';\n");
    commitAll();
    const env = {
      BASE_REF: 'staging',
      FIREBASE_PROJECT_ID: '',
      FIREBASE_SERVICE_ACCOUNT: '',
      FIREBASE_STORAGE_BUCKET: '',
    };
    const result = check('check-rules', env);
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      'missing configuration: FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT, FIREBASE_STORAGE_BUCKET'
    );
  });
});

describe('materialize-config (REQ-ITG-010)', () => {
  const vars = {
    NEXT_PUBLIC_APP_URL: 'https://app.example.com',
    APP_ENV: 'staging',
    EMAIL_SENDER_NAME: 'Acme Portal',
    LOG_INGEST_URL: 'https://logs.example.com',
    VERTEX_AI_LOCATION: 'europe-west4',
    BACKUP_BUCKET: 'acme-staging-backups',
    FIREBASE_PROJECT_ID: 'acme-staging',
  };
  const secrets = {
    FIREBASE_SERVICE_ACCOUNT: '{"type":"service_account"}',
    LOG_INGEST_SECRET: 'ingest-secret',
    VERTEX_AI_SERVICE_ACCOUNT: '{"type":"vertex"}',
    MIGRATION_DATABASE_URL: 'postgres://migrate',
    TEST_USER_PASSWORD_ADMIN: 'pw',
  };
  const env = { VARS_JSON: JSON.stringify(vars), SECRETS_JSON: JSON.stringify(secrets) };
  const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

  it('routes every key to the deployables its block header names (--deploy)', () => {
    expect(run('scripts/ci/materialize-config.mjs', ['--deploy'], env).status).toBe(0);
    expect(fs.readFileSync(path.join(root, '.env.production'), 'utf8')).toBe(
      'NEXT_PUBLIC_APP_URL="https://app.example.com"\n'
    );
    expect(readJson('.app-vars.json')).toEqual({
      APP_ENV: 'staging',
      EMAIL_SENDER_NAME: 'Acme Portal',
      VERTEX_AI_LOCATION: 'europe-west4',
      FIREBASE_PROJECT_ID: 'acme-staging',
    });
    expect(readJson('.relay-vars.json')).toEqual({ LOG_INGEST_URL: 'https://logs.example.com' });
    expect(readJson('.secrets.json')).toEqual({
      FIREBASE_SERVICE_ACCOUNT: secrets.FIREBASE_SERVICE_ACCOUNT,
      VERTEX_AI_SERVICE_ACCOUNT: secrets.VERTEX_AI_SERVICE_ACCOUNT,
    });
    expect(readJson('.relay-secrets.json')).toEqual({ LOG_INGEST_SECRET: 'ingest-secret' });
  });

  it('writes the Functions configuration and secrets (--functions)', () => {
    fs.mkdirSync(path.join(root, 'functions'));
    expect(run('scripts/ci/materialize-config.mjs', ['--functions'], env).status).toBe(0);
    const dotenv = fs.readFileSync(path.join(root, 'functions/.env.acme-staging'), 'utf8');
    expect(dotenv).toBe(
      'LOG_INGEST_URL="https://logs.example.com"\nVERTEX_AI_LOCATION="europe-west4"\nBACKUP_BUCKET="acme-staging-backups"\n'
    );
    expect(readJson('.functions-secrets.json')).toEqual({ LOG_INGEST_SECRET: 'ingest-secret' });
  });

  it('exports CI-only credentials to CI jobs only (--github-env)', () => {
    const githubEnv = path.join(root, 'github-env');
    fs.writeFileSync(githubEnv, '');
    expect(
      run('scripts/ci/materialize-config.mjs', ['--github-env'], { ...env, GITHUB_ENV: githubEnv })
        .status
    ).toBe(0);
    const exported = fs.readFileSync(githubEnv, 'utf8');
    expect(exported).toMatch(
      /^MIGRATION_DATABASE_URL<<EOF_MIGRATION_DATABASE_URL_\d+\npostgres:\/\/migrate\n/m
    );
    expect(exported).toContain('TEST_USER_PASSWORD_ADMIN<<');
  });
});

describe('deploy-worker', () => {
  it('passes each server configuration value as its own --var argument', () => {
    const bin = path.join(root, 'fake-bin');
    fs.mkdirSync(bin);
    const log = path.join(root, 'npx-args.json');
    fs.writeFileSync(
      path.join(bin, 'npx'),
      `#!${process.execPath}\nrequire('fs').writeFileSync(${JSON.stringify(log)}, JSON.stringify(process.argv.slice(2)));\n`,
      { mode: 0o755 }
    );
    write(
      '.relay-vars.json',
      JSON.stringify({ LOG_INGEST_URL: 'https://logs.example.com', NAME: 'Acme Portal' })
    );
    const result = run('scripts/ci/deploy-worker.mjs', ['relay', 'staging'], {
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    });
    expect(result.status).toBe(0);
    expect(JSON.parse(fs.readFileSync(log, 'utf8'))).toEqual([
      'wrangler',
      'deploy',
      '--env',
      'staging',
      '--config',
      'workers/log-relay/wrangler.jsonc',
      '--var',
      'LOG_INGEST_URL:https://logs.example.com',
      '--var',
      'NAME:Acme Portal',
    ]);
  });
});

describe('migrate', () => {
  it('refuses misnamed migration files and a missing connection string', () => {
    write(
      'database/migrations/0001_create_leads.sql',
      'CREATE TABLE IF NOT EXISTS leads (id int);\n'
    );
    const missingUrl = run('scripts/ci/migrate.mjs', [], { MIGRATION_DATABASE_URL: '' });
    expect(missingUrl.status).toBe(1);
    expect(missingUrl.output).toContain('MIGRATION_DATABASE_URL is not set');
    write('database/migrations/2_bad.sql', '');
    expect(run('scripts/ci/migrate.mjs').output).toContain(
      'files not named NNNN_<name>.sql: 2_bad.sql'
    );
  });
});
