import { Body, Delete, Param, Post, Put, Req } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { Topic } from './../../entities/vocabulary/topic.entity';
import { TopicAction, TopicSummary } from './topic-permission.interface';
import { TopicService } from './topic.service';
import { CreateTopicDto, UpdateTopicDto } from 'src/dto/topic/create-topic.dto';

@IsAuthController(EntityNameConst.TOPIC, true)
export class TopicPermissionController implements Record<TopicAction, any> {
  constructor(private readonly topicService: TopicService) {}

  @Post('/')
  @ApiHandleResponse({
    type: Topic,
    summary: TopicSummary.CREATE_TOPIC,
  })
  async [TopicAction.CREATE_TOPIC](@Req() req: RequestAuth, @Body() body: CreateTopicDto) {
    return await this.topicService.createTopic(req.user.userId, body, TopicAction.CREATE_TOPIC);
  }

  @Put('/:id')
  @ApiHandleResponse({
    summary: TopicSummary.UPDATE_TOPIC,
    type: Boolean,
  })
  async [TopicAction.UPDATE_TOPIC](@Req() req: RequestAuth, @Param('id') id: number, @Body() body: UpdateTopicDto) {
    return await this.topicService.updateById(id, req.user, body, TopicAction.UPDATE_TOPIC);
  }

  @Delete('/:id')
  @ApiHandleResponse({
    summary: TopicSummary.DELETE_TOPIC,
    type: Boolean,
  })
  async [TopicAction.DELETE_TOPIC](@Req() req: RequestAuth, @Param('id') id: number) {
    return await this.topicService.deleteById(id, req.user, TopicAction.DELETE_TOPIC);
  }
}
