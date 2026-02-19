import { SetMetadata } from '@nestjs/common';
import type { Permission } from '../enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';

// Usage: @Permissions(Permission.CRM_READ)
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
