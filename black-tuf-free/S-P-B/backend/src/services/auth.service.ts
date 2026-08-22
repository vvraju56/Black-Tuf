import crypto from 'crypto';
import User from '../models/User';
import Seller from '../models/Seller';
import SellerWallet from '../models/SellerWallet';
import { hashPassword, comparePassword, signTokens } from '../utils/auth';
import { sendEmail, renderTemplate } from '../services/emailService';
import { UnauthorizedError, BadRequestError } from '../utils/ApiError';
import { UserRole } from '../types/index';

export const registerCustomer = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new BadRequestError('User already exists with this email');
  }

  const hashed = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
    phone: data.phone,
    role: 'customer',
    emailVerified: false
  });

  await setVerification(user);

  const tokens = signTokens({ id: user._id.toString(), role: 'customer' });
  return { user, ...tokens };
};

export const registerSeller = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  storeName: string;
  storeDescription: string;
}): Promise<{ user: any; seller: any; accessToken: string; refreshToken: string }> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new BadRequestError('User already exists with this email');
  }

  const hashed = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashed,
    phone: data.phone,
    role: 'seller',
    emailVerified: false
  });

  const seller = await Seller.create({
    user: user._id,
    storeName: data.storeName,
    storeDescription: data.storeDescription,
    phone: data.phone,
    status: 'draft',
    isApproved: false
  });

  await SellerWallet.create({ seller: seller._id });

  user.seller = seller._id;
  await user.save();

  await setVerification(user);

  const tokens = signTokens({ id: user._id.toString(), role: 'seller', sellerId: seller._id.toString() });
  return { user, seller, ...tokens };
};

export const setVerification = async (user: any): Promise<void> => {
  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save({});

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your email',
    html: renderTemplate(EMAIL_TEMPLATE_VERIFY, { name: user.name, url: verifyUrl })
  });
};

export const verifyEmail = async (token: string): Promise<void> => {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() }
  });
  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({});
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
  const user = await User.findOne({ email }).select('+password').populate('seller');
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  let sellerId: string | undefined;
  if (user.role === 'seller') {
    sellerId = user.seller?._id?.toString();
    const seller = await Seller.findOne({ user: user._id });
    if (!seller || !seller.isApproved) {
      throw new UnauthorizedError('Seller account not yet approved');
    }
  }

  const tokens = signTokens({ id: user._id.toString(), role: user.role as UserRole, sellerId });

  const { password: _pw, emailVerificationToken, emailVerificationExpires, passwordResetToken, passwordResetExpires, ...safeUser } = user.toObject();
  return { user: safeUser, ...tokens };
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({});

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Password reset',
    html: renderTemplate(EMAIL_TEMPLATE_RESET, { name: user.name, url: resetUrl })
  });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: new Date() }
  }).select('+passwordResetToken');
  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }
  user.password = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  try {
    const { verifyRefreshToken } = await import('../utils/auth');
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid token');
    }
    return { accessToken: signTokens({ id: user._id.toString(), role: user.role as UserRole, sellerId: decoded.sellerId }).accessToken };
  } catch {
    throw new UnauthorizedError('Invalid refresh token');
  }
};

const EMAIL_TEMPLATE_VERIFY = `<html><body><h2>Welcome to Marketplace</h2><p>Hi {{name}},</p><p>Please verify your email by clicking: <a href="{{url}}">{{url}}</a></p><p>This link expires in 24 hours.</p></body></html>`;
const EMAIL_TEMPLATE_RESET = `<html><body><h2>Reset Password</h2><p>Hi {{name}},</p><p>Click to reset: <a href="{{url}}">{{url}}</a></p><p>This link expires in 10 minutes.</p></body></html>`;


