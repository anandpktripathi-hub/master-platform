import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export const FEATURE_NODE_TYPES = [
  'module',
  'submodule',
  'feature',
  'subfeature',
  'option',
  'suboption',
  'point',
  'subpoint',
] as const;

export type FeatureNodeType = (typeof FEATURE_NODE_TYPES)[number];

export class FeatureNodeDto {
  @ApiProperty({ description: 'Unique node id' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Human-readable name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Node type', enum: FEATURE_NODE_TYPES })
  @IsIn(FEATURE_NODE_TYPES)
  type!: FeatureNodeType;

  @ApiProperty({ description: 'Whether the node is enabled', example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional({
    description: 'Child nodes',
    type: () => [FeatureNodeDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FeatureNodeDto)
  children?: FeatureNodeDto[];

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Allowed roles for this node',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @ApiPropertyOptional({
    description: 'Allowed tenants for this node',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedTenants?: string[];
}

export class UpdateFeatureNodeDto extends PartialType(FeatureNodeDto) {}

export class FeatureRegistryIdParamDto {
  @ApiProperty({ description: 'Feature node id' })
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class FeatureRegistryIdRoleParamDto {
  @ApiProperty({ description: 'Feature node id' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Role identifier' })
  @IsString()
  @IsNotEmpty()
  role!: string;
}

export class FeatureRegistryIdTenantParamDto {
  @ApiProperty({ description: 'Feature node id' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Tenant identifier' })
  @IsString()
  @IsNotEmpty()
  tenant!: string;
}

export class FeatureRegistryCreateQueryDto {
  @ApiPropertyOptional({ description: 'Optional parent node id' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  parentId?: string;
}
