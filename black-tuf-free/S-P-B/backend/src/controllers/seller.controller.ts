import type { Request, Response, NextFunction } from 'express';
import Seller from '../models/Seller';
import SellerVerification from '../models/SellerVerification';
import SellerWallet from '../models/SellerWallet';
import Product from '../models/Product';
import Order from '../models/Order';
import Payout from '../models/Payout';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { uploadToCloudinary } from '../utils/upload';
import mongoose, { Types } from 'mongoose';
import Review from '../models/Review';
import { releaseSellerEarnings } from '../services/wallet.service';
import { emitToAdmin, emitToOrder, emitToUser, emitToSeller, notify, trackActivity } from '../services/realtime.service';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const getSellerProfile = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const seller = await Seller.findOne({ user: req.user.id }).populate('user', 'name email phone avatar');
    if (!seller) throw new NotFoundError('Seller not found');
    res.json({ status: 'success', data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const updateSellerProfile = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { storeName, storeDescription, businessType, businessAddress, phone, taxId, bankDetails } = req.body;
    const seller = await Seller.findOneAndUpdate(
      { user: req.user.id },
      { storeName, storeDescription, businessType, businessAddress, phone, taxId, ...(bankDetails ? { bankDetails } : {}) },
      { new: true, runValidators: true }
    );
    if (!seller) throw new NotFoundError('Seller not found');
    res.json({ status: 'success', data: { seller } });
  } catch (err) {
    next(err);
  }
};

export const submitVerification = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user.sellerId;
    const files = (req as any).files as any;
    const documents: any[] = [];

    if (files?.documents) {
      for (const file of Array.isArray(files.documents) ? files.documents : [files.documents]) {
        const upload = await uploadToCloudinary(file as Express.Multer.File, 'seller_docs');
        documents.push({
          type: file.originalname.split(' ').pop()?.split('.')[0] || 'other',
          fileUrl: upload.url,
          publicId: upload.publicId
        });
      }
    }

    let verification = await SellerVerification.findOne({ seller: sellerId });
    if (!verification) {
      verification = await SellerVerification.create({
        seller: sellerId,
        documents,
        submittedAt: new Date()
      });
    } else {
      verification.documents.push(...documents);
      verification.submittedAt = new Date();
      verification.adminNote = undefined;
      await verification.save();
    }

    await Seller.findByIdAndUpdate(sellerId, { status: 'submitted' });

    const sellerDoc = await Seller.findById(sellerId).select('user storeName').populate('user', 'name');
    await notify({
      recipientType: 'admin',
      type: 'seller_verification',
      title: 'Seller verification submitted',
      message: `${sellerDoc?.storeName || 'A seller'} submitted verification documents.`,
      data: { sellerId },
    });
    emitToAdmin(SOCKET_EVENTS.SELLER_VERIFICATION_SUBMITTED, { sellerId, storeName: sellerDoc?.storeName, verification });
    trackActivity({ label: `Seller verification submitted (${sellerDoc?.storeName})`, category: 'sellers' });

    res.json({ status: 'success', data: { verification } });
  } catch (err) {
    next(err);
  }
};

export const getSellerStats = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user.sellerId;
    const sellerObj = new Types.ObjectId(sellerId);

    const [totalProducts, totalOrders, pendingOrders, totalEarnings] = await Promise.all([
      Product.countDocuments({ seller: sellerObj }),
      Order.countDocuments({ seller: sellerObj, 'payment.status': 'paid' }),
      Order.countDocuments({ seller: sellerObj, status: { $in: ['pending', 'confirmed', 'processing', 'packed'] } }),
      Order.aggregate([{ $match: { seller: sellerObj, 'payment.status': 'paid' } }, { $group: { _id: null, total: { $sum: '$sellerEarning' } } }])
    ]);

    const wallet = await SellerWallet.findOne({ seller: sellerObj });

    const earningsAgg = await Order.aggregate([
      { $match: { seller: sellerObj, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$sellerEarning' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        stats: {
          totalProducts,
          totalOrders,
          pendingOrders,
          totalEarnings: totalEarnings[0]?.total || 0,
          availableBalance: wallet?.availableBalance || 0,
          pendingBalance: wallet?.pendingBalance || 0
        },
        dailySales: earningsAgg
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getSellerProducts = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user.sellerId;
    const { page = '1', limit = '10', status } = req.query;
    const filter: Record<string, unknown> = { seller: sellerId };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10)));

    const [products, count] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    res.json({
      status: 'success',
      results: products.length,
      pagination: { page: pageNum, limit: limitNum, total: count, totalPages: Math.ceil(count / limitNum) },
      data: { products }
    });
  } catch (err) {
    next(err);
  }
};

