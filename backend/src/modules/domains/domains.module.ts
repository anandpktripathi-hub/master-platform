import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Domain, DomainSchema } from '../../database/schemas/domain.schema';
import {
  DomainResellerOrder,
  DomainResellerOrderSchema,
} from '../../database/schemas/domain-reseller-order.schema';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../../database/schemas/tenant-package.schema';
import { Package, PackageSchema } from '../../database/schemas/package.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '../../database/schemas/audit-log.schema';
import { DomainsController } from './domains.controller';
import { DomainService } from './services/domain.service';
import { DomainResellerService } from './services/domain-reseller.service';
import {
  StubDomainResellerProvider,
  CloudflareDomainResellerProvider,
  DOMAIN_RESELLER_PROVIDER_TOKEN,
  DomainResellerProvider,
} from './services/domain-reseller.provider';
import { AuditLogService } from '../../services/audit-log.service';
import { RoleGuard } from '../../guards/role.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Domain.name, schema: DomainSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Package.name, schema: PackageSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: DomainResellerOrder.name, schema: DomainResellerOrderSchema },
    ]),
  ],
  controllers: [DomainsController],
  providers: [
    DomainService,
    AuditLogService,
    RoleGuard,
    StubDomainResellerProvider,
    CloudflareDomainResellerProvider,
    {
      provide: DOMAIN_RESELLER_PROVIDER_TOKEN,
      useFactory: (
        stub: StubDomainResellerProvider,
        cloudflare: CloudflareDomainResellerProvider,
      ): DomainResellerProvider => {
        const provider = process.env.DOMAIN_RESELLER_PROVIDER;
        if (provider === 'cloudflare') {
          return cloudflare;
        }
        return stub;
      },
      inject: [StubDomainResellerProvider, CloudflareDomainResellerProvider],
    },
    DomainResellerService,
  ],
  exports: [DomainService, DomainResellerService, MongooseModule],
})
export class DomainsModule {}
