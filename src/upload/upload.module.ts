import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { TenantsModule } from '../modules/tenants/tenants.module';
import { TenantGuard } from '../common/guards/tenant.guard';

@Module({
  imports: [ConfigModule, TenantsModule],
  controllers: [UploadController],
  providers: [UploadService, TenantGuard],
  exports: [UploadService],
})
export class UploadModule {}
