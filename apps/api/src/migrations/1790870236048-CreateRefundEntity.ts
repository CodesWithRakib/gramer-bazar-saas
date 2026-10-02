import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRefundEntity1790870236048 implements MigrationInterface {
    name = 'CreateRefundEntity1790870236048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "FK_conversations_assigned_admin"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_notifications_user_unread"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_notifications_user_created"`);

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
            CONSTRAINT "PK_5106efb01eeda7e49a78b869738" PRIMARY KEY ("id")
          )
        `);

        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS "dispute_internal_notes" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "dispute_id" uuid NOT NULL,
            "created_by_id" uuid NOT NULL,
            "note" text NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_5c06aa8cfc48457b07f568b237d" PRIMARY KEY ("id")
          )
        `);

        await queryRunner.query(`ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "refund_amount" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "requested_resolution" character varying`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "resolution_type" character varying`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "admin_decision" text`);

        // Safely add foreign key constraints
        await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_a42db6369017df60549539f5567') THEN
              ALTER TABLE "refunds" ADD CONSTRAINT "FK_a42db6369017df60549539f5567" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_dec404f669cb40230fa3a4ef84d') THEN
              ALTER TABLE "refunds" ADD CONSTRAINT "FK_dec404f669cb40230fa3a4ef84d" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_f796c46579a591c1508d79e7716') THEN
              ALTER TABLE "dispute_internal_notes" ADD CONSTRAINT "FK_f796c46579a591c1508d79e7716" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_2ee7bdcb64cdf504b325e3bc3bf') THEN
              ALTER TABLE "dispute_internal_notes" ADD CONSTRAINT "FK_2ee7bdcb64cdf504b325e3bc3bf" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            END IF;
          END $$;
        `);

        // Safely update disputes enum values
        await queryRunner.query(`
          DO $$
          BEGIN
            BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'QUALITY_ISSUE'; EXCEPTION WHEN duplicate_object THEN null; END;
            BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'ITEM_NOT_RECEIVED'; EXCEPTION WHEN duplicate_object THEN null; END;
            BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'QUANTITY_ISSUE'; EXCEPTION WHEN duplicate_object THEN null; END;
            BEGIN ALTER TYPE "public"."disputes_reason_enum" ADD VALUE IF NOT EXISTS 'PAYMENT_ISSUE'; EXCEPTION WHEN duplicate_object THEN null; END;

            BEGIN ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'WAITING_FOR_SELLER'; EXCEPTION WHEN duplicate_object THEN null; END;
            BEGIN ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'WAITING_FOR_CUSTOMER'; EXCEPTION WHEN duplicate_object THEN null; END;
            BEGIN ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'CANCELLED'; EXCEPTION WHEN duplicate_object THEN null; END;
          END $$;
        `);

        // Normalize legacy values
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
