import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamPermissionController } from './exam-permission.controller';
import { ExamController } from './exam.controller';
import { MinioService } from 'src/utils/minio';
import { VideoUrlService } from 'src/utils/video-url.service';

@Module({
  providers: [ExamService, MinioService, VideoUrlService],
  controllers: [ExamPermissionController, ExamController],
})
export class ExamModule { }
