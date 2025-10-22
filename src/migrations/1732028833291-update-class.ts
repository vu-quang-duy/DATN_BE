import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { ClassLevel } from 'src/types/classroom';
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class UpdateClass1732028833291 implements MigrationInterface {
  private studentProfileTable = new Table({
    name: EntityNameConst.STUDENT_PROFILE,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.bigIntColumn('user_id', { isNullable: false }),
      MigrationConst.varcharColumn('student_code', { isNullable: false }),
    ],
  });

  private studentProfileForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('user_id', EntityNameConst.USER, { onDelete: 'CASCADE' }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(EntityNameConst.CLASSROOM, [
      new TableColumn(
        MigrationConst.enumColumn('class_level', ClassLevel, { default: `'${ClassLevel.CLASS_LEVEL_1}'` }),
      ),
    ]);
    await queryRunner.createTable(this.studentProfileTable, true);
    await queryRunner.createForeignKeys(this.studentProfileTable, this.studentProfileForeignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(EntityNameConst.CLASSROOM, ['class_level']);
    await queryRunner.dropForeignKeys(this.studentProfileTable, this.studentProfileForeignKey);
    await queryRunner.dropTable(this.studentProfileTable, true);
  }
}
