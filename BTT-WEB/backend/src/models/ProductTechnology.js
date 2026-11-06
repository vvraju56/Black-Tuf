import mongoose from 'mongoose';

const productTechnologySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productTechnologySchema.index({ product: 1, name: 1 }, { unique: true });

export const ProductTechnology = mongoose.model('ProductTechnology', productTechnologySchema);
