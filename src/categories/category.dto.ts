import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  parentId?: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  parentId?: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
