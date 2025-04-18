import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { BeforeUpdate, PrimaryGeneratedColumn, Entity, JoinColumn, OneToMany, ManyToOne, OneToOne} from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { ClassStudent } from './class-student.entity';
import { ClassTeacher } from './class-teacher.entity';
import { School } from './school.entity';
import { User } from '../user/user.entity';
import { Vocabulary } from '../vocabulary/vocabulary.entity';
import { Question } from '../question/question.entity';
import { AppStatus } from 'src/types/common';
import { EXAM } from '../exam/exam.entity';
import { StringUtil } from 'src/utils/string';
import { ClassLevel } from 'src/types/classroom';
import { Topic } from '../vocabulary/topic.entity';
import { Lesson } from './lesson.entity';

@Entity(EntityNameConst.CLASSROOM)
export class ClassRoom extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'class_room_id' }) // Định nghĩa ID mới
  classroomId: number;
  @DBColumn({
    name: 'content',
    type: 'varchar',
  })
  name: string;

  @DBColumn({
    name: 'thumbnail_path',
    type: 'varchar',
    nullable: true,
  })
  thumbnailPath: string;

  @DBColumn({
    name: 'image_location',
    type: 'varchar',
    nullable: true,
  })
  imageLocation: string;

  @DBColumn({
    name: 'teacher_id',
    type: 'bigint',
    nullable: true,
  })
  teacherId: number;

  @DBColumn({
    name: 'description',
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @DBColumn({
    name: 'class_code',
    type: 'varchar',
    nullable: true,
  })
  classCode: string;

  @DBColumn({
    name: 'school_id',
    type: 'bigint',
    nullable: true,
  })
  schoolId: number;

  @DBColumn({
    name: 'is_teacher_created',
    type: 'boolean',
    default: false,
  })
  isTeacherCreated: boolean;

  @DBColumn({
    name: 'status',
    type: 'enum',
    enum: AppStatus,
    default: AppStatus.PENDING,
  })
  status: AppStatus;

  @DBColumn({
    name: 'slug',
    type: 'varchar',
    nullable: true,
  })
  slug: string;

  @DBColumn({
    name: 'class_level',
    type: 'enum',
    enum: ClassLevel,
  })
  classLevel: ClassLevel;

  // RELATIONSHIP

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.classroom)
  vocabularies: Vocabulary;

  @OneToMany(() => ClassStudent, (classStudent) => classStudent.classroom)
  classStudents: ClassStudent[];

  @OneToOne(() => ClassTeacher, (classTeacher) => classTeacher.classroom)
  classTeachers: ClassTeacher[];

  @OneToMany(() => Lesson, (lesson) => lesson.classroom)
  lesson: Lesson[];

  @ManyToOne(() => School, (school) => school.classRooms)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => User, (User) => User.classTeachers)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @OneToMany(() => Question, (question) => question.classroom)
  questions: Question;

  @OneToMany(() => EXAM, (exam) => exam.classroom)
  exams: EXAM[];

  @OneToMany(() => Topic, (topic) => topic.classroom)
  topics: Topic[];

  @BeforeUpdate()
  handleBeforeUpdate() {
    this.slug = StringUtil.createSlug(this.name);
  }
}
