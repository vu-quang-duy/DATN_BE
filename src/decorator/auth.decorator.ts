import { Controller, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/access-token.guard';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

export function IsAuthController(name: string, isRequire = true) {
  return applyDecorators(
    Controller(`${name}${isRequire ? '-auth' : ''}`),
    ApiTags(name),
    ...(isRequire ? [ApiBearerAuth(), UseGuards(AccessTokenGuard)] : []),
  );
}

export function IsApiKeyController(name: string, isRequire = true) {
  return applyDecorators(
    Controller(`${name}${isRequire ? '-auth' : ''}`),
    ApiTags(name),
    ApiSecurity('api-key'),
    ...(isRequire ? [ApiBearerAuth(), UseGuards(AccessTokenGuard)] : []),
    UseGuards(ApiKeyGuard),
  );
}
