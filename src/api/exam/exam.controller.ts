import { Get, Param, Query } from '@nestjs/common';
import { EntityNameConst } from 'src/constant/entity-name';
import { ApiHandleResponse } from 'src/decorator/api.decorator';
import { IsAuthController } from 'src/decorator/auth.decorator';
import { SearchExamDto } from 'src/dto/exam/search-exam.dto';
import { EXAM } from 'src/entities/exam/exam.entity';
import { ExamService } from './exam.service';

@IsAuthController(EntityNameConst.EXAM, false)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('/all')
  @ApiHandleResponse({
    summary: 'Get all exams',
    type: EXAM,
  })
  async search(@Query() query: SearchExamDto) {
    return await this.examService.search(query);
  }

  @Get('/:id')
  @ApiHandleResponse({
    summary: 'Get exam info by id',
    type: EXAM,
  })
  async getProfileById(@Param('id') id: number) {
    return await this.examService.getById(id);
  }

  @Get('/exam-saved/:id')
  @ApiHandleResponse({
    summary: 'Get all exams saved by user',
    type: EXAM,
  })
  async getExamsSaved(@Param('id') id: number) {
    return await this.examService.getExamsSaved(id);
  }
}
