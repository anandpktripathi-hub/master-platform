import { RolesGuard, ROLES_KEY } from './roles.guard';

export { ROLES_KEY };

// Alias to preserve existing imports expecting RoleGuard
export class RoleGuard extends RolesGuard {}
