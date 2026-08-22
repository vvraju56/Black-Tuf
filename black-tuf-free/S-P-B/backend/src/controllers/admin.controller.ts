import type { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Seller from '../models/Seller';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import Coupon from '../models/Coupon';
import Banner from '../models/Banner';
import Review from '../models/Review';
import Payout from '../models/Payout';
import Refund from '../models/Refund';
import Return from '../models/Return';
import Settings from '../models/Settings';
import AuditLog from '../models/AuditLog';
import Commission from '../models/Commission';
import Notification from '../models/Notification';
import SupportTicket from '../models/SupportTicket';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import mongoose from 'mongoose';
import { releaseSellerEarnings } from '../services/wallet.service';
import { emitToOrder, emitToUser, emitToSeller, emitToAdmin, emitToProduct, notify, trackActivity } from '../services/realtime.service';
import { SOCKET_EVENTS } from '../constants/socketEvents';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const recordAudit = async (admin: string, action: string, entity: string, entityId?: string | string[], details?: string, req?: Request) => {
  await AuditLog.create({
    admin,
    action,
    entity,
    entityId: entityId ? String(entityId) : undefined,
    details,
    ipAddress: req?.ip,
    userAgent: req?.get('User-Agent')
  });
};

export const createAdminNotification = async (recipient: any, type: string, title: string, message: string) => {
  await Notification.create({ recipient, recipientType: 'seller', type, title, message });
};

export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalCustomers, totalSellers, totalProducts, totalOrders, statsAgg, activeSellers] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Seller.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { isParent: true } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            commission: { $sum: '$commission' },
            orders: { $sum: 1 }
          }
        }
      ]),
      Seller.countDocuments({ status: 'approved' })
    ]);

    const [pendingSellers, pendingProducts, pendingPayouts, refundAmount] = await Promise.all([
      Seller.countDocuments({ status: 'submitted' }),
      Product.countDocuments({ approvalStatus: 'pending' }),
      Payout.countDocuments({ status: 'pending' }),
      Refund.aggregate([{ $match: { status: { $in: ['processing', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);

    const [salesByMonth, newCustomers] = await Promise.all([
      Order.aggregate([
        { $match: { isParent: true, createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $match: { role: 'customer', createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const s = statsAgg[0] || { revenue: 0, commission: 0, orders: 0 };
    const refundTotal = refundAmount[0]?.total || 0;

    res.json({
      status: 'success',
      data: {
        stats: {
          totalUsers: totalCustomers,
          totalSellers,
          activeSellers,
          totalProducts,
          totalOrders,
          revenue: s.revenue,
          platformCommission: s.commission,
          pendingSellerPayouts: pendingPayouts,
          pendingSellers,
          pendingProducts,
          refundAmount: refundTotal
        },
        charts: {
          salesByMonth,
          newCustomers
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

const paginatedList = async (model: any, filter = {}, populate?: any, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const [docs, count] = await Promise.all([
    model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(populate),
    model.countDocuments(filter)
  ]);
  return { docs, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
};

export const listCustomers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((res.req as any).query?.page || '1', 10));
    const { docs, pagination } = await paginatedList(User, { role: 'customer' }, null, page);
    res.json({ status: 'success', pagination, data: { users: docs } });
  } catch (err) {
    next(err);
  }
};

export const listSellers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt((res.req as any).query?.page || '1', 10));
    const { docs, pagination } = await paginatedList(Seller, {}, [{ path: 'user', select: 'name email phone' }], page);
    res.json({ status: 'success', pagination, data: { sellers: docs } });
  } catch (err) {
    next(err);
  }
};

export const approveSeller = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const seller = await Seller.findById(req.params.id).populate('user');
    if (!seller) throw new NotFoundError('Seller not found');
    seller.status = 'approved';
    seller.isApproved = true;
    seller.approvedAt = new Date();
    seller.rejectionReason = undefined;
    await seller.save();
    await recordAudit(req.user!.id, 'seller.approve', 'Seller', req.params.id, undefined, req);
    await notify({
      recipient: String(seller.user._id),
      recipientType: 'seller',
      sellerId: String(seller._id),
      type: 'seller_approval',
      title: 'Account approved',
      message: `Your seller account "${seller.storeName}" has been approved.`,
    });
    emitToUser(String(seller.user._id), SOCKET_EVENTS.SELLER_APPROVED, { seller });
    emitToAdmin(SOCKET_EVENTS.SELLER_APPROVED, { seller });
    trackActivity({ label: `Seller "${seller.storeName}" approved`, category: 'sellers' });
    res.json({ status: 'success', data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const rejectSeller = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const seller = await Seller.findById(req.params.id).populate('user');
    if (!seller) throw new NotFoundError('Seller not found');
    seller.status = 'rejected';
    seller.isApproved = false;
    seller.rejectionReason = reason || 'Not approved';
    await seller.save();
    await recordAudit(req.user!.id, 'seller.reject', 'Seller', req.params.id, reason, req);
    if (seller.user) {
      await notify({
        recipient: String(seller.user._id),
        recipientType: 'seller',
        sellerId: String(seller._id),
        type: 'seller_approval',
        title: 'Account rejected',
        message: `Your seller account "${seller.storeName}" was rejected: ${reason}`,
      });
      emitToUser(String(seller.user._id), SOCKET_EVENTS.SELLER_REJECTED, { seller });
    }
    emitToAdmin(SOCKET_EVENTS.SELLER_REJECTED, { seller });
    trackActivity({ label: `Seller "${seller.storeName}" rejected`, category: 'sellers' });
    res.json({ status: 'success', data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const suspendSeller = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) throw new NotFoundError('Seller not found');
    seller.status = 'suspended';
    await seller.save();
    await recordAudit(req.user!.id, 'seller.suspend', 'Seller', req.params.id, undefined, req);
    res.json({ status: 'success', data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { approvalStatus, status, seller } = req.query;
    const filter: Record<string, unknown> = {};
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (status) filter.status = status;
    if (seller) filter.seller = seller;

    const [docs, count] = await Promise.all([
      Product.find(filter).populate('seller', 'storeName').populate('category', 'name').sort({ createdAt: -1 }).limit(100),
      Product.countDocuments(filter)
    ]);
    res.json({ status: 'success', results: docs.length, pagination: { total: count }, data: { products: docs } });
  } catch (err) {
    next(err);
  }
};

export const approveProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('seller');
    if (!product) throw new NotFoundError('Product not found');
    product.approvalStatus = 'approved';
    product.status = 'published';
    product.approvedBy = new mongoose.Types.ObjectId(req.user!.id);
    product.approvedAt = new Date();
    product.rejectionReason = undefined;
    await product.save();
    await recordAudit(req.user!.id, 'product.approve', 'Product', req.params.id, undefined, req);
    const sellerDoc = product.seller as any;
    const sellerUserId = sellerDoc?.user ? String(sellerDoc.user) : null;
    if (sellerUserId) {
      await notify({
        recipient: sellerUserId,
        recipientType: 'seller',
        sellerId: String(sellerDoc._id),
        type: 'product_approval',
        title: 'Product approved',
        message: `Your product "${product.name}" has been approved.`,
        data: { productId: String(product._id) },
      });
    }
    emitToProduct(String(product._id), SOCKET_EVENTS.PRODUCT_APPROVED, { product });
    if (sellerDoc?._id) emitToSeller(String(sellerDoc._id), SOCKET_EVENTS.PRODUCT_APPROVED, { product });
    emitToAdmin(SOCKET_EVENTS.PRODUCT_APPROVED, { product });
    trackActivity({ label: `Product "${product.name}" approved`, category: 'products' });
    res.json({ status: 'success', data: { product } });
  } catch (err) {
    next(err);
  }
};

export const rejectProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) throw new NotFoundError('Product not found');
    product.approvalStatus = 'rejected';
    product.status = 'rejected';
    product.rejectionReason = reason || 'Not approved';
    await product.save();
    await recordAudit(req.user!.id, 'product.reject', 'Product', req.params.id, reason, req);
    res.json({ status: 'success', data: { product } });
  } catch (err) {
    next(err);
  }
};

export const listOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = { isParent: true };
    if (status) filter.status = status;
    const orders = await Order.find(filter).populate('customer', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json({ status: 'success', results: orders.length, data: { orders } });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new NotFoundError('Order not found');
    order.status = status;
    await order.save();

    if (status === 'delivered' && order.payment.status === 'paid' && !order.isParent) {
      await releaseSellerEarnings(order);
    }

    await recordAudit(req.user!.id, 'order.update', 'Order', req.params.id, `status changed to ${status}`, req);

    // Real-time order status broadcast
    emitToOrder(String(order._id), SOCKET_EVENTS.ORDER_UPDATED, { order });
    emitToUser(String(order.customer), SOCKET_EVENTS.ORDER_UPDATED, { order });
    if (order.seller) emitToSeller(String(order.seller), SOCKET_EVENTS.ORDER_UPDATED, { order });

    if (status === 'shipped') {
      emitToOrder(String(order._id), SOCKET_EVENTS.ORDER_SHIPPED, { order });
      emitToUser(String(order.customer), SOCKET_EVENTS.ORDER_SHIPPED, { order });
      await notify({
        recipient: String(order.customer),
        type: 'order_shipped',
        title: 'Order shipped',
        message: `Your order #${order.orderNumber} has been shipped${order.trackingNumber ? ` (${order.trackingNumber})` : ''}.`,
        data: { orderId: String(order._id), orderNumber: order.orderNumber },
      });
    }
    if (status === 'delivered') {
      emitToOrder(String(order._id), SOCKET_EVENTS.ORDER_DELIVERED, { order });
      emitToUser(String(order.customer), SOCKET_EVENTS.ORDER_DELIVERED, { order });
      await notify({
        recipient: String(order.customer),
        type: 'order_delivered',
        title: 'Order delivered',
        message: `Your order #${order.orderNumber} has been delivered. Enjoy!`,
        data: { orderId: String(order._id), orderNumber: order.orderNumber },
      });
    }

    emitToAdmin(SOCKET_EVENTS.ORDER_UPDATED, { order });
    trackActivity({ label: `Order #${order.orderNumber} -> ${status}`, category: 'orders' });
    res.json({ status: 'success', data: { order } });
  } catch (err) {
    next(err);
  }
};

export const listPayouts = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payouts = await Payout.find({}).populate('seller', 'storeName').sort({ createdAt: -1 }).limit(100);
    res.json({ status: 'success', results: payouts.length, data: { payouts } });
  } catch (err) {
    next(err);
  }
};

export const processPayout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status: payoutStatus } = req.body;
    const payout = await Payout.findById(req.params.id).populate('seller');
    if (!payout) throw new NotFoundError('Payout not found');
    payout.status = payoutStatus;
    if (payoutStatus === 'completed') payout.processedAt = new Date();
    payout.processedBy = new mongoose.Types.ObjectId(req.user!.id);
    await payout.save();

    if (payoutStatus === 'completed') {
      const SellerWallet = (await import('../models/SellerWallet')).default;
      await SellerWallet.updateOne(
        { seller: payout.seller._id },
        { $inc: { pendingBalance: -payout.amount, totalWithdrawn: payout.amount } }
      );
    }

    await recordAudit(req.user!.id, 'payout.process', 'Payout', req.params.id, payoutStatus, req);

    const payoutSeller = payout.seller as any;
    if (payoutSeller?.user) {
      await notify({
        recipient: String(payoutSeller.user),
        recipientType: 'seller',
        sellerId: String(payoutSeller._id),
        type: 'payout_update',
        title: 'Payout updated',
        message: `Your payout of ${payout.amount} is now ${payoutStatus}.`,
        data: { payoutId: String(payout._id) },
      });
      emitToSeller(String(payoutSeller._id), SOCKET_EVENTS.PAYOUT_UPDATED, { payout });
    }
    emitToAdmin(SOCKET_EVENTS.PAYOUT_UPDATED, { payout });
    trackActivity({ label: `Payout ${payoutStatus} (${payout.amount})`, category: 'payouts' });
    res.json({ status: 'success', data: { payout } });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupon = await Coupon.create(req.body);
    await recordAudit(req.user!.id, 'coupon.create', 'Coupon', coupon._id.toString(), undefined, req);
    res.status(201).json({ status: 'success', data: { coupon } });
  } catch (err) {
    next(err);
  }
};

export const listCoupons = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await Coupon.find({}).populate('seller category product').sort({ createdAt: -1 });
    res.json({ status: 'success', results: coupons.length, data: { coupons } });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) throw new NotFoundError('Coupon not found');
    await recordAudit(req.user!.id, 'coupon.update', 'Coupon', req.params.id, undefined, req);
    res.json({ status: 'success', data: { coupon } });
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new NotFoundError('Coupon not found');
    await recordAudit(req.user!.id, 'coupon.delete', 'Coupon', req.params.id, coupon.code, req);
    res.json({ status: 'success', message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

export const createBanner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banner = await Banner.create(req.body);
    await recordAudit(req.user!.id, 'banner.create', 'Banner', (banner as any)._id.toString(), banner.title, req);
    res.status(201).json({ status: 'success', data: { banner } });
  } catch (err) {
    next(err);
  }
};

export const updateBanner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) throw new NotFoundError('Banner not found');
    await recordAudit(req.user!.id, 'banner.update', 'Banner', req.params.id, banner.title, req);
    res.json({ status: 'success', data: { banner } });
  } catch (err) {
    next(err);
  }
};

export const deleteBanner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) throw new NotFoundError('Banner not found');
    await recordAudit(req.user!.id, 'banner.delete', 'Banner', req.params.id, banner.title, req);
    res.json({ status: 'success', message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
};

export const listBanners = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banners = await Banner.find({}).sort({ order: 1 });
    res.json({ status: 'success', results: banners.length, data: { banners } });
  } catch (err) {
    next(err);
  }
};

