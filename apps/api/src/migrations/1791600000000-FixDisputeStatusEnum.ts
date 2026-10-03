import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDisputeStatusEnum1791600000000 implements MigrationInterface {
  name = 'FixDisputeStatusEnum1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing enum values to PostgreSQL disputes_status_enum
    await queryRunner.query(
      `ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'RESOLVED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'REJECTED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'WAITING_FOR_SELLER'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'WAITING_FOR_CUSTOMER'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."disputes_status_enum" ADD VALUE IF NOT EXISTS 'CANCELLED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't support removing values from an enum type easily.
  }
}
