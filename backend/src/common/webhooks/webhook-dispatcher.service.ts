import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../../modules/settings/settings.service';
import axios, { AxiosRequestConfig } from 'axios';

export interface WebhookPayload {
  event: string;
  tenantId: string;
  timestamp: string;
  data: any;
}

@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger(WebhookDispatcherService.name);

  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Dispatch an event to all configured webhooks for this tenant
   */
  async dispatchEvent(
    tenantId: string,
    eventKey: string,
    data: any,
  ): Promise<void> {
    try {
      // Fetch webhook settings for this tenant
      const webhookSettings =
        await this.settingsService.getWebhookSettings(tenantId);

      if (!webhookSettings?.hooks) {
        this.logger.debug(
          `No webhook settings found for tenant ${tenantId}, skipping dispatch`,
        );
        return;
      }

      const hook = webhookSettings.hooks[eventKey];
      if (!hook || !hook.enabled || !hook.url) {
        this.logger.debug(
          `Webhook for event '${eventKey}' not configured or disabled for tenant ${tenantId}`,
        );
        return;
      }

      // Build payload
      const payload: WebhookPayload = {
        event: eventKey,
        tenantId,
        timestamp: new Date().toISOString(),
        data,
      };

      // Build request config
      const config: AxiosRequestConfig = {
        method: 'POST',
        url: hook.url,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmetaSC-Webhooks/1.0',
        },
        data: payload,
        timeout: 10000, // 10s timeout
      };

      // Add custom secret header if configured
      if (hook.secretHeaderName && hook.secretHeaderValue) {
        if (!config.headers) {
          config.headers = {};
        }
        (config.headers as Record<string, string>)[hook.secretHeaderName] =
          hook.secretHeaderValue;
      }

      // Send webhook
      this.logger.log(
        `Dispatching webhook '${eventKey}' to ${hook.url} for tenant ${tenantId}`,
      );
      const response = await axios(config);
      this.logger.log(
        `Webhook '${eventKey}' dispatched successfully: ${response.status}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(
        `Failed to dispatch webhook '${eventKey}' for tenant ${tenantId}: ${message}`,
        stack,
      );
      // Don't throw - webhooks are fire-and-forget
    }
  }

  /**
   * Dispatch multiple events in parallel (fire-and-forget)
   */
  async dispatchBatch(
    tenantId: string,
    events: Array<{ eventKey: string; data: any }>,
  ): Promise<void> {
    const promises = events.map((e) =>
      this.dispatchEvent(tenantId, e.eventKey, e.data),
    );
    await Promise.allSettled(promises);
  }
}
