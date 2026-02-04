import { Transform } from 'class-transformer';
import { IsOptional, Matches, Validate } from 'class-validator';
import { IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { PageOptionsDto, Sort } from 'src/dto/paginate.dto';
import { IsValidDateRangeConstraint } from 'src/dto/statistics/statistics-filter.dto';

export enum ExamType {
  ALL = 'all',
  QUIZ = 'quiz',
  PRACTICE = 'practice',
}

export enum GradingStatus {
  ALL = 'all',
  GRADED = 'graded',
  PENDING = 'pending',
}

export enum OrderByField {
  SCORE = 'score',
  NAME = 'name',
  SUBMITTED_AT = 'submittedAt',
}

// DTO for overview endpoint
export class ExamStatisticsOverviewQueryDto extends PageOptionsDto {
  @IsSwaggerEnum({ enum: ExamType, default: ExamType.ALL }, false)
  readonly examType?: ExamType;

  @IsSwaggerNumber({ description: 'Filter by classroom id' }, false)
  readonly classroomId?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'fromDate must be a valid ISO 8601 date format',
  })
  @IsSwaggerString({ description: 'ISO 8601 start date (inclusive)' }, false)
  readonly fromDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'toDate must be a valid ISO 8601 date format',
  })
  @Validate(IsValidDateRangeConstraint)
  @IsSwaggerString({ description: 'ISO 8601 end date (inclusive)' }, false)
  readonly toDate?: string;
}

// DTO for quiz exam statistics
export class QuizExamStatisticsQueryDto extends PageOptionsDto {
  @IsSwaggerNumber({ description: 'Filter by classroom id' }, false)
  readonly classroomId?: number;

  @IsSwaggerEnum({ enum: OrderByField, default: OrderByField.SCORE }, false)
  readonly orderBy?: OrderByField;
}

// DTO for practice exam statistics
export class PracticeExamStatisticsQueryDto extends PageOptionsDto {
  @IsSwaggerNumber({ description: 'Filter by classroom id' }, false)
  readonly classroomId?: number;

  @IsSwaggerEnum({ enum: OrderByField, default: OrderByField.SCORE }, false)
  readonly orderBy?: OrderByField;

  @IsSwaggerEnum({ enum: GradingStatus, default: GradingStatus.ALL }, false)
  readonly gradingStatus?: GradingStatus;
}

// DTO for my statistics endpoint
export class MyStatisticsQueryDto {
  @IsSwaggerEnum({ enum: ExamType, default: ExamType.ALL }, false)
  readonly examType?: ExamType;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'fromDate must be a valid ISO 8601 date format',
  })
  @IsSwaggerString({ description: 'ISO 8601 start date (inclusive)' }, false)
  readonly fromDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'toDate must be a valid ISO 8601 date format',
  })
  @Validate(IsValidDateRangeConstraint)
  @IsSwaggerString({ description: 'ISO 8601 end date (inclusive)' }, false)
  readonly toDate?: string;
}
