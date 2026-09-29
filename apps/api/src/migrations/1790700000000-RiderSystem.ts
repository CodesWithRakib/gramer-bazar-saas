import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rider system: operational rider profiles, delivery-earnings ledger and
 * rider-aware payout requests. Idempotent so it is safe to run against
 * databases previously created via synchronize.
 */
export class RiderSystem1790700000000 implements MigrationInterface {
  name = 'RiderSystem1790700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."rider_profiles_availability_enum" AS ENUM('OFFLINE', 'AVAILABLE', 'BUSY');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rider_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "full_name" character varying(150),
        "nid_number" character varying(50),
        "address" text,
        "preferred_zone" character varying(150),
        "emergency_contact" character varying(50),
        "vehicle_type" character varying(50) NOT NULL DEFAULT 'BIKE',
        "vehicle_plate_number" character varying(100),
        "driving_license_number" character varying(100),
        "availability" "public"."rider_profiles_availability_enum" NOT NULL DEFAULT 'OFFLINE',
        "is_verified" boolean NOT NULL DEFAULT false,
        "last_available_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_rider_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_rider_profiles" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rider_profiles_availability" ON "rider_profiles" ("availability")`,
    );

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."rider_earnings_status_enum" AS ENUM('EARNED', 'PAID');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rider_earnings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rider_id" uuid NOT NULL,
        "delivery_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "status" "public"."rider_earnings_status_enum" NOT NULL DEFAULT 'EARNED',
        "payout_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_rider_earnings_delivery_id" UNIQUE ("delivery_id"),
        CONSTRAINT "PK_rider_earnings" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rider_earnings_rider_id" ON "rider_earnings" ("rider_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rider_earnings_status" ON "rider_earnings" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_rider_earnings_created_at" ON "rider_earnings" ("created_at")`,
    );

    // Payout requests become multi-actor: seller OR rider.
    await queryRunner.query(
      `ALTER TABLE "payout_requests" ALTER COLUMN "seller_id" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "payout_requests" ADD COLUMN IF NOT EXISTS "rider_id" uuid`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_payout_requests_rider_id" ON "payout_requests" ("rider_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_payout_requests_seller_id" ON "payout_requests" ("seller_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payout_requests_seller_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_payout_requests_rider_id"`);
    await queryRunner.query(`ALTER TABLE "payout_requests" DROP COLUMN IF EXISTS "rider_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_rider_earnings_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_rider_earnings_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_rider_earnings_rider_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rider_earnings"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."rider_earnings_status_enum"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_rider_profiles_availability"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rider_profiles"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."rider_profiles_availability_enum"`);
  }
}
