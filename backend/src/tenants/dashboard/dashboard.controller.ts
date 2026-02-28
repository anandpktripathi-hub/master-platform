import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { Tenant } from '../../decorators/tenant.decorator';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class DashboardQueryDto {}
@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@Controller('tenant/dashboard')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TenantGuard)
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant dashboard summary' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDashboard(
    @Req() req: RequestWithUser,
    @Query() query: DashboardQueryDto,
    @Tenant() tenantIdFromDecorator: string,
  ) {
    try {
      void query;
      const user = req.user as any;
      const userId = user?.id ?? user?._id ?? user?.userId ?? user?.sub;
      const tenantId = tenantIdFromDecorator || user?.tenantId;

      return await this.dashboardService.getDashboardForTenant(String(tenantId), {
        id: userId ? String(userId) : undefined,
        role: user?.role,
        roles: user?.roles,
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getDashboard] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
