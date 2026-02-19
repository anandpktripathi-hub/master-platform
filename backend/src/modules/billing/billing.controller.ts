import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Patch,
  Param,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { Billing } from '../../database/schemas/billing.schema';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';

@Controller('billings')
@UseGuards(RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * PLATFORM ADMIN ENDPOINTS
   */

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  findAllForAdmin(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const parseDate = (value?: string) => {
      if (!value) return undefined;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException('Invalid date filter');
      }
      return d;
    };

    return this.billingService.findAllForAdmin({
      tenantId: tenantId?.trim() || undefined,
      status: status?.trim() || undefined,
      from: parseDate(from),
      to: parseDate(to),
    });
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  createForAdmin(
    @Body()
    body: {
      tenantId: string;
      amount: number;
      currency: string;
      status: string;
    },
  ) {
    const tenantId = body.tenantId?.trim();
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.billingService.createForTenant(
      {
        amount: body.amount,
        currency: body.currency,
        status: body.status,
      } as any,
      tenantId,
    );
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  updateForAdmin(
    @Param('id') id: string,
    @Body() body: { amount?: number; currency?: string; status?: string },
  ) {
    return this.billingService.updateForAdmin(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  removeForAdmin(@Param('id') id: string) {
    return this.billingService.removeForAdmin(id);
  }

  @Get()
  findAll(@Tenant() tenantId: string) {
    return this.billingService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @UseGuards(RateLimitGuard, RolesGuard)
  create(@Body() createBillingDto: Billing, @Tenant() tenantId: string) {
    return this.billingService.create(createBillingDto, tenantId);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(RateLimitGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateBillingDto: Billing,
    @Tenant() tenantId: string,
  ) {
    return this.billingService.update(id, updateBillingDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }
}
