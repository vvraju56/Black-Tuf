import mongoose, { Schema, Document, Types } from 'mongoose';
import { TicketStatus, TicketCategory } from '../types/index';

export interface ITicketMessage {
  message: string;
  sender: Types.ObjectId;
  senderType: 'customer' | 'seller' | 'admin';
  attachments?: string[];
  createdAt: Date;
}

export interface ISupportTicket extends Document<mongoose.Types.ObjectId> {
  ticketId: string;
  createdBy: Types.ObjectId;
  createdByType: 'customer' | 'seller';
  category: TicketCategory;
  subject: string;
  description: string;
  attachments?: string[];
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: Types.ObjectId;
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    message: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, required: true, refPath: 'senderType' },
    senderType: { type: String, enum: ['customer', 'seller', 'admin'], required: true },
    attachments: [{ type: String }]
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, refPath: 'createdByType', required: true },
    createdByType: { type: String, enum: ['customer', 'seller'], required: true },
    category: { type: String, enum: ['general', 'order', 'payment', 'product', 'account', 'technical'], default: 'general' },
    subject: { type: String, required: true, trim: true, maxlength: [200, 'Subject too long'] },
    description: { type: String, required: true, maxlength: [5000, 'Description too long'] },
    attachments: [{ type: String }],
    status: { type: String, enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: { type: [ticketMessageSchema], default: [] }
  },
  { timestamps: true }
);

supportTicketSchema.index({ ticketId: 1 });
supportTicketSchema.index({ createdBy: 1, createdByType: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ assignedTo: 1 });

const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', supportTicketSchema);

import User from './User';
import Seller from './Seller';

mongoose.model('customer', User.schema, 'users');
mongoose.model('seller', Seller.schema, 'sellers');

export default SupportTicket;



