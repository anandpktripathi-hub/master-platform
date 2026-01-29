import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TenantDatabaseService } from '../../tenants/database/database.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantDatabaseService: TenantDatabaseService) {}

  canActivate(context: ExecutionContext): boolean {
    // Add logic as needed
    return true;
  }
}
