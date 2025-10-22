import { RoleCode } from 'src/constant/role-code';
import { IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';

export class RegisterDto {
  // @IsSwaggerString({ default: 'username' }, false)
  // readonly username: string;

  @IsSwaggerString({ default: 'thanhtung38', maxLength: 50 }, false)
  readonly name: string;

  @IsSwaggerString({ default: '123456' })
  readonly password: string;

  @IsSwaggerString({})
  readonly email: string;

  @IsSwaggerString({}, false)
  readonly phoneNumber: string;

  @IsSwaggerEnum({ enum: RoleCode }, false)
  readonly role: typeof RoleCode;
}

export class VerifyEmailDto {
  @IsSwaggerNumber({ default: 123456 })
  readonly otpNum: number;

  @IsSwaggerString({})
  readonly email: string;
}
