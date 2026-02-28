import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PublicContactFormDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsIn(['website', 'vcard'])
  source?: 'website' | 'vcard';
}
