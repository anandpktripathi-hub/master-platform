import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { WorkspaceGuard } from './guards/workspace.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { FeatureRegistryModule } from './feature-registry/featureRegistry.module';
import { DatabaseModule } from './database/database.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { IpRestrictionMiddleware } from './middleware/ip-restriction.middleware';
import { MetricsModule } from './metrics/metrics.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { ThemesModule } from './modules/themes/themes.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { DomainsModule } from './modules/domains/domains.module';
import { CustomDomainsModule } from './modules/custom-domains/custom-domains.module';
import { PackagesModule } from './modules/packages/packages.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CmsModule } from './cms/cms.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HierarchyModule } from './modules/hierarchy/hierarchy.module';
import { BillingModule } from './modules/billing/billing.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MonetizationModule } from './billing/monetization.module';
import { SupportModule } from './modules/support/support.module';
import { CrmModule } from './modules/crm/crm.module';
import { SocialModule } from './modules/social/social.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { HrmModule } from './modules/hrm/hrm.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PosModule } from './modules/pos/pos.module';
import { VcardsModule } from './modules/vcards/vcards.module';
import { WorkspaceModule } from './workspaces/workspace.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SeoModule } from './modules/seo/seo.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DeveloperPortalModule } from './modules/developer-portal/developer-portal.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { AiServicesModule } from './modules/ai-services/ai-services.module';
import { CalendarModule } from './common/calendar/calendar.module';
import { PushNotificationModule } from './common/push-notification/push-notification.module';
import { DomainResellerModule } from './common/domain-reseller/domain-reseller.module';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HealthModule,
    MetricsModule,
    DatabaseModule,
    UsersModule,
    TenantsModule,
    TenantModule,
    ProductsModule,
    ThemesModule,
    AuthModule,
    DashboardModule,
    ProfileModule,
    RbacModule,
    DomainsModule,
    CustomDomainsModule,
    PackagesModule,
    CouponsModule,
    OrdersModule,
    BillingModule,
    PaymentsModule,
    MonetizationModule,
    CmsModule,
    SettingsModule,
    HierarchyModule,
    FeatureRegistryModule,
    SupportModule,
    CrmModule,
    SocialModule,
    OnboardingModule,
    AccountingModule,
    HrmModule,
    ProjectsModule,
    PosModule,
    VcardsModule,
    WorkspaceModule,
    AnalyticsModule,
    SeoModule,
    NotificationsModule,
    ChatModule,
    ReportsModule,
    DeveloperPortalModule,
    MarketplaceModule,
    AiServicesModule,
    CalendarModule,
    PushNotificationModule,
    DomainResellerModule,
    StorageModule,
  ],
  controllers: [],
  providers: [
    IpRestrictionMiddleware,
    TenantMiddleware,
    // Default-secure posture: all routes require JWT + workspace context.
    // Use @Public() to explicitly opt-out on specific endpoints.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: WorkspaceGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Removed global wildcard and empty .forRoutes() for RateLimitMiddleware and SecurityHeadersMiddleware to avoid unsupported warnings

    // Only apply TenantMiddleware to tenant-specific routes
    consumer.apply(TenantMiddleware).forRoutes(
      // Add all tenant-specific route patterns here
      'api/v1/tenants/*path',
      'api/v1/tenant/*path',
      'api/v1/products/*path',
      'api/v1/themes/*path',
      'api/v1/dashboard/*path',
      'api/v1/profile/*path',
      'api/v1/rbac/*path',
      'api/v1/domains/*path',
      'api/v1/custom-domains/*path',
      'api/v1/packages/*path',
      'api/v1/coupons/*path',
      'api/v1/cms/*path',
      'api/v1/settings/*path',
      'api/v1/support/*path',
      'api/v1/crm/*path',
      'api/v1/social/*path',
      'api/v1/accounting/*path',
      'api/v1/hrm/*path',
      'api/v1/projects/*path',
      'api/v1/pos/*path',
      'api/v1/vcards/*path',
      'api/v1/notifications/*path',
      'api/v1/chat/*path',
      'api/v1/reports/*path',
      'api/v1/developer/*path',
      'api/v1/marketplace/*path',
      'api/v1/ai/*path',
    );

    // Apply security, IP restriction, and rate limiting middleware globally to all API routes
    consumer
      .apply(
        SecurityHeadersMiddleware,
        IpRestrictionMiddleware,
        RateLimitMiddleware,
      )
        .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
