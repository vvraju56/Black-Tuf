import mongoose from 'mongoose';

const productFaqSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 3000 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductFaq = mongoose.model('ProductFaq', productFaqSchema);
