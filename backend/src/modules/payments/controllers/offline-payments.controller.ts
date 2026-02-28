import {
  BadRequestException,
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
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateOfflinePaymentRequestDto,
  ListOfflinePaymentsQueryDto,
  UpdateOfflinePaymentStatusDto,
} from '../dto/payments.dto';
@ApiTags('Offline Payments')
@ApiBearerAuth('bearer')
@Controller('offline-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfflinePaymentsController {
  constructor(private readonly offlinePayments: OfflinePaymentsService) {}

  @Post()
  @UseGuards(RateLimitGuard, RolesGuard)
  async createForTenant(
    @Tenant() tenantId: string,
    @Req() req: any,
    @Body() body: CreateOfflinePaymentRequestDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');

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
      metadata: body.metadata,
    });
  }

  @Get('me')
  async listMine(@Tenant() tenantId: string) {
    return this.offlinePayments.listForTenant(tenantId);
  }

  @Get()
  @Roles('PLATFORM_SUPER_ADMIN')
  async listAll(@Query() query: ListOfflinePaymentsQueryDto) {
    if (query.tenantId) {
      return this.offlinePayments.listForTenant(query.tenantId);
    }
    return this.offlinePayments.listAll();
  }

  @Patch(':id/status')
  @Roles('PLATFORM_SUPER_ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOfflinePaymentStatusDto,
  ) {
    return this.offlinePayments.updateStatus(id, body.status);
  }
}
