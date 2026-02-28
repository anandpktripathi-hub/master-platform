import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ProfileHandleQueryDto {
  @ApiProperty({ description: 'Public profile handle to check', example: 'john-doe' })
  @IsString()
  @MinLength(1)
  handle!: string;
}
