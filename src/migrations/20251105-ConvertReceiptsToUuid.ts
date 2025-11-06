import { MigrationInterface, QueryRunner } from "typeorm";

// IMPORTANT: This migration assumes there are NO foreign key references to receipts.id
// in other tables, or that you will update those references separately. Running this
// migration on a DB with FK constraints referencing receipts.id will fail or leave
// the DB in a broken state. BACKUP your data before running.

export class ConvertReceiptsToUuid20251105120000 implements MigrationInterface {
  name = 'ConvertReceiptsToUuid20251105120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Add a temporary nullable UUID column if it doesn't already exist
    const idUuidColCheck: any[] = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND COLUMN_NAME = 'id_uuid';`
    );
    if (!idUuidColCheck || idUuidColCheck.length === 0) {
      await queryRunner.query(`ALTER TABLE \`receipts\` ADD COLUMN \`id_uuid\` VARCHAR(36) NULL;`);
    }

    // 2) Populate with UUIDs for existing rows
    await queryRunner.query(`UPDATE \`receipts\` SET \`id_uuid\` = UUID() WHERE \`id_uuid\` IS NULL;`);

    // 3) Create a unique index (safety) and make NOT NULL
    const idxCheck: any[] = await queryRunner.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND INDEX_NAME = 'IDX_receipts_id_uuid';`
    );
    if (!idxCheck || idxCheck.length === 0) {
      await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_receipts_id_uuid\` ON \`receipts\` (\`id_uuid\`);`);
    }
    await queryRunner.query(`ALTER TABLE \`receipts\` MODIFY COLUMN \`id_uuid\` VARCHAR(36) NOT NULL;`);

    // 4) Drop primary key on old id if it exists
    const primaryKeyInfo: any[] = await queryRunner.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND CONSTRAINT_TYPE = 'PRIMARY KEY';`
    );
    if (primaryKeyInfo && primaryKeyInfo.length > 0) {
      await queryRunner.query(`ALTER TABLE \`receipts\` DROP PRIMARY KEY;`);
    }

    // 5) Rename old numeric id column to preserve it (optional) if it exists
    const idColumnInfo: any[] = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND COLUMN_NAME = 'id';`
    );
    if (idColumnInfo && idColumnInfo.length > 0) {
      // attempt to change column to id_old preserving type as INT if possible
      await queryRunner.query(`ALTER TABLE \`receipts\` CHANGE COLUMN \`id\` \`id_old\` INT;`);
    }

    // 6) Rename id_uuid to id and set as primary key
    const idUuidExists: any[] = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND COLUMN_NAME = 'id_uuid';`
    );
    if (idUuidExists && idUuidExists.length > 0) {
      await queryRunner.query(`ALTER TABLE \`receipts\` CHANGE COLUMN \`id_uuid\` \`id\` VARCHAR(36) NOT NULL;`);
      await queryRunner.query(`ALTER TABLE \`receipts\` ADD PRIMARY KEY (\`id\`);`);
    }

    // 7) (Optional) If you want the new `id` to be the first column or have a particular order,
    // you can change column order, but it's not necessary.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Down migration attempts to restore the previous numeric `id` as primary key if `id_old` exists.
    // This is a best-effort reversal and should be reviewed before running.

    // 1) Drop new primary key if exists
    const pkInfoDown: any[] = await queryRunner.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND CONSTRAINT_TYPE = 'PRIMARY KEY';`
    );
    if (pkInfoDown && pkInfoDown.length > 0) {
      await queryRunner.query(`ALTER TABLE \`receipts\` DROP PRIMARY KEY;`);
    }

    // 2) Rename current id to id_uuid if exists
    const idColDown: any[] = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND COLUMN_NAME = 'id';`
    );
    if (idColDown && idColDown.length > 0) {
      await queryRunner.query(`ALTER TABLE \`receipts\` CHANGE COLUMN \`id\` \`id_uuid\` VARCHAR(36) NOT NULL;`);
    }

    // 3) Rename id_old back to id (restore numeric PK) if id_old exists
    const idOldCol: any[] = await queryRunner.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipts' AND COLUMN_NAME = 'id_old';`
    );
    if (idOldCol && idOldCol.length > 0) {
      await queryRunner.query(`ALTER TABLE \`receipts\` CHANGE COLUMN \`id_old\` \`id\` INT;`);
      await queryRunner.query(`ALTER TABLE \`receipts\` ADD PRIMARY KEY (\`id\`);`);
    }

    // 4) (Optional) Drop the id_uuid index if exists
    await queryRunner.query(`DROP INDEX IF EXISTS \`IDX_receipts_id_uuid\` ON \`receipts\`;`);
  }
}
