import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateTableVocabularyView1732782953936 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(EntityNameConst.VOCABULARY_VIEW, 'student_id', 'user_id');
    await queryRunner.addColumns(EntityNameConst.VOCABULARY_VIEW, [
      new TableColumn(MigrationConst.timestampColumn('last_viewed_at', { isNullable: true })),
      new TableColumn(MigrationConst.bigIntColumn('view_count', { default: 0 })),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(EntityNameConst.VOCABULARY_VIEW, ['last_viewed_at', 'view_count']);
  }
}
