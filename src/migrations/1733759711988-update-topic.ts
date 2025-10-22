import { EntityNameConst } from 'src/constant/entity-name';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateTopic1733759711988 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(EntityNameConst.TOPIC, [
      new TableColumn(MigrationConst.bigIntColumn('classroom_id', { isNullable: true })),
      new TableColumn(MigrationConst.bigIntColumn('creator_id', { isNullable: true })),
      new TableColumn(MigrationConst.varcharColumn('description', { isNullable: true })),
      new TableColumn(MigrationConst.varcharColumn('image_location', { isNullable: true })),
      new TableColumn(MigrationConst.booleanColumn('is_common', { default: false })),
    ]);

    await queryRunner.changeColumns(EntityNameConst.TOPIC, [
      {
        oldColumn: new TableColumn(MigrationConst.varcharColumn('name')),
        newColumn: new TableColumn(MigrationConst.varcharColumn('name', { isUnique: true })),
      },
    ]);

    await queryRunner.createForeignKeys(EntityNameConst.TOPIC, [
      MigrationConst.foreignKey('classroom_id', EntityNameConst.CLASSROOM, { onDelete: 'SET NULL' }),
      MigrationConst.foreignKey('creator_id', EntityNameConst.USER, { onDelete: 'SET NULL' }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(EntityNameConst.TOPIC, [
      'classroom_id',
      'creator_id',
      'description',
      'image_location',
      'is_common',
    ]);
  }
}
