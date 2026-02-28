import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsObject({ each: true })
  widgets!: Record<string, any>[];
}

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  widgets?: Record<string, any>[];
}
