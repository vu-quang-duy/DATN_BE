import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn, Entity, OneToMany} from 'typeorm';
import { AbstractTimeEntity } from '../entities/entity.interface';
import { ExamAttemptB } from './exam-attempt.entity';
// import { ExamVocabulary } from 'src/entities/exam/exam-vocabulary.entity';
@Entity(EntityNameConst.EXAM)
export class ExamB extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'exam_id' }) // Định nghĩa ID mới
  examId: number;

  @DBColumn({
    name: 'name',
    type: 'varchar',
  })
  name: string;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
    nullable: true,
  })
  classRoomId: number;

  @DBColumn({
    name: 'created_by',
    type: 'varchar',
  })
  createdBy: string;

  @DBColumn({
    name: 'is_private',
    type: 'bit',
  transformer: {
    to: (value: boolean) => value ? Buffer.from([1]) : Buffer.from([0]), // Lưu vào DB
    from: (value: Buffer) => value[0] === 1, // Lấy từ DB
  },
})
  isPrivate: boolean;

  @OneToMany(() => ExamAttemptB, (attempt) => attempt.exam)  // Quan hệ One-to-Many với bảng user_exam_mapping
  examAttempts: ExamAttemptB[]; 

  
  // @OneToMany(() => ExamVocabulary, (examVocabulary) => examVocabulary.exam)
  // vocabularies: ExamVocabulary[];

}
