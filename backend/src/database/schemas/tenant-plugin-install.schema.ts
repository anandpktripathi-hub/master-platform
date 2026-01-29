import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantPluginInstallDocument = TenantPluginInstall & Document;

/**
 * Tracks which plugins/extensions a tenant has installed and their configuration.
 */
@Schema({ timestamps: true })
export class TenantPluginInstall {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  pluginId!: string; // References MarketplacePlugin.pluginId

  @Prop({ default: true })
  enabled!: boolean;

  @Prop({ type: Object, required: false })
  config?: Record<string, unknown>; // Per-tenant plugin configuration

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  installedBy!: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TenantPluginInstallSchema = SchemaFactory.createForClass(TenantPluginInstall);

TenantPluginInstallSchema.index({ tenantId: 1, pluginId: 1 }, { unique: true });
TenantPluginInstallSchema.index({ tenantId: 1, enabled: 1 });
