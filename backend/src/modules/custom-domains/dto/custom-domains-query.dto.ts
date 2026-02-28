import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CustomDomainIdParamDto {
  @ApiProperty({ description: 'Custom domain id' })
  @IsMongoId()
  domainId!: string;
}

export class CustomDomainsListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', example: 'pending' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({ description: 'Limit', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Skip', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}

export class CustomDomainsAdminListQueryDto extends CustomDomainsListQueryDto {
  @ApiPropertyOptional({ description: 'Filter by tenant id' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tenantId?: string;
}
