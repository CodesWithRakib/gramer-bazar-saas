import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductionMessagingUpgrade1790500000000 implements MigrationInterface {
  name = 'ProductionMessagingUpgrade1790500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Deduplicate any existing direct conversations that share the exact same participant pair.
    // For any duplicates, merge messages into the earliest conversation and safely remove duplicate rows.
    await queryRunner.query(`
      DO $$
      DECLARE
        dup RECORD;
        primary_id uuid;
        arr_len integer;
      BEGIN
        FOR dup IN (
          SELECT 
            cp1.user_id AS user_a,
            cp2.user_id AS user_b,
            ARRAY_AGG(DISTINCT cp1.conversation_id) AS conv_ids
          FROM conversation_participants cp1
          JOIN conversation_participants cp2 
            ON cp1.conversation_id = cp2.conversation_id 
            AND cp1.user_id < cp2.user_id
          GROUP BY cp1.user_id, cp2.user_id
          HAVING COUNT(DISTINCT cp1.conversation_id) > 1
        ) LOOP
          primary_id := dup.conv_ids[1];
          arr_len := ARRAY_LENGTH(dup.conv_ids, 1);
          IF arr_len > 1 THEN
            FOR i IN 2..arr_len LOOP
              -- Move messages to the primary conversation
              UPDATE messages 
              SET conversation_id = primary_id 
              WHERE conversation_id = dup.conv_ids[i];

              -- Delete participant mappings for the duplicate
              DELETE FROM conversation_participants 
              WHERE conversation_id = dup.conv_ids[i];

              -- Delete the duplicate conversation record
              DELETE FROM conversations 
              WHERE id = dup.conv_ids[i];
            END LOOP;
          END IF;
        END LOOP;
      END $$;
    `);

    // 2. Add new columns to "conversations"
    await queryRunner.query(`
      ALTER TABLE "conversations" 
      ADD COLUMN IF NOT EXISTS "type" character varying(32) NOT NULL DEFAULT 'DIRECT',
      ADD COLUMN IF NOT EXISTS "canonical_key" character varying(255),
      ADD COLUMN IF NOT EXISTS "status" character varying(32) NOT NULL DEFAULT 'ACTIVE',
      ADD COLUMN IF NOT EXISTS "priority" character varying(32) NOT NULL DEFAULT 'MEDIUM',
      ADD COLUMN IF NOT EXISTS "support_case_number" character varying(64),
      ADD COLUMN IF NOT EXISTS "assigned_admin_id" uuid,
      ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "last_message_id" uuid,
      ADD COLUMN IF NOT EXISTS "last_message_at" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "last_message_preview" text;
    `);

    // Foreign key for assigned_admin_id
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_conversations_assigned_admin'
        ) THEN
          ALTER TABLE "conversations"
          ADD CONSTRAINT "FK_conversations_assigned_admin"
          FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // 3. Backfill canonical_key for existing 2-participant direct conversations
    await queryRunner.query(`
      UPDATE "conversations" c
      SET "canonical_key" = sub.key
      FROM (
        SELECT 
          cp1.conversation_id,
          'direct:' || LEAST(cp1.user_id, cp2.user_id) || ':' || GREATEST(cp1.user_id, cp2.user_id) AS key
        FROM conversation_participants cp1
        JOIN conversation_participants cp2 
          ON cp1.conversation_id = cp2.conversation_id 
          AND cp1.user_id < cp2.user_id
      ) sub
      WHERE c.id = sub.conversation_id AND c."canonical_key" IS NULL;
    `);

    // 4. Create unique constraint on canonical_key to prevent duplicate conversations at the database level
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_conversations_canonical_key" 
      ON "conversations" ("canonical_key") 
      WHERE "canonical_key" IS NOT NULL;
    `);

    // 5. Add new columns to "messages"
    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD COLUMN IF NOT EXISTS "status" character varying(32) NOT NULL DEFAULT 'SENT',
      ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "client_message_id" character varying(128),
      ADD COLUMN IF NOT EXISTS "metadata" jsonb;
    `);

    // Backfill read messages status
    await queryRunner.query(`
      UPDATE "messages"
      SET "status" = 'READ', "read_at" = "createdAt", "delivered_at" = "createdAt"
      WHERE "isRead" = true AND "status" = 'SENT';
    `);

    // 6. Add performance indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_conversations_updated_at" 
      ON "conversations" ("updatedAt" DESC);

      CREATE INDEX IF NOT EXISTS "idx_conversations_type_status" 
      ON "conversations" ("type", "status");

      CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" 
      ON "messages" ("conversation_id", "createdAt" DESC);

      CREATE INDEX IF NOT EXISTS "idx_messages_unread" 
      ON "messages" ("conversation_id", "sender_id", "isRead") 
      WHERE "isRead" = false;

      CREATE UNIQUE INDEX IF NOT EXISTS "idx_messages_client_id" 
      ON "messages" ("conversation_id", "client_message_id") 
      WHERE "client_message_id" IS NOT NULL;
    `);

    // 7. Backfill last_message fields on conversations
    await queryRunner.query(`
      UPDATE "conversations" c
      SET 
        "last_message_id" = latest.id,
        "last_message_at" = latest."createdAt",
        "last_message_preview" = LEFT(latest.content, 120)
      FROM (
        SELECT DISTINCT ON (conversation_id) id, conversation_id, content, "createdAt"
        FROM "messages"
        ORDER BY conversation_id, "createdAt" DESC
      ) latest
      WHERE c.id = latest.conversation_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_messages_client_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_messages_unread";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_messages_conversation_created";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_conversations_type_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_conversations_updated_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_conversations_canonical_key";`);

    await queryRunner.query(`
      ALTER TABLE "messages"
      DROP COLUMN IF EXISTS "metadata",
      DROP COLUMN IF EXISTS "client_message_id",
      DROP COLUMN IF EXISTS "read_at",
      DROP COLUMN IF EXISTS "delivered_at",
      DROP COLUMN IF EXISTS "status";
    `);

    await queryRunner.query(`
      ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "FK_conversations_assigned_admin";
    `);

    await queryRunner.query(`
      ALTER TABLE "conversations"
      DROP COLUMN IF EXISTS "last_message_preview",
      DROP COLUMN IF EXISTS "last_message_at",
      DROP COLUMN IF EXISTS "last_message_id",
      DROP COLUMN IF EXISTS "closed_at",
      DROP COLUMN IF EXISTS "assigned_admin_id",
      DROP COLUMN IF EXISTS "support_case_number",
      DROP COLUMN IF EXISTS "priority",
      DROP COLUMN IF EXISTS "status",
      DROP COLUMN IF EXISTS "canonical_key",
      DROP COLUMN IF EXISTS "type";
    `);
  }
}
