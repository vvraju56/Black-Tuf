import mongoose, { Schema, Document } from 'mongoose';

export interface ISellerVerification extends Document<mongoose.Types.ObjectId> {
  seller: mongoose.Types.ObjectId;
  documents: Array<{
    type: string;
    fileUrl: string;
    publicId: string;
    verified: boolean;
    verifiedAt?: Date;
    note?: string;
  }>;
  businessProof?: Array<{
    type: string;
    fileUrl: string;
    publicId: string;
  }>;
  adminNote?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema({
  type: { type: String, required: true, enum: ['aadhaar', 'pan', 'business_license', 'gst', 'passport', 'other'] },
  fileUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  note: { type: String }
});

const sellerVerificationSchema = new Schema<ISellerVerification>(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, unique: true },
    documents: { type: [documentSchema], default: [] },
    businessProof: { type: [documentSchema], default: [] },
    adminNote: { type: String },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

sellerVerificationSchema.index({ seller: 1 });

const SellerVerification = mongoose.model<ISellerVerification>('SellerVerification', sellerVerificationSchema);
export default SellerVerification;



