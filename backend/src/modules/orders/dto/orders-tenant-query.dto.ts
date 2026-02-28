import { IsMongoId, IsOptional } from 'class-validator';

export class OrdersTenantQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;
}
