import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeatureRegistryService } from './featureRegistry.service';
import { FeatureRegistryController } from './featureRegistry.controller';
import { FeatureAccessService } from './featureAccess.service';
import { AuditLogController } from './auditLog.controller';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLog, AuditLogSchema } from '../database/schemas/audit-log.schema';
import { WorkspaceSharedModule } from '../workspaces/workspace-shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    WorkspaceSharedModule,
  ],
  providers: [FeatureRegistryService, FeatureAccessService, AuditLogService],
  controllers: [FeatureRegistryController, AuditLogController],
  exports: [FeatureRegistryService, FeatureAccessService],
})
export class FeatureRegistryModule {}
