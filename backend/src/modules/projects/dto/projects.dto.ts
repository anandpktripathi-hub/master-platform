import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['planned', 'in_progress', 'completed', 'on_hold'])
  status?: 'planned' | 'in_progress' | 'completed' | 'on_hold';
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['planned', 'in_progress', 'completed', 'on_hold'])
  status?: 'planned' | 'in_progress' | 'completed' | 'on_hold';
}

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: 'todo' | 'in_progress' | 'done';

  @IsOptional()
  @IsMongoId()
  assigneeId?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: 'todo' | 'in_progress' | 'done';

  @IsOptional()
  @IsMongoId()
  assigneeId?: string;
}

export class LogTimeDto {
  @IsMongoId()
  taskId!: string;

  @IsMongoId()
  projectId!: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsNumber()
  @Min(0)
  hours!: number;
}
