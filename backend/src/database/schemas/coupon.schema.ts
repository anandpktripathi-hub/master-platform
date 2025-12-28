import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, index: true })
  code!: string;

  @Prop({ required: false })
  description!: string;

  @Prop({ enum: ['single', 'multi'], required: true })
  type!: 'single' | 'multi';

  @Prop({ enum: ['percent', 'fixed'], required: true })
  discountType!: 'percent' | 'fixed';

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  validFrom!: Date;

  @Prop({ required: true })
  validTo!: Date;

  @Prop({ required: true, default: 0 })
  maxUses!: number;

  @Prop({ required: true, default: 0 })
  maxUsesPerTenant!: number;

  @Prop({ type: [Types.ObjectId], ref: 'Package', default: [] })
  applicablePackageIds!: Types.ObjectId[];

  @Prop({ default: false })
  isPrivate!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Tenant', default: [] })
  allowedTenantIds!: Types.ObjectId[]; // If private, which tenants can use

  @Prop({ enum: ['active', 'inactive', 'expired'], default: 'active' })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy!: Types.ObjectId;

  @Prop({ required: false })
  notes!: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ status: 1, validTo: 1 });
CouponSchema.index({ applicablePackageIds: 1, status: 1 });
CouponSchema.index({ allowedTenantIds: 1, status: 1 });
