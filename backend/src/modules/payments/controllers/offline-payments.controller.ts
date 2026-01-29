import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OfflinePaymentsService } from '../services/offline-payments.service';
import { RolesGuard } from '../../../guards/roles.guard';
import { Roles } from '../../../decorators/roles.decorator';
import { Tenant } from '../../../decorators/tenant.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';

@Controller('offline-payments')
@UseGuards(RolesGuard)
export class OfflinePaymentsController {
  constructor(private readonly offlinePayments: OfflinePaymentsService) {}

  @Post()
  @UseGuards(RateLimitGuard, RolesGuard)
  async createForTenant(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Body()
    body: {
      amount: number;
      currency: string;
      method: string;
      description?: string;
      proofUrl?: string;
    },
  ) {
    const userId =
      req?.user?.id || req?.user?._id || req?.user?.userId || tenantId;

    return this.offlinePayments.createRequest({
      tenantId,
      userId,
      amount: body.amount,
      currency: body.currency,
      method: body.method,
      description: body.description,
      proofUrl: body.proofUrl,
    });
  }

  @Get('me')
  async listMine(@Tenant() tenantId: string) {
    return this.offlinePayments.listForTenant(tenantId);
  }

  @Get()
  @Roles('PLATFORM_SUPER_ADMIN')
  async listAll(@Query('tenantId') tenantId?: string) {
    if (tenantId) {
      return this.offlinePayments.listForTenant(tenantId);
    }
    return this.offlinePayments.listAll();
  }

  @Patch(':id/status')
  @Roles('PLATFORM_SUPER_ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'approved' | 'rejected' },
  ) {
    return this.offlinePayments.updateStatus(id, body.status);
  }
}
