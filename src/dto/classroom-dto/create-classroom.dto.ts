import { IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { ClassLevel } from 'src/types/classroom';
import { AppStatus } from 'src/types/common';

export class CreateClassroomDto {
  @IsSwaggerString({ default: 'name' })
  readonly name: string;

  @IsSwaggerString({ default: 'description' }, false)
  readonly description: string;

  @IsSwaggerString({ default: 'thumbnail.jpg' }, false)
  readonly thumbnailPath: string;

  @IsSwaggerString({ default: 'A1B2C3' }, false)
  readonly classCode: string;

  @IsSwaggerEnum({ enum: ClassLevel })
  readonly classLevel: ClassLevel;

  @IsSwaggerNumber({})
  readonly teacherId: number;
}

export class UpdateClassroomDto {
  @IsSwaggerString({}, false)
  readonly name: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerString({}, false)
  readonly thumbnailPath: string;

  @IsSwaggerEnum({ enum: AppStatus }, false)
  readonly status: AppStatus;
}
