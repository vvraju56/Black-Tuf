import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document<mongoose.Types.ObjectId> {
  participants: {
    user: Types.ObjectId;
    role: 'customer' | 'seller' | 'admin';
    seller?: Types.ObjectId;
  }[];
  type: 'product' | 'order' | 'general';
  product?: Types.ObjectId;
  order?: Types.ObjectId;
  lastMessage?: {
    text: string;
    sender: Types.ObjectId;
    at: Date;
  };
  unreadCount?: {
    user: Types.ObjectId;
    count: number;
  }[];
  isReported?: boolean;
  reportReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['customer', 'seller', 'admin'], required: true },
        seller: { type: Schema.Types.ObjectId, ref: 'Seller' },
      },
    ],
    type: { type: String, enum: ['product', 'order', 'general'], default: 'general' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    lastMessage: {
      text: String,
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      at: Date,
    },
    unreadCount: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 0 },
      },
    ],
    isReported: { type: Boolean, default: false },
    reportReason: String,
  },
  { timestamps: true }
);

conversationSchema.index({ 'participants.user': 1, updatedAt: -1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ order: 1 });

const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
export default Conversation;
