import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // Fail fast with a helpful message instead of a confusing runtime error.
    console.error(`[config] Missing required environment variable: ${key}`);
    console.error('[config] Copy backend/.env.example to backend/.env and fill it in.');
    process.exit(1);
  }
}

const isProduction = process.env.NODE_ENV === 'production';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  admin: {
    name: process.env.ADMIN_NAME || 'BlackTuf Admin',
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
  cookieName: 'btt_admin_token',
};

export const cloudinaryConfigured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);
