import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/access-token.guard';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { ExamStatisticsService } from './exam-statistics.service';
import {
  ExamStatisticsOverviewQueryDto,
  QuizExamStatisticsQueryDto,
  PracticeExamStatisticsQueryDto,
  MyStatisticsQueryDto,
} from './dto/exam-statistics-filter.dto';
import {
  ExamStatisticsOverviewResponseDto,
  QuizExamStatisticsResponseDto,
  QuizResultDetailResponseDto,
  PracticeExamStatisticsResponseDto,
  PracticeResultDetailResponseDto,
  MyStatisticsResponseDto,
} from './dto/exam-statistics-response.dto';

@ApiTags('exam-statistics')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('exam-statistics')
export class ExamStatisticsController {
  constructor(private readonly examStatisticsService: ExamStatisticsService) {}

  @Get('overview')
  @ApiHandleResponse({
    summary: 'Get exam statistics overview dashboard (Admin/Teacher only)',
    type: ExamStatisticsOverviewResponseDto,
  })
  async getOverview(@Req() req: RequestAuth, @Query() query: ExamStatisticsOverviewQueryDto) {
    return await this.examStatisticsService.getOverview(req.user, query);
  }

  @Get('quiz/:examId')
  @ApiHandleResponse({
    summary: 'Get detailed statistics for a quiz exam (Admin/Teacher only)',
    type: QuizExamStatisticsResponseDto,
  })
  async getQuizExamStatistics(
    @Req() req: RequestAuth,
    @Param('examId', ParseIntPipe) examId: number,
    @Query() query: QuizExamStatisticsQueryDto,
  ) {
    return await this.examStatisticsService.getQuizExamStatistics(req.user, examId, query);
  }

  @Get('quiz/:examId/result/:userId')
  @ApiHandleResponse({
    summary: 'Get detailed quiz result for a specific student (Admin/Teacher/Student own only)',
    type: QuizResultDetailResponseDto,
  })
  async getQuizResultDetail(
    @Req() req: RequestAuth,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.examStatisticsService.getQuizResultDetail(req.user, examId, userId);
  }

  @Get('practice/:examId')
  @ApiHandleResponse({
    summary: 'Get detailed statistics for a practice exam (Admin/Teacher only)',
    type: PracticeExamStatisticsResponseDto,
  })
  async getPracticeExamStatistics(
    @Req() req: RequestAuth,
    @Param('examId', ParseIntPipe) examId: number,
    @Query() query: PracticeExamStatisticsQueryDto,
  ) {
    return await this.examStatisticsService.getPracticeExamStatistics(req.user, examId, query);
  }

  @Get('practice/:examId/result/:userId')
  @ApiHandleResponse({
    summary: 'Get detailed practice result for a specific student (Admin/Teacher/Student own only)',
    type: PracticeResultDetailResponseDto,
  })
  async getPracticeResultDetail(
    @Req() req: RequestAuth,
    @Param('examId', ParseIntPipe) examId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return await this.examStatisticsService.getPracticeResultDetail(req.user, examId, userId);
  }

  @Get('my-statistics')
  @ApiHandleResponse({
    summary: "Get student's own performance across all exams",
    type: MyStatisticsResponseDto,
  })
  async getMyStatistics(@Req() req: RequestAuth, @Query() query: MyStatisticsQueryDto) {
    return await this.examStatisticsService.getMyStatistics(req.user, query);
  }
}
