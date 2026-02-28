import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ProfileHandleParamDto {
  @ApiProperty({ description: 'Public profile handle', example: 'john-doe' })
  @IsString()
  @MinLength(1)
  handle!: string;
}
