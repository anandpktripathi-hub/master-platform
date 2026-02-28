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
  Query,
  UseGuards,
} from '@nestjs/common';
import { HrmService } from './hrm.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TenantGuard } from '../../common/guards/tenant.guard';
import {
  CreateEmployeeDto,
  CreateJobPostingDto,
  CreateLeaveRequestDto,
  CreateTrainingSessionDto,
  ListAttendanceQueryDto,
  RecordAttendanceDto,
  UpdateLeaveStatusDto,
  UpdateEmployeeDto,
} from './dto/hrm.dto';
import { HrmIdParamDto } from './dto/hrm-id-param.dto';
@ApiTags('Hrm')
@ApiBearerAuth('bearer')
@Controller('hrm')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TenantGuard, RolesGuard)
@Roles(
  'tenant_admin',
  'staff',
  'admin',
  'owner',
  'platform_admin',
  'PLATFORM_SUPER_ADMIN',
)
export class HrmController {
  private readonly logger = new Logger(HrmController.name);

  constructor(private readonly hrmService: HrmService) {}

  private requireTenantId(tenantId?: string): string {
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim().length === 0) {
      throw new BadRequestException('tenantId is required');
    }
    return tenantId;
  }

  // Summary KPIs
  @Get('summary')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get HRM summary KPIs (tenant)' })
  @ApiResponse({ status: 200, description: 'Summary returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getSummary(@Tenant() tenantId: string) {
    try {
      // TODO(v1-later): Expose HR dashboards once Basic HR v1 is shipped.
      return await this.hrmService.getSummary(this.requireTenantId(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getSummary] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch HRM summary');
    }
  }

  // Attendance overview for dashboards
  @Get('attendance/overview')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Get HRM attendance overview (tenant)' })
  @ApiResponse({ status: 200, description: 'Overview returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAttendanceOverview(@Tenant() tenantId: string) {
    try {
      // TODO(v1-later): Expose HR dashboards once Basic HR v1 is shipped.
      return await this.hrmService.getAttendanceOverview(
        this.requireTenantId(tenantId),
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(
        `[getAttendanceOverview] ${err?.message ?? String(err)}`,
        err?.stack,
      );
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch attendance overview');
    }
  }

  // Employees
  @Get('employees')
  @ApiOperation({ summary: 'List employees (tenant)' })
  @ApiResponse({ status: 200, description: 'Employees returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listEmployees(@Tenant() tenantId: string) {
    try {
      return await this.hrmService.listEmployees(this.requireTenantId(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listEmployees] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list employees');
    }
  }

  @Get('employees/:id')
  @ApiOperation({ summary: 'Get employee by id (tenant)' })
  @ApiResponse({ status: 200, description: 'Employee returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getEmployeeById(@Tenant() tenantId: string, @Param() params: HrmIdParamDto) {
    try {
      return await this.hrmService.getEmployeeById(
        this.requireTenantId(tenantId),
        params.id,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[getEmployeeById] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to fetch employee');
    }
  }

  @Post('employees')
  @ApiOperation({ summary: 'Create employee (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createEmployee(@Tenant() tenantId: string, @Body() body: CreateEmployeeDto) {
    try {
      return await this.hrmService.createEmployee(this.requireTenantId(tenantId), body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createEmployee] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create employee');
    }
  }

  @Patch('employees/:id')
  @ApiOperation({ summary: 'Update employee (tenant)' })
  @ApiResponse({ status: 200, description: 'Employee updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async updateEmployee(
    @Tenant() tenantId: string,
    @Param() params: HrmIdParamDto,
    @Body() body: UpdateEmployeeDto,
  ) {
    try {
      return await this.hrmService.updateEmployee(
        this.requireTenantId(tenantId),
        params.id,
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateEmployee] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update employee');
    }
  }

  @Delete('employees/:id')
  @ApiOperation({ summary: 'Delete employee (tenant)' })
  @ApiResponse({ status: 200, description: 'Employee deleted' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async deleteEmployee(@Tenant() tenantId: string, @Param() params: HrmIdParamDto) {
    try {
      return await this.hrmService.deleteEmployee(this.requireTenantId(tenantId), params.id);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[deleteEmployee] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to delete employee');
    }
  }

  // Attendance
  @Get('attendance')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'List attendance (tenant)' })
  @ApiResponse({ status: 200, description: 'Attendance returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listAttendance(
    @Tenant() tenantId: string,
    @Query() query: ListAttendanceQueryDto,
  ) {
    try {
      // TODO(v1-later): Attendance management (v1.1+).
      return await this.hrmService.listAttendance(
        this.requireTenantId(tenantId),
        query.date,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listAttendance] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list attendance');
    }
  }

  @Post('attendance')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Record attendance (tenant)' })
  @ApiResponse({ status: 200, description: 'Attendance recorded' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async recordAttendance(
    @Tenant() tenantId: string,
    @Body() body: RecordAttendanceDto,
  ) {
    try {
      // TODO(v1-later): Attendance management (v1.1+).
      return await this.hrmService.recordAttendance(
        this.requireTenantId(tenantId),
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[recordAttendance] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to record attendance');
    }
  }

  // Leave requests
  @Get('leaves')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'List leave requests (tenant)' })
  @ApiResponse({ status: 200, description: 'Leave requests returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listLeaves(@Tenant() tenantId: string) {
    try {
      // TODO(v1-later): Leave management (v1.1+).
      return await this.hrmService.listLeaveRequests(this.requireTenantId(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listLeaves] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list leave requests');
    }
  }

  @Post('leaves')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Create leave request (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  createLeave(
    @Tenant() tenantId: string,
    @Body() body: CreateLeaveRequestDto,
  ) {
    try {
      // TODO(v1-later): Leave management (v1.1+).
      return this.hrmService.createLeaveRequest(
        this.requireTenantId(tenantId),
        body,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createLeave] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create leave request');
    }
  }

  @Patch('leaves/:id/status')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Update leave request status (tenant)' })
  @ApiResponse({ status: 200, description: 'Leave status updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  updateLeaveStatus(
    @Tenant() tenantId: string,
    @Param() params: HrmIdParamDto,
    @Body() body: UpdateLeaveStatusDto,
  ) {
    try {
      // TODO(v1-later): Leave management (v1.1+).
      return this.hrmService.updateLeaveStatus(
        this.requireTenantId(tenantId),
        params.id,
        body.status,
      );
    } catch (error) {
      const err = error as any;
      this.logger.error(`[updateLeaveStatus] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to update leave status');
    }
  }

  // Jobs
  @Get('jobs')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'List job postings (tenant)' })
  @ApiResponse({ status: 200, description: 'Job postings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listJobs(@Tenant() tenantId: string) {
    try {
      // TODO(v1-later): Recruiting/job postings (v1.1+).
      return await this.hrmService.listJobPostings(this.requireTenantId(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listJobs] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list jobs');
    }
  }

  @Post('jobs')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Create job posting (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createJob(@Tenant() tenantId: string, @Body() body: CreateJobPostingDto) {
    try {
      // TODO(v1-later): Recruiting/job postings (v1.1+).
      return await this.hrmService.createJobPosting(this.requireTenantId(tenantId), body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createJob] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create job');
    }
  }

  // Trainings
  @Get('trainings')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'List training sessions (tenant)' })
  @ApiResponse({ status: 200, description: 'Trainings returned' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async listTrainings(@Tenant() tenantId: string) {
    try {
      // TODO(v1-later): Training sessions (v1.1+).
      return await this.hrmService.listTrainingSessions(this.requireTenantId(tenantId));
    } catch (error) {
      const err = error as any;
      this.logger.error(`[listTrainings] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to list trainings');
    }
  }

  @Post('trainings')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Create training session (tenant)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  createTraining(
    @Tenant() tenantId: string,
    @Body() body: CreateTrainingSessionDto,
  ) {
    try {
      // TODO(v1-later): Training sessions (v1.1+).
      return this.hrmService.createTrainingSession(this.requireTenantId(tenantId), body);
    } catch (error) {
      const err = error as any;
      this.logger.error(`[createTraining] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('Failed to create training');
    }
  }
}
