import dotenv from 'dotenv';
import path from 'path';

const envDir = path.resolve();
dotenv.config({ path: path.resolve(envDir, '.env') });

interface Config {
  nodeEnv: string;
  port: number;
  clientUrl: string;
  projectName: string;
  mongoUri: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  bcryptSaltRounds: number;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  razorpay: {
    keyId: string;
    keySecret: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  fcm: {
    serverKey: string;
    senderId: string;
  };
  shiprocket: {
    email?: string;
    password?: string;
  };
  admin: {
    name: string;
    email: string;
    password: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  projectName: process.env.PROJECT_NAME || 'Black Tuf',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blacktuf',
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_dev_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || ''
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'Black Tuf <no-reply@blacktuf.com>'
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY || '',
    senderId: process.env.FCM_SENDER_ID || ''
  },
  shiprocket: {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
  },
  admin: {
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@blacktuf.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
  }
};

export default config;


