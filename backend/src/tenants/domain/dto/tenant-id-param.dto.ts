import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class TenantIdParamDto {
  @ApiProperty({ description: 'Tenant id' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  tenantId!: string;
}
