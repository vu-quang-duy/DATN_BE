import { Get, Param, Query } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { SearchQuestionDto } from 'src/dto/question/search-question.dto';
import { Question } from './../../entities/question/question.entity';
import { QuestionService } from './question.service';

@IsAuthController(EntityNameConst.QUESTION, false)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('/all')
  @ApiHandleResponse({
    summary: 'Get question list',
    type: Question,
  })
  async search(@Query() query: SearchQuestionDto) {
    return await this.questionService.search(query);
  }

  @Get('/:id')
  @ApiHandleResponse({
    summary: 'Get question info by id',
    type: Question,
  })
  async getProfileById(@Param('id') id: number) {
    return await this.questionService.getById(id);
  }

  @Get('/question-of-exam/:id')
  @ApiHandleResponse({
    summary: 'Get question list of exam',
    type: Question,
  })
  async getQuestionOfExam(@Param('id') id: number) {
    return await this.questionService.getQuestionOfExam(id);
  }
}
