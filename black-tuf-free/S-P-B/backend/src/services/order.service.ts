import mongoose, { Types } from 'mongoose';
import Cart from '../models/Cart';
import Product from '../models/Product';
import Order from '../models/Order';
import Coupon from '../models/Coupon';
import Settings from '../models/Settings';
import SellerWallet from '../models/SellerWallet';
import { NotFoundError, BadRequestError } from '../utils/ApiError';
import { generateOrderNumber } from '../utils/slug';
import { OrderStatus } from '../types/index';
import { emitToSeller, emitToAdmin, emitToProduct, trackActivity } from './realtime.service';
import { SOCKET_EVENTS } from '../constants/socketEvents';

interface CartItemWithProduct {
  product: any;
  variant?: { name: string; value: string };
  quantity: number;
  price: number;
  compareAtPrice?: number;
}

interface CouponValidation {
  valid: boolean;
  coupon?: any;
  discount: number;
}

export const validateCoupon = async (
  couponCode: string,
  userId: string,
  subtotal: number,
  sellerId?: string,
  productId?: string,
  categoryId?: string
): Promise<CouponValidation> => {
  if (!couponCode) return { valid: false, discount: 0 };

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
  if (!coupon) return { valid: false, discount: 0 };

  const now = new Date();
  if (now < coupon.startDate || now > coupon.expiryDate) return { valid: false, discount: 0 };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { valid: false, discount: 0 };

  if (coupon.scope === 'seller' && sellerId && String(coupon.seller) !== sellerId) return { valid: false, discount: 0 };
  if (coupon.scope === 'product' && productId && String(coupon.product) !== productId) return { valid: false, discount: 0 };
  if (coupon.scope === 'category' && categoryId && String(coupon.category) !== categoryId) return { valid: false, discount: 0 };

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) return { valid: false, discount: 0 };

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((subtotal * coupon.value) / 100);
  } else {
    discount = Math.min(coupon.value, subtotal);
  }
  if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

  return { valid: true, coupon, discount };
};

