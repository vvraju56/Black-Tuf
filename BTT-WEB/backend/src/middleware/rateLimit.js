import rateLimit from 'express-rate-limit';

const message = (text) => ({ success: false, message: text });

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many sign-in attempts. Please wait 15 minutes and try again.'),
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many messages from this address. Please try again later.'),
});

export const supportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many support requests from this address. Please try again later.'),
});

export const notifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many requests. Please try again later.'),
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Upload limit reached. Please try again later.'),
});

export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 240,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: message('Too many requests. Please slow down.'),
});
