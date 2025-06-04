import { IsSwaggerArray, IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString, IsSwaggerBoolean } from 'src/decorator/swagger.decorator';
import { Answer } from 'src/entities/question/answer.entity';
import { QuestionType, FileType, QuestionFormat } from 'src/types/classroom';
// export enum QuestionType {
//   ONE_ANSWER = 'ONE_ANSWER',
//   MULTIPLE_ANSWERS = 'MULTIPLE_ANSWERS',
// }

// export enum QuestionFormat {
//   TEXT_QUESTION_TEXT_ANSWERS = 'TEXT_QUESTION_TEXT_ANSWERS',
//   MEDIA_QUESTION_TEXT_ANSWERS = 'MEDIA_QUESTION_TEXT_ANSWERS',
//   TEXT_QUESTION_MEDIA_ANSWERS = 'TEXT_QUESTION_MEDIA_ANSWERS',
//   MEDIA_QUESTION_MEDIA_ANSWERS = 'MEDIA_QUESTION_MEDIA_ANSWERS',
// }

// export enum FileType {
//   TEXT = 'TEXT',
//   NOT_EXISTED = 'NOT_EXISTED',
//   EXISTED = 'EXISTED',
// }

// export class CreateQuestionDto {
//   @IsSwaggerString({ default: 'content' })
//   readonly content: string;

//   @IsSwaggerNumber({})
//   readonly classRoomId: number;

//   @IsSwaggerString({}, false)
//   readonly imageLocation: string;

//   @IsSwaggerString({}, false)
//   readonly videoLocation: string;

//   @IsSwaggerString({}, false)
//   readonly explanation: string;

//   @IsSwaggerString({}, false)
//   readonly description: string;

//   @IsSwaggerNumber({})
//   readonly creatorId: number;

//   @IsSwaggerEnum({ enum: FileType, default: FileType.EXISTED })
//   readonly fileType: FileType;

//   @IsSwaggerEnum({ enum: QuestionType, default: QuestionType.ONE_ANSWER })
//   readonly questionType: QuestionType;

//   @IsSwaggerArray({})
//   readonly answerReqs: Answer[];
// }

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
export class CreateAnswerDto {
  @IsSwaggerString({}, false)
  readonly content?: string;

  @IsSwaggerString({}, false)
  readonly imageLocation?: string;

  @IsSwaggerString({}, false)
  readonly videoLocation?: string;

  @IsSwaggerBoolean({ default: false })
  readonly correct: boolean;

  @IsSwaggerEnum({ enum: FileType, default: FileType.TEXT }, false)
  readonly fileType?: FileType;
}

export class CreateQuestionDto {
  @IsSwaggerString({ default: 'content' })
  readonly content: string;

  @IsSwaggerNumber({})
  readonly classRoomId: number;

  @IsSwaggerString({}, false)
  readonly imageLocation?: string;

  @IsSwaggerString({}, false)
  readonly videoLocation?: string;

  @IsSwaggerString({}, false)
  readonly explanation?: string;

  @IsSwaggerEnum({ enum: FileType, default: FileType.EXISTED }, false)
  readonly fileType?: FileType;

  @IsSwaggerEnum({ enum: QuestionType, default: QuestionType.ONE_ANSWER })
  readonly questionType: QuestionType;

  @IsSwaggerEnum({ enum: QuestionFormat, default: QuestionFormat.TEXT_QUESTION_TEXT_ANSWERS }, false)
  readonly questionFormat?: QuestionFormat;

  @IsSwaggerArray({ type: () => CreateAnswerDto })
  readonly answerReqs: CreateAnswerDto[];
}

export class CreateMultipleQuestionsDto {
  @IsSwaggerArray({ type: () => CreateQuestionDto })
  readonly questions: CreateQuestionDto[];
}

