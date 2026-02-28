import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ReportsService } from './reports.service';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  TenantCommerceReportDto,
  TenantFinancialReportDto,
} from './dto/reports-response.dto';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
    roles?: string[];
    role?: string;
  };
}
@ApiTags('Reports')
@ApiBearerAuth('bearer')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reports: ReportsService) {}

  private getTenantIdFromRequest(req: AuthRequest): string {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in auth context');
    }
    return String(tenantId);
  }

  @Get('tenant/financial')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  @ApiOperation({ summary: 'Get tenant financial report' })
  @ApiResponse({ status: 200, description: 'Success', type: TenantFinancialReportDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantFinancial(@Req() req: AuthRequest): Promise<TenantFinancialReportDto> {
    try {
      const tenantId = this.getTenantIdFromRequest(req);
      return await this.reports.getTenantFinancialReport(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantFinancial] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('tenant/commerce')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  @ApiOperation({ summary: 'Get tenant commerce report' })
  @ApiResponse({ status: 200, description: 'Success', type: TenantCommerceReportDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantCommerce(@Req() req: AuthRequest): Promise<TenantCommerceReportDto> {
    try {
      const tenantId = this.getTenantIdFromRequest(req);
      return await this.reports.getTenantCommerceReport(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantCommerce] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }

  @Get('tenant/traffic')
  @Roles(
    'tenant_admin',
    'admin',
    'owner',
    'staff',
    'platform_admin',
    'PLATFORM_SUPER_ADMIN',
  )
  @ApiOperation({ summary: 'Get tenant traffic report' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getTenantTraffic(@Req() req: AuthRequest) {
    try {
      const tenantId = this.getTenantIdFromRequest(req);
      return await this.reports.getTenantTrafficReport(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getTenantTraffic] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
