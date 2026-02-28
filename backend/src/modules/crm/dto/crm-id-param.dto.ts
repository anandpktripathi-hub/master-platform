import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrmIdParamDto {
  @ApiProperty({ description: 'CRM entity id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  id!: string;
}
