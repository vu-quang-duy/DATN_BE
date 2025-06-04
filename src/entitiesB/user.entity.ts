import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { PrimaryGeneratedColumn, Entity, OneToMany} from 'typeorm';
import { AbstractTimeEntity } from '../entities/entity.interface';
import { Gender } from 'src/constant/enum-common';
import { QuestionB } from './question.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity(EntityNameConst.USER)
export class UserB extends AbstractTimeEntity {
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
    @OneToMany(() => QuestionB, (question) => question.creator)
    questions: QuestionB[];
  
}
