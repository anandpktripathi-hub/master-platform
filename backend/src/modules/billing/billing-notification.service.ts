import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { EmailService } from '../settings/email.service';
import { entriesToNotificationDto } from '../settings/mappers/notification-settings-mappers';
import type { NotificationSettingsDto } from '../settings/dto/notification-settings.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { TenantsService } from '../tenants/tenants.service';
import { TwilioIntegrationService } from '../../common/integrations/twilio-integration.service';
import { PushNotificationService } from '../../common/push-notification/push-notification.service';
import { PushSubscriptionsService } from '../notifications/push-subscriptions.service';

export type BillingEventKey =
  | 'billing.invoice.created'
  | 'billing.payment.succeeded'
  | 'billing.payment.failed'
  | 'billing.package.reactivated_offline'
  | 'billing.subscription.expiring_soon'
  | 'billing.subscription.terminated'
  | 'billing.ssl.expiring_soon';

@Injectable()
export class BillingNotificationService {
  private readonly logger = new Logger(BillingNotificationService.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly emailService: EmailService,
    private readonly notifications: NotificationsService,
    private readonly tenantsService: TenantsService,
    private readonly twilio: TwilioIntegrationService,
    private readonly pushNotifications: PushNotificationService,
    private readonly pushSubscriptions: PushSubscriptionsService,
  ) {}

  private async getNotificationSettings(): Promise<NotificationSettingsDto> {
    const res = await this.settingsService.getGroupAdmin('notifications');
    return entriesToNotificationDto(res.items);
  }

  private async isEmailEnabled(eventKey: BillingEventKey): Promise<boolean> {
    try {
      const settings = await this.getNotificationSettings();
      const cfg = settings.events?.[eventKey];
      return !!cfg?.email;
    } catch (error) {
      this.logger.error(
        `Failed to load notification settings for ${eventKey}`,
        error as any,
      );
      return false;
    }
  }

