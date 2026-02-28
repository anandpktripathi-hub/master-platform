import { IsNotEmpty, IsString } from 'class-validator';

export class TenantSeoSlugParamDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;
}
