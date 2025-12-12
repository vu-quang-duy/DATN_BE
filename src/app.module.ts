import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Inject, MiddlewareConsumer, Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
// import * as redisStore from 'cache-manager-redis-store';
import { UploadModule } from './api/upload/upload.module';
import { UserModule } from './api/user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmConfigService, TypeOrmConfigServiceB, dataSourceFactory } from './config/database.config';
import { ENV } from './config/environment';
import { JobModule } from './job/job.module';
import { winstonLogger } from './logger';
import { RequestLogMiddleware } from './middleware/request-log.middleware';
import { ClassroomModule } from './api/classroom/classroom.module';
import { VocabularyModule } from './api/vocabulary/vocabulary.module';
import { TopicModule } from './api/topic/topic.module';
import { QuestionModule } from './api/question/question.module';
import { ExamModule } from './api/exam/exam.module';
import { LessonsModule } from './api/classroom/lesson.module';
import { ExamStatisticsModule } from './api/exam-statistics/exam-statistics.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory,
    }),
    TypeOrmModule.forRootAsync({
      name: 'dbB',
      useClass: TypeOrmConfigServiceB,
      dataSourceFactory,
    }),

    CacheModule.register({
      // isGlobal: true,
      // store: redisStore,
      // host: ENV.REDIS.REDIS_HOST,
      // port: ENV.REDIS.REDIS_PORT,
      isGlobal: true,
      store: 'memory', // ✅ Không dùng Redis nữa
      ttl: 60 * 60, // 1 tiếng
      // ttl: 600,
    }),

    ScheduleModule.forRoot(),
    JobModule,
    // ENTITY MODULE
    AuthModule,
    LessonsModule,
    UserModule,
    UploadModule,
    ClassroomModule,
    VocabularyModule,
    TopicModule,
    QuestionModule,
    ExamModule,
    ExamStatisticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) protected readonly cacheManager) {}

  async onModuleInit() {
    try {
      // Clear caching after deploy app
      if (ENV.NODE_ENV !== 'development') {
        const keys = await this.cacheManager.keys();
        keys?.length && (await this.cacheManager.del(keys));
      }
    } catch (e) {
      winstonLogger.error(e);
    }
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLogMiddleware).forRoutes('*');
  }
}
