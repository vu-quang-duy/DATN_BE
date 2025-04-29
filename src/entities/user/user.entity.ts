import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { ClassTeacher } from '../class/class-teacher.entity';
import { AbstractTimeEntity } from '../entity.interface';
import { EXAM } from '../exam/exam.entity';
import { Role } from '../role/role.entity';
import { Upload } from '../upload/upload.entity';
import { VocabularyView } from '../vocabulary/vocabulary-view.entity';
import { Vocabulary } from '../vocabulary/vocabulary.entity';
import { ExamAttempt } from './../exam/exam-attempt.entity';
import { UserLog } from './user-log.entity';
import { Question } from '../question/question.entity';
import { ClassStudent } from '../class/class-student.entity';
import { Gender } from 'src/constant/enum-common';
import { StudentProfile } from './student-profile.entity';
import { Topic } from '../vocabulary/topic.entity';
import { UserStatistic } from './user-statistic.entity';
import { PartView } from '../class/part-view.entity';
import { School } from '../class/school.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity(EntityNameConst.USER)
export class User extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'user_id' }) // Định nghĩa ID mới
  userId: number;


  @DBColumn({
    name: 'password',
    type: 'varchar',
    nullable: true,
  })
  password: string;

  @DBColumn({
    name: 'name',
    type: 'varchar',
    nullable: true,
  })
  name: string;

  @DBColumn({
    name: 'avatar_location',
    type: 'varchar',
    nullable: true,
  })
  avatarLocation: string;

  @DBColumn({
    name: 'email',
    type: 'varchar',
    nullable: true,
  })
  email: string;

  @DBColumn({
    name: 'phone_number',
    type: 'varchar',
    nullable: true,
  })
  phoneNumber: string;

  @DBColumn({
    name: 'address',
    type: 'varchar',
    nullable: true,
  })
  address: string;

  @DBColumn({ type: 'datetime', name: 'birth_day', precision: 6, nullable: true })
  birthDay:Date;

  @DBColumn({ type: 'enum', name: 'gender', enum: Gender, default: Gender.MALE })
  gender: Gender;

  // @DBColumn({ type: 'bigint', name: 'code', nullable: true })
  // code: number;

  @DBColumn({ type: 'varchar', name: 'code', nullable: true })
  code: string;

  @DBColumn({
    type: 'bit',
    name: 'is_deleted',
    width: 1,
    default: 0, // mặc định là 0 (false)
  })
  isDeleted: boolean;

  @DBColumn({
    type: 'bit',
    name: 'is_approved',
    width: 1,
    default: 0, // mặc định là 0 (false)
  })
  isApproved: boolean;

  // RELATIONSHIP
  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'code' })
  role: Role;

  @OneToMany(() => Upload, (upload) => upload.creator)
  uploads: Upload[];

  @OneToMany(() => UserLog, (userLog) => userLog.user)
  userLogs: UserLog[];

  @ManyToOne(() => School, (school) => school.users)
  @JoinColumn({ name: 'school_id' })
  school: School;


  @OneToMany(() => VocabularyView, (vocabularyView) => vocabularyView.user)
  vocabularyViews: VocabularyView[];

  @OneToMany(() => PartView, (partView) => partView.user)
  partViews: PartView[];

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.creator)
  vocabularies: Vocabulary[];

  @OneToMany(() => ClassTeacher, (classTeacher) => classTeacher.teacher)
  classTeachers: ClassTeacher[];

  @OneToMany(() => EXAM, (exam) => exam.creator)
  exams: EXAM[];

  @OneToMany(() => ExamAttempt, (examAttempt) => examAttempt.student)
  examAttempts: ExamAttempt[];

  @OneToMany(() => Question, (question) => question.creator)
  questions: Question[];

  @OneToMany(() => ClassStudent, (classStudent) => classStudent.student)
  classStudents: ClassStudent[];

  @OneToOne(() => StudentProfile, (studentProfile) => studentProfile.user)
  studentProfile: StudentProfile;

  @OneToMany(() => Topic, (topic) => topic.creator)
  topics: Topic[];

  @OneToOne(() => UserStatistic, (userStatistic) => userStatistic.user)
  userStatistic: UserStatistic;

  @DBColumn({
    name: 'school_id',
    type: 'bigint',
    nullable: true,
  })
  schoolId: number;

  @DBColumn({
    name: 'house_street',
    type: 'varchar',
    nullable: true,
  })
  houseStreet: string;

  @DBColumn({
    name: 'ward',
    type: 'varchar',
    nullable: true,
  })
  ward: string;

  @DBColumn({
    name: 'district',
    type: 'varchar',
    nullable: true,
  })
  district: string;

  @DBColumn({
    name: 'city',
    type: 'varchar',
    nullable: true,
  })
  city: string;
}
