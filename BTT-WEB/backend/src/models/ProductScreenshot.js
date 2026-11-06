import mongoose from 'mongoose';

const productScreenshotSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: '', trim: true, maxlength: 200 },
    caption: { type: String, default: '', trim: true, maxlength: 200 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductScreenshot = mongoose.model('ProductScreenshot', productScreenshotSchema);
