import { IsSwaggerArray, IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { Answer } from 'src/entities/question/answer.entity';
import { FileType, QuestionType } from 'src/types/classroom';

export class CreateQuestionDto {
  @IsSwaggerString({ default: 'content' })
  readonly content: string;

  @IsSwaggerNumber({})
  readonly classRoomId: number;

  @IsSwaggerString({}, false)
  readonly imageLocation: string;

  @IsSwaggerString({}, false)
  readonly videoLocation: string;

  @IsSwaggerString({}, false)
  readonly explanation: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerNumber({})
  readonly creatorId: number;

  @IsSwaggerEnum({ enum: FileType, default: FileType.EXISTED })
  readonly fileType: FileType;

  @IsSwaggerEnum({ enum: QuestionType, default: QuestionType.ONE_ANSWER })
  readonly questionType: QuestionType;

  @IsSwaggerArray({})
  readonly answerReqs: Answer[];
}

export class UpdateQuestionDto {
  @IsSwaggerString({ default: 'content' }, false)
  readonly content: string;

  @IsSwaggerNumber({}, false)
  readonly classRoomId: number;

  @IsSwaggerString({}, false)
  readonly imageLocation: string;

  @IsSwaggerString({}, false)
  readonly videoLocation: string;

  @IsSwaggerString({}, false)
  readonly explanation: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerEnum({ enum: FileType, default: FileType.EXISTED }, false)
  readonly fileType: FileType;

  @IsSwaggerEnum({ enum: QuestionType, default: QuestionType.ONE_ANSWER }, false)
  readonly questionType: QuestionType;

  @IsSwaggerArray({}, false)
  readonly answerReqs: Answer[];

  @IsSwaggerArray({}, false)
  readonly updateAnswerReqs: Answer[];
}
