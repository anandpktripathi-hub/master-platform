import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly settingsService: SettingsService) {}

  async sendTestEmail(to: string): Promise<void> {
    try {
      // Fetch current email settings from DB
      const res = await this.settingsService.getGroupAdmin('email');
      const settings: Record<string, unknown> = {};
      interface SettingItem {
        key: string;
        value: unknown;
      }
      (res.items as SettingItem[]).forEach((item) => {
        settings[item.key] = item.value;
      });

      const globalFromEmail = settings.globalFromEmail as string | undefined;
      const smtpHost = settings.smtpHost as string | undefined;
      const smtpUsername = settings.smtpUsername as string | undefined;
      const smtpPassword = settings.smtpPassword as string | undefined;
      const smtpPort = settings.smtpPort as string | undefined;
      const smtpEncryption = settings.smtpEncryption as string | undefined;

      // Validate required fields
      if (!smtpHost || !smtpUsername || !smtpPassword || !smtpPort) {
        throw new HttpException(
          'SMTP settings incomplete. Please configure all SMTP fields.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Build transport config
      interface TransportConfig {
        host: string;
        port: number;
        auth: { user: string; pass: string };
        secure?: boolean;
        requireTLS?: boolean;
      }
      const transportConfig: TransportConfig = {
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        auth: {
          user: smtpUsername,
          pass: smtpPassword,
        },
      };

      // Apply encryption settings
      if (smtpEncryption === 'ssl') {
        transportConfig.secure = true;
      } else if (smtpEncryption === 'tls') {
        transportConfig.secure = false;
        transportConfig.requireTLS = true;
      } else {
        transportConfig.secure = false;
      }

      // Create Nodemailer transport
      const transporter = nodemailer.createTransport(transportConfig);

      // Send test email
      await transporter.sendMail({
        from: globalFromEmail || smtpUsername,
        to,
        subject: 'SMTP Test Email',
        text: 'If you received this, your SMTP settings are working.',
        html: '<p>If you received this, your SMTP settings are working.</p>',
      });
    } catch (error) {
      // Rethrow with user-friendly message
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to send test email: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
