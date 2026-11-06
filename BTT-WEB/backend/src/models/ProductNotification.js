import mongoose from 'mongoose';

const productNotificationSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  },
  { timestamps: true }
);

productNotificationSchema.index({ product: 1, email: 1 }, { unique: true });

export const ProductNotification = mongoose.model(
  'ProductNotification',
  productNotificationSchema
);
