import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { HrmService } from './hrm.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Tenant } from '../../decorators/tenant.decorator';
import { WorkspaceGuard } from '../../guards/workspace.guard';

@Controller('hrm')
@UseGuards(JwtAuthGuard, WorkspaceGuard, RolesGuard)
@Roles('tenant_admin', 'staff', 'admin', 'owner', 'platform_admin', 'PLATFORM_SUPER_ADMIN')
export class HrmController {
  constructor(private readonly hrmService: HrmService) {}

  // Summary KPIs
  @Get('summary')
  getSummary(@Tenant() tenantId: string) {
    return this.hrmService.getSummary(tenantId);
  }

  // Attendance overview for dashboards
  @Get('attendance/overview')
  getAttendanceOverview(@Tenant() tenantId: string) {
    return this.hrmService.getAttendanceOverview(tenantId);
  }

  // Employees
  @Get('employees')
  listEmployees(@Tenant() tenantId: string) {
    return this.hrmService.listEmployees(tenantId);
  }

  @Post('employees')
  createEmployee(@Tenant() tenantId: string, @Body() body: any) {
    return this.hrmService.createEmployee(tenantId, body);
  }

  // Attendance
  @Get('attendance')
  listAttendance(@Tenant() tenantId: string) {
    return this.hrmService.listAttendance(tenantId);
  }

  @Post('attendance')
  recordAttendance(@Tenant() tenantId: string, @Body() body: any) {
    return this.hrmService.recordAttendance(tenantId, body);
  }

  // Leave requests
  @Get('leaves')
  listLeaves(@Tenant() tenantId: string) {
    return this.hrmService.listLeaveRequests(tenantId);
  }

  @Post('leaves')
  createLeave(@Tenant() tenantId: string, @Body() body: any) {
    return this.hrmService.createLeaveRequest(tenantId, body);
  }

  @Patch('leaves/:id/status')
  updateLeaveStatus(
    @Tenant() tenantId: string,
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'approved' | 'rejected',
  ) {
    return this.hrmService.updateLeaveStatus(tenantId, id, status);
  }

  // Jobs
  @Get('jobs')
  listJobs(@Tenant() tenantId: string) {
    return this.hrmService.listJobPostings(tenantId);
  }

  @Post('jobs')
  createJob(@Tenant() tenantId: string, @Body() body: any) {
    return this.hrmService.createJobPosting(tenantId, body);
  }

  // Trainings
  @Get('trainings')
  listTrainings(@Tenant() tenantId: string) {
    return this.hrmService.listTrainingSessions(tenantId);
  }

  @Post('trainings')
  createTraining(@Tenant() tenantId: string, @Body() body: any) {
    return this.hrmService.createTrainingSession(tenantId, body);
  }
}
