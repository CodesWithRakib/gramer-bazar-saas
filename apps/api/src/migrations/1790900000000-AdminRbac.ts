import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Admin/Super Admin RBAC upgrade.
 *
 * Adds `user_permissions`, the direct per-account permission grants that let a
 * Super Admin extend one Admin's capabilities without editing the shared
 * `ADMIN` role. Effective permissions = role permissions ∪ direct grants.
 *
 * Idempotent so it is safe to run against databases previously created via
 * synchronize.
 */
export class AdminRbac1790900000000 implements MigrationInterface {
  name = 'AdminRbac1790900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_permissions" (
        "user_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_user_permissions" PRIMARY KEY ("user_id", "permission_id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "user_permissions"
          ADD CONSTRAINT "FK_user_permissions_user_id"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "user_permissions"
          ADD CONSTRAINT "FK_user_permissions_permission_id"
          FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_permissions_user_id" ON "user_permissions" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_permissions"`);
  }
}
