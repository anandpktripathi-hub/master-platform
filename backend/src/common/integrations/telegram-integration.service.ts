import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import axios from 'axios';

@Injectable()
export class TelegramIntegrationService {
  private readonly logger = new Logger(TelegramIntegrationService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Send a message to Telegram chat
   */
  async sendMessage(
    tenantId: string,
    message: string,
    options?: {
      parseMode?: 'Markdown' | 'HTML';
      disableNotification?: boolean;
    },
  ): Promise<boolean> {
    try {
      const settings = await this.settingsService.getIntegrationSettings(
        tenantId,
      );

      if (
        !settings?.telegram?.enabled ||
        !settings.telegram.botToken ||
        !settings.telegram.chatId
      ) {
        this.logger.debug(`Telegram integration not configured for tenant ${tenantId}`);
        return false;
      }

      const url = `https://api.telegram.org/bot${settings.telegram.botToken}/sendMessage`;

      await axios.post(
        url,
        {
          chat_id: settings.telegram.chatId,
          text: message,
          parse_mode: options?.parseMode || 'Markdown',
          disable_notification: options?.disableNotification || false,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        },
      );

      this.logger.log(`Telegram message sent for tenant ${tenantId}`);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(
        `Failed to send Telegram message for tenant ${tenantId}: ${message}`,
        stack,
      );
      return false;
    }
  }

  /**
   * Send a photo with caption
   */
  async sendPhoto(
    tenantId: string,
    photoUrl: string,
    caption?: string,
  ): Promise<boolean> {
    try {
      const settings = await this.settingsService.getIntegrationSettings(
        tenantId,
      );

      if (
        !settings?.telegram?.enabled ||
        !settings.telegram.botToken ||
        !settings.telegram.chatId
      ) {
        return false;
      }

      const url = `https://api.telegram.org/bot${settings.telegram.botToken}/sendPhoto`;

      await axios.post(
        url,
        {
          chat_id: settings.telegram.chatId,
          photo: photoUrl,
          ...(caption && { caption }),
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        },
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send Telegram photo: ${message}`);
      return false;
    }
  }
}
