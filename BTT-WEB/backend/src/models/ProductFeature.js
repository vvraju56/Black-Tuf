import mongoose from 'mongoose';

const productFeatureSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    icon: { type: String, default: 'Sparkles', maxlength: 40 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 600 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductFeature = mongoose.model('ProductFeature', productFeatureSchema);
