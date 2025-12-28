import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class ReferralSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsNumber()
  commissionPercent!: number;

  @IsNumber()
  minimumThresholdAmount!: number;

  @IsString()
  guidelines!: string;
}

export class UpdateReferralSettingsDto extends ReferralSettingsDto {}
