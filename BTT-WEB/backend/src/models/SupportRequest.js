import mongoose from 'mongoose';

const supportRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    productName: { type: String, default: '', trim: true, maxlength: 120 },
    issueType: {
      type: String,
      enum: [
        'Product Support',
        'Bug Report',
        'Feature Request',
        'Account Help',
        'Documentation',
        'General',
      ],
      default: 'General',
    },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    attachmentUrl: { type: String, default: '' },
    attachmentName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'archived'],
      default: 'new',
      index: true,
    },
  },
  { timestamps: true }
);

export const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);
