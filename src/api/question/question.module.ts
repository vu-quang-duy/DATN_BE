import { Module } from '@nestjs/common';
import { QuestionPermissionController } from './question-permission.controller';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
@Module({
  providers: [QuestionService],
  controllers: [QuestionPermissionController, QuestionController],
})
export class QuestionModule {}
