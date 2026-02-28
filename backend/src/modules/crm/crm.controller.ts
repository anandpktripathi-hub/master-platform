import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateCrmCompanyDto,
  CreateCrmContactDto,
  CreateCrmDealDto,
  CreateCrmTaskDto,
  SetCrmTaskCompletedDto,
  UpdateCrmDealStageDto,
} from './dto/crm.dto';

type AuthRequest = Request & {
  user?: {
    sub?: string;
    _id?: string;
    tenantId?: string;
  };
};
@ApiTags('Crm')
@ApiBearerAuth('bearer')
@Controller('crm')
@UseGuards(
  JwtAuthGuard,
  WorkspaceGuard,
  TenantGuard,
  RolesGuard,
  PermissionsGuard,
)
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
  async getContacts(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.listContacts(tenantId);
  }

  @Get('contacts/:id')
  @Permissions(Permission.CRM_READ)
  async getContactById(@Tenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.getContactById(tenantId, id);
  }

  @Post('contacts')
  @Permissions(Permission.CRM_WRITE)
  async createContact(
    @Tenant() tenantId: string,
    @Body() body: CreateCrmContactDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.createContact(tenantId, body);
  }

  @Patch('contacts/:id')
  @Permissions(Permission.CRM_WRITE)
  async updateContact(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.updateContact(tenantId, id, body);
  }

  @Delete('contacts/:id')
  @Permissions(Permission.CRM_WRITE)
  async deleteContact(@Tenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.deleteContact(tenantId, id);
  }

  @Get('companies')
  @Permissions(Permission.CRM_READ)
  async getCompanies(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.listCompanies(tenantId);
  }

  @Post('companies')
  @Permissions(Permission.CRM_WRITE)
  async createCompany(
    @Tenant() tenantId: string,
    @Body() body: CreateCrmCompanyDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.createCompany(tenantId, body);
  }

  @Get('deals')
  @Permissions(Permission.CRM_READ)
  async getDeals(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.listDeals(tenantId);
  }

  @Get('deals/:id')
  @Permissions(Permission.CRM_READ)
  async getDealById(@Tenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.getDealById(tenantId, id);
  }

  @Post('deals')
  @Permissions(Permission.CRM_WRITE)
  async createDeal(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Body() body: CreateCrmDealDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    const userId = req.user?.sub || req.user?._id;
    if (!userId) throw new BadRequestException('User ID not found');
    return this.crmService.createDeal(tenantId, { ...body, ownerId: userId });
  }

  @Patch('deals/:id')
  @Permissions(Permission.CRM_WRITE)
  async updateDeal(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.updateDeal(tenantId, id, body);
  }

  @Delete('deals/:id')
  @Permissions(Permission.CRM_WRITE)
  async deleteDeal(@Tenant() tenantId: string, @Param('id') id: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.deleteDeal(tenantId, id);
  }

  @Patch('deals/:id/stage')
  @Permissions(Permission.CRM_WRITE)
  async updateDealStage(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateCrmDealStageDto,
  ) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.updateDealStage(tenantId, id, body.stage);
  }

  @Get('tasks/my')
  @Permissions(Permission.CRM_READ)
  async getMyTasks(@Req() req: AuthRequest, @Tenant() tenantId: string) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId)
      throw new BadRequestException('Tenant or user ID not found');
    return this.crmService.listMyTasks(tenantId, String(userId));
  }

  @Post('tasks')
  @Permissions(Permission.CRM_WRITE)
  async createTask(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Body() body: CreateCrmTaskDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId)
      throw new BadRequestException('Tenant or user ID not found');
    return this.crmService.createTask(tenantId, {
      ...body,
      assigneeId: body.assigneeId || String(userId),
    });
  }

  @Patch('tasks/:id/completed')
  @Permissions(Permission.CRM_WRITE)
  async setTaskCompleted(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: SetCrmTaskCompletedDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId)
      throw new BadRequestException('Tenant or user ID not found');
    return this.crmService.setTaskCompleted(
      tenantId,
      String(userId),
      id,
      body.completed,
    );
  }

  @Patch('tasks/:id/delete')
  @Permissions(Permission.CRM_WRITE)
  async deleteTask(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Param('id') id: string,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!tenantId || !userId)
      throw new BadRequestException('Tenant or user ID not found');
    return this.crmService.deleteTask(tenantId, String(userId), id);
  }

  @Get('analytics')
  @Permissions(Permission.CRM_READ)
  async getAnalytics(@Tenant() tenantId: string) {
    if (!tenantId) throw new BadRequestException('Tenant ID not found');
    return this.crmService.getAnalytics(tenantId);
  }
}
