import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { FileType, QuestionType } from 'src/types/classroom';
import { StringUtil } from 'src/utils/string';
import { PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClassRoom } from '../class/classroom.entity';
import { AbstractTimeEntity } from '../entity.interface';
import { ExamQuestion } from '../exam/exam-question.entity';
import { User } from '../user/user.entity';
import { Answer } from './answer.entity';
import { StudentAnswer } from './student-answer.entity';

@Entity(EntityNameConst.QUESTION)
export class Question extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'question_id' }) // Định nghĩa ID mới
  questionId: number;

  @DBColumn({
    name: 'content',
    type: 'varchar',
  })
  content: string;

  @DBColumn({
    name: 'explanation',
    type: 'varchar',
    nullable: true,
  })
  explanation: string;

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
    name: 'created_by',
    type: 'varchar',
    nullable: true,
  })
  creatorEmail: string;

  @DBColumn({
    name: 'created_id',
    type: 'varchar',
    nullable: true,
  })
  creatorId: number;

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
    name: 'file_type',
    type: 'enum',
    enum: FileType,
    default: FileType.EXISTED,
  })
  fileType: FileType;

  @DBColumn({
    name: 'question_type',
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_ANSWERS,
  })
  questionType: QuestionType;

  @DBColumn({ name: 'slug', type: 'varchar', nullable: true })
  slug: string;

  // RELATIONSHIP

  @ManyToOne(() => User, (User) => User.questions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.questions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_room_id' })
  classroom: ClassRoom;

  @OneToMany(() => StudentAnswer, (studentAnswer) => studentAnswer.question)
  studentAnswers: StudentAnswer[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answerResList: Answer[];

  @OneToMany(() => ExamQuestion, (exam) => exam.question)
  exams: ExamQuestion[];

  @BeforeInsert()
  handleBeforeInsert() {
    this.slug = StringUtil.createSlug(this.content);
  }

  @BeforeUpdate()
  handleBeforeUpdate() {
    this.slug = StringUtil.createSlug(this.content);
  }
}
