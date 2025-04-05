import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateExamAttempt1734762441185 implements MigrationInterface {
  private StudentAnswerForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('exam_attempt_id', EntityNameConst.EXAM_ATTEMPT, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('question_id', EntityNameConst.QUESTION, { onDelete: 'CASCADE' }),
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(EntityNameConst.EXAM_ATTEMPT, [
      new TableColumn(MigrationConst.decimal('score', { isNullable: true, precision: 10, scale: 2 })),
      new TableColumn(MigrationConst.booleanColumn('is_finished', { default: false })),
    ]);

    await queryRunner.dropForeignKeys(EntityNameConst.STUDENT_ANSWER, this.StudentAnswerForeignKey);
    await queryRunner.createForeignKeys(EntityNameConst.STUDENT_ANSWER, this.StudentAnswerForeignKey);
    await queryRunner.changeColumns(EntityNameConst.STUDENT_ANSWER, [
      {
        oldColumn: new TableColumn(MigrationConst.bigIntColumn('answer_id')),
        newColumn: new TableColumn(MigrationConst.bigIntColumn('selected_answers', { isNullable: true, isArray: true })),
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(EntityNameConst.EXAM_ATTEMPT, ['score', 'is_finished']);
  }
}
