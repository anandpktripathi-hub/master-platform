import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CustomDomain,
  CustomDomainDocument,
} from '../../database/schemas/custom-domain.schema';
import { CustomDomainService } from '../../modules/custom-domains/services/custom-domain.service';
import { SslService } from './ssl.service';

@Injectable()
export class SslAutomationService {
  private readonly logger = new Logger(SslAutomationService.name);

  constructor(
    @InjectModel(CustomDomain.name)
    private readonly customDomainModel: Model<CustomDomainDocument>,
    private readonly customDomainService: CustomDomainService,
    private readonly sslService: SslService,
  ) {}

  /**
   * Scan for verified custom domains that are configured for ACME
   * but do not yet have SSL issuance started, and initiate the
   * issuance flow using the existing CustomDomainService stub.
   */
  async runIssuanceSweep(): Promise<{ processed: number }> {
    const candidates = await this.customDomainModel
      .find({
        status: 'verified',
        sslProvider: 'acme',
        $or: [{ sslStatus: { $exists: false } }, { sslStatus: 'pending' }],
      })
      .lean();

    let processed = 0;

    for (const domain of candidates) {
      try {
        await this.customDomainService.issueSslCertificate(
          String(domain._id),
          String(domain.tenantId),
          'acme',
        );
        processed += 1;
      } catch (err) {
        this.logger.warn(
          `Failed to initiate ACME SSL for ${domain.domain}: ${(err as Error).message}`,
        );
      }
    }

    if (processed > 0) {
      this.logger.log(
        `SSL automation sweep initiated issuance for ${processed} custom domain(s)`,
      );
    }

    return { processed };
  }

  /**
   * Refresh SSL status for ACME-managed custom domains by checking
   * the underlying certificate files via SslService. This keeps the
   * database in sync with the actual certbot/ACME state.
   */
  async resyncStatuses(): Promise<{ updated: number }> {
    const managed = await this.customDomainModel.find({
      sslProvider: 'acme',
    });

    let updated = 0;

    for (const domain of managed) {
      try {
        const status = this.sslService.getSslStatus(domain.domain);
        if (status.ssl && domain.sslStatus !== 'issued') {
          domain.sslStatus = 'issued';
          domain.status = 'ssl_issued';
          await domain.save();
          updated += 1;
        }
      } catch (err) {
        this.logger.warn(
          `Failed to resync SSL status for ${domain.domain}: ${(err as Error).message}`,
        );
      }
    }

    if (updated > 0) {
      this.logger.log(
        `SSL automation resync updated ${updated} custom domain(s) to issued`,
      );
    }

    return { updated };
  }
}
