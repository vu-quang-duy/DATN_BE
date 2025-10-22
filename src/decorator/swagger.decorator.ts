import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsDate,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinDate,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Column, ColumnOptions, ColumnType } from 'typeorm';

const ApiPropType = (type, isRequire, options: ApiPropertyOptions) =>
  applyDecorators(
    ApiProperty({
      type,
      required: isRequire,
      description: isRequire ? 'required' : 'not required',
      ...options,
    }),
    isRequire ? IsDefined() : IsOptional(),
  );

export function IsSwaggerString(options: ApiPropertyOptions = {}, isRequire = true) {
  return applyDecorators(
    ApiPropType('string', isRequire, options),
    IsString(),
    ...(isRequire ? [IsNotEmpty()] : []),
    MaxLength(options?.maxLength),
    MinLength(options?.minLength),
  );
}

export function IsSwaggerNumber(options: ApiPropertyOptions = {}, isRequire = true) {
  return applyDecorators(
    ApiPropType('number', isRequire, options),
    Type(() => Number),
    IsNumber(),
  );
}

export function IsSwaggerBoolean(options: ApiPropertyOptions = {}, isRequire = true) {
  return applyDecorators(
    ApiPropType('boolean', isRequire, options),
    IsBoolean(),
    Transform((params) => (String(params.value) == 'false' ? false : true)),
  );
}

export function IsSwaggerEnum(options: ApiPropertyOptions = {}, isRequire = true) {
  return applyDecorators(
    ApiPropType('enum', isRequire, options),
    ...(!isRequire ? [Transform((params) => (params.value === '' ? null : params.value))] : []),
    IsEnum(options.enum),
  );
}

export function SwaggerInterface(type, isArray = false) {
  return applyDecorators(
    ApiProperty({ type, isArray }),
    ValidateNested({ each: true }),
    IsDefined(),
    Type(() => type),
  );
}

export function IsSwaggerDateTime(options: ApiPropertyOptions = { default: new Date() }, isRequire = true) {
  return applyDecorators(
    ApiPropType('date', isRequire, {
      description: `Example: ${new Date().toISOString()}`,
      ...options,
    }),
    IsDate(),
    Type(() => Date),
    MinDate(new Date(null)),
  );
}

export function IsSwaggerDate(options: ApiPropertyOptions = { default: '2015-03-25' }, isRequire = true) {
  return applyDecorators(
    ApiPropType('date', isRequire, {
      description: `Example: "2015-03-25" (The International Standard)`,
      ...options,
    }),
    IsDate(),
    Type(() => Date),
  );
}

export function IsSwaggerArray(options: ApiPropertyOptions = {}, isRequire = true) {
  return applyDecorators(
    ApiProperty({
      isArray: true,
      required: isRequire,
      description: isRequire ? 'required' : 'not required',
      ...options,
    }),
    ...(isRequire ? [ArrayNotEmpty()] : []),
  );
}

function dbTypeToSwagger(type: ColumnType): any {
  switch (type) {
    case 'varchar':
    case 'char':
    case 'text':
    case 'decimal':
      return 'string';
    case 'int':
    case 'smallint':
    case 'float':
      return 'number';
    default:
      return type;
  }
}

export function DBColumn(options: ColumnOptions) {
  return applyDecorators(
    ApiProperty({ type: dbTypeToSwagger(options.type), enum: options.enum, default: options.default }),
    Column(options),
  );
}
