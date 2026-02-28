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
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AdminCreateBillingDto,
  AdminUpdateBillingDto,
  BillingAdminListQueryDto,
  CreateBillingDto,
  UpdateBillingDto,
} from './dto/billing.dto';
@ApiTags('Billing')
@ApiBearerAuth('bearer')
@Controller('billings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * PLATFORM ADMIN ENDPOINTS
   */

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  findAllForAdmin(@Query() query: BillingAdminListQueryDto) {
    const parseDate = (value?: string) => {
      if (!value) return undefined;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException('Invalid date filter');
      }
      return d;
    };

    return this.billingService.findAllForAdmin({
      tenantId: query.tenantId?.trim() || undefined,
      status: query.status?.trim() || undefined,
      from: parseDate(query.from),
      to: parseDate(query.to),
    });
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  createForAdmin(@Body() body: AdminCreateBillingDto) {
    const tenantId = body.tenantId?.trim();
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.billingService.createForTenant(
      {
        amount: body.amount,
        currency: body.currency,
        status: body.status,
      },
      tenantId,
    );
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  updateForAdmin(@Param('id') id: string, @Body() body: AdminUpdateBillingDto) {
    return this.billingService.updateForAdmin(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  removeForAdmin(@Param('id') id: string) {
    return this.billingService.removeForAdmin(id);
  }

  @Get()
  @Roles('admin')
  @UseGuards(TenantGuard)
  findAll(@Tenant() tenantId: string) {
    return this.billingService.findAll(tenantId);
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(TenantGuard)
  findOne(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.billingService.findOne(id, tenantId);
  }

  @Post()
  @Roles('admin')
  @UseGuards(TenantGuard, RateLimitGuard, RolesGuard)
  create(@Body() createBillingDto: CreateBillingDto, @Tenant() tenantId: string) {
    return this.billingService.create(createBillingDto, tenantId);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(TenantGuard, RateLimitGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateBillingDto: UpdateBillingDto,
    @Tenant() tenantId: string,
  ) {
    return this.billingService.update(id, updateBillingDto, tenantId);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(TenantGuard)
  remove(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.billingService.remove(id, tenantId);
  }
}
