import { IsBoolean, IsMongoId, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class InstallPluginDto {
  @IsString()
  @MinLength(1)
  pluginId!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class TogglePluginDto {
  @IsString()
  @MinLength(1)
  pluginId!: string;

  @IsBoolean()
  enabled!: boolean;
}

export class TenantIdQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;
}
