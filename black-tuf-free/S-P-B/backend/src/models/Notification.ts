import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType =
  | 'order_confirmation'
  | 'payment_success'
  | 'payment_failed'
  | 'order_shipped'
  | 'order_delivered'
  | 'return_update'
  | 'refund_update'
  | 'seller_approval'
  | 'product_approval'
  | 'payout_update'
  | 'review_received'
  | 'coupon'
  | 'announcement';

export interface INotification extends Document<mongoose.Types.ObjectId> {
  recipient?: Types.ObjectId;
  recipientType: 'user' | 'seller' | 'admin';
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientType: { type: String, enum: ['user', 'seller', 'admin'], required: true },
    title: { type: String, required: true, maxlength: [200, 'Title too long'] },
    message: { type: String, required: true, maxlength: [1000, 'Message too long'] },
    type: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;



