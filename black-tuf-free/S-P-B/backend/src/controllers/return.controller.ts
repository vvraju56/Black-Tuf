import type { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import Return, { IReturn } from '../models/Return';
import Refund from '../models/Refund';
import Order from '../models/Order';
import Settings from '../models/Settings';
import Notification from '../models/Notification';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/ApiError';
import { deductFromWallet, revertOrderEarnings } from '../services/wallet.service';
import { recordAudit } from './admin.controller';

interface AuthRequest extends Request {
  user?: { id: string; role: string; sellerId?: string };
}

export const createReturnRequest = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, items } = req.body;
    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Order id and return items are required');
    }

    const order = await Order.findOne({ orderNumber: orderId }).populate('items.product', 'name images price');
    if (!order) throw new NotFoundError('Order not found');
    if (String(order.customer) !== req.user!.id) throw new ForbiddenError('Not your order');

    const settings = await Settings.findOne().lean();
    const windowDays = settings?.returnWindowDays || 7;
    const deliveredAt = order.updatedAt;
    const withinWindow = Date.now() - new Date(deliveredAt).getTime() <= windowDays * 24 * 60 * 60 * 1000;
    if (order.status !== 'delivered' || !withinWindow) {
      throw new BadRequestError('Returns are only allowed within the return window for delivered orders');
    }
    if (order.returnInfo?.requested) throw new BadRequestError('A return has already been requested for this order');

    const orderItems = order.items;
    const returnItems = items.map((it: any) => {
      const match = orderItems.find((oi) => String(oi.product) === String(it.product));
      if (!match) throw new BadRequestError(`Product ${it.product} is not part of this order`);
      if (it.quantity > match.quantity) throw new BadRequestError('Return quantity exceeds ordered quantity');
      return {
        orderItem: match.product,
        product: match.product,
        title: (match as any).title,
        image: match.image || '',
        price: match.price,
        quantity: it.quantity || 1,
        reason: it.reason || 'Other',
        description: it.description,
        images: it.images || [],
        resolution: it.resolution || 'refund'
      };
    });

    const returnRequest = await Return.create({
      order: order._id,
      customer: order.customer,
      seller: order.seller,
      items: returnItems,
      status: 'requested'
    });

    order.status = 'return_requested';
    order.returnInfo = { requested: true, status: 'requested', returnId: returnRequest._id };
    await order.save();

    res.status(201).json({ status: 'success', message: 'Return requested', data: { returnRequest } });
  } catch (err) {
    next(err);
  }
};

export const getCustomerReturns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const returns = await Return.find({ customer: req.user!.id })
      .populate('order', 'orderNumber')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', results: returns.length, data: { returns } });
  } catch (err) {
    next(err);
  }
};

export const getSellerReturns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const returns = await Return.find({ seller: req.user!.sellerId })
      .populate('order', 'orderNumber')
      .populate('customer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', results: returns.length, data: { returns } });
  } catch (err) {
    next(err);
  }
};

export const listReturns = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const returns = await Return.find({})
      .populate('order', 'orderNumber')
      .populate('customer', 'name email')
      .populate('seller', 'storeName')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ status: 'success', results: returns.length, data: { returns } });
  } catch (err) {
    next(err);
  }
};

const refundReturnAmount = async (returnRequest: IReturn): Promise<number> => {
  const amount = returnRequest.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const refund = await Refund.create({
    order: returnRequest.order,
    returnRequest: returnRequest._id,
    customer: returnRequest.customer,
    seller: returnRequest.seller,
    amount,
    currency: 'INR',
    reason: 'Return approved',
    method: 'original',
    status: 'pending',
    requestedBy: returnRequest.customer
  });
  returnRequest.refundAmount = amount;
  returnRequest.refundId = refund._id as any;
  await returnRequest.save();
  return amount;
};

export const updateReturnStatus = (action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const returnRequest = await Return.findById(req.params.id);
      if (!returnRequest) throw new NotFoundError('Return not found');

      const order = await Order.findById(returnRequest.order);
      if (!order) throw new NotFoundError('Order not found');

      const { adminNote, refundAmount } = req.body;

      switch (action) {
        case 'approve':
          returnRequest.status = 'approved';
          order.returnInfo = { ...(order.returnInfo || {}), status: 'approved' } as any;
          break;
        case 'reject':
          returnRequest.status = 'rejected';
          order.status = 'delivered';
          order.returnInfo = { requested: false, status: 'rejected', returnId: returnRequest._id } as any;
          break;
        case 'schedule-pickup':
          returnRequest.status = 'pickup_scheduled';
          returnRequest.pickupScheduledAt = new Date();
          break;
        case 'picked-up':
          returnRequest.status = 'picked_up';
          returnRequest.pickedUpAt = new Date();
          break;
        case 'receive':
          returnRequest.status = 'received';
          returnRequest.receivedAt = new Date();
          await refundReturnAmount(returnRequest);
          order.status = 'refunded';
          order.payment.status = 'refunded';
          order.returnInfo = { requested: true, status: 'received', returnId: returnRequest._id } as any;
          break;
        case 'process-refund':
          returnRequest.status = 'refund_processing';
          if (returnRequest.refundId) {
            await Refund.updateOne({ _id: returnRequest.refundId }, { $set: { status: 'processing' } });
          } else {
            await refundReturnAmount(returnRequest);
            await Refund.updateOne({ _id: returnRequest.refundId }, { $set: { status: 'processing' } });
          }
          order.returnInfo = { requested: true, status: 'refund_processing', returnId: returnRequest._id } as any;
          break;
        case 'refund':
          returnRequest.status = 'refunded';
          if (returnRequest.refundId) {
            await Refund.updateOne({ _id: returnRequest.refundId }, { $set: { status: 'completed', processedAt: new Date(), approvedBy: new Types.ObjectId(req.user!.id) } });
          } else {
            await refundReturnAmount(returnRequest);
            await Refund.updateOne({ _id: returnRequest.refundId }, { $set: { status: 'completed', processedAt: new Date(), approvedBy: new Types.ObjectId(req.user!.id) } });
          }
          order.status = 'refunded';
          order.payment.status = 'refunded';
          order.returnInfo = { requested: true, status: 'refunded', returnId: returnRequest._id } as any;
          await deductFromWallet(
            String(returnRequest.seller),
            Number(refundAmount) || returnRequest.refundAmount || 0,
            returnRequest._id,
            'refund',
            `Refund for return ${returnRequest._id}`
          );
          await Notification.create({
            recipient: returnRequest.customer,
            recipientType: 'user',
            type: 'refund_update',
            title: 'Refund processed',
            message: `Your refund of ₹${Number(refundAmount) || returnRequest.refundAmount || 0} for return ${returnRequest._id} has been processed.`,
            data: { returnId: returnRequest._id }
          });
          break;
        default:
          throw new BadRequestError('Unknown return action');
      }

      if (adminNote) returnRequest.adminNote = adminNote;
      await returnRequest.save();
      await order.save();

      if (req.user!.role === 'admin') {
        await recordAudit(req.user!.id, `return.${action}`, 'Return', req.params.id, adminNote, req);
      }

      res.json({ status: 'success', data: { returnRequest, order } });
    } catch (err) {
      next(err);
    }
  };
};

export const listRefunds = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refunds = await Refund.find({})
      .populate('order', 'orderNumber')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ status: 'success', results: refunds.length, data: { refunds } });
  } catch (err) {
    next(err);
  }
};

export const getCustomerRefunds = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refunds = await Refund.find({ customer: req.user!.id })
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', results: refunds.length, data: { refunds } });
  } catch (err) {
    next(err);
  }
};
