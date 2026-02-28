import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class PackageFeatureParamDto {
  @ApiProperty({ description: 'Feature key/name', example: 'custom_domains' })
  @IsString()
  @MinLength(1)
  feature!: string;
}
