/* eslint-disable @typescript-eslint/no-unused-vars */
import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { ClassRoom } from './classroom.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';

@Entity(EntityNameConst.CLASS_TEACHER)
export class ClassTeacher extends AbstractTimeEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'class_teacher_id' }) // Định nghĩa ID mới
  classTeacherId: number;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
  })
  classroomId: number;

  @DBColumn({
    name: 'user_id',
    type: 'bigint',
  })
  teacherId: number;

  // RELATIONSHIP

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.classTeachers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_room_id' })
  classroom: ClassRoom;

  @ManyToOne(() => User, (User) => User.classTeachers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  teacher: User;
}
