import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { StudentAnswer } from '../question/student-answer.entity';
import { User } from '../user/user.entity';
import { EXAM } from './exam.entity';

@Entity(EntityNameConst.EXAM_ATTEMPT)
export class ExamAttempt extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'user_exam_id' }) // Định nghĩa ID mới
    userExamId: number;
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
        console.log('Converted (number) isFinished:', result);
        return result;
      },
      to: (value) => (value ? 1 : 0),
    },
  })
  isFinished: boolean;

  // RELATIONSHIP

  @ManyToOne(() => User, (User) => User.examAttempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  student: User;

  @ManyToOne(() => EXAM, (exam) => exam.examAttempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: EXAM;

  @OneToMany(() => StudentAnswer, (studentAnswer) => studentAnswer.examAttempt)
  studentAnswers: StudentAnswer[];
}
