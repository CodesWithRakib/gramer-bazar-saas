import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seller system production-readiness schema changes.
 *
 * 1. `products.owner_shop_id` marks a master-catalog product as belonging to a
 *    specific shop. Products created by admins/importers keep it NULL and stay
 *    platform-owned. The seller portal uses this column to scope product
 *    writes, image management and analytics per shop.
 * 2. `reviews.seller_reply` + `reviews.seller_replied_at` let a shop publicly
 *    answer a review left on one of its products.
 *
 * Idempotent so it is safe to run against databases previously created via
 * synchronize.
 */
export class SellerSystem1790800000000 implements MigrationInterface {
  name = 'SellerSystem1790800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Seller-owned catalog products
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "owner_shop_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_owner_shop_id" ON "products" ("owner_shop_id")`,
    );
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "products"
          ADD CONSTRAINT "FK_products_owner_shop_id"
          FOREIGN KEY ("owner_shop_id") REFERENCES "shops"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // 2. Seller replies on product reviews
    await queryRunner.query(`ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "seller_reply" text`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "seller_replied_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN IF EXISTS "seller_replied_at"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN IF EXISTS "seller_reply"`);
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_owner_shop_id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_owner_shop_id"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "owner_shop_id"`);
  }
}
