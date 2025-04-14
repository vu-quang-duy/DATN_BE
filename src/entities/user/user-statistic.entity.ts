import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { User } from './user.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';
@Entity(EntityNameConst.USER_STATISTIC)
export class UserStatistic extends AbstractTimeEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'user_statistic_id' }) // Định nghĩa ID mới
  userStatisticId: number;

  @DBColumn({ type: 'bigint', name: 'total_classes_joined', default: 0 })
  totalClassesJoined: number;

  @DBColumn({ type: 'bigint', name: 'vocabulary_views', default: 0 })
  vocabularyViews: number;

  @DBColumn({ type: 'bigint', name: 'lesson_views', default: 0 })
  lessonViews: number;

  @DBColumn({ type: 'bigint', name: 'tests_completed', default: 0 })
  testsCompleted: number;

  @DBColumn({ type: 'numeric', name: 'average_score', default: 0, precision: 10, scale: 2 })
  averageScore: number;

  @DBColumn({ type: 'bigint', name: 'user_id' })
  userId: number;

  @OneToOne(() => User, (user) => user.userLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => User, (student) => student.userStatistic, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  student: User;
}
