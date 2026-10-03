import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fashion & Clothing vertical support.
 *
 * Rather than introducing a Fashion-only colour table, colour remains a normal
 * SELECT attribute on the shared attribute engine (so it stays variant-addressable
 * and filterable). This migration only adds one optional, generic column so any
 * option set can carry a swatch colour:
 *
 *   attribute_options.hex_color  (nullable, e.g. "#1a1a1a")
 *
 * Fully idempotent (IF NOT EXISTS) so it is safe where dev `synchronize` already
 * created the column, and it never touches existing Electronics/Medicine/Grocery
 * data.
 */
export class FashionColorSwatches1791700000000 implements MigrationInterface {
  name = 'FashionColorSwatches1791700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "attribute_options" ADD COLUMN IF NOT EXISTS "hex_color" character varying(9)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attribute_options" DROP COLUMN IF EXISTS "hex_color"`);
  }
}
