import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetMenuQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  menuId?: string;
}
