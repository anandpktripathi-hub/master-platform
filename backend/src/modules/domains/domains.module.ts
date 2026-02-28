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
  CloudflareDomainResellerProvider,
  HttpDomainResellerProvider,
  NotConfiguredDomainResellerProvider,
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
    CloudflareDomainResellerProvider,
    HttpDomainResellerProvider,
    NotConfiguredDomainResellerProvider,
    {
      provide: DOMAIN_RESELLER_PROVIDER_TOKEN,
      useFactory: (
        cloudflare: CloudflareDomainResellerProvider,
        http: HttpDomainResellerProvider,
        notConfigured: NotConfiguredDomainResellerProvider,
      ): DomainResellerProvider => {
        const provider = (
          process.env.DOMAIN_PROVIDER ||
          process.env.DOMAIN_RESELLER_PROVIDER ||
          ''
        )
          .trim()
          .toLowerCase();

        // If the base URL is configured, default to the HTTP provider even if
        // DOMAIN_PROVIDER isn't explicitly set.
        const hasHttpConfig = Boolean(
          (process.env.DOMAIN_RESELLER_BASE_URL || '').trim(),
        );

        if (provider === 'cloudflare') return cloudflare;
        if (provider === 'http' || provider === 'generic') return http;
        if (!provider && hasHttpConfig) return http;
        return notConfigured;
      },
      inject: [
        CloudflareDomainResellerProvider,
        HttpDomainResellerProvider,
        NotConfiguredDomainResellerProvider,
      ],
    },
    DomainResellerService,
  ],
  exports: [DomainService, DomainResellerService, MongooseModule],
})
export class DomainsModule {}
