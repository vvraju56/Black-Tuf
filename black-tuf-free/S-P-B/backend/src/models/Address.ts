import mongoose, { Schema, Document } from 'mongoose';

export type AddressType = 'home' | 'work' | 'other';

export interface IAddress extends Document<mongoose.Types.ObjectId> {
  user: mongoose.Types.ObjectId;
  type: AddressType;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    addressLine1: { type: String, required: [true, 'Address line 1 is required'], trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    postalCode: { type: String, required: [true, 'Postal code is required'], trim: true },
    country: { type: String, required: [true, 'Country is required'], trim: true, default: 'India' },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

addressSchema.index({ user: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model<IAddress>('Address', addressSchema);
export default Address;



