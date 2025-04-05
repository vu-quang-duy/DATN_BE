import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ClassRoom } from '../class/classroom.entity';
import { AbstractTimeEntity } from '../entity.interface';
import { User } from '../user/user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity(EntityNameConst.TOPIC)
export class Topic extends AbstractTimeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'topic_id' }) // Định nghĩa ID mới
  topicId: number;

  @DBColumn({
    name: 'content',
    type: 'varchar',
    unique: true,
  })
  name: string;

  @DBColumn({
    name: 'class_room_id',
    type: 'bigint',
    nullable: true,
  })
  classroomId?: number;

  @DBColumn({
    name: 'image_location',
    type: 'varchar',
    nullable: true,
  })
  imageLocation: string;

  @DBColumn({
    name: 'description',
    type: 'varchar',
    nullable: true,
  })
  description: string;

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
    name: 'is_private',
    type: 'bit',
    // default: 0,
    transformer: {
      to: (value: boolean) => value ? Buffer.from([1]) : Buffer.from([0]), // Lưu vào DB
      from: (value: Buffer) => value[0] === 1, // Lấy từ DB
    },
  })
  isCommon: boolean;

  // RELATIONSHIP

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.topic)
  vocabulary: Vocabulary;

  @ManyToOne(() => ClassRoom, (classRoom) => classRoom.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_room_id' })
  classroom?: ClassRoom;

  @ManyToOne(() => User, (user) => user.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator?: User;
}
