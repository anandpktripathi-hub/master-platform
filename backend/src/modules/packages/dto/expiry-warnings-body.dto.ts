import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ExpiryWarningsBodyDto {
  @ApiPropertyOptional({ description: 'Days before expiry to send warnings', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  daysBeforeExpiry?: number;
}
