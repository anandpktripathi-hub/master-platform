import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
  NotificationChannelSettingsDto,
} from '../dto/notification-settings.dto';

export const NOTIFICATION_KEY = 'notification.settings';

const DEFAULT_NOTIFICATION_EVENTS: Record<string, NotificationChannelSettingsDto> = {
  'crm.deal.created': { email: true, inApp: false, sms: false },
  'crm.deal.stage_changed': { email: true, inApp: false, sms: false },
  'crm.task.assigned': { email: true, inApp: false, sms: false },
  'crm.task.completed': { email: true, inApp: false, sms: false },
  // Billing-related defaults
  'billing.invoice.created': { email: true, inApp: true, sms: false },
  'billing.payment.succeeded': { email: true, inApp: true, sms: false },
  'billing.payment.failed': { email: true, inApp: true, sms: true },
  'billing.package.reactivated_offline': { email: true, inApp: true, sms: false },
  'billing.subscription.expiring_soon': { email: true, inApp: true, sms: true },
  'billing.subscription.terminated': { email: true, inApp: true, sms: true },
  'billing.ssl.expiring_soon': { email: true, inApp: true, sms: true },
};

export function notificationDtoToEntries(
  dto: UpdateNotificationSettingsDto,
): SettingEntryDto[] {
  return [{ key: NOTIFICATION_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToNotificationDto(
  items: Record<string, unknown>,
): NotificationSettingsDto {
  const raw = ((items && items[NOTIFICATION_KEY]) || {}) as Record<
    string,
    any
  >;

  const eventsRaw = (raw.events || {}) as Record<
    string,
    Partial<NotificationChannelSettingsDto>
  >;

  const events: Record<string, NotificationChannelSettingsDto> = {};
  for (const [eventKey, cfg] of Object.entries(eventsRaw)) {
    events[eventKey] = {
      email: Boolean(cfg.email),
      inApp: Boolean(cfg.inApp),
      sms: Boolean(cfg.sms),
    };
  }

  for (const [eventKey, cfg] of Object.entries(DEFAULT_NOTIFICATION_EVENTS)) {
    if (!events[eventKey]) {
      events[eventKey] = { ...cfg };
    }
  }

  return {
    events,
    defaultEmailTemplatePrefix: (raw.defaultEmailTemplatePrefix as string) || '',
  };
}
