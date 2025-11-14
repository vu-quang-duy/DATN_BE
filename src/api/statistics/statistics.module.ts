import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { User } from 'src/entities/user/user.entity';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
import { UserLog } from 'src/entities/user/user-log.entity';
import { ClassRoom } from 'src/entities/class/classroom.entity';
import { Topic } from 'src/entities/vocabulary/topic.entity';
import { UserStatistic } from 'src/entities/user/user-statistic.entity';
import { ClassTeacher } from 'src/entities/class/class-teacher.entity';
import { ExamB } from 'src/entitiesB/exam.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ExamAttempt,
      PracticeExamAttempt,
      UserLog,
      ClassRoom,
      Topic,
      UserStatistic,
      ClassTeacher,
    ]), // default connection
    TypeOrmModule.forFeature([ExamB], 'dbB'), // dbB connection
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
