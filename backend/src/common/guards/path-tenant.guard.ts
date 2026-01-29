import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class PathTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request['tenantId'];
    if (!tenantId) {
      throw new ForbiddenException('Tenant ID missing in path');
    }
    // Optionally, add more validation here
    return true;
  }
}
