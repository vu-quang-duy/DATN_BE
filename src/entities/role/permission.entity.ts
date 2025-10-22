import { Column, PrimaryGeneratedColumn, Entity, OneToMany } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { RolePermission } from './role-permission.entity';
@Entity()
export class Permission extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'permission_id' }) // Định nghĩa ID mới
  permissionId: number;

  @Column({ type: 'varchar', name: 'code', unique: true })
  code: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];
}
