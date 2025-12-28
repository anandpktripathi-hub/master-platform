import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  actorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: false, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  action!: string;

  @Prop({ required: true, index: true })
  resourceType!: string;

  @Prop({ type: Types.ObjectId, required: false })
  resourceId!: Types.ObjectId;

  @Prop({ type: Object, required: false })
  before!: Record<string, unknown>;

  @Prop({ type: Object, required: false })
  after!: Record<string, unknown>;

  @Prop({ required: false })
  changes!: string[];

  @Prop({ required: false })
  ip!: string;

  @Prop({ required: false })
  userAgent!: string;

  @Prop({ required: false })
  status!: string;

  @Prop({ required: false })
  errorMessage!: string; // If status is failure

  createdAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
