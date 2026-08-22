import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification';
import { NotFoundError } from '../utils/ApiError';

interface AuthRequest extends Request {
  user?: { id: string; role: string; sellerId?: string };
}

const notificationFilter = (user: any) =>
  user.role === 'seller'
    ? { recipient: user.id, recipientType: 'seller' }
    : { recipient: user.id };

export const getMyNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await Notification.find(notificationFilter(req.user)).sort({ createdAt: -1 }).limit(50);
    res.json({ status: 'success', results: notifications.length, data: { notifications } });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await Notification.countDocuments({ ...notificationFilter(req.user), isRead: false });
    res.json({ status: 'success', data: { count } });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...notificationFilter(req.user) },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) throw new NotFoundError('Notification not found');
    res.json({ status: 'success', data: { notification } });
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany(notificationFilter(req.user), { $set: { isRead: true } });
    res.json({ status: 'success', message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

export const createUserNotification = async (
  recipient: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<void> => {
  await Notification.create({ recipient, recipientType: 'user', type, title, message, data });
};
