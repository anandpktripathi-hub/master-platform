import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { SettingEntryDto } from './dto/upsert-settings.dto';
import { IntegrationSettingsDto } from './dto/integration-settings.dto';
import { WebhookSettingsDto } from './dto/webhook-settings.dto';
import { entriesToIntegrationDto } from './mappers/integration-settings-mappers';
import { entriesToWebhookDto } from './mappers/webhook-settings-mappers';

interface SettingsGroupResult {
  items: Record<string, any>;
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private readonly settingModel: Model<SettingDocument>,
  ) {}

  async getGroupAdmin(
    group: string,
    locale?: string,
    tenantId?: string,
  ): Promise<SettingsGroupResult> {
    const query: FilterQuery<SettingDocument> = {
      group,
      isActive: { $ne: false },
    };

    if (tenantId) {
      query.tenantId = tenantId;
    }

    if (locale) {
      query.locale = locale;
    }

    const docs = await this.settingModel.find(query).lean();
    const items: Record<string, any> = {};
    for (const doc of docs) {
      items[doc.key] = doc.value;
    }
    return { items };
  }

  async upsertGroup(
    group: string,
    entries: SettingEntryDto[],
  ): Promise<SettingsGroupResult> {
    for (const entry of entries) {
      const filter: FilterQuery<SettingDocument> = {
        group,
        key: entry.key,
        scope: entry.scope,
      };

      if (entry.tenantId) {
        filter.tenantId = entry.tenantId;
      }

      if (entry.locale) {
        filter.locale = entry.locale;
      }

      await this.settingModel.findOneAndUpdate(
        filter,
        {
          $set: {
            value: entry.value,
            isActive: entry.isActive ?? true,
          },
          $setOnInsert: {
            group,
            key: entry.key,
            scope: entry.scope,
            tenantId: entry.tenantId,
            locale: entry.locale,
          },
        },
        { upsert: true, new: true },
      );
    }

    return this.getGroupAdmin(group, entries[0]?.locale, entries[0]?.tenantId);
  }

  /**
   * Convenience helper for reading global integration settings used by
   * Slack/Telegram/Twilio integration services. Currently these settings
   * are global, so the tenantId parameter is ignored.
   */
  async getIntegrationSettings(
    _tenantId?: string,
  ): Promise<IntegrationSettingsDto> {
    const res = await this.getGroupAdmin('integrations');
    return entriesToIntegrationDto(res.items);
  }

  /**
   * Convenience helper for reading webhook configuration used by the
   * WebhookDispatcherService. Currently these settings are global.
   */
  async getWebhookSettings(_tenantId?: string): Promise<WebhookSettingsDto> {
    const res = await this.getGroupAdmin('webhooks');
    return entriesToWebhookDto(res.items);
  }
}
