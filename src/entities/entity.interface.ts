/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsSwaggerDateTime, IsSwaggerNumber } from '../decorator/swagger.decorator';

// export abstract class AbstractIdEntity extends BaseEntity {
//   @IsSwaggerNumber({ default: 1 })
//   @PrimaryGeneratedColumn({ type: 'int' })
//   id: number;
// }

// export abstract class AbstractCreatedEntity extends BaseEntity {
//   @IsSwaggerDateTime()
//   @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
//   createdDate: Date;
// }

// export abstract class AbstractCreatedIdEntity extends AbstractIdEntity {
//   @IsSwaggerDateTime()
//   @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
//   createdDate: Date;
// }

// export abstract class AbstractTimeEntity extends AbstractIdEntity {
//   @IsSwaggerDateTime()
//   @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
//   createdDate: Date;

//   @IsSwaggerDateTime()
//   @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
//   updatedAt: Date;
// }

// export abstract class AbstractTimeNotIdEntity extends BaseEntity {
//   @IsSwaggerDateTime()
//   @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
//   createdDate: Date;

//   @IsSwaggerDateTime()
//   @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
//   updatedAt: Date;
// }
export abstract class AbstractCreatedIdEntity extends BaseEntity {
  @IsSwaggerDateTime()
  @CreateDateColumn({ type: 'datetime', name: 'created_at' }) // Đổi 'timestamp' thành 'datetime'
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
