import { Body, Delete, Param, Post, Put, Req } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { CreateQuestionDto, UpdateQuestionDto } from 'src/dto/question/create-question.dto';
import { Question } from 'src/entities/question/question.entity';
import { QuestionAction, QuestionSummary } from './question-permission.interface';
import { QuestionService } from './question.service';

@IsAuthController(EntityNameConst.QUESTION, true)
export class QuestionPermissionController implements Record<QuestionAction, any> {
  constructor(private readonly questionService: QuestionService) {}

  @Post('/')
  @ApiHandleResponse({
    type: Question,
    summary: QuestionSummary.CREATE_QUESTION,
  })
  async [QuestionAction.CREATE_QUESTION](@Req() req: RequestAuth, @Body() body: CreateQuestionDto) {
    return await this.questionService.createQuestion(req.user.userId, body, QuestionAction.CREATE_QUESTION);
  }

  @Post('/add-list')
  @ApiHandleResponse({
    type: Question,
    summary: QuestionSummary.ADD_LIST_QUESTION,
  })
  async [QuestionAction.ADD_LIST_QUESTION](@Req() req: RequestAuth, @Body() body: CreateQuestionDto[]) {
    return await this.questionService.createListQuestion(req.user.userId, body, QuestionAction.ADD_LIST_QUESTION);
  }

  @Put('/:id')
  @ApiHandleResponse({
    summary: QuestionSummary.UPDATE_QUESTION,
    type: Boolean,
  })
  async [QuestionAction.UPDATE_QUESTION](
    @Req() req: RequestAuth,
    @Param('id') id: number,
    @Body() body: UpdateQuestionDto,
  ) {
    return await this.questionService.updateById(id, req.user, body, QuestionAction.UPDATE_QUESTION);
  }

  @Delete('/delete-list')
  @ApiHandleResponse({
    summary: QuestionSummary.DELETE_LIST_QUESTION,
    type: Boolean,
  })
  async [QuestionAction.DELETE_LIST_QUESTION](@Req() req: RequestAuth, @Body() body: { questionIds: number[] }) {
    return await this.questionService.deleteList(body.questionIds, req.user, QuestionAction.DELETE_LIST_QUESTION);
  }

  @Delete('/answers/:id')
  @ApiHandleResponse({
    summary: 'Delete answers of question',
    type: Boolean,
  })
  async deleteAnswers(@Req() req: RequestAuth, @Param('id') id: number) {
    return await this.questionService.deleteAnswers(id, req.user, QuestionAction.UPDATE_QUESTION);
  }

  @Delete('/:id')
  @ApiHandleResponse({
    summary: QuestionSummary.DELETE_QUESTION,
    type: Boolean,
  })
  async [QuestionAction.DELETE_QUESTION](@Req() req: RequestAuth, @Param('id') id: number) {
    return await this.questionService.deleteById(id, req.user, QuestionAction.DELETE_QUESTION);
  }
}
