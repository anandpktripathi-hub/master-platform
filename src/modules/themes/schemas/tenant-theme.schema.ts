import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * TenantTheme Schema
 *
 * Represents a tenant's selected theme and their customizations.
 * Each tenant can:
 * 1. Select a base theme from the Theme catalog
 * 2. Customize specific colors/settings
 * 3. Save their customizations
 *
 * Stored in the Master Database (tenant-specific configuration).
 *
 * Example Flow:
 * 1. Tenant selects "Modern Light" theme
 * 2. Tenant customizes primaryColor from #1976d2 to #ff5722
 * 3. TenantTheme record stores baseTheme + customizations
 * 4. Frontend merges base theme with customizations
 */
@Schema({ timestamps: true })
export class TenantTheme extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Theme', required: true })
  baseThemeId: Types.ObjectId;

  // Custom Overrides (optional - overrides base theme values)
  @Prop()
  customPrimaryColor?: string;

  @Prop()
  customSecondaryColor?: string;

  @Prop()
  customBackgroundColor?: string;

  @Prop()
  customSurfaceColor?: string;

  @Prop()
  customTextPrimaryColor?: string;

  @Prop()
  customTextSecondaryColor?: string;

  @Prop()
  customFontFamily?: string;

  @Prop()
  customBaseFontSize?: number;

  @Prop()
  customBaseSpacing?: number;

  @Prop()
  customBorderRadius?: number;

  // Metadata
  @Prop({ type: Object })
  customMetadata?: Record<string, any>; // Additional custom properties

  @Prop()
  lastModifiedBy?: Types.ObjectId; // User ID who last modified

  @Prop()
  appliedAt?: Date; // When theme was last applied
}

export const TenantThemeSchema = SchemaFactory.createForClass(TenantTheme);

// Indexes
TenantThemeSchema.index({ tenantId: 1 }, { unique: true });
TenantThemeSchema.index({ baseThemeId: 1 });
