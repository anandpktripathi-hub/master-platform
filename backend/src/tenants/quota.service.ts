import { Injectable, ForbiddenException, Logger } from '@nestjs/common';

export interface TenantQuota {
  maxUsers: number;
  maxStorageMb: number;
  maxApiCallsPerDay: number;
}

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);
  private quotas: Record<string, TenantQuota> = {};
  private usage: Record<
    string,
    { users: number; storageMb: number; apiCalls: number }
  > = {};

  setQuota(tenantId: string, quota: TenantQuota) {
    this.quotas[tenantId] = quota;
  }

  trackUser(tenantId: string) {
    this.usage[tenantId] = this.usage[tenantId] || {
      users: 0,
      storageMb: 0,
      apiCalls: 0,
    };
    this.usage[tenantId].users++;
    if (
      this.usage[tenantId].users > (this.quotas[tenantId]?.maxUsers || Infinity)
    ) {
      this.logger.warn('Quota breach detected', {
        tenantId,
        eventType: 'quota_breach',
        quotaType: 'users',
        current: this.usage[tenantId].users,
        limit: this.quotas[tenantId]?.maxUsers,
      });
      throw new ForbiddenException('User quota exceeded');
    }
  }

  trackStorage(tenantId: string, mb: number) {
    this.usage[tenantId] = this.usage[tenantId] || {
      users: 0,
      storageMb: 0,
      apiCalls: 0,
    };
    this.usage[tenantId].storageMb += mb;
    if (
      this.usage[tenantId].storageMb >
      (this.quotas[tenantId]?.maxStorageMb || Infinity)
    ) {
      this.logger.warn('Quota breach detected', {
        tenantId,
        eventType: 'quota_breach',
        quotaType: 'storage',
        current: this.usage[tenantId].storageMb,
        limit: this.quotas[tenantId]?.maxStorageMb,
      });
      throw new ForbiddenException('Storage quota exceeded');
    }
  }

  trackApiCall(tenantId: string) {
    this.usage[tenantId] = this.usage[tenantId] || {
      users: 0,
      storageMb: 0,
      apiCalls: 0,
    };
    this.usage[tenantId].apiCalls++;
    if (
      this.usage[tenantId].apiCalls >
      (this.quotas[tenantId]?.maxApiCallsPerDay || Infinity)
    ) {
      this.logger.warn('Quota breach detected', {
        tenantId,
        eventType: 'quota_breach',
        quotaType: 'api_calls',
        current: this.usage[tenantId].apiCalls,
        limit: this.quotas[tenantId]?.maxApiCallsPerDay,
      });
      throw new ForbiddenException('API call quota exceeded');
    }
  }

  resetApiCalls(tenantId: string) {
    if (this.usage[tenantId]) {
      this.usage[tenantId].apiCalls = 0;
    }
  }
}
