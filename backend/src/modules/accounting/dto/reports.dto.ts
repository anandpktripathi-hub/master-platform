import { IsDateString, IsOptional } from 'class-validator';

export class ProfitAndLossQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class BalanceSheetQueryDto {
  @IsOptional()
  @IsDateString()
  asOf?: string;
}
