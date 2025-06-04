/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Delete, Get, Param, Post, Put, Query, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
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
import { ExamScoringDto, PracticeExamScoringDto, ResetExamDto } from 'src/dto/exam/exam-score.dto';
import { ExamB } from 'src/entitiesB/exam.entity';
import { ExamVocabulary } from 'src/entities/exam/exam-vocabulary.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ExamVideo } from 'src/entities/exam/exam-video.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PracticeExamAttempt } from 'src/entities/exam/practice-attempt.entity';
import { ExamQuestion } from 'src/entities/exam/exam-question.entity';
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
  @Get('/all-practice-exams')
  @ApiHandleResponse({
    type: ExamAttempt,
    summary: 'Get list practice exam for teacher to score'
  })
  async getListPracticeExam(@Query() query: SearchExamAttemptDto) {
    const res = await this.examService.getListPracticeExam(query);
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

@Post('/submit-practice')
@UseInterceptors(FilesInterceptor('videos', 10, {
  storage: diskStorage({
    destination: '/home/tuyentrinh/Desktop/sign_school/uploads/videos',  // Đường dẫn đầy đủ trên server
    filename: (req, file, callback) => {
      callback(null, file.originalname); // Đặt tên tránh trùng
    },
  }),
}))
async submitPracticeTest(
  @UploadedFiles() files: Express.Multer.File[],
  @Body() body: PracticeExamScoringDto
) {
  return await this.examService.submitPracticeTest(files, body);
}


  @Post('/exam-scoring')
  @ApiHandleResponse({
    type: ExamAttempt,
    summary: 'Scoring exam',
  })
  async examScoring(@Body() body: ExamScoringDto) {
    return await this.examService.examScoring(body);
  }

    @Post('/practice-exam-scoring')
  @ApiHandleResponse({
    type: PracticeExamAttempt,
    summary: 'Scoring practice exam',
  })
  async practiceExamScoring(@Body() body: PracticeExamScoringDto) {
    return await this.examService.practiceExamScoring(body);
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

    @Post('/practice-exam/reset/:examId')
  @ApiHandleResponse({
    type: PracticeExamAttempt,
    summary: 'Reset practice exam for redo',
  })
  async resetPracticeExam(
    @Param('examId') examId: number,
    @Body() body: ResetExamDto
  ) {
    return await this.examService.resetPracticeExam(
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

    @Get('/detail-exam/:id')
  @ApiHandleResponse({
    type: ExamQuestion,
    summary: 'Get detail exam',
  })
  async getDetailExam(
    @Param('id') examId: number,
  ) {
    return await this.examService.getDetailExam(examId);
  }

    @Get('/practice-exams-to-score/:examId/:userId')
  @ApiHandleResponse({
    type: ExamVideo,
    summary: 'Get detail practice exam to score',
  })
  async getDetailPracticeExamToScore(
    @Param('examId') examId: number,
    @Param('userId') userId: number,
  ) {
    return await this.examService.getDetailPracticeExamToScore(examId, userId);
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

    @Post('/add-exam')
    @ApiHandleResponse({
    type: ExamB,
    summary: 'Create exam ',
  })
  async addExam(
    @Body() body: CreateExamDto
  ) {
    return await this.examService.addExam(body);
  }
}

