import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnnouncementsTable1790865560497 implements MigrationInterface {
    name = 'AddAnnouncementsTable1790865560497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_owner_shop_id"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_conversations_assigned_admin"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_user_permissions_user_id"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_user_permissions_permission_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_notifications_user_unread"`);
        await queryRunner.query(`DROP INDEX "public"."idx_notifications_user_created"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_permissions_user_id"`);
        await queryRunner.query(`CREATE TYPE "public"."announcements_priority_enum" AS ENUM('NORMAL', 'IMPORTANT', 'URGENT')`);
        await queryRunner.query(`CREATE TYPE "public"."announcements_status_enum" AS ENUM('DRAFT', 'SCHEDULED', 'PROCESSING', 'SENT', 'PARTIALLY_SENT', 'FAILED', 'CANCELLED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TYPE "public"."announcements_audience_type_enum" AS ENUM('EVERYONE', 'ROLE', 'MULTIPLE_ROLES', 'SELECTED_USERS')`);
        await queryRunner.query(`CREATE TABLE "announcements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "title_bn" character varying(255), "message" text NOT NULL, "message_bn" text, "image" character varying(255), "cta_text" character varying(100), "cta_link" character varying(255), "priority" "public"."announcements_priority_enum" NOT NULL DEFAULT 'NORMAL', "status" "public"."announcements_status_enum" NOT NULL DEFAULT 'DRAFT', "audience_type" "public"."announcements_audience_type_enum" NOT NULL, "target_roles" jsonb, "target_users" jsonb, "scheduled_at" TIMESTAMP, "expires_at" TIMESTAMP, "sent_at" TIMESTAMP, "total_recipients" integer NOT NULL DEFAULT '0', "total_delivered" integer NOT NULL DEFAULT '0', "total_read" integer NOT NULL DEFAULT '0', "total_failed" integer NOT NULL DEFAULT '0', "created_by_user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."announcement_templates_priority_enum" AS ENUM('NORMAL', 'IMPORTANT', 'URGENT')`);
        await queryRunner.query(`CREATE TYPE "public"."announcement_templates_audience_type_enum" AS ENUM('EVERYONE', 'ROLE', 'MULTIPLE_ROLES', 'SELECTED_USERS')`);
        await queryRunner.query(`CREATE TABLE "announcement_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "title_bn" character varying(255), "message" text NOT NULL, "message_bn" text, "image" character varying(255), "cta_text" character varying(100), "cta_link" character varying(255), "priority" "public"."announcement_templates_priority_enum" NOT NULL DEFAULT 'NORMAL', "audience_type" "public"."announcement_templates_audience_type_enum" NOT NULL DEFAULT 'EVERYONE', "target_roles" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_68ad7037ac4199207d06d8006f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'INITIATED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"text"::"public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'INITIATED'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_310667f935698fcd8cb319113a" ON "notifications" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_0f57a0c3adbbfd460935b7b046" ON "notifications" ("user_id", "is_read", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_3495bd31f1862d02931e8e8d2e" ON "user_permissions" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8145f5fadacd311693c15e41f1" ON "user_permissions" ("permission_id") `);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_7b7609928628bf120d6fa82b304" FOREIGN KEY ("owner_shop_id") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rider_profiles" ADD CONSTRAINT "FK_eb61b4b5bcd3ad3a6c14f491dbb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payout_requests" ADD CONSTRAINT "FK_7bc5c98f26eb0e62e811da3015a" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" ADD CONSTRAINT "FK_21295905038550493e8001d2582" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" ADD CONSTRAINT "FK_5de873f3a6f8c35adc78addad3b" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" ADD CONSTRAINT "FK_3a645d8d35ee8e1a602894317d0" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" ADD CONSTRAINT "FK_d017d1b57134b50b62f41bb2fde" FOREIGN KEY ("payout_id") REFERENCES "payout_requests"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_7bf8fee161418c7276e9da4753c" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD CONSTRAINT "FK_d60f1d0d73218dfa0bfa058fc26" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_8145f5fadacd311693c15e41f10" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_8145f5fadacd311693c15e41f10"`);
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8"`);
        await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT "FK_d60f1d0d73218dfa0bfa058fc26"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_7bf8fee161418c7276e9da4753c"`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" DROP CONSTRAINT "FK_d017d1b57134b50b62f41bb2fde"`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" DROP CONSTRAINT "FK_3a645d8d35ee8e1a602894317d0"`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" DROP CONSTRAINT "FK_5de873f3a6f8c35adc78addad3b"`);
        await queryRunner.query(`ALTER TABLE "rider_earnings" DROP CONSTRAINT "FK_21295905038550493e8001d2582"`);
        await queryRunner.query(`ALTER TABLE "payout_requests" DROP CONSTRAINT "FK_7bc5c98f26eb0e62e811da3015a"`);
        await queryRunner.query(`ALTER TABLE "rider_profiles" DROP CONSTRAINT "FK_eb61b4b5bcd3ad3a6c14f491dbb"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_7b7609928628bf120d6fa82b304"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8145f5fadacd311693c15e41f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3495bd31f1862d02931e8e8d2e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f57a0c3adbbfd460935b7b046"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_310667f935698fcd8cb319113a"`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum_old" AS ENUM('PENDING', 'INITIATED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED')`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum_old" USING "status"::"text"::"public"."payments_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'INITIATED'`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payments_status_enum_old" RENAME TO "payments_status_enum"`);
        await queryRunner.query(`DROP TABLE "announcement_templates"`);
        await queryRunner.query(`DROP TYPE "public"."announcement_templates_audience_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."announcement_templates_priority_enum"`);
        await queryRunner.query(`DROP TABLE "announcements"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_audience_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_priority_enum"`);
        await queryRunner.query(`CREATE INDEX "idx_user_permissions_user_id" ON "user_permissions" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_notifications_user_created" ON "notifications" ("created_at", "user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_notifications_user_unread" ON "notifications" ("created_at", "is_read", "user_id") `);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_user_permissions_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_user_permissions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_conversations_assigned_admin" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_owner_shop_id" FOREIGN KEY ("owner_shop_id") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
