/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsSwaggerDateTime, IsSwaggerNumber } from '../decorator/swagger.decorator';

export abstract class AbstractCreatedIdEntity extends BaseEntity {
  @IsSwaggerDateTime()
  @CreateDateColumn({ type: 'datetime', name: 'created_date' }) // Đổi 'timestamp' thành 'datetime'
  createdDate: Date;
}

export abstract class AbstractTimeEntity extends BaseEntity {
  @IsSwaggerDateTime()
  @CreateDateColumn({ type: 'datetime', name: 'created_date' }) // Đổi 'timestamp' thành 'datetime'
  createdDate: Date;

  @IsSwaggerDateTime()
  @UpdateDateColumn({ type: 'datetime', name: 'modified_date' }) // Đổi 'timestamp' thành 'datetime'
  updatedAt: Date;
}
