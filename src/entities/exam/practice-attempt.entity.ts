import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import {  Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
import { User } from '../user/user.entity';

@Entity(EntityNameConst.PRACTICE_EXAM_ATTEMPT)
export class PracticeExamAttempt extends AbstractCreatedIdEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'user_practice_id' }) // Định nghĩa ID mới
    userPracticeId: number;
  @DBColumn({
    name: 'user_id',
    type: 'bigint',
  })
  studentId: number;

  @DBColumn({
    name: 'exam_id',
    type: 'bigint',
  })
  examId: number;

  @DBColumn({
    name: 'score',
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  score: number;

  @DBColumn({
    type: 'bit',
    name: 'is_finish',
    width: 1,
    default: 0, // mặc định là 0 (false)
    transformer: {
      from: (value) => {  
        if (Buffer.isBuffer(value)) {
          const result = value.readUInt8(0) === 1;
          return result;
        }
    
        const result = value === 1;
        return result;
      },
      to: (value) => (value ? 1 : 0),
    },
  })
  isFinished: boolean;

  // RELATIONSHIP

  @ManyToOne(() => User, (User) => User.practiceExamAttempt, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  student: User;

  // @ManyToOne(() => EXAM, (exam) => exam.practiceExamAttempt, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'exam_id' })
  // exam: EXAM;
}
