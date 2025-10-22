/* eslint-disable @typescript-eslint/no-unused-vars */
import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { BeforeUpdate, PrimaryGeneratedColumn, Entity, JoinColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { ClassRoom } from './classroom.entity';
import { User } from '../user/user.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';

@Entity(EntityNameConst.SCHOOL)
export class School extends AbstractTimeEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'school_id' }) // Định nghĩa ID mới
  schoolId: number;
  @DBColumn({
    name: 'name',
    type: 'varchar',
  })
  name: string;

  @DBColumn({
    name: 'image_location',
    type: 'varchar',
    nullable: true,
  })
  imageLocation: string;

  // RELATIONSHIP
  @OneToMany(() => ClassRoom, (classroom) => classroom.school)
  classRooms: ClassRoom[];

  /** Một trường có nhiều người dùng (học sinh, giáo viên) */
  @OneToMany(() => User, (user) => user.school)
  users: User[];
}
