import type { Server as HttpServer } from 'http';
import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/auth';
import { SOCKET_EVENTS, ROOMS } from '../constants/socketEvents';
import { initSocketServer, setPresence, unsetPresence, emitToAdmin, emitToConversation, emitToUser } from '../services/realtime.service';
import type { JwtPayload } from '../types/index';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';

interface AuthSocket extends Socket {
  user?: { id: string; role: string; sellerId?: string };
}

const parseToken = (socket: Socket): string | null => {
  const auth = socket.handshake.auth as { token?: string } | undefined;
  if (auth?.token) return auth.token;
  const query = socket.handshake.query as { token?: string };
  if (query?.token) return query.token;
  return null;
};

const isParticipant = async (socket: AuthSocket, conversationId: string): Promise<boolean> => {
  try {
    const conversation = await Conversation.findById(conversationId).select('participants');
    return !!conversation?.participants.some((p) => String(p.user) === socket.user!.id);
  } catch {
    return false;
  }
};

export const setupSocketServer = (server: HttpServer): void => {
  const io = initSocketServer(server);

  io.use((socket: Socket, next) => {
    const token = parseToken(socket);
    if (!token) return next(new Error('Unauthorized'));
    try {
      const decoded = verifyAccessToken(token) as JwtPayload;
      (socket as AuthSocket).user = {
        id: decoded.id,
        role: decoded.role,
        sellerId: decoded.sellerId,
      };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const user = socket.user!;

    // Join identity rooms
    socket.join(ROOMS.user(user.id));
    if (user.role === 'admin') {
      socket.join(ROOMS.admins());
      socket.join(ROOMS.admin(user.id));
    }
    if (user.role === 'seller' && user.sellerId) {
      socket.join(ROOMS.seller(user.sellerId));
    }

    // Presence
    setPresence(user.id, { role: user.role, sellerId: user.sellerId });
    const presencePayload = { userId: user.id, role: user.role, online: true };
    emitToUser(user.id, SOCKET_EVENTS.PRESENCE, presencePayload);
    emitToAdmin(SOCKET_EVENTS.USER_ONLINE, presencePayload);

    // Client requests to join private rooms (validated server-side)
    socket.on(SOCKET_EVENTS.CLIENT_JOIN, async (payload: { rooms?: string[] }, cb?: (ok: boolean) => void) => {
      const rooms: string[] = Array.isArray(payload?.rooms) ? payload.rooms : [];
      let joined = true;

      for (const room of rooms) {
        try {
          if (room.startsWith('order:')) {
            const orderId = room.slice(6);
            const order = await Order.findById(orderId).select('customer seller');
            const isOwner =
              order && (String(order.customer) === user.id || String(order.seller) === user.id || user.role === 'admin');
            if (isOwner) socket.join(room);
            else joined = false;
          } else if (room.startsWith('product:')) {
            const productId = room.slice(8);
            const product = await Product.findById(productId).select('_id status');
            if (product && (product.status === 'published' || product.status === 'approved' || user.role !== 'customer')) {
              socket.join(room);
            } else {
              joined = false;
            }
          } else if (room.startsWith('conversation:')) {
            const conversationId = room.slice(13);
            if (await isParticipant(socket, conversationId)) socket.join(room);
            else joined = false;
          } else {
            joined = false;
          }
        } catch {
          joined = false;
        }
      }

      cb?.(joined);
    });

    // Typing indicator (never persisted)
    socket.on(SOCKET_EVENTS.CLIENT_TYPING, async (payload: { conversationId: string; isTyping: boolean }) => {
      if (!payload?.conversationId) return;
      if (await isParticipant(socket, payload.conversationId)) {
        const room = ROOMS.conversation(payload.conversationId);
        socket.to(room).emit(SOCKET_EVENTS.MESSAGE_TYPING, {
          conversationId: payload.conversationId,
          userId: user.id,
          role: user.role,
          isTyping: !!payload.isTyping,
        });
      }
    });

    // Mark messages as read
    socket.on(SOCKET_EVENTS.CLIENT_MESSAGE_READ, async (payload: { conversationId: string }, cb?: (ok: boolean) => void) => {
      if (!payload?.conversationId) return;
      if (!(await isParticipant(socket, payload.conversationId))) {
        cb?.(false);
        return;
      }
      const conversationId = payload.conversationId;
      await Message.updateMany(
        { conversation: conversationId, readBy: { $ne: user.id } },
        { $addToSet: { readBy: user.id } }
      );
      await Conversation.updateOne(
        { _id: conversationId, 'unreadCount.user': user.id },
        { $set: { 'unreadCount.$.count': 0 } }
      );
      emitToConversation(conversationId, SOCKET_EVENTS.MESSAGE_READ, {
        conversationId,
        userId: user.id,
        readBy: user.id,
      });
      cb?.(true);
    });

    socket.on('disconnect', () => {
      unsetPresence(user.id);
      emitToAdmin(SOCKET_EVENTS.USER_OFFLINE, { userId: user.id, role: user.role, online: false });
      emitToUser(user.id, SOCKET_EVENTS.PRESENCE, { userId: user.id, role: user.role, online: false });
    });
  });

  console.log('[realtime] Socket.IO server ready');
};

export const getOnlineUsers = async (): Promise<{ userId: string; role: string }[]> => {
  const io = (await import('../services/realtime.service')).getIO();
  const sockets = await io.fetchSockets();
  const seen = new Map<string, { role: string }>();
  for (const s of sockets as unknown as AuthSocket[]) {
    if (s.user) seen.set(s.user.id, { role: s.user.role });
  }
  return Array.from(seen.entries()).map(([userId, info]) => ({ userId, role: info.role }));
};

export default { setupSocketServer, getOnlineUsers };
