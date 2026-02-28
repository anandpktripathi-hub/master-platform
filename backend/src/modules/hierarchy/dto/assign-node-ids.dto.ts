import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId,
  IsString,
  MinLength,
} from 'class-validator';

export class UserIdParamDto {
  @IsMongoId()
  userId!: string;
}

export class RoleNameParamDto {
  @IsString()
  @MinLength(1)
  roleName!: string;
}

export class DomainIdParamDto {
  @IsMongoId()
  domainId!: string;
}

export class PackageIdParamDto {
  @IsMongoId()
  packageId!: string;
}

export class BillingIdParamDto {
  @IsMongoId()
  billingId!: string;
}

export class AssignNodeIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  nodeIds!: string[];
}
