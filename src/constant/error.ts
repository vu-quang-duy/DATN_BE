import { HttpStatus } from '@nestjs/common';

export interface IAppError {
  code: string;
  message: string;
  status: HttpStatus;
}

export enum ERROR_MSG {
  // AUTH MESSAGE
  AUTH_UNAUTHORIZED_TOKEN = 'AUTH_UNAUTHORIZED_TOKEN',
  AUTH_TOKEN_CLAIMS_BEFORE = 'AUTH_TOKEN_CLAIMS_BEFORE',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  AUTH_FORBIDDEN_ACCOUNT = 'AUTH_FORBIDDEN_ACCOUNT',
  AUTH_OTP_NOT_MATCH = 'AUTH_OTP_NOT_MATCH',
  AUTH_OTP_EXPIRED = 'AUTH_OTP_EXPIRED',

  // LOGIC DEFAULT MESSAGE
  PASSWORD_NOT_CORRECT = 'PASSWORD_NOT_CORRECT',
  OLD_PASSWORD_NOT_CORRECT = 'OLD_PASSWORD_NOT_CORRECT',
  HAVE_NOT_ANY_CHANGE = 'HAVE_NOT_ANY_CHANGE',
  USER_NAME_EXISTED = 'USER_NAME_EXISTED',
  EMAIL_EXISTED = 'EMAIL_EXISTED',
  ROLE_IS_NOT_EXIST = 'ROLE_IS_NOT_EXIST',
  UN_SUPPORTED_STATUS = 'UN_SUPPORTED_STATUS',
  PASSWORD_NOT_MATCH = 'PASSWORD_NOT_MATCH',

  // SYSTEM LOGIC MESSAGE
  TIME_INVALID = 'TIME_INVALID',
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export const AppError: Record<ERROR_MSG, IAppError> = Object.freeze({
  [ERROR_MSG.UN_SUPPORTED_STATUS]: {
    code: ERROR_MSG.UN_SUPPORTED_STATUS,
    message: 'Unsupported status',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.TIME_INVALID]: {
    code: ERROR_MSG.TIME_INVALID,
    message: 'Your time invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  //AUTH
  [ERROR_MSG.AUTH_OTP_EXPIRED]: {
    code: ERROR_MSG.AUTH_OTP_EXPIRED,
    message: 'OTP have been expired',
    status: HttpStatus.BAD_REQUEST,
  },
  [ERROR_MSG.AUTH_OTP_NOT_MATCH]: {
    code: ERROR_MSG.AUTH_OTP_NOT_MATCH,
    message: 'OTP not match',
    status: HttpStatus.BAD_REQUEST,
  },
  [ERROR_MSG.AUTH_TOKEN_CLAIMS_BEFORE]: {
    code: ERROR_MSG.AUTH_TOKEN_CLAIMS_BEFORE,
    message: 'Your token has been claims before create',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_MSG.AUTH_TOKEN_EXPIRED]: {
    code: 'AUTH_TOKEN_EXPIRED',
    message: 'Your token have been expired',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_MSG.AUTH_TOKEN_INVALID]: {
    code: 'AUTH_TOKEN_INVALID',
    message: 'Your token is invalid',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_MSG.AUTH_UNAUTHORIZED_TOKEN]: {
    code: 'AUTH_UNAUTHORIZED_TOKEN',
    message: 'Auth is false',
    status: HttpStatus.UNAUTHORIZED,
  },
  [ERROR_MSG.AUTH_FORBIDDEN_ACCOUNT]: {
    code: 'AUTH_FORBIDDEN_ACCOUNT',
    message: 'Access denied',
    status: HttpStatus.FORBIDDEN,
  },

  [ERROR_MSG.PASSWORD_NOT_CORRECT]: {
    code: 'PASSWORD_NOT_CORRECT',
    message: 'Password not correct',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.OLD_PASSWORD_NOT_CORRECT]: {
    code: 'OLD_PASSWORD_NOT_CORRECT',
    message: 'Old password not correct',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.PASSWORD_NOT_MATCH]: {
    code: 'PASSWORD_NOT_MATCH',
    message: 'Password not match',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.HAVE_NOT_ANY_CHANGE]: {
    code: 'HAVE_NOT_ANY_CHANGE',
    message: 'Have not any change',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.USER_NAME_EXISTED]: {
    code: 'USER_NAME_EXISTED',
    message: 'Username existed',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.EMAIL_EXISTED]: {
    code: 'EMAIL_EXISTED',
    message: 'email existed',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.ROLE_IS_NOT_EXIST]: {
    code: 'ROLE_IS_NOT_EXIST',
    message: 'Role is not exist',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.DATA_NOT_FOUND]: {
    code: 'DATA_NOT_FOUND',
    message: 'Data not found',
    status: HttpStatus.BAD_REQUEST,
  },

  [ERROR_MSG.PERMISSION_DENIED]: {
    code: 'NOT_PERMISSION',
    message: 'Only admin can do this action',
    status: HttpStatus.FORBIDDEN,
  },
});
