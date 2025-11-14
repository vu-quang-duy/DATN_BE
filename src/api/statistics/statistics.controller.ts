import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/access-token.guard';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse, ApiPaginatedResponse } from 'src/decorator/api.decorator';
import { RequestAuth } from 'src/dto/common-request.dto';
import { StatisticsStudentFilterDto, StudentStatisticsQueryDto } from 'src/dto/statistics/statistics-filter.dto';
import { StatisticStudentInfoDto, StudentStatisticsResponseDto } from 'src/dto/statistics/statistics-response.dto';
import { StatisticsService } from './statistics.service';

@ApiTags(EntityNameConst.STATISTICS)
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller(EntityNameConst.STATISTICS)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('students')
  @ApiPaginatedResponse(StatisticStudentInfoDto, 'Search students for statistics')
  async getStudentList(@Req() req: RequestAuth, @Query() query: StatisticsStudentFilterDto) {
    return await this.statisticsService.searchStudents(req.user, query);
  }

  @Get('students/:studentId')
  @ApiHandleResponse({ summary: 'Get detailed learning statistics by student', type: StudentStatisticsResponseDto })
  async getStudentStatistics(
    @Req() req: RequestAuth,
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query() query: StudentStatisticsQueryDto,
  ) {
    return await this.statisticsService.getStudentStatistics(req.user, studentId, query);
  }

  @Get('my-statistics')
  @ApiHandleResponse({ summary: 'Get my own learning statistics', type: StudentStatisticsResponseDto })
  async getMyStatistics(@Req() req: RequestAuth, @Query() query: StudentStatisticsQueryDto) {
    return await this.statisticsService.getMyStatistics(req.user, query);
  }
}
