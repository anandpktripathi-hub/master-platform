import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

export class PostChatMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}

export class ListChatMessagesQueryDto {
  @IsOptional()
  @IsString()
  before?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class ArchiveChatRoomDto {
  @IsBoolean()
  archived!: boolean;
}
