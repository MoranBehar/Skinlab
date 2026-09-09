import { MigrationInterface, QueryRunner } from 'typeorm';

// Adds indices on foreign-key/filter columns that are queried directly
// (WHERE/JOIN) but aren't already covered by a primary key or unique
// constraint - orders.user_id, messages.user_id/sender_id,
// shipping_address.user_id, order_items.order_id, and the four
// products filter columns.
export class AddFkIndices1788977486681 implements MigrationInterface {
  name = 'AddFkIndices1788977486681';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_user_id" ON "skinlab"."orders" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_user_id" ON "skinlab"."messages" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_sender_id" ON "skinlab"."messages" ("sender_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_shipping_address_user_id" ON "skinlab"."shipping_address" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_order_id" ON "skinlab"."order_items" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_category_id" ON "skinlab"."products" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_target_audience" ON "skinlab"."products" ("target_audience")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_skin_type" ON "skinlab"."products" ("skin_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_products_product_type" ON "skinlab"."products" ("product_type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_products_product_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_products_skin_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_products_target_audience"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_products_category_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_order_items_order_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_shipping_address_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_messages_sender_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_messages_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "skinlab"."IDX_orders_user_id"`,
    );
  }
}
