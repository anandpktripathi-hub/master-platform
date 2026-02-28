import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CaptureAndSubscribeBodyDto {
  @ApiProperty({ description: 'Package id to subscribe to', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  packageId!: string;
}
