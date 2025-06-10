import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
// import { ExamB } from 'src/entitiesB/exam.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';
import { User } from '../user/user.entity';

@Entity(EntityNameConst.EXAM_VIDEO)
export class ExamVideo extends AbstractCreatedIdEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'video_exam_id' }) // Định nghĩa ID mới
  videoExamId: number;

  @DBColumn({ type: 'varchar', name: 'video_url', length: 255 })
  videoUrl: string;

  @DBColumn({ type: 'varchar', name: 'AI_answer', length: 255 })
  aiAnswer: string;

  @DBColumn({ type: 'bigint', name: 'exam_id' })
  examId: number;

  @DBColumn({ type: 'bigint', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (User) => User.examVideos)
  @JoinColumn({ name: 'user_id' })
  student: User;
}
