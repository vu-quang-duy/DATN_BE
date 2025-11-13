import { Transform } from 'class-transformer';
import { IsSwaggerBoolean, IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { AppStatus } from 'src/types/common';
import { VocabularyTypeConst } from 'src/types/vocabulary';
import { PageOptionsDto } from '../paginate.dto';

export class SearchVocabularyDto extends PageOptionsDto {
  @IsSwaggerString({}, false)
  @Transform(({ value }) => value.trim())
  readonly content: string;

  @IsSwaggerEnum({ enum: AppStatus }, false)
  readonly status: AppStatus;

  @IsSwaggerEnum({ enum: VocabularyTypeConst, default: VocabularyTypeConst.WORD }, false)
  readonly vocabularyType: VocabularyTypeConst;

  @IsSwaggerNumber({}, false)
  readonly classroomId: number;

  @IsSwaggerNumber({}, false)
  readonly topicId: number;

  @IsSwaggerNumber({}, false)
  readonly creatorId: number;

  @IsSwaggerBoolean({}, false)
  readonly isPrivate: boolean;
}
