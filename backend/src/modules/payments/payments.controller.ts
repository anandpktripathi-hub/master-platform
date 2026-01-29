import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaymentLogService } from './services/payment-log.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../../guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('payments')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class PaymentsController {
  constructor(private readonly paymentLogService: PaymentLogService) {}

  /**
   * List payment attempts for observability and admin troubleshooting.
   * Restricted to platform super admins.
   */
  @Get('logs')
  @Roles('PLATFORM_SUPERADMIN')
  getPaymentLogs(
    @Query('tenantId') tenantId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    // Basic in-memory filtering; for production, prefer DB-backed queries.
    const all = this.paymentLogService.list(tenantId);

    if (!from && !to) {
      return all;
    }

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return all.filter((log) => {
      const created = new Date(log.createdAt);
      if (Number.isNaN(created.getTime())) return false;
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;
      return true;
    });
  }
}
