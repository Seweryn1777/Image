import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddedImage1763147026031 implements MigrationInterface {
  name = 'AddedImage1763147026031'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`)
    await queryRunner.query(
      `CREATE TABLE "images" ("imageUUID" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "storageKey" character varying(500) NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "mimeType" character varying(100) NOT NULL, "size" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_55e1ea95d92368e3c0081df2d50" UNIQUE ("storageKey"), CONSTRAINT "PK_23e13c534187e4ed7049fc262e9" PRIMARY KEY ("imageUUID"))`
    )
    await queryRunner.query(
      `CREATE INDEX "images_title_trgm_idx" ON "images" USING gin ("title" gin_trgm_ops)`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."images_title_trgm_idx"`)
    await queryRunner.query(`DROP TABLE "images"`)
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`)
  }
}
