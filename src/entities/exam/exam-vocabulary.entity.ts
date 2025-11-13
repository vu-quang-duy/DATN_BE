import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
// import { ExamB } from 'src/entitiesB/exam.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';
import { Vocabulary } from '../vocabulary/vocabulary.entity';

@Entity(EntityNameConst.EXAM_VOCABULARY)
export class ExamVocabulary extends AbstractCreatedIdEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'vocabulary_exam_id' }) // Định nghĩa ID mới
  vocabularyExamId: number;

  @DBColumn({ type: 'bigint', name: 'vocabulary_id' })
  vocabularyId: number;

  @DBColumn({ type: 'bigint', name: 'exam_id' })
  examId: number;

  @DBColumn({ type: 'varchar', name: 'content' })
  content: string;

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.exams)
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;
}
