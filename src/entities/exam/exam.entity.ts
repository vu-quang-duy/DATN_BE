import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClassRoom } from '../class/classroom.entity';
import { AbstractTimeEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamQuestion } from './exam-question.entity';
@Entity(EntityNameConst.EXAM)
export class EXAM extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'exam_id' }) // Định nghĩa ID mới
  examId: number;

  @DBColumn({
    name: 'name',
    type: 'varchar',
  })
  name: string;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
    nullable: true,
  })
  classRoomId: number;

  @DBColumn({
    name: 'created_by',
    type: 'varchar',
  })
  createdBy: string;


  @DBColumn({
    name: 'is_private',
    type: 'bit',
  //   default: 0,
  // })
  // private: Buffer;
  transformer: {
    to: (value: boolean) => value ? Buffer.from([1]) : Buffer.from([0]), // Lưu vào DB
    from: (value: Buffer) => value[0] === 1, // Lấy từ DB
  },
})
  private: boolean;


  // RELATIONSHIP

  @ManyToOne(() => User, (user) => user.exams, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.exams, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'class_room_id' })
  classroom: ClassRoom;

  @OneToMany(() => ExamAttempt, (examAttempt) => examAttempt.exam)
  examAttempts: ExamAttempt[];

  @OneToMany(() => ExamQuestion, (examQuestion) => examQuestion.exam)
  questions: ExamQuestion[];

}
