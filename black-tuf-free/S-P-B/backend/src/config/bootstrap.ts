import User from '../models/User';
import Seller from '../models/Seller';
import SellerWallet from '../models/SellerWallet';
import Settings from '../models/Settings';
import { hashPassword } from '../utils/auth';
import config from '../config/index';

export const bootstrapAdmin = async (): Promise<void> => {
  const existing = await User.findOne({ email: config.admin.email });
  if (existing) return;

  const hashed = await hashPassword(config.admin.password);
  const admin = await User.create({
    name: config.admin.name,
    email: config.admin.email,
    password: hashed,
    role: 'admin',
    emailVerified: true,
    isActive: true
  });

  await Settings.create({});
  console.log(`[bootstrap] Admin created: ${admin.email}`);
};


