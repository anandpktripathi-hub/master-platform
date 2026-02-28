import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UnifiedRegistrationRequestDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'ChangeMe123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ type: [String], description: 'Tenant ids to register into' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tenantIds!: string[];

  @ApiProperty({ type: [String], description: 'Roles to assign (per tenant)' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles!: string[];
}
