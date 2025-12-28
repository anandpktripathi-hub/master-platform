import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Theme Schema
 *
 * Represents a global theme template that can be used by any tenant.
 * Created and managed by PLATFORM_SUPER_ADMIN only.
 * Stored in the Master Database.
 *
 * Examples:
 * - "Modern Light" - Clean, minimal light theme
 * - "Dark Professional" - Professional dark theme
 * - "Vibrant" - Colorful, energetic theme
 * - "Classic" - Traditional, conservative theme
 */
@Schema({ timestamps: true })
export class Theme extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  slug: string;

  // Color palette
  @Prop({ required: true })
  primaryColor: string; // Main brand color (e.g., #1976d2)

  @Prop({ required: true })
  secondaryColor: string; // Accent color (e.g., #dc004e)

  @Prop({ default: '#f5f5f5' })
  backgroundColor: string; // Page background

  @Prop({ default: '#ffffff' })
  surfaceColor: string; // Card/component background

  @Prop({ default: '#000000' })
  textPrimaryColor: string; // Main text color

  @Prop({ default: '#666666' })
  textSecondaryColor: string; // Secondary text color

  // Typography
  @Prop({ default: 'Roboto, sans-serif' })
  fontFamily: string;

  @Prop({ default: 16 })
  baseFontSize: number; // Base font size in pixels

  // Spacing & Layout
  @Prop({ default: 8 })
  baseSpacing: number; // Base spacing unit (multiplier for MUI theme)

  @Prop({ default: 4 })
  borderRadius: number; // Border radius in pixels

  // Status
  @Prop({ default: true })
  isActive: boolean; // Whether theme is available for selection

  @Prop({ default: false })
  isDefault: boolean; // Whether this is the default theme for new tenants

  // Preview & Metadata
  @Prop()
  previewImageUrl?: string; // URL to theme preview image

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional theme customizations (JSON)
}

export const ThemeSchema = SchemaFactory.createForClass(Theme);

// Indexes
ThemeSchema.index({ isActive: 1, isDefault: 1 });
