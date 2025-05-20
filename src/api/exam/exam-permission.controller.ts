/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { CreateExamDto, UpdateExamDto, CreatePracticeExamDto } from 'src/dto/exam/create-exam.dto';
import { EXAM } from 'src/entities/exam/exam.entity';
import { ExamService } from './exam.service';
import { ExamAttempt } from 'src/entities/exam/exam-attempt.entity';
import { SearchExamAttemptDto } from 'src/dto/exam/search-exam.dto';
import { SaveExamDto } from 'src/dto/exam/save-exam.dto';
import { ExamScoringDto, ResetExamDto } from 'src/dto/exam/exam-score.dto';
import { ExamB } from 'src/entitiesB/exam.entity';
import { ExamVocabulary } from 'src/entities/exam/exam-vocabulary.entity';

@IsAuthController(EntityNameConst.EXAM, false)
export class ExamPermissionController {
  constructor(private readonly examService: ExamService) {}

  @Get('/all-exams')
  @ApiHandleResponse({
    type: ExamAttempt,
    summary: 'Get list exam for user'
  })
  async getListExam(@Query() query: SearchExamAttemptDto) {
    const res = await this.examService.getListExam(query);
    return res;
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


  @Post('/exam-scoring')
  @ApiHandleResponse({
    type: ExamAttempt,
    summary: 'Scoring exam',
  })
  async examScoring(@Body() body: ExamScoringDto) {
    return await this.examService.examScoring(body);
  }

  @Post('/reset/:examId')
  @ApiHandleResponse({
    type: ExamAttempt,
    summary: 'Reset exam for redo',
  })
  async resetExam(
    @Param('examId') examId: number,
    @Body() body: ResetExamDto
  ) {
    return await this.examService.resetExam(
      examId,
      body
    );
  }

  @Get('/practice-exams/:examId')
  @ApiHandleResponse({
    type: ExamVocabulary,
    summary: 'Get detail practice exam',
  })
  async getDetailPracticeExam(
    @Param('examId') examId: number,
  ) {
    return await this.examService.getDetailPracticeExam(examId);
  }

  @Post('/practice-exams')
    @ApiHandleResponse({
    type: ExamB,
    summary: 'Create practice exam ',
  })
  async addPracticeExam(
    @Body() body: CreatePracticeExamDto
  ) {
    return await this.examService.addPracticeExam(body);
  }
}

