import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
import { User } from '../user/user.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Part } from './part.entity';
import { Lesson } from './lesson.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';

@Entity(EntityNameConst.PART_VIEW)
export class PartView extends AbstractCreatedIdEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'part_view_id' }) // Định nghĩa ID mới
  partViewId: number;

  @DBColumn({
    name: 'user_id',
    type: 'bigint',
  })
  userId: number;

  @DBColumn({
    name: 'part_id',
    type: 'bigint',
    default: 0,
    nullable: true,
  })
  partId: number;

  @DBColumn({
    name: 'lesson_id',
    type: 'bigint',
    nullable: true,
  })
  lessonId: number;

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

  // @ManyToOne(() => Part, (part) => part.partViews, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'part_id' })
  // part: Part;

  @ManyToOne(() => Lesson, (lesson) => lesson.partViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => User, (user) => user.partViews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
