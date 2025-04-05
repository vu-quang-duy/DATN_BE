import { Request } from 'express';
import { IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';

export interface IRequestResponse<T> {
  status: '1' | '0';
  message: 'OK';
  result: T;
}

export class JWTPayload {
  @IsSwaggerNumber()
  sub: number;

  @IsSwaggerString()
  username: string;
}

export interface CacheUser {
  userId: number;
  username: string;
  // code: number;
  code: string;
  actions: string[];
  isSupperAdmin: boolean;
}
export interface RequestAuth extends Request {
  user: CacheUser;
}
