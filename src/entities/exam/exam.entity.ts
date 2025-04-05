import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { AppStatus } from 'src/types/common';
import { StringUtil } from 'src/utils/string';
import { PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClassRoom } from '../class/classroom.entity';
import { AbstractTimeEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamQuestion } from './exam-question.entity';

@Entity(EntityNameConst.EXAM)
export class EXAM extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'exam_id' }) // Định nghĩa ID mới
  examId: number;

  @DBColumn({
    name: 'name',
    type: 'varchar',
  })
  name: string;

  @DBColumn({
    name: 'description',
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
    nullable: true,
  })
  classRoomId: number;

  @DBColumn({
    name: 'creator_id',
    type: 'int',
  })
  creatorId: number;

  @DBColumn({
    name: 'created_by',
    type: 'varchar',
  })
  createdBy: string;

  @DBColumn({
    name: 'number_of_questions',
    type: 'int',
    default: 0,
  })
  numberOfQuestions: number;

  @DBColumn({
    name: 'thumbnail_path',
    type: 'varchar',
    nullable: true,
  })
  thumbnailPath: string;

  @DBColumn({
    name: 'is_private',
    type: 'bit',
  //   default: 0,
  // })
  // private: Buffer;
  transformer: {
    to: (value: boolean) => value ? Buffer.from([1]) : Buffer.from([0]), // Lưu vào DB
    from: (value: Buffer) => value[0] === 1, // Lấy từ DB
  },
})
  private: boolean;

  @DBColumn({ name: 'slug', type: 'varchar', nullable: true })
  slug: string;

  @DBColumn({ name: 'status', type: 'enum', enum: AppStatus, default: AppStatus.PENDING })
  status: AppStatus;

  // RELATIONSHIP

  @ManyToOne(() => User, (user) => user.exams, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.exams, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'class_room_id' })
  classroom: ClassRoom;

  @OneToMany(() => ExamAttempt, (examAttempt) => examAttempt.exam)
  examAttempts: ExamAttempt[];

  @OneToMany(() => ExamQuestion, (examQuestion) => examQuestion.exam)
  questions: ExamQuestion[];

  @BeforeInsert()
  handleBeforeInsert() {
    this.slug = StringUtil.createSlug(this.name);
  }

  @BeforeUpdate()
  handleBeforeUpdate() {
    this.slug = StringUtil.createSlug(this.name);
  }
}
