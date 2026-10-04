// Temporary audit tool (read-only). Loads the API's .env DATABASE_URL and reports
// database version + row counts + sizes + indexes. It never writes to the DB.
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '../../../apps/api');
const require = createRequire(resolve(apiDir, 'package.json'));
const { Client } = require('pg');

// Minimal .env parser (avoid depending on dotenv resolution).
function loadEnv(path) {
  try {
    const text = readFileSync(path, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  } catch {
    /* ignore */
  }
}
loadEnv(resolve(apiDir, '.env'));

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gramer_bazar';

const TABLES = [
  'users',
  'user_roles',
  'roles',
  'permissions',
  'shops',
  'products',
  'product_variants',
  'seller_products',
  'inventories',
  'categories',
  'brands',
  'orders',
  'order_items',
  'reviews',
  'notifications',
  'conversations',
  'messages',
  'coupons',
  'flash_sales',
  'disputes',
  'payouts',
  'wallets',
  'wallet_transactions',
  'deliveries',
  'addresses',
  'product_views',
  'audit_logs',
  'banners',
  'announcements',
  'flash_sale_products',
  'product_requests',
];

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const version = await client.query('SHOW server_version;');
  const dbSize = await client.query(
    `SELECT pg_size_pretty(pg_database_size(current_database())) AS size;`,
  );

  const counts = {};
  for (const t of TABLES) {
    try {
      const r = await client.query(`SELECT COUNT(*)::bigint AS c FROM "${t}";`);
      counts[t] = Number(r.rows[0].c);
    } catch (e) {
      counts[t] = `N/A (${e.code || e.message})`;
    }
  }

  // Table on-disk sizes for the largest tables
  let sizes = [];
  try {
    const r = await client.query(`
      SELECT relname AS table, pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
             n_live_tup AS live_rows
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
      LIMIT 25;
    `);
    sizes = r.rows;
  } catch (e) {
    sizes = [{ error: String(e.message) }];
  }

  // Index list for key hot tables
  let indexes = [];
  try {
    const r = await client.query(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);
    indexes = r.rows;
  } catch (e) {
    indexes = [{ error: String(e.message) }];
  }

  // Connection settings
  const settings = {};
  for (const s of ['max_connections', 'shared_buffers', 'work_mem', 'effective_cache_size']) {
    try {
      const r = await client.query(`SHOW ${s};`);
      settings[s] = r.rows[0][s];
    } catch {
      /* ignore */
    }
  }
  let activeConns = null;
  try {
    const r = await client.query(
      `SELECT count(*)::int AS c FROM pg_stat_activity WHERE datname = current_database();`,
    );
    activeConns = r.rows[0].c;
  } catch {
    /* ignore */
  }

  const out = {
    serverVersion: version.rows[0].server_version,
    databaseSize: dbSize.rows[0].size,
    activeConnections: activeConns,
    settings,
    rowCounts: counts,
    largestTables: sizes,
    indexes,
  };

  console.log(JSON.stringify(out, null, 2));
  await client.end();
}

main().catch((e) => {
  console.error('DB_STATS_ERROR:', e.message);
  process.exit(1);
});
