import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductStock1788975771227 implements MigrationInterface {
  name = 'AddProductStock1788975771227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "skinlab"."products"
      ADD COLUMN "stock_quantity" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "skinlab"."products"
      DROP COLUMN "stock_quantity"
    `);
  }
}
