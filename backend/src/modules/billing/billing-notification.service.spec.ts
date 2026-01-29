import { Test, TestingModule } from '@nestjs/testing';
import { BillingNotificationService } from './billing-notification.service';
import { SettingsService } from '../settings/settings.service';
import { EmailService } from '../settings/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TenantsService } from '../tenants/tenants.service';
import { TwilioIntegrationService } from '../../common/integrations/twilio-integration.service';
import { PushNotificationService } from '../../common/push-notification/push-notification.service';
import { PushSubscriptionsService } from '../notifications/push-subscriptions.service';

describe('BillingNotificationService (push flow)', () => {
  let service: BillingNotificationService;
  let settingsService: jest.Mocked<SettingsService>;
  let emailService: jest.Mocked<EmailService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let tenantsService: jest.Mocked<TenantsService>;
  let twilio: jest.Mocked<TwilioIntegrationService>;
  let pushNotifications: jest.Mocked<PushNotificationService>;
  let pushSubscriptions: jest.Mocked<PushSubscriptionsService>;

  beforeEach(async () => {
    settingsService = {
      getGroupAdmin: jest.fn(),
    } as any;

    emailService = {
      sendEmail: jest.fn(),
    } as any;

    notificationsService = {
      createForUser: jest.fn(),
    } as any;

    tenantsService = {
      getCurrentTenant: jest.fn(),
    } as any;

    twilio = {
      sendSms: jest.fn(),
    } as any;

    pushNotifications = {
      sendBatchNotifications: jest.fn(),
    } as any;

    pushSubscriptions = {
      getForTenant: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingNotificationService,
        { provide: SettingsService, useValue: settingsService },
        { provide: EmailService, useValue: emailService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: TenantsService, useValue: tenantsService },
        { provide: TwilioIntegrationService, useValue: twilio },
        { provide: PushNotificationService, useValue: pushNotifications },
        { provide: PushSubscriptionsService, useValue: pushSubscriptions },
      ],
    }).compile();

    service = module.get(BillingNotificationService);
  });

  it('should not call push when channel.push is false', async () => {
    // Mock notification settings to disable push
    (service as any).getNotificationSettings = jest.fn().mockResolvedValue({
      events: {
        'billing.invoice.created': {
          email: true,
          push: false,
        },
      },
    });

    await service.sendInvoiceCreatedEmail({
      to: 'test@example.com',
      tenantId: 'tenant1',
      invoiceNumber: 'INV-1',
      amount: 1000,
      currency: 'usd',
    });

    expect(pushSubscriptions.getForTenant).not.toHaveBeenCalled();
    expect(pushNotifications.sendBatchNotifications).not.toHaveBeenCalled();
  });

  it('should send batch push notifications when enabled and subscriptions exist', async () => {
    (service as any).getNotificationSettings = jest.fn().mockResolvedValue({
      events: {
        'billing.invoice.created': {
          email: true,
          inApp: true,
          sms: true,
          push: true,
        },
      },
    });

    pushSubscriptions.getForTenant.mockResolvedValue([
      {
        endpoint: 'https://example.com/push/1',
        keys: { p256dh: 'p', auth: 'a' },
      } as any,
    ]);

    pushNotifications.sendBatchNotifications.mockResolvedValue([true]);

    await service.sendInvoiceCreatedEmail({
      to: 'test@example.com',
      tenantId: 'tenant1',
      invoiceNumber: 'INV-1',
      amount: 1000,
      currency: 'usd',
    });

    expect(pushSubscriptions.getForTenant).toHaveBeenCalledWith('tenant1');
    expect(pushNotifications.sendBatchNotifications).toHaveBeenCalledTimes(1);
    const [subsArg, payloadArg] =
      pushNotifications.sendBatchNotifications.mock.calls[0];
    expect(subsArg).toEqual([
      {
        endpoint: 'https://example.com/push/1',
        keys: { p256dh: 'p', auth: 'a' },
      },
    ]);
    expect(payloadArg.title).toContain('Invoice INV-1 created');
  });
});
