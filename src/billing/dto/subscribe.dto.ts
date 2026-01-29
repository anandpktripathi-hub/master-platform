import { IsString, IsEnum, IsOptional } from 'class-validator';
import { BillingPeriod } from '../schemas/subscription.schema';

export class SubscribeDto {
  @IsString()
  planId: string;

  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;

  @IsOptional()
  @IsString()
  paymentMethodId?: string; // Stripe payment method ID or Razorpay/PayPal reference

  // Preferred payment provider for checkout. Defaults to 'STRIPE' if omitted.
  @IsOptional()
  @IsString()
  provider?: 'STRIPE' | 'RAZORPAY' | 'PAYPAL' | 'MANUAL';
}
