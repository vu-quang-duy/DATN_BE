import { Module } from '@nestjs/common';
import { UploadPermissionController } from './upload-permission.controller';
import { UploadService } from './upload.service';

@Module({
  providers: [UploadService],
  controllers: [UploadPermissionController],
})
export class UploadModule {}
