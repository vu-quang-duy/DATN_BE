import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRolePermissionTable1715673939033 implements MigrationInterface {
  private roleTable = new Table({
    name: EntityNameConst.ROLE,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.varcharColumn('code', { isUnique: true }),
      MigrationConst.varcharColumn('name'),
      MigrationConst.booleanColumn('is_active', { default: true }),
    ],
  });

  private permissionTable = new Table({
    name: EntityNameConst.PERMISSION,
    columns: [
      MigrationConst.idPrimaryColumn,
      MigrationConst.varcharColumn('code', { isUnique: true }),
      MigrationConst.varcharColumn('name'),
      MigrationConst.booleanColumn('is_active', { default: true }),
    ],
  });

  private rolePermissionTable = new Table({
    name: EntityNameConst.ROLE_PERMISSION,
    columns: [
      MigrationConst.bigIntColumn('role_id', { isPrimary: true }),
      MigrationConst.bigIntColumn('permission_id', { isPrimary: true }),
      MigrationConst.booleanColumn('is_active', { default: true }),
    ],
  });

  private rolePermissionForeignKey: TableForeignKey[] = [
    MigrationConst.foreignKey('role_id', EntityNameConst.ROLE, { onDelete: 'CASCADE' }),
    MigrationConst.foreignKey('permission_id', EntityNameConst.PERMISSION, { onDelete: 'CASCADE' }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.roleTable, true);
    await queryRunner.createTable(this.permissionTable, true);
    await queryRunner.createTable(this.rolePermissionTable, true);

    await queryRunner.createForeignKeys(this.rolePermissionTable, this.rolePermissionForeignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys(this.rolePermissionTable, this.rolePermissionForeignKey);
    await queryRunner.dropTable(this.rolePermissionTable, true);
    await queryRunner.dropTable(this.roleTable, true);
    await queryRunner.dropTable(this.permissionTable, true);
  }
}
