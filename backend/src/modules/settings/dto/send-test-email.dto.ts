import { IsEmail, IsString } from 'class-validator';

export class SendTestEmailDto {
  @IsEmail()
  @IsString()
  testRecipient!: string;
}
