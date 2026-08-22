import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Order from '../models/Order';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import { emitToConversation, emitToSeller, emitToUser, trackActivity, notify } from '../services/realtime.service';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/ApiError';

interface AuthRequest extends Request {
  user?: { id: string; role: string; sellerId?: string };
}

const conversationForUser = async (conversationId: string, userId: string): Promise<any> => {
  const conversation = await Conversation.findById(conversationId).populate('participants.user', 'name email avatar');
  if (!conversation) throw new NotFoundError('Conversation not found');
  const isMember = conversation.participants.some((p) => String(p.user) === userId);
  if (!isMember) throw new ForbiddenError('Not a participant of this conversation');
  return conversation;
};

export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sellerId, productId, orderId } = req.body;
    if (!sellerId && !orderId) throw new BadRequestError('A seller or order reference is required');

    let seller = sellerId;
    let order: any;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) throw new NotFoundError('Order not found');
      if (String(order.customer) !== req.user!.id && req.user!.role !== 'admin') {
        throw new ForbiddenError('Not your order');
      }
      seller = String(order.seller);
    }

    if (seller && req.user!.role === 'seller' && req.user!.sellerId && String(seller) === req.user!.sellerId) {
      throw new BadRequestError('Cannot chat with yourself');
    }

    const query: Record<string, unknown> = {
      participants: { $all: [{ $elemMatch: { user: req.user!.id } }, { $elemMatch: { user: seller ? new mongoose.Types.ObjectId(seller) : new mongoose.Types.ObjectId(order.customer) } }] },
    };
    if (orderId) query.order = order._id;
    if (productId) query.product = productId;

    let conversation = await Conversation.findOne(query);
    if (!conversation) {
      let otherUser: mongoose.Types.ObjectId;
      if (order) {
        otherUser = order.customer;
      } else {
        const Seller = (await import('../models/Seller')).default;
        const sellerDoc = await Seller.findById(seller).select('user');
        if (!sellerDoc) throw new NotFoundError('Seller not found');
        otherUser = sellerDoc.user;
      }
      conversation = await Conversation.create({
        participants: [
          { user: req.user!.id, role: req.user!.role, ...(req.user!.role === 'seller' ? { seller: req.user!.sellerId } : {}) },
          { user: otherUser, role: req.user!.role === 'seller' ? 'customer' : 'seller', seller: seller ? new mongoose.Types.ObjectId(seller) : undefined },
        ],
        type: orderId ? 'order' : productId ? 'product' : 'general',
        product: productId,
        order: orderId,
      });
      if (conversation.participants.length === 2) {
        const other = conversation.participants[1];
        emitToUser(String(other.user), SOCKET_EVENTS.CHAT_CONVERSATION_CREATED, { conversation });
      }
    }

    const populated = await conversation.populate('participants.user', 'name email avatar');
    res.status(201).json({ status: 'success', data: { conversation: populated } });
  } catch (err) {
    next(err);
  }
};

export const getMyConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversations = await Conversation.find({ 'participants.user': req.user!.id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate('participants.user', 'name email avatar')
      .populate('product', 'name images')
      .populate('order', 'orderNumber');

    const result = conversations.map((c: any) => {
      const unread = c.unreadCount?.find((u: any) => String(u.user) === req.user!.id)?.count || 0;
      const partner = c.participants.find((p: any) => String(p.user) !== req.user!.id);
      return { ...c.toObject(), unread, partner };
    });

    res.json({ status: 'success', results: result.length, data: { conversations: result } });
  } catch (err) {
    next(err);
  }
};

export const getConversationMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await conversationForUser(req.params.id, req.user!.id);
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '30', 10)));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: req.params.id, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name avatar'),
      Message.countDocuments({ conversation: req.params.id, isDeleted: { $ne: true } }),
    ]);

    messages.reverse();
    res.json({ status: 'success', pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, data: { messages } });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversation = await conversationForUser(req.params.id, req.user!.id);
    const { text, attachment } = req.body;
    if (!text && !attachment) throw new BadRequestError('Message text or attachment is required');

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user!.id,
      senderType: req.user!.role,
      text: text || '',
      attachment: attachment || undefined,
      readBy: [req.user!.id],
    });

    conversation.lastMessage = { text: text || (attachment ? '📎 Attachment' : ''), sender: req.user!.id, at: new Date() };
    for (const p of conversation.participants) {
      if (String(p.user) !== req.user!.id) {
        const idx = conversation.unreadCount?.findIndex((u) => String(u.user) === String(p.user));
        if (idx !== undefined && idx >= 0) conversation.unreadCount![idx].count += 1;
        else (conversation.unreadCount = conversation.unreadCount || []).push({ user: p.user, count: 1 });
      }
    }
    await conversation.save();

    const payload = {
      message,
      conversationId: conversation._id.toString(),
      order: conversation.order,
    };

    emitToConversation(conversation._id.toString(), SOCKET_EVENTS.MESSAGE_NEW, payload);

    const partner = conversation.participants.find((p) => String(p.user) !== req.user!.id);
    if (partner) {
      const partnerUser = await (await import('../models/User')).default.findById(partner.user).select('role seller');
      if (partnerUser?.role === 'seller' && conversation.participants[0].seller) {
        emitToSeller(String(conversation.participants[0].seller), SOCKET_EVENTS.MESSAGE_NEW, payload);
      }
      emitToUser(String(partner.user), SOCKET_EVENTS.MESSAGE_NEW, payload);
    }

    res.status(201).json({ status: 'success', data: { message } });
  } catch (err) {
    next(err);
  }
};

export const reportConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversation = await conversationForUser(req.params.id, req.user!.id);
    const { reason } = req.body;
    conversation.isReported = true;
    conversation.reportReason = reason || 'Reported';
    await conversation.save();
    await notify({
      recipient: (await UserAdminId()) as string,
      type: 'report',
      title: 'Conversation reported',
      message: `A conversation has been reported: ${conversation.reportReason}`,
      data: { conversationId: conversation._id.toString() },
    });
    trackActivity({ label: `Conversation reported (${conversation.type})`, category: 'chats' });
    res.json({ status: 'success', message: 'Conversation reported', data: { conversation } });
  } catch (err) {
    next(err);
  }
};

const UserAdminId = async (): Promise<string | null> => {
  const User = (await import('../models/User')).default;
  const admin = await User.findOne({ role: 'admin' }).select('_id');
  return admin ? admin._id.toString() : null;
};

export const listReportedConversations = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversations = await Conversation.find({ isReported: true })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate('participants.user', 'name email')
      .populate('product', 'name');
    res.json({ status: 'success', results: conversations.length, data: { conversations } });
  } catch (err) {
    next(err);
  }
};

export default { createConversation, getMyConversations, getConversationMessages, sendMessage, reportConversation, listReportedConversations };
