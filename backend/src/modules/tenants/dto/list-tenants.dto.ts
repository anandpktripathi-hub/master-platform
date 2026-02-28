import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ListTenantsQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  q?: string;
}