export const listReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status: reviewStatus, productId } = req.query;
    const filter: Record<string, unknown> = {};
    if (reviewStatus) filter.status = reviewStatus;
    if (productId) filter.product = productId;
    const reviews = await Review.find(filter).populate('product', 'name').populate('customer', 'name').sort({ createdAt: -1 }).limit(100);
    res.json({ status: 'success', results: reviews.length, data: { reviews } });
  } catch (err) {
    next(err);
  }
};

export const moderateReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status: reviewStatus } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) throw new NotFoundError('Review not found');
    review.status = reviewStatus;
    await review.save();
    await recordAudit(req.user!.id, 'review.moderate', 'Review', req.params.id, reviewStatus, req);
    res.json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
};

export const getSettings = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ status: 'success', data: { settings } });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updates = { ...req.body };
    if (updates.smtp) delete (updates.smtp as any).password;
    if (updates.payment) delete (updates.payment as any).razorpaySecret;
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    Object.assign(settings, updates);
    await settings.save();
    await recordAudit(req.user!.id, 'settings.update', 'Settings', undefined, undefined, req);
    res.json({ status: 'success', data: { settings } });
  } catch (err) {
    next(err);
  }
};

export const getAuditLogs = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const logs = await AuditLog.find({}).populate('admin', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json({ status: 'success', results: logs.length, data: { logs } });
  } catch (err) {
    next(err);
  }
};

