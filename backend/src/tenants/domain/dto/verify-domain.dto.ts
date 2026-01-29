import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyDomainDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;
}
