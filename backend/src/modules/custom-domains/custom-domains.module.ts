import { Module } from '@nestjs/common';
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
import { CustomDomainService } from './services/custom-domain.service';
import { AuditLogService } from '@services/audit-log.service';
import { RoleGuard } from '../../guards/role.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomDomain.name, schema: CustomDomainSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Package.name, schema: PackageSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [CustomDomainController],
  providers: [CustomDomainService, AuditLogService, RoleGuard],
  exports: [CustomDomainService, MongooseModule],
})
export class CustomDomainsModule {}
