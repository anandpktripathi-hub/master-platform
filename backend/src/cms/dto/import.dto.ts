import { IsOptional } from 'class-validator';

export class ImportZipDto {
  // Prefer tenant context header; allow explicit tenantId for backwards compatibility
  @IsOptional()
  tenantId?: string;
}
