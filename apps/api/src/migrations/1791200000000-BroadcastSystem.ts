import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Super Admin Broadcast & Marketing Communication system.
 *
 * Creates broadcast_templates, broadcasts, broadcast_recipients and
 * customer_marketing_preferences plus supporting enums and indexes. Idempotent
 * so it is safe alongside synchronize-created development databases.
 */
export class BroadcastSystem1791200000000 implements MigrationInterface {
  name = 'BroadcastSystem1791200000000';

  private async createEnum(queryRunner: QueryRunner, name: string, values: string[]): Promise<void> {
    const list = values.map((value) => `'${value}'`).join(', ');
    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "${name}" AS ENUM (${list}); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createEnum(queryRunner, 'broadcast_templates_category_enum', [
      'MARKETING',
      'UTILITY',
      'AUTHENTICATION',
    ]);
    await this.createEnum(queryRunner, 'broadcast_templates_provider_enum', ['MOCK', 'WHATSAPP']);
    await this.createEnum(queryRunner, 'broadcast_templates_provider_status_enum', [
      'LOCAL_ONLY',
      'PENDING',
      'APPROVED',
      'REJECTED',
    ]);
    await this.createEnum(queryRunner, 'broadcast_templates_status_enum', [
      'DRAFT',
      'ACTIVE',
      'ARCHIVED',
    ]);

    await this.createEnum(queryRunner, 'broadcasts_provider_enum', ['MOCK', 'WHATSAPP']);
    await this.createEnum(queryRunner, 'broadcasts_audience_type_enum', [
      'ALL_CUSTOMERS',
      'SELECTED_CUSTOMERS',
      'ACTIVE_CUSTOMERS',
      'INACTIVE_CUSTOMERS',
      'ORDERED_BEFORE',
      'NO_RECENT_ORDER',
      'AREA_BASED',
    ]);
    await this.createEnum(queryRunner, 'broadcasts_status_enum', [
      'DRAFT',
      'SCHEDULED',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
    ]);

    await this.createEnum(queryRunner, 'broadcast_recipients_status_enum', [
      'PENDING',
      'QUEUED',
      'SENDING',
      'SENT',
      'DELIVERED',
      'READ',
      'FAILED',
    ]);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "broadcast_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(150) NOT NULL,
        "description" text,
        "language" varchar(10) NOT NULL DEFAULT 'en',
        "category" "broadcast_templates_category_enum" NOT NULL DEFAULT 'MARKETING',
        "body" text NOT NULL,
        "variables" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "provider" "broadcast_templates_provider_enum" NOT NULL DEFAULT 'MOCK',
        "provider_template_id" varchar(200),
        "provider_status" "broadcast_templates_provider_status_enum" NOT NULL DEFAULT 'LOCAL_ONLY',
        "status" "broadcast_templates_status_enum" NOT NULL DEFAULT 'DRAFT',
        "created_by" uuid,
        "updated_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_broadcast_templates" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcast_templates_status" ON "broadcast_templates" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcast_templates_category" ON "broadcast_templates" ("category")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "broadcasts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" varchar(200) NOT NULL,
        "template_id" uuid,
        "template_name" varchar(150),
        "provider" "broadcasts_provider_enum" NOT NULL DEFAULT 'MOCK',
        "audience_type" "broadcasts_audience_type_enum" NOT NULL,
        "audience_config" jsonb,
        "status" "broadcasts_status_enum" NOT NULL DEFAULT 'DRAFT',
        "scheduled_at" TIMESTAMP,
        "started_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "cancelled_at" TIMESTAMP,
        "failure_reason" text,
        "total_recipients" integer NOT NULL DEFAULT 0,
        "sent_count" integer NOT NULL DEFAULT 0,
        "delivered_count" integer NOT NULL DEFAULT 0,
        "read_count" integer NOT NULL DEFAULT 0,
        "failed_count" integer NOT NULL DEFAULT 0,
        "created_by" uuid,
        "created_by_name" varchar(200),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_broadcasts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_broadcasts_template" FOREIGN KEY ("template_id")
          REFERENCES "broadcast_templates"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcasts_status" ON "broadcasts" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcasts_scheduled_at" ON "broadcasts" ("scheduled_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcasts_created_at" ON "broadcasts" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "broadcast_recipients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "broadcast_id" uuid NOT NULL,
        "customer_id" uuid,
        "customer_name" varchar(200),
        "phone" varchar(20) NOT NULL,
        "personalized_message" text,
        "status" "broadcast_recipients_status_enum" NOT NULL DEFAULT 'PENDING',
        "provider_message_id" varchar(200),
        "attempt_count" integer NOT NULL DEFAULT 0,
        "next_retry_at" TIMESTAMP,
        "sent_at" TIMESTAMP,
        "delivered_at" TIMESTAMP,
        "read_at" TIMESTAMP,
        "failed_at" TIMESTAMP,
        "failed_reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_broadcast_recipients" PRIMARY KEY ("id"),
        CONSTRAINT "FK_broadcast_recipients_broadcast" FOREIGN KEY ("broadcast_id")
          REFERENCES "broadcasts"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_broadcast_recipients_broadcast_customer" UNIQUE ("broadcast_id", "customer_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcast_recipients_broadcast_status" ON "broadcast_recipients" ("broadcast_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcast_recipients_customer" ON "broadcast_recipients" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_broadcast_recipients_next_retry" ON "broadcast_recipients" ("next_retry_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customer_marketing_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "whatsapp_marketing_opt_in" boolean NOT NULL DEFAULT true,
        "opted_out_at" TIMESTAMP,
        "source" varchar(50),
        "consent_updated_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customer_marketing_preferences" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_customer_marketing_preferences_user" ON "customer_marketing_preferences" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "customer_marketing_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "broadcast_recipients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "broadcasts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "broadcast_templates"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcast_recipients_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcasts_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcasts_audience_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcasts_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcast_templates_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcast_templates_provider_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcast_templates_provider_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcast_templates_category_enum"`);
  }
}
