import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BillingIdParamDto {
  @ApiProperty({ description: 'Billing id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  id!: string;
}
