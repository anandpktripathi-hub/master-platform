import { IsString, IsEnum } from 'class-validator';
import { BillingPeriod } from '../schemas/subscription.schema';

export class ChangePlanDto {
  @IsString()
  newPlanId: string;

  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;
}
