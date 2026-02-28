import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

export class SimpleRegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  tenantName!: string;
}
