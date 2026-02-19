import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
// ...existing code...
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { BillingModule } from './billing/billing.module';
import { ThemesModule } from './modules/themes/themes.module';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { TenantDatabaseService } from './tenants/database/database.service';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { DomainTenantMiddleware } from './common/middleware/domain-tenant.middleware';
import { TenantContextService } from './common/services/tenant-context.service';
import { TenantResolverService } from './common/services/tenant-resolver.service';
import { TenantTestController } from './common/controllers/tenant-test.controller';
import { DomainTestController } from './common/controllers/domain-test.controller';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
    }),
    AuthModule,
    // ...existing code...
    CategoriesModule,
    OrdersModule,
    PaymentsModule,
    UploadModule,
    EmailModule,
    TenantsModule,
    BillingModule,
    ThemesModule,
    HealthModule,
    DatabaseModule,
  ],
  controllers: [
    TenantTestController, // Test controller for verifying tenant middleware
    DomainTestController, // Test controller for verifying domain resolution
  ],
  providers: [
    RolesGuard,
    PermissionsGuard,
    TenantDatabaseService,
    TenantContextService, // REQUEST-scoped service for tenant context
    TenantResolverService, // Service for resolving tenant from domain
    // Optional: Uncomment to enable global RBAC enforcement on all routes
    // Note: this will require adding guards to all controllers/routes
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: TenantGuard,
    // },
  ],
  exports: [TenantDatabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware in order:
    // 1. DomainTenantMiddleware - Resolves tenant from hostname (subdomain/custom domain)
    // 2. TenantMiddleware - Extracts tenantId from JWT or uses domain resolution
    // 3. TenantContextMiddleware - Populates TenantContextService for DI
    consumer
      .apply(DomainTenantMiddleware, TenantMiddleware, TenantContextMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
