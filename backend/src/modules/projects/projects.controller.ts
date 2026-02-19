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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';

interface AuthRequest extends Request {
  user?: { _id?: string; sub?: string };
}

@Controller('projects')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
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

  // Summary KPIs
  @Get('summary')
  getSummary(@Tenant() tenantId: string) {
    return this.projectsService.getSummary(tenantId);
  }

  // Projects
  @Get()
  listProjects(@Tenant() tenantId: string) {
    return this.projectsService.listProjects(tenantId);
  }

  @Post()
  createProject(@Tenant() tenantId: string, @Body() body: any) {
    return this.projectsService.createProject(tenantId, body);
  }

  @Patch(':id')
  updateProject(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.projectsService.updateProject(tenantId, id, body);
  }

  // Tasks
  @Get(':projectId/tasks')
  listTasks(@Tenant() tenantId: string, @Param('projectId') projectId: string) {
    return this.projectsService.listTasks(tenantId, projectId);
  }

  @Post(':projectId/tasks')
  createTask(
    @Tenant() tenantId: string,
    @Param('projectId') projectId: string,
    @Body() body: any,
  ) {
    return this.projectsService.createTask(tenantId, projectId, body);
  }

  @Patch('tasks/:id')
  updateTask(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.projectsService.updateTask(tenantId, id, body);
  }

  // Timesheets
  @Get('timesheets')
  listTimesheets(@Tenant() tenantId: string) {
    return this.projectsService.listTimesheets(tenantId);
  }

  @Post('timesheets/log')
  logTime(
    @Tenant() tenantId: string,
    @Req() req: AuthRequest,
    @Body() body: any,
  ) {
    const userId = req.user?.sub || (req.user as any)?._id;
    return this.projectsService.logTime(tenantId, {
      ...body,
      userId: String(userId),
    });
  }
}
