// Phase 2 tooling: run EXPLAIN (ANALYZE, BUFFERS) for the hot queries identified
// in the Phase 1 audit. Read-only. Target DB defaults to the scratch copy.
// Usage: node performance/phase2/tools/explain.mjs <label> [dbName]
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '../../../apps/api');
const require = createRequire(resolve(apiDir, 'package.json'));
const { Client } = require('pg');

function loadEnv(path) {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  } catch {
    /* ignore */
  }
}
loadEnv(resolve(apiDir, '.env'));

const DEV_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/gramer_bazar';
const label = process.argv[2] || 'run';
const dbName = process.argv[3] || 'gramer_bazar_p2';
const u = new URL(DEV_URL);
u.pathname = '/' + dbName;

// Same SQL/columns as the application services.
const QUERIES = [
  {
    key: 'categories_productCounts',
    sql: `SELECT c.id,
        (SELECT COUNT(DISTINCT p.id)::int
         FROM products p JOIN categories pc ON pc.id = p.category_id
         WHERE p.is_active = true AND (pc.path = c.path OR pc.path LIKE c.path || '/%')) AS count
      FROM categories c WHERE c.is_active = true`,
  },
  {
    key: 'reviews_by_product_approved',
    sql: `SELECT product_id, COUNT(id)::int AS total_reviews, COALESCE(AVG(rating), 0)::float AS average_rating
          FROM reviews WHERE product_id = ANY($1) AND is_approved = true GROUP BY product_id`,
    params: (ids) => [ids.reviewHeavyProductIds],
  },
  {
    key: 'reviews_admin_order',
    sql: `SELECT * FROM reviews ORDER BY created_at DESC LIMIT 20`,
  },
  {
    key: 'search_name_asc',
    sql: `SELECT sp.id FROM seller_products sp
            JOIN product_variants pv ON pv.id = sp.product_variant_id
            JOIN products p ON p.id = pv.product_id
            JOIN shops shop ON shop.id = sp.shop_id
          WHERE sp.is_active = true AND pv.is_active = true AND p.is_active = true AND shop.is_active = true
          ORDER BY p.name_en ASC, sp.id DESC LIMIT 25`,
  },
  {
    key: 'search_price_asc',
    sql: `SELECT sp.id FROM seller_products sp
            JOIN product_variants pv ON pv.id = sp.product_variant_id
            JOIN products p ON p.id = pv.product_id
            JOIN shops shop ON shop.id = sp.shop_id
          WHERE sp.is_active = true AND pv.is_active = true AND p.is_active = true AND shop.is_active = true
          ORDER BY sp.price ASC, sp.id DESC LIMIT 25`,
  },
  {
    key: 'search_newest',
    sql: `SELECT sp.id FROM seller_products sp
            JOIN product_variants pv ON pv.id = sp.product_variant_id
            JOIN products p ON p.id = pv.product_id
            JOIN shops shop ON shop.id = sp.shop_id
          WHERE sp.is_active = true AND pv.is_active = true AND p.is_active = true AND shop.is_active = true
          ORDER BY sp.created_at DESC, sp.id DESC LIMIT 25`,
  },
  {
    key: 'products_by_category',
    sql: `SELECT id FROM products WHERE category_id = $1 AND is_active = true`,
    params: (ids) => [ids.categoryId],
  },
  {
    key: 'products_by_brand',
    sql: `SELECT id FROM products WHERE brand_id = $1 AND is_active = true`,
    params: (ids) => [ids.brandId],
  },
  {
    key: 'trgm_name_en_search',
    sql: `SELECT id FROM products WHERE name_en ILIKE '%laptop%'`,
  },
  {
    key: 'products_rating_sort',
    sql: `SELECT id FROM products WHERE is_active = true ORDER BY average_rating DESC, id DESC LIMIT 25`,
  },
];

async function main() {
  const c = new Client({ connectionString: u.toString() });
  await c.connect();

  // Fixtures: heavy review product, active category/brand.
  const ids = {};
  ids.reviewHeavyProductIds = (
    await c.query(
      `SELECT product_id FROM reviews GROUP BY product_id ORDER BY COUNT(*) DESC LIMIT 24`,
    )
  ).rows.map((r) => r.product_id);
  ids.categoryId = (await c.query(`SELECT id FROM categories WHERE is_active = true LIMIT 1`)).rows[0]
    ?.id;
  ids.brandId = (await c.query(`SELECT id FROM brands LIMIT 1`)).rows[0]?.id;

  const results = { label, db: dbName, generatedAt: new Date().toISOString(), queries: [] };
  for (const q of QUERIES) {
    const params = q.params ? q.params(ids) : [];
    let row;
    try {
      const r = await c.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${q.sql}`, params);
      row = r.rows[0]['QUERY PLAN'][0];
    } catch (e) {
      results.queries.push({ key: q.key, error: e.message });
      console.log(`${q.key}: ERROR ${e.message}`);
      continue;
    }
    // Collect plan node types (de-duplicated) for a rough "does it use an index" signal.
    const nodeTypes = new Set();
    const walk = (node) => {
      if (!node) return;
      if (node['Node Type']) nodeTypes.add(node['Node Type']);
      for (const child of node['Plans'] || []) walk(child);
    };
    walk(row.Plan);
    const rec = {
      key: q.key,
      planningMs: row['Planning Time'],
      executionMs: row['Execution Time'],
      nodeTypes: [...nodeTypes],
    };
    results.queries.push(rec);
    console.log(`${q.key}: planning=${rec.planningMs}ms execution=${rec.executionMs}ms nodes=[${rec.nodeTypes.join(', ')}]`);
  }

  const { writeFileSync } = await import('fs');
  const outPath = resolve(__dirname, `../_explain-${label}.json`);
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nwrote ${outPath}`);
  await c.end();
}

main().catch((e) => {
  console.error('EXPLAIN_ERROR:', e.message);
  process.exit(1);
});
