import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline migration for the schema that already exists in every deployed
 * environment (created via TypeORM's `synchronize: true` during early
 * development - see the "No DB migrations" gap in NEXT_STEPS.md). It was
 * hand-written from the current entity definitions under src/entities/,
 * matching what TypeORM would produce for these entities against an empty
 * database. It has not been run against a live Postgres instance, since none
 * is available in this environment - review it (and try it against a
 * disposable database first) before running it against a real one.
 */
export class InitialSchema1788618085901 implements MigrationInterface {
  name = 'InitialSchema1788618085901';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "skinlab"`);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."user_roles" (
        "role_id" smallint NOT NULL,
        "role_name" text NOT NULL,
        CONSTRAINT "UQ_user_roles_role_name" UNIQUE ("role_name"),
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("role_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."order_statuses" (
        "status_id" numeric NOT NULL,
        "status_name" text NOT NULL,
        CONSTRAINT "UQ_order_statuses_status_name" UNIQUE ("status_name"),
        CONSTRAINT "PK_order_statuses" PRIMARY KEY ("status_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."product_categories" (
        "category_id" numeric NOT NULL,
        "category_name" text NOT NULL,
        CONSTRAINT "UQ_product_categories_category_name" UNIQUE ("category_name"),
        CONSTRAINT "PK_product_categories" PRIMARY KEY ("category_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."target_audience" (
        "audience_id" numeric NOT NULL,
        "audience_name" text NOT NULL,
        CONSTRAINT "UQ_target_audience_audience_name" UNIQUE ("audience_name"),
        CONSTRAINT "PK_target_audience" PRIMARY KEY ("audience_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."skin_type" (
        "skin_type_id" numeric NOT NULL,
        "skin_type_name" text NOT NULL,
        CONSTRAINT "UQ_skin_type_skin_type_name" UNIQUE ("skin_type_name"),
        CONSTRAINT "PK_skin_type" PRIMARY KEY ("skin_type_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."product_type" (
        "product_type_id" numeric NOT NULL,
        "product_type_name" text NOT NULL,
        CONSTRAINT "UQ_product_type_product_type_name" UNIQUE ("product_type_name"),
        CONSTRAINT "PK_product_type" PRIMARY KEY ("product_type_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."shipping_types" (
        "type_id" integer NOT NULL,
        "type_name" text NOT NULL,
        CONSTRAINT "UQ_shipping_types_type_name" UNIQUE ("type_name"),
        CONSTRAINT "PK_shipping_types" PRIMARY KEY ("type_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."users" (
        "user_id" SERIAL NOT NULL,
        "full_name" text NOT NULL,
        "role_id" smallint NOT NULL,
        "email" text NOT NULL,
        "password" text NOT NULL,
        "points" integer DEFAULT 0,
        "access_token" text,
        "creating_date" date,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("user_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."users"
      ADD CONSTRAINT "FK_users_role_id" FOREIGN KEY ("role_id")
      REFERENCES "skinlab"."user_roles"("role_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."shipping_address" (
        "address_id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "address" text NOT NULL,
        "apartment_number" integer NOT NULL,
        "floor_number" integer NOT NULL,
        "city" text NOT NULL,
        "phone_number" text NOT NULL,
        "comments" text,
        CONSTRAINT "PK_shipping_address" PRIMARY KEY ("address_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."shipping_address"
      ADD CONSTRAINT "FK_shipping_address_user_id" FOREIGN KEY ("user_id")
      REFERENCES "skinlab"."users"("user_id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."shopping_carts" (
        "shopping_cart_id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        CONSTRAINT "UQ_shopping_carts_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_shopping_carts" PRIMARY KEY ("shopping_cart_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."shopping_carts"
      ADD CONSTRAINT "FK_shopping_carts_user_id" FOREIGN KEY ("user_id")
      REFERENCES "skinlab"."users"("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."products" (
        "product_id" SERIAL NOT NULL,
        "name" text NOT NULL,
        "description" text NOT NULL,
        "category_id" integer NOT NULL,
        "price" numeric NOT NULL,
        "target_audience" integer NOT NULL,
        "skin_type" integer NOT NULL,
        "product_type" integer NOT NULL,
        "how_to_use" text NOT NULL,
        "is_available" boolean NOT NULL,
        "creating_date" date,
        "updating_date" date,
        "deleting_date" date,
        "rating" integer,
        "discount_percentage" integer,
        CONSTRAINT "PK_products" PRIMARY KEY ("product_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."products"
      ADD CONSTRAINT "FK_products_category_id" FOREIGN KEY ("category_id")
      REFERENCES "skinlab"."product_categories"("category_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."products"
      ADD CONSTRAINT "FK_products_target_audience" FOREIGN KEY ("target_audience")
      REFERENCES "skinlab"."target_audience"("audience_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."products"
      ADD CONSTRAINT "FK_products_skin_type" FOREIGN KEY ("skin_type")
      REFERENCES "skinlab"."skin_type"("skin_type_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."products"
      ADD CONSTRAINT "FK_products_product_type" FOREIGN KEY ("product_type")
      REFERENCES "skinlab"."product_type"("product_type_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."product_images" (
        "image_id" SERIAL NOT NULL,
        "product_id" integer NOT NULL,
        "image_path" text NOT NULL,
        CONSTRAINT "PK_product_images" PRIMARY KEY ("image_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."product_images"
      ADD CONSTRAINT "FK_product_images_product_id" FOREIGN KEY ("product_id")
      REFERENCES "skinlab"."products"("product_id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."shopping_cart_items" (
        "shopping_cart_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "quantity" integer NOT NULL,
        CONSTRAINT "PK_shopping_cart_items" PRIMARY KEY ("shopping_cart_id", "product_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."shopping_cart_items"
      ADD CONSTRAINT "FK_shopping_cart_items_shopping_cart_id" FOREIGN KEY ("shopping_cart_id")
      REFERENCES "skinlab"."shopping_carts"("shopping_cart_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."shopping_cart_items"
      ADD CONSTRAINT "FK_shopping_cart_items_product_id" FOREIGN KEY ("product_id")
      REFERENCES "skinlab"."products"("product_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."orders" (
        "order_id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "status_id" numeric NOT NULL,
        "date_placed" date NOT NULL,
        "price" numeric NOT NULL,
        "shopping_cart_id" integer NOT NULL,
        "shipping_type_id" numeric NOT NULL,
        "credit_card_brand" text NOT NULL,
        "credit_card_last_four_digits" text NOT NULL,
        "shipping_address_id" integer,
        CONSTRAINT "PK_orders" PRIMARY KEY ("order_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."orders"
      ADD CONSTRAINT "FK_orders_user_id" FOREIGN KEY ("user_id")
      REFERENCES "skinlab"."users"("user_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."orders"
      ADD CONSTRAINT "FK_orders_status_id" FOREIGN KEY ("status_id")
      REFERENCES "skinlab"."order_statuses"("status_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."orders"
      ADD CONSTRAINT "FK_orders_shopping_cart_id" FOREIGN KEY ("shopping_cart_id")
      REFERENCES "skinlab"."shopping_carts"("shopping_cart_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."orders"
      ADD CONSTRAINT "FK_orders_shipping_type_id" FOREIGN KEY ("shipping_type_id")
      REFERENCES "skinlab"."shipping_types"("type_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."orders"
      ADD CONSTRAINT "FK_orders_shipping_address_id" FOREIGN KEY ("shipping_address_id")
      REFERENCES "skinlab"."shipping_address"("address_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."order_tracking" (
        "order_id" integer NOT NULL,
        "status_id" integer NOT NULL,
        "date" timestamp NOT NULL,
        "comments" text,
        CONSTRAINT "PK_order_tracking" PRIMARY KEY ("order_id", "date")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."order_tracking"
      ADD CONSTRAINT "FK_order_tracking_order_id" FOREIGN KEY ("order_id")
      REFERENCES "skinlab"."orders"("order_id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."order_tracking"
      ADD CONSTRAINT "FK_order_tracking_status_id" FOREIGN KEY ("status_id")
      REFERENCES "skinlab"."order_statuses"("status_id")
    `);

    await queryRunner.query(`
      CREATE TABLE "skinlab"."order_items" (
        "order_item_id" SERIAL NOT NULL,
        "order_id" numeric NOT NULL,
        "product_id" numeric NOT NULL,
        "quantity" numeric NOT NULL,
        "price_at_purchase" numeric NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("order_item_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."order_items"
      ADD CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id")
      REFERENCES "skinlab"."orders"("order_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."order_items"
      ADD CONSTRAINT "FK_order_items_product_id" FOREIGN KEY ("product_id")
      REFERENCES "skinlab"."products"("product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."order_items" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."order_tracking" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "skinlab"."orders" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."shopping_cart_items" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."product_images" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."products" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."shopping_carts" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."shipping_address" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "skinlab"."users" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."shipping_types" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."product_type" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."skin_type" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."target_audience" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."product_categories" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."order_statuses" CASCADE`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."user_roles" CASCADE`,
    );
  }
}
