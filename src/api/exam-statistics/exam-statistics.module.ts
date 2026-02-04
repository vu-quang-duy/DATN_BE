import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamStatisticsController } from './exam-statistics.controller';
import { ExamStatisticsService } from './exam-statistics.service';
import { User } from 'src/entities/user/user.entity';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
import { StudentAnswer } from 'src/entities/question/student-answer.entity';
import { Question } from 'src/entities/question/question.entity';
import { Answer } from 'src/entities/question/answer.entity';
import { ExamVocabulary } from 'src/entities/exam/exam-vocabulary.entity';
import { ExamVideo } from 'src/entities/exam/exam-video.entity';
import { Vocabulary } from 'src/entities/vocabulary/vocabulary.entity';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { ClassTeacher } from 'src/entities/class/class-teacher.entity';
import { ExamB } from 'src/entitiesB/exam.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ExamAttempt,
      PracticeExamAttempt,
      StudentAnswer,
      Question,
      Answer,
      ExamVocabulary,
      ExamVideo,
      Vocabulary,
      ClassRoom,
      ClassTeacher,
    ]), // default connection
    TypeOrmModule.forFeature([ExamB], 'dbB'), // dbB connection
  ],
  controllers: [ExamStatisticsController],
  providers: [ExamStatisticsService],
})
export class ExamStatisticsModule {}
