/* eslint-disable @typescript-eslint/no-unused-vars */
import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entities/entity.interface';
// import { StudentAnswer } from '../entities/question/student-answer.entity';
// import { User } from '../entities/user/user.entity';
import { ExamB } from './exam.entity';
import { User } from '../entities/user/user.entity';

@Entity(EntityNameConst.EXAM_ATTEMPT)
export class ExamAttemptB {
  static countBy(arg0: { studentId: any; isFinished: boolean }) {
    throw new Error('Method not implemented.');
  }
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
        return result;
      },
      to: (value) => (value ? 1 : 0),
    },
  })
  isFinished: boolean;

  // RELATIONSHIP
  @ManyToOne(() => ExamB, (exam) => exam.examAttempts) // Quan hệ Many-to-One với bảng Exam
  @JoinColumn({ name: 'exam_id' })
  exam: ExamB;

  // @ManyToOne(() => User, (User) => User.examAttempts, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'user_id' })
  // student: User;
}
