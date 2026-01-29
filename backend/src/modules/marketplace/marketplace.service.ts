import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MarketplacePlugin,
  MarketplacePluginDocument,
} from '../../database/schemas/marketplace-plugin.schema';
import {
  TenantPluginInstall,
  TenantPluginInstallDocument,
} from '../../database/schemas/tenant-plugin-install.schema';

export interface InstallPluginDto {
  pluginId: string;
  config?: Record<string, unknown>;
}

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectModel(MarketplacePlugin.name)
    private readonly pluginModel: Model<MarketplacePluginDocument>,
    @InjectModel(TenantPluginInstall.name)
    private readonly installModel: Model<TenantPluginInstallDocument>,
  ) {}

  /**
   * List all available marketplace plugins (public catalog).
   */
  async listAvailablePlugins() {
    const plugins = await this.pluginModel
      .find({ available: true })
      .sort('name')
      .lean()
      .exec();

    return plugins.map((p) => ({
      pluginId: p.pluginId,
      name: p.name,
      description: p.description,
      iconUrl: p.iconUrl,
      requiredScopes: p.requiredScopes,
    }));
  }

  /**
   * Install (enable) a plugin for a tenant.
   */
  async installPlugin(tenantId: string, userId: string, dto: InstallPluginDto) {
    const plugin = await this.pluginModel
      .findOne({ pluginId: dto.pluginId })
      .exec();

    if (!plugin || !plugin.available) {
      throw new NotFoundException('Plugin not found or not available');
    }

    const existingInstall = await this.installModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        pluginId: dto.pluginId,
      })
      .exec();

    if (existingInstall) {
      throw new ConflictException(
        'Plugin is already installed for this tenant',
      );
    }

    const install = new this.installModel({
      tenantId: new Types.ObjectId(tenantId),
      pluginId: dto.pluginId,
      enabled: true,
      config: dto.config || plugin.defaultConfig || {},
      installedBy: new Types.ObjectId(userId),
    });

    const saved = await install.save();

    return {
      id: String(saved._id),
      tenantId: String(saved.tenantId),
      pluginId: saved.pluginId,
      enabled: saved.enabled,
      config: saved.config,
      createdAt: saved.createdAt,
    };
  }

  /**
   * List all plugins installed by a tenant.
   */
  async listTenantInstalls(tenantId: string) {
    const installs = await this.installModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort('-createdAt')
      .lean()
      .exec();

    return installs.map((i) => ({
      id: String(i._id),
      pluginId: i.pluginId,
      enabled: i.enabled,
      config: i.config,
      createdAt: i.createdAt,
    }));
  }

  /**
   * Enable or disable a plugin for a tenant.
   */
  async togglePlugin(tenantId: string, pluginId: string, enabled: boolean) {
    const install = await this.installModel
      .findOne({
        tenantId: new Types.ObjectId(tenantId),
        pluginId,
      })
      .exec();

    if (!install) {
      throw new NotFoundException('Plugin installation not found');
    }

    install.enabled = enabled;
    await install.save();

    return {
      id: String(install._id),
      pluginId: install.pluginId,
      enabled: install.enabled,
    };
  }

  /**
   * Uninstall (remove) a plugin from a tenant.
   */
  async uninstallPlugin(tenantId: string, pluginId: string) {
    const result = await this.installModel.deleteOne({
      tenantId: new Types.ObjectId(tenantId),
      pluginId,
    });

    if (!result.deletedCount) {
      throw new NotFoundException('Plugin installation not found');
    }

    return { success: true };
  }
}
