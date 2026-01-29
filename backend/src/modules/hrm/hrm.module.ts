import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from '../../database/schemas/employee.schema';
import { Attendance, AttendanceSchema } from '../../database/schemas/attendance.schema';
import { LeaveRequest, LeaveRequestSchema } from '../../database/schemas/leave-request.schema';
import { JobPosting, JobPostingSchema } from '../../database/schemas/job-posting.schema';
import { TrainingSession, TrainingSessionSchema } from '../../database/schemas/training-session.schema';
import { HrmController } from './hrm.controller';
import { HrmService } from './hrm.service';
import { RolesGuard } from '../../guards/roles.guard';
import { WorkspaceModule } from '../../workspaces/workspace.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Attendance.name, schema: AttendanceSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: JobPosting.name, schema: JobPostingSchema },
      { name: TrainingSession.name, schema: TrainingSessionSchema },
    ]),
    WorkspaceModule,
  ],
  controllers: [HrmController],
  providers: [HrmService, RolesGuard],
})
export class HrmModule {}
