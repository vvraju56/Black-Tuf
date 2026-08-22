import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICommission extends Document<mongoose.Types.ObjectId> {
  order: Types.ObjectId;
  seller: Types.ObjectId;
  product: Types.ObjectId;
  amount: number;
  rate: number;
  calculatedOn: number;
  createdAt: Date;
}

const commissionSchema = new Schema<ICommission>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0, max: 100 },
    calculatedOn: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

commissionSchema.index({ order: 1 });
commissionSchema.index({ seller: 1, createdAt: -1 });

const Commission = mongoose.model<ICommission>('Commission', commissionSchema);
export default Commission;



