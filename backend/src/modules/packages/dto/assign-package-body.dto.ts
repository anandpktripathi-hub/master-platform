import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class AssignPackageBodyDto {
  @ApiProperty({ description: 'Tenant id to assign the package to', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  tenantId!: string;

  @ApiPropertyOptional({ description: 'Whether to start a trial period', example: false })
  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;

  @ApiPropertyOptional({ description: 'Optional payment token/reference', example: 'tok_abc123' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  paymentToken?: string;

  @ApiPropertyOptional({ description: 'Payment gateway name', example: 'stripe' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  gatewayName?: string;
}
