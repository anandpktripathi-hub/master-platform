import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class PackageIdParamDto {
  @ApiProperty({ description: 'Package id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  packageId!: string;
}
