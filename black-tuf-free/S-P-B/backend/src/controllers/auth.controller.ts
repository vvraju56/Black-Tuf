import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { tokenCookieOptions, refreshTokenCookieOptions, comparePassword } from '../utils/auth';
import User from '../models/User';
import { UserRole } from '../types/index';
import { UnauthorizedError } from '../utils/ApiError';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.body.role === 'seller' ? 'seller' : 'customer';
    let result;
    if (role === 'seller') {
      result = await authService.registerSeller({ ...req.body });
    } else {
      result = await authService.registerCustomer({ ...req.body });
    }

    res.status(201).cookie('accessToken', result.accessToken, tokenCookieOptions())
      .cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions())
      .json({
        status: 'success',
        message: role === 'seller'
          ? 'Registration started. Verify email and await admin approval.'
          : 'Registration successful. Please verify your email.',
        data: { user: result.user, ...((result as any).seller ? { seller: (result as any).seller } : {}) }
      });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.cookie('accessToken', result.accessToken, tokenCookieOptions())
      .cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions())
      .json({
        status: 'success',
        data: { user: result.user }
      });
  } catch (err) {
    next(err);
  }
};

export const logout = (req: Request, res: Response, _next: NextFunction): void => {
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ status: 'success', message: 'Logged out' });
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);
    res.json({ status: 'success', message: 'Email verified' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ status: 'success', message: 'Check email for reset link' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.json({ status: 'success', message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new UnauthorizedError('Refresh token required');
    const { accessToken } = await authService.refreshAccessToken(refreshToken);
    res.cookie('accessToken', accessToken, tokenCookieOptions()).json({ status: 'success', data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const user = await User.findById(req.user.id).select('-password').populate('seller');
  res.json({ status: 'success', data: { user } });
};

export const updateProfile = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone }, { new: true, runValidators: true }).select('-password');
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) throw new Error('User not found');
    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');
    user.password = newPassword;
    await user.save();
    res.json({ status: 'success', message: 'Password changed' });
  } catch (err) {
    next(err);
  }
};


