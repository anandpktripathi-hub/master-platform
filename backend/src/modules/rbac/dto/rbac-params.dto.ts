import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, MinLength } from 'class-validator';

export class RbacModuleParamDto {
  @ApiProperty({ description: 'Permission module name', example: 'billing' })
  @IsString()
  @MinLength(1)
  module!: string;
}

export class RoleIdParamDto {
  @ApiProperty({ description: 'Role id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  roleId!: string;
}

export class UserTenantIdParamDto {
  @ApiProperty({ description: 'UserTenant id', example: '507f191e810c19729de860ea' })
  @IsMongoId()
  userTenantId!: string;
}
