import { Body, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { CreateExamDto, UpdateExamDto } from 'src/dto/exam/create-exam.dto';
import { EXAM } from 'src/entities/exam/exam.entity';
import { ExamAction, ExamSummary } from './exam-permission.interface';
import { ExamService } from './exam.service';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { SearchExamAttemptDto } from 'src/dto/exam/search-exam.dto';
import { SaveExamDto } from 'src/dto/exam/save-exam.dto';

@IsAuthController(EntityNameConst.EXAM, true)
export class ExamPermissionController implements Record<ExamAction, any> {
  constructor(private readonly examService: ExamService) {}

  @Get('/all-exams-of-user')
  @ApiHandleResponse({
    type: ExamAttempt,
    summary: ExamSummary.SEARCH_ALL_EXAMS_FOR_USER,
  })
  async [ExamAction.SEARCH_ALL_EXAMS_FOR_USER](@Req() req: RequestAuth, @Query() query: SearchExamAttemptDto) {
    return await this.examService.searchAllExamAttemptForUser(
      req.user.userId,
      query,
      ExamAction.SEARCH_ALL_EXAMS_FOR_USER,
    );
  }

  @Post('/')
  @ApiHandleResponse({
    type: EXAM,
    summary: ExamSummary.CREATE_EXAM,
  })
  async [ExamAction.CREATE_EXAM](@Req() req: RequestAuth, @Body() body: CreateExamDto) {
    return await this.examService.create(req.user.userId, body, ExamAction.CREATE_EXAM);
  }

  @Post('/add-exams-for-user')
  @ApiHandleResponse({
    summary: ExamSummary.ADD_EXAMS_FOR_USER,
    type: Boolean,
  })
  async [ExamAction.ADD_EXAMS_FOR_USER](@Req() req: RequestAuth, @Body() body: { ids: number[] }) {
    return await this.examService.addExamsForUser(req.user.userId, body.ids, ExamAction.ADD_EXAMS_FOR_USER);
  }

  @Post('/exam-saved')
  @ApiHandleResponse({
    type: EXAM,
    summary: 'Save exam answer for user',
  })
  async saveExamsSaved(
    @Req() req: RequestAuth,
    @Body()
    body: {
      saveExams: SaveExamDto[];
      score: number;
    },
  ) {
    return await this.examService.saveExamsSaved(req.user.userId, body.saveExams, body.score);
  }

  @Put('/:id')
  @ApiHandleResponse({
    summary: ExamSummary.UPDATE_EXAM,
    type: Boolean,
  })
  async [ExamAction.UPDATE_EXAM](@Req() req: RequestAuth, @Param('id') id: number, @Body() body: UpdateExamDto) {
    return await this.examService.updateById(id, req.user, body, ExamAction.UPDATE_EXAM);
  }

  @Delete('/delete-exam-attempt/:id')
  @ApiHandleResponse({
    summary: ExamSummary.DELETE_EXAM_ATTEMPT,
    type: Boolean,
  })
  async [ExamAction.DELETE_EXAM_ATTEMPT](@Req() req: RequestAuth, @Param('id') id: number) {
    return await this.examService.deleteExamAttempt(req.user, id, ExamAction.DELETE_EXAM_ATTEMPT);
  }

  @Delete('/:id')
  @ApiHandleResponse({
    summary: ExamSummary.DELETE_EXAM,
    type: Boolean,
  })
  async [ExamAction.DELETE_EXAM](@Req() req: RequestAuth, @Param('id') id: number) {
    return await this.examService.deleteById(id, req.user, ExamAction.DELETE_EXAM);
  }
}
