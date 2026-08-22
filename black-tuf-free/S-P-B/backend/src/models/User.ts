import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types/index';

export interface IUser extends Document<mongoose.Types.ObjectId> {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  seller?: mongoose.Types.ObjectId;
  addresses?: mongoose.Types.ObjectId[];
  wishlist?: mongoose.Types.ObjectId[];
  deviceTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: [100, 'Name too long'] },
    email: {
      type: String, required: [true, 'Email is required'], unique: true, lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String, required: [true, 'Password is required'], minlength: [6, 'Password min 6 chars'], select: false
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer', required: true },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller' },
    addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    deviceTokens: [{ type: String }]
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ emailVerified: 1 });

userSchema.pre('save', function (next) {
  if (!this.isModified('password') && this.isNew === false) return next();
  next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;



