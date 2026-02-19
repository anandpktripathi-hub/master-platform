import { IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

export class FigmaImportDto {
  // Preferred field name
  @ValidateIf((o) => !o.url)
  @IsNotEmpty()
  @IsOptional()
  figmaUrl?: string;

  // Backwards-compatible alias used by some frontend code
  @ValidateIf((o) => !o.figmaUrl)
  @IsNotEmpty()
  @IsOptional()
  url?: string;

  // Preferred field name
  @ValidateIf((o) => !o.token)
  @IsNotEmpty()
  @IsOptional()
  accessToken?: string;

  // Backwards-compatible alias used by some frontend code
  @ValidateIf((o) => !o.accessToken)
  @IsNotEmpty()
  @IsOptional()
  token?: string;

  // Prefer tenant context header; allow explicit tenantId for backwards compatibility
  @IsOptional()
  tenantId?: string;
}
