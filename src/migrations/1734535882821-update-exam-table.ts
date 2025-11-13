import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateExamTable1734535882821 implements MigrationInterface {
  private exam_question_table = new Table({
    name: EntityNameConst.EXAM_QUESTION,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      new TableColumn(MigrationConst.bigIntColumn('exam_id')),
      new TableColumn(MigrationConst.bigIntColumn('question_id')),
    ],
  });

  private examQuestionForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('exam_id', EntityNameConst.EXAM, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('question_id', EntityNameConst.QUESTION, { onDelete: 'CASCADE' }),
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(EntityNameConst.EXAM, 'title', 'name');
    await queryRunner.addColumns(EntityNameConst.EXAM, [
      new TableColumn(MigrationConst.bigIntColumn('number_of_questions', { default: 0 })),
      new TableColumn(MigrationConst.booleanColumn('private', { default: false })),
    ]);

    await queryRunner.createTable(this.exam_question_table, true);
    await queryRunner.createForeignKeys(this.exam_question_table, this.examQuestionForeignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(EntityNameConst.EXAM, ['number_of_questions', 'private']);
    await queryRunner.renameColumn(EntityNameConst.EXAM, 'name', 'title');

    await queryRunner.dropForeignKeys(this.exam_question_table, this.examQuestionForeignKey);
    await queryRunner.dropTable(this.exam_question_table, true);
  }
}
