import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  private readonly logger = new Logger(AuditLogController.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs for the current tenant' })
  @ApiResponse({ status: 200, description: 'Audit logs returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
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
      const error = err as any;
      this.logger.error(
        `[getAll] ${error?.message ?? String(error)}`,
        error?.stack,
      );
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to fetch audit logs');
    }
  }
}
