import { IsString, MaxLength, MinLength } from 'class-validator';

export class SslDomainParamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  domain!: string;
}
