import mongoose, { Schema, Document } from 'mongoose';
import { ProductStatus, ApprovalStatus } from '../types/index';

export interface IVariantOption {
  name: string;
  values: string[];
}

export interface IVariant {
  name: string;
  options: string[];
}

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  images: string[];
  optionValue: string;
}

export interface IProduct extends Document<mongoose.Types.ObjectId> {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
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
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  variants?: IVariant[];
  variantCombinations?: IProductVariant[];
  specifications?: Record<string, string>;
  tags: string[];
  warranty?: string;
  returnPolicy?: string;
  shippingInfo?: string;
  ratings: number;
  reviewCount: number;
  status: ProductStatus;
  approvalStatus: ApprovalStatus;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const variantOptionSchema = new Schema({
  name: { type: String, required: true },
  values: [{ type: String, required: true }]
}, { _id: false });

const productVariantOptionSchema = new Schema({
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  weight: { type: Number },
  dimensions: { length: Number, width: Number, height: Number },
  images: [{ type: String }],
  optionValue: { type: String, required: true }
}, { _id: false });

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: [200, 'Name too long'] },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, required: [true, 'Description is required'], maxlength: [10000, 'Description too long'] },
    shortDescription: { type: String, maxlength: [500, 'Short description too long'] },
    brand: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    images: [{ type: String, required: true }],
    videos: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    tax: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    minimumOrderQuantity: { type: Number, default: 1, min: 1 },
    maximumOrderQuantity: { type: Number, min: 1 },
    weight: { type: Number, min: 0 },
    dimensions: { length: Number, width: Number, height: Number },
    variants: [variantOptionSchema],
    variantCombinations: [productVariantOptionSchema],
    specifications: { type: Schema.Types.Mixed },
    tags: [{ type: String, trim: true }],
    warranty: { type: String },
    returnPolicy: { type: String },
    shippingInfo: { type: String },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'pending_approval', 'approved', 'rejected', 'published', 'out_of_stock', 'suspended'], default: 'draft' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    isFeatured: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: { type: Date }
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ status: 1 });
productSchema.index({ approvalStatus: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;



