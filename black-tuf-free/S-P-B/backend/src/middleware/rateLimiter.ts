import rateLimit from 'express-rate-limit';
import config from '../config/index';
import { ApiError } from '../utils/ApiError';

export const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new ApiError(429, 'Too many requests. Please try again later.');
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many attempts. Please try again later.',
  handler: () => {
    throw new ApiError(429, 'Too many attempts. Please try again later.');
  }
});


