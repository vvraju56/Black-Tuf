import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document<mongoose.Types.ObjectId> {
  marketplaceName: string;
  logo?: string;
  favicon?: string;
  currency: string;
  currencySymbol: string;
  taxEnabled: boolean;
  defaultTaxRate: number;
  codEnabled: boolean;
  minOrderValue: number;
  returnWindowDays: number;
  sellerApprovalRequired: boolean;
  productApprovalRequired: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  globalCommission: number;
  emailEnabled: boolean;
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  payment: {
    razorpayKey: string;
    razorpaySecret: string;
  };
  shipping: {
    defaultFee: number;
    freeShippingThreshold: number;
    estimatedDays: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    marketplaceName: { type: String, default: 'Black Tuf', required: true },
    logo: String,
    favicon: String,
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    taxEnabled: { type: Boolean, default: true },
    defaultTaxRate: { type: Number, default: 18 },
    codEnabled: { type: Boolean, default: true },
    minOrderValue: { type: Number, default: 0 },
    returnWindowDays: { type: Number, default: 7 },
    sellerApprovalRequired: { type: Boolean, default: true },
    productApprovalRequired: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: String,
    globalCommission: { type: Number, default: 10 },
    emailEnabled: { type: Boolean, default: true },
    smtp: {
      host: { type: String, default: 'smtp.gmail.com' },
      port: { type: Number, default: 587 },
      user: { type: String, select: false },
      password: { type: String, select: false },
      from: { type: String, default: 'Black Tuf <no-reply@blacktuf.com>' }
    },
    payment: {
      razorpayKey: { type: String, select: false },
      razorpaySecret: { type: String, select: false }
    },
    shipping: {
      defaultFee: { type: Number, default: 50 },
      freeShippingThreshold: { type: Number, default: 499 },
      estimatedDays: { type: String, default: '3-5 business days' }
    }
  },
  { timestamps: true }
);

const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
export default Settings;



