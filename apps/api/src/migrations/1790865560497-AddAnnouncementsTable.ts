import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAnnouncementsTable1790865560497 implements MigrationInterface {
    name = 'AddAnnouncementsTable1790865560497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table already exists due to partial execution
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT "FK_d60f1d0d73218dfa0bfa058fc26"`);
        await queryRunner.query(`DROP TABLE "announcement_templates"`);
        await queryRunner.query(`DROP TYPE "public"."announcement_templates_audience_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."announcement_templates_priority_enum"`);
        await queryRunner.query(`DROP TABLE "announcements"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_audience_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_priority_enum"`);
    }
}

