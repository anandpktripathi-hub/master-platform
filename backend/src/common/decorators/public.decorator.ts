import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks an endpoint as publicly accessible (no JWT/workspace/role guard).
 *
 * Used together with global guards (APP_GUARD) to keep the default posture
 * secure while allowing explicit opt-out for health/auth/public profile routes.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
