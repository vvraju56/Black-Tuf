import type { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Address from '../models/Address';
import { NotFoundError } from '../utils/ApiError';

export const getUserAddresses = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ status: 'success', results: addresses.length, data: { addresses } });
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('wishlist');
    if (!user) throw new NotFoundError('User not found');
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

export const registerDeviceToken = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ status: 'fail', message: 'Token is required' });
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { deviceTokens: token } }
    );
    res.json({ status: 'success', message: 'Device token registered' });
  } catch (err) {
    next(err);
  }
};

export const unregisterDeviceToken = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ status: 'fail', message: 'Token is required' });
    await User.updateOne({ _id: req.user.id }, { $pull: { deviceTokens: token } });
    res.json({ status: 'success', message: 'Device token removed' });
  } catch (err) {
    next(err);
  }
};


