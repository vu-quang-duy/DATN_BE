/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Delete, Param, Get ,Post, Put, Req, ParseIntPipe } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { CreateQuestionDto, CreateMultipleQuestionsDto, UpdateQuestionDto } from 'src/dto/question/create-question.dto';
import { Question } from 'src/entities/question/question.entity';
import { QuestionAction, QuestionSummary } from './question-permission.interface';
import { QuestionService } from './question.service';

@IsAuthController(EntityNameConst.QUESTION, false)
export class QuestionPermissionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('/class/:id')
  @ApiHandleResponse({
    type: Question,
    summary: "Get list question of class",
  })
  async getListQuestionClass(@Param('id') classRoomId?: any) {
    return this.questionService.getListQuestionClass(classRoomId)
  }

  @Post('/add-list')
  @ApiHandleResponse({
    type: Question,
    summary: QuestionSummary.ADD_LIST_QUESTION,
  })
  async [QuestionAction.ADD_LIST_QUESTION](@Body() body: CreateQuestionDto[]) {
    return await this.questionService.createListQuestion( body);
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
    summary: "Delete question",
    type: Question,
  })
  async deleteList(@Body() body) {
    if (!body.questionIds || body.questionIds.length === 0) {
      throw new Error('❌ No question IDs provided');
    }
    
    return await this.questionService.deleteList(body);
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
