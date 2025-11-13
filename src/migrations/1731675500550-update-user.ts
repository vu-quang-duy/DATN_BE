import { EntityNameConst } from 'src/constant/entity-name';
import { Gender } from 'src/constant/enum-common';
import { MigrationConst } from 'src/constant/migration';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUser1731675500550 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      EntityNameConst.USER,
      'avatar',
      new TableColumn(MigrationConst.charColumn('avatar_location', { isNullable: true })),
    );

    await queryRunner.addColumns(EntityNameConst.USER, [
      new TableColumn(MigrationConst.charColumn('address', { isNullable: true })),
      new TableColumn(MigrationConst.charColumn('birthDay', { isNullable: true })),
      new TableColumn(MigrationConst.enumColumn('gender', Gender, { default: `'${Gender.MALE}'` })),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      EntityNameConst.USER,
      'avatar_location',
      new TableColumn(MigrationConst.charColumn('avatar', { isNullable: true })),
    );
    await queryRunner.dropColumns(EntityNameConst.USER, ['address', 'birthDay', 'gender']);
  }
}
