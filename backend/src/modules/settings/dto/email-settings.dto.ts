import { IsIn, IsNumber, IsString } from 'class-validator';

export class EmailSettingsDto {
  @IsString()
  globalFromEmail!: string;

  @IsString()
  smtpHost!: string;

  @IsString()
  smtpUsername!: string;

  @IsString()
  smtpPassword!: string;

  @IsString()
  smtpDriver!: string;

  @IsNumber()
  smtpPort!: number;

  @IsIn(['ssl', 'tls', 'none'])
  smtpEncryption!: 'ssl' | 'tls' | 'none';
}

export class UpdateEmailSettingsDto extends EmailSettingsDto {}
