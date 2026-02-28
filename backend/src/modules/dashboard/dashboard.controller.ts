import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  HttpException,
  InternalServerErrorException,
  Logger,
  Param,
  UseGuards,
  BadRequestException,
  Query,
  Res,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { AuditLogService } from '../../services/audit-log.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { Response } from 'express';
import { CreateDashboardDto, UpdateDashboardDto } from './dto/dashboard.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditLogsQueryDto } from './dto/audit-logs-query.dto';
import { DashboardIdParamDto } from './dto/dashboard-id-param.dto';
@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@Controller('dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly auditLogService: AuditLogService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Get audit logs for the current tenant.
   * Returns paginated, most-recent-first audit log entries so
   * tenant admins can see who changed what.
   */
  @Get('audit/logs')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Get audit logs for current tenant' })
  @ApiResponse({ status: 200, description: 'Audit logs returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAuditLogs(
    @Tenant() tenantId: string,
    @Query() query: AuditLogsQueryDto,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      const parsedStartDate = query.startDate ? new Date(query.startDate) : undefined;
      const parsedEndDate = query.endDate ? new Date(query.endDate) : undefined;

      return await this.auditLogService.getTenantLogs(tenantId, {
        limit: query.limit,
        skip: query.skip,
        sortBy: query.sortBy || '-createdAt',
        action: query.action,
        actionPrefix: query.actionPrefix,
        resourceType: query.resourceType,
        resourceId: query.resourceId,
        status: query.status,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getAuditLogs] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch audit logs');
    }
  }

  /**
   * Export audit logs for the current tenant as CSV, using the same filters
   * as the standard audit logs endpoint.
   */
  @Get('audit/logs/export')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Export audit logs for current tenant as CSV' })
  @ApiResponse({ status: 200, description: 'CSV exported' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async exportAuditLogs(
    @Tenant() tenantId: string,
    @Query() query: AuditLogsQueryDto,
    @Res() res: Response,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      const parsedStartDate = query.startDate ? new Date(query.startDate) : undefined;
      const parsedEndDate = query.endDate ? new Date(query.endDate) : undefined;

      const logs = await this.auditLogService.getTenantLogsForExport(tenantId, {
        sortBy: query.sortBy || '-createdAt',
        action: query.action,
        actionPrefix: query.actionPrefix,
        resourceType: query.resourceType,
        resourceId: query.resourceId,
        status: query.status,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });

    const header = [
      'Time',
      'User',
      'Action',
      'ResourceType',
      'ResourceId',
      'Status',
      'IP',
      'UserAgent',
    ];

    const rows = logs.map((log) => {
      const actor: any = (log as any).actorId;
      const user =
        typeof actor === 'string' ? actor : actor?.email || actor?.name || '';

      const createdAt = log.createdAt
        ? new Date(log.createdAt).toISOString()
        : '';

      const resourceTypeValue = (log as any).resourceType ?? '';
      const resourceIdValue = (log as any).resourceId ?? '';
      const statusValue = (log as any).status ?? '';
      const ipValue = (log as any).ip ?? '';
      const userAgentValue = (log as any).userAgent ?? '';

      const fields = [
        createdAt,
        user,
        log.action,
        resourceTypeValue,
        resourceIdValue,
        statusValue,
        ipValue,
        userAgentValue,
      ];

      return fields
        .map((value) => {
          const str = String(value ?? '');
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',');
    });

      const csv = [header.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="audit-logs.csv"',
      );

      return res.send(csv);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[exportAuditLogs] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to export audit logs');
    }
  }

  /**
   * SaaS super-admin overview dashboard.
   * Wrapper around AnalyticsService.getSaasOverview exposed under
   * /dashboards/admin/saas-overview for frontend dashboards.
   */
  @Get('admin/saas-overview')
  @Roles('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPERADMIN')
  @ApiOperation({ summary: 'Get SaaS super-admin overview dashboard' })
  @ApiResponse({ status: 200, description: 'Overview returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSaasOverview(): Promise<any> {
    try {
      return await this.analyticsService.getSaasOverview();
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getSaasOverview] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch SaaS overview');
    }
  }

  @Get()
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'List dashboards for current tenant' })
  @ApiResponse({ status: 200, description: 'Dashboards returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Tenant() tenantId: string) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }
      return await this.dashboardService.findAll(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findAll] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list dashboards');
    }
  }

  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Get dashboard by id for current tenant' })
  @ApiResponse({ status: 200, description: 'Dashboard returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findOne(@Param() params: DashboardIdParamDto, @Tenant() tenantId: string) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      return await this.dashboardService.findOne(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[findOne] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch dashboard');
    }
  }

  @Post()
  @UseGuards(WorkspaceGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create dashboard for current tenant' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Body() createDashboardDto: CreateDashboardDto,
    @Tenant() tenantId: string,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }
      return await this.dashboardService.create(createDashboardDto, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[create] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create dashboard');
    }
  }

  @Put(':id')
  @UseGuards(WorkspaceGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update dashboard for current tenant' })
  @ApiResponse({ status: 200, description: 'Dashboard updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  update(
    @Param() params: DashboardIdParamDto,
    @Body() updateDashboardDto: UpdateDashboardDto,
    @Tenant() tenantId: string,
  ) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }
      return this.dashboardService.update(params.id, updateDashboardDto, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[update] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update dashboard');
    }
  }

  @Delete(':id')
  @UseGuards(WorkspaceGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete dashboard for current tenant' })
  @ApiResponse({ status: 200, description: 'Dashboard deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async remove(@Param() params: DashboardIdParamDto, @Tenant() tenantId: string) {
    try {
      if (!tenantId) {
        throw new BadRequestException('Tenant ID is required');
      }
      return await this.dashboardService.remove(params.id, tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[remove] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete dashboard');
    }
  }
}
