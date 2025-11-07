import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReceiptCategoryToEnum20251107120000 implements MigrationInterface {
  name = 'UpdateReceiptCategoryToEnum20251107120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add a temporary column for the new enum
    await queryRunner.query(
      `ALTER TABLE \`receipts\` ADD COLUMN \`category_enum\` ENUM('groceries', 'foodDining', 'transportation', 'utilities', 'housing', 'entertainment', 'health', 'services', 'shopping', 'travel', 'general') NULL;`
    );

    // Update the new column based on existing category values
    const categories = ['groceries', 'foodDining', 'transportation', 'utilities', 'housing', 'entertainment', 'health', 'services', 'shopping', 'travel', 'general'];
    
    for (const category of categories) {
      await queryRunner.query(
        `UPDATE \`receipts\` SET \`category_enum\` = ? WHERE LOWER(TRIM(\`category\`)) = LOWER(?)`,
        [category, category]
      );
    }

    // Set any unmapped categories to 'general'
    await queryRunner.query(
      `UPDATE \`receipts\` SET \`category_enum\` = 'general' WHERE \`category_enum\` IS NULL`
    );

    // Drop the old category column and rename the new one
    await queryRunner.query(`ALTER TABLE \`receipts\` DROP COLUMN \`category\``);
    await queryRunner.query(
      `ALTER TABLE \`receipts\` CHANGE \`category_enum\` \`category\` ENUM('groceries', 'foodDining', 'transportation', 'utilities', 'housing', 'entertainment', 'health', 'services', 'shopping', 'travel', 'general') NOT NULL DEFAULT 'general'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert enum back to string column
    await queryRunner.query(
      `ALTER TABLE \`receipts\` MODIFY COLUMN \`category\` VARCHAR(255) NOT NULL DEFAULT 'general'`
    );
  }
}