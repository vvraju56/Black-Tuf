import type { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import Order from '../models/Order';
import Refund from '../models/Refund';
import Settings from '../models/Settings';
import config from '../config/index';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/ApiError';

let razorpayInstance: Razorpay | null = null;

const getRazorpay = (): Razorpay | null => {
  const settings = config;
  if (!settings.razorpay.keyId || !settings.razorpay.keySecret) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: settings.razorpay.keyId,
      key_secret: settings.razorpay.keySecret
    });
  }
  return razorpayInstance;
};

export const createRazorpayOrder = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) throw new BadRequestError('Order id and amount are required');

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    if (String(order.customer) !== req.user.id) throw new BadRequestError('Order does not belong to this user');

    const rp = getRazorpay();
    let paymentInfo: any = {
      orderId: order._id,
      amount,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      name: config.projectName,
      description: `Order ${order.orderNumber}`,
      prefill: { email: '', contact: '' },
      theme: { color: '#ff79ee' },
      mode: 'mock'
    };

    if (rp) {
      const razorpayOrder = await rp.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: order.orderNumber
      });
      paymentInfo = {
        ...paymentInfo,
        mode: 'live',
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount
      };
    }

    order.payment.razorpayOrderId = paymentInfo.razorpayOrderId || paymentInfo.orderId;
    await order.save();

    res.json({ status: 'success', data: { payment: paymentInfo } });
  } catch (err) {
    next(err);
  }
};

export const verifyRazorpayPayment = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, paymentId, signature, mode } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    let verified = false;
    if (mode === 'mock') {
      verified = true;
    } else {
      const rp = getRazorpay();
      if (!rp) throw new BadRequestError('Razorpay not configured');
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', config.razorpay.keySecret);
      hmac.update(`${paymentId}|${order.payment.razorpayOrderId}`);
      const generated = hmac.digest('hex');
      verified = generated === signature;
    }

    if (!verified) throw new BadRequestError('Payment verification failed');

    order.payment.status = 'paid';
    order.payment.razorpayPaymentId = paymentId;
    order.payment.razorpaySignature = signature;
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    await order.save();

    if (order.parentOrder) {
      const parent = await Order.findById(order.parentOrder);
      if (parent) {
        const childOrders = await Order.find({ parentOrder: order.parentOrder, isParent: false });
        const allPaid = childOrders.every((o) => o.payment.status === 'paid');
        if (allPaid) {
          parent.payment.status = 'paid';
          parent.status = 'confirmed';
          await parent.save();
        }
      }
    }

    res.json({ status: 'success', message: 'Payment verified and order confirmed', data: { order } });
  } catch (err) {
    next(err);
  }
};

export const getRazorpayKey = (_req: Request, res: Response): void => {
  res.json({ status: 'success', data: { keyId: config.razorpay.keyId, mode: config.razorpay.keyId ? 'live' : 'mock' } });
};

export const refundPayment = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, amount, reason } = req.body;
    if (!orderId) throw new BadRequestError('Order id is required');

    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (req.user.role !== 'admin' && String(order.customer) !== req.user.id) {
      throw new ForbiddenError('Not authorized to refund this order');
    }

    if (order.payment.status !== 'paid') throw new BadRequestError('Only paid orders can be refunded');

    const refundAmount = amount && amount > 0 ? Math.min(amount, order.total) : order.total;
    const isPartial = refundAmount < order.total;

    const refund = await Refund.create({
      order: order._id,
      customer: order.customer,
      seller: order.seller,
      amount: refundAmount,
      currency: 'INR',
      reason: reason || 'Order refund',
      method: 'original',
      status: 'pending',
      requestedBy: req.user.id
    });

    order.payment.status = isPartial ? 'partially_refunded' : 'refunded';
    order.status = isPartial ? order.status : 'refunded';
    await order.save();

    res.status(201).json({
      status: 'success',
      message: isPartial ? 'Partial refund initiated' : 'Refund initiated',
      data: { refund, partial: isPartial }
    });
  } catch (err) {
    next(err);
  }
};

export const listAdminPayments = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payments = await Order.find({ isParent: true })
      .populate('customer', 'name email')
      .select('orderNumber customer payment total status createdAt')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ status: 'success', results: payments.length, data: { payments } });
  } catch (err) {
    next(err);
  }
};


