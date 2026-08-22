export type UserRole = 'customer' | 'seller' | 'admin';
export type SellerStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'suspended';
export type ProductStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published' | 'out_of_stock' | 'suspended';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned' | 'refunded';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'razorpay' | 'cod' | 'wallet' | 'bank_transfer';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'pickup_scheduled' | 'picked_up' | 'received' | 'refund_processing' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
export type CouponType = 'percentage' | 'fixed';
export type CouponScope = 'global' | 'seller' | 'product' | 'category';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketCategory = 'general' | 'order' | 'payment' | 'product' | 'account' | 'technical';

export interface JwtPayload {
  id: string;
  role: UserRole;
  sellerId?: string;
  iat: number;
  exp: number;
}


