import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Domain, DomainSchema } from '../../database/schemas/domain.schema';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../../database/schemas/tenant-package.schema';
import { Package, PackageSchema } from '../../database/schemas/package.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '../../database/schemas/audit-log.schema';
import { DomainController } from './domains.controller';
import { DomainService } from './services/domain.service';
import { AuditLogService } from '@services/audit-log.service';
import { RoleGuard } from '../../guards/role.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Domain.name, schema: DomainSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Package.name, schema: PackageSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [DomainController],
  providers: [DomainService, AuditLogService, RoleGuard],
  exports: [DomainService, MongooseModule],
})
export class DomainsModule {}
