import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { GoalStatus } from '../../../database/schemas/goal.schema';

export class CreateGoalDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetAmount!: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['active', 'achieved', 'cancelled'])
  status?: GoalStatus;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['active', 'achieved', 'cancelled'])
  status?: GoalStatus;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
}
