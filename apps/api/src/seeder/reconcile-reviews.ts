import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log(`\n🔍 Starting Review Aggregation Reconciliation${isDryRun ? ' (DRY RUN)' : ''}\n`);

  let scanned = 0;
  let mismatched = 0;
  let repaired = 0;

  try {
    // 1. Fetch all products that have reviews OR have non-zero aggregates
    // To do this safely and memory efficiently, we'll stream or batch.
    // However, for simplicity and performance in a standalone script, we can do a massive SQL query
    // to find mismatches directly in PostgreSQL, and then only iterate over the mismatched ones!

    console.log('Scanning products for mismatched aggregates...');

    const mismatches = await dataSource.query(`
      SELECT 
        p.id,
        p.total_reviews,
        p.average_rating,
        COUNT(r.id)::int AS actual_total_reviews,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS actual_average_rating
      FROM products p
      LEFT JOIN reviews r
        ON r.product_id = p.id
        AND r.is_approved = true
      GROUP BY 
        p.id, 
        p.total_reviews, 
        p.average_rating
      HAVING 
        p.total_reviews != COUNT(r.id)
        OR p.average_rating != COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)
    `);

    // Total products scanned (just counting the products table for the report)
    const [{ total }] = await dataSource.query(`SELECT COUNT(*) as total FROM products`);
    scanned = parseInt(total, 10);
    mismatched = mismatches.length;

    console.log(`Products scanned: ${scanned}`);
    console.log(`Mismatches found: ${mismatched}\n`);

    if (mismatches.length > 0) {
      for (const row of mismatches) {
        console.log(`Product: ${row.id}`);
        console.log(`  Current -> total: ${row.total_reviews}, avg: ${row.average_rating}`);
        console.log(`  Actual  -> total: ${row.actual_total_reviews}, avg: ${row.actual_average_rating}`);

        if (!isDryRun) {
          await dataSource.query(`
            UPDATE products
            SET 
              total_reviews = $1,
              average_rating = $2
            WHERE id = $3
          `, [row.actual_total_reviews, row.actual_average_rating, row.id]);
          repaired++;
        }
      }
    }

    console.log('\n✅ Reconciliation Complete');
    console.log(`Products checked: ${scanned}`);
    console.log(`Mismatches found: ${mismatched}`);
    console.log(`Mismatches repaired: ${repaired}`);
    
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Reconciliation failed:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
