import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class PlatformSuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user: { role?: string } = req.user;
    if (!user) return false;
    // Temporary simple check against role string
    return user?.role === 'PLATFORM_SUPER_ADMIN';
  }
}
