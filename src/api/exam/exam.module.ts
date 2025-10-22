import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamPermissionController } from './exam-permission.controller';
import { ExamController } from './exam.controller';
@Module({
  providers: [ExamService],
  controllers: [ExamPermissionController, ExamController],
})
export class ExamModule {}