export const manageSupportTicket = (action: 'assign' | 'respond') => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await SupportTicket.findById(req.params.id);
      if (!ticket) throw new NotFoundError('Ticket not found');
      if (action === 'assign') {
        ticket.assignedTo = new mongoose.Types.ObjectId(req.user!.id);
        ticket.status = 'in_progress';
      } else if (action === 'respond') {
        ticket.messages.push({
          message: req.body.message,
          sender: new mongoose.Types.ObjectId(req.user!.id),
          senderType: 'admin',
          attachments: req.body.attachments || []
        } as any);
        ticket.status = req.body.status || ticket.status;
      }
      await ticket.save();
      await recordAudit(req.user!.id, `ticket.${action}`, 'SupportTicket', String(req.params.id), undefined, req);
      res.json({ status: 'success', data: { ticket } });
    } catch (err) {
      next(err);
    }
  };
};

export const listSupportTickets = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tickets = await SupportTicket.find({}).populate('createdBy').populate('assignedTo', 'name').sort({ createdAt: -1 }).limit(100);
    res.json({ status: 'success', results: tickets.length, data: { tickets } });
  } catch (err) {
    next(err);
  }
};

export const getLiveActivity = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { getActivityBuffer } = await import('../services/realtime.service');
    res.json({ status: 'success', data: { activity: getActivityBuffer() } });
  } catch (err) {
    next(err);
  }
};


