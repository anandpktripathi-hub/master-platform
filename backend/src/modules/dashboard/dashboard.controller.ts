import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  Query,
  Res,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Dashboard } from '../../database/schemas/dashboard.schema';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { AuditLogService } from '../../services/audit-log.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { Response } from 'express';
import { CreateDashboardDto, UpdateDashboardDto } from './dto/dashboard.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@Controller('dashboards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
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
  async getAuditLogs(
    @Tenant() tenantId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('sortBy') sortBy?: string,
    @Query('action') action?: string,
    @Query('actionPrefix') actionPrefix?: string,
    @Query('resourceType') resourceType?: string,
    @Query('resourceId') resourceId?: string,
    @Query('status') status?: 'success' | 'failure' | 'pending',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const parsedSkip = skip ? parseInt(skip, 10) : undefined;

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    return this.auditLogService.getTenantLogs(tenantId, {
      limit: parsedLimit,
      skip: parsedSkip,
      sortBy: sortBy || '-createdAt',
      action,
      actionPrefix,
      resourceType,
      resourceId,
      status,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });
  }

  /**
   * Export audit logs for the current tenant as CSV, using the same filters
   * as the standard audit logs endpoint.
   */
  @Get('audit/logs/export')
  @UseGuards(WorkspaceGuard)
  async exportAuditLogs(
    @Tenant() tenantId: string,
    @Query('sortBy') sortBy: string | undefined,
    @Query('action') action: string | undefined,
    @Query('actionPrefix') actionPrefix: string | undefined,
    @Query('resourceType') resourceType: string | undefined,
    @Query('resourceId') resourceId: string | undefined,
    @Query('status') status: 'success' | 'failure' | 'pending' | undefined,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Res() res: Response,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    const logs = await this.auditLogService.getTenantLogsForExport(tenantId, {
      sortBy: sortBy || '-createdAt',
      action,
      actionPrefix,
      resourceType,
      resourceId,
      status,
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
  }

  /**
   * SaaS super-admin overview dashboard.
   * Wrapper around AnalyticsService.getSaasOverview exposed under
   * /dashboards/admin/saas-overview for frontend dashboards.
   */
  @Get('admin/saas-overview')
  @Roles('PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPERADMIN')
  async getSaasOverview(): Promise<any> {
    return this.analyticsService.getSaasOverview();
  }

  @Get()
  @UseGuards(WorkspaceGuard)
  findAll(@Tenant() tenantId: string) {
    return this.dashboardService.findAll(tenantId);
  }

  @Get(':id')
  @UseGuards(WorkspaceGuard)
  findOne(@Param('id') id: string, @Tenant() tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.dashboardService.findOne(id, tenantId);
  }

  @Post()
  @UseGuards(WorkspaceGuard)
  @Roles('admin')
  create(@Body() createDashboardDto: CreateDashboardDto, @Tenant() tenantId: string) {
    return this.dashboardService.create(createDashboardDto, tenantId);
  }

  @Put(':id')
  @UseGuards(WorkspaceGuard)
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateDashboardDto: UpdateDashboardDto,
    @Tenant() tenantId: string,
  ) {
    return this.dashboardService.update(id, updateDashboardDto, tenantId);
  }

  @Delete(':id')
  @UseGuards(WorkspaceGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Tenant() tenantId: string) {
    return this.dashboardService.remove(id, tenantId);
  }
}
