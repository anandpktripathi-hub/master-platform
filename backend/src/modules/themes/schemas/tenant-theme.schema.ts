import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantThemeDocument = TenantTheme & Document;

@Schema({ timestamps: true })
export class TenantTheme {
  @Prop({
    type: Types.ObjectId,
    required: true,
    description: 'Reference to tenant',
  })
  tenantId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Theme',
    required: true,
    description: 'Reference to selected theme',
  })
  themeId: Types.ObjectId;

  @Prop({
    type: Map,
    of: String,
    default: {},
    description: 'Tenant-specific CSS variable overrides',
  })
  customCssVariables: Record<string, string>;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;
}

export const TenantThemeSchema = SchemaFactory.createForClass(TenantTheme);

// Create unique index: one theme per tenant
TenantThemeSchema.index({ tenantId: 1 }, { unique: true });
TenantThemeSchema.index({ themeId: 1 });
TenantThemeSchema.index({ updatedAt: -1 });
