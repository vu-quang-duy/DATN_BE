import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import { Question } from '../question/question.entity';
import { EXAM } from './exam.entity';

@Entity(EntityNameConst.EXAM_QUESTION)
export class ExamQuestion extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'question_exam_id' }) // Định nghĩa ID mới
  questionExamId: number;

  @DBColumn({ type: 'bigint', name: 'question_id' })
  questionId: number;

  @DBColumn({ type: 'bigint', name: 'exam_id' })
  examId: number;

  @ManyToOne(() => EXAM, (exam) => exam.questions)
  @JoinColumn({ name: 'exam_id' })
  exam: EXAM;

  @ManyToOne(() => Question, (question) => question.exams)
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
