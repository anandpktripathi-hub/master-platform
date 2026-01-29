import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class PaymentGatewayConfigDto {
  @IsString()
  name!: string; // e.g. "stripe", "paypal", "paystack", "bank_transfer"

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  publicKey?: string;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsString()
  webhookSecret?: string;

  /**
   * Optional list of ISO currency codes this gateway supports directly
   * (e.g. ["USD", "EUR"]). If the requested currency is not in this list,
   * the amount will be converted to {@link baseCurrency} using
   * configured conversion rates before calling the gateway.
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedCurrencies?: string[];

  /**
   * Optional base currency code for this gateway (e.g. "USD"). When a
   * requested currency is not supported, it will be converted to this
   * currency before executing the charge.
   */
  @IsOptional()
  @IsString()
  baseCurrency?: string;

  /**
   * Per-module toggles (e.g. { packages: true, domains: false }) so that
   * a gateway can be enabled or disabled for specific billing modules
   * without changing code.
   */
  @IsOptional()
  modules?: Record<string, boolean>;
}

export class PaymentSettingsDto {
  @IsBoolean()
  enablePayments!: boolean;

  // JSON-serialized map of gateway name -> config
  gateways!: Record<string, PaymentGatewayConfigDto>;
}

export class UpdatePaymentSettingsDto extends PaymentSettingsDto {}
