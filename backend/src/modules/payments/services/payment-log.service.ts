import { Injectable } from '@nestjs/common';

export interface PaymentLog {
  transactionId: string;
  tenantId: string;
  packageId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed';
  gatewayName?: string;
  error?: string;
  createdAt: Date;
}

@Injectable()
export class PaymentLogService {
  private logs: PaymentLog[] = [];

  record(log: PaymentLog) {
    this.logs.push(log);
  }

  list(tenantId?: string): PaymentLog[] {
    if (tenantId) return this.logs.filter(l => l.tenantId === tenantId);
    return this.logs;
  }

  listFailures(limit = 5): PaymentLog[] {
    return this.logs
      .filter((l) => l.status === 'failed')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}
