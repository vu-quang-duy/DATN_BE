import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamPermissionController } from './exam-permission.controller';
import { ExamController } from './exam.controller';
import { MinioService } from 'src/utils/minio';
@Module({
  providers: [ExamService, MinioService],
  controllers: [ExamPermissionController, ExamController],
})
export class ExamModule {}
