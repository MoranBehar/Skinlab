import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessages1788719942076 implements MigrationInterface {
  name = 'AddMessages1788719942076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "skinlab"."messages" (
        "message_id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "sender_id" integer NOT NULL,
        "body" text NOT NULL,
        "sent_at" timestamp NOT NULL DEFAULT now(),
        "is_read" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_messages" PRIMARY KEY ("message_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."messages"
      ADD CONSTRAINT "FK_messages_user_id" FOREIGN KEY ("user_id")
      REFERENCES "skinlab"."users"("user_id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "skinlab"."messages"
      ADD CONSTRAINT "FK_messages_sender_id" FOREIGN KEY ("sender_id")
      REFERENCES "skinlab"."users"("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "skinlab"."messages" CASCADE`,
    );
  }
}
