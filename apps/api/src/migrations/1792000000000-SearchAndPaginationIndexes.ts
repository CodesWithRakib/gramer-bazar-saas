import { MigrationInterface, QueryRunner } from 'typeorm';

export class SearchAndPaginationIndexes1792000000000 implements MigrationInterface {
  name = 'SearchAndPaginationIndexes1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enable pg_trgm for typo-tolerant and Bangla text search
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // 2. Add varchar_pattern_ops index for category materialized path
    await queryRunner.query(
      `CREATE INDEX "idx_categories_path_pattern" ON "categories" ("path" varchar_pattern_ops)`,
    );

    // 3. Add partial indexes on seller_products for cursor pagination
    await queryRunner.query(
      `CREATE INDEX "idx_sp_created_at_id_active" ON "seller_products" ("created_at" DESC, "id" DESC) WHERE is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sp_price_asc_id_active" ON "seller_products" ("price" ASC, "id" DESC) WHERE is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sp_price_desc_id_active" ON "seller_products" ("price" DESC, "id" DESC) WHERE is_active = true`,
    );

    // 4. Add partial indexes on products for category/brand filtering
    await queryRunner.query(
      `CREATE INDEX "idx_products_category_active" ON "products" ("category_id") WHERE is_active = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_brand_active" ON "products" ("brand_id") WHERE is_active = true`,
    );

    // 5. Add GIN indexes for pg_trgm search
    await queryRunner.query(
      `CREATE INDEX "idx_products_name_en_trgm" ON "products" USING GIN ("name_en" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_name_bn_trgm" ON "products" USING GIN ("name_bn" gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_slug_trgm" ON "products" USING GIN ("slug" gin_trgm_ops)`,
    );

    // 6. Denormalize ratings on products
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "average_rating" numeric(3,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "total_reviews" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_rating_active" ON "products" ("average_rating" DESC, "id" DESC) WHERE is_active = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_products_rating_active"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "total_reviews"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "average_rating"`);

    await queryRunner.query(`DROP INDEX "public"."idx_products_slug_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_name_bn_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_name_en_trgm"`);

    await queryRunner.query(`DROP INDEX "public"."idx_products_brand_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_category_active"`);

    await queryRunner.query(`DROP INDEX "public"."idx_sp_price_desc_id_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_sp_price_asc_id_active"`);
    await queryRunner.query(`DROP INDEX "public"."idx_sp_created_at_id_active"`);

    await queryRunner.query(`DROP INDEX "public"."idx_categories_path_pattern"`);
  }
}
