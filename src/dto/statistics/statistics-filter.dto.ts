import { Transform } from 'class-transformer';
import {
  IsOptional,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { PageOptionsDto, Sort } from '../paginate.dto';

export class StatisticsStudentFilterDto extends PageOptionsDto {
  @IsSwaggerString({ description: 'Search by name, email or student code' }, false)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly keyword?: string;

  @IsSwaggerNumber({ description: 'Filter by school id' }, false)
  readonly schoolId?: number;

  @IsSwaggerNumber({ description: 'Filter by classroom id' }, false)
  readonly classroomId?: number;

  @IsSwaggerEnum({ enum: Sort, default: Sort.DESC }, false)
  readonly sortBy: Sort = Sort.DESC;
}

export enum StatisticsCompletionStatus {
  ALL = 'all',
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
}

// ✅ THÊM: Custom validator cho date range
@ValidatorConstraint({ name: 'IsValidDateRange', async: false })
export class IsValidDateRangeConstraint implements ValidatorConstraintInterface {
  validate(toDate: string, args: ValidationArguments) {
    const object = args.object as any;
    const fromDate = object.fromDate;

    if (!fromDate || !toDate) {
      return true; // Cho phép nếu một trong hai không có
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return false; // Invalid date format
    }

    return from <= to; // fromDate phải <= toDate
  }

  defaultMessage() {
    return 'toDate must be greater than or equal to fromDate';
  }
}

export class StudentStatisticsQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'fromDate must be a valid ISO 8601 date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  @IsSwaggerString({ description: 'ISO 8601 start date (inclusive)' }, false)
  readonly fromDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/, {
    message: 'toDate must be a valid ISO 8601 date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
  })
  @Validate(IsValidDateRangeConstraint)
  @IsSwaggerString({ description: 'ISO 8601 end date (inclusive)' }, false)
  readonly toDate?: string;

  @IsSwaggerNumber({ description: 'Filter by classroom id' }, false)
  readonly classroomId?: number;

  @IsSwaggerNumber({ description: 'Filter by topic id' }, false)
  readonly topicId?: number;

  @IsSwaggerEnum({ enum: StatisticsCompletionStatus, default: StatisticsCompletionStatus.ALL }, false)
  readonly status?: StatisticsCompletionStatus;

  @IsSwaggerString({ description: 'Search keyword for exam or topic name' }, false)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly search?: string;
}