export const buildOrdersFromCart = async (
  userId: string,
  shippingAddress: any,
  paymentInfo: any,
  couponCode?: string
) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new BadRequestError('Cart is empty');

  const products = cart.items.map((item: any) => item.product).filter((p: any) => p);
  const productMap = new Map(products.map((p: any) => [String(p._id), p]));

  const sellerGroups: Record<string, CartItemWithProduct[]> = {};
  const unavailableProducts: string[] = [];

  for (const item of cart.items) {
    const product = productMap.get(String(item.product));
    if (!product) continue;
    if (product.status !== 'approved' && product.status !== 'published') {
      unavailableProducts.push(product.name);
      continue;
    }
    if (product.stock < item.quantity) continue;
    const sellerId = String(product.seller);
    if (!sellerGroups[sellerId]) sellerGroups[sellerId] = [];
    sellerGroups[sellerId].push({
      product,
      variant: item.variant as any,
      quantity: item.quantity,
      price: item.price,
      compareAtPrice: item.compareAtPrice
    });
  }

  if (unavailableProducts.length > 0) {
    throw new BadRequestError(`Unavailable products: ${unavailableProducts.join(', ')}`);
  }

  const validSellerIds = Object.keys(sellerGroups);
  if (validSellerIds.length === 0) throw new BadRequestError('No valid products in cart');

  const settings = await Settings.findOne().lean();
  const globalCommission = settings?.globalCommission || 10;
  const shippingFeePerSeller = settings?.shipping?.defaultFee || 50;
  const freeThreshold = settings?.shipping?.freeShippingThreshold || 499;
  const taxRate = settings?.defaultTaxRate || 18;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems: any[] = [];
    const sellerOrderIds: string[] = [];
    let grandTotal = 0;
    let grandSubtotal = 0;
    let grandShipping = 0;
    let grandTax = 0;
    let grandDiscount = 0;
    let coupon: any = null;

    const createdOrders: { id: string; sellerId: string; orderNumber: string; total: number }[] = [];
    const stockUpdates: { productId: string; qty: number }[] = [];

    const sellers = await (await import('../models/Seller')).default.find({ _id: { $in: validSellerIds } }).select('commissionRate').lean();
    const sellerCommissionMap = new Map(sellers.map((s: any) => [String(s._id), Number(s.commissionRate) || globalCommission]));

    for (const sellerIdStr of validSellerIds) {
      const items = sellerGroups[sellerIdStr];
      const sellerObj = new Types.ObjectId(sellerIdStr);
      const sellerSubtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);
      const sellerTax = sellerSubtotal * (taxRate / 100);
      const sellerShipping = sellerSubtotal >= freeThreshold ? 0 : shippingFeePerSeller;

      let sellerDiscount = 0;
      if (couponCode) {
        const catId = items[0].product.category ? new Types.ObjectId(items[0].product.category).toString() : undefined;
        const cd = await validateCoupon(couponCode, userId, sellerSubtotal, sellerIdStr, undefined, catId);
        if (cd.valid) {
          sellerDiscount = cd.discount;
          coupon = cd.coupon;
        }
      }

      const sellerTotal = sellerSubtotal + sellerShipping + sellerTax - sellerDiscount;
      const commissionRate = sellerCommissionMap.get(sellerIdStr) || globalCommission;
      const sellerCommission = (sellerTotal * commissionRate) / 100;
      const sellerEarning = sellerTotal - sellerCommission;

      const orderItemList = items.map((it) => ({
        product: it.product._id,
        variant: it.variant,
        title: it.product.name,
        image: it.product.images?.[0] || '',
        price: it.price,
        quantity: it.quantity,
        total: it.price * it.quantity,
        seller: sellerObj,
        tax: (it.price * it.quantity) * (taxRate / 100)
      }));

      orderItems.push(...orderItemList);
      grandSubtotal += sellerSubtotal;
      grandShipping += sellerShipping;
      grandTax += sellerTax;
      grandDiscount += sellerDiscount;
      grandTotal += sellerTotal;

      const order = await Order.create(
        [
          {
            orderNumber: generateOrderNumber('S'),
            parentOrder: undefined,
            isParent: false,
            customer: userId,
            seller: sellerObj,
            items: orderItemList,
            shippingAddress,
            billingAddress: shippingAddress,
            payment: { ...paymentInfo },
            subtotal: sellerSubtotal,
            shippingFee: sellerShipping,
            tax: sellerTax,
            discount: sellerDiscount,
            total: sellerTotal,
            commission: sellerCommission,
            sellerEarning,
            status: 'pending' as OrderStatus
          }
        ],
        { session }
      );
      sellerOrderIds.push(String((order as any)[0]._id));
      createdOrders.push({
        id: String((order as any)[0]._id),
        sellerId: sellerIdStr,
        orderNumber: (order as any)[0].orderNumber,
        total: sellerTotal
      });

      for (const it of items) {
        await Product.updateOne({ _id: it.product._id }, { $inc: { stock: -it.quantity } }, { session });
        stockUpdates.push({ productId: String(it.product._id), qty: it.quantity });
      }

      await SellerWallet.updateOne(
        { seller: sellerObj },
        {
          $inc: {
            pendingBalance: sellerEarning,
            totalEarned: sellerEarning
          },
          $push: {
            transactions: {
              type: 'credit',
              amount: sellerEarning,
              status: 'pending',
              reference: (order as any)[0]._id,
              referenceType: 'order',
              description: `Order ${(order as any)[0].orderNumber} earnings`
            }
          }
        },
        { upsert: true, session }
      );
    }

    const parentOrder = await Order.create(
      [
        {
          orderNumber: generateOrderNumber('ORD'),
          isParent: true,
          customer: userId,
          seller: null,
          items: orderItems,
          shippingAddress,
          billingAddress: shippingAddress,
          payment: { ...paymentInfo },
          subtotal: grandSubtotal,
          shippingFee: grandShipping,
          tax: grandTax,
          discount: grandDiscount,
          total: grandTotal,
          commission: sellerOrderIds.reduce((sum, _id) => sum + 0, 0),
          sellerEarning: grandTotal,
          status: 'pending' as OrderStatus
        }
      ],
      { session }
    );

    await Order.updateMany(
      { _id: { $in: sellerOrderIds } },
      { $set: { parentOrder: parentOrder[0]._id } },
      { session }
    );

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Emit real-time events only after the transaction succeeds.
    try {
      for (const so of createdOrders) {
        emitToSeller(so.sellerId, SOCKET_EVENTS.ORDER_CREATED, {
          orderId: so.id,
          orderNumber: so.orderNumber,
          total: so.total,
        });
      }
      emitToAdmin(SOCKET_EVENTS.ORDER_CREATED, {
        orderId: (parentOrder as any)[0]._id,
        orderNumber: (parentOrder as any)[0].orderNumber,
        total: grandTotal,
      });
      for (const su of stockUpdates) {
        emitToProduct(su.productId, SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, {
          productId: su.productId,
          decrement: su.qty,
        });
      }
      trackActivity({ label: `New order #${(parentOrder as any)[0].orderNumber} (${grandTotal})`, category: 'orders' });
    } catch (emitErr) {
      console.error('[order] realtime emit failed:', (emitErr as Error).message);
    }

    return {
      parentOrderId: (parentOrder as any)[0]._id,
      grandTotal,
      parentOrderNumber: (parentOrder as any)[0].orderNumber,
      createdOrders
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


