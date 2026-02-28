import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  Logger,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateCrmCompanyDto,
  CreateCrmContactDto,
  CreateCrmDealDto,
  CreateCrmTaskDto,
  SetCrmTaskCompletedDto,
  UpdateCrmDealStageDto,
} from './dto/crm.dto';
import { CrmIdParamDto } from './dto/crm-id-param.dto';

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
  private readonly logger = new Logger(CrmController.name);

  constructor(private readonly crmService: CrmService) {}

  @Get('contacts')
  @Permissions(Permission.CRM_READ)
  async getContacts(@Tenant() tenantId: string) {
  @ApiOperation({ summary: 'List CRM contacts (tenant)' })
  @ApiResponse({ status: 200, description: 'Contacts returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.listContacts(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getContacts] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list contacts');
    }
  }

  @Get('contacts/:id')
  @Permissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'Get CRM contact by id (tenant)' })
  @ApiResponse({ status: 200, description: 'Contact returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getContactById(@Tenant() tenantId: string, @Param() params: CrmIdParamDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.getContactById(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getContactById] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch contact');
    }
  }

  @Post('contacts')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Create CRM contact (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createContact(
    @Tenant() tenantId: string,
    @Body() body: CreateCrmContactDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.createContact(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createContact] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create contact');
    }
  }

  @Patch('contacts/:id')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Update CRM contact (tenant)' })
  @ApiResponse({ status: 200, description: 'Contact updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateContact(
    @Tenant() tenantId: string,
    @Param() params: CrmIdParamDto,
    @Body() body: Record<string, unknown>,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.updateContact(tenantId, params.id, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateContact] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update contact');
    }
  }

  @Delete('contacts/:id')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Delete CRM contact (tenant)' })
  @ApiResponse({ status: 200, description: 'Contact deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteContact(@Tenant() tenantId: string, @Param() params: CrmIdParamDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.deleteContact(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteContact] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete contact');
    }
  }

  @Get('companies')
  @Permissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'List CRM companies (tenant)' })
  @ApiResponse({ status: 200, description: 'Companies returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getCompanies(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.listCompanies(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getCompanies] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list companies');
    }
  }

  @Post('companies')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Create CRM company (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCompany(
    @Tenant() tenantId: string,
    @Body() body: CreateCrmCompanyDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.createCompany(tenantId, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createCompany] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create company');
    }
  }

  @Get('deals')
  @Permissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'List CRM deals (tenant)' })
  @ApiResponse({ status: 200, description: 'Deals returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDeals(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.listDeals(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getDeals] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list deals');
    }
  }

  @Get('deals/:id')
  @Permissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'Get CRM deal by id (tenant)' })
  @ApiResponse({ status: 200, description: 'Deal returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getDealById(@Tenant() tenantId: string, @Param() params: CrmIdParamDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.getDealById(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getDealById] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch deal');
    }
  }

  @Post('deals')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Create CRM deal (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createDeal(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Body() body: CreateCrmDealDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      const userId = req.user?.sub || req.user?._id;
      if (!userId) throw new BadRequestException('User ID not found');
      return await this.crmService.createDeal(tenantId, { ...body, ownerId: userId });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createDeal] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create deal');
    }
  }

  @Patch('deals/:id')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Update CRM deal (tenant)' })
  @ApiResponse({ status: 200, description: 'Deal updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateDeal(
    @Tenant() tenantId: string,
    @Param() params: CrmIdParamDto,
    @Body() body: Record<string, unknown>,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.updateDeal(tenantId, params.id, body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateDeal] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update deal');
    }
  }

  @Delete('deals/:id')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Delete CRM deal (tenant)' })
  @ApiResponse({ status: 200, description: 'Deal deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteDeal(@Tenant() tenantId: string, @Param() params: CrmIdParamDto) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.deleteDeal(tenantId, params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteDeal] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete deal');
    }
  }

  @Patch('deals/:id/stage')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Update CRM deal stage (tenant)' })
  @ApiResponse({ status: 200, description: 'Deal stage updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateDealStage(
    @Tenant() tenantId: string,
    @Param() params: CrmIdParamDto,
    @Body() body: UpdateCrmDealStageDto,
  ) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.updateDealStage(tenantId, params.id, body.stage);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateDealStage] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update deal stage');
    }
  }

  @Get('tasks/my')
  @Permissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'List my CRM tasks (tenant)' })
  @ApiResponse({ status: 200, description: 'Tasks returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getMyTasks(@Req() req: AuthRequest, @Tenant() tenantId: string) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId)
        throw new BadRequestException('Tenant or user ID not found');
      return await this.crmService.listMyTasks(tenantId, String(userId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getMyTasks] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list tasks');
    }
  }

  @Post('tasks')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Create CRM task (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createTask(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Body() body: CreateCrmTaskDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId)
        throw new BadRequestException('Tenant or user ID not found');
      return await this.crmService.createTask(tenantId, {
        ...body,
        assigneeId: body.assigneeId || String(userId),
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createTask] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create task');
    }
  }

  @Patch('tasks/:id/completed')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Set CRM task completed (tenant)' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async setTaskCompleted(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Param() params: CrmIdParamDto,
    @Body() body: SetCrmTaskCompletedDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId)
        throw new BadRequestException('Tenant or user ID not found');
      return await this.crmService.setTaskCompleted(
        tenantId,
        String(userId),
        params.id,
        body.completed,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[setTaskCompleted] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update task');
    }
  }

  @Patch('tasks/:id/delete')
  @Permissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Delete CRM task (tenant)' })
  @ApiResponse({ status: 200, description: 'Task deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteTask(
    @Req() req: AuthRequest,
    @Tenant() tenantId: string,
    @Param() params: CrmIdParamDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!tenantId || !userId)
        throw new BadRequestException('Tenant or user ID not found');
      return await this.crmService.deleteTask(tenantId, String(userId), params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteTask] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete task');
    }
  }

  @Get('analytics')
  @Permissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'Get CRM analytics (tenant)' })
  @ApiResponse({ status: 200, description: 'Analytics returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAnalytics(@Tenant() tenantId: string) {
    try {
      if (!tenantId) throw new BadRequestException('Tenant ID not found');
      return await this.crmService.getAnalytics(tenantId);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getAnalytics] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch CRM analytics');
    }
  }
}
