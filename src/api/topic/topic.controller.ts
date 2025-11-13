import { Get, Param, Query } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { SearchTopicDto } from 'src/dto/topic/search-topic.dto';
import { User } from 'src/entities/user/user.entity';
import { Topic } from './../../entities/vocabulary/topic.entity';
import { TopicService } from './topic.service';

@IsAuthController(EntityNameConst.TOPIC, false)
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('/all')
  @ApiHandleResponse({
    summary: 'Get Topic list',
    type: Topic,
  })
  async search(@Query() query: SearchTopicDto) {
    return await this.topicService.search(query);
  }

  @Get('/:id')
  @ApiHandleResponse({
    summary: 'Get topic info by id',
    type: User,
  })
  async getProfileById(@Param('id') id: number) {
    return await this.topicService.getById(id);
  }
}
