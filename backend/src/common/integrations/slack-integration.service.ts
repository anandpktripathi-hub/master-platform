import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import axios from 'axios';

@Injectable()
export class SlackIntegrationService {
  private readonly logger = new Logger(SlackIntegrationService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Send a message to Slack webhook
   */
  async sendMessage(
    tenantId: string,
    message: string,
    options?: {
      username?: string;
      iconEmoji?: string;
      channel?: string;
    },
  ): Promise<boolean> {
    try {
      const settings =
        await this.settingsService.getIntegrationSettings(tenantId);

      if (!settings?.slack?.enabled || !settings.slack.webhookUrl) {
        this.logger.debug(
          `Slack integration not configured for tenant ${tenantId}`,
        );
        return false;
      }

      const payload = {
        text: message,
        username: options?.username || 'SmetaSC Bot',
        icon_emoji: options?.iconEmoji || ':robot_face:',
        ...(options?.channel && { channel: options.channel }),
      };

      await axios.post(settings.slack.webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });

      this.logger.log(`Slack message sent for tenant ${tenantId}`);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(
        `Failed to send Slack message for tenant ${tenantId}: ${message}`,
        stack,
      );
      return false;
    }
  }

  /**
   * Send a rich message with attachments
   */
  async sendRichMessage(
    tenantId: string,
    text: string,
    attachments: any[],
  ): Promise<boolean> {
    try {
      const settings =
        await this.settingsService.getIntegrationSettings(tenantId);

      if (!settings?.slack?.enabled || !settings.slack.webhookUrl) {
        return false;
      }

      const payload = {
        text,
        attachments,
      };

      await axios.post(settings.slack.webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send rich Slack message: ${message}`);
      return false;
    }
  }
}
