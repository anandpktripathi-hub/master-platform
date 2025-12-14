import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';

// Usage: @Roles('platform_admin'), @Roles('tenant_admin'), @Roles('staff')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
