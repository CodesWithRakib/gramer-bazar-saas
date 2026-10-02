import { MigrationInterface, QueryRunner } from 'typeorm';

export class DisputeSystemUpgrade1791300000000 implements MigrationInterface {
  name = 'DisputeSystemUpgrade1791300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ensure uuid-ossp extension is enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 2. Safely create refunds enums if they do not exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refunds_status_enum') THEN
          CREATE TYPE "public"."refunds_status_enum" AS ENUM('PENDING', 'PROCESSED', 'FAILED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refunds_payment_method_enum') THEN
          CREATE TYPE "public"."refunds_payment_method_enum" AS ENUM('COD', 'ONLINE');
        END IF;
      END $$;
    `);

    // 3. Create refunds table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refunds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "dispute_id" uuid,
        "amount" numeric(10,2) NOT NULL,
        "reason" character varying,
        "created_by_id" uuid NOT NULL,
        "status" "public"."refunds_status_enum" NOT NULL DEFAULT 'PROCESSED',
        "payment_method" "public"."refunds_payment_method_enum" NOT NULL DEFAULT 'COD',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refunds_id" PRIMARY KEY ("id")
      )
    `);

    // 4. Create dispute_internal_notes table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dispute_internal_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "dispute_id" uuid NOT NULL,
        "created_by_id" uuid NOT NULL,
        "note" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dispute_internal_notes_id" PRIMARY KEY ("id")
      )
    `);

    // 5. Safely add missing columns to disputes table
    await queryRunner.query(`
      ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "refund_amount" numeric(10,2);
      ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "requested_resolution" character varying;
      ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "resolution_type" character varying;
      ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "admin_decision" text;
    `);

    // 6. Safely add foreign key constraints for dispute_internal_notes
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_dispute_internal_notes_dispute') THEN
          ALTER TABLE "dispute_internal_notes"
            ADD CONSTRAINT "FK_dispute_internal_notes_dispute"
            FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_dispute_internal_notes_created_by') THEN
          ALTER TABLE "dispute_internal_notes"
            ADD CONSTRAINT "FK_dispute_internal_notes_created_by"
            FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // 7. Safely add foreign key constraints for refunds
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_refunds_order') THEN
          ALTER TABLE "refunds"
            ADD CONSTRAINT "FK_refunds_order"
            FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_refunds_created_by') THEN
          ALTER TABLE "refunds"
            ADD CONSTRAINT "FK_refunds_created_by"
            FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // 8. Safely expand disputes_reason_enum and disputes_status_enum for Neon DB
    await queryRunner.query(`
      DO $$
      BEGIN
        -- Add reasons if missing
        BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'QUALITY_ISSUE'; EXCEPTION WHEN duplicate_object THEN null; END;
        BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'ITEM_NOT_RECEIVED'; EXCEPTION WHEN duplicate_object THEN null; END;
        BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'QUANTITY_ISSUE'; EXCEPTION WHEN duplicate_object THEN null; END;
        BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'PAYMENT_ISSUE'; EXCEPTION WHEN duplicate_object THEN null; END;

        -- Add statuses if missing
        BEGIN ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'WAITING_FOR_SELLER'; EXCEPTION WHEN duplicate_object THEN null; END;
        BEGIN ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'WAITING_FOR_CUSTOMER'; EXCEPTION WHEN duplicate_object THEN null; END;
        BEGIN ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'CANCELLED'; EXCEPTION WHEN duplicate_object THEN null; END;
      END $$;
    `);

    // 9. Normalize legacy dispute status strings if any exist
    await queryRunner.query(`
      DO $$
      BEGIN
        UPDATE "disputes" SET "status" = 'RESOLVED' WHERE "status"::text = 'RESOLVED_REFUNDED';
        UPDATE "disputes" SET "status" = 'REJECTED' WHERE "status"::text = 'RESOLVED_REJECTED';
      EXCEPTION WHEN OTHERS THEN
        null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "dispute_internal_notes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refunds"`);
  }
}
