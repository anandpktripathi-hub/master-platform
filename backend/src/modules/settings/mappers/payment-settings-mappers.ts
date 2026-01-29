import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  PaymentSettingsDto,
  UpdatePaymentSettingsDto,
  PaymentGatewayConfigDto,
} from '../dto/payment-settings.dto';

export const PAYMENT_KEY = 'payment.settings';

export function paymentDtoToEntries(
  dto: UpdatePaymentSettingsDto,
): SettingEntryDto[] {
  return [{ key: PAYMENT_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToPaymentDto(
  items: Record<string, unknown>,
): PaymentSettingsDto {
  const raw = ((items && items[PAYMENT_KEY]) || {}) as Record<string, any>;

  const gatewaysRaw = (raw.gateways || {}) as Record<
    string,
    Partial<PaymentGatewayConfigDto>
  >;

  const gateways: Record<string, PaymentGatewayConfigDto> = {};
  for (const [name, cfg] of Object.entries(gatewaysRaw)) {
    gateways[name] = {
      name,
      enabled: Boolean(cfg.enabled),
      publicKey: cfg.publicKey ?? '',
      secretKey: cfg.secretKey ?? '',
      webhookSecret: cfg.webhookSecret ?? '',
    };
  }

  return {
    enablePayments: Boolean(raw.enablePayments),
    gateways,
  };
}
