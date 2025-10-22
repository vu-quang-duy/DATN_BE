import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateTableStatistic1735129158532 implements MigrationInterface {
  private useStatisticTable = new Table({
    name: EntityNameConst.USER_STATISTIC,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.updatedAtColumn,
      MigrationConst.bigIntColumn('user_id'),
      MigrationConst.bigIntColumn('total_classes_joined', { default: 0 }),
      MigrationConst.bigIntColumn('vocabulary_views', { default: 0 }),
      MigrationConst.decimal('average_score', { precision: 10, scale: 2, default: 0.0 }),
      MigrationConst.bigIntColumn('tests_completed', { default: 0 }),
    ],
  });

  private useStatisticForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('user_id', EntityNameConst.USER, { onDelete: 'SET NULL' }),
  ];
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(EntityNameConst.USER, [
      new TableColumn(MigrationConst.varcharColumn('school_name', { isNullable: true })),
      new TableColumn(MigrationConst.varcharColumn('house_street', { isNullable: true })),
      new TableColumn(MigrationConst.varcharColumn('ward', { isNullable: true })),
      new TableColumn(MigrationConst.varcharColumn('district', { isNullable: true })),
      new TableColumn(MigrationConst.varcharColumn('city', { isNullable: true })),
    ]);
    await queryRunner.createTable(this.useStatisticTable, true);
    await queryRunner.createForeignKeys(this.useStatisticTable, this.useStatisticForeignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(EntityNameConst.USER, ['school_name', 'house_street', 'ward', 'district', 'city']);
    await queryRunner.dropForeignKeys(this.useStatisticTable, this.useStatisticForeignKey);
    await queryRunner.dropTable(this.useStatisticTable);
  }
}
