import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Tenant } from '../decorators/tenant.decorator';
import { AuditLogService } from '../services/audit-log.service';
import { GetAuditLogsQueryDto } from './dto/get-audit-logs.query.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-log')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs for the current tenant' })
  async getAll(@Tenant() tenantId: string, @Query() query: GetAuditLogsQueryDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant context missing');
    }

    try {
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
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to fetch audit logs');
    }
  }
}
