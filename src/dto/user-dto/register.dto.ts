import { RoleCode } from 'src/constant/role-code';
import { IsSwaggerEnum, IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';

export class RegisterDto {
  // @IsSwaggerString({ default: 'username' }, false)
  // readonly username: string;

  @IsSwaggerString({ default: 'thanhtung', maxLength: 50 }, false)
  readonly name: string;

  @IsSwaggerString({ default: 'Tuandat0802@' })
  readonly password: string;

  @IsSwaggerString({ default: 'nguyendat0802@gmail.com' })
  readonly email: string;

  @IsSwaggerString({ default: 'Tuandat0802@' })
  readonly confirm: string;

  @IsSwaggerEnum({ enum: RoleCode }, false)
  readonly role: typeof RoleCode;
}

export class VerifyEmailDto {
  @IsSwaggerNumber({ default: 123456 })
  readonly otpNum: number;

  @IsSwaggerString({})
  readonly email: string;
}
