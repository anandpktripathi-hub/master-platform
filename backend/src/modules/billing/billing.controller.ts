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
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RoleGuard } from '../../guards/role.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminCreateBillingDto,
  AdminUpdateBillingDto,
  BillingAdminListQueryDto,
  CreateBillingDto,
  UpdateBillingDto,
} from './dto/billing.dto';
import { BillingIdParamDto } from './dto/billing-id-param.dto';
@ApiTags('Billing')
@ApiBearerAuth('bearer')
@Controller('billings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(private readonly billingService: BillingService) {}

  /**
   * PLATFORM ADMIN ENDPOINTS
   */

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'List billings (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAllForAdmin(@Query() query: BillingAdminListQueryDto) {
    try {
      const parseDate = (value?: string) => {
        if (!value) return undefined;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
          throw new BadRequestException('Invalid date filter');
        }
        return d;
      };

      return await this.billingService.findAllForAdmin({
        tenantId: query.tenantId?.trim() || undefined,
        status: query.status?.trim() || undefined,
        from: parseDate(query.from),
        to: parseDate(query.to),
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[findAllForAdmin] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list billings');
    }
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Create billing for tenant (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createForAdmin(@Body() body: AdminCreateBillingDto) {
    try {
      const tenantId = body.tenantId?.trim();
      if (!tenantId) {
        throw new BadRequestException('tenantId is required');
      }
      return await this.billingService.createForTenant(
        {
          amount: body.amount,
          currency: body.currency,
          status: body.status,
        },
        tenantId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createForAdmin] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create billing');
    }
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Update billing (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateForAdmin(
    @Param() params: BillingIdParamDto,
    @Body() body: AdminUpdateBillingDto,
  ) {
    try {
      return await this.billingService.updateForAdmin(params.id, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateForAdmin] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update billing');
    }
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RateLimitGuard, RoleGuard)
  @Roles('PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Delete billing (platform admin)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async removeForAdmin(@Param() params: BillingIdParamDto) {
    try {
      return await this.billingService.removeForAdmin(params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[removeForAdmin] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete billing');
    }
  }

  @Get()
  @Roles('admin')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'List billings (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Tenant() tenantId: string) {
    try {
      return await this.billingService.findAll(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findAll] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list billings');
    }
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Get billing by id (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOne(
    @Param() params: BillingIdParamDto,
    @Tenant() tenantId: string,
  ) {
    try {
      return await this.billingService.findOne(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findOne] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch billing');
    }
  }

  @Post()
  @Roles('admin')
  @UseGuards(TenantGuard, RateLimitGuard, RolesGuard)
  @ApiOperation({ summary: 'Create billing (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createBillingDto: CreateBillingDto,
    @Tenant() tenantId: string,
  ) {
    try {
      return await this.billingService.create(createBillingDto, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[create] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create billing');
    }
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(TenantGuard, RateLimitGuard, RolesGuard)
  @ApiOperation({ summary: 'Update billing (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param() params: BillingIdParamDto,
    @Body() updateBillingDto: UpdateBillingDto,
    @Tenant() tenantId: string,
  ) {
    try {
      return await this.billingService.update(
        params.id,
        updateBillingDto,
        tenantId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[update] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update billing');
    }
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Delete billing (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(
    @Param() params: BillingIdParamDto,
    @Tenant() tenantId: string,
  ) {
    try {
      return await this.billingService.remove(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[remove] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete billing');
    }
  }
}
