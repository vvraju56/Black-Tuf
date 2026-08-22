import type { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import { buildOrdersFromCart, validateCoupon } from '../services/order.service';
import { revertOrderEarnings } from '../services/wallet.service';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/ApiError';
import { emitToOrder, emitToSeller, emitToAdmin, emitToProduct, emitToUser, notify, trackActivity } from '../services/realtime.service';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import Seller from '../models/Seller';

export const createOrder = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    if (!shippingAddress) throw new BadRequestError('Shipping address is required');
    if (!paymentMethod) throw new BadRequestError('Payment method is required');

    const paymentInfo = {
      method: paymentMethod as any,
      status: paymentMethod === 'cod' ? 'pending' : 'pending',
      amount: 0,
      currency: 'INR'
    };

    const result = await buildOrdersFromCart(req.user.id, shippingAddress, paymentInfo, couponCode);
    const parentOrder = await Order.findById(result.parentOrderId).populate('customer', 'name email');

    emitToOrder(result.parentOrderId, SOCKET_EVENTS.ORDER_CREATED, { order: parentOrder });

    // Notify each seller about the new order.
    for (const so of result.createdOrders || []) {
      try {
        const seller = await Seller.findById(so.sellerId).select('user storeName');
        if (seller?.user) {
          await notify({
            recipient: String(seller.user),
            recipientType: 'seller',
            sellerId: so.sellerId,
            type: 'order_confirmation',
            title: 'New order received',
            message: `New order #${so.orderNumber} for ${so.total}`,
            data: { orderId: so.id, orderNumber: so.orderNumber },
          });
        }
      } catch (notifyErr) {
        console.error('[order] seller notify failed:', (notifyErr as Error).message);
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        order: parentOrder,
        orderNumber: result.parentOrderNumber,
        grandTotal: result.grandTotal
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { customer: req.user.id };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50).populate('seller', 'storeName');
    res.json({ status: 'success', results: orders.length, data: { orders } });
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.id })
      .populate('customer', 'name email phone')
      .populate('seller', 'storeName')
      .populate('items.product', 'name images price');
    if (!order) throw new NotFoundError('Order not found');

    if (req.user.role !== 'admin' && String(order.customer) !== req.user.id && String(order.seller?._id || order.seller) !== req.user.id) {
      throw new ForbiddenError('Not authorized to view this order');
    }

    const childOrders = await Order.find({ parentOrder: order._id }).populate('seller', 'storeName').populate('items.product', 'name images price');
    res.json({ status: 'success', data: { order, childOrders } });
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.id });
    if (!order) throw new NotFoundError('Order not found');

    const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);
    if (!canCancel && req.user.role !== 'admin') {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.cancellation = {
      cancelledBy: req.user.id,
      reason: req.body.reason || 'Cancelled by customer',
      cancelledAt: new Date()
    };
    await order.save();

    for (const item of order.items) {
      await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
    }

    if (!order.isParent && order.payment.status === 'paid') {
      await revertOrderEarnings(order);
    }

    const childOrders = await Order.find({ parentOrder: order._id });
    await Order.updateMany({ _id: { $in: childOrders.map((o) => o._id) } }, { $set: { status: 'cancelled' } });

    emitToOrder(String(order._id), SOCKET_EVENTS.ORDER_CANCELLED, { order });
    emitToUser(String(order.customer), SOCKET_EVENTS.ORDER_CANCELLED, { order });
    for (const child of childOrders) {
      emitToOrder(String(child._id), SOCKET_EVENTS.ORDER_CANCELLED, { order: child });
      emitToUser(String(child.customer || order.customer), SOCKET_EVENTS.ORDER_CANCELLED, { order: child });
    }
    for (const item of order.items) {
      emitToProduct(String(item.product), SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, { productId: String(item.product), increment: item.quantity });
    }
    emitToAdmin(SOCKET_EVENTS.ORDER_CANCELLED, { order });
    trackActivity({ label: `Order #${order.orderNumber} cancelled`, category: 'orders' });

    res.json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

export const validateOrderTotals = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { couponCode, items } = req.body;
    if (!items || !Array.isArray(items)) throw new BadRequestError('Items are required');
    let subtotal = 0;
    for (const it of items) {
      subtotal += Number(it.price) * Number(it.quantity);
    }
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      const result = await validateCoupon(couponCode, req.user.id, subtotal);
      if (result.valid) discount = result.discount;
      if (result.coupon) coupon = { code: result.coupon.code, discount };
    }
    const tax = subtotal * 0.18;
    const shipping = subtotal >= 499 ? 0 : 50;
    const total = subtotal + tax + shipping - discount;
    res.json({ status: 'success', data: { subtotal, tax, shipping, discount, total, coupon } });
  } catch (err) {
    next(err);
  }
};

export const getOrderStatuses = (_req: Request, res: Response): void => {
  const statuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'];
  res.json({ status: 'success', data: { statuses } });
};


