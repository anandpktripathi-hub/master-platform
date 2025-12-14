import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min, IsEnum } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  priceMonthly: number;

  @IsNumber()
  @Min(0)
  priceYearly: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  userLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  storageLimitMB?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  ordersLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  productsLimit?: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  stripePriceIdMonthly?: string;

  @IsOptional()
  @IsString()
  stripePriceIdYearly?: string;

  @IsOptional()
  @IsString()
  razorpayPlanIdMonthly?: string;

  @IsOptional()
  @IsString()
  razorpayPlanIdYearly?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
