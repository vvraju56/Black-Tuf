import mongoose, { Schema, Document, Types } from 'mongoose';
import { PayoutStatus } from '../types/index';

export interface IPayout extends Document<mongoose.Types.ObjectId> {
  seller: Types.ObjectId;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: 'bank_transfer' | 'cheque' | 'wallet';
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  transactionId?: string;
  requestedBy?: Types.ObjectId;
  processedBy?: Types.ObjectId;
  requestedAt: Date;
  processedAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payoutSchema = new Schema<IPayout>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'rejected'],
      default: 'pending'
    },
    method: { type: String, enum: ['bank_transfer', 'cheque', 'wallet'], default: 'bank_transfer' },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String
    },
    transactionId: String,
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    note: String
  },
  { timestamps: true }
);

payoutSchema.index({ seller: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ requestedAt: -1 });

const Payout = mongoose.model<IPayout>('Payout', payoutSchema);
export default Payout;



