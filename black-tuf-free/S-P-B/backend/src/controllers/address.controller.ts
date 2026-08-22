import type { Request, Response, NextFunction } from 'express';
import Address from '../models/Address';
import { NotFoundError } from '../utils/ApiError';

export const getAddresses = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ status: 'success', results: addresses.length, data: { addresses } });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const address = await Address.create({ ...req.body, user: req.user.id });
    if (address.isDefault) {
      await Address.updateMany({ user: req.user.id, _id: { $ne: address._id } }, { $set: { isDefault: false } });
    }
    res.status(201).json({ status: 'success', data: { address } });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!address) throw new NotFoundError('Address not found');
    res.json({ status: 'success', data: { address } });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) throw new NotFoundError('Address not found');
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

export const setDefaultAddress = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Address.updateMany({ user: req.user.id }, { $set: { isDefault: false } });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );
    if (!address) throw new NotFoundError('Address not found');
    res.json({ status: 'success', data: { address } });
  } catch (err) {
    next(err);
  }
};


