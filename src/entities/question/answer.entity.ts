import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
import { Question } from './question.entity';

@Entity(EntityNameConst.ANSWER)
export class Answer extends AbstractCreatedIdEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'answer_id' }) // Định nghĩa ID mới
  answerId: number;

  @DBColumn({
    name: 'content',
    type: 'varchar',
  })
  content: string;

  @DBColumn({
    name: 'is_correct',
    type: 'bit',
    default: 0,
  })
  correct: Buffer;

  @DBColumn({
    name: 'image_location',
    type: 'varchar',
    nullable: true,
  })
  imageLocation: string;

  @DBColumn({
    name: 'video_location',
    type: 'varchar',
    nullable: true,
  })
  videoLocation: string;

  @DBColumn({
    name: 'question_id',
    type: 'bigint',
  })
  questionId: number;

  // RELATIONSHIP

  @ManyToOne(() => Question, (question) => question.answerResList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
