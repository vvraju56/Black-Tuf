import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../types/index';

export interface IOrderItem {
  product: Types.ObjectId;
  variant?: { name: string; value: string };
  title: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
  seller: Types.ObjectId;
  tax: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IPaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  paidAt?: Date;
}

export interface IOrder extends Document<mongoose.Types.ObjectId> {
  orderNumber: string;
  parentOrder?: Types.ObjectId;
  isParent: boolean;
  customer: Types.ObjectId;
  seller: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  payment: IPaymentInfo;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  commission: number;
  sellerEarning: number;
  status: OrderStatus;
  cancellation?: {
    cancelledBy?: Types.ObjectId;
    reason?: string;
    cancelledAt?: Date;
  };
  trackingNumber?: string;
  courier?: string;
  shippingProvider?: string;
  deliveryEstimate?: string;
  returnInfo?: {
    requested: boolean;
    status: string;
    returnId?: Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { name: String, value: String },
    title: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    total: { type: Number, required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    tax: { type: Number, default: 0 }
  },
  { _id: false }
);

const paymentInfoSchema = new Schema<IPaymentInfo>(
  {
    method: { type: String, enum: ['razorpay', 'cod', 'wallet', 'bank_transfer'], required: true },
    status: { type: String, enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'], required: true, default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    paidAt: { type: Date }
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    parentOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    isParent: { type: Boolean, default: false },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    billingAddress: {
      fullName: String, phone: String, addressLine1: String, addressLine2: String, city: String, state: String, postalCode: String, country: String
    },
    payment: { type: paymentInfoSchema, required: true },
    subtotal: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    commission: { type: Number, required: true, default: 0 },
    sellerEarning: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded'],
      default: 'pending'
    },
    cancellation: {
      cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      cancelledAt: Date
    },
    trackingNumber: String,
    courier: String,
    shippingProvider: String,
    deliveryEstimate: String,
    returnInfo: {
      requested: { type: Boolean, default: false },
      status: String,
      returnId: { type: Schema.Types.ObjectId, ref: 'Return' }
    }
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ parentOrder: 1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;



