import { IsSwaggerString} from 'src/decorator/swagger.decorator';

export class UpdateUserDto {
  @IsSwaggerString({ default: 'John Doe', maxLength: 50 }, true) // name có thể không có
  readonly name: string;

  @IsSwaggerString({ maxLength: 255 }, false) // address có thể không có
  readonly address: string;

  @IsSwaggerString({ maxLength: 50 })
  readonly classRoomName?: string;

  @IsSwaggerString({ maxLength: 50 })
  readonly schoolName?: string;

  @IsSwaggerString({}, false)
  readonly birthDay: string;
}
