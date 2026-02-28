import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const HIERARCHY_NODE_TYPES = [
  'module',
  'submodule',
  'feature',
  'subfeature',
  'option',
  'suboption',
  'point',
  'subpoint',
] as const;

export type HierarchyNodeType = (typeof HIERARCHY_NODE_TYPES)[number];

export class HierarchyNodeIdParamDto {
  @IsMongoId()
  id!: string;
}

export class CreateHierarchyNodeDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(HIERARCHY_NODE_TYPES)
  type!: HierarchyNodeType;

  @IsOptional()
  @IsMongoId()
  parent?: string | null;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  children?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHierarchyNodeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsIn(HIERARCHY_NODE_TYPES)
  type?: HierarchyNodeType;

  @IsOptional()
  @IsMongoId()
  parent?: string | null;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  children?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GetHierarchyTreeQueryDto {
  @IsOptional()
  @IsIn(HIERARCHY_NODE_TYPES)
  rootType?: HierarchyNodeType;
}
