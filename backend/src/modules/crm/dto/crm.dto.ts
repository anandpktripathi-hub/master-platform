import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCrmContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  source?: string;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;
}

export class CreateCrmCompanyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'website must be a valid URL' })
  @MaxLength(300)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;
}

export enum CrmDealStage {
  NEW = 'NEW',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  WON = 'WON',
  LOST = 'LOST',
}

export class CreateCrmDealDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsMongoId()
  contactId?: string;

  @IsOptional()
  @IsMongoId()
  companyId?: string;

  @IsOptional()
  @IsEnum(CrmDealStage)
  stage?: CrmDealStage;

  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;
}

export class UpdateCrmDealStageDto {
  @IsEnum(CrmDealStage)
  stage!: CrmDealStage;
}

export class CreateCrmTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsMongoId()
  assigneeId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsMongoId()
  dealId?: string;
}

export class SetCrmTaskCompletedDto {
  @IsBoolean()
  completed!: boolean;
}
