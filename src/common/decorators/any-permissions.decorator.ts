import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';

export const ANY_PERMISSIONS_KEY = 'anyPermissions';
export const AnyPermissions = (...permissions: Permission[]) => SetMetadata(ANY_PERMISSIONS_KEY, permissions);
