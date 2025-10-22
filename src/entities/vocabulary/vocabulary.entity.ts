import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { AppStatus } from 'src/types/common';
import { VocabularyTypeConst } from 'src/types/vocabulary';
import { StringUtil } from 'src/utils/string';
import { BeforeInsert, PrimaryGeneratedColumn, BeforeUpdate, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClassRoom } from '../class/classroom.entity';
import { AbstractTimeEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { Topic } from './topic.entity';
import { VocabularyView } from './vocabulary-view.entity';
import { ExamVocabulary } from '../exam/exam-vocabulary.entity';

@Entity(EntityNameConst.VOCABULARY)
export class Vocabulary extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'vocabulary_id' }) // Định nghĩa ID mới
  vocabularyId: number;

  @DBColumn({
    name: 'content',
    type: 'varchar',
  })
  content: string;

  @DBColumn({
    name: 'description',
    type: 'varchar',
    nullable: true,
  })
  description: string;

  // @DBColumn({
  //   name: 'is_private',
  //   type: 'bit',
  //   default: 0,
  // })
  // isPrivate: Buffer;
  @DBColumn({
    name: 'is_private',
    type: 'bit',
    //   default: 0,
    // })
    // private: Buffer;
    transformer: {
      to: (value: boolean) => (value ? Buffer.from([1]) : Buffer.from([0])), // Lưu vào DB
      from: (value: Buffer) => value[0] === 1, // Lấy từ DB
    },
  })
  isPrivate: boolean;

  @DBColumn({
    name: 'topic_id',
    type: 'bigint',
  })
  topicId: number;

  @DBColumn({
    name: 'vocabulary_type',
    type: 'enum',
    enum: VocabularyTypeConst,
    default: VocabularyTypeConst.WORD,
  })
  vocabularyType: VocabularyTypeConst;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
    nullable: true,
  })
  classroomId: number;

  @DBColumn({
    name: 'part_id',
    type: 'bigint',
    nullable: true,
  })
  partId: number;

  @DBColumn({
    name: 'created_id',
    type: 'bigint',
  })
  creatorId: number;

  @DBColumn({
    name: 'created_by',
    type: 'varchar',
  })
  creatorEmail: string;

  @DBColumn({
    name: 'images_path',
    type: 'varchar',
    nullable: true,
    array: true,
  })
  imagesPath: string[];

  @DBColumn({
    name: 'note',
    type: 'varchar',
    nullable: true,
  })
  note: string;

  @DBColumn({
    name: 'videos_path',
    type: 'varchar',
    nullable: true,
    array: true,
  })
  videosPath: string;

  @DBColumn({
    name: 'lesson_id',
    type: 'bigint',
    nullable: true,
  })
  lessonId: number;

  @DBColumn({ name: 'slug', type: 'varchar', nullable: true })
  slug: string;

  @DBColumn({ name: 'status', type: 'enum', enum: AppStatus, default: AppStatus.PENDING })
  status: AppStatus;

  // RELATIONSHIP

  @ManyToOne(() => Topic, (topic) => topic.vocabulary, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @OneToMany(() => VocabularyView, (vocabularyType) => vocabularyType.vocabulary)
  vocabularyViews: VocabularyView[];

  @ManyToOne(() => User, (user) => user.vocabularies, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.vocabularies, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_room_id' })
  classroom: ClassRoom;

  @BeforeInsert()
  handleBeforeInsert() {
    this.slug = StringUtil.createSlug(this.content);
  }

  @BeforeUpdate()
  handleBeforeUpdate() {
    this.slug = StringUtil.createSlug(this.content);
  }

  @OneToMany(() => ExamVocabulary, (examQuestion) => examQuestion.vocabulary)
  exams: ExamVocabulary[];
}
