export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',

  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_SHIPPED: 'order:shipped',
  ORDER_DELIVERED: 'order:delivered',

  // Products
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_STOCK_UPDATED: 'product:stock-updated',
  PRODUCT_PRICE_UPDATED: 'product:price-updated',

  // Sellers
  SELLER_VERIFICATION_SUBMITTED: 'seller:verification-submitted',
  SELLER_APPROVED: 'seller:approved',
  SELLER_REJECTED: 'seller:rejected',

  // Products approval
  PRODUCT_SUBMITTED: 'product:submitted',
  PRODUCT_APPROVED: 'product:approved',
  PRODUCT_REJECTED: 'product:rejected',

  // Payments
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',
  PAYMENT_REFUNDED: 'payment:refunded',

  // Returns / refunds
  RETURN_CREATED: 'return:created',
  RETURN_UPDATED: 'return:updated',
  REFUND_CREATED: 'refund:created',
  REFUND_UPDATED: 'refund:updated',

  // Payouts
  PAYOUT_CREATED: 'payout:created',
  PAYOUT_UPDATED: 'payout:updated',

  // Reviews
  REVIEW_CREATED: 'review:created',
  REVIEW_MODERATED: 'review:moderated',

  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_UNREAD: 'notification:unread',

  // Chat
  CHAT_CONVERSATION_CREATED: 'chat:conversation-created',
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  MESSAGE_TYPING: 'message:typing',
  MESSAGE_DELIVERED: 'message:delivered',

  // Presence
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline',
  PRESENCE: 'presence',

  // Admin live activity
  ADMIN_ACTIVITY: 'admin:activity',

  // Flash deals / announcements
  DEAL_UPDATED: 'deal:updated',

  // Client -> server
  CLIENT_TYPING: 'typing',
  CLIENT_JOIN: 'join',
  CLIENT_MESSAGE_READ: 'message:mark-read',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export const ROOMS = {
  user: (userId: string) => `user:${userId}`,
  seller: (sellerId: string) => `seller:${sellerId}`,
  admin: (adminId: string) => `admin:${adminId}`,
  admins: () => 'admin',
  order: (orderId: string) => `order:${orderId}`,
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  product: (productId: string) => `product:${productId}`,
} as const;
