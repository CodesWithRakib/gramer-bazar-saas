import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Corrective migration.
 *
 * `SearchAndPaginationIndexes1792000000000` is recorded as applied on databases
 * where the API was ever booted with TypeORM `synchronize: true` (the default in
 * non-production). TypeORM's schema synchronizer drops indexes that are not
 * declared in entity metadata, which silently removed all ten indexes that
 * migration had created — while leaving the migration itself recorded as run, so
 * `migration:run` would never recreate them.
 *
 * This migration is fully idempotent (`IF NOT EXISTS` everywhere), so it is safe
 * to run on any environment, including ones where the original indexes still
 * exist. It also adds the missing indexes on the hot `reviews` table.
 *
 * NOTE: on very large production tables these builds take an ACCESS EXCLUSIVE
 * lock. Prefer applying during a low-traffic window, or split into standalone
 * `CREATE INDEX CONCURRENTLY` statements (which cannot run inside a transaction).
 */
export class RestorePerformanceIndexes1793000000000 implements MigrationInterface {
  name = 'RestorePerformanceIndexes1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. pg_trgm backing the GIN indexes below
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // 2. Category materialized-path prefix lookups
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_categories_path_pattern" ON "categories" ("path" varchar_pattern_ops)`,
    );

    // 3. seller_products cursor pagination (partial: only active rows)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sp_created_at_id_active" ON "seller_products" ("created_at" DESC, "id" DESC) WHERE is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sp_price_asc_id_active" ON "seller_products" ("price" ASC, "id" DESC) WHERE is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_sp_price_desc_id_active" ON "seller_products" ("price" DESC, "id" DESC) WHERE is_active = true`,
    );

    // 4. products category/brand filtering (partial: only active rows)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_category_active" ON "products" ("category_id") WHERE is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_brand_active" ON "products" ("brand_id") WHERE is_active = true`,
    );

    // 5. pg_trgm GIN indexes for typo-tolerant / Bangla search
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_name_en_trgm" ON "products" USING GIN ("name_en" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_name_bn_trgm" ON "products" USING GIN ("name_bn" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_slug_trgm" ON "products" USING GIN ("slug" gin_trgm_ops)`,
    );

    // 6. Denormalized rating sort
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_rating_active" ON "products" ("average_rating" DESC, "id" DESC) WHERE is_active = true`,
    );

    // 6b. Catalog `name_asc` sort support.
    //     The sort is `ORDER BY products.name_en, seller_products.id`. A b-tree on
    //     name_en alone is not enough: without an index on
    //     product_variants(product_id) the planner cannot nest-loop from the
    //     name-ordered products into variants, and falls back to sorting the whole
    //     joined set. Together these two indexes turn the sort into an incremental
    //     sort over an index scan.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_name_en_active" ON "products" ("name_en") WHERE is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_variants_product_id" ON "product_variants" ("product_id")`,
    );

    // 7. reviews — the table previously had ONLY a primary key
    //    (product review lists: filter by product + approval, newest first)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_reviews_product_approved_created" ON "reviews" ("product_id", "is_approved", "created_at" DESC)`,
    );
    //    (admin review lists: global newest-first ordering)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_reviews_created_at" ON "reviews" ("created_at" DESC)`,
    );
    //    (user review lookups + duplicate-review check)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_reviews_user_product" ON "reviews" ("user_id", "product_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reviews_user_product"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reviews_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reviews_product_approved_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_product_variants_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_name_en_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_rating_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_slug_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_name_bn_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_name_en_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_brand_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_category_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sp_price_desc_id_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sp_price_asc_id_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_sp_created_at_id_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_categories_path_pattern"`);
  }
}
