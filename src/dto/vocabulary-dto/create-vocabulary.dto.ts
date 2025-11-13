import {
  IsSwaggerArray,
  IsSwaggerBoolean,
  IsSwaggerEnum,
  IsSwaggerNumber,
  IsSwaggerString,
} from 'src/decorator/swagger.decorator';
import { AppStatus } from 'src/types/common';
import { VocabularyTypeConst } from 'src/types/vocabulary';

export class CreateVocabularyDto {
  @IsSwaggerString({ default: 'content' })
  readonly content: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerNumber({})
  readonly topicId: number;

  @IsSwaggerNumber({}, false)
  readonly classroomId: number;

  @IsSwaggerNumber({})
  readonly creatorId: string;

  @IsSwaggerEnum({ enum: VocabularyTypeConst, default: VocabularyTypeConst.WORD })
  readonly vocabularyType: VocabularyTypeConst;

  @IsSwaggerEnum({ enum: AppStatus, default: AppStatus.PENDING })
  readonly status: AppStatus;

  @IsSwaggerArray({}, false)
  readonly imagesPath: string[];

  @IsSwaggerArray({}, false)
  readonly videosPath: string[];

  @IsSwaggerBoolean({})
  readonly isPrivate: boolean;
}

export class UpdateVocabularyDto {
  @IsSwaggerString({}, false)
  readonly content: string;

  @IsSwaggerString({}, false)
  readonly description: string;

  @IsSwaggerString({ isArray: true }, false)
  readonly imagesPath: string;

  @IsSwaggerString({ isArray: true }, false)
  readonly videosPath: string;

  @IsSwaggerEnum({ enum: AppStatus }, false)
  readonly status: AppStatus;

  @IsSwaggerNumber({}, false)
  readonly classroomId: number;

  @IsSwaggerBoolean({}, false)
  readonly isPrivate: boolean;

  @IsSwaggerEnum({ enum: VocabularyTypeConst, default: VocabularyTypeConst.WORD }, false)
  readonly vocabularyType: VocabularyTypeConst;
}