export const getSellerOrders = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user.sellerId;
    const { page = '1', limit = '10', status } = req.query;
    const filter: Record<string, unknown> = { seller: sellerId };
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10)));

    const [orders, count] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('customer', 'name email')
        .populate('items.product', 'name images'),
      Order.countDocuments(filter)
    ]);

    res.json({
      status: 'success',
      results: orders.length,
      pagination: { page: pageNum, limit: limitNum, total: count, totalPages: Math.ceil(count / limitNum) },
      data: { orders }
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderItemStatus = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, trackingNumber, courier } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new NotFoundError('Order not found');
    if (String(order.seller) !== req.user.sellerId) throw new BadRequestError('Not your order');

    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['packed'],
      packed: ['shipped'],
      shipped: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: ['return_requested'],
      return_requested: ['returned']
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status)) throw new BadRequestError(`Cannot transition from ${order.status} to ${status}`);

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courier) order.courier = courier;
    await order.save();

    if (status === 'delivered' && order.payment.status === 'paid') {
      await releaseSellerEarnings(order);
    }

    emitToOrder(String(order._id), SOCKET_EVENTS.ORDER_UPDATED, { order });
    emitToUser(String(order.customer), SOCKET_EVENTS.ORDER_UPDATED, { order });
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

export const getSellerEarnings = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user.sellerId;
    const wallet = await SellerWallet.findOne({ seller: sellerId }) || await SellerWallet.create({ seller: sellerId });

    const [payouts] = await Promise.all([
      Payout.find({ seller: sellerId, status: { $in: ['pending', 'processing'] } }).sort({ createdAt: -1 }).limit(10)
    ]);

    const completedPayouts = await Payout.find({ seller: sellerId, status: 'completed' }).sort({ createdAt: -1 }).limit(20);

    res.json({
      status: 'success',
      data: { wallet, pendingPayouts: payouts, completedPayouts }
    });
  } catch (err) {
    next(err);
  }
};

export const requestPayout = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user.sellerId;
    const { amount, method } = req.body;
    const wallet = await SellerWallet.findOne({ seller: sellerId });
    if (!wallet) throw new NotFoundError('Wallet not found');

    if (amount <= 0) throw new BadRequestError('Invalid payout amount');
    if (amount > wallet.availableBalance) throw new BadRequestError('Insufficient available balance');

    const seller = await Seller.findOne({ user: req.user.id }).select('+bankDetails');
    const payout = await Payout.create({
      seller: sellerId,
      amount,
      method: method || 'bank_transfer',
      status: 'pending',
      bankDetails: seller?.bankDetails,
      requestedBy: req.user.id,
      requestedAt: new Date()
    });

    wallet.availableBalance -= amount;
    wallet.pendingBalance += amount;
    wallet.transactions.push({
      type: 'debit',
      amount,
      status: 'pending',
      reference: payout._id,
      referenceType: 'payout',
      description: `Payout ${payout._id}`
    } as any);
    await wallet.save();

    await notify({
      recipientType: 'admin',
      type: 'payout_request',
      title: 'New payout request',
      message: `Payout of ${amount} requested by ${seller?.storeName || 'a seller'}.`,
      data: { payoutId: String(payout._id) },
    });
    emitToAdmin(SOCKET_EVENTS.PAYOUT_CREATED, { payout });
    trackActivity({ label: `Payout requested (${amount})`, category: 'payouts' });

    res.status(201).json({ status: 'success', message: 'Payout requested', data: { payout } });
  } catch (err) {
    next(err);
  }
};

export const getProductReviews = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sellerId = req.user.sellerId;
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product not found');
    if (String(product.seller) !== sellerId) throw new BadRequestError('Not your product');

    const reviews = await Review.find({ product: productId }).populate('customer', 'name avatar').sort({ createdAt: -1 });
    res.json({ status: 'success', results: reviews.length, data: { reviews } });
  } catch (err) {
    next(err);
  }
};

export const addSellerResponse = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { text } = req.body;
    const review = await Review.findById(reviewId).populate<{ product: { seller: any } }>('product', 'seller');
    if (!review) throw new NotFoundError('Review not found');
    if (String(review.product.seller) !== req.user.sellerId) throw new BadRequestError('Not your product review');

    review.sellerResponse = { text, respondedAt: new Date() };
    await review.save();
    res.json({ status: 'success', data: { review } });
  } catch (err) {
    next(err);
  }
};


