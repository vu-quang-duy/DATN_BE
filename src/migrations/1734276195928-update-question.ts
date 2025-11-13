import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { FileType, QuestionType } from 'src/types/classroom';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateQuestion1734276195928 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns(EntityNameConst.QUESTION, [
      {
        oldColumn: new TableColumn(MigrationConst.varcharColumn('title')),
        newColumn: new TableColumn(MigrationConst.varcharColumn('content')),
      },
      {
        oldColumn: new TableColumn(MigrationConst.varcharColumn('images_path', { isNullable: true, isArray: true })),
        newColumn: new TableColumn(MigrationConst.varcharColumn('image_location', { isNullable: true })),
      },
    ]);

    await queryRunner.renameColumn(EntityNameConst.QUESTION, 'video_path', 'video_location');

    await queryRunner.addColumns(EntityNameConst.QUESTION, [
      new TableColumn(MigrationConst.varcharColumn('explanation', { isNullable: true })),
      new TableColumn(MigrationConst.enumColumn('file_type', FileType, { default: `'${FileType.EXISTED}'` })),
      new TableColumn(
        MigrationConst.enumColumn('question_type', QuestionType, { default: `'${QuestionType.ONE_ANSWER}'` }),
      ),
    ]);

    await queryRunner.addColumns(EntityNameConst.ANSWER, [
      new TableColumn(MigrationConst.booleanColumn('correct', { default: false })),
      new TableColumn(MigrationConst.varcharColumn('image_location', { isNullable: true })),
      new TableColumn(MigrationConst.varcharColumn('video_location', { isNullable: true })),
    ]);
  }

  public async down(): Promise<void> {}
}
