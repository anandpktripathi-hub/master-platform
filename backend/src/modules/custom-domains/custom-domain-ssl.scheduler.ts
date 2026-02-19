import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomDomain } from '../../database/schemas/custom-domain.schema';
import { BillingNotificationService } from '../billing/billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';
import { AuditLogService } from '../../services/audit-log.service';
import { objectIdToString } from '../../utils/objectIdToString';

@Injectable()
export class CustomDomainSslScheduler {
  private readonly logger = new Logger(CustomDomainSslScheduler.name);

  // Default window for "expiring soon" notifications (in days)
  private readonly EXPIRY_WARNING_DAYS = 14;

  constructor(
    @InjectModel(CustomDomain.name)
    private readonly customDomainModel: Model<CustomDomain>,
    private readonly billingNotifications: BillingNotificationService,
    private readonly tenantsService: TenantsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailySslExpiryChecks(): Promise<void> {
    try {
      const now = new Date();

      // 1) Mark certificates as expired when sslExpiresAt has passed,
      //    and log an audit event per domain.
      const expiredCandidates = await this.customDomainModel.find({
        sslStatus: { $ne: 'expired' },
        sslExpiresAt: { $lte: now },
      });

      let expiredCount = 0;

      for (const domain of expiredCandidates) {
        const before = domain.toObject() as unknown as Record<string, unknown>;

        domain.sslStatus = 'expired';
        const saved = await domain.save();

        expiredCount += 1;

        await this.auditLogService.log({
          action: 'ssl_certificate_expired',
          tenantId: objectIdToString(domain.tenantId as any),
          resourceType: 'CustomDomain',
          resourceId: objectIdToString(domain._id as any),
          before,
          after: saved.toObject() as unknown as Record<string, unknown>,
          status: 'success',
        });
      }

      if (expiredCount > 0) {
        this.logger.log(
          `Custom domain SSL job marked ${expiredCount} certificate(s) as expired`,
        );
      }

      // 2) Send expiring-soon notifications within the warning window
      const warningWindowEnd = new Date(
        now.getTime() + this.EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000,
      );

      const expiringSoon = await this.customDomainModel
        .find({
          sslStatus: 'issued',
          sslExpiresAt: { $gt: now, $lte: warningWindowEnd },
        })
        .lean();

      if (!expiringSoon.length) {
        return;
      }

      let notifiedCount = 0;

      for (const domain of expiringSoon) {
        const tenantId = String(domain.tenantId);
        const email = await this.tenantsService.getTenantBillingEmail(tenantId);
        if (!email) {
          continue;
        }

        const expiresAt = domain.sslExpiresAt;
        const millisRemaining = expiresAt.getTime() - now.getTime();
        const daysRemaining = Math.max(
          1,
          Math.round(millisRemaining / (1000 * 60 * 60 * 24)),
        );

        await this.billingNotifications.sendSslCertificateExpiringSoonEmail({
          to: email,
          tenantId,
          domain: domain.domain,
          expiresAt,
          daysRemaining,
        });

        notifiedCount += 1;

        await this.auditLogService.log({
          action: 'ssl_expiry_warning_sent',
          tenantId,
          resourceType: 'CustomDomain',
          resourceId: objectIdToString(domain._id as any),
          status: 'success',
        });
      }

      if (notifiedCount > 0) {
        this.logger.log(
          `Custom domain SSL job sent expiring-soon notifications for ${notifiedCount} certificate(s)`,
        );
      }
    } catch (error) {
      this.logger.error('Custom domain SSL cron failed', error as any);
    }
  }
}
