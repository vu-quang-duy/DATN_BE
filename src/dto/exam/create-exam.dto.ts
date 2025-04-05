import { IsSwaggerArray, IsSwaggerBoolean, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';

export class CreateExamDto {
  @IsSwaggerString({ default: 'name' })
  readonly name: string;

  @IsSwaggerNumber({})
  readonly classRoomId: number;

  @IsSwaggerNumber({})
  readonly numberOfQuestions: number;

  @IsSwaggerString({}, false)
  readonly thumbnailPath: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerNumber({})
  readonly creatorId: number;

  @IsSwaggerBoolean({}, false)
  readonly private: boolean;

  @IsSwaggerArray({})
  readonly questionIds: number[];
}

export class UpdateExamDto {
  @IsSwaggerString({ default: 'name' }, false)
  readonly name: string;

  @IsSwaggerString({}, false)
  readonly thumbnailPath: string;

  @IsSwaggerNumber({}, false)
  readonly numberOfQuestions: number;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerArray({}, false)
  readonly questionIds: number[];
}
