import { IsSwaggerBoolean, IsSwaggerNumber, IsSwaggerString} from 'src/decorator/swagger.decorator';

export class ExamScoringDto {
  @IsSwaggerNumber({}, false)
  readonly userId: number;

  @IsSwaggerNumber({}, false)
  readonly examId: number;

  @IsSwaggerNumber({}, false)
  readonly score: number;

  @IsSwaggerBoolean({}, false)
  readonly isFinished: boolean;

  @IsSwaggerNumber({}, false)
  attemptCount?: number;

  @IsSwaggerString({}, false)
  type?: string;
}

export class ResetExamDto {
  @IsSwaggerNumber({}, false)
  readonly examId: number;

  @IsSwaggerNumber({}, false)
  readonly userId: number;
}

export class PracticeExamScoringDto {
  @IsSwaggerNumber({}, false)
  readonly userId: number;

  @IsSwaggerNumber({}, false)
  readonly examId: number;

  @IsSwaggerNumber({}, false)
  readonly score: number;

  @IsSwaggerBoolean({}, false)
  readonly isFinished: boolean;

  @IsSwaggerNumber({}, false)
  attemptCount?: number;

}
