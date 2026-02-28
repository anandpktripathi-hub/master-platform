import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { PlanKey } from '../../../config/plans.config';

export class CreateTenantDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsIn(['FREE', 'PRO', 'ENTERPRISE'])
  planKey?: PlanKey;
}
