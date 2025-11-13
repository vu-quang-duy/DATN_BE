import { IsSwaggerString } from 'src/decorator/swagger.decorator';

export class LoginDto {
  @IsSwaggerString({ default: 'dev_admin@gmail.com' })
  readonly email: string;

  @IsSwaggerString({ default: '123456' })
  readonly password: string;
}
