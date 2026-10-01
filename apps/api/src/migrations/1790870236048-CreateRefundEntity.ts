import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRefundEntity1790870236048 implements MigrationInterface {
    name = 'CreateRefundEntity1790870236048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_conversations_assigned_admin"`);
        await queryRunner.query(`DROP INDEX "public"."idx_notifications_user_unread"`);
        await queryRunner.query(`DROP INDEX "public"."idx_notifications_user_created"`);
        await queryRunner.query(`CREATE TYPE "public"."refunds_status_enum" AS ENUM('PENDING', 'PROCESSED', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."refunds_payment_method_enum" AS ENUM('COD', 'ONLINE')`);
        await queryRunner.query(`CREATE TABLE "refunds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "dispute_id" uuid, "amount" numeric(10,2) NOT NULL, "reason" character varying, "created_by_id" uuid NOT NULL, "status" "public"."refunds_status_enum" NOT NULL DEFAULT 'PROCESSED', "payment_method" "public"."refunds_payment_method_enum" NOT NULL DEFAULT 'COD', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5106efb01eeda7e49a78b869738" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dispute_internal_notes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dispute_id" uuid NOT NULL, "created_by_id" uuid NOT NULL, "note" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5c06aa8cfc48457b07f568b237d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD "refund_amount" numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD "requested_resolution" character varying`);
        await queryRunner.query(`ALTER TABLE "disputes" ADD "resolution_type" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'INITIATED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'INITIATED'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."disputes_reason_enum" RENAME TO "disputes_reason_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."disputes_reason_enum" AS ENUM('DAMAGED', 'MISSING_ITEM', 'NOT_AS_DESCRIBED', 'WRONG_ITEM', 'QUALITY_ISSUE', 'ITEM_NOT_RECEIVED', 'QUANTITY_ISSUE', 'PAYMENT_ISSUE', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "reason" TYPE "public"."disputes_reason_enum" USING "reason"::"text"::"public"."disputes_reason_enum"`);
        await queryRunner.query(`DROP TYPE "public"."disputes_reason_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."disputes_status_enum" RENAME TO "disputes_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."disputes_status_enum" AS ENUM('OPEN', 'UNDER_REVIEW', 'WAITING_FOR_SELLER', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "status" DROP DEFAULT`);
        
        // Cast to varchar so we can change the old values without type constraint errors
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "status" TYPE character varying`);
        
        await queryRunner.query(`UPDATE "disputes" SET "status" = 'RESOLVED' WHERE "status" = 'RESOLVED_REFUNDED'`);
        await queryRunner.query(`UPDATE "disputes" SET "status" = 'REJECTED' WHERE "status" = 'RESOLVED_REJECTED'`);
        
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "status" TYPE "public"."disputes_status_enum" USING "status"::"public"."disputes_status_enum"`);
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "status" SET DEFAULT 'OPEN'`);
        await queryRunner.query(`DROP TYPE "public"."disputes_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "refunds" ADD CONSTRAINT "FK_a42db6369017df60549539f5567" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refunds" ADD CONSTRAINT "FK_dec404f669cb40230fa3a4ef84d" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispute_internal_notes" ADD CONSTRAINT "FK_f796c46579a591c1508d79e7716" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dispute_internal_notes" ADD CONSTRAINT "FK_2ee7bdcb64cdf504b325e3bc3bf" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dispute_internal_notes" DROP CONSTRAINT "FK_2ee7bdcb64cdf504b325e3bc3bf"`);
        await queryRunner.query(`ALTER TABLE "dispute_internal_notes" DROP CONSTRAINT "FK_f796c46579a591c1508d79e7716"`);
        await queryRunner.query(`ALTER TABLE "refunds" DROP CONSTRAINT "FK_dec404f669cb40230fa3a4ef84d"`);
        await queryRunner.query(`ALTER TABLE "refunds" DROP CONSTRAINT "FK_a42db6369017df60549539f5567"`);
        await queryRunner.query(`CREATE TYPE "public"."disputes_status_enum_old" AS ENUM('OPEN', 'RESOLVED_REFUNDED', 'RESOLVED_REJECTED', 'UNDER_REVIEW')`);
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "status" TYPE "public"."disputes_status_enum_old" USING "status"::"text"::"public"."disputes_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "status" SET DEFAULT 'OPEN'`);
        await queryRunner.query(`DROP TYPE "public"."disputes_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."disputes_status_enum_old" RENAME TO "disputes_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."disputes_reason_enum_old" AS ENUM('DAMAGED', 'MISSING_ITEM', 'NOT_AS_DESCRIBED', 'OTHER', 'WRONG_ITEM')`);
        await queryRunner.query(`ALTER TABLE "disputes" ALTER COLUMN "reason" TYPE "public"."disputes_reason_enum_old" USING "reason"::"text"::"public"."disputes_reason_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."disputes_reason_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."disputes_reason_enum_old" RENAME TO "disputes_reason_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum_old" AS ENUM('CANCELLED', 'EXPIRED', 'FAILED', 'INITIATED', 'PAID', 'PARTIALLY_REFUNDED', 'PENDING', 'PROCESSING', 'REFUNDED')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum_old" USING "status"::"text"::"public"."payments_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'INITIATED'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum_old" RENAME TO "payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "disputes" DROP COLUMN "resolution_type"`);
        await queryRunner.query(`ALTER TABLE "disputes" DROP COLUMN "requested_resolution"`);
        await queryRunner.query(`ALTER TABLE "disputes" DROP COLUMN "refund_amount"`);
        await queryRunner.query(`DROP TABLE "dispute_internal_notes"`);
        await queryRunner.query(`DROP TABLE "refunds"`);
        await queryRunner.query(`DROP TYPE "public"."refunds_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."refunds_status_enum"`);
        await queryRunner.query(`CREATE INDEX "idx_notifications_user_created" ON "notifications" ("created_at", "user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_notifications_user_unread" ON "notifications" ("created_at", "is_read", "user_id") `);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_conversations_assigned_admin" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
