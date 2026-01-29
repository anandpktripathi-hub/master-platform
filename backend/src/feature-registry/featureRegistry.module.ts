import { Module } from '@nestjs/common';
import { FeatureRegistryService } from './featureRegistry.service';
import { FeatureRegistryController } from './featureRegistry.controller';
import { FeatureAccessService } from './featureAccess.service';
import { AuditLogController } from './auditLog.controller';

@Module({
  providers: [FeatureRegistryService, FeatureAccessService],
  controllers: [FeatureRegistryController, AuditLogController],
  exports: [FeatureRegistryService, FeatureAccessService],
})
export class FeatureRegistryModule {}
