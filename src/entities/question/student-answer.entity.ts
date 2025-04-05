import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { ExamAttempt } from '../exam/exam-attempt.entity';
import { Question } from './question.entity';

@Entity(EntityNameConst.STUDENT_ANSWER)
export class StudentAnswer extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'question_exam_user_id' }) // Định nghĩa ID mới
  questionExamUserId: number;
  
  @DBColumn({
    name: 'exam_attempt_id',
    type: 'bigint',
    nullable: true,
  })
  examAttemptId: number;

  @DBColumn({
    name: 'exam_id',
    type: 'bigint',
    nullable: true,
  })
  examId: number;

  @DBColumn({
    name: 'question_id',
    type: 'bigint',
  })
  questionId: number;

  @DBColumn({
    name: 'selected_answers',
    type: 'varbinary',
    length: 16,
    transformer: {
      to: (value: number[]) => Buffer.from(value), // Convert number[] → Buffer khi lưu vào DB
      from: (value: Buffer) => [...value], // Convert Buffer → number[] khi lấy từ DB
    },
  })
  selectedAnswers: number[];

  @DBColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  @DBColumn({
    name: 'answered_at',
    type: 'timestamp',
    nullable: true,
  })
  answeredAt: Date;
  // RELATIONSHIP

  @ManyToOne(() => Question, (question) => question.studentAnswers)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => ExamAttempt, (examAttempt) => examAttempt.studentAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  examAttempt: ExamAttempt;
}
