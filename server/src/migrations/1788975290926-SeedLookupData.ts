import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds the fixed reference/lookup tables. None of these rows existed
 * anywhere in the repo before this migration - the initial schema created
 * the tables but never populated them, so registration (FK on
 * users.role_id), checkout (FK on orders.status_id/shipping_type_id) and
 * admin product creation (FK on category_id/skin_type/target_audience/
 * product_type) all failed on a freshly migrated database. IDs/names below
 * match what the client already hardcodes in adminProductsForm.tsx,
 * adminOrdersPage.tsx's status dropdown, and checkoutPage.tsx's shipping
 * options.
 */
export class SeedLookupData1788975290926 implements MigrationInterface {
  name = 'SeedLookupData1788975290926';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "skinlab"."user_roles" ("role_id", "role_name") VALUES
        (0, 'user'),
        (1, 'admin')
    `);

    await queryRunner.query(`
      INSERT INTO "skinlab"."order_statuses" ("status_id", "status_name") VALUES
        (1, 'shipped'),
        (2, 'delivered'),
        (3, 'canceled')
    `);

    await queryRunner.query(`
      INSERT INTO "skinlab"."shipping_types" ("type_id", "type_name") VALUES
        (1, 'home_delivery'),
        (112, 'pickup')
    `);

    await queryRunner.query(`
      INSERT INTO "skinlab"."product_categories" ("category_id", "category_name") VALUES
        (1111, 'daily_routine'),
        (1112, 'dermo_care'),
        (1113, 'pro_aging'),
        (1114, 'sun_protection'),
        (1115, 'young'),
        (1116, 'classic'),
        (1117, 'men')
    `);

    await queryRunner.query(`
      INSERT INTO "skinlab"."skin_type" ("skin_type_id", "skin_type_name") VALUES
        (2221, 'normal'),
        (2222, 'dry'),
        (2223, 'oily'),
        (2224, 'combination'),
        (2225, 'sensitive'),
        (2226, 'acne_prone'),
        (2227, 'mature')
    `);

    await queryRunner.query(`
      INSERT INTO "skinlab"."product_type" ("product_type_id", "product_type_name") VALUES
        (30, 'cleanser'),
        (31, 'toner'),
        (32, 'serum'),
        (33, 'moisturizer'),
        (34, 'day_cream'),
        (35, 'night_cream'),
        (36, 'eye_cream'),
        (37, 'sunscreen'),
        (38, 'exfoliator'),
        (39, 'mask')
    `);

    await queryRunner.query(`
      INSERT INTO "skinlab"."target_audience" ("audience_id", "audience_name") VALUES
        (1, 'women'),
        (2, 'men'),
        (3, 'teenagers'),
        (4, 'adults'),
        (5, 'sensitive_skin'),
        (6, 'all')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "skinlab"."target_audience" WHERE "audience_id" IN (1, 2, 3, 4, 5, 6)`,
    );
    await queryRunner.query(
      `DELETE FROM "skinlab"."product_type" WHERE "product_type_id" IN (30, 31, 32, 33, 34, 35, 36, 37, 38, 39)`,
    );
    await queryRunner.query(
      `DELETE FROM "skinlab"."skin_type" WHERE "skin_type_id" IN (2221, 2222, 2223, 2224, 2225, 2226, 2227)`,
    );
    await queryRunner.query(
      `DELETE FROM "skinlab"."product_categories" WHERE "category_id" IN (1111, 1112, 1113, 1114, 1115, 1116, 1117)`,
    );
    await queryRunner.query(
      `DELETE FROM "skinlab"."shipping_types" WHERE "type_id" IN (1, 112)`,
    );
    await queryRunner.query(
      `DELETE FROM "skinlab"."order_statuses" WHERE "status_id" IN (1, 2, 3)`,
    );
    await queryRunner.query(
      `DELETE FROM "skinlab"."user_roles" WHERE "role_id" IN (0, 1)`,
    );
  }
}
