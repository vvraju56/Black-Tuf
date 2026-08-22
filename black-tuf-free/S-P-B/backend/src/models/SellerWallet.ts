import mongoose, { Schema, Document, Types } from 'mongoose';

export type SellerEarningStatus = 'available' | 'pending' | 'processing' | 'paid' | 'failed' | 'reversed';

export interface ISellerWalletTransaction {
  type: 'credit' | 'debit';
  amount: number;
  status: SellerEarningStatus;
  reference: Types.ObjectId;
  referenceType: 'order' | 'payout' | 'refund' | 'adjustment' | 'commission';
  description: string;
  createdAt: Date;
}

export interface ISellerWallet extends Document<mongoose.Types.ObjectId> {
  seller: Types.ObjectId;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  transactions: ISellerWalletTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<ISellerWalletTransaction>(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['available', 'pending', 'processing', 'paid', 'failed', 'reversed'], default: 'available' },
    reference: { type: Schema.Types.ObjectId, required: true },
    referenceType: { type: String, enum: ['order', 'payout', 'refund', 'adjustment', 'commission'], required: true },
    description: { type: String, required: true }
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const sellerWalletSchema = new Schema<ISellerWallet>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
    availableBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    totalEarned: { type: Number, default: 0, min: 0 },
    totalWithdrawn: { type: Number, default: 0, min: 0 },
    transactions: { type: [walletTransactionSchema], default: [] }
  },
  { timestamps: true }
);

sellerWalletSchema.index({ seller: 1 });

const SellerWallet = mongoose.model<ISellerWallet>('SellerWallet', sellerWalletSchema);
export default SellerWallet;



