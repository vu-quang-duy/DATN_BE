import { Gender } from 'src/constant/enum-common';
import { IsSwaggerEnum, IsSwaggerString } from 'src/decorator/swagger.decorator';

export class UpdateUserProfileDto {
  @IsSwaggerString({ default: 'thanhtung38', maxLength: 50 }, false)
  readonly name: string;

  @IsSwaggerString({}, false)
  readonly avatarLocation: string;

  @IsSwaggerString({}, false)
  readonly phoneNumber: string;

  @IsSwaggerString({}, false)
  readonly birthDay: string;

  @IsSwaggerString({}, false)
  readonly address: string;

  @IsSwaggerEnum({ enum: Gender }, false)
  readonly gender: Gender;

  @IsSwaggerString({}, false)
  readonly schoolId: string;

  @IsSwaggerString({}, false)
  readonly houseStreet: string;

  @IsSwaggerString({}, false)
  readonly ward: string;

  @IsSwaggerString({}, false)
  readonly district: string;

  @IsSwaggerString({}, false)
  readonly city: string;
}

export class ChangeUserPasswordDto {
  @IsSwaggerString({ default: '123456' }, false)
  readonly oldPassword: string;

  @IsSwaggerString({ default: '666666' }, false)
  readonly newPassword: string;

  @IsSwaggerString({ default: '888888' }, false)
  readonly confirmPassword: string;
}
