// Phase 2 tooling: create an isolated scratch copy of the dev database so that
// schema/index changes can be applied and measured WITHOUT touching `gramer_bazar`.
//
// Usage:  node performance/phase2/tools/scratch-db.mjs <reset|verify|indexes|apply>
//   reset   - drop + recreate the scratch DB, then restore a full copy of the dev DB
//   verify  - print row counts for the key tables on the scratch DB
//   indexes - print pg_indexes entries for the hot tables on the scratch DB
//
// Credentials are read from apps/api/.env and are never printed.
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '../../../apps/api');
const require = createRequire(resolve(apiDir, 'package.json'));
const { Client } = require('pg');

const PG_BIN = 'C:/Program Files/PostgreSQL/18/bin';
const SCRATCH_DB = process.env.SCRATCH_DB || 'gramer_bazar_p2';

function loadEnv(path) {
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  } catch {
    /* ignore */
  }
}
loadEnv(resolve(apiDir, '.env'));

const DEV_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gramer_bazar';

function withDbName(urlStr, dbName) {
  const u = new URL(urlStr);
  u.pathname = '/' + dbName;
  return u.toString();
}

const SCRATCH_URL = withDbName(DEV_URL, SCRATCH_DB);
// Admin connection to the built-in `postgres` database for CREATE/DROP DATABASE.
const ADMIN_URL = withDbName(DEV_URL, 'postgres');

const TABLES = [
  'reviews',
  'seller_products',
  'products',
  'product_variants',
  'inventory',
  'categories',
  'brands',
  'shops',
  'users',
  'orders',
];

function run(bin, args, opts = {}) {
  const r = spawnSync(`${PG_BIN}/${bin}`, args, { encoding: 'utf8', ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) {
    throw new Error(`${bin} failed (status ${r.status}): ${r.stderr || r.stdout}`);
  }
  return r.stdout;
}

async function reset() {
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  // Terminate any existing sessions on the scratch DB, then drop it.
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [SCRATCH_DB],
  );
  await admin.query(`DROP DATABASE IF EXISTS "${SCRATCH_DB}"`);
  await admin.query(`CREATE DATABASE "${SCRATCH_DB}"`);
  await admin.end();
  console.log(`[scratch] created database "${SCRATCH_DB}"`);

  const dumpFile = resolve(__dirname, `../_scratch-dump.sql`);
  console.log('[scratch] dumping dev database ...');
  const dump = spawnSync(`${PG_BIN}/pg_dump`, [
    '--no-owner',
    '--no-acl',
    '--no-comments',
    '-d',
    DEV_URL,
    '-f',
    dumpFile,
  ], { encoding: 'utf8', stdio: ['ignore', 'inherit', 'inherit'] });
  if (dump.status !== 0) throw new Error(`pg_dump failed (status ${dump.status})`);

  console.log('[scratch] restoring into scratch database ...');
  const restore = spawnSync(`${PG_BIN}/psql`, [
    '-v',
    'ON_ERROR_STOP=1',
    '-q',
    '-d',
    SCRATCH_URL,
    '-f',
    dumpFile,
  ], { encoding: 'utf8', stdio: ['ignore', 'inherit', 'inherit'] });
  if (restore.status !== 0) throw new Error(`psql restore failed (status ${restore.status})`);

  // Clean up the dump file.
  try {
    const { unlinkSync } = await import('fs');
    unlinkSync(dumpFile);
  } catch {
    /* ignore */
  }
  console.log('[scratch] restore complete');
  await verify();
}

async function verify() {
  const client = new Client({ connectionString: SCRATCH_URL });
  await client.connect();
  const counts = {};
  for (const t of TABLES) {
    const r = await client.query(`SELECT COUNT(*)::bigint AS c FROM "${t}";`);
    counts[t] = Number(r.rows[0].c);
  }
  const size = await client.query(
    `SELECT pg_size_pretty(pg_database_size(current_database())) AS size;`,
  );
  console.log(`[scratch] db=${SCRATCH_DB} size=${size.rows[0].size}`);
  console.log('[scratch] row counts:', JSON.stringify(counts));
  await client.end();
}

async function indexes() {
  const client = new Client({ connectionString: SCRATCH_URL });
  await client.connect();
  const r = await client.query(`
    SELECT tablename, indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('categories','products','seller_products','reviews')
    ORDER BY tablename, indexname;
  `);
  console.log(`[scratch] indexes on ${SCRATCH_DB}:`);
  for (const row of r.rows) console.log(`  ${row.tablename}.${row.indexname}`);
  await client.end();
}

const mode = process.argv[2] || 'verify';
const main = async () => {
  if (mode === 'reset') await reset();
  else if (mode === 'verify') await verify();
  else if (mode === 'indexes') await indexes();
  else throw new Error(`unknown mode: ${mode}`);
};
main().catch((e) => {
  console.error('SCRATCH_DB_ERROR:', e.message);
  process.exit(1);
});
