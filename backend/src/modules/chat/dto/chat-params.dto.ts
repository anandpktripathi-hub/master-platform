import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RoomIdParamDto {
  @ApiProperty({ description: 'Chat room id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  roomId!: string;
}

export class RoomMemberParamDto {
  @ApiProperty({ description: 'Chat room id' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  roomId!: string;

  @ApiProperty({ description: 'User id to remove' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId!: string;
}
