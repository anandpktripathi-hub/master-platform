import {
  BadRequestException,
  Body,
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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateProjectDto,
  CreateTaskDto,
  LogTimeDto,
  UpdateProjectDto,
  UpdateTaskDto,
} from './dto/projects.dto';
import {
  ProjectIdParamDto,
  ProjectIdRouteParamDto,
  TaskIdParamDto,
} from './dto/projects-params.dto';

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
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

  private requireTenantId(tenantId?: string): string {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found');
    }
    return String(tenantId);
  }

  // Summary KPIs
  @Get('summary')
  @ApiOperation({ summary: 'Get project summary KPIs (tenant)' })
  @ApiResponse({ status: 200, description: 'Summary returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSummary(@Tenant() tenantId: string) {
    try {
      return await this.projectsService.getSummary(this.requireTenantId(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getSummary] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get project summary');
    }
  }

  // Projects
  @Get()
  @ApiOperation({ summary: 'List projects (tenant)' })
  @ApiResponse({ status: 200, description: 'Projects returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listProjects(@Tenant() tenantId: string) {
    try {
      return await this.projectsService.listProjects(this.requireTenantId(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listProjects] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list projects');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by id (tenant)' })
  @ApiResponse({ status: 200, description: 'Project returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getProjectById(@Tenant() tenantId: string, @Param() params: ProjectIdParamDto) {
    try {
      return await this.projectsService.getProjectById(
        this.requireTenantId(tenantId),
        params.id,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getProjectById] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to get project');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create project (tenant)' })
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createProject(@Tenant() tenantId: string, @Body() body: CreateProjectDto) {
    try {
      return await this.projectsService.createProject(
        this.requireTenantId(tenantId),
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[createProject] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create project');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project (tenant)' })
  @ApiResponse({ status: 200, description: 'Project updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  updateProject(
    @Tenant() tenantId: string,
    @Param() params: ProjectIdParamDto,
    @Body() body: UpdateProjectDto,
  ) {
    try {
      return this.projectsService.updateProject(
        this.requireTenantId(tenantId),
        params.id,
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[updateProject] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update project');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project (tenant)' })
  @ApiResponse({ status: 200, description: 'Project deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteProject(@Tenant() tenantId: string, @Param() params: ProjectIdParamDto) {
    try {
      return await this.projectsService.deleteProject(
        this.requireTenantId(tenantId),
        params.id,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[deleteProject] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete project');
    }
  }

  // Tasks
  @Get(':projectId/tasks')
  @ApiOperation({ summary: 'List tasks for a project (tenant)' })
  @ApiResponse({ status: 200, description: 'Tasks returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTasks(
    @Tenant() tenantId: string,
    @Param() params: ProjectIdRouteParamDto,
  ) {
    try {
      return await this.projectsService.listTasks(
        this.requireTenantId(tenantId),
        params.projectId,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listTasks] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list tasks');
    }
  }

  @Post(':projectId/tasks')
  @ApiOperation({ summary: 'Create task for a project (tenant)' })
  @ApiResponse({ status: 201, description: 'Task created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  createTask(
    @Tenant() tenantId: string,
    @Param() params: ProjectIdRouteParamDto,
    @Body() body: CreateTaskDto,
  ) {
    try {
      return this.projectsService.createTask(
        this.requireTenantId(tenantId),
        params.projectId,
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createTask] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create task');
    }
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task (tenant)' })
  @ApiResponse({ status: 200, description: 'Task updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  updateTask(
    @Tenant() tenantId: string,
    @Param() params: TaskIdParamDto,
    @Body() body: UpdateTaskDto,
  ) {
    try {
      return this.projectsService.updateTask(
        this.requireTenantId(tenantId),
        params.id,
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateTask] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update task');
    }
  }

  // Timesheets
  @Get('timesheets')
  @ApiOperation({ summary: 'List timesheets (tenant)' })
  @ApiResponse({ status: 200, description: 'Timesheets returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTimesheets(@Tenant() tenantId: string) {
    try {
      return await this.projectsService.listTimesheets(
        this.requireTenantId(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[listTimesheets] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list timesheets');
    }
  }

  @Post('timesheets/log')
  @ApiOperation({ summary: 'Log time entry (tenant)' })
  @ApiResponse({ status: 201, description: 'Time logged' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async logTime(
    @Tenant() tenantId: string,
    @Req() req: AuthRequest,
    @Body() body: LogTimeDto,
  ) {
    try {
      const userId = req.user?.sub || req.user?._id;
      if (!userId) {
        throw new BadRequestException('User ID not found');
      }
      return await this.projectsService.logTime(this.requireTenantId(tenantId), {
        ...body,
        userId: String(userId),
      });
    } catch (error) {
      const err = error as any;
      this.logger.error(`[logTime] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to log time');
    }
  }
}
