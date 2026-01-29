import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { DomainStatus } from '../../../cms/enums';

export class UpdateDomainDto {
  @IsString()
  domain!: string;

  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @IsEnum(DomainStatus)
  @IsOptional()
  status?: DomainStatus;

  @IsDate()
  @IsOptional()
  verifiedAt?: Date;
}
