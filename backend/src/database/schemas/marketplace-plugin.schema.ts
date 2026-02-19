import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MarketplacePluginDocument = MarketplacePlugin & Document;

/**
 * Represents an installable marketplace plugin/extension for a tenant.
 * Enables a dynamic marketplace where tenants can enable or disable
 * features like integrations, advanced analytics, or third-party services.
 */
@Schema({ timestamps: true })
export class MarketplacePlugin {
  @Prop({ required: true })
  pluginId!: string; // Unique plugin identifier (e.g. 'google-analytics', 'openai-assistant')

  @Prop({ required: true })
  name!: string; // Display name

  @Prop({ required: false })
  description!: string;

  @Prop({ required: false })
  iconUrl!: string;

  @Prop({ default: true })
  available!: boolean; // Whether plugin is currently available for installation

  @Prop({ type: [String], default: [] })
  requiredScopes!: string[]; // API scopes or permissions needed

  @Prop({ type: Object, required: false })
  defaultConfig?: Record<string, unknown>; // Default configuration template

  createdAt?: Date;
  updatedAt?: Date;
}

export const MarketplacePluginSchema =
  SchemaFactory.createForClass(MarketplacePlugin);

MarketplacePluginSchema.index({ pluginId: 1 }, { unique: true });
