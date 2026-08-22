import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReviewImage {
  url: string;
  publicId: string;
}

export interface IReview extends Document<mongoose.Types.ObjectId> {
  product: Types.ObjectId;
  customer: Types.ObjectId;
  order: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images?: IReviewImage[];
  isVerifiedPurchase: boolean;
  sellerResponse?: {
    text: string;
    respondedAt: Date;
  };
  status: 'pending' | 'approved' | 'rejected';
  reportedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: [200, 'Title too long'] },
    comment: { type: String, required: [true, 'Comment is required'], maxlength: [2000, 'Comment too long'] },
    images: [{
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    }],
    isVerifiedPurchase: { type: Boolean, default: false },
    sellerResponse: {
      text: { type: String, maxlength: [1000, 'Response too long'] },
      respondedAt: { type: Date }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reportedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;



