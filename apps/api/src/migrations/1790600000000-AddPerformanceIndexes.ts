import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1790600000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1790600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Products indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "products" ("category_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_sub_category_id" ON "products" ("sub_category_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_brand_id" ON "products" ("brand_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_is_featured" ON "products" ("is_featured");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_is_active" ON "products" ("is_active");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_created_at" ON "products" ("created_at");`,
    );

    // Seller products indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_seller_products_shop_id" ON "seller_products" ("shop_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_seller_products_variant_id" ON "seller_products" ("product_variant_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_seller_products_is_active" ON "seller_products" ("is_active");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_seller_products_price" ON "seller_products" ("price");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_seller_products_created_at" ON "seller_products" ("created_at");`,
    );

    // Orders indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at");`,
    );

    // Order items indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "order_items" ("order_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_order_items_seller_product_id" ON "order_items" ("seller_product_id");`,
    );

    // Deliveries indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_deliveries_rider_id" ON "deliveries" ("rider_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_deliveries_status" ON "deliveries" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_deliveries_created_at" ON "deliveries" ("created_at");`,
    );

    // Users indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_users_status" ON "users" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_users_created_at" ON "users" ("created_at");`,
    );

    // Applications indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_seller_applications_status" ON "seller_applications" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_seller_applications_created_at" ON "seller_applications" ("created_at");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rider_applications_status" ON "rider_applications" ("status");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rider_applications_created_at" ON "rider_applications" ("created_at");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rider_applications_created_at";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rider_applications_status";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_seller_applications_created_at";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_seller_applications_status";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_created_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_users_status";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_deliveries_created_at";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deliveries_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_deliveries_rider_id";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_order_items_seller_product_id";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_items_order_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_created_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_user_id";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_seller_products_created_at";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_seller_products_price";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_seller_products_is_active";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_seller_products_variant_id";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_seller_products_shop_id";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_created_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_is_active";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_is_featured";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_brand_id";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_products_sub_category_id";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_category_id";`);
  }
}
