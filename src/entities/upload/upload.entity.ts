import { EntityNameConst } from 'src/constant/entity-name';
import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';
@Entity(EntityNameConst.UPLOAD)
export class Upload extends AbstractCreatedIdEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'upload_id' }) // Định nghĩa ID mới
  uploadId: number;

  @Column({ primary: true, name: 'path', type: 'varchar', unique: true })
  path: string;

  @Column({ type: 'boolean', name: 'is_active', default: false })
  isActive: boolean;

  @Column({ type: 'int', name: 'creator_id' })
  creatorId: number;

  @ManyToOne(() => User, (User) => User.uploads, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creator_id' })
  creator: User;
}
