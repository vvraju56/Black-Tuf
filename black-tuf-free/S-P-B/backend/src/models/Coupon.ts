import mongoose, { Schema, Document, Types } from 'mongoose';
import { CouponType, CouponScope } from '../types/index';

export interface ICoupon extends Document<mongoose.Types.ObjectId> {
  code: string;
  type: CouponType;
  value: number;
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate: Date;
  expiryDate: Date;
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  scope: CouponScope;
  seller?: Types.ObjectId;
  product?: Types.ObjectId;
  category?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: [true, 'Coupon code is required'], unique: true, trim: true, uppercase: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    description: { type: String, maxlength: [300, 'Description too long'] },
    minOrderValue: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, min: 1, default: 1 },
    scope: { type: String, enum: ['global', 'seller', 'product', 'category'], required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ scope: 1, seller: 1 });
couponSchema.index({ isActive: 1, startDate: 1, expiryDate: 1 });
couponSchema.index({ category: 1 });
couponSchema.index({ product: 1 });

const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;



