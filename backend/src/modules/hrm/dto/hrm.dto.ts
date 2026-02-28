import {
  IsDateString,
  IsEmail,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(1)
  firstName!: string;

  @IsString()
  @MinLength(1)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class ListAttendanceQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class RecordAttendanceDto {
  @IsMongoId()
  employeeId!: string;

  @IsIn(['present', 'absent', 'remote', 'on_leave'])
  status!: 'present' | 'absent' | 'remote' | 'on_leave';

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class CreateLeaveRequestDto {
  @IsMongoId()
  employeeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @MinLength(1)
  type!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateLeaveStatusDto {
  @IsIn(['pending', 'approved', 'rejected'])
  status!: 'pending' | 'approved' | 'rejected';
}

export class CreateJobPostingDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  department!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed';
}

export class CreateTrainingSessionDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  location?: string;
}
