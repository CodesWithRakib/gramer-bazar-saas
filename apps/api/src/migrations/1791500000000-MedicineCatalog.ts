import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Medicine & Health vertical slice. Introduces only the concepts the generic
 * catalog engine cannot express cleanly:
 *  - `manufacturers` — legal producer, distinct from brand
 *  - `ingredients` + `product_ingredients` — structured composition
 *  - `medicine_batches` — per-expiry stock for FEFO / expiry enforcement
 *  - `products.manufacturer_id` + `products.requires_prescription`
 *
 * Everything else (categories, product types, attributes, variants, SKU,
 * inventory) is reused unchanged. Fully idempotent (IF NOT EXISTS) so it is
 * safe on databases where dev `synchronize` already created some objects, and
 * it never touches existing Electronics data.
 */
export class MedicineCatalog1791500000000 implements MigrationInterface {
  name = 'MedicineCatalog1791500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. Manufacturers ---------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "manufacturers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name_en" character varying(200) NOT NULL,
        "name_bn" character varying(250) NOT NULL,
        "slug" character varying(250) NOT NULL,
        "country" character varying(100),
        "logo" character varying,
        "website" character varying(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_manufacturers_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_manufacturers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_manufacturers_is_active" ON "manufacturers" ("is_active")`,
    );

    // 2. Products: manufacturer + prescription flag ----------------------------
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "manufacturer_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "requires_prescription" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_manufacturer_id" ON "products" ("manufacturer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_requires_prescription" ON "products" ("requires_prescription")`,
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_products_manufacturer') THEN
          ALTER TABLE "products"
            ADD CONSTRAINT "FK_products_manufacturer"
            FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // 3. Ingredients -----------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ingredients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name_en" character varying(200) NOT NULL,
        "name_bn" character varying(250) NOT NULL,
        "slug" character varying(250) NOT NULL,
        "is_prescription_only" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_ingredients_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_ingredients" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_ingredients_is_active" ON "ingredients" ("is_active")`,
    );

    // 4. Product composition ---------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_ingredients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "ingredient_id" uuid NOT NULL,
        "strength_value" numeric(14,3),
        "strength_unit" character varying(30),
        "percentage" numeric(6,2),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_ingredients_pair" UNIQUE ("product_id", "ingredient_id"),
        CONSTRAINT "PK_product_ingredients" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_ingredients_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_product_ingredients_ingredient" FOREIGN KEY ("ingredient_id")
          REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_ingredients_product_id" ON "product_ingredients" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_ingredients_ingredient_id" ON "product_ingredients" ("ingredient_id")`,
    );

    // 5. Medicine batches ------------------------------------------------------
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medicine_batches_status_enum') THEN
          CREATE TYPE "public"."medicine_batches_status_enum" AS ENUM(
            'ACTIVE', 'EXPIRED', 'BLOCKED', 'DEPLETED'
          );
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medicine_batches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_variant_id" uuid NOT NULL,
        "batch_number" character varying(100) NOT NULL,
        "manufacturing_date" date,
        "expiry_date" date NOT NULL,
        "quantity" integer NOT NULL DEFAULT 0,
        "reserved_quantity" integer NOT NULL DEFAULT 0,
        "supplier" character varying(200),
        "purchase_cost" numeric(12,2),
        "status" "public"."medicine_batches_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_medicine_batches_variant_number" UNIQUE ("product_variant_id", "batch_number"),
        CONSTRAINT "PK_medicine_batches" PRIMARY KEY ("id"),
        CONSTRAINT "FK_medicine_batches_variant" FOREIGN KEY ("product_variant_id")
          REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_medicine_batches_variant_id" ON "medicine_batches" ("product_variant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_medicine_batches_expiry_date" ON "medicine_batches" ("expiry_date")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_medicine_batches_status" ON "medicine_batches" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "medicine_batches"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."medicine_batches_status_enum"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "product_ingredients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ingredients"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_products_manufacturer') THEN
          ALTER TABLE "products" DROP CONSTRAINT "FK_products_manufacturer";
        END IF;
      END $$;
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_requires_prescription"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_manufacturer_id"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "requires_prescription"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "manufacturer_id"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "manufacturers"`);
  }
}
