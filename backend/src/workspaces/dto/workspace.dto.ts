import { IsMongoId, IsNotEmpty } from 'class-validator';

export interface WorkspaceDto {
  id: string;
  name: string;
  slug?: string;
  planKey?: string;
  status?: string;
  isActive?: boolean;
  isCurrent?: boolean;
}

export class SwitchWorkspaceDto {
  @IsMongoId()
  @IsNotEmpty()
  workspaceId!: string;
}
