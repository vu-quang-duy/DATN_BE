import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { AppStatus } from 'src/types/common';
import { VocabularyTypeConst } from 'src/types/vocabulary';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTableApp1729243192279 implements MigrationInterface {
  private vocabularyTable = new Table({
    name: EntityNameConst.VOCABULARY,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.varcharColumn('title'),
      MigrationConst.varcharColumn('description', { isNullable: true }),
      MigrationConst.bigIntColumn('creator_id', { isNullable: true }),
      MigrationConst.bigIntColumn('topic_id', { isNullable: true }),
      MigrationConst.bigIntColumn('classroom_id', { isNullable: true }),
      MigrationConst.enumColumn('status', AppStatus, { default: `'${AppStatus.PENDING}'` }),
      MigrationConst.enumColumn('vocabulary_type', VocabularyTypeConst, { default: `'${VocabularyTypeConst.WORD}'` }),
      MigrationConst.varcharColumn('slug', { isNullable: true }),
      MigrationConst.varcharColumn('images_path', { isNullable: true, isArray: true }),
      MigrationConst.varcharColumn('videos_path', { isNullable: true }),
    ],
  });

  private topicTable = new Table({
    name: EntityNameConst.TOPIC,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.varcharColumn('name'),
    ],
  });

  private classroomTable = new Table({
    name: EntityNameConst.CLASSROOM,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.varcharColumn('name'),
      MigrationConst.varcharColumn('description', { isNullable: true }),
      MigrationConst.varcharColumn('slug', { isNullable: true }),
      MigrationConst.bigIntColumn('teacher_id', { isNullable: true }),
      MigrationConst.varcharColumn('thumbnail_path', { isNullable: true }),
      MigrationConst.varcharColumn('class_code', { isNullable: true }),
      MigrationConst.booleanColumn('is_teacher_created', { default: false }),
      MigrationConst.enumColumn('status', AppStatus, { default: `'${AppStatus.PENDING}'` }),
    ],
  });

  private classStudentTable = new Table({
    name: EntityNameConst.CLASS_STUDENT,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.bigIntColumn('student_id'),
      MigrationConst.bigIntColumn('classroom_id'),
    ],
  });

  private examTable = new Table({
    name: EntityNameConst.EXAM,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.varcharColumn('title'),
      MigrationConst.varcharColumn('description', { isNullable: true }),
      MigrationConst.bigIntColumn('creator_id', { isNullable: true }),
      MigrationConst.bigIntColumn('classroom_id', { isNullable: true }),
      MigrationConst.enumColumn('status', AppStatus, { default: `'${AppStatus.PENDING}'` }),
      MigrationConst.varcharColumn('slug', { isNullable: true }),
      MigrationConst.varcharColumn('thumbnail_path', { isNullable: true }),
    ],
  });

  private examAttemptTable = new Table({
    name: EntityNameConst.EXAM_ATTEMPT,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.bigIntColumn('exam_id'),
      MigrationConst.bigIntColumn('student_id'),
    ],
  });

  private questionTable = new Table({
    name: EntityNameConst.QUESTION,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.varcharColumn('title'),
      MigrationConst.varcharColumn('description', { isNullable: true }),
      MigrationConst.bigIntColumn('creator_id', { isNullable: true }),
      MigrationConst.bigIntColumn('topic_id', { isNullable: true }),
      MigrationConst.bigIntColumn('classroom_id', { isNullable: true }),
      MigrationConst.enumColumn('status', AppStatus, { default: `'${AppStatus.PENDING}'` }),
      MigrationConst.varcharColumn('slug', { isNullable: true }),
      MigrationConst.varcharColumn('images_path', { isNullable: true, isArray: true }),
      MigrationConst.varcharColumn('video_path', { isNullable: true }),
    ],
  });

  private studentAnswerTable = new Table({
    name: EntityNameConst.STUDENT_ANSWER,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.bigIntColumn('answer_id'),
      MigrationConst.bigIntColumn('question_id'),
      MigrationConst.bigIntColumn('exam_attempt_id'),
      MigrationConst.timestampColumn('answered_at', { isNullable: true }),
    ],
  });

  private answerTable = new Table({
    name: EntityNameConst.ANSWER,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.varcharColumn('content'),
      MigrationConst.bigIntColumn('question_id'),
    ],
  });

  private vocabularyViewTable = new Table({
    name: EntityNameConst.VOCABULARY_VIEW,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.bigIntColumn('vocabulary_id'),
      MigrationConst.bigIntColumn('student_id'),
    ],
  });

  // Foreign Key
  private vocabularyForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('creator_id', EntityNameConst.USER, { onDelete: 'SET NULL' }),
    MigrationConst.foreignKey('topic_id', EntityNameConst.TOPIC, { onDelete: 'SET NULL' }),
    MigrationConst.foreignKey('classroom_id', EntityNameConst.CLASSROOM, { onDelete: 'SET NULL' }),
  ];

  private classroomForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('teacher_id', EntityNameConst.USER, { onDelete: 'SET NULL' }),
  ];

  private classStudentForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('student_id', EntityNameConst.USER, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('classroom_id', EntityNameConst.CLASSROOM, { onDelete: 'CASCADE' }),
  ];

  private examForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('creator_id', EntityNameConst.USER, { onDelete: 'SET NULL' }),
    MigrationConst.foreignKey('classroom_id', EntityNameConst.CLASSROOM, { onDelete: 'SET NULL' }),
  ];

  private examAttemptForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('student_id', EntityNameConst.USER, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('exam_id', EntityNameConst.EXAM, { onDelete: 'CASCADE' }),
  ];

  private questionForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('creator_id', EntityNameConst.USER, { onDelete: 'SET NULL' }),
    MigrationConst.foreignKey('topic_id', EntityNameConst.TOPIC, { onDelete: 'SET NULL' }),
    MigrationConst.foreignKey('classroom_id', EntityNameConst.CLASSROOM, { onDelete: 'SET NULL' }),
  ];

  private studentAnswerForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('answer_id', EntityNameConst.ANSWER, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('question_id', EntityNameConst.QUESTION, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('exam_attempt_id', EntityNameConst.EXAM_ATTEMPT, { onDelete: 'CASCADE' }),
  ];

  private answerForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('question_id', EntityNameConst.QUESTION, { onDelete: 'CASCADE' }),
  ];

  private vocabularyViewForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('student_id', EntityNameConst.USER, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('vocabulary_id', EntityNameConst.VOCABULARY, { onDelete: 'CASCADE' }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.classroomTable);
    await queryRunner.createTable(this.topicTable);
    await queryRunner.createTable(this.examTable);
    await queryRunner.createTable(this.examAttemptTable);
    await queryRunner.createTable(this.questionTable);
    await queryRunner.createTable(this.studentAnswerTable);
    await queryRunner.createTable(this.answerTable);
    await queryRunner.createTable(this.vocabularyTable);
    await queryRunner.createTable(this.classStudentTable);
    await queryRunner.createTable(this.vocabularyViewTable);

    await queryRunner.createForeignKeys(this.classroomTable, this.classroomForeignKey);
    await queryRunner.createForeignKeys(this.vocabularyTable, this.vocabularyForeignKey);
    await queryRunner.createForeignKeys(this.classStudentTable, this.classStudentForeignKey);
    await queryRunner.createForeignKeys(this.examTable, this.examForeignKey);
    await queryRunner.createForeignKeys(this.examAttemptTable, this.examAttemptForeignKey);
    await queryRunner.createForeignKeys(this.questionTable, this.questionForeignKey);
    await queryRunner.createForeignKeys(this.studentAnswerTable, this.studentAnswerForeignKey);
    await queryRunner.createForeignKeys(this.answerTable, this.answerForeignKey);
    await queryRunner.createForeignKeys(this.vocabularyViewTable, this.vocabularyViewForeignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys(this.classStudentTable, this.classStudentForeignKey);
    await queryRunner.dropForeignKeys(this.examTable, this.examForeignKey);
    await queryRunner.dropForeignKeys(this.examAttemptTable, this.examAttemptForeignKey);
    await queryRunner.dropForeignKeys(this.questionTable, this.questionForeignKey);
    await queryRunner.dropForeignKeys(this.studentAnswerTable, this.studentAnswerForeignKey);
    await queryRunner.dropForeignKeys(this.answerTable, this.answerForeignKey);
    await queryRunner.dropForeignKeys(this.vocabularyViewTable, this.vocabularyViewForeignKey);
    await queryRunner.dropForeignKeys(this.vocabularyTable, this.vocabularyForeignKey);
    await queryRunner.dropForeignKeys(this.classroomTable, this.classroomForeignKey);
    await queryRunner.dropTable(this.classroomTable);
    await queryRunner.dropTable(this.topicTable);
    await queryRunner.dropTable(this.examTable);
    await queryRunner.dropTable(this.examAttemptTable);
    await queryRunner.dropTable(this.questionTable);
    await queryRunner.dropTable(this.studentAnswerTable);
    await queryRunner.dropTable(this.answerTable);
    await queryRunner.dropTable(this.vocabularyViewTable);
    await queryRunner.dropTable(this.vocabularyTable);
    await queryRunner.dropTable(this.classStudentTable);
  }
}