  async sendInvoiceCreatedEmail(params: {
    to: string;
    tenantId?: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
  }): Promise<void> {
    const eventKey: BillingEventKey = 'billing.invoice.created';
    const settings = await this.getNotificationSettings();
    const channel = settings.events?.[eventKey];
    const emailEnabled = !!channel?.email;
    const inAppEnabled = !!channel?.inApp;
    const smsEnabled = !!channel?.sms;
    const pushEnabled = !!channel?.push;

    const formattedAmount = `${(params.amount / 100).toFixed(2)} ${params.currency.toUpperCase()}`;

    if (emailEnabled) {
      await this.emailService.sendEmail({
        to: params.to,
        subject: `Invoice ${params.invoiceNumber} created`,
        html: `<p>Your new invoice <strong>${params.invoiceNumber}</strong> has been generated.</p>
               <p>Total amount: <strong>${formattedAmount}</strong></p>`,
      });
    }

    if (inAppEnabled && params.tenantId) {
      const userId = await this.resolveTenantPrimaryUserId(params.tenantId);
      if (userId) {
        await this.notifications
          .createForUser({
            tenantId: params.tenantId,
            userId,
            eventKey,
            title: `Invoice ${params.invoiceNumber} created`,
            message: `A new invoice (${params.invoiceNumber}) was generated for ${formattedAmount}.`,
            linkUrl: `/app/billing/invoices`,
          })
          .catch(() => undefined);
      }
    }

    if (smsEnabled && params.tenantId) {
      const phone = await this.resolveTenantBillingPhone(params.tenantId);
      if (phone) {
        const sms = `Invoice ${params.invoiceNumber} created for ${formattedAmount}.`;
        void this.twilio
          .sendSms(params.tenantId, phone, sms)
          .catch(() => undefined);
      }
    }

    if (pushEnabled && params.tenantId) {
      try {
        const subscriptions = await this.pushSubscriptions.getForTenant(
          params.tenantId,
        );

        if (subscriptions.length) {
          await this.pushNotifications.sendBatchNotifications(
            subscriptions.map((sub) => ({
              endpoint: sub.endpoint,
              keys: sub.keys,
            })),
            {
              title: `Invoice ${params.invoiceNumber} created`,
              body: `A new invoice (${params.invoiceNumber}) was generated for ${formattedAmount}.`,
              data: {
                eventKey,
                url: '/app/billing/invoices',
              },
            },
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to send push notification for ${eventKey}`,
          error as any,
        );
      }
    }
  }

  async sendPaymentResultEmail(params: {
    to: string;
    tenantId?: string;
    success: boolean;
    amount: number;
    currency: string;
    gatewayName?: string | null;
    error?: string | null;
  }): Promise<void> {
    const eventKey: BillingEventKey = params.success
      ? 'billing.payment.succeeded'
      : 'billing.payment.failed';

    const settings = await this.getNotificationSettings();
    const channel = settings.events?.[eventKey];
    const emailEnabled = !!channel?.email;
    const inAppEnabled = !!channel?.inApp;
    const smsEnabled = !!channel?.sms;

    const formattedAmount = `${(params.amount / 100).toFixed(2)} ${params.currency.toUpperCase()}`;

    const subject = params.success ? 'Payment succeeded' : 'Payment failed';

    const errorHtml = params.error
      ? `<p>Error details: <code>${params.error}</code></p>`
      : '';

    if (emailEnabled) {
      await this.emailService.sendEmail({
        to: params.to,
        subject,
        html: `<p>Your payment of <strong>${formattedAmount}</strong> via <strong>${
          params.gatewayName || 'gateway'
        }</strong> has ${params.success ? 'succeeded' : 'failed'}.</p>${errorHtml}`,
      });
    }

    if (inAppEnabled && params.tenantId) {
      const userId = await this.resolveTenantPrimaryUserId(params.tenantId);
      if (userId) {
        await this.notifications
          .createForUser({
            tenantId: params.tenantId,
            userId,
            eventKey,
            title: params.success ? 'Payment succeeded' : 'Payment failed',
            message: params.success
              ? `Payment of ${formattedAmount} via ${
                  params.gatewayName || 'gateway'
                } succeeded.`
              : `Payment of ${formattedAmount} via ${
                  params.gatewayName || 'gateway'
                } failed. ${params.error || ''}`,
            linkUrl: `/app/billing`,
          })
          .catch(() => undefined);
      }
    }

    if (smsEnabled && params.tenantId) {
      const phone = await this.resolveTenantBillingPhone(params.tenantId);
      if (phone) {
        const sms = params.success
          ? `Payment of ${formattedAmount} via ${
              params.gatewayName || 'gateway'
            } succeeded.`
          : `Payment of ${formattedAmount} via ${
              params.gatewayName || 'gateway'
            } failed. ${params.error || 'Check your billing page.'}`;

        void this.twilio
          .sendSms(params.tenantId, phone, sms)
          .catch(() => undefined);
      }
    }
  }

  async sendPackageReactivatedEmail(params: {
    to: string;
    tenantId?: string;
    packageName: string;
    expiresAt?: Date;
  }): Promise<void> {
    const eventKey: BillingEventKey = 'billing.package.reactivated_offline';
    const settings = await this.getNotificationSettings();
    const channel = settings.events?.[eventKey];
    const emailEnabled = !!channel?.email;
    const inAppEnabled = !!channel?.inApp;
    const smsEnabled = !!channel?.sms;

    const expiryText = params.expiresAt
      ? ` Your subscription is now active until <strong>${params.expiresAt.toDateString()}</strong>.`
      : '';

    if (emailEnabled) {
      await this.emailService.sendEmail({
        to: params.to,
        subject: 'Subscription reactivated via offline payment',
        html: `<p>Your package <strong>${params.packageName}</strong> has been reactivated based on your offline payment.</p>${expiryText}`,
      });
    }

    if (inAppEnabled && params.tenantId) {
      const userId = await this.resolveTenantPrimaryUserId(params.tenantId);
      if (userId) {
        await this.notifications
          .createForUser({
            tenantId: params.tenantId,
            userId,
            eventKey,
            title: 'Subscription reactivated',
            message: `Your package ${params.packageName} has been reactivated via offline payment.`,
            linkUrl: `/app/billing`,
          })
          .catch(() => undefined);
      }
    }

    if (smsEnabled && params.tenantId) {
      const phone = await this.resolveTenantBillingPhone(params.tenantId);
      if (phone) {
        const sms = params.expiresAt
          ? `Your subscription (${params.packageName}) has been reactivated. New expiry: ${params.expiresAt.toDateString()}.`
          : `Your subscription (${params.packageName}) has been reactivated.`;

        void this.twilio
          .sendSms(params.tenantId, phone, sms)
          .catch(() => undefined);
      }
    }
  }

  async sendSubscriptionExpiringSoonEmail(params: {
    to: string;
    tenantId?: string;
    packageName: string;
    expiresAt: Date;
    daysRemaining: number;
  }): Promise<void> {
    const eventKey: BillingEventKey = 'billing.subscription.expiring_soon';
    const settings = await this.getNotificationSettings();
    const channel = settings.events?.[eventKey];
    const emailEnabled = !!channel?.email;
    const inAppEnabled = !!channel?.inApp;
    const smsEnabled = !!channel?.sms;

    if (emailEnabled) {
      await this.emailService.sendEmail({
        to: params.to,
        subject: 'Subscription expiring soon',
        html: `<p>Your subscription for <strong>${params.packageName}</strong> is expiring in <strong>${params.daysRemaining} days</strong>.</p>
               <p>Expiry date: <strong>${params.expiresAt.toDateString()}</strong></p>`,
      });
    }

    if (inAppEnabled && params.tenantId) {
      const userId = await this.resolveTenantPrimaryUserId(params.tenantId);
      if (userId) {
        await this.notifications
          .createForUser({
            tenantId: params.tenantId,
            userId,
            eventKey,
            title: 'Subscription expiring soon',
            message: `Your subscription for ${params.packageName} is expiring in ${params.daysRemaining} days.`,
            linkUrl: `/app/billing`,
          })
          .catch(() => undefined);
      }
    }

    if (smsEnabled && params.tenantId) {
      const phone = await this.resolveTenantBillingPhone(params.tenantId);
      if (phone) {
        const sms = `Your subscription (${params.packageName}) expires in ${params.daysRemaining} day${
          params.daysRemaining === 1 ? '' : 's'
        } on ${params.expiresAt.toDateString()}.`;

        void this.twilio
          .sendSms(params.tenantId, phone, sms)
          .catch(() => undefined);
      }
    }
  }

  async sendSubscriptionTerminatedEmail(params: {
    to: string;
    tenantId?: string;
    packageName: string;
    expiredAt: Date;
  }): Promise<void> {
    const eventKey: BillingEventKey = 'billing.subscription.terminated';
    const settings = await this.getNotificationSettings();
    const channel = settings.events?.[eventKey];
    const emailEnabled = !!channel?.email;
    const inAppEnabled = !!channel?.inApp;
    const smsEnabled = !!channel?.sms;

    if (emailEnabled) {
      await this.emailService.sendEmail({
        to: params.to,
        subject: 'Subscription expired',
        html: `<p>Your subscription for <strong>${params.packageName}</strong> has now <strong>expired</strong>.</p>
               <p>Expiry date: <strong>${params.expiredAt.toDateString()}</strong></p>
               <p>You can reactivate your workspace at any time by choosing a plan and completing payment.</p>`,
      });
    }

    if (inAppEnabled && params.tenantId) {
      const userId = await this.resolveTenantPrimaryUserId(params.tenantId);
      if (userId) {
        await this.notifications
          .createForUser({
            tenantId: params.tenantId,
            userId,
            eventKey,
            title: 'Subscription expired',
            message: `Your subscription for ${params.packageName} has expired.`,
            linkUrl: `/app/billing`,
          })
          .catch(() => undefined);
      }
    }

    if (smsEnabled && params.tenantId) {
      const phone = await this.resolveTenantBillingPhone(params.tenantId);
      if (phone) {
        const sms = `Your subscription (${params.packageName}) has expired on ${params.expiredAt.toDateString()}. You can renew from the Billing page.`;

        void this.twilio
          .sendSms(params.tenantId, phone, sms)
          .catch(() => undefined);
      }
    }
  }

  async sendSslCertificateExpiringSoonEmail(params: {
    to: string;
    tenantId?: string;
    domain: string;
    expiresAt: Date;
    daysRemaining: number;
  }): Promise<void> {
    const eventKey: BillingEventKey = 'billing.ssl.expiring_soon';
    const settings = await this.getNotificationSettings();
    const channel = settings.events?.[eventKey];
    const emailEnabled = !!channel?.email;
    const inAppEnabled = !!channel?.inApp;
    const smsEnabled = !!channel?.sms;

    if (emailEnabled) {
      await this.emailService.sendEmail({
        to: params.to,
        subject: `SSL certificate for ${params.domain} is expiring soon`,
        html: `<p>The SSL certificate for your custom domain <strong>${params.domain}</strong> is expiring in <strong>${params.daysRemaining} day${
          params.daysRemaining === 1 ? '' : 's'
        }</strong>.</p>
               <p>Expiry date: <strong>${params.expiresAt.toDateString()}</strong></p>
               <p>Please renew or update your certificate to avoid downtime or browser security warnings.</p>`,
      });
    }

    if (inAppEnabled && params.tenantId) {
      const userId = await this.resolveTenantPrimaryUserId(params.tenantId);
      if (userId) {
        await this.notifications
          .createForUser({
            tenantId: params.tenantId,
            userId,
            eventKey,
            title: 'SSL certificate expiring soon',
            message: `SSL certificate for ${params.domain} is expiring in ${params.daysRemaining} day${
              params.daysRemaining === 1 ? '' : 's'
            }.`,
            linkUrl: `/app/admin/domains`,
          })
          .catch(() => undefined);
      }
    }
  }

  private async resolveTenantPrimaryUserId(
    tenantId: string,
  ): Promise<string | null> {
    try {
      const tenant = await this.tenantsService.getCurrentTenant(tenantId);
      if (!tenant) return null;

      if (tenant.createdByUserId) {
        return String(tenant.createdByUserId);
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to resolve primary user for tenantId=${tenantId}`,
        error as any,
      );
      return null;
    }
  }

  private async resolveTenantBillingPhone(
    tenantId: string,
  ): Promise<string | null> {
    try {
      const tenant = await this.tenantsService.getCurrentTenant(tenantId);
      if (!tenant) {
        return null;
      }

      if (tenant.companyPhone) {
        return String(tenant.companyPhone).trim();
      }

      if (tenant.contactPhonePublic) {
        return String(tenant.contactPhonePublic).trim();
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to resolve billing phone for tenantId=${tenantId}`,
        error as any,
      );
      return null;
    }
  }
}
