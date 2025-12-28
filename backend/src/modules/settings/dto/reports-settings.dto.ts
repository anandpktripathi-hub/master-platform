import { IsArray, IsNumber, IsString } from 'class-validator';

export class ReportsSettingsDto {
  @IsNumber()
  defaultStartMonthOffset!: number;

  @IsArray()
  @IsString({ each: true })
  defaultStatusFilter!: string[];
}

export class UpdateReportsSettingsDto extends ReportsSettingsDto {}
