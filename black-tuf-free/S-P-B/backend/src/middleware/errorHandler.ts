import type { Request, Response, NextFunction } from 'express';
import { ApiError, BadRequestError, UnauthorizedError } from '../utils/ApiError';
import config from '../config/index';

interface HttpException extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: unknown;
  code?: number;
  keyValue?: Record<string, unknown>;
  value?: string;
  path?: string;
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const sendErrorProd = (err: HttpException, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

export const sendErrorDev = (err: HttpException, res: Response): void => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message,
    ...(err.errors ? { errors: err.errors } : {}),
    stack: err.stack
  });
};

export const handleCastErrorDB = (err: HttpException): ApiError => {
  const message = `Invalid ${err.value || 'value'}: ${err.path || 'path'}`;
  return new BadRequestError(message);
};

export const handleDuplicateFieldsDB = (err: HttpException): ApiError => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  const message = `Duplicate field value: ${field}. Please use another value.`;
  return new BadRequestError(message);
};

export const handleValidationErrorDB = (err: HttpException & { errors?: Record<string, { message: string }> }): ApiError => {
  const messages = err.errors
    ? Object.values(err.errors).map((el) => el.message)
    : ['Validation error'];
  return new BadRequestError(`Invalid input data. ${messages.join('. ')}`);
};

export const globalErrorHandler = (
  err: HttpException,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.nodeEnv === 'development') {
    sendErrorDev(err, res);
  } else {
    let error: HttpException = { ...err, message: err.message };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error as never);
    if (err.name === 'JsonWebTokenError') {
      error = new UnauthorizedError('Invalid token. Please log in again.');
    }
    if (err.name === 'TokenExpiredError') {
      error = new UnauthorizedError('Your token has expired. Please log in again.');
    }
    sendErrorProd(error, res);
  }
};


