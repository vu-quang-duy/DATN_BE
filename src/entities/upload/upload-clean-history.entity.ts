import { EntityNameConst } from 'src/constant/entity-name';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractTimeEntity } from '../entity.interface';
import { IsSwaggerNumber } from '../../decorator/swagger.decorator';

export type UploadCleanHistoryType = {
  totalSuccess: number;
  totalError: number;
};

@Entity(EntityNameConst.UPLOAD_CLEAN_HISTORY)
export class UploadCleanHistory extends AbstractTimeEntity {
  @IsSwaggerNumber({ default: 1 })
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'upload_clean_id' }) // Định nghĩa ID mới
  uploadCleanId: number;

  @Column({ name: 'start_at', type: 'timestamp' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamp' })
  endAt: Date;

  @Column({ type: 'int', name: 'total_success' })
  totalSuccess: number;

  @Column({ type: 'int', name: 'total_error' })
  totalError: number;
}
