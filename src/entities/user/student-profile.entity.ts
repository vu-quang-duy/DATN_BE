import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { AbstractCreatedIdEntity } from '../entity.interface';
import { User } from './user.entity';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';

@Entity(EntityNameConst.STUDENT_PROFILE)
export class StudentProfile extends AbstractCreatedIdEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'student_profile_id' }) // Định nghĩa ID mới
  studentProfileId: number;

  @DBColumn({ type: 'varchar', name: 'student_code' })
  studentCode: string;

  @DBColumn({ type: 'bigint', name: 'user_id' })
  userId: number;

  @OneToOne(() => User, (user) => user.studentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
