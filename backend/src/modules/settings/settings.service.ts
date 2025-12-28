import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { SettingEntryDto } from './dto/upsert-settings.dto';

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
}
