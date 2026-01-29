import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PackageService } from './services/package.service';
import { BillingNotificationService } from '../billing/billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';
import { SettingsService } from '../settings/settings.service';
import { entriesToApplicationDto } from '../settings/mappers/application-settings-mappers';

@Injectable()
export class SubscriptionExpiryScheduler {
  private readonly logger = new Logger(SubscriptionExpiryScheduler.name);

  constructor(
    private readonly packageService: PackageService,
    private readonly billingNotifications: BillingNotificationService,
    private readonly tenantsService: TenantsService,
    private readonly settingsService: SettingsService,
  ) {}

  // Runs once a day at 02:00 server time
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailySubscriptionExpiryWarnings() {
    try {
      const group = await this.settingsService.getGroupAdmin('application');
      const appSettings = entriesToApplicationDto(group.items);
      const globalDaysBeforeExpiry =
        appSettings.subscriptionExpiryWarningDays &&
        appSettings.subscriptionExpiryWarningDays > 0
          ? appSettings.subscriptionExpiryWarningDays
          : 3;
      const windowDays = await this.packageService.getMaxExpiryWarningWindow(
        globalDaysBeforeExpiry,
      );
      const processed = await this.packageService.sendSubscriptionExpiryWarnings(
        globalDaysBeforeExpiry,
        windowDays,
        this.billingNotifications,
        this.tenantsService,
      );
      this.logger.log(
        `Subscription expiry warning job processed ${processed} tenant package(s) with globalWindow=${globalDaysBeforeExpiry} days and effectiveWindow=${windowDays} days`,
      );

      const expiredCount =
        await this.packageService.expireTenantPackagesWithNotifications(
          this.billingNotifications,
          this.tenantsService,
        );
      if (expiredCount > 0) {
        this.logger.log(
          `Subscription termination job expired ${expiredCount} tenant package(s)`,
        );
      }
    } catch (error) {
      this.logger.error('Subscription expiry warning job failed', error as any);
    }
  }
}
