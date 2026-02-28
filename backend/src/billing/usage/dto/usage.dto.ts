import { IsMongoId } from 'class-validator';

export class UsageTenantParamDto {
  @IsMongoId()
  tenantId!: string;
}
