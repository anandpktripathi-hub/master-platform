import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomDomain,
  CustomDomainSchema,
} from '../../database/schemas/custom-domain.schema';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../../database/schemas/tenant-package.schema';
import { Package, PackageSchema } from '../../database/schemas/package.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '../../database/schemas/audit-log.schema';
import { CustomDomainController } from './custom-domains.controller';
import { TenantDomainsController } from './tenant-domains.controller';
import { CustomDomainService } from './services/custom-domain.service';
import { AuditLogService } from '../../services/audit-log.service';
import { RoleGuard } from '../../guards/role.guard';
import { CustomDomainSslScheduler } from './custom-domain-ssl.scheduler';
import { BillingModule } from '../billing/billing.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomDomain.name, schema: CustomDomainSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Package.name, schema: PackageSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    forwardRef(() => BillingModule),
    forwardRef(() => TenantsModule),
  ],
  controllers: [CustomDomainController, TenantDomainsController],
  providers: [
    CustomDomainService,
    AuditLogService,
    RoleGuard,
    CustomDomainSslScheduler,
  ],
  exports: [CustomDomainService, MongooseModule],
})
export class CustomDomainsModule {}
