import { IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { PageOptionsDto } from '../paginate.dto';
import { FileType, QuestionType } from 'src/types/classroom';

export class SearchQuestionDto extends PageOptionsDto {
  @IsSwaggerString({}, false)
  readonly content: string;

  @IsSwaggerNumber({}, false)
  readonly classRoomId: number;

  @IsSwaggerNumber({}, false)
  readonly creatorId: number;

  @IsSwaggerString({}, false)
  readonly classRoomName: string;

  @IsSwaggerEnum({ enum: FileType, default: FileType.EXISTED }, false)
  readonly fileType: FileType;

  @IsSwaggerEnum({ enum: QuestionType, default: QuestionType.ONE_ANSWER }, false)
  readonly questionType: QuestionType;
}
