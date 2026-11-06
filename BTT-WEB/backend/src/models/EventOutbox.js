import mongoose from 'mongoose';

const eventOutboxSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['pending', 'published', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: '' },
  },
  { timestamps: true }
);

export const EventOutbox = mongoose.model('EventOutbox', eventOutboxSchema);