import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import config from './config/index';
import { connectDB } from './config/db';
import { limiter } from './middleware/rateLimiter';
import { globalErrorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/ApiError';
import { registerRoutes } from './routes/index';

export const createApp = (): Application => {
  const app = express();

  connectDB();

  app.use(helmet());
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(limiter);

  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  registerRoutes(app);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  app.use(globalErrorHandler);

  return app;
};


