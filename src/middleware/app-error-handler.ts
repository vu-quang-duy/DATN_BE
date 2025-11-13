import { ArgumentsHost, BadRequestException, Catch, HttpException, HttpServer, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
import { isArray } from 'lodash';
import { AppError, ERROR_MSG, IAppError } from 'src/constant/error';
import { RequestAuth } from 'src/dto/common-request.dto';
import { winstonLogger } from 'src/logger';

export class AppException extends HttpException {
  public errorCode: string;
  constructor(err: ERROR_MSG | IAppError, message?: string) {
    const errObj: IAppError = typeof err === 'string' ? AppError[err] : err;

    const { status, ...error } = errObj;

    if (message) error.message = message;
    super(error, status);
    this.errorCode = error.code;
  }
}

export class App404Exception extends AppException {
  public errorCode: string;
  constructor(key, body) {
    super({
      message: `${body[key]} not found`,
      code: `${key}_NOT_FOUND`,
      status: HttpStatus.BAD_REQUEST,
    });
  }
}

export class AppExistedException extends AppException {
  public errorCode: string;
  constructor(key, body) {
    super({
      message: `${body[key]} is existed`,
      code: `${key}_IS_EXISTED`,
      status: HttpStatus.BAD_REQUEST,
    });
  }
}

export class AppBadRequestError extends AppException {
  constructor(message) {
    super({
      message,
      code: `Validate request error`,
      status: HttpStatus.BAD_REQUEST,
    });
  }
}

export function AppCatchAxiosException(e) {
  if (e?.response?.data) {
    const logs = e?.response?.data.split('</html>');
    if (logs?.length > 1) winstonLogger.error(logs?.length > 1 ? logs[1] : logs[0]);
  } else {
    winstonLogger.error(e);
  }
}

@Catch()
export class AppErrorHandler extends BaseExceptionFilter {
  constructor(applicationRef?: HttpServer) {
    super(applicationRef);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestAuth>();

    let tracePositionError = '';
    exception.stack
      .split('\n')
      .slice(1)
      .map((r) => r.match(/\((?<file>.*):(?<line>\d+):(?<pos>\d+)\)/))
      .forEach((r) => {
        if (r && r.groups && r.groups.file.substr(0, 8) !== 'internal') {
          const { file, line, pos } = r.groups;
          tracePositionError += `\n${file} at ${line}:${pos}`;
        }
      });

    // TODO handle store log

    const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = '';
    if (exception?.getResponse) {
      message =
        typeof exception.getResponse() === 'object'
          ? (exception.getResponse() as any).message
          : exception.getResponse();
    } else {
      message = exception.toString();
    }

    let code = null;

    if (exception instanceof BadRequestException) {
      code = BadRequestException.name;
    } else if (exception instanceof AppException) {
      code = exception.errorCode;
    } else {
      code = (exception as any)?.response?.error;
    }

    const errorResponse = {
      status,
      data: {
        status,
        message,
        code,
      } as IAppError,
    };

    if (isArray(errorResponse.data.message)) {
      errorResponse.data.message = errorResponse.data.message[0];
    }

    const logMsg = `${request.method} ${request.url} ${JSON.stringify(errorResponse)} ${tracePositionError}`;

    if (status >= 500) {
      winstonLogger.error(logMsg);
    } else {
      winstonLogger.warn(logMsg);
    }

    return response?.status(status).json(errorResponse);
  }
}
