import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItem {
  product: Types.ObjectId;
  variant?: {
    name: string;
    value: string;
  };
  quantity: number;
  price: number;
  compareAtPrice?: number;
  addedAt: Date;
}

export interface ICart extends Document<mongoose.Types.ObjectId> {
  user: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  subtotal: number;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: {
      name: { type: String },
      value: { type: String }
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    addedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;



