import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class UserIdParamDto {
  @ApiProperty({ description: 'User id' })
  @IsMongoId()
  id!: string;
}
