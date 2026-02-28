import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { AccountType } from '../../../database/schemas/account.schema';

export class CreateAccountDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsString()
  @Length(1, 64)
  code!: string;

  @IsEnum(['asset', 'liability', 'equity', 'income', 'expense'])
  type!: AccountType;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  code?: string;

  @IsOptional()
  @IsEnum(['asset', 'liability', 'equity', 'income', 'expense'])
  type?: AccountType;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}
