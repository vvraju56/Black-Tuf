import mongoose, { Schema, Document } from 'mongoose';
import { SellerStatus } from '../types/index';

export interface ISellerBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
}

export interface ISeller extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  storeName: string;
  storeDescription: string;
  businessType?: string;
  businessAddress?: string;
  phone?: string;
  taxId?: string;
  status: SellerStatus;
  commissionRate: number;
  bankDetails?: ISellerBankDetails;
  rating?: number;
  totalSales?: number;
  reviewCount?: number;
  isApproved: boolean;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sellerSchema = new Schema<ISeller>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: [true, 'Store name is required'], trim: true, maxlength: [100, 'Store name too long'] },
    storeDescription: { type: String, required: true, maxlength: [1000, 'Description too long'] },
    businessType: { type: String, enum: ['individual', 'sole_proprietorship', 'partnership', 'private_limited', 'llp', 'other'], trim: true },
    businessAddress: { type: String, trim: true },
    phone: { type: String, trim: true },
    taxId: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'suspended'],
      default: 'draft'
    },
    commissionRate: { type: Number, default: 10, min: 0, max: 100 },
    bankDetails: {
      accountHolderName: { type: String, select: false },
      accountNumber: { type: String, select: false },
      ifscCode: { type: String, select: false },
      bankName: { type: String, select: false }
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalSales: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
    rejectionReason: { type: String }
  },
  { timestamps: true }
);

sellerSchema.index({ user: 1 });
sellerSchema.index({ status: 1 });
sellerSchema.index({ isApproved: 1 });
sellerSchema.index({ storeName: 1 });

const Seller = mongoose.model<ISeller>('Seller', sellerSchema);
export default Seller;



