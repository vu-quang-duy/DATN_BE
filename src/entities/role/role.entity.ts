/* eslint-disable @typescript-eslint/no-unused-vars */
import { EntityNameConst } from 'src/constant/entity-name';
import { Column, PrimaryGeneratedColumn, Entity, OneToMany, PrimaryColumn, BaseEntity } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { RolePermission } from './role-permission.entity';
import { User } from '../user/user.entity';

@Entity(EntityNameConst.ROLE)
export class Role extends BaseEntity {
  // @PrimaryGeneratedColumn({ type: 'bigint', name: 'role_id' }) // Định nghĩa ID mới
  // code: number;

  @PrimaryColumn({ type: 'varchar', name: 'code', unique: true })
  roleCode: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'description' })
  description: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
