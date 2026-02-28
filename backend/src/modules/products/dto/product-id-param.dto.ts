import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ProductIdParamDto {
  @ApiProperty({ description: 'Product id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  id!: string;
}
