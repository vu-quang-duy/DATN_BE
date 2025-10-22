import { ApiProperty } from '@nestjs/swagger';
import { UploadFileType, UploadImageType } from 'src/constant/upload';
import { IsSwaggerEnum } from 'src/decorator/swagger.decorator';

export class UploadFileDto {
  @ApiProperty({
    type: 'file',
    format: 'binary',
    required: false,
    isArray: true,
  })
  readonly file: Express.Multer.File[];

  @IsSwaggerEnum({ enum: UploadFileType }, false)
  readonly type: UploadFileType;
}

export class UploadImageDto {
  @ApiProperty({
    type: 'file',
    format: 'binary',
    required: false,
    isArray: true,
  })
  readonly file: Express.Multer.File[];

  @IsSwaggerEnum({ enum: UploadImageType }, false)
  readonly type?: UploadImageType;
}
