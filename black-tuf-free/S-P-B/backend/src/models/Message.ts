import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document<mongoose.Types.ObjectId> {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  senderType: 'customer' | 'seller' | 'admin';
  text?: string;
  attachment?: { url: string; type: string };
  readBy: Types.ObjectId[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderType: { type: String, enum: ['customer', 'seller', 'admin'], required: true },
    text: { type: String, maxlength: [4000, 'Message too long'] },
    attachment: {
      url: String,
      type: { type: String },
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
