import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
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
  getSummary(@Tenant() tenantId: string) {
    // TODO(v1-later): Expose HR dashboards once Basic HR v1 is shipped.
    return this.hrmService.getSummary(this.requireTenantId(tenantId));
  }

  // Attendance overview for dashboards
  @Get('attendance/overview')
  @ApiExcludeEndpoint()
  getAttendanceOverview(@Tenant() tenantId: string) {
    // TODO(v1-later): Expose HR dashboards once Basic HR v1 is shipped.
    return this.hrmService.getAttendanceOverview(this.requireTenantId(tenantId));
  }

  // Employees
  @Get('employees')
  listEmployees(@Tenant() tenantId: string) {
    return this.hrmService.listEmployees(this.requireTenantId(tenantId));
  }

  @Get('employees/:id')
  getEmployeeById(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.hrmService.getEmployeeById(this.requireTenantId(tenantId), id);
  }

  @Post('employees')
  createEmployee(@Tenant() tenantId: string, @Body() body: CreateEmployeeDto) {
    return this.hrmService.createEmployee(this.requireTenantId(tenantId), body);
  }

  @Patch('employees/:id')
  updateEmployee(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateEmployeeDto,
  ) {
    return this.hrmService.updateEmployee(this.requireTenantId(tenantId), id, body);
  }

  @Delete('employees/:id')
  deleteEmployee(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.hrmService.deleteEmployee(this.requireTenantId(tenantId), id);
  }

  // Attendance
  @Get('attendance')
  @ApiExcludeEndpoint()
  listAttendance(
    @Tenant() tenantId: string,
    @Query() query: ListAttendanceQueryDto,
  ) {
    // TODO(v1-later): Attendance management (v1.1+).
    return this.hrmService.listAttendance(this.requireTenantId(tenantId), query.date);
  }

  @Post('attendance')
  @ApiExcludeEndpoint()
  recordAttendance(
    @Tenant() tenantId: string,
    @Body() body: RecordAttendanceDto,
  ) {
    // TODO(v1-later): Attendance management (v1.1+).
    return this.hrmService.recordAttendance(this.requireTenantId(tenantId), body);
  }

  // Leave requests
  @Get('leaves')
  @ApiExcludeEndpoint()
  listLeaves(@Tenant() tenantId: string) {
    // TODO(v1-later): Leave management (v1.1+).
    return this.hrmService.listLeaveRequests(this.requireTenantId(tenantId));
  }

  @Post('leaves')
  @ApiExcludeEndpoint()
  createLeave(
    @Tenant() tenantId: string,
    @Body() body: CreateLeaveRequestDto,
  ) {
    // TODO(v1-later): Leave management (v1.1+).
    return this.hrmService.createLeaveRequest(this.requireTenantId(tenantId), body);
  }

  @Patch('leaves/:id/status')
  @ApiExcludeEndpoint()
  updateLeaveStatus(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateLeaveStatusDto,
  ) {
    // TODO(v1-later): Leave management (v1.1+).
    return this.hrmService.updateLeaveStatus(
      this.requireTenantId(tenantId),
      id,
      body.status,
    );
  }

  // Jobs
  @Get('jobs')
  @ApiExcludeEndpoint()
  listJobs(@Tenant() tenantId: string) {
    // TODO(v1-later): Recruiting/job postings (v1.1+).
    return this.hrmService.listJobPostings(this.requireTenantId(tenantId));
  }

  @Post('jobs')
  @ApiExcludeEndpoint()
  createJob(@Tenant() tenantId: string, @Body() body: CreateJobPostingDto) {
    // TODO(v1-later): Recruiting/job postings (v1.1+).
    return this.hrmService.createJobPosting(this.requireTenantId(tenantId), body);
  }

  // Trainings
  @Get('trainings')
  @ApiExcludeEndpoint()
  listTrainings(@Tenant() tenantId: string) {
    // TODO(v1-later): Training sessions (v1.1+).
    return this.hrmService.listTrainingSessions(this.requireTenantId(tenantId));
  }

  @Post('trainings')
  @ApiExcludeEndpoint()
  createTraining(
    @Tenant() tenantId: string,
    @Body() body: CreateTrainingSessionDto,
  ) {
    // TODO(v1-later): Training sessions (v1.1+).
    return this.hrmService.createTrainingSession(this.requireTenantId(tenantId), body);
  }
}
