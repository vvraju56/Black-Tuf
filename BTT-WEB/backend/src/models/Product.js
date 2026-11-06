import mongoose from 'mongoose';

const httpUrl = {
  validator(value) {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },
  message: 'Must be a valid http(s) URL.',
};

const assetUrl = {
  validator(value) {
    if (!value) return true;
    if (value.startsWith('/')) return true;
    return httpUrl.validator(value);
  },
  message: 'Must be a valid URL or a path beginning with "/".',
};

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 320 },
    description: { type: String, default: '', maxlength: 20000 },
    logoUrl: { type: String, default: '', validate: assetUrl },
    bannerUrl: { type: String, default: '', validate: assetUrl },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    status: {
      type: String,
      enum: ['Active', 'Beta', 'Coming Soon', 'Maintenance', 'Archived'],
      default: 'Coming Soon',
      index: true,
    },
    websiteUrl: { type: String, default: '', validate: httpUrl },
    githubUrl: { type: String, default: '', validate: httpUrl },
    documentationUrl: { type: String, default: '', validate: httpUrl },
    supportUrl: { type: String, default: '', validate: httpUrl },
    version: { type: String, default: '', trim: true, maxlength: 40 },
    releaseDate: { type: Date },
    pricingType: {
      type: String,
      enum: ['', 'Free', 'Freemium', 'Paid', 'Custom', 'Coming Soon'],
      default: '',
    },
    pricingNote: { type: String, default: '', maxlength: 500 },
    howItWorks: [
      {
        _id: false,
        title: { type: String, trim: true, maxlength: 120 },
        description: { type: String, trim: true, maxlength: 500 },
      },
    ],
    featured: { type: Boolean, default: false, index: true },
    published: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    seoTitle: { type: String, default: '', maxlength: 70 },
    seoDescription: { type: String, default: '', maxlength: 180 },
  },
  { timestamps: true }
);

productSchema.index({ published: 1, featured: -1, order: 1, createdAt: -1 });
productSchema.index({ name: 'text', shortDescription: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
