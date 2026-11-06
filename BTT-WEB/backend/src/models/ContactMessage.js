import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    company: { type: String, default: '', trim: true, maxlength: 160 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    productName: { type: String, default: '', trim: true, maxlength: 120 },
    projectType: { type: String, default: '', trim: true, maxlength: 120 },
    budget: { type: String, default: '', trim: true, maxlength: 80 },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'archived'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
