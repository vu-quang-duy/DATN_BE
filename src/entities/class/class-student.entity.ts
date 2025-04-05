import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn,Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { ClassRoom } from './classroom.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';

@Entity(EntityNameConst.CLASS_STUDENT)
export class ClassStudent extends AbstractTimeEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'class_student_id' }) // Định nghĩa ID mới
  classStudentId: number;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
  })
  classroomId: number;

  @DBColumn({
    name: 'user_id',
    type: 'bigint',
  })
  studentId: number;

  // RELATIONSHIP

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.classStudents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'class_room_id' })
  classroom: ClassRoom;

  @ManyToOne(() => User, (User) => User.classStudents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  student: User;
}
