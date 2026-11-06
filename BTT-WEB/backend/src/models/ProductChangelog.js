import mongoose from 'mongoose';

const productChangelogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    version: { type: String, required: true, trim: true, maxlength: 40 },
    releaseDate: { type: Date },
    notes: [{ type: String, trim: true, maxlength: 500 }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductChangelog = mongoose.model('ProductChangelog', productChangelogSchema);
