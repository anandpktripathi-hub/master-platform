import {
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ListOrdersQueryDto {
  @IsOptional()
  @IsMongoId()
  tenantId?: string;

  @IsOptional()
  @IsIn(['pos', 'domain'])
  source?: 'pos' | 'domain';

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
