import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
import { StudentAnswer } from '../question/student-answer.entity';
import { User } from '../user/user.entity';
import { EXAM } from './exam.entity';

@Entity(EntityNameConst.EXAM_ATTEMPT)
export class ExamAttempt extends AbstractCreatedIdEntity {
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
    name: 'is_finish',
    type: 'boolean',
    default: false,
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
