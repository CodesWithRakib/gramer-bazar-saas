import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationsUpgrade1791100000000 implements MigrationInterface {
  name = 'NotificationsUpgrade1791100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD COLUMN IF NOT EXISTS "title_key" character varying(150),
      ADD COLUMN IF NOT EXISTS "message_key" character varying(150),
      ADD COLUMN IF NOT EXISTS "priority" character varying(20) NOT NULL DEFAULT 'NORMAL';
    `);

    // Convert type column from enum to varchar(50) if it is still an enum so all notification types work seamlessly
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'notifications' AND column_name = 'type' AND udt_name = 'notifications_type_enum'
        ) THEN
          ALTER TABLE "notifications" ALTER COLUMN "type" TYPE character varying(50) USING "type"::text;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread" 
      ON "notifications" ("user_id", "is_read", "created_at");

      CREATE INDEX IF NOT EXISTS "idx_notifications_user_created" 
      ON "notifications" ("user_id", "created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notifications_user_created";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notifications_user_unread";`);
    await queryRunner.query(`
      ALTER TABLE "notifications"
      DROP COLUMN IF EXISTS "priority",
      DROP COLUMN IF EXISTS "message_key",
      DROP COLUMN IF EXISTS "title_key";
    `);
  }
}
