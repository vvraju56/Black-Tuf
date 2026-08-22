import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document<mongoose.Types.ObjectId> {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  alt: string;
  position: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true, maxlength: [200, 'Title too long'] },
    subtitle: { type: String, trim: true, maxlength: [300, 'Subtitle too long'] },
    image: { type: String, required: true },
    link: { type: String },
    alt: { type: String, required: true },
    position: { type: String, default: 'hero', trim: true },
    isActive: { type: Boolean, default: true },
    startDate: Date,
    endDate: Date,
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

bannerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
bannerSchema.index({ position: 1, order: 1 });

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
export default Banner;



