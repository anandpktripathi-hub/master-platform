import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class SendConnectionRequestDto {
  @IsMongoId()
  recipientId!: string;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsIn(['PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE'])
  visibility?: 'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE';
}

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}

