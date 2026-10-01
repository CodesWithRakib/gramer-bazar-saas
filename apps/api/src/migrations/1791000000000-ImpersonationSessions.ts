import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Super Admin impersonation sessions.
 *
 * Stores the ACTOR (real Super Admin) / EFFECTIVE USER (impersonated Customer,
 * Seller, or Rider) distinction plus reason, lifecycle status, expiry and
 * request metadata. Idempotent so it is safe alongside synchronize-created
 * databases.
 */
export class ImpersonationSessions1791000000000 implements MigrationInterface {
  name = 'ImpersonationSessions1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "impersonation_sessions_reason_enum" AS ENUM (
          'QA_TESTING',
          'BUG_INVESTIGATION',
          'CUSTOMER_SUPPORT',
          'ACCOUNT_VERIFICATION',
          'TROUBLESHOOTING',
          'OTHER'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "impersonation_sessions_status_enum" AS ENUM (
          'ACTIVE',
          'ENDED',
          'EXPIRED'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "impersonation_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "actor_user_id" uuid NOT NULL,
        "actor_name" varchar(200),
        "target_user_id" uuid NOT NULL,
        "target_name" varchar(200),
        "target_role" varchar(50) NOT NULL,
        "reason" "impersonation_sessions_reason_enum" NOT NULL,
        "reason_note" text,
        "status" "impersonation_sessions_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "expires_at" TIMESTAMP NOT NULL,
        "ended_at" TIMESTAMP,
        "end_reason" varchar(100),
        "ip_address" varchar(80),
        "user_agent" varchar(400),
        "started_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_impersonation_sessions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_impersonation_actor" ON "impersonation_sessions" ("actor_user_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_impersonation_target" ON "impersonation_sessions" ("target_user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "impersonation_sessions"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "impersonation_sessions_reason_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "impersonation_sessions_status_enum"`);
  }
}
