import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { Vocabulary } from './vocabulary.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';
@Entity(EntityNameConst.VOCABULARY_VIEW)
export class VocabularyView extends AbstractCreatedIdEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'vocabulary_view_id' }) // Định nghĩa ID mới
  vocabularyViewId: number;

  @DBColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  @DBColumn({
    name: 'vocabulary_id',
    type: 'bigint',
  })
  vocabularyId: number;

  @DBColumn({
    name: 'last_viewed_at',
    type: 'timestamp',
  })
  lastViewedAt: Date;

  @DBColumn({
    name: 'view_count',
    type: 'bigint',
    default: 0,
    transformer: {
      from: (value: string | number) => Number(value),
      to: (value: number) => value,
    },
  })
  viewCount: number;

  // RELATIONSHIP

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.vocabularyViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;

  @ManyToOne(() => User, (user) => user.vocabularyViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
