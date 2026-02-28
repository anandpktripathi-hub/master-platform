import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { TransactionType } from '../../../database/schemas/transaction.schema';

export class ListTransactionsQueryDto {
  @IsOptional()
  @IsMongoId()
  accountId?: string;
}

export class RecordTransactionDto {
  @IsMongoId()
  accountId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(['debit', 'credit'])
  type!: TransactionType;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}
