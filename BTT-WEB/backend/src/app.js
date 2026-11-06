import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import { publicApiLimiter } from './middleware/rateLimit.js';
import { requireAdmin } from './middleware/auth.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';
import { ApiError } from './utils/ApiError.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  const allowedOrigins = new Set(env.frontendUrls);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new ApiError(403, 'This origin is not allowed to access the API.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize({ replaceWith: '_' }));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok', service: 'blacktuf-api' });
  });

  app.use('/api', publicApiLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', requireAdmin, adminRoutes);
  app.use('/api', publicRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
