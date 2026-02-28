import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCustomDomainDto {
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @IsOptional()
  @IsIn(['TXT', 'CNAME'])
  verificationMethod?: string;
}

export class UpdateCustomDomainDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
