import { Transform } from 'class-transformer';
import { IsSwaggerBoolean, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';
import { PageOptionsDto } from '../paginate.dto';

export class SearchTopicDto extends PageOptionsDto {
  @IsSwaggerString({}, false)
  @Transform(({ value }) => value.trim())
  readonly name: string;

  @IsSwaggerNumber({}, false)
  readonly classroomId: number;

  @IsSwaggerNumber({}, false)
  readonly creatorId: number;

  @IsSwaggerBoolean({}, false)
  readonly isCommon: boolean;
}
