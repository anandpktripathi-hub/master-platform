import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class SelectPlanDto {
  @IsMongoId()
  packageId!: string;

  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;

  /**
   * For online payments, this is the gateway token/order id.
   * Example: Stripe token, PayPal order id, Paystack reference.
   */
  @IsOptional()
  @IsString()
  paymentToken?: string;

  /** Optional gateway name (e.g. "stripe", "paypal") */
  @IsOptional()
  @IsString()
  gatewayName?: string;
}

export class AdminSetPlanDto {
  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  packageId!: string;

  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;

  /** Optional note / metadata for audit purposes */
  @IsOptional()
  @IsString()
  notes?: string;
}
