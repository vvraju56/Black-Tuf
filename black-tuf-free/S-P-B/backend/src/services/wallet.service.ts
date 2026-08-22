import mongoose, { Types } from 'mongoose';
import SellerWallet from '../models/SellerWallet';
import Order, { IOrder } from '../models/Order';

export const releaseSellerEarnings = async (order: any): Promise<void> => {
  const amount = Number(order.sellerEarning) || 0;
  if (amount <= 0) return;
  const orderId = order._id;

  const wallet = await SellerWallet.findOne({ seller: order.seller });
  if (!wallet) return;

  await SellerWallet.updateOne(
    { seller: order.seller },
    { $inc: { availableBalance: amount, pendingBalance: -Math.max(0, amount) } }
  );

  await SellerWallet.updateOne(
    { seller: order.seller, transactions: { $elemMatch: { reference: orderId, referenceType: 'order' } } },
    { $set: { 'transactions.$.status': 'available' } }
  );
};

export const deductFromWallet = async (
  sellerId: string | Types.ObjectId,
  amount: number,
  reference: Types.ObjectId | string,
  referenceType: 'order' | 'payout' | 'refund' | 'adjustment' | 'commission',
  description: string
): Promise<void> => {
  const amt = Number(amount) || 0;
  if (amt <= 0) return;

  const wallet = await SellerWallet.findOne({ seller: sellerId });
  if (!wallet) return;

  const available = Number(wallet.availableBalance) || 0;
  const pending = Number(wallet.pendingBalance) || 0;

  const fromAvailable = Math.min(available, amt);
  let remaining = amt - fromAvailable;
  const fromPending = Math.min(pending, remaining);

  await SellerWallet.updateOne(
    { seller: sellerId },
    {
      $inc: {
        availableBalance: -fromAvailable,
        pendingBalance: -fromPending
      },
      $push: {
        transactions: {
          type: 'debit',
          amount: amt,
          status: 'reversed',
          reference: new Types.ObjectId(reference as any),
          referenceType,
          description
        }
      }
    }
  );

  await SellerWallet.updateOne(
    { seller: sellerId, transactions: { $elemMatch: { reference, referenceType: 'order' } } },
    { $set: { 'transactions.$.status': 'reversed' } }
  );
};

export const revertOrderEarnings = async (order: IOrder): Promise<void> => {
  if (!order || order.isParent) return;
  const amount = Number(order.sellerEarning) || 0;
  if (amount <= 0) return;
  await deductFromWallet(String(order.seller), amount, order._id, 'refund', `Earnings reversed for order ${order.orderNumber}`);
};

export const getOrderItemProductIds = (order: IOrder): string[] => {
  return order.items.map((it) => String(it.product));
};
