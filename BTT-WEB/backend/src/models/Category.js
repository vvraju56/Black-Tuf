import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, default: '', maxlength: 300 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
