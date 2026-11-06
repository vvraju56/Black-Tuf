import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Something went wrong.';

  if (error.name === 'ValidationError') {
    status = 422;
    message = 'Please check the submitted information.';
  }

  if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier.';
  }

  if (error.code === 11000) {
    status = 409;
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    message = `That ${field} is already in use.`;
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'The uploaded file is too large.';
  }

  if (status >= 500) {
    console.error('[api] Unhandled error:', error);
  }

  res.status(status).json({
    success: false,
    message: env.isProduction && status >= 500 ? 'Something went wrong.' : message,
    ...(error.errors ? { errors: error.errors } : {}),
  });
}
