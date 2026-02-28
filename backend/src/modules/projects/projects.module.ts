import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from '../../database/schemas/project.schema';
import { Task, TaskSchema } from '../../database/schemas/task.schema';
import {
  TimesheetEntry,
  TimesheetEntrySchema,
} from '../../database/schemas/timesheet.schema';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { RolesGuard } from '../../guards/roles.guard';
import { WorkspaceSharedModule } from '../../workspaces/workspace-shared.module';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: TimesheetEntry.name, schema: TimesheetEntrySchema },
    ]),
    WorkspaceSharedModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, RolesGuard, TenantGuard],
})
export class ProjectsModule {}
