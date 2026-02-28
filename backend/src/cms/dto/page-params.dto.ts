import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PageIdParamDto {
  @ApiProperty({ description: 'Page id', example: '65b3f0e7a2c5c1a1b2c3d4e5' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  id!: string;
}

export class PageSlugParamDto {
  @ApiProperty({ description: 'Page slug', example: 'about-us' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  slug!: string;
}
