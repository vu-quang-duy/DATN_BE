import { EntityNameConst } from 'src/constant/entity-name';
import { DBColumn } from 'src/decorator/swagger.decorator';
import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractCreatedIdEntity } from './entity.interface';

@Entity(EntityNameConst.TOKEN)
export class Token extends AbstractCreatedIdEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'token_id' }) // Định nghĩa ID mới
  tokenId: number;
  @DBColumn({ type: 'varchar', name: 'name' })
  name: string;

  @DBColumn({ type: 'varchar', name: 'code', unique: true })
  code: string;

  // RELATION ------------
}
