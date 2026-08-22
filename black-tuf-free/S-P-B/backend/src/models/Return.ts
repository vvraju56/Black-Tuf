import mongoose, { Schema, Document, Types } from 'mongoose';
import { ReturnStatus } from '../types/index';

export interface IReturnItem {
  orderItem: Types.ObjectId;
  product: Types.ObjectId;
  title: string;
  image: string;
  price: number;
  quantity: number;
  reason: string;
  description?: string;
  images?: string[];
  resolution: 'refund' | 'replace' | 'store_credit';
}

export interface IReturn extends Document<mongoose.Types.ObjectId> {
  order: Types.ObjectId;
  customer: Types.ObjectId;
  seller: Types.ObjectId;
  items: IReturnItem[];
  status: ReturnStatus;
  adminNote?: string;
  pickupScheduledAt?: Date;
  pickedUpAt?: Date;
  receivedAt?: Date;
  refundAmount?: number;
  refundId?: Types.ObjectId;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const returnItemSchema = new Schema<IReturnItem>(
  {
    orderItem: { type: Schema.Types.ObjectId, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    description: { type: String },
    images: [{ type: String }],
    resolution: { type: String, enum: ['refund', 'replace', 'store_credit'], required: true }
  },
  { _id: false }
);

const returnSchema = new Schema<IReturn>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    items: { type: [returnItemSchema], required: true },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'refund_processing', 'refunded'],
      default: 'requested'
    },
    adminNote: String,
    pickupScheduledAt: Date,
    pickedUpAt: Date,
    receivedAt: Date,
    refundAmount: Number,
    refundId: { type: Schema.Types.ObjectId, ref: 'Refund' },
    requestedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

returnSchema.index({ order: 1 });
returnSchema.index({ customer: 1 });
returnSchema.index({ seller: 1 });
returnSchema.index({ status: 1 });

const Return = mongoose.model<IReturn>('Return', returnSchema);
export default Return;



