import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 320 },
    description: { type: String, default: '', maxlength: 8000 },
    icon: { type: String, default: 'Code2', maxlength: 40 },
    features: [{ type: String, trim: true, maxlength: 200 }],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', serviceSchema);
