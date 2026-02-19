import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

interface AuthRequest extends Request {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
}

@Controller('crm')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('contacts')
  @Permissions(Permission.CRM_READ)
  async getContacts(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    return this.crmService.listContacts(tenantId);
  }

  @Post('contacts')
  @Permissions(Permission.CRM_WRITE)
  async createContact(@Req() req: AuthRequest, @Body() body: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    return this.crmService.createContact(tenantId, body);
  }

  @Get('companies')
  @Permissions(Permission.CRM_READ)
  async getCompanies(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    return this.crmService.listCompanies(tenantId);
  }

  @Post('companies')
  @Permissions(Permission.CRM_WRITE)
  async createCompany(@Req() req: AuthRequest, @Body() body: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    return this.crmService.createCompany(tenantId, body);
  }

  @Get('deals')
  @Permissions(Permission.CRM_READ)
  async getDeals(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    return this.crmService.listDeals(tenantId);
  }

  @Post('deals')
  @Permissions(Permission.CRM_WRITE)
  async createDeal(@Req() req: AuthRequest, @Body() body: any) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    const userId = req.user?.sub || req.user?._id;
    return this.crmService.createDeal(tenantId, { ...body, ownerId: userId });
  }

  @Patch('deals/:id/stage')
  @Permissions(Permission.CRM_WRITE)
  async updateDealStage(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { stage?: 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST' },
  ) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    if (!body.stage) throw new Error('stage is required');
    return this.crmService.updateDealStage(tenantId, id, body.stage);
  }

  @Get('tasks/my')
  @Permissions(Permission.CRM_READ)
  async getMyTasks(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) throw new Error('Tenant or user ID not found');
    return this.crmService.listMyTasks(tenantId, String(userId));
  }

  @Post('tasks')
  @Permissions(Permission.CRM_WRITE)
  async createTask(@Req() req: AuthRequest, @Body() body: any) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) throw new Error('Tenant or user ID not found');
    return this.crmService.createTask(tenantId, {
      ...body,
      assigneeId: body.assigneeId || String(userId),
    });
  }

  @Patch('tasks/:id/completed')
  @Permissions(Permission.CRM_WRITE)
  async setTaskCompleted(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { completed?: boolean },
  ) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) throw new Error('Tenant or user ID not found');
    if (typeof body.completed !== 'boolean')
      throw new Error('completed is required');
    return this.crmService.setTaskCompleted(
      tenantId,
      String(userId),
      id,
      body.completed,
    );
  }

  @Patch('tasks/:id/delete')
  @Permissions(Permission.CRM_WRITE)
  async deleteTask(@Req() req: AuthRequest, @Param('id') id: string) {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId) throw new Error('Tenant or user ID not found');
    return this.crmService.deleteTask(tenantId, String(userId), id);
  }

  @Get('analytics')
  @Permissions(Permission.CRM_READ)
  async getAnalytics(@Req() req: AuthRequest) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new Error('Tenant ID not found');
    return this.crmService.getAnalytics(tenantId);
  }
}
