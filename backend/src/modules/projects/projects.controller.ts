import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import type { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateProjectDto,
  CreateTaskDto,
  LogTimeDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/projects.dto';

interface AuthRequest extends Request {
  user?: { _id?: string; sub?: string };
}
@ApiTags('Projects')
@ApiBearerAuth('bearer')
@Controller('projects')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TenantGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private requireTenantId(tenantId?: string): string {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return String(tenantId);
  }

  // Summary KPIs
  @Get('summary')
  getSummary(@Tenant() tenantId: string) {
    return this.projectsService.getSummary(this.requireTenantId(tenantId));
  }

  // Projects
  @Get()
  listProjects(@Tenant() tenantId: string) {
    return this.projectsService.listProjects(this.requireTenantId(tenantId));
  }

  @Get(':id')
  getProjectById(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.projectsService.getProjectById(this.requireTenantId(tenantId), id);
  }

  @Post()
  createProject(@Tenant() tenantId: string, @Body() body: CreateProjectDto) {
    return this.projectsService.createProject(this.requireTenantId(tenantId), body);
  }

  @Patch(':id')
  updateProject(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(
      this.requireTenantId(tenantId),
      id,
      body,
    );
  }

  @Delete(':id')
  deleteProject(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.projectsService.deleteProject(this.requireTenantId(tenantId), id);
  }

  // Tasks
  @Get(':projectId/tasks')
  listTasks(@Tenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.projectsService.listTasks(
      this.requireTenantId(tenantId),
      projectId,
    );
  }

  @Post(':projectId/tasks')
  createTask(
    @Tenant() tenantId: string,
    @Param('projectId') projectId: string,
    @Body() body: CreateTaskDto,
  ) {
    return this.projectsService.createTask(
      this.requireTenantId(tenantId),
      projectId,
      body,
    );
  }

  @Patch('tasks/:id')
  updateTask(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.projectsService.updateTask(this.requireTenantId(tenantId), id, body);
  }

  // Timesheets
  @Get('timesheets')
  listTimesheets(@Tenant() tenantId: string) {
    return this.projectsService.listTimesheets(this.requireTenantId(tenantId));
  }

  @Post('timesheets/log')
  logTime(
    @Tenant() tenantId: string,
    @Req() req: AuthRequest,
    @Body() body: LogTimeDto,
  ) {
    const userId = req.user?.sub || req.user?._id;
    if (!userId) {
      throw new BadRequestException('User ID not found');
    }
    return this.projectsService.logTime(this.requireTenantId(tenantId), {
      ...body,
      userId: String(userId),
    });
  }
}
