import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document<mongoose.Types.ObjectId> {
  admin: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: Types.ObjectId;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    entity: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ admin: 1 });
auditLogSchema.index({ entity: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;



