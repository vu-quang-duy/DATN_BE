import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateVocabularyTable1734001989696 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns(EntityNameConst.VOCABULARY, [
      {
        oldColumn: new TableColumn(MigrationConst.varcharColumn('title')),
        newColumn: new TableColumn(MigrationConst.varcharColumn('content', { isUnique: true })),
      },
    ]);
    await queryRunner.addColumns(EntityNameConst.VOCABULARY, [
      new TableColumn(MigrationConst.booleanColumn('is_private', { default: false })),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(EntityNameConst.VOCABULARY, ['is_private']);
    await queryRunner.changeColumns(EntityNameConst.VOCABULARY, [
      {
        oldColumn: new TableColumn(MigrationConst.varcharColumn('content', { isUnique: true })),
        newColumn: new TableColumn(MigrationConst.varcharColumn('title')),
      },
    ]);
  }
}
