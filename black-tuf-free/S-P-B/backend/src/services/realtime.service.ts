import type { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import config from '../config/index';
import Notification from '../models/Notification';
import { SOCKET_EVENTS, ROOMS } from '../constants/socketEvents';
import { sendPushNotification } from './push.service';

let io: SocketServer | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

export interface SocketUser {
  id: string;
  role: 'customer' | 'seller' | 'admin';
  sellerId?: string;
}

export const initSocketServer = (server: HttpServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: config.clientUrl,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      pubClient = new Redis(redisUrl);
      subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[realtime] Redis pub/sub adapter enabled');
    } catch (err) {
      console.error('[realtime] Redis adapter failed, falling back to in-memory:', (err as Error).message);
    }
  }

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const isSocketEnabled = (): boolean => io !== null;

export const closeSocketServer = (): void => {
  if (pubClient) pubClient.disconnect();
  if (subClient) subClient.disconnect();
  if (io) io.close();
};

// ---- Room-based emit helpers ------------------------------------------------

export const emitToUser = (userId: string, event: string, data: unknown): void => {
  io?.to(ROOMS.user(String(userId))).emit(event, data);
};

export const emitToSeller = (sellerId: string, event: string, data: unknown): void => {
  io?.to(ROOMS.seller(String(sellerId))).emit(event, data);
};

export const emitToAdmin = (event: string, data: unknown): void => {
  io?.to(ROOMS.admins()).emit(event, data);
};

export const emitToOrder = (orderId: string, event: string, data: unknown): void => {
  io?.to(ROOMS.order(String(orderId))).emit(event, data);
};

export const emitToProduct = (productId: string, event: string, data: unknown): void => {
  io?.to(ROOMS.product(String(productId))).emit(event, data);
};

export const emitToConversation = (conversationId: string, event: string, data: unknown): void => {
  io?.to(ROOMS.conversation(String(conversationId))).emit(event, data);
};

export const broadcast = (event: string, data: unknown): void => {
  io?.emit(event, data);
};

// ---- Notifications (DB + socket + push) ------------------------------------

export interface NotifyPayload {
  recipient?: string;
  recipientType?: 'user' | 'seller' | 'admin';
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  userId?: string;
  sellerId?: string;
  push?: boolean;
}

export const notify = async (p: NotifyPayload): Promise<void> => {
  const recipientType = p.recipientType || 'user';
  const notification = await Notification.create({
    recipient: recipientType === 'admin' ? undefined : p.recipient,
    recipientType,
    type: p.type,
    title: p.title,
    message: p.message,
    data: p.data || {},
  });

  const payload = {
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    type: notification.type,
    data: notification.data || {},
    isRead: false,
    createdAt: notification.createdAt,
  };

  if (recipientType === 'admin') {
    emitToAdmin(SOCKET_EVENTS.NOTIFICATION_NEW, payload);
    emitToAdmin(SOCKET_EVENTS.NOTIFICATION_UNREAD, { count: 1 });
    return;
  }

  if (recipientType === 'seller' && p.sellerId) {
    emitToSeller(p.sellerId, SOCKET_EVENTS.NOTIFICATION_NEW, payload);
  }
  emitToUser(p.recipient!, SOCKET_EVENTS.NOTIFICATION_NEW, payload);
  emitToUser(p.recipient!, SOCKET_EVENTS.NOTIFICATION_UNREAD, { count: 1 });

  if (p.push !== false) {
    try {
      await sendPushNotification(p.recipient!, payload);
    } catch (err) {
      console.error('[realtime] push notification failed:', (err as Error).message);
    }
  }
};

// ---- Admin live activity ----------------------------------------------------

const ACTIVITY_LIMIT = 200;

export interface ActivityEntry {
  id: string;
  at: number;
  label: string;
  category: string;
  actor?: string;
}

let activityBuffer: ActivityEntry[] = [];
const activitySubscribers = new Set<() => void>();

export const getActivityBuffer = (): ActivityEntry[] => activityBuffer;

export const subscribeActivity = (fn: () => void): (() => void) => {
  activitySubscribers.add(fn);
  return () => activitySubscribers.delete(fn);
};

export const trackActivity = (entry: Omit<ActivityEntry, 'id' | 'at'>): void => {
  const full: ActivityEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  };
  activityBuffer = [full, ...activityBuffer].slice(0, ACTIVITY_LIMIT);
  emitToAdmin(SOCKET_EVENTS.ADMIN_ACTIVITY, full);
  activitySubscribers.forEach((fn) => fn());
};

// Online presence lookup (in-memory; with Redis adapter this is per-instance).
const presence = new Map<string, { role: string; sellerId?: string }>();

export const setPresence = (userId: string, info: { role: string; sellerId?: string }): void => {
  presence.set(String(userId), info);
};

export const unsetPresence = (userId: string): void => {
  presence.delete(String(userId));
};

export const getPresence = (): Map<string, { role: string; sellerId?: string }> => presence;

export default {
  initSocketServer,
  getIO,
  isSocketEnabled,
  closeSocketServer,
  emitToUser,
  emitToSeller,
  emitToAdmin,
  emitToOrder,
  emitToProduct,
  emitToConversation,
  broadcast,
  notify,
  trackActivity,
  getActivityBuffer,
  subscribeActivity,
  setPresence,
  unsetPresence,
  getPresence,
};
