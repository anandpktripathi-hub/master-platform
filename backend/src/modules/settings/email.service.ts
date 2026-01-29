import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get SMTP transporter configured with current settings
   */
  private async getTransporter(): Promise<nodemailer.Transporter> {
    const res = await this.settingsService.getGroupAdmin('email');
    const settings: Record<string, unknown> = {};
    interface SettingItem {
      key: string;
      value: unknown;
    }
    (res.items as SettingItem[]).forEach((item) => {
      settings[item.key] = item.value;
    });

    const smtpHost = settings.smtpHost as string | undefined;
    const smtpUsername = settings.smtpUsername as string | undefined;
    const smtpPassword = settings.smtpPassword as string | undefined;
    const smtpPort = settings.smtpPort as string | undefined;
    const smtpEncryption = settings.smtpEncryption as string | undefined;

    if (!smtpHost || !smtpUsername || !smtpPassword || !smtpPort) {
      throw new HttpException(
        'SMTP settings incomplete. Please configure all SMTP fields.',
        HttpStatus.BAD_REQUEST,
      );
    }

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

    if (smtpEncryption === 'ssl') {
      transportConfig.secure = true;
    } else if (smtpEncryption === 'tls') {
      transportConfig.secure = false;
      transportConfig.requireTLS = true;
    } else {
      transportConfig.secure = false;
    }

    return nodemailer.createTransport(transportConfig);
  }

  /**
   * Get from email address
   */
  private async getFromEmail(): Promise<string> {
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
    const smtpUsername = settings.smtpUsername as string | undefined;

    return globalFromEmail || smtpUsername || 'noreply@platform.com';
  }

  /**
   * Send an email with custom content
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      const fromEmail = await this.getFromEmail();

      await transporter.sendMail({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to send email: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(to: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'SMTP Test Email',
      html: '<p>If you received this, your SMTP settings are working.</p>',
      text: 'If you received this, your SMTP settings are working.',
    });
  }
}
