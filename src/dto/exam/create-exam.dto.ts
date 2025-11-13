import { IsSwaggerArray, IsSwaggerBoolean, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
export class CreateExamDto {
  @IsSwaggerString({ default: 'name' })
  readonly name: string;

  @IsSwaggerNumber({})
  readonly classRoomId: number;

  @IsSwaggerNumber({})
  readonly numberOfQuestions: number;

  @IsSwaggerBoolean({}, false)
  readonly isPrivate: boolean;

  @IsSwaggerArray({})
  readonly questionIds: number[];
}

class PracticeWordDto {
  @IsSwaggerNumber({})
  readonly vocabularyId: number;

  @IsSwaggerString({ example: 'Em hãy biểu diễn - bực mình' })
  readonly content: string;

  @IsSwaggerNumber({})
  readonly topicId: number;
}
export class UpdateExamDto {
  @IsSwaggerString({ default: 'name' }, false)
  readonly name: string;

  @IsSwaggerString({}, false)
  readonly examType: string;

  @IsSwaggerNumber({})
  readonly examId: number;

  @IsSwaggerNumber({})
  readonly classRoomId: number;

  @IsSwaggerNumber({}, false)
  readonly numberOfQuestions: number;

  @IsSwaggerBoolean({}, false)
  readonly isPrivate: boolean;

  @IsSwaggerArray({}, false)
  readonly questionIds: number[];

  @IsSwaggerArray({ type: PracticeWordDto }, false)
  @ValidateNested({ each: true })
  @Type(() => PracticeWordDto)
  readonly practiceWords: PracticeWordDto[];
}

export class CreatePracticeExamDto {
  @IsSwaggerString({ default: 'name' })
  readonly name: string;

  @IsSwaggerNumber({})
  readonly classRoomId: number;

  @IsSwaggerBoolean({}, false)
  readonly isPrivate: boolean;

  @IsSwaggerArray({ type: PracticeWordDto })
  @ValidateNested({ each: true })
  @Type(() => PracticeWordDto)
  readonly practiceWords: PracticeWordDto[];
}
