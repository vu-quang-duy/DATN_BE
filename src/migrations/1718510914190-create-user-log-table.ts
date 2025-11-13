import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUserLogTable1718510914190 implements MigrationInterface {
  private userLogTable = new Table({
    name: EntityNameConst.USER_LOG,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.createdAtColumn,
      MigrationConst.jsonColumn('metadata'),
      MigrationConst.varcharColumn('comment', { isNullable: true }),
      MigrationConst.bigIntColumn('user_id'),
      MigrationConst.bigIntColumn('permission_id'),
    ],
  });

  private userLogForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('user_id', EntityNameConst.USER, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('permission_id', EntityNameConst.PERMISSION, { onDelete: 'SET NULL' }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.userLogTable, true);
    await queryRunner.createForeignKeys(this.userLogTable, this.userLogForeignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys(this.userLogTable, this.userLogForeignKey);
    await queryRunner.dropTable(this.userLogTable, true);
  }
}
