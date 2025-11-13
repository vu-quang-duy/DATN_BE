import { Transform } from 'class-transformer';
import { IsSwaggerBoolean, IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { PageOptionsDto } from '../paginate.dto';
import { AppStatus } from 'src/types/common';
import { ClassLevel } from 'src/types/classroom';

export class SearchClassroomDto extends PageOptionsDto {
  @IsSwaggerString({}, false)
  @Transform(({ value }) => value.trim())
  readonly name: string;

  @IsSwaggerEnum({ enum: AppStatus }, false)
  readonly status: AppStatus;

  @IsSwaggerEnum({ enum: ClassLevel }, false)
  readonly classLevel: ClassLevel;

  @IsSwaggerNumber({}, false)
  readonly teacherId: number;

  @IsSwaggerString({}, false)
  @Transform(({ value }) => value.trim())
  readonly classCode: string;

  @IsSwaggerBoolean({}, false)
  readonly isTeacherCreated: boolean;
}

export class JoinClassDto {
  @IsSwaggerString({ default: '202420001' })
  readonly studentCode: string;
}
