import { IsSwaggerBoolean, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';

export class CreateTopicDto {
  @IsSwaggerString({ default: 'name' })
  readonly name: string;

  @IsSwaggerNumber({})
  readonly classroomId: number;

  @IsSwaggerString({}, false)
  readonly imageLocation: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerNumber({})
  readonly creatorId: number;

  @IsSwaggerBoolean({}, false)
  readonly isCommon: boolean;
}

export class UpdateTopicDto {
  @IsSwaggerString({ default: 'name' }, false)
  readonly name: string;

  @IsSwaggerNumber({}, false)
  readonly classroomId: number;

  @IsSwaggerString({}, false)
  readonly imageLocation: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerBoolean({}, false)
  readonly isCommon: boolean;
}
