import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoggerTestLogDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;

  @IsString()
  @IsIn(['error', 'warn', 'info', 'debug', 'verbose'])
  level!: 'error' | 'warn' | 'info' | 'debug' | 'verbose';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  context?: string;
}
