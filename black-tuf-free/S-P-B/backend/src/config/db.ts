import mongoose from 'mongoose';
import config from './index';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;
  try {
    await mongoose.connect(config.mongoUri);
    isConnected = true;
    if (config.nodeEnv !== 'test') {
      console.log(`[mongodb] Connected to ${config.mongoUri}`);
    }
  } catch (err) {
    console.error('[mongodb] Connection error:', err);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};


