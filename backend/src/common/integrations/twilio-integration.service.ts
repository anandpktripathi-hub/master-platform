import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import axios from 'axios';

@Injectable()
export class TwilioIntegrationService {
  private readonly logger = new Logger(TwilioIntegrationService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Send an SMS via Twilio
   */
  async sendSms(
    tenantId: string,
    to: string,
    message: string,
  ): Promise<boolean> {
    try {
      const settings = await this.settingsService.getIntegrationSettings(
        tenantId,
      );

      if (
        !settings?.twilio?.enabled ||
        !settings.twilio.accountSid ||
        !settings.twilio.authToken ||
        !settings.twilio.fromNumber
      ) {
        this.logger.debug(`Twilio integration not configured for tenant ${tenantId}`);
        return false;
      }

      const url = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio.accountSid}/Messages.json`;

      const auth = Buffer.from(
        `${settings.twilio.accountSid}:${settings.twilio.authToken}`,
      ).toString('base64');

      await axios.post(
        url,
        new URLSearchParams({
          From: settings.twilio.fromNumber,
          To: to,
          Body: message,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          timeout: 10000,
        },
      );

      this.logger.log(`SMS sent via Twilio for tenant ${tenantId} to ${to}`);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(
        `Failed to send SMS for tenant ${tenantId}: ${message}`,
        stack,
      );
      return false;
    }
  }

  /**
   * Send a WhatsApp message via Twilio
   */
  async sendWhatsApp(
    tenantId: string,
    to: string,
    message: string,
  ): Promise<boolean> {
    try {
      const settings = await this.settingsService.getIntegrationSettings(
        tenantId,
      );

      if (!settings?.twilio?.enabled) {
        return false;
      }

      const url = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio.accountSid}/Messages.json`;

      const auth = Buffer.from(
        `${settings.twilio.accountSid}:${settings.twilio.authToken}`,
      ).toString('base64');

      await axios.post(
        url,
        new URLSearchParams({
          From: `whatsapp:${settings.twilio.fromNumber}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          timeout: 10000,
        },
      );

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send WhatsApp message: ${message}`);
      return false;
    }
  }
}
