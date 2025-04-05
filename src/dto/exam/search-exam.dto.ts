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
  readonly studentId: number;

  @IsSwaggerBoolean({}, false)
  readonly isFinished: boolean;

  @IsSwaggerNumber({}, false)
  readonly examId: number;

  @IsSwaggerNumber({}, false)
  readonly classRoomId: number;
}
