import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document<mongoose.Types.ObjectId> {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parent: mongoose.Types.ObjectId | null;
  level: number;
  order: number;
  isActive: boolean;
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
  children?: ICategory[];
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: [100, 'Name too long'] },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, maxlength: [500, 'Description too long'] },
    image: { type: String },
    icon: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 0, enum: [0, 1, 2] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ order: 1 });

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;



