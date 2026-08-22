export type UserRole = 'customer' | 'seller' | 'admin';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';
export type PaymentMethod = 'razorpay' | 'cod' | 'wallet' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface Pagination {
  page: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent?: string | null;
  level: number;
  order: number;
  isActive: boolean;
  productCount?: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  category: Category | string;
  subcategory?: Category | string;
  seller: { _id: string; storeName: string; rating?: number; totalSales?: number; reviewCount?: number } | string;
  images: string[];
  videos?: string[];
  price: number;
  compareAtPrice?: number;
  discount?: number;
  tax: number;
  sku: string;
  stock: number;
  minimumOrderQuantity: number;
  maximumOrderQuantity?: number;
  variants?: { name: string; options: string[] }[];
  variantCombinations?: { sku: string; price: number; compareAtPrice?: number; stock: number; optionValue: string; images?: string[] }[];
  specifications?: Record<string, string>;
  tags: string[];
  warranty?: string;
  returnPolicy?: string;
  shippingInfo?: string;
  ratings: number;
  reviewCount: number;
  status: string;
  approvalStatus: string;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  product: string;
  customer: { _id: string; name: string; avatar?: string };
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  seller?: Seller;
  addresses?: Address[];
  wishlist?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  _id: string;
  storeName: string;
  rating?: number;
  totalSales?: number;
  reviewCount?: number;
  [key: string]: unknown;
}

export interface Address {
  _id: string;
  user: string;
  type: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  variant?: { name: string; value: string };
  quantity: number;
  price: number;
  compareAtPrice?: number;
  addedAt: string;
  _id?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  variant?: { name: string; value: string };
  title: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
  seller: string;
  tax: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  paidAt?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  parentOrder?: string;
  isParent: boolean;
  customer: User;
  seller: string | Seller;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  payment: PaymentInfo;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  commission: number;
  sellerEarning: number;
  status: OrderStatus;
  cancellation?: { cancelledBy?: string; reason?: string; cancelledAt?: string };
  trackingNumber?: string;
  courier?: string;
  shippingProvider?: string;
  deliveryEstimate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponResult {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  coupon: { code: string; discount: number } | null;
}

export interface ApiError {
  status: string;
  message?: string;
  errors?: { msg: string; param?: string }[];
  stack?: string;
}

export interface ApiResponse<T> {
  status: string;
  results?: number;
  pagination?: Pagination;
  message?: string;
  data: T;
}
