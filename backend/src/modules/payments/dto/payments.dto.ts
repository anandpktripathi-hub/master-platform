import {
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class GetPaymentLogsQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class CapturePaypalOrderQueryDto {
  @IsString()
  @MinLength(1)
  orderId!: string;
}

export class CreateOfflinePaymentRequestDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @MinLength(3)
  currency!: string;

  @IsString()
  @MinLength(1)
  method!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class ListOfflinePaymentsQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;
}

export class ListPaymentFailuresQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class UpdateOfflinePaymentStatusDto {
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'])
  status!: 'pending' | 'approved' | 'rejected';
}
