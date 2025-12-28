import { IsIn, IsString } from 'class-validator';

export class CurrencySettingsDto {
  @IsString()
  decimalFormat!: string;

  @IsString()
  defaultCurrencyCode!: string;

  @IsIn(['dot', 'comma'])
  decimalSeparator!: 'dot' | 'comma';

  @IsIn(['dot', 'comma', 'space', 'none'])
  thousandSeparator!: 'dot' | 'comma' | 'space' | 'none';

  @IsIn(['dot', 'comma'])
  floatNumberFormat!: 'dot' | 'comma';

  @IsIn(['with', 'without'])
  currencySymbolSpace!: 'with' | 'without';

  @IsIn(['pre', 'post'])
  currencySymbolPosition!: 'pre' | 'post';

  @IsIn(['symbol', 'name'])
  currencySymbolMode!: 'symbol' | 'name';
}

export class UpdateCurrencySettingsDto extends CurrencySettingsDto {}
