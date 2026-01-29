import { IsArray, IsBoolean, IsString } from 'class-validator';

export class IpRestrictionSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsArray()
  @IsString({ each: true })
  allowedIps!: string[];
}

export class UpdateIpRestrictionSettingsDto extends IpRestrictionSettingsDto {}
