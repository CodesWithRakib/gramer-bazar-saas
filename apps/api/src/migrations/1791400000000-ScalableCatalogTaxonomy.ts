import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Introduces the scalable catalog taxonomy engine:
 *  - materialized `level` / `path` on categories for unlimited depth
 *  - reusable product types, attributes, attribute options and mappings
 *  - structured product attribute values
 *  - nullable `products.product_type_id`
 *
 * Fully idempotent (IF NOT EXISTS) so it is safe on databases where dev
 * synchronize already created some of these objects.
 */
export class ScalableCatalogTaxonomy1791400000000 implements MigrationInterface {
  name = 'ScalableCatalogTaxonomy1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. Category depth + materialized path ------------------------------------
    await queryRunner.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "level" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "path" character varying(1000)`,
    );

    // Backfill level/path for every existing category at any depth.
    await queryRunner.query(`
      WITH RECURSIVE tree AS (
        SELECT id, slug::text AS path, 0 AS level
        FROM categories
        WHERE parent_id IS NULL
        UNION ALL
        SELECT c.id, (tree.path || '/' || c.slug)::text, tree.level + 1
        FROM categories c
        JOIN tree ON c.parent_id = tree.id
      )
      UPDATE categories c
      SET level = tree.level, path = tree.path
      FROM tree
      WHERE c.id = tree.id AND (c.path IS DISTINCT FROM tree.path OR c.level IS DISTINCT FROM tree.level)
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_categories_parent_id" ON "categories" ("parent_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_categories_path" ON "categories" ("path")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_categories_is_active" ON "categories" ("is_active")`,
    );

    // 2. Product types ---------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "category_id" uuid NOT NULL,
        "name_en" character varying(150) NOT NULL,
        "name_bn" character varying(200) NOT NULL,
        "slug" character varying NOT NULL,
        "description_en" text,
        "description_bn" text,
        "icon" character varying,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_types_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_product_types" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_types_category_id" ON "product_types" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_types_is_active" ON "product_types" ("is_active")`,
    );

    // 3. Attributes ------------------------------------------------------------
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attributes_data_type_enum') THEN
          CREATE TYPE "public"."attributes_data_type_enum" AS ENUM(
            'TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'RANGE', 'DATE'
          );
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attributes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name_en" character varying(150) NOT NULL,
        "name_bn" character varying(200) NOT NULL,
        "slug" character varying NOT NULL,
        "data_type" "public"."attributes_data_type_enum" NOT NULL DEFAULT 'TEXT',
        "unit" character varying(30),
        "is_filterable" boolean NOT NULL DEFAULT true,
        "is_variant_axis" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_attributes_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_attributes" PRIMARY KEY ("id")
      )
    `);

    // 4. Attribute options -----------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attribute_options" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "attribute_id" uuid NOT NULL,
        "value" character varying(150) NOT NULL,
        "value_bn" character varying(200),
        "slug" character varying NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_attribute_options_attribute_slug" UNIQUE ("attribute_id", "slug"),
        CONSTRAINT "PK_attribute_options" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_attribute_options_attribute_id" ON "attribute_options" ("attribute_id")`,
    );

    // 5. Product type ↔ attribute mappings ------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_type_attributes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_type_id" uuid NOT NULL,
        "attribute_id" uuid NOT NULL,
        "is_required" boolean NOT NULL DEFAULT false,
        "is_filterable" boolean NOT NULL DEFAULT true,
        "spec_group" character varying(100),
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_type_attributes_pair" UNIQUE ("product_type_id", "attribute_id"),
        CONSTRAINT "PK_product_type_attributes" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_type_attributes_product_type_id" ON "product_type_attributes" ("product_type_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_type_attributes_attribute_id" ON "product_type_attributes" ("attribute_id")`,
    );

    // 6. Product attribute values ---------------------------------------------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_attribute_values" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "attribute_id" uuid NOT NULL,
        "option_id" uuid,
        "value_text" text,
        "value_number" numeric(14,3),
        "value_boolean" boolean,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_attribute_values_pair" UNIQUE ("product_id", "attribute_id"),
        CONSTRAINT "PK_product_attribute_values" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_attribute_values_product_id" ON "product_attribute_values" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_attribute_values_attribute_id" ON "product_attribute_values" ("attribute_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_product_attribute_values_option_id" ON "product_attribute_values" ("option_id")`,
    );

    // 7. Product type link on products ----------------------------------------
    await queryRunner.query(
      `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "product_type_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_product_type_id" ON "products" ("product_type_id")`,
    );

    // 8. Foreign keys (guarded by name) ---------------------------------------
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_product_types_category') THEN
          ALTER TABLE "product_types"
            ADD CONSTRAINT "FK_product_types_category"
            FOREIGN KEY ("category_id") REFERENCES "categories"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_attribute_options_attribute') THEN
          ALTER TABLE "attribute_options"
            ADD CONSTRAINT "FK_attribute_options_attribute"
            FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_product_type_attributes_product_type') THEN
          ALTER TABLE "product_type_attributes"
            ADD CONSTRAINT "FK_product_type_attributes_product_type"
            FOREIGN KEY ("product_type_id") REFERENCES "product_types"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_product_type_attributes_attribute') THEN
          ALTER TABLE "product_type_attributes"
            ADD CONSTRAINT "FK_product_type_attributes_attribute"
            FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_product_attribute_values_product') THEN
          ALTER TABLE "product_attribute_values"
            ADD CONSTRAINT "FK_product_attribute_values_product"
            FOREIGN KEY ("product_id") REFERENCES "products"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_product_attribute_values_attribute') THEN
          ALTER TABLE "product_attribute_values"
            ADD CONSTRAINT "FK_product_attribute_values_attribute"
            FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_product_attribute_values_option') THEN
          ALTER TABLE "product_attribute_values"
            ADD CONSTRAINT "FK_product_attribute_values_option"
            FOREIGN KEY ("option_id") REFERENCES "attribute_options"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_products_product_type') THEN
          ALTER TABLE "products"
            ADD CONSTRAINT "FK_products_product_type"
            FOREIGN KEY ("product_type_id") REFERENCES "product_types"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_products_product_type') THEN
          ALTER TABLE "products" DROP CONSTRAINT "FK_products_product_type";
        END IF;
      END $$;
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_product_type_id"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "product_type_id"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "product_attribute_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_type_attributes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attribute_options"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attributes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "product_types"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."attributes_data_type_enum"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "idx_categories_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_categories_path"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_categories_parent_id"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "path"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "level"`);
  }
}
