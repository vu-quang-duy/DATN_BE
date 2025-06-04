import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { FileType, QuestionType } from 'src/types/classroom';
import { PrimaryGeneratedColumn, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractTimeEntity } from '../entities/entity.interface';
import { UserB } from './user.entity';
import { AnswerB } from './answer.entity';

@Entity(EntityNameConst.QUESTION)
export class QuestionB extends AbstractTimeEntity {
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


  // RELATIONSHIP

  @ManyToOne(() => UserB, (User) => User.questions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: UserB;

//   @ManyToOne(() => ClassRoom, (classRoom) => classRoom.questions, { onDelete: 'SET NULL' })
//   @JoinColumn({ name: 'class_room_id' })
//   classroom: ClassRoom;

//   @OneToMany(() => StudentAnswer, (studentAnswer) => studentAnswer.question)
//   studentAnswers: StudentAnswer[];

  @OneToMany(() => AnswerB, (answer) => answer.question)
  answerResList: AnswerB[];

//   @OneToMany(() => ExamQuestion, (exam) => exam.question)
//   exams: ExamQuestion[];
}
