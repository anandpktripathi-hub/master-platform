import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class OfflinePaymentIdParamDto {
  @ApiProperty({ description: 'Offline payment request id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  id!: string;
}
