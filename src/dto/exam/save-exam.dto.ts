import { IsSwaggerArray, IsSwaggerNumber } from 'src/decorator/swagger.decorator';

export class SaveExamDto {
  @IsSwaggerNumber({})
  readonly questionId: number;

  @IsSwaggerNumber({})
  readonly examId: number;

  @IsSwaggerArray({})
  readonly selectedAnswers: number[];
}
