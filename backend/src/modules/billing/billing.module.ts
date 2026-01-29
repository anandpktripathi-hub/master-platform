import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Billing, BillingSchema } from '../../database/schemas/billing.schema';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { RolesGuard } from '../../guards/roles.guard';
import { SettingsModule } from '../settings/settings.module';
import { BillingNotificationService } from './billing-notification.service';
import { TenantsModule } from '../tenants/tenants.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntegrationsModule } from '../../common/integrations/integrations.module';
import { PushNotificationModule } from '../../common/push-notification/push-notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Billing.name, schema: BillingSchema }]),
    SettingsModule,
    forwardRef(() => TenantsModule),
    NotificationsModule,
    IntegrationsModule,
    PushNotificationModule,
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    RolesGuard,
    BillingNotificationService,
    // Decorator factories (Roles, Tenant) should not be providers
  ],
  exports: [BillingService, BillingNotificationService],
})
export class BillingModule {}
