import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AccountingIdParamDto {
  @ApiProperty({ description: 'Resource id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  id!: string;
}
