// Applies the new PostgreSQL migrations with the migration user (ITG Software Delivery Playbook §3.5).
// The numbered files in database/migrations/ are the only source of the schema. Applied files are
// recorded in schema_migrations; each new file and its record run in one transaction.
// Needs MIGRATION_DATABASE_URL and the `pg` package (a devDependency of PostgreSQL projects).
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'database/migrations';
const FILE = /^\d{4}_[a-z0-9_]+\.sql$/;

const files = fs
  .readdirSync(DIR)
  .filter(name => name.endsWith('.sql'))
  .sort();
const misnamed = files.filter(name => !FILE.test(name));
if (misnamed.length > 0) {
  console.error(`migrate: files not named NNNN_<name>.sql: ${misnamed.join(', ')}`);
  process.exit(1);
}
if (!process.env.MIGRATION_DATABASE_URL) {
  console.error('migrate: MIGRATION_DATABASE_URL is not set');
  process.exit(1);
}

const { default: pg } = await import('pg');
const client = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL });
await client.connect();
try {
  await client.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())'
  );
  const { rows } = await client.query('SELECT filename FROM schema_migrations');
  const applied = new Set(rows.map(row => row.filename));
  for (const name of files.filter(name => !applied.has(name))) {
    await client.query('BEGIN');
    try {
      await client.query(fs.readFileSync(path.join(DIR, name), 'utf8'));
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [name]);
      await client.query('COMMIT');
      console.log(`migrate: applied ${name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`migrate: ${name} failed, rolled back: ${error.message}`);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  await client.end();
}
