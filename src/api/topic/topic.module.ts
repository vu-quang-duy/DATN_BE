import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicPermissionController } from './topic-permission.controller';
import { TopicController } from './topic.controller';
@Module({
  providers: [TopicService],
  controllers: [TopicPermissionController, TopicController],
})
export class TopicModule {}
