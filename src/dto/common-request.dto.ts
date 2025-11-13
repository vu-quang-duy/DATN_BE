/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { IsSwaggerNumber, IsSwaggerString } from 'src/decorator/swagger.decorator';

export interface IRequestResponse<T> {
  status: '1' | '0';
  message: 'OK';
  result: T;
}

export class JWTPayload {
  // @IsSwaggerNumber()
  // sub: number;

  // @IsSwaggerString()
  // username: string;
  @IsSwaggerString()
  sub: string;
  @IsSwaggerNumber()
  iat?: number;
  @IsSwaggerNumber()
  exp?: number;
}

export interface CacheUser {
  userId: number;
  name: string;
  // code: number;
  code: string;
  actions: string[];
}
export interface RequestAuth extends Request {
  user: CacheUser;
}
