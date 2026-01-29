import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Dashboard,
  DashboardSchema,
} from '../../database/schemas/dashboard.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../../guards/roles.guard';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dashboard.name, schema: DashboardSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    AnalyticsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, RolesGuard, AuditLogService],
})
export class DashboardModule {}
