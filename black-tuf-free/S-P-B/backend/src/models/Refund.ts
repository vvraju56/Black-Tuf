import mongoose, { Schema, Document, Types } from 'mongoose';
import { PayoutStatus } from '../types/index';

export interface IRefund extends Document<mongoose.Types.ObjectId> {
  order: Types.ObjectId;
  returnRequest?: Types.ObjectId;
  customer: Types.ObjectId;
  seller: Types.ObjectId;
  amount: number;
  currency: string;
  reason: string;
  method: 'original' | 'wallet' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  requestedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  requestedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IRefund>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    returnRequest: { type: Schema.Types.ObjectId, ref: 'Return' },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller' },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    reason: { type: String, required: true },
    method: { type: String, enum: ['original', 'wallet', 'manual'], required: true },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    transactionId: String,
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date
  },
  { timestamps: true }
);

refundSchema.index({ order: 1 });
refundSchema.index({ customer: 1 });
refundSchema.index({ status: 1 });

const Refund = mongoose.model<IRefund>('Refund', refundSchema);
export default Refund;



