import { IsSwaggerBoolean, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { PageOptionsDto } from '../paginate.dto';

export class SearchExamDto extends PageOptionsDto {
  @IsSwaggerString({}, false)
  readonly name: string;

  @IsSwaggerNumber({}, false)
  readonly classRoomId: number;

  @IsSwaggerNumber({}, false)
  readonly creatorId: number;

  @IsSwaggerBoolean({}, false)
  readonly isPrivate: boolean;
}

export class SearchExamAttemptDto extends PageOptionsDto {
  @IsSwaggerNumber({}, false)
  readonly userId: number;

  @IsSwaggerString({}, false)
  readonly isFinished: string;

  @IsSwaggerNumber({}, false)
  readonly examId: number;

  @IsSwaggerNumber({}, false)
  readonly score: number;

  @IsSwaggerString({}, false)
  readonly examType: string;

  @IsSwaggerString({}, false)
  readonly name?: string;

  @IsSwaggerString({}, false)
  readonly classRoomName?: string;
}
