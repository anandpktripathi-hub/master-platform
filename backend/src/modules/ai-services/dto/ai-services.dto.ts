import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AiCompletionRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  prompt!: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(4000)
  maxTokens?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}

export class AiSentimentRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  text!: string;
}

export class AiSuggestRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  topic!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  contentType!: string;
}
